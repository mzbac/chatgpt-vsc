import * as core from "@actions/core";
import fs from "fs";
import { Octokit } from "@octokit/action";

type CodeFile = {
  name: string;
  content: string;
  lineChanges: { start: number; end: number }[];
};
type Suggestions = {
  [filename: string]: {
    [lineNumber: number]: {
      suggestion: string;
      reason: string;
    };
  };
};
const octokit = new Octokit();
const extensions = ["ts", "tsx"];
const excludedFiles = /^.+\.test\.ts$/;

async function run(): Promise<void> {
  const pullNumber = parseInt(process.env.PULL_NUMBER!);

  const [owner, repo] = process.env.GITHUB_REPOSITORY!.split("/");

  const files = await octokit.request(
    `GET /repos/${owner}/${repo}/pulls/${pullNumber}/files`
  );

  const filesToReview: CodeFile[] = [];
  const lineChangeMap: {
    [filename: string]: { start: number; end: number }[];
  } = {};
  const rawUrlMap: { [filename: string]: string } = {};

  for (const file of files.data) {
    const extension = file.filename.split(".").pop();

    if (
      extensions.includes(extension) &&
      file.status === "modified" &&
      !excludedFiles.test(file.filename)
    ) {
      console.log(file);
      const text = fs.readFileSync(file.filename, "utf-8");
      const changedLines = getChangedLineNumbers(file.patch);
      lineChangeMap[file.filename] = changedLines;
      rawUrlMap[file.filename] = file.raw_url;
      filesToReview.push({
        name: file.filename,
        content: text!,
        lineChanges: changedLines,
      });
    }
  }
  const url = process.env.GPT4_PROXY_URL!;
  const headers = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "Content-Type": "application/json",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "x-api-key": `${process.env.API_KEY}`,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(filesToReview),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    const suggestions: Suggestions = data;
    for (const [filename, suggestion] of Object.entries(suggestions)) {
      for (const [lineNumber, line] of Object.entries(suggestion)) {
        console.log(`processing suggestion ${filename}:${lineNumber}`);
        const multiLineSuggestion = lineNumber.split("-").length > 1;

        if (
          lineChangeMap[filename].some(
            ({ start, end }) =>
              (start <= Number(lineNumber) && Number(lineNumber) <= end) ||
              (multiLineSuggestion &&
                start <= Number(lineNumber.split("-")[0]) &&
                Number(lineNumber.split("-")[1]) <= end)
          )
        ) {
          const comment = `
### Line ${lineNumber}
## CodeGuard Suggestions
**Suggestion:** ${line.suggestion}
**Reason:** ${line.reason}\n
`;
          try {
            await octokit.request(
              "POST /repos/{owner}/{repo}/pulls/{pull_number}/comments",
              {
                owner,
                repo,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                pull_number: pullNumber,
                body: comment,
                path: filename,
                line: multiLineSuggestion
                  ? Number(lineNumber.split("-")[1])
                  : Number(lineNumber),
                // eslint-disable-next-line @typescript-eslint/naming-convention
                start_line: multiLineSuggestion
                  ? Number(lineNumber.split("-")[0])
                  : undefined,
                side: "RIGHT",
                // eslint-disable-next-line @typescript-eslint/naming-convention
                commit_id: extractCommitHash(rawUrlMap[filename])!,
              }
            );
          } catch (error) {
            core.error(JSON.stringify(error, null, 2));
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}

run();

function getChangedLineNumbers(
  filePatch: string
): { start: number; end: number }[] {
  const lines = filePatch.split("\n");
  const changedLineNumbers: { start: number; end: number }[] = [];
  for (const line of lines) {
    if (line.startsWith("@@")) {
      const match = line.match(/@@ \-(\d+),(\d+) \+(\d+),(\d+) @@/);
      if (match) {
        const [, oldStart, oldLength, newStart, newLength] = match;
        changedLineNumbers.push({
          start: +newStart,
          end: +newStart + +newLength - 1,
        });
      }
    }
  }
  return changedLineNumbers;
}

function extractCommitHash(url: string): string | null {
  const regex = /\/raw\/([a-z0-9]+)\//i;
  const result = url.match(regex);
  if (result) {
    return result[1];
  }
  return null;
}

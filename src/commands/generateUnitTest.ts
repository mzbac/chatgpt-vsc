import * as vscode from "vscode";
import { processSelectedText } from "../chatgpt";
import {
  showTemporaryStatusMessage,
  removeTextBeforeAndAfterFirstTripleBackticks,
  hideStatusMessage,
} from "../utils";

export const getGenerateUnitTest = (apiKey: string) => {
  return async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selectedText = editor.document.getText(editor.selection);
    if (!selectedText) {
      vscode.window.showInformationMessage(
        "Please select the code to generate unit tests for."
      );
      return;
    }

    showTemporaryStatusMessage("Calling ChatGPT API...", undefined, true);

    const unitTestPrompt = `Generate a unit test for the following code snippet and provide the test code snippet only, without any text, comments, or triple backticks:
    code: 
    """
    ${selectedText} 
    """`;

    const generatedTest = await processSelectedText(
      apiKey as string,
      unitTestPrompt,
      "You are an AI assistant specializing in software development. Your goal is to generate unit tests for the provided code snippets. Ensure that you provide the unit test code snippet only, without any explanations, comments, or triple backticks."
    );

    hideStatusMessage();

    if (generatedTest) {
      const testCode =
        removeTextBeforeAndAfterFirstTripleBackticks(generatedTest);

      const newFileOptions = ["Yes", "No"];
      const selectedOption = await vscode.window.showQuickPick(newFileOptions, {
        placeHolder:
          "Do you want to create a new file for the generated unit test?",
      });

      if (selectedOption === "Yes") {
        const filePathParts = editor.document.uri.path.split("/");
        const fileNameWithExtension = filePathParts.pop() || "";
        const fileNameParts = fileNameWithExtension.split(".");
        const fileExtension = fileNameParts.pop();
        const fileNameWithoutExtension = fileNameParts.join(".");

        const newFileName = `${fileNameWithoutExtension}.test.${fileExtension}`;

        const newFileUri = vscode.Uri.parse(
          "untitled:" +
            editor.document.uri.path.replace(/\/[^/]+$/, `/${newFileName}`)
        );

        const newEditor = await vscode.workspace.openTextDocument(newFileUri);
        await vscode.window.showTextDocument(newEditor);
        await vscode.window.activeTextEditor?.edit((editBuilder) => {
          editBuilder.insert(new vscode.Position(0, 0), testCode);
        });
      } else {
        await editor.edit((editBuilder) => {
          editBuilder.insert(editor.selection.end, "\n\n" + testCode);
        });
      }
      showTemporaryStatusMessage(
        "Unit test code generated successfully!",
        5000
      );
    } else {
      showTemporaryStatusMessage("Failed to call chatgpt!", 5000);
    }
  };
};

import * as vscode from "vscode";
import { processSelectedText } from "../chatgpt";
import { showTemporaryStatusMessage, hideStatusMessage } from "../utils";
import { ChatGptViewProvider } from "../webviews/ChatGptViewProvider";

export const getQueryToWebview = (
  apiKey: string,
  webViewProvider: ChatGptViewProvider | undefined
) => {
  return async () => {
    if (!webViewProvider) {
      vscode.window.showErrorMessage("Webview is not available.");
      return;
    }
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const selectedText = editor.document.getText(editor.selection);
    const textForQuery = selectedText
      ? `
\`\`\`
${selectedText}
\`\`\`
`
      : "";

    const customQuery = await vscode.window.showInputBox({
      prompt: "Enter your custom query",
    });

    if (!customQuery) {
      return;
    }

    const query = `${customQuery} : ${textForQuery}`;
    showTemporaryStatusMessage("Calling ChatGPT API...", undefined, true);
    await webViewProvider.sendMessageToWebView({
      type: "askQuestion",
      question: query,
    });

    const responseText = await processSelectedText(
      apiKey as string,
      query,
      "You are an AI assistant specializing in software development."
    );
    hideStatusMessage();

    if (responseText) {
      await webViewProvider.sendMessageToWebView({
        type: "addResponse",
        value: responseText,
      });
    } else {
      showTemporaryStatusMessage("Failed to call chatgpt!", 5000);
      webViewProvider.sendMessageToWebView({
        type: "addResponse",
        value: "Failed to call chatgpt!",
      });
    }
  };
};

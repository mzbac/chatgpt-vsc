import * as vscode from "vscode";
import { processSelectedText } from "../chatgpt";
import {
  showTemporaryStatusMessage,
  removeTextBeforeAndAfterFirstTripleBackticks,
  hideStatusMessage,
} from "../utils";

export const getCustomQuery = (apiKey: string) => {
  return async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selectedText = editor.document.getText(editor.selection);
    const textForQuery = selectedText
      ? `
             code: 
             """
             ${selectedText}
             """
             `
      : "";

    const customQuery = await vscode.window.showInputBox({
      prompt: "Enter your custom query",
    });
    if (!customQuery) {
      return;
    }

    showTemporaryStatusMessage("Calling ChatGPT API...", undefined, true);
    const correctedText = await processSelectedText(
      apiKey as string,
      `${customQuery}, please provide the code snippet only, without any explanation or triple backticks, for the following:${textForQuery}`,
      "You are an AI assistant specializing in software development. Your goal is to provide the user asked code examples, please provide the code snippet only, without any explanation or triple backticks."
    );
    hideStatusMessage();

    if (correctedText) {
      const res = removeTextBeforeAndAfterFirstTripleBackticks(correctedText);
      await editor.edit((editBuilder) => {
        editBuilder.replace(editor.selection, res);
      });
      showTemporaryStatusMessage("Updated successfully!", 5000);
    } else {
      showTemporaryStatusMessage("Failed to call chatgpt!", 5000);
    }
  };
};

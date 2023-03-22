import * as vscode from "vscode";
import { processSelectedText } from "../chatgpt";
import { hideStatusMessage, showTemporaryStatusMessage } from "../utils";

export const getGrammarCheck = (apiKey: string) => {
  return async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const selectedText = editor.document.getText(editor.selection);
    if (!selectedText) {
      showTemporaryStatusMessage("No text selected!", 5000);
      return;
    }

    showTemporaryStatusMessage("Calling ChatGPT API...", undefined, true);
    const correctedText = await processSelectedText(
      apiKey as string,
      `Output only text no any quotes, explanation and original.Please correct, polish or translate the following text into standard English: [Text=${selectedText}]`,
      "You are a helpful tool that corrects grammar mistakes, typos, factual errors, and translates text when necessary."
    );
    hideStatusMessage();

    if (correctedText) {
      try {
        await editor.edit((editBuilder) => {
          editBuilder.replace(editor.selection, correctedText);
        });
        showTemporaryStatusMessage(
          "Corrected text updated successfully!",
          5000
        );
      } catch (error) {
        console.error(error);
        showTemporaryStatusMessage("Failed to update text!", 5000);
      }
    } else {
      showTemporaryStatusMessage("Failed to call chatgpt!", 5000);
    }
  };
};

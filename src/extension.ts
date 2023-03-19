/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { processSelectedText } from "./chatgpt";

function removeTextBeforeAndAfterFirstTripleBackticks(
  response: string
): string {
  return response.replace(/[\s\S]*?^```\n?/, "").replace(/```$/, "");
}

let disposable: vscode.Disposable | undefined;
let customQueryDisposable: vscode.Disposable | undefined;

export async function activate(context: vscode.ExtensionContext) {
  let apiKey = vscode.workspace.getConfiguration().get("chatgpt-vsc.apiKey");
  if (!apiKey) {
    const value = await vscode.window.showInputBox({
      prompt: "Please enter your API key",
    });
    if (value) {
      await vscode.workspace
        .getConfiguration()
        .update("chatgpt-vsc.apiKey", value, vscode.ConfigurationTarget.Global);
      apiKey = value;
      vscode.window.showInformationMessage("API key saved successfully!");
    }
  }

  const statusBarMessage = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );

  function showTemporaryStatusMessage(message: string, duration: number) {
    statusBarMessage.text = message;
    statusBarMessage.show();
    setTimeout(() => {
      statusBarMessage.hide();
    }, duration);
  }

  disposable = vscode.commands.registerCommand(
    "chatgpt-vsc.grammar",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const selectedText = editor.document.getText(editor.selection);
      if (!selectedText) {
        showTemporaryStatusMessage("No text selected!", 5000);
        return;
      }

      showTemporaryStatusMessage("Calling chatgpt.....", 5000);
      const correctedText = await processSelectedText(
        apiKey as string,
        `Please correct, polish or translate the following text into standard English. Do not include any additional information in your output.[Text=${selectedText}]`
      );
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
    }
  );

  customQueryDisposable = vscode.commands.registerCommand(
    "chatgpt-vsc.customQuery",
    async () => {
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

      showTemporaryStatusMessage("Calling chatgpt.....", 5000);
      const correctedText = await processSelectedText(
        apiKey as string,
        `${customQuery}, please provide the code snippet only, without any explanation or triple backticks, for the following:${textForQuery}`,
        "You are an AI assistant specializing in software development. Your goal is to provide the user asked code examples, please provide the code snippet only, without any explanation or triple backticks."
      );

      if (correctedText) {
        const res = removeTextBeforeAndAfterFirstTripleBackticks(correctedText);
        await editor.edit((editBuilder) => {
          editBuilder.replace(editor.selection, res);
        });
        showTemporaryStatusMessage("Updated successfully!", 5000);
      } else {
        showTemporaryStatusMessage("Failed to call chatgpt!", 5000);
      }
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(customQueryDisposable);
}

export function deactivate() {
  if (disposable) {
    disposable.dispose();
  }
  if (customQueryDisposable) {
    customQueryDisposable.dispose();
  }
}

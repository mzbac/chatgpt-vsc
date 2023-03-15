/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { processSelectedText } from "./chatgpt";

function removeTextBeforeAndAfterFirstTripleBackticks(
  response: string
): string {
  return response.replace(/[\s\S]*?^```\n?/, "").replace(/```$/, "");
}

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

  let disposable = vscode.commands.registerCommand(
    "chatgpt-vsc.grammar",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const selectedText = editor.document.getText(editor.selection);
      if (!selectedText) {
        return;
      }
      
      showTemporaryStatusMessage("Calling chatgpt.....", 5000);
      const correctedText = await processSelectedText(
        apiKey as string,
        `Please correct, polish, or translate the following text to standard English. Make sure not to include any quotes or additional information, like the source language, in your output. [Text=${selectedText}]`
      );
      if (correctedText) {
        await editor.edit((editBuilder) => {
          editBuilder.replace(editor.selection, correctedText);
        });
        showTemporaryStatusMessage(
          "Corrected text updated successfully!",
          5000
        );
      } else {
        showTemporaryStatusMessage("Failed to call chatgpt!", 5000);
      }
    }
  );

  let customQueryDisposable = vscode.commands.registerCommand(
    "chatgpt-vsc.customQuery",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const selectedText = editor.document.getText(editor.selection);

      const customQuery = await vscode.window.showInputBox({
        prompt: "Enter your custom query",
      });
      if (!customQuery) {
        return;
      }
      showTemporaryStatusMessage("Calling chatgpt.....", 5000);
      const correctedText = await processSelectedText(
        apiKey as string,
        `${customQuery}, please provide the code snippet only, without any explanation or triple backticks, for the following:
         code: 
         """
         ${selectedText} 
         """`,
        "You are an AI assistant specializing in software development. Your goal is to provide helpful guidance, code examples, and explanations related to programming concepts, languages, and frameworks. Please provide the code snippet only, without any explanation or triple backticks"
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

export function deactivate() {}

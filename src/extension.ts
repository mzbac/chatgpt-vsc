import axios from "axios";
import * as vscode from "vscode";
import { ChatGPTRequest, ChatGPTResponse } from "./chatgpt";

export async function activate(context: vscode.ExtensionContext) {
  let apiKey = vscode.workspace
    .getConfiguration()
    .get("vsc-chatgpt-grammar.apiKey");
  if (!apiKey) {
    const apiKeyInput = vscode.window.showInputBox({
      prompt: "Please enter your API key",
    });
    await apiKeyInput.then((value) => {
      if (value) {
        vscode.workspace
          .getConfiguration()
          .update(
            "vsc-chatgpt-grammar.apiKey",
            value,
            vscode.ConfigurationTarget.Global
          );
		  apiKey = value;
        vscode.window.showInformationMessage("API key saved successfully!");
      }
    });
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
      try {
        const data: ChatGPTRequest = {
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that help user to correct grammar mistakes, typos, and factual errors or to generate text when user is asking for help. only reply the corrected text, do not include `corrected text:`",
            },
            { role: "user", content: selectedText },
          ],
          model: "gpt-3.5-turbo-0301",
          max_tokens: 2000,
          temperature: 0.5,
          top_p: 1,
          frequency_penalty: 1.3,
          presence_penalty: 1.3,
        };

        // Create headers
        const headers = {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
        };
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          data,
          {
            headers,
          }
        );
        const result: ChatGPTResponse = response.data;
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
          editor.document.uri,
          editor.selection,
          result.choices[0].message.content
        );
        await vscode.workspace.applyEdit(edit);
		vscode.window.showInformationMessage('Corrected text updated successfully!');
      } catch (error) {
        console.error(error);
        vscode.window.showErrorMessage("Failed to call chatgpt");
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}

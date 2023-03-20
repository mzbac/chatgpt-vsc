import * as vscode from "vscode";
import * as path from "path";
import { chatWithGPT } from "../chatgpt";
import { Message } from "../chatgpt-utils";
import { showTemporaryStatusMessage, hideStatusMessage } from "../utils";

export const getChatWithGPT = (apiKey: string) => {
  return async () => {
    let chatHistory: Message[] = [];

    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, "0")}-${(
      now.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${now.getFullYear()}-${now
      .getHours()
      .toString()
      .padStart(2, "0")}-${now.getMinutes().toString().padStart(2, "0")}`;

    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage("No active editor found.");
      return;
    }
    const currentFolderPath = path.dirname(activeEditor.document.uri.fsPath);
    const fileName = `chatgpt-conversation-${timestamp}.md`;
    const fileWithPath = path.join(currentFolderPath, fileName);
    const newFileUri = vscode.Uri.parse(`untitled:${fileWithPath}`);
    const newEditor = await vscode.workspace.openTextDocument(newFileUri);
    const editor = await vscode.window.showTextDocument(newEditor);

    const sendMessage = async (message: string) => {
      if (!message) {
        return;
      }

      chatHistory.push({ role: "user", content: message });
      showTemporaryStatusMessage("Calling ChatGPT API...", undefined, true);
      const chatGPTResponse = await chatWithGPT(apiKey as string, chatHistory);
      hideStatusMessage();

      if (chatGPTResponse) {
        chatHistory.push({ role: "assistant", content: chatGPTResponse });
        showTemporaryStatusMessage("ChatGPT API called successfully!", 5000);
      } else {
        chatHistory.push({
          role: "assistant",
          content: "Failed to call chatgpt!",
        });
        showTemporaryStatusMessage("Failed to call ChatGPT API!", 5000);
      }
    };

    const generateMarkdownConversation = (): string => {
      return chatHistory
        .map(
          (msg) =>
            `**${msg.role === "user" ? "You" : "ChatGPT"}:**\n\n${
              msg.content
            }\n\n`
        )
        .join("\n");
    };

    const updateConversationInMarkdown = async () => {
      await editor.edit((editBuilder) => {
        editBuilder.replace(
          new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(editor.document.lineCount, 0)
          ),
          generateMarkdownConversation()
        );
      });
    };

    while (true) {
      const inputMessage = await vscode.window.showInputBox({
        prompt: "Enter your message to ChatGPT",
      });

      if (inputMessage === undefined) {
        break; // Exit the loop when the user cancels the input box
      }

      await sendMessage(inputMessage);
      await updateConversationInMarkdown();
    }

    // Save the chat history file after the conversation
    await editor.document.save();
    vscode.window.showInformationMessage("Chat history saved.");
  };
};

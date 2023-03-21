import * as vscode from "vscode";
import { chatWithGPT } from "../chatgpt";
import { Message } from "../chatgpt-utils";
import { showTemporaryStatusMessage, hideStatusMessage } from "../utils";

const parseMarkdownConversation = (markdown: string): Message[] => {
  const messageRegex = /\*\*(You|ChatGPT):\*\*\n\n/g;
  const messages = markdown.split(messageRegex).filter((m) => m.trim() !== "");
  const chatHistory: Message[] = [];

  for (let i = 0; i < messages.length; i += 2) {
    const role = messages[i] === "You" ? "user" : "assistant";
    const content = messages[i + 1];
    chatHistory.push({ role, content });
  }

  return chatHistory;
};

export const GetRecoverChatWithGPT = (apiKey: string) => {
  return async () => {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage("No active editor found.");
      return;
    }

    if (!activeEditor.document.fileName.endsWith(".md")) {
      vscode.window.showErrorMessage(
        "Please open a Markdown file (.md) to recover the conversation."
      );
      return;
    }

    const decodedContent = activeEditor.document.getText();
    let chatHistory: Message[] = parseMarkdownConversation(decodedContent);

    const editor = activeEditor;

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

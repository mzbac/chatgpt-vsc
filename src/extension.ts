/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import * as path from "path";

import { chatWithGPT, processSelectedText } from "./chatgpt";
import { Message } from "./chatgpt-utils";

function removeTextBeforeAndAfterFirstTripleBackticks(
  response: string
): string {
  return response.replace(/[\s\S]*?```[\S]*\n?/, "").replace(/```$/, "");
}
const asciiLoadingFrames = ["|", "/", "-", "\\"];
let statusBarItem: vscode.StatusBarItem | undefined;
let animationInterval: NodeJS.Timeout | undefined;

function showTemporaryStatusMessage(
  message: string,
  timeout?: number,
  animate?: boolean
) {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
  }
  statusBarItem.text = message;
  statusBarItem.show();

  if (animate) {
    let counter = 0;
    animationInterval = setInterval(() => {
      counter = (counter + 1) % asciiLoadingFrames.length;
      if (statusBarItem) {
        statusBarItem.text = message + " " + asciiLoadingFrames[counter];
      }
    }, 100);
  }

  if (timeout) {
    setTimeout(() => {
      statusBarItem?.hide();
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    }, timeout);
  }
}

function hideStatusMessage() {
  if (statusBarItem) {
    statusBarItem.hide();
  }
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = undefined;
  }
}

let grammarDisposable: vscode.Disposable | undefined;
let customQueryDisposable: vscode.Disposable | undefined;
let generateUnitTestDisposable: vscode.Disposable | undefined;
let chatWithGPTDisposable: vscode.Disposable | undefined;

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

  grammarDisposable = vscode.commands.registerCommand(
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
  generateUnitTestDisposable = vscode.commands.registerCommand(
    "chatgpt-vsc.generateUnitTest",
    async () => {
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

      showTemporaryStatusMessage("Calling chatgpt.....", 5000);

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

      if (generatedTest) {
        const testCode =
          removeTextBeforeAndAfterFirstTripleBackticks(generatedTest);

        const newFileOptions = ["Yes", "No"];
        const selectedOption = await vscode.window.showQuickPick(
          newFileOptions,
          {
            placeHolder:
              "Do you want to create a new file for the generated unit test?",
          }
        );

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
    }
  );

  chatWithGPTDisposable = vscode.commands.registerCommand(
    "chatgpt-vsc.chatWithGPT",
    async () => {
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
        let chatGPTResponse;
        try {
          chatGPTResponse = await chatWithGPT(apiKey as string, chatHistory);
        } catch (e: any) {
          showTemporaryStatusMessage("Failed to call ChatGPT API!", e.message);
        }

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
    }
  );

  context.subscriptions.push(chatWithGPTDisposable);

  context.subscriptions.push(chatWithGPTDisposable);
  context.subscriptions.push(grammarDisposable);
  context.subscriptions.push(customQueryDisposable);
  context.subscriptions.push(generateUnitTestDisposable);
}

export function deactivate() {
  if (grammarDisposable) {
    grammarDisposable.dispose();
  }
  if (customQueryDisposable) {
    customQueryDisposable.dispose();
  }
  if (generateUnitTestDisposable) {
    generateUnitTestDisposable.dispose();
  }
  if (chatWithGPTDisposable) {
    chatWithGPTDisposable.dispose();
  }
}

import * as vscode from "vscode";
import { getGenerateUnitTest } from "./commands/generateUnitTest";
import { getGrammarCheck } from "./commands/grammarCheck";
import { getCustomQuery } from "./commands/customQuery";
import { getChatWithGPT } from "./commands/chatWithGPT";
import { getRecoverChatWithGPT } from "./commands/recoverChatWithGPT";

let grammarDisposable: vscode.Disposable | undefined;
let customQueryDisposable: vscode.Disposable | undefined;
let generateUnitTestDisposable: vscode.Disposable | undefined;
let chatWithGPTDisposable: vscode.Disposable | undefined;
let recoverChatWithGPTDisposable: vscode.Disposable | undefined;

export async function activate(context: vscode.ExtensionContext) {
  let apiKey = vscode.workspace
    .getConfiguration()
    .get<string>("chatgpt-vsc.apiKey");
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
    getGrammarCheck(apiKey!)
  );

  customQueryDisposable = vscode.commands.registerCommand(
    "chatgpt-vsc.customQuery",
    getCustomQuery(apiKey!)
  );

  generateUnitTestDisposable = vscode.commands.registerCommand(
    "chatgpt-vsc.generateUnitTest",
    getGenerateUnitTest(apiKey!)
  );

  chatWithGPTDisposable = vscode.commands.registerCommand(
    "chatgpt-vsc.chatWithGPT",
    getChatWithGPT(apiKey!)
  );

  recoverChatWithGPTDisposable = vscode.commands.registerCommand(
    "extension.recoverChatWithGPT",
    getRecoverChatWithGPT(apiKey!)
  );

  context.subscriptions.push(recoverChatWithGPTDisposable);
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
  if (recoverChatWithGPTDisposable) {
    recoverChatWithGPTDisposable.dispose();
  }
}

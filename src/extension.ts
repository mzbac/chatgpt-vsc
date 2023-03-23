import * as vscode from "vscode";
import { getGenerateUnitTest } from "./commands/generateUnitTest";
import { getGrammarCheck } from "./commands/grammarCheck";
import { getChatWithGPT } from "./commands/chatWithGPT";
import { getRecoverChatWithGPT } from "./commands/recoverChatWithGPT";
import { ChatGptViewProvider } from "./webviews/ChatGptViewProvider";
import { getQueryToWebview } from "./commands/queryToWebview";

let grammarDisposable: vscode.Disposable | undefined;
let generateUnitTestDisposable: vscode.Disposable | undefined;
let chatWithGPTDisposable: vscode.Disposable | undefined;
let recoverChatWithGPTDisposable: vscode.Disposable | undefined;
let queryToWebviewDisposable: vscode.Disposable | undefined;

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
  context.subscriptions.push(generateUnitTestDisposable);

  const chatGptViewProvider = new ChatGptViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "chatgpt-vsc.view",
      chatGptViewProvider,
      {
        webviewOptions: { retainContextWhenHidden: true },
      }
    )
  );

  queryToWebviewDisposable = vscode.commands.registerCommand(
    "chatgpt-vsc.queryToWebview",
    getQueryToWebview(apiKey!, chatGptViewProvider)
  );

  context.subscriptions.push(queryToWebviewDisposable);
}

export function deactivate() {
  if (grammarDisposable) {
    grammarDisposable.dispose();
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

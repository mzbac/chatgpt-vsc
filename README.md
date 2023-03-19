# ChatGPT-VSC

ChatGPT-VSC is a Visual Studio Code extension that integrates OpenAI GPT into your editor to help with grammar correction, code snippets, custom queries, and generating unit tests.

[![chatgpt-vsc-demo](https://img.youtube.com/vi/1Hj7P0RO6jo/0.jpg)](https://www.youtube.com/watch?v=1Hj7P0RO6jo)

## Features

- Correct grammar and polish selected text using the ChatGPT model
- Generate code snippets based on custom queries
- Replace the selected text with the generated response
- Generate unit test code for the selected code snippet

## Requirements

To use this extension, you need an OpenAI API key. You can obtain an API key from the [OpenAI website](https://platform.openai.com/account/api-keys).

## Extension Settings

This extension contributes the following configuration settings:

```json
{
  "chatgpt-vsc.apiKey": "Your OpenAI API key",
  "chatgpt-vsc.model": "GPT model to use (e.g., 'gpt-3.5-turbo' or 'gpt-3.5-turbo-0301')",
  "chatgpt-vsc.temperature": "Temperature for the model (e.g., 0.7)",
  "chatgpt-vsc.maxTokens": "Maximum number of tokens in the generated response (e.g., 2000)",
  "chatgpt-vsc.topP": "Top-p sampling for the model (e.g., 1)",
  "chatgpt-vsc.frequencyPenalty": "Frequency penalty for the model (e.g., 1.3)",
  "chatgpt-vsc.presencePenalty": "Presence penalty for the model (e.g., 1.3)"
}
```

## Usage

To use this extension, follow these steps:

### Grammar check

1. Select some text in the editor.
2. Right-click on the selected text to open the context menu. Click on the "ChatGPT Grammar Check" command or use the keyboard shortcut "shift+cmd+'" to call the OpenAI GPT model with the selected text as input.
3. The selected text will be replaced with the corrected text.

### Custom query

1. Select some text in the editor.
2. Right-click on the selected text to open the context menu. Click on the "ChatGPT Custom Query" command.
3. A prompt will appear asking for your custom query. Enter your query and press Enter.
4. The selected text will be replaced with the generated response based on your custom query.

### Generate unit test

1. Select a code snippet in the editor.
2. Right-click on the selected code to open the context menu. Click on the "ChatGPT Generate Unit Test" command.
3. The generated unit test code will be appended after the selected code snippet.

Note: For the "Generate unit test" command, it's important to select the entire code snippet for which you want to generate unit tests.

## Sequence Diagram

[![](https://mermaid.ink/img/eyJjb2RlIjoic2VxdWVuY2VEaWFncmFtXG4gICAgcGFydGljaXBhbnQgVXNlclxuICAgIHBhcnRpY2lwYW50IEV4dGVuc2lvblxuICAgIHBhcnRpY2lwYW50IENoYXRHUFRcblxuICAgIFVzZXItPj5FeHRlbnNpb246IGNoYXRncHQtdnNjLmdyYW1tYXIgY29tbWFuZFxuICAgIGFjdGl2YXRlIEV4dGVuc2lvblxuICAgIEV4dGVuc2lvbi0-PkNoYXRHUFQ6IHByb2Nlc3NTZWxlY3RlZFRleHQoYXBpS2V5LCBncmFtbWFyUHJvbXB0KVxuICAgIGFjdGl2YXRlIENoYXRHUFRcbiAgICBDaGF0R1BULS0-PkV4dGVuc2lvbjogY29ycmVjdGVkVGV4dFxuICAgIGRlYWN0aXZhdGUgQ2hhdEdQVFxuICAgIEV4dGVuc2lvbi0-PlVzZXI6IFJlcGxhY2Ugc2VsZWN0ZWQgdGV4dCB3aXRoIGNvcnJlY3RlZFRleHRcbiAgICBkZWFjdGl2YXRlIEV4dGVuc2lvblxuXG4gICAgVXNlci0-PkV4dGVuc2lvbjogY2hhdGdwdC12c2MuY3VzdG9tUXVlcnkgY29tbWFuZFxuICAgIGFjdGl2YXRlIEV4dGVuc2lvblxuICAgIEV4dGVuc2lvbi0-PlVzZXI6IFJlcXVlc3QgY3VzdG9tIHF1ZXJ5XG4gICAgVXNlci0-PkV4dGVuc2lvbjogUHJvdmlkZSBjdXN0b20gcXVlcnlcbiAgICBFeHRlbnNpb24tPj5DaGF0R1BUOiBwcm9jZXNzU2VsZWN0ZWRUZXh0KGFwaUtleSwgY3VzdG9tUXVlcnlQcm9tcHQpXG4gICAgYWN0aXZhdGUgQ2hhdEdQVFxuICAgIENoYXRHUFQtLT4-RXh0ZW5zaW9uOiByZXNwb25zZVRleHRcbiAgICBkZWFjdGl2YXRlIENoYXRHUFRcbiAgICBFeHRlbnNpb24tPj5Vc2VyOiBSZXBsYWNlIHNlbGVjdGVkIHRleHQgd2l0aCByZXNwb25zZVRleHRcbiAgICBkZWFjdGl2YXRlIEV4dGVuc2lvblxuIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRlZmF1bHQifSwidXBkYXRlRWRpdG9yIjpmYWxzZX0)](https://mermaid-js.github.io/docs/mermaid-live-editor-beta/#/edit/eyJjb2RlIjoic2VxdWVuY2VEaWFncmFtXG4gICAgcGFydGljaXBhbnQgVXNlclxuICAgIHBhcnRpY2lwYW50IEV4dGVuc2lvblxuICAgIHBhcnRpY2lwYW50IENoYXRHUFRcblxuICAgIFVzZXItPj5FeHRlbnNpb246IGNoYXRncHQtdnNjLmdyYW1tYXIgY29tbWFuZFxuICAgIGFjdGl2YXRlIEV4dGVuc2lvblxuICAgIEV4dGVuc2lvbi0-PkNoYXRHUFQ6IHByb2Nlc3NTZWxlY3RlZFRleHQoYXBpS2V5LCBncmFtbWFyUHJvbXB0KVxuICAgIGFjdGl2YXRlIENoYXRHUFRcbiAgICBDaGF0R1BULS0-PkV4dGVuc2lvbjogY29ycmVjdGVkVGV4dFxuICAgIGRlYWN0aXZhdGUgQ2hhdEdQVFxuICAgIEV4dGVuc2lvbi0-PlVzZXI6IFJlcGxhY2Ugc2VsZWN0ZWQgdGV4dCB3aXRoIGNvcnJlY3RlZFRleHRcbiAgICBkZWFjdGl2YXRlIEV4dGVuc2lvblxuXG4gICAgVXNlci0-PkV4dGVuc2lvbjogY2hhdGdwdC12c2MuY3VzdG9tUXVlcnkgY29tbWFuZFxuICAgIGFjdGl2YXRlIEV4dGVuc2lvblxuICAgIEV4dGVuc2lvbi0-PlVzZXI6IFJlcXVlc3QgY3VzdG9tIHF1ZXJ5XG4gICAgVXNlci0-PkV4dGVuc2lvbjogUHJvdmlkZSBjdXN0b20gcXVlcnlcbiAgICBFeHRlbnNpb24tPj5DaGF0R1BUOiBwcm9jZXNzU2VsZWN0ZWRUZXh0KGFwaUtleSwgY3VzdG9tUXVlcnlQcm9tcHQpXG4gICAgYWN0aXZhdGUgQ2hhdEdQVFxuICAgIENoYXRHUFQtLT4-RXh0ZW5zaW9uOiByZXNwb25zZVRleHRcbiAgICBkZWFjdGl2YXRlIENoYXRHUFRcbiAgICBFeHRlbnNpb24tPj5Vc2VyOiBSZXBsYWNlIHNlbGVjdGVkIHRleHQgd2l0aCByZXNwb25zZVRleHRcbiAgICBkZWFjdGl2YXRlIEV4dGVuc2lvblxuIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRlZmF1bHQifSwidXBkYXRlRWRpdG9yIjpmYWxzZX0)

The sequence diagram above shows how the two commands "chatgpt-vsc.grammar" and "chatgpt-vsc.customQuery" work in the Visual Studio Code extension.

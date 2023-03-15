# ChatGPT-VSC

ChatGPT-VSC is a Visual Studio Code extension that allows you to call an OpenAI GPT model with a selected text and replace it with the generated response.

[![chatgpt-vsc-demo](https://img.youtube.com/vi/1Hj7P0RO6jo/0.jpg)](https://www.youtube.com/watch?v=1Hj7P0RO6jo)

## Features

- Call an OpenAI GPT model with a selected text
- Replace the selected text with the generated response

## Requirements

To use this extension, you need an OpenAI API key. You can obtain an API key from the [OpenAI website](https://platform.openai.com/account/api-keys).

## Extension Settings

This extension contributes the following configuration settings:

```json
{
  "chatgpt-vsc.apiKey": "Your OpenAI API key"
}
```

## Usage

To use this extension, follow these steps:

1. Select some text in the editor
2. Right-click on the selected text to open the context menu
3. Click on the `Grammar check` command to call the OpenAI GPT model with the selected text as input
4. The selected text will be replaced with the generated response

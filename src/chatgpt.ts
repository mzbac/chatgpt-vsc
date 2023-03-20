/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios";
import {
  ChatGPTResponse,
  getConfiguredChatGPTRequest,
  Message,
} from "./chatgpt-utils";

export const processSelectedText = async (
  apiKey: string,
  selectedText: string,
  prompt?: string
): Promise<string | null> => {
  const systemPrompt =
    prompt ||
    "You are a helpful assistant that corrects grammar mistakes, typos, factual errors, and translates text when necessary.";

  try {
    const chatGPTRequest = getConfiguredChatGPTRequest([
      {
        role: "system",
        content: systemPrompt,
      },
      { role: "user", content: selectedText },
    ]);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      chatGPTRequest,
      { headers }
    );
    const result: ChatGPTResponse = response.data;

    return result.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export async function chatWithGPT(
  apiKey: string,
  messages: Message[]
): Promise<string | null> {
  try {
    const chatGPTRequest = getConfiguredChatGPTRequest(messages);
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    };
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      chatGPTRequest,
      { headers }
    );
    const { choices } = response.data as ChatGPTResponse;

    return choices[0]?.message?.content || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

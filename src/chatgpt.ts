/* eslint-disable @typescript-eslint/naming-convention */
import axios from "axios";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatGPTRequest = {
  model: "gpt-3.5-turbo" | "gpt-3.5-turbo-0301";
  messages: Message[];
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  logit_bias?: Record<string, number>;
  user?: string;
};

export type Choice = {
  index: number;
  message: Message;
  finish_reason: string;
};

export type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export type ChatGPTResponse = {
  id: string;
  object: string;
  created: number;
  choices: Choice[];
  usage: Usage;
};

export async function processSelectedText(
  apiKey: string,
  selectedText: string,
  systemPrompt: string = "You are a helpful assistant that corrects grammar mistakes, typos, factual errors, and translates text when necessary."
): Promise<string | null> {
  try {
    const data: ChatGPTRequest = {
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: selectedText },
      ],
      model: "gpt-3.5-turbo-0301",
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 1.3,
      presence_penalty: 1.3,
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer " + apiKey,
    };
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      data,
      { headers }
    );
    const result: ChatGPTResponse = response.data;

    return result.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return null;
  }
}

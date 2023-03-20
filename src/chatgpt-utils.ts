/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ModelName =
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0301"
  | "gpt-4"
  | "gpt-4-0314";

type ChatGPTRequest = {
  model: ModelName;
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

type Choice = {
  index: number;
  message: Message;
  finish_reason: string;
};

type Usage = {
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

const DEFAULT_MODEL = "gpt-3.5-turbo-0301";
const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 2000;
const DEFAULT_TOP_P = 1;
const DEFAULT_FREQUENCY_PENALTY = 1.3;
const DEFAULT_PRESENCE_PENALTY = 1.3;

const getChatGPTConfiguration = (configKey: string, defaultValue: any) =>
  vscode.workspace.getConfiguration("chatgpt-vsc").get(configKey) ??
  defaultValue;

export const getConfiguredChatGPTRequest = (
  messages: Message[]
): ChatGPTRequest => ({
  messages,
  model: getChatGPTConfiguration("model", DEFAULT_MODEL),
  max_tokens: getChatGPTConfiguration("maxTokens", DEFAULT_MAX_TOKENS),
  temperature: getChatGPTConfiguration("temperature", DEFAULT_TEMPERATURE),
  top_p: getChatGPTConfiguration("topP", DEFAULT_TOP_P),
  frequency_penalty: getChatGPTConfiguration(
    "frequencyPenalty",
    DEFAULT_FREQUENCY_PENALTY
  ),
  presence_penalty: getChatGPTConfiguration(
    "presencePenalty",
    DEFAULT_PRESENCE_PENALTY
  ),
  stop: undefined,
  stream: undefined,
  logit_bias: undefined,
  user: undefined,
});

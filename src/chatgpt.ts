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
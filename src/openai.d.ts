import { ExcerptConfig } from "./excerpt";

export type OpenaiModel = "gpt-4o" | "gpt-4o-mini";

export type OpenaiConfig = {
  "api-key-env-var": string;
  "model": OpenaiModel;
  "temperature": number;
  "system-message": string[];
};

export type OpenaiResponse = {
  choices: {
    message: {
      role: "assistant";
      content: string;
    };
    finish_reason: "stop" | "length";
  }[];
};

export type OpenaiPrompt = OpenaiConfig & ExcerptConfig;

import { OpenaiPrompt } from "./openai";

export type OpenaiEntry = { name: string } & OpenaiPrompt;

export type Config = {
  openai: OpenaiEntry[];
};

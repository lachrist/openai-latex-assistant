import { excerpt } from "./excerpt.mjs";
import { env } from "node:process";
import { get } from "./util.mjs";
import vscode from "../ext/vscode.mjs";

const LINE_SEPARATOR = {
  [vscode.EndOfLine.LF]: "\n",
  [vscode.EndOfLine.CRLF]: "\r\n",
};

/**
 * @type {(
 *   message: string,
 *   config: import("./openai").OpenaiConfig,
 * ) => Promise<string>}
 */
const fetchOpenai = async (message, config) => {
  const env_var = config["api-key-env-var"];
  const bearer = get(env, env_var);
  if (bearer === null) {
    throw new Error(`OpenAI API key is not in ${env_var}`);
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearer}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: config.temperature,
      messages: [
        { role: "system", content: config["system-message"] },
        { role: "user", content: message },
      ],
    }),
  });
  const data = /** @type {any} */ (await response.json());
  return data.choices[0].message.content;
};

/**
 * @type {(
 *   window: typeof import("vscode").window,
 *   prompt: import("./openai").OpenaiPrompt,
 * ) => Promise<void>}
 */
export const executeOpenai = async (window, prompt) => {
  const editor = window.activeTextEditor;
  if (editor === undefined) {
    throw new Error("No active text editor");
  }
  const selection = editor.selection;
  const result = await fetchOpenai(
    excerpt(editor.document.getText(), selection, {
      line_separator: LINE_SEPARATOR[editor.document.eol],
      config: prompt,
    }),
    prompt,
  );
  const input = await vscode.window.showInputBox({
    title: "Replacement",
    prompt: "Edit the text",
    value: result,
  });
  if (input == null) {
    const success = await editor.edit((builder) => {
      builder.replace(selection, result);
    });
    if (!success) {
      throw new Error("Failed to edit selection");
    }
  }
};

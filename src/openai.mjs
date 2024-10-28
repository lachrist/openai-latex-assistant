import { env } from "node:process";
import { get } from "./util.mjs";

/**
 * @type {(
 *   message: string,
 *   config: import("./openai").OpenaiConfig,
 * ) => Promise<string>}
 */
export const fetchOpenai = async (message, config) => {
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
        { role: "system", content: config["system-message"].join("\n") },
        { role: "user", content: message },
      ],
    }),
  });
  const data = /** @type {import("./openai").OpenaiResponse} */ (
    await response.json()
  );
  if (data.choices.length === 0) {
    throw new Error("OpenAI did not return any choices");
  }
  const choice = data.choices[0];
  if (choice.finish_reason !== "stop") {
    throw new Error(`OpenAI did not finish: ${choice.finish_reason}`);
  }
  return data.choices[0].message.content;
};

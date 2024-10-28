import vscode from "../ext/vscode.mjs";
import { env } from "node:process";
import { excerpt } from "./excerpt.mjs";
import { executeOpenai } from "./openai.mjs";

/**
 * @type {(
 *   context: import("vscode").ExtensionContext,
 * ) => void}
 */
export const activate = (context) => {
  /** @type {import("./config").Config} */
  const config = /** @type {any} */ (
    vscode.workspace.getConfiguration("latex-assistant")
  );
  for (const prompt of config.openai) {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        `latex-assistant-${prompt.name}`,
        async () => {
          const { window } = vscode;
          try {
            await executeOpenai(window, prompt);
          } catch (error) {
            if (error instanceof Error) {
              window.showErrorMessage(error.message);
            } else {
              window.showErrorMessage("An unknown error occurred");
            }
          }
        },
      ),
    );
  }
};

/**
 * @type {() => void}
 */
export const deactivate = () => {};

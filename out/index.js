"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.mjs
var src_exports = {};
__export(src_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(src_exports);
var import_vscode = __toESM(require("vscode"), 1);

// src/openai.mjs
var import_node_process = require("node:process");

// src/util.mjs
var isNotNull = (value) => value !== null;
var toNullableStringEntry = (key) => [key, null];
var get = (obj, key) => Object.hasOwn(obj, key) ? obj[key] ?? null : null;
var compileGet = (key) => (obj) => obj[key];
var getErrorMessage = (error) => {
  if (error instanceof Error) {
    return error.message;
  } else {
    return "An unknown error occurred";
  }
};

// src/openai.mjs
var fetchOpenai = async (message, config) => {
  const env_var = config["api-key-env-var"];
  const bearer = get(import_node_process.env, env_var);
  if (bearer === null) {
    throw new Error(`OpenAI API key is not in ${env_var}`);
  }
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${bearer}`
    },
    body: JSON.stringify({
      model: config.model,
      temperature: config.temperature,
      messages: [
        { role: "system", content: config["system-message"].join("\n") },
        { role: "user", content: message }
      ]
    })
  });
  const data = (
    /** @type {import("./openai").OpenaiResponse} */
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

// src/excerpt.mjs
var COMMAND_REGEXP = /^\s*\\([a-zA-Z0-9_]+){/;
var DIRECTION = {
  forward: 1,
  backward: -1
};
var parseCommand = (line) => {
  const parts = COMMAND_REGEXP.exec(line);
  return parts == null ? null : parts[1];
};
var compileIsSection = (sections) => {
  const set = new Set(sections);
  return (line) => {
    const parts = COMMAND_REGEXP.exec(line);
    return parts != null && set.has(parts[1]);
  };
};
var excerptSection = (lines, start_line_index, { section_hierarchy }) => {
  const sections = new Map(section_hierarchy.map(toNullableStringEntry));
  for (let index = 0; index < start_line_index; index++) {
    const line = lines[index].trim();
    const command = parseCommand(line);
    if (command !== null && sections.has(command)) {
      sections.set(command, line);
      let matched = false;
      for (const section of section_hierarchy) {
        if (matched) {
          sections.set(section, null);
        } else {
          matched = section === command;
        }
      }
    }
  }
  return Array.from(sections.values()).filter(isNotNull);
};
var excerptContext = (lines, index, { direction, isSection, max_char_count }) => {
  const increment = DIRECTION[direction];
  const context = [];
  let char_count = 0;
  while (index >= 0 && index < lines.length && char_count < max_char_count) {
    const line = lines[index].trimEnd();
    if (isSection(line)) {
      break;
    }
    index += increment;
    context.push(line);
    char_count += line.length;
  }
  if (direction === "backward") {
    context.reverse();
  }
  return context;
};
var excerpt = (content, { start: { line: start_line_index }, end: { line: end_line_index } }, {
  line_separator,
  config: {
    "section-hierarchy": section_hierarchy,
    "begin-selection-marker": begin_marker,
    "end-selection-marker": end_marker,
    "before-char-count": before_char_count,
    "after-char-count": after_char_count
  }
}) => {
  const lines = content.split(line_separator);
  const isSection = compileIsSection(section_hierarchy);
  return [
    ...excerptSection(lines, start_line_index, { section_hierarchy }),
    "...",
    ...excerptContext(lines, start_line_index - 1, {
      direction: "backward",
      isSection,
      max_char_count: before_char_count
    }),
    begin_marker,
    ...lines.slice(start_line_index, end_line_index + 1),
    end_marker,
    ...excerptContext(lines, end_line_index + 1, {
      direction: "forward",
      isSection,
      max_char_count: after_char_count
    }),
    "..."
  ].join("\n");
};

// src/index.mjs
var LINE_SEPARATOR = {
  [import_vscode.default.EndOfLine.LF]: "\n",
  [import_vscode.default.EndOfLine.CRLF]: "\r\n"
};
var getName = compileGet("name");
var activate = (context) => {
  context.subscriptions.push(
    import_vscode.default.commands.registerTextEditorCommand(
      "latex-assistant.prompt",
      async (editor, _edit, input) => {
        const config = (
          /** @type {any} */
          import_vscode.default.workspace.getConfiguration("latex-assistant")
        );
        try {
          await execute(editor, input, config);
        } catch (error) {
          import_vscode.default.window.showErrorMessage(getErrorMessage(error));
        }
      }
    )
  );
};
var DELIMITER = "%%%%%%%%%%";
var execute = async (editor, input, config) => {
  const name = input ?? await import_vscode.default.window.showQuickPick(config.openai.map(getName), {
    placeHolder: "Choose a prompt"
  });
  if (name != null) {
    const prompt = config.openai.find((prompt2) => prompt2.name === name);
    if (prompt == null) {
      throw new Error(`Unknown prompt: ${name}`);
    }
    const { selection } = editor;
    const line_separator = LINE_SEPARATOR[editor.document.eol];
    const message = excerpt(editor.document.getText(), selection, {
      line_separator,
      config: prompt
    });
    const result = await fetchOpenai(message, prompt);
    editor.edit((edit) => {
      edit.insert(
        new import_vscode.default.Position(selection.end.line + 1, 0),
        [DELIMITER, result, DELIMITER, ""].join(line_separator)
      );
    });
  }
};
var deactivate = () => {
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});

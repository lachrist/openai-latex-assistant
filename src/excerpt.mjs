import { isNotNull, toNullableStringEntry } from "./util.mjs";

const COMMAND_REGEXP = /^\s*\\([a-zA-Z0-9_]+){/;

const DIRECTION = {
  forward: 1,
  backward: -1,
};

/**
 * @type {(
 *   line: string,
 * ) => null | string}
 */
const parseCommand = (line) => {
  const parts = COMMAND_REGEXP.exec(line);
  return parts == null ? null : parts[1];
};

/**
 * @type {(
 *   sections: string[],
 * ) => (
 *   line: string,
 * ) => boolean}
 */
const compileIsSection = (sections) => {
  const set = new Set(sections);
  return (line) => {
    const parts = COMMAND_REGEXP.exec(line);
    return parts != null && set.has(parts[1]);
  };
};

// /**
//  * @type {(
//  *   lines: string[],
//  *   range: {
//  *     start: number,
//  *     end: number,
//  *   },
//  *   options: {
//  *     line_separator_length: number,
//  *   },
//  * ) => {
//  *   start_line_index: number,
//  *   end_line_index: number,
//  * }}
//  */
// const rangeLine = (lines, { start, end }, { line_separator_length }) => {
//   start = Math.max(start, 0);
//   let cursor = 0;
//   let index = 0;
//   while (cursor <= start && index < lines.length) {
//     cursor += lines[index++].length + line_separator_length;
//   }
//   const start_line_index = index - 1;
//   while (cursor < end && index < lines.length) {
//     cursor += lines[index++].length + line_separator_length;
//   }
//   const end_line_index = index - 1;
//   return { start_line_index, end_line_index };
// };

/**
 * @type {(
 *   lines: string[],
 *   start_line_index: number,
 *   options: {
 *     section_hierarchy: string[],
 *   },
 * ) => string[]}
 */
const excerptSection = (lines, start_line_index, { section_hierarchy }) => {
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

/**
 * @type {(
 *   lines: string[],
 *   index: number,
 *   options: {
 *     direction: "forward" | "backward",
 *     isSection: (line: string) => boolean,
 *     max_char_count: number,
 *   },
 * ) => string[]}
 */
const excerptContext = (
  lines,
  index,
  { direction, isSection, max_char_count },
) => {
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

/**
 * @type {(
 *   content: string,
 *   range: {
 *     start: { line: number },
 *     end: { line: number },
 *   },
 *   options: {
 *      line_separator: string,
 *      config: import("./excerpt").ExcerptConfig,
 *   },
 * ) => string}
 */
export const excerpt = (
  content,
  { start: { line: start_line_index }, end: { line: end_line_index } },
  {
    line_separator,
    config: {
      "section-hierarchy": section_hierarchy,
      "begin-selection-marker": begin_marker,
      "end-selection-marker": end_marker,
      "before-char-count": before_char_count,
      "after-char-count": after_char_count,
    },
  },
) => {
  const lines = content.split(line_separator);
  const isSection = compileIsSection(section_hierarchy);
  return [
    ...excerptSection(lines, start_line_index, { section_hierarchy }),
    "...",
    ...excerptContext(lines, start_line_index - 1, {
      direction: "backward",
      isSection,
      max_char_count: before_char_count,
    }),
    begin_marker,
    ...lines.slice(start_line_index, end_line_index + 1),
    end_marker,
    ...excerptContext(lines, end_line_index + 1, {
      direction: "forward",
      isSection,
      max_char_count: after_char_count,
    }),
    "...",
  ].join("\n");
};

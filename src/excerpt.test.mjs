import { excerpt } from "./excerpt.mjs";

/**
 * @type {(
 *   actual: unknown,
 *   expect: unknown,
 * ) => void}
 */
const assertEqual = (actual, expect) => {
  if (actual !== expect) {
    throw new Error("Assertion failed", { cause: { actual, expect } });
  }
};

const config = {
  "section-hierarchy": [],
  "begin-selection-marker": "BEGIN",
  "end-selection-marker": "END",
  "before-char-count": 0,
  "after-char-count": 0,
};

const SEP = "\t";

///////////
// range //
///////////

assertEqual(
  excerpt(
    ["foo", "bar1", "bar2", "bar3", "qux"].join(SEP),
    { start: { line: 1 }, end: { line: 3 } },
    {
      line_separator: SEP,
      config,
    },
  ),
  ["...", "BEGIN", "bar1", "bar2", "bar3", "END", "..."].join("\n"),
);

/////////////
// section //
/////////////

assertEqual(
  excerpt(
    [
      "\\chapter{ch}",
      " qux",
      "  \\section{sc}",
      "   \\command{}",
      "    \\subsection{ss}",
      "     \\paragraph{pr}",
      "foo",
    ].join(SEP),
    { start: { line: 6 }, end: { line: 6 } },
    {
      line_separator: SEP,
      config: {
        ...config,
        "section-hierarchy": ["chapter", "section", "subsection"],
      },
    },
  ),
  [
    "\\chapter{ch}",
    "\\section{sc}",
    "\\subsection{ss}",
    "...",
    "BEGIN",
    "foo",
    "END",
    "...",
  ].join("\n"),
);

assertEqual(
  excerpt(
    ["\\chapter{ch1}", "\\section{sc1}", "\\chapter{ch2}", "foo", "bar"].join(
      SEP,
    ),
    { start: { line: 3 }, end: { line: 3 } },
    {
      line_separator: SEP,
      config: { ...config, "section-hierarchy": ["chapter", "section"] },
    },
  ),
  ["\\chapter{ch2}", "...", "BEGIN", "foo", "END", "..."].join("\n"),
);

////////////
// before //
////////////

assertEqual(
  excerpt(
    ["foo1", "foo2", "bar", "qux"].join(SEP),
    { start: { line: 2 }, end: { line: 2 } },
    {
      line_separator: SEP,
      config,
    },
  ),
  ["...", "BEGIN", "bar", "END", "..."].join("\n"),
);

assertEqual(
  excerpt(
    ["foo1", "foo2", "bar", "qux"].join(SEP),
    { start: { line: 2 }, end: { line: 2 } },
    {
      line_separator: SEP,
      config: { ...config, "before-char-count": 1 },
    },
  ),
  ["...", "foo2", "BEGIN", "bar", "END", "..."].join("\n"),
);

assertEqual(
  excerpt(
    ["foo1", "foo2", "bar", "qux"].join(SEP),
    { start: { line: 2 }, end: { line: 2 } },
    {
      line_separator: SEP,
      config: {
        ...config,
        "before-char-count": 1 / 0,
      },
    },
  ),
  ["...", "foo1", "foo2", "BEGIN", "bar", "END", "..."].join("\n"),
);

///////////
// after //
///////////

assertEqual(
  excerpt(
    ["foo", "bar", "qux1", "qux2"].join(SEP),
    { start: { line: 1 }, end: { line: 1 } },
    {
      line_separator: SEP,
      config: { ...config, "after-char-count": 0 },
    },
  ),
  ["...", "BEGIN", "bar", "END", "..."].join("\n"),
);

assertEqual(
  excerpt(
    ["foo", "bar", "qux1", "qux2"].join(SEP),
    { start: { line: 1 }, end: { line: 1 } },
    {
      line_separator: SEP,
      config: { ...config, "after-char-count": 1 },
    },
  ),
  ["...", "BEGIN", "bar", "END", "qux1", "..."].join("\n"),
);

assertEqual(
  excerpt(
    ["foo", "bar", "qux1", "qux2"].join(SEP),
    { start: { line: 1 }, end: { line: 1 } },
    {
      line_separator: SEP,
      config: {
        ...config,
        "after-char-count": 1 / 0,
      },
    },
  ),
  ["...", "BEGIN", "bar", "END", "qux1", "qux2", "..."].join("\n"),
);

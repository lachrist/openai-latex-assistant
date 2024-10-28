# vscode-latex-assistant

Assistant writer for LaTeX in Visual Studio Code. The `latex-assistant.prompt`
command will prompt an AI provider with an excerpt of the current document. The
excerpt will contain the current selection upon which the AI should focus. It
will also contain some relevant context such as enclosing section commands and
surrounding text. Prompts can be added or deleted and are customizable.

## Default Revision Prompt

Given the document:

```latex
foo
rab
qux
```

If the current selection is `rab`, the revision prompt will produce the edit:

```latex
foo
rab
%%%%%%%%%%
bar
%%%%%%%%%%
qux
```

## Default Elaborate Prompt

Given the document:

```latex
foo
bar
qux
```

If the current selection is `bar`, the elaborate prompt will produce an edit
similar to:

```latex
foo
bar
%%%%%%%%%%
In programming, bar often refers to a variable or a placeholder within a function or method.
%%%%%%%%%%
qux
```

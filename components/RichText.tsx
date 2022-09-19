import isHotkey from "is-hotkey";
import React from "react";
import {
  createEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Transforms,
} from "slate";
import { withHistory } from "slate-history";
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useSlate,
  withReact,
} from "slate-react";
import {
  BlockType,
  CustomEditor,
  CustomElementType,
  MarkType,
} from "../custom-type";

type HotKeys = {
  [key: string]: MarkType;
};

const HOTKEYS: HotKeys = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code",
};

const LIST_TYPES: CustomElementType[] = ["numbered-list", "bulleted-list"];
const TEXT_ALIGN_TYPES: CustomElementType[] = [
  "left",
  "center",
  "right",
  "justify",
];

const RichText: React.FC = () => {
  const [value, setValue] = React.useState<Descendant[]>([
    {
      type: "paragraph",
      children: [
        { text: "This is editable " },
        { text: "rich", bold: true },
        { text: " text, " },
        { text: "much", italic: true },
        { text: " better than a " },
        { text: "<textarea>", code: true },
        { text: "!" },
      ],
    },
    {
      type: "paragraph",
      children: [
        {
          text: "Since it's rich text, you can do things like turn a selection of text ",
        },
        { text: "bold", bold: true },
        {
          text: ", or add a semantically rendered block quote in the middle of the page, like this:",
        },
      ],
    },
    {
      type: "block-quote",
      children: [{ text: "A wise quote." }],
    },
    {
      type: "paragraph",
      align: "center",
      children: [{ text: "Try it out for yourself!" }],
    },
  ]);

  const renderElement = React.useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );
  const renderLeaf = React.useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );
  const editor = React.useMemo<CustomEditor>(
    () => withHistory(withReact(createEditor())),
    []
  );

  const handleChange = React.useCallback((value: Descendant[]) => {
    setValue(value);
  }, []);

  const markList = React.useMemo(
    () => [
      {
        format: "bold",
        render: (active: boolean) => (
          <button style={{ color: active ? "red" : "blue" }}>{`Bold`}</button>
        ),
      },
      {
        format: "italic",
        render: (active: boolean) => (
          <button style={{ color: active ? "red" : "blue" }}>{`Italic`}</button>
        ),
      },
      {
        format: "underline",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`Underline`}</button>
        ),
      },
      {
        format: "code",
        render: (active: boolean) => (
          <button style={{ color: active ? "red" : "blue" }}>{`Code`}</button>
        ),
      },
    ],
    []
  );

  const blockList = React.useMemo(
    () => [
      {
        format: "paragraph",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`Paragraph`}</button>
        ),
      },
      {
        format: "heading-one",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`Heading-one`}</button>
        ),
      },
      {
        format: "heading-two",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`Heading-two`}</button>
        ),
      },
      {
        format: "block-quote",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`Block-quote`}</button>
        ),
      },
      {
        format: "numbered-list",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`Numbered-list`}</button>
        ),
      },
      {
        format: "bulleted-list",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`Bulleted-list`}</button>
        ),
      },
      {
        format: "list-item",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`List-item`}</button>
        ),
      },
      {
        format: "left",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`Align-left`}</button>
        ),
      },
      {
        format: "center",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`Align-center`}</button>
        ),
      },
      {
        format: "right",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`Align-right`}</button>
        ),
      },
      {
        format: "justify",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`Align-justify`}</button>
        ),
      },
    ],
    []
  );

  return (
    <Slate editor={editor} value={value} onChange={handleChange}>
      <div>
        {markList.map((item: any, index: number) => (
          <MarkButton key={index} format={item.format} render={item.render} />
        ))}
        {blockList.map((item: any, index: number) => (
          <BlockButton key={index} format={item.format} render={item.render} />
        ))}
      </div>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
      />
    </Slate>
  );
};

const toggleBlock = (editor: CustomEditor, format: BlockType) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type as any) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: any;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    };
  } else {
    newProperties = {
      type: isActive ? "paragraph" : isList ? "list-item" : format,
    };
  }
  Transforms.setNodes<SlateElement>(editor, newProperties);

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: CustomEditor, format: MarkType) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (
  editor: CustomEditor,
  format: BlockType,
  blockType: "align" | "type" = "type"
) => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  );

  return !!match;
};

const isMarkActive = (editor: CustomEditor, format: MarkType) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element: React.FC<RenderElementProps> = (props) => {
  const { attributes, children, element } = props;

  const style = { textAlign: element.align };
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case "heading-one":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    case "paragraph":
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf: React.FC<RenderLeafProps> = (props) => {
  const { attributes, leaf } = props;
  let { children } = props;

  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

type BlockButtonProps = {
  format: BlockType;
  render: (active: boolean) => JSX.Element;
};

const BlockButton: React.FC<BlockButtonProps> = (props) => {
  const { format, render } = props;
  const editor = useSlate();

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.preventDefault();
      toggleBlock(editor, format);
    },
    []
  );

  return (
    <div style={{ display: "inline-block" }} onMouseDown={handleMouseDown}>
      {render(
        isBlockActive(
          editor,
          format,
          TEXT_ALIGN_TYPES.includes(format) ? "align" : "type"
        )
      )}
    </div>
  );
};

type MarkButtonProps = {
  format: MarkType;
  render: (active: boolean) => JSX.Element;
};

const MarkButton: React.FC<MarkButtonProps> = (props) => {
  const { format, render } = props;
  const editor = useSlate();

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.preventDefault();
      toggleMark(editor, format);
    },
    []
  );

  return (
    <div style={{ display: "inline-block" }} onMouseDown={handleMouseDown}>
      {render(isMarkActive(editor, format))}
    </div>
  );
};

export default RichText;

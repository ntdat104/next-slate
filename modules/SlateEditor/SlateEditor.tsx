import isHotkey from "is-hotkey";
import isUrl from "is-url";
import React from "react";
import {
  createEditor,
  Descendant,
  Editor,
  Element as SlateElement,
  Range,
  Transforms,
} from "slate";
import { withHistory } from "slate-history";
import { jsx } from "slate-hyperscript";
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useFocused,
  useSelected,
  useSlate,
  useSlateStatic,
  withReact,
} from "slate-react";
import {
  BlockType,
  CustomEditor,
  CustomElement,
  CustomElementType,
  MarkType,
} from "../../custom-type";
import imageExtensions from "image-extensions";
import CHARACTERS from "./Characters.json";
import ReactDOM from "react-dom";

const ELEMENT_TAGS: any = {
  A: (el: any) => ({ type: "link", url: el.getAttribute("href") }),
  BLOCKQUOTE: () => ({ type: "quote" }),
  H1: () => ({ type: "heading-one" }),
  H2: () => ({ type: "heading-two" }),
  H3: () => ({ type: "heading-three" }),
  H4: () => ({ type: "heading-four" }),
  H5: () => ({ type: "heading-five" }),
  H6: () => ({ type: "heading-six" }),
  IMG: (el: any) => ({ type: "image", url: el.getAttribute("src") }),
  LI: () => ({ type: "list-item" }),
  OL: () => ({ type: "numbered-list" }),
  P: () => ({ type: "paragraph" }),
  PRE: () => ({ type: "code" }),
  UL: () => ({ type: "bulleted-list" }),
};

const TEXT_TAGS: any = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

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

interface Props {
  value: Descendant[];
  setValue: (value: Descendant[]) => void;
}

const SlateEditor: React.FC<Props> = (props) => {
  const { value, setValue } = props;
  const ref = React.useRef<HTMLDivElement | null>();
  const [target, setTarget] = React.useState<Range | null>(null);
  const [index, setIndex] = React.useState(0);
  const [search, setSearch] = React.useState("");

  const editor = React.useMemo<CustomEditor>(
    () =>
      withHtml(
        withMentions(
          withImages(withLink(withHistory(withReact(createEditor()))))
        )
      ),
    []
  );

  const chars = CHARACTERS.filter((c) =>
    c.toLowerCase().startsWith(search.toLowerCase())
  ).slice(0, 10);

  React.useEffect(() => {
    if (target && chars.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      el!.style.top = `${rect.top + window.pageYOffset + 24}px`;
      el!.style.left = `${rect.left + window.pageXOffset}px`;
    }
  }, [chars.length, editor, index, search, target]);

  const renderElement = React.useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );
  const renderLeaf = React.useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    for (const hotkey in HOTKEYS) {
      if (isHotkey(hotkey, event)) {
        event.preventDefault();
        const mark = HOTKEYS[hotkey];
        toggleMark(editor, mark);
      }
    }

    if (target) {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          const prevIndex = index >= chars.length - 1 ? 0 : index + 1;
          setIndex(prevIndex);
          break;
        case "ArrowUp":
          event.preventDefault();
          const nextIndex = index <= 0 ? chars.length - 1 : index - 1;
          setIndex(nextIndex);
          break;
        case "Tab":
        case "Enter":
          event.preventDefault();
          Transforms.select(editor, target);
          insertMention(editor, chars[index]);
          setTarget(null);
          break;
        case "Escape":
          event.preventDefault();
          setTarget(null);
          break;
      }
    }
  };
  const handleChange = React.useCallback((value: Descendant[]) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [start] = Range.edges(selection);
      const wordBefore = Editor.before(editor, start, { unit: "word" });
      const before = wordBefore && Editor.before(editor, wordBefore);
      const beforeRange = before && Editor.range(editor, before, start);
      const beforeText = beforeRange && Editor.string(editor, beforeRange);
      const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
      const after = Editor.after(editor, start);
      const afterRange = Editor.range(editor, start, after);
      const afterText = Editor.string(editor, afterRange);
      const afterMatch = afterText.match(/^(\s|$)/);

      if (beforeMatch && afterMatch) {
        setTarget(beforeRange);
        setSearch(beforeMatch[1]);
        setIndex(0);
        return;
      }
    }

    setTarget(null);
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
      {
        format: "strikethrough",
        render: (active: boolean) => (
          <button
            style={{ color: active ? "red" : "blue" }}
          >{`Strikethrough`}</button>
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
        <LinkButton />
        <InsertImageButton />
      </div>
      <Editable
        style={{ border: "1px solid black", marginTop: 14, padding: 20 }}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck={true}
        autoFocus={true}
        onKeyDown={onKeyDown}
      />
      {target && chars.length > 0 && (
        <Portal>
          <div
            ref={ref as any}
            style={{
              top: "-9999px",
              left: "-9999px",
              position: "absolute",
              zIndex: 1,
              padding: "3px",
              background: "white",
              borderRadius: "4px",
              boxShadow: "0 1px 5px rgba(0,0,0,.2)",
            }}
            data-cy="mentions-portal"
          >
            {chars.map((char, i) => (
              <div
                key={char}
                style={{
                  padding: "1px 3px",
                  borderRadius: "3px",
                  background: i === index ? "#B4D5FF" : "transparent",
                }}
              >
                {char}
              </div>
            ))}
          </div>
        </Portal>
      )}
    </Slate>
  );
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
    case "heading-three":
      return (
        <h3 style={style} {...attributes}>
          {children}
        </h3>
      );
    case "heading-four":
      return (
        <h4 style={style} {...attributes}>
          {children}
        </h4>
      );
    case "heading-five":
      return (
        <h5 style={style} {...attributes}>
          {children}
        </h5>
      );
    case "heading-six":
      return (
        <h6 style={style} {...attributes}>
          {children}
        </h6>
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
    case "link":
      return (
        <a
          href={element.url}
          {...attributes}
          style={{
            color: "blue",
            textDecoration: "underline",
          }}
        >
          {children}
        </a>
      );
    case "image":
      return <ImageElement {...props} />;
    case "mention":
      return <Mention {...props} />;
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

  if (leaf.strikethrough) {
    children = <del>{children}</del>;
  }

  return <span {...attributes}>{children}</span>;
};

const deserialize = (el: any) => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return "\n";
  }

  const { nodeName } = el;
  let parent = el;

  if (
    nodeName === "PRE" &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === "CODE"
  ) {
    parent = el.childNodes[0];
  }
  let children: any = Array.from(parent.childNodes).map(deserialize).flat();

  if (children.length === 0) {
    children = [{ text: "" }];
  }

  if (el.nodeName === "BODY") {
    return jsx("fragment", {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx("element", attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map((child: any) => jsx("text", attrs, child));
  }

  return children;
};

const withHtml = (editor: CustomEditor) => {
  const { insertData, isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element.type === "link" ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element);
  };

  editor.insertData = (data) => {
    const html = data.getData("text/html");

    if (html) {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const fragment = deserialize(parsed.body);
      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};

const ImageElement: React.FC<RenderElementProps> = (props) => {
  const { attributes, children, element } = props;
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      {children}
      <img
        src={element.url}
        style={{
          display: "block",
          maxWidth: "100%",
          width: "100%",
          boxShadow: `${selected && focused ? "0 0 0 2px blue;" : "none"}`,
        }}
      />
    </div>
  );
};

// -------------------- START_BLOCK_PLUGIN --------------------//

interface BlockButtonProps {
  format: BlockType;
  render: (active: boolean) => JSX.Element;
}

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

// -------------------- END_BLOCK_PLUGIN --------------------//

// -------------------- START_MARK_PLUGIN --------------------//

interface MarkButtonProps {
  format: MarkType;
  render: (active: boolean) => JSX.Element;
}

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

const isMarkActive = (editor: CustomEditor, format: MarkType) => {
  const marks: any = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor: CustomEditor, format: MarkType) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// -------------------- END_MARK_PLUGIN --------------------//

// -------------------- START_LINK_PLUGIN --------------------//

const LinkButton: React.FC = () => {
  const editor = useSlate();
  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.preventDefault();

      if (isLinkActive(editor)) {
        unwrapLink(editor);
        return;
      }

      const url = window.prompt("Enter the URL of the link:");
      if (!url) return;
      insertLink(editor, url);
    },
    []
  );

  return (
    <div style={{ display: "inline-block" }} onMouseDown={handleMouseDown}>
      <button
        style={{
          color: isLinkActive(editor) ? "red" : "blue",
        }}
      >
        Link
      </button>
    </div>
  );
};

const withLink = (editor: CustomEditor) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = (element: SlateElement) =>
    element.type === "link" || isInline(element);

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data) => {
    const text = data.getData("text/plain");

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

const isLinkActive = (editor: CustomEditor) => {
  const [link]: any = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
  return !!link;
};

const insertLink = (editor: CustomEditor, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
};

const wrapLink = (editor: CustomEditor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link: CustomElement = {
    type: "link",
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
    Transforms.move(editor, { unit: "offset" });
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: "end" });
  }
};
const unwrapLink = (editor: CustomEditor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "link",
  });
};

// -------------------- END_LINK_PLUGIN --------------------//

// -------------------- START_IMAGE_PLUGIN --------------------//

const InsertImageButton: React.FC = () => {
  const editor = useSlateStatic();

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      event.preventDefault();
      const url = window.prompt("Enter the URL of the image:");
      if (url && !isImageUrl(url)) {
        alert("URL is not an image");
        return;
      }
      url && insertImage(editor, url);
    },
    []
  );

  const handleChangeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      insertImage(editor, url);
    }
    e.target.value = "";
  };

  return (
    <>
      <div style={{ display: "inline-block" }} onMouseDown={handleMouseDown}>
        <button>Image</button>
      </div>
      <input type={`file`} accept={`image/*`} onChange={handleChangeUpload} />
    </>
  );
};

const withImages = (editor: CustomEditor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === "image" ? true : isVoid(element);
  };

  editor.insertData = (data) => {
    const text = data.getData("text/plain");
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of files as any) {
        const reader = new FileReader();
        const [mime] = file.type.split("/");

        if (mime === "image") {
          reader.addEventListener("load", () => {
            const url = reader.result;
            insertImage(editor, url as string);
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};

const isImageUrl = (url: string) => {
  if (!url) return false;
  if (!isUrl(url)) return false;
  const ext: any = new URL(url).pathname.split(".").pop();
  return imageExtensions.includes(ext);
};

const insertImage = (editor: CustomEditor, url: string) => {
  const text = { text: "" };
  const image: CustomElement = { type: "image", url, children: [text] };
  Transforms.insertNodes(editor, image);
};

// -------------------- END_IMAGE_PLUGIN --------------------//

// -------------------- START_MENTION_PLUGIN --------------------//

export const Portal: React.FC<{ children: React.ReactNode }> = (props) => {
  const { children } = props;
  return typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
};

const Mention: React.FC<RenderElementProps> = (props) => {
  const { attributes, children, element } = props;
  const selected = useSelected();
  const focused = useFocused();
  return (
    <span
      {...attributes}
      contentEditable={false}
      data-cy={`mention-${element.character?.replace(" ", "-")}`}
      style={{
        padding: "3px 3px 2px",
        margin: "0 1px",
        verticalAlign: "baseline",
        display: "inline-block",
        borderRadius: "4px",
        backgroundColor: "#eee",
        fontSize: "0.9em",
        boxShadow: selected && focused ? "0 0 0 2px #B4D5FF" : "none",
      }}
    >
      {children}@{element.character}
    </span>
  );
};

const withMentions = (editor: CustomEditor) => {
  const { isInline, isVoid } = editor;

  editor.isInline = (element) => {
    return element.type === "mention" ? true : isInline(element);
  };

  editor.isVoid = (element) => {
    return element.type === "mention" ? true : isVoid(element);
  };

  return editor;
};

const insertMention = (editor: CustomEditor, character: string) => {
  const mention: CustomElement = {
    type: "mention",
    character,
    children: [{ text: "" }],
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
};

// -------------------- END_MENTION_PLUGIN --------------------//
export default SlateEditor;

import React from "react";
import {
  createEditor,
  Descendant,
  Editor,
  Text,
  Transforms,
  Element as SlateElement,
  Node,
} from "slate";
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from "slate-react";
import { CustomEditor, CustomElement } from "../../custom-type";

interface Props {
  value: Descendant[];
  setValue: (value: Descendant[]) => void;
  editor: CustomEditor;
}

const TestEditor: React.FC<Props> = (props): JSX.Element => {
  const { value, setValue, editor } = props;

  const handleChange = React.useCallback((value: Descendant[]) => {
    setValue(value);
  }, []);

  const handleOnKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!event.ctrlKey) {
        return;
      }

      switch (event.key) {
        // When "`" is pressed, keep our existing code block logic.
        case "`": {
          event.preventDefault();
          const [match]: any = Editor.nodes(editor, {
            match: (n: any) => n.type === "code",
          });
          Transforms.setNodes(
            editor,
            { type: match ? "paragraph" : "code" },
            { match: (n) => Editor.isBlock(editor, n) }
          );
          break;
        }

        // When "B" is pressed, bold the text in the selection.
        case "b": {
          event.preventDefault();
          Transforms.setNodes(
            editor,
            { bold: true },
            // Apply it to text nodes, and split the text node up if the
            // selection is overlapping only part of it.
            { match: (n) => Text.isText(n), split: true }
          );
          break;
        }
      }
    },
    []
  );

  const renderElement = React.useCallback((props: RenderElementProps) => {
    const { attributes, element, children } = props;

    switch (element.type) {
      case "code":
        return (
          <pre {...attributes}>
            <code>{children}</code>
          </pre>
        );
      case "link":
        return (
          <a
            {...attributes}
            href={element.url}
            style={{
              color: "blue",
              textDecoration: "underline",
            }}
          >
            {children}
          </a>
        );
      default:
        return <p {...attributes}>{children}</p>;
    }
  }, []);

  const renderLeaf = React.useCallback((props: RenderLeafProps) => {
    const { attributes, children, leaf, text } = props;

    return (
      <span
        {...attributes}
        style={{ fontWeight: leaf.bold ? "bold" : "normal" }}
      >
        {children}
      </span>
    );
  }, []);

  const handleClick = () => {
    Transforms.insertNodes(editor, {
      type: "link",
      url: "https://www.facebook.com/",
      children: [{ text: "123" }],
    });
  };

  console.log(editor);

  return (
    <>
      <Slate editor={editor} value={value} onChange={handleChange}>
        <Editable
          onKeyDown={handleOnKeyDown}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </Slate>
      <button onClick={handleClick}>{`Click`}</button>
    </>
  );
};

export default TestEditor;

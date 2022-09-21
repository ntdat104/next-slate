import {
  Text,
  createEditor,
  Node,
  Element,
  Editor,
  Descendant,
  BaseEditor,
} from "slate";
import { ReactEditor } from "slate-react";
import { HistoryEditor } from "slate-history";

export type MarkType =
  | "bold"
  | "italic"
  | "underline"
  | "code"
  | "strikethrough"
  | "link"
  | "image"
  | "mention";

export type BlockType =
  | "paragraph"
  | "heading-one"
  | "heading-two"
  | "heading-three"
  | "heading-four"
  | "heading-five"
  | "heading-six"
  | "block-quote";

export type ListType = "numbered-list" | "bulleted-list" | "list-item";

export type AlignType = "left" | "center" | "right" | "justify";

export type CustomElementType = MarkType | BlockType | AlignType | ListType;

export type CustomElement = {
  type?: CustomElementType;
  character?: string;
  align?: AlignType;
  url?: string;
  children: Descendant[];
};

export type CustomText = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  strikethrough?: boolean;
  text: string;
};

export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor;

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

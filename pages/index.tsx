import type { NextPage } from "next";
import React from "react";
import { Descendant } from "slate";
import dynamic from "next/dynamic";

const ReactJson = dynamic(() => import("react-json-view"), {
  loading: () => <p>Loading ...</p>,
  ssr: false,
});

const SlateEditor = dynamic(() => import("../modules/SlateEditor"), {
  loading: () => <p>Loading ...</p>,
  ssr: false,
});

const Home: NextPage = () => {
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
      children: [
        { text: "Try mentioning characters, like " },
        {
          type: "mention",
          character: "thaokv",
          children: [{ text: "" }],
        },
        { text: " or " },
        {
          type: "mention",
          character: "ntdat104",
          children: [{ text: "" }],
        },
        { text: "!" },
      ],
    },
    {
      type: "paragraph",
      align: "center",
      children: [{ text: "Try it out for yourself!" }],
    },
  ]);

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ width: "calc(50% - 10px)" }}>
        <SlateEditor value={value} setValue={setValue} />
      </div>
      <div style={{ width: "calc(50% - 10px)" }}>
        <ReactJson src={value} />
      </div>
    </div>
  );
};

export default Home;

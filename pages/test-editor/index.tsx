import { NextPage } from "next";
import dynamic from "next/dynamic";
import React from "react";
import { createEditor, Descendant } from "slate";
import { withReact } from "slate-react";
import TestEditor from "../../modules/TestEditor";

const ReactJson = dynamic(() => import("react-json-view"), {
  loading: () => <p>Loading ...</p>,
  ssr: false,
});

const TestEditorPage: NextPage = () => {
  const [editor] = React.useState(() => withReact(createEditor()));
  const [value, setValue] = React.useState<Descendant[]>([
    {
      type: "paragraph",
      children: [{ text: "A line of text in a paragraph." }],
    },
  ]);

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ width: "calc(50% - 10px)" }}>
        <TestEditor value={value} setValue={setValue} editor={editor} />
      </div>
      <div style={{ width: "calc(50% - 10px)" }}>
        <ReactJson src={value} />
      </div>
    </div>
  );
};

export default TestEditorPage;

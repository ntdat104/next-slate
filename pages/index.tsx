import type { NextPage } from "next";
import SlateEditor from "../modules/SlateEditor";

const Home: NextPage = () => {
  return (
    <div style={{ maxWidth: 800, margin: 10 }}>
      <SlateEditor />
    </div>
  );
};

export default Home;

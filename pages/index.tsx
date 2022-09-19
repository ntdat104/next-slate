import type { NextPage } from "next";
import RichText from "../components/RichText";
import SlateEditor from "../components/SlateEditor";

const Home: NextPage = () => {
  return (
    <>
      <SlateEditor />
      <RichText />
    </>
  );
};

export default Home;

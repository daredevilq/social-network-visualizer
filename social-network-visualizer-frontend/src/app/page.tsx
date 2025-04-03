import React from "react";
import ReactForceGraph from "@/app/ReactForceGraph";
import AuthorMentionsGraph from "./AuthorMentionsGraph";
import AuthorDegreeCentralityGraph from "./AuthorDegreeCentralityGraph";

export default function Home() {
  return (
      <>
        <div>
          {/* <ReactForceGraph /> */}
          {/* <AuthorMentionsGraph/> */}
          <AuthorDegreeCentralityGraph/>
        </div>
      </>
  );
}

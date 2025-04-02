import React from "react";
import ReactForceGraph from "@/app/ReactForceGraph";
import AuthorMentionsGraph from "./AuthorMentionsGraph";

export default function Home() {
  return (
      <>
        <div>
          {/* <ReactForceGraph /> */}
          <AuthorMentionsGraph/>
        </div>
      </>
  );
}

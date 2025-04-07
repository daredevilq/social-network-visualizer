"use client";
import React from "react";
import GraphContainer from "@/app/GraphContainer.jsx";
import '../app/globals.css';
import RightSidebar from "@/app/component/RideSideBar";

export default function Home() {

    return (
        <>
            <GraphContainer/>
            <RightSidebar/>
        </>
    );
}

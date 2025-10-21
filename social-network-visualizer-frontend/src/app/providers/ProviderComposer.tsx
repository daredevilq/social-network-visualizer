"use client";

import React from "react";

type ProviderProps = {
  children: React.ReactNode;
};

type ComposerProps = {
  providers: Array<React.ComponentType<ProviderProps>>;
  children: React.ReactNode;
};

export const ProviderComposer = ({ providers, children }: ComposerProps) => {
  return (
    <>
      {providers.reduceRight((acc, Provider) => {
        return <Provider>{acc}</Provider>;
      }, children)}
    </>
  );
};

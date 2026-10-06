"use client";

import { createContext, useContext, type ReactNode, type RefObject } from "react";

type PreviewActivity = {
  active: boolean;
  returnFocus?: RefObject<HTMLElement | null>;
};

const PreviewActivityContext = createContext<PreviewActivity>({ active: true });

export function PreviewActivityProvider({
  active,
  returnFocus,
  children,
}: {
  active: boolean;
  returnFocus: RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  return (
    <PreviewActivityContext.Provider value={{ active, returnFocus }}>
      {children}
    </PreviewActivityContext.Provider>
  );
}

export function usePreviewActivity(): PreviewActivity {
  return useContext(PreviewActivityContext);
}

"use client";
import { useCallback } from "react";
import { experimental_useSearch as useSearch } from "fumadocs-core/search/client";
import {
  SearchDialog,
  SearchDialogOverlay,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogClose,
  SearchDialogList,
  SearchDialogFooter,
} from "fumadocs-ui/components/dialog/search";
export default function MatchedSearchDialog({ scopeIndex, ...props }) {
  const run = useCallback(
    async (query) => {
      const q = query.trim().toLowerCase();
      if (!q) return [];
      const { default: index } = await import(
        /* webpackIgnore: true */ `/_search/substring-${scopeIndex}.js`
      );
      return index
        .filter((item) => item.text.includes(q))
        .map((item) => ({ id: item.href, url: item.href, type: "page", content: item.title }));
    },
    [scopeIndex],
  );
  const search = useSearch(run, { delayMs: 0 });
  return (
    <SearchDialog {...search} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
      </SearchDialogContent>
      <SearchDialogFooter />
    </SearchDialog>
  );
}

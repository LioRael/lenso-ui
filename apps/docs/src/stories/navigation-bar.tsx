"use client";
import { useRef, useState } from "react";
import { List, NavigationBar, Toolbar } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

export interface NavigationBarStoryProps {
  large: boolean;
  edge: "uniform" | "soft" | "none";
}
const styles = stylex.create({
  scroll: {
    width: "100%",
    maxWidth: 560,
    height: 340,
    overflowY: "auto",
    position: "relative",
    backgroundColor: "var(--lenso-background-grouped-primary)",
  },
  body: { padding: 16 },
  description: { color: "var(--lenso-label-secondary)", marginBlockEnd: 16 },
});
const albums = [
  "Favorites",
  "Recently Added",
  "Travel",
  "Family",
  "Landscapes",
  "Portraits",
  "Videos",
  "Screenshots",
];
export function NavigationBarStory({ large, edge }: NavigationBarStoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [album, setAlbum] = useState<string | null>(null);
  const [reversed, setReversed] = useState(false);
  const open = (next: string | null) => {
    setAlbum(next);
    scrollRef.current?.scrollTo({ top: 0 });
  };
  return (
    <div ref={scrollRef} {...stylex.props(styles.scroll)}>
      <NavigationBar
        title={album ?? "Albums"}
        large={large}
        edge={edge}
        level={2}
        scrollRef={scrollRef}
        onBack={album ? () => open(null) : undefined}
        backLabel="Back to albums"
        trailing={
          !album && (
            <Toolbar.Group>
              <Toolbar.Button onClick={() => setReversed(!reversed)}>Reverse order</Toolbar.Button>
            </Toolbar.Group>
          )
        }
      />
      <div {...stylex.props(styles.body)}>
        <p {...stylex.props(styles.description)}>
          {album
            ? "This demo album is empty. Go back to choose another album."
            : "Choose an album, or scroll to move the large title into the navigation bar."}
        </p>
        {!album && (
          <List>
            {(reversed ? albums.toReversed() : albums).map((name) => (
              <List.Item key={name}>
                <List.Action onClick={() => open(name)}>
                  <List.Content>
                    <List.Title>{name}</List.Title>
                  </List.Content>
                </List.Action>
              </List.Item>
            ))}
          </List>
        )}
      </div>
    </div>
  );
}

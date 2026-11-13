"use client";
import { useState } from "react";
import * as stylex from "@stylexjs/stylex";
import { ShareSheet, Button, List, Avatar } from "@lenso/ui";
import {
  Envelope,
  Comment,
  FileText,
  Ellipsis,
  Copy,
  ArrowDownToLine,
  Star,
  Pencil,
  Printer,
} from "@gravity-ui/icons";
const styles = stylex.create({
  image: { width: "100%", height: "100%", objectFit: "cover" },
  status: { display: "block", paddingInline: 16, fontSize: 13 },
  avatar: { width: 66, height: 66, borderRadius: "50%" },
  circularIcon: { borderRadius: "50%" },
});
const photoActions = [
  { name: "Copy link", Icon: Copy },
  { name: "Save photo", Icon: ArrowDownToLine },
  { name: "Add to Favorites", Icon: Star },
  { name: "Add to Notes", Icon: FileText },
];
export interface ShareSheetStoryProps {
  dim: boolean;
}
export function ShareSheetStory({ dim }: ShareSheetStoryProps) {
  const [result, setResult] = useState("Choose an action");
  return (
    <ShareSheet dim={dim}>
      <ShareSheet.Trigger render={<Button />}>Share photo</ShareSheet.Trigger>
      <ShareSheet.Backdrop />
      <ShareSheet.Content>
        <ShareSheet.Handle />
        <ShareSheet.Header>
          <ShareSheet.Thumbnail>
            <img
              src="/assets/demo/illustrations/landscape.svg"
              alt=""
              {...stylex.props(styles.image)}
            />
          </ShareSheet.Thumbnail>
          <ShareSheet.Metadata>
            <ShareSheet.Title>Mountain sunrise</ShareSheet.Title>
            <ShareSheet.Description>1 photo</ShareSheet.Description>
          </ShareSheet.Metadata>
          <ShareSheet.Close />
        </ShareSheet.Header>
        <ShareSheet.Body>
          <ShareSheet.Targets aria-label="Contacts">
            {["Alex", "Sam", "Morgan", "Taylor", "Robin"].map((name) => (
              <ShareSheet.Target
                key={name}
                onClick={() => setResult(`${name} selected — demo only`)}
              >
                <ShareSheet.TargetIcon contact>
                  <Avatar xstyle={styles.avatar}>
                    <Avatar.Fallback>{name[0]}</Avatar.Fallback>
                  </Avatar>
                </ShareSheet.TargetIcon>
                {name}
              </ShareSheet.Target>
            ))}
          </ShareSheet.Targets>
          <ShareSheet.Targets aria-label="Apps">
            {[
              { name: "Messages", Icon: Comment },
              { name: "Mail", Icon: Envelope },
              { name: "Notes", Icon: FileText },
              { name: "More", Icon: Ellipsis },
            ].map(({ name, Icon }) => (
              <ShareSheet.Target
                key={name}
                onClick={() => setResult(`${name} selected — demo only`)}
              >
                <ShareSheet.TargetIcon>
                  <Icon width={30} height={30} aria-hidden="true" />
                </ShareSheet.TargetIcon>
                {name}
              </ShareSheet.Target>
            ))}
          </ShareSheet.Targets>
          <ShareSheet.Targets aria-label="Quick actions">
            {photoActions.map(({ name, Icon }) => (
              <ShareSheet.Target key={name} onClick={() => setResult(`${name} — demo only`)}>
                <ShareSheet.TargetIcon xstyle={styles.circularIcon}>
                  <Icon width={30} height={30} aria-hidden="true" />
                </ShareSheet.TargetIcon>
                {name}
              </ShareSheet.Target>
            ))}
          </ShareSheet.Targets>
          {[
            { label: "Photo actions", actions: photoActions },
            {
              label: "Editing and printing",
              actions: [
                { name: "Markup", Icon: Pencil },
                { name: "Print", Icon: Printer },
              ],
            },
          ].map(({ label, actions }) => (
            <ShareSheet.ActionGroup key={label} aria-label={label}>
              {actions.map(({ name, Icon }) => (
                <ShareSheet.Action key={name} onClick={() => setResult(`${name} — demo only`)}>
                  <List.Leading>
                    <Icon width={32} height={22} aria-hidden="true" />
                  </List.Leading>
                  <List.Content>
                    <List.Title>{name}</List.Title>
                  </List.Content>
                </ShareSheet.Action>
              ))}
            </ShareSheet.ActionGroup>
          ))}
          <output {...stylex.props(styles.status)}>{result}</output>
        </ShareSheet.Body>
      </ShareSheet.Content>
    </ShareSheet>
  );
}

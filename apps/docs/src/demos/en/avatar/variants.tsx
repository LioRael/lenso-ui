"use client";
// Adapted from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e), Apache-2.0.
import { Person } from "@gravity-ui/icons";
import { Avatar, Separator } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";
import { s } from "../card/display.stylex";

export function Variants() {
  const colors = ["accent", "default", "success", "warning", "danger"] as const;
  const variants = [
    { content: "AG", label: "letter", type: "letter" },
    { content: "AG", label: "letter soft", type: "letter-soft" },
    { content: <Person />, label: "icon", type: "icon" },
    { content: <Person />, label: "icon soft", type: "icon-soft" },
    {
      content: [
        "https://img.heroui.chat/image/avatar?w=400&h=400&u=3",
        "https://img.heroui.chat/image/avatar?w=400&h=400&u=4",
        "https://img.heroui.chat/image/avatar?w=400&h=400&u=5",
        "https://img.heroui.chat/image/avatar?w=400&h=400&u=8",
        "https://img.heroui.chat/image/avatar?w=400&h=400&u=16",
      ],
      label: "img",
      type: "img",
    },
  ] as const;
  return (
    <div {...stylex.props(s.column4)}>
      <div {...stylex.props(s.row3)}>
        <div {...stylex.props(s.labelCell)} />
        {colors.map((color) => (
          <div key={color} {...stylex.props(s.avatarCell)}>
            <span {...stylex.props(s.textXs, s.muted, s.capitalize)}>{color}</span>
          </div>
        ))}
      </div>
      <Separator />
      {variants.map((variant) => (
        <div key={variant.label} {...stylex.props(s.row3)}>
          <div {...stylex.props(s.labelCell, s.textSm, s.muted)}>{variant.label}</div>
          {colors.map((color, colorIndex) => (
            <div key={color} {...stylex.props(s.avatarCell)}>
              <Avatar color={color} variant={variant.type.includes("soft") ? "soft" : "default"}>
                {variant.type === "img" ? (
                  <>
                    <Avatar.Image alt={`Avatar ${color}`} src={variant.content[colorIndex] ?? ""} />
                    <Avatar.Fallback>{color.charAt(0).toUpperCase()}</Avatar.Fallback>
                  </>
                ) : (
                  <Avatar.Fallback>{variant.content}</Avatar.Fallback>
                )}
              </Avatar>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

import { avatarSizes, avatarColors } from "@lenso/tokens/avatar";
import { avatarGroupStyles } from "@lenso/tokens/avatar-group";
import { cloneVNode, defineComponent, h, type PropType } from "vue";
import { AvatarRoot, AvatarFallback } from "./avatar.js";
import { partAttributes, type HtmlPart, type StyleXArgument } from "./parts.js";
import { slotElements } from "./slot-elements.js";

type GroupOptions = {
  size?: keyof typeof avatarSizes;
  color?: keyof typeof avatarColors;
  variant?: "default" | "soft";
  isGrid?: boolean;
  max?: number;
  overlap?: "clip" | "ring";
};
export const AvatarGroupCount = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        AvatarRoot,
        {
          "data-lenso-slot": "avatar-group-count",
          ...attrs,
          xstyle: [avatarGroupStyles.count, attrs["xstyle"] as StyleXArgument],
        },
        { default: () => h(AvatarFallback, {}, slots) },
      );
  },
}) as unknown as typeof AvatarRoot;
export const AvatarGroupRoot = defineComponent({
  inheritAttrs: false,
  props: {
    size: String as PropType<GroupOptions["size"]>,
    color: String as PropType<GroupOptions["color"]>,
    variant: String as PropType<GroupOptions["variant"]>,
    isGrid: Boolean,
    max: Number,
    overlap: { type: String, default: "clip" },
  },
  setup(props, { attrs, slots }) {
    return () => {
      const items = slotElements(slots["default"]?.());
      const avatars = items.filter((item) => item.type !== AvatarGroupCount);
      const counts = items.filter((item) => item.type === AvatarGroupCount);
      const visible = avatars.slice(
        0,
        props.max === undefined ? avatars.length : Math.max(0, props.max),
      );
      const remaining = avatars.length - visible.length;
      if (counts.length) visible.push(...counts);
      else if (remaining)
        visible.push(
          h(AvatarGroupCount, { key: "lenso-count" }, { default: () => "+" + remaining }),
        );
      return h(
        "div",
        partAttributes(
          "avatar-group",
          [avatarGroupStyles.root, props.isGrid && avatarGroupStyles.grid],
          attrs,
        ),
        visible.map((item, index) => {
          const clipped =
            !props.isGrid &&
            props.overlap === "clip" &&
            index < visible.length - 1 &&
            item.type !== AvatarGroupCount;
          return cloneVNode(item, {
            ...(item.type === AvatarRoot || item.type === AvatarGroupCount
              ? {
                  size: item.props?.["size"] ?? props.size,
                  color: item.props?.["color"] ?? props.color,
                  variant: item.props?.["variant"] ?? props.variant,
                  clipped,
                }
              : {}),
            xstyle: [
              !props.isGrid && index > 0 && avatarGroupStyles.overlap,
              !props.isGrid && props.overlap === "ring" && avatarGroupStyles.ring,
              clipped && avatarGroupStyles.clip,
              item.props?.["xstyle"],
            ],
          });
        }),
      );
    };
  },
}) as unknown as HtmlPart<"div", GroupOptions>;

export const AvatarGroup: typeof AvatarGroupRoot & {
  Root: typeof AvatarGroupRoot;
  Count: typeof AvatarGroupCount;
} = Object.assign(AvatarGroupRoot, {
  Root: AvatarGroupRoot,
  Count: AvatarGroupCount,
});

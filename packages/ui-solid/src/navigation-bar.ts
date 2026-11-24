import { navigationBarStyles } from "@lenso/tokens/navigation-bar";
import {
  Toolbar as SdkRoot,
  ToolbarGroup as SdkLeading,
  ToolbarGroup as SdkTrailing,
  ToolbarButton as SdkBack,
} from "@ui-sdk/solid/toolbar";
import { htmlPart, sdkPart, type StyledPart } from "./parts.js";

export const NavigationBarRoot: StyledPart<typeof SdkRoot> = sdkPart(
  SdkRoot,
  "navigation-bar",
  () => navigationBarStyles.root,
);
export const NavigationBarLeading: StyledPart<typeof SdkLeading> = sdkPart(
  SdkLeading,
  "navigation-bar-leading",
  () => navigationBarStyles.side,
);
export const NavigationBarTrailing: StyledPart<typeof SdkTrailing> = sdkPart(
  SdkTrailing,
  "navigation-bar-trailing",
  () => [navigationBarStyles.side, navigationBarStyles.trailing],
);
export const NavigationBarTitle = htmlPart(
  "div",
  "navigation-bar-title",
  () => navigationBarStyles.title,
);
export const NavigationBarLargeTitle = htmlPart(
  "h1",
  "navigation-bar-large-title",
  () => navigationBarStyles.largeTitle,
);
export const NavigationBarBack: StyledPart<typeof SdkBack> = sdkPart(
  SdkBack,
  "navigation-bar-back",
  () => undefined,
);
export const NavigationBarBackIcon = htmlPart(
  "span",
  "navigation-bar-back-icon",
  () => navigationBarStyles.backIcon,
);

export const NavigationBar: typeof NavigationBarRoot & {
  Root: typeof NavigationBarRoot;
  Leading: typeof NavigationBarLeading;
  Trailing: typeof NavigationBarTrailing;
  Title: typeof NavigationBarTitle;
  LargeTitle: typeof NavigationBarLargeTitle;
  Back: typeof NavigationBarBack;
  BackIcon: typeof NavigationBarBackIcon;
} = Object.assign(NavigationBarRoot, {
  Root: NavigationBarRoot,
  Leading: NavigationBarLeading,
  Trailing: NavigationBarTrailing,
  Title: NavigationBarTitle,
  LargeTitle: NavigationBarLargeTitle,
  Back: NavigationBarBack,
  BackIcon: NavigationBarBackIcon,
});

import NavigationBarRoot from "./navigation-bar-root.svelte";
import NavigationBarLeading from "./navigation-bar-leading.svelte";
import NavigationBarTrailing from "./navigation-bar-trailing.svelte";
import NavigationBarTitle from "./navigation-bar-title.svelte";
import NavigationBarLargeTitle from "./navigation-bar-large-title.svelte";
import NavigationBarBack from "./navigation-bar-back.svelte";
import NavigationBarBackIcon from "./navigation-bar-back-icon.svelte";

export {
  NavigationBarRoot,
  NavigationBarLeading,
  NavigationBarTrailing,
  NavigationBarTitle,
  NavigationBarLargeTitle,
  NavigationBarBack,
  NavigationBarBackIcon,
};
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

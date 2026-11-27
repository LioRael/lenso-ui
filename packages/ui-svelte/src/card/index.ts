import CardRoot from "./card-root.svelte";
import CardHeader from "./card-header.svelte";
import CardTitle from "./card-title.svelte";
import CardDescription from "./card-description.svelte";
import CardContent from "./card-content.svelte";
import CardFooter from "./card-footer.svelte";

export { CardRoot, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export const Card: typeof CardRoot & {
  Root: typeof CardRoot;
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
} = Object.assign(CardRoot, {
  Root: CardRoot,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});

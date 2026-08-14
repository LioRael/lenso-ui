export type ClassName<State> = string | ((state: State) => string | undefined);

export function mergeClassName<State>(
  generated?: string,
  className?: ClassName<State>,
): ClassName<State> {
  if (typeof className === "function") {
    return (state) => [generated, className(state)].filter(Boolean).join(" ");
  }
  return [generated, className].filter(Boolean).join(" ");
}

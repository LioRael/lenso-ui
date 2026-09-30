export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export async function settleLayout(): Promise<void> {
  await document.fonts.ready;
  await nextFrame();
  await nextFrame();
}

export function useDocumentTheme(theme: string): () => void {
  const previous = document.documentElement.getAttribute("data-theme");
  document.documentElement.setAttribute("data-theme", theme);
  return () => {
    if (previous === null) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", previous);
  };
}

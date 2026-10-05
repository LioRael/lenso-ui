import { StrictMode } from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { AsynchronousLoading } from "../../../../../apps/docs/src/demos/en/select/asynchronous-loading";

interface PendingRequest {
  url: string;
  signal: AbortSignal | null | undefined;
  respond(page: { next: string | null; results: { name: string }[] }): void;
}

// A query-race workflow does not prove StrictMode mount cancellation or that a
// cursor state commit waits for an explicit pagination action.
test("async Select rejects cancelled mount responses and paginates only on explicit action", async () => {
  const requests: PendingRequest[] = [];
  vi.stubGlobal(
    "fetch",
    (input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((done) => {
        requests.push({
          url: String(input),
          signal: init?.signal,
          respond: (page) => done(new Response(JSON.stringify(page))),
        });
      }),
  );
  try {
    const screen = await render(
      <StrictMode>
        <AsynchronousLoading />
      </StrictMode>,
    );
    await expect.poll(() => requests.length).toBe(2);
    expect(requests[0]!.signal?.aborted).toBe(true);
    requests[1]!.respond({
      next: "https://pokeapi.co/api/v2/pokemon?page=2",
      results: [{ name: "current" }],
    });
    await screen.getByRole("combobox", { name: "Pick a Pokemon" }).click();
    const more = screen.getByRole("button", { name: "Load more", exact: true });
    await expect.element(more).toBeVisible();
    requests[0]!.respond({ next: null, results: [{ name: "stale" }] });
    await new Promise<void>((done) =>
      requestAnimationFrame(() => requestAnimationFrame(() => done())),
    );
    await expect
      .element(screen.getByRole("option", { name: "current", exact: true }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("option", { name: "stale", exact: true }))
      .not.toBeInTheDocument();
    expect(requests).toHaveLength(2);
    await more.click();
    await expect.poll(() => requests.length).toBe(3);
    expect(requests[2]!.url).toBe("https://pokeapi.co/api/v2/pokemon?page=2");
    requests[2]!.respond({ next: null, results: [{ name: "last" }] });
    await expect.element(screen.getByRole("option", { name: "last", exact: true })).toBeVisible();
    await expect.element(more).not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("option", { name: "current", exact: true }))
      .toBeVisible();
    await screen.unmount();
  } finally {
    vi.unstubAllGlobals();
  }
});

import assert from "node:assert/strict";

// Geometry and textContent both pass when WebKit paints the lens over the label.
export async function assertSelectionInk(page, list, label) {
  const selected = list.locator('[role="tab"][aria-selected="true"]');
  const capture = async () => (await selected.screenshot()).toString("base64");
  const before = await capture();
  const rows = list.locator('[data-slot="tabs-row"], [data-slot="tabs-centre-row"]');
  await rows.evaluateAll((nodes) => nodes.forEach((node) => (node.style.visibility = "hidden")));
  let without;
  try {
    without = await capture();
  } finally {
    await rows.evaluateAll((nodes) =>
      nodes.forEach((node) => node.style.removeProperty("visibility")),
    );
  }
  const changed = await page.evaluate(
    async (images) => {
      const pixels = await Promise.all(
        images.map(async (png) => {
          const image = new Image();
          image.src = `data:image/png;base64,${png}`;
          await image.decode();
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0);
          return context.getImageData(0, 0, canvas.width, canvas.height).data;
        }),
      );
      let count = 0;
      for (let i = 0; i < pixels[0].length; i += 4)
        if (
          [0, 1, 2].some(
            (channel) => Math.abs(pixels[0][i + channel] - pixels[1][i + channel]) > 30,
          )
        )
          count++;
      return count;
    },
    [before, without],
  );
  assert.ok(changed > 25, `${label}: selected label did not paint (${changed} changed pixels)`);
}

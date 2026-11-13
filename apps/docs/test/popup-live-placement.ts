export function tracePopupPlacement() {
  const report = document.createElement("pre");
  Object.assign(report.style, {
    position: "fixed",
    left: "8px",
    bottom: "8px",
    zIndex: "2147483647",
    background: "white",
    color: "black",
    fontSize: "12px",
    padding: "8px",
    pointerEvents: "none",
  });
  document.body.append(report);
  let frame = 0;
  let stable = true;
  let initial = "";
  const click = () => {
    cancelAnimationFrame(frame);
    const lines: string[] = [];
    stable = true;
    initial = "";
    let count = 0;
    const sample = () => {
      const popup = document.querySelector<HTMLElement>(
        '[data-lenso-slot="popover-popup"][data-open]',
      );
      if (popup) {
        const r = popup.getBoundingClientRect(),
          s = getComputedStyle(popup);
        const scene = popup.closest("section");
        const trigger = [...document.querySelectorAll("button")].find(
          (b) => b.textContent === "Click me",
        );
        const tr = trigger?.getBoundingClientRect();
        const layout = `${popup.offsetLeft},${popup.offsetTop},${popup.offsetWidth},${popup.offsetHeight}`;
        initial ||= layout;
        stable &&= initial === layout;
        lines.push(
          `${count}: layout ${popup.offsetLeft},${popup.offsetTop} ${popup.offsetWidth}x${popup.offsetHeight} rect ${r.x.toFixed(1)},${r.y.toFixed(1)} origin ${s.transformOrigin} ${s.position} sceneScroll ${scene?.scrollTop},${scene?.scrollLeft} trigger ${tr?.x.toFixed(1)},${tr?.y.toFixed(1)} sceneWidth ${scene?.clientWidth}`,
        );
      }
      report.textContent = `${stable ? "PASS" : "FAIL"}: opening layout stays fixed\n${lines.join("\n")}`;
      if (++count < 16) frame = requestAnimationFrame(sample);
    };
    frame = requestAnimationFrame(sample);
  };
  document.addEventListener("click", click, true);
  return () => {
    cancelAnimationFrame(frame);
    document.removeEventListener("click", click, true);
    report.remove();
  };
}

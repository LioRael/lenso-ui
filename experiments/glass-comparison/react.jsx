import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Glass } from "../../packages/ui/src/components/glass/glass";
import "@lenso/tokens/styles.css";
function App() {
  const [enabled, enable] = useState(false),
    [count, setCount] = useState(0);
  return (
    <div>
      <div data-lenso-backdrop="">
        <div data-testid="background" />
      </div>
      <button data-testid="enable" onClick={() => enable(true)}>
        Enable glass
      </button>
      {enabled && (
        <div data-testid="bench-grid">
          {Array.from({ length: 8 }, (_, i) => (
            <Glass key={i} data-testid={`panel-${i}`}>
              <div>Panel {i + 1}</div>
              <button data-testid={`count-${i}`} onClick={() => setCount((v) => v + 1)}>
                Count: {count}
              </button>
            </Glass>
          ))}
        </div>
      )}
    </div>
  );
}
createRoot(document.getElementById("exact-root")).render(<App />);

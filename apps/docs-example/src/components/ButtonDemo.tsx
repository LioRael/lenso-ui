import { useState } from "react";
import { Button } from "@lenso/ui/button";
import "@lenso/ui/styles.css";

export function ButtonDemo() {
  const [count, setCount] = useState(0);
  return (
    <div className="button-demo">
      <Button onClick={() => setCount((value) => value + 1)} size="compact">
        Increase count
      </Button>
      <span aria-live="polite">Count: {count}</span>
    </div>
  );
}

"use client";
/**
 * Adapted from HeroUI v3.2.6. SPDX-License-Identifier: Apache-2.0
 * Native Base UI control geometry and value formatting.
 */
import { Slider } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({ root: { width: "100%", maxWidth: "20rem" } });

export function Range() {
  return (
    <Slider
      xstyle={styles.root}
      defaultValue={[100, 500]}
      format={{ currency: "USD", style: "currency" }}
      max={1000}
      min={0}
      step={50}
    >
      <Slider.Label>Price Range</Slider.Label>
      <Slider.Output>{(formattedValues) => formattedValues.join(" – ")}</Slider.Output>
      <Slider.Control>
        <Slider.Track>
          <Slider.Fill />
        </Slider.Track>
        <Slider.Thumb index={0} aria-label="Minimum price" />
        <Slider.Thumb index={1} aria-label="Maximum price" />
      </Slider.Control>
    </Slider>
  );
}

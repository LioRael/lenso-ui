"use client";
import { Slider, type SliderRootProps } from "@lenso/ui";
import { useDataEngine } from "@fumari/stf";
import { s } from "./materials.stylex";
export interface SliderStoryProps {
  value: number;
  min?: SliderRootProps["min"];
  max?: SliderRootProps["max"];
  step?: SliderRootProps["step"];
  disabled?: SliderRootProps["disabled"];
}
export function SliderStory({ value, ...props }: SliderStoryProps) {
  const engine = useDataEngine();
  return (
    <Slider
      {...props}
      value={value}
      onValueChange={(next) => engine.update(["value"], typeof next === "number" ? next : next[0])}
      xstyle={s.slider}
    >
      <Slider.Control>
        <Slider.Track>
          <Slider.Fill />
          <Slider.Thumb aria-label="Volume" />
        </Slider.Track>
      </Slider.Control>
    </Slider>
  );
}

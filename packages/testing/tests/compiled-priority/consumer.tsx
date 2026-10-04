import * as stylex from "@stylexjs/stylex";
import { Checkbox, Radio, RadioGroup } from "@lenso/ui";
import { modalStyles } from "@lenso/tokens/modal";
import { createRoot } from "react-dom/client";
import "@lenso/tokens/styles.css";

const styles = stylex.create({
  check: {
    width: 10,
    height: 10,
    opacity: { default: 0, ":is([data-checked] *)": 1 },
  },
  radio: {
    "::before": {
      scale: { default: "1", ":is([data-checked])": ".5" },
    },
  },
  first: { width: 10, margin: 10, opacity: 0.25 },
  last: { width: 20, marginLeft: 4, opacity: 0.75 },
  padding: (padding: number) => ({ paddingTop: padding }),
  logical: { paddingInlineStart: 37, paddingInlineEnd: 11 },
  physical: { paddingLeft: 17, paddingRight: 23 },
  responsive: { fontSize: { default: 16, "@media (min-width: 900px)": 14 } },
  unrelatedFont: { fontSize: 16, margin: 0 },
});

createRoot(document.getElementById("root")!).render(
  <>
    <span data-testid="responsive-font" {...stylex.props(modalStyles.title, styles.responsive)}>
      Responsive font
    </span>
    <span {...stylex.props(styles.unrelatedFont)}>Unrelated default font</span>
    <div data-testid="local-precedence" {...stylex.props(styles.first, styles.last)} />
    <div
      data-testid="package-padding"
      data-package-style={JSON.stringify(modalStyles.popup)}
      data-consumer-style={JSON.stringify(styles.padding(29))}
      {...stylex.props(modalStyles.popup, styles.padding(29))}
    />
    {(["ltr", "rtl"] as const).map((direction) => (
      <div key={direction} dir={direction}>
        <div data-padding-contract="logical" {...stylex.props(modalStyles.popup, styles.logical)} />
        <div
          data-padding-contract="physical"
          {...stylex.props(modalStyles.popup, styles.physical)}
        />
        <div
          data-padding-contract="logical-last"
          {...stylex.props(modalStyles.popup, styles.physical, styles.logical)}
        />
        <div
          data-padding-contract="physical-last"
          {...stylex.props(modalStyles.popup, styles.logical, styles.physical)}
        />
      </div>
    ))}
    <Checkbox
      aria-label="Priority checkbox"
      ref={(node) => {
        if (node) node.dataset["refAttached"] = "true";
      }}
      xstyle={[styles.first, styles.last]}
    >
      <Checkbox.Control>
        <Checkbox.Indicator>
          <svg {...stylex.props(styles.check)} viewBox="0 0 10 10" aria-hidden="true">
            <path d="M0 5L4 9L10 0" />
          </svg>
        </Checkbox.Indicator>
      </Checkbox.Control>
    </Checkbox>
    <RadioGroup aria-label="Priority radios" defaultValue="first">
      <Radio value="first" aria-label="First radio">
        <Radio.Control>
          <Radio.Indicator xstyle={styles.radio} />
        </Radio.Control>
      </Radio>
      <Radio value="second" aria-label="Second radio">
        <Radio.Control>
          <Radio.Indicator xstyle={styles.radio} />
        </Radio.Control>
      </Radio>
    </RadioGroup>
    <RadioGroup aria-label="Native radios" defaultValue="native">
      <Radio value="native" aria-label="Native radio">
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
      </Radio>
    </RadioGroup>
  </>,
);

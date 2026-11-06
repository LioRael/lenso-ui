import * as stylex from "@stylexjs/stylex";

const s = stylex.create({
  scene: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: "var(--lenso-background-grouped-primary)",
    marginBlock: 24,
  },
  group: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "var(--lenso-background-grouped-secondary)",
  },
  title: { margin: 0, fontSize: 16, color: "var(--lenso-label-primary)" },
  supporting: {
    marginBlock: 8,
    fontSize: 14,
    color: "var(--docs-label-secondary, var(--lenso-label-secondary))",
  },
  error: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "var(--lenso-status-error-fill)",
    color: "var(--lenso-status-error-on-fill)",
    fontSize: 14,
    marginBottom: 0,
  },
});

export function SemanticColorExamples({ chinese = false }: { chinese?: boolean }) {
  return (
    <section
      aria-label={chinese ? "语义颜色示例" : "Semantic color examples"}
      {...stylex.props(s.scene)}
    >
      <div {...stylex.props(s.group)}>
        <h2 {...stylex.props(s.title)}>{chinese ? "内容与背景" : "Content and background"}</h2>
        <p {...stylex.props(s.supporting)}>
          {chinese
            ? "主要文字用于内容，次要文字用于辅助说明。分组表面与页面背景形成层次。"
            : "Primary labels carry content; secondary labels support it. The group surface separates related content from the page."}
        </p>
        <p {...stylex.props(s.error)}>
          {chinese ? "错误：请填写有效的电子邮件地址。" : "Error: enter a valid email address."}
        </p>
      </div>
    </section>
  );
}

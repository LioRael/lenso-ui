// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import { Breadcrumbs } from "@lenso/ui";
import { styles } from "../../en/breadcrumbs/source.stylex";
export function BreadcrumbsLevel2() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Item href="#">首页</Breadcrumbs.Item>
      <Breadcrumbs.Item>Current Page</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
export function BreadcrumbsLevel3() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Item href="#">首页</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">Category</Breadcrumbs.Item>
      <Breadcrumbs.Item>Current Page</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
export function BreadcrumbsDisabled() {
  return (
    <Breadcrumbs disabled>
      <Breadcrumbs.Item href="#">首页</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">产品</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">电子产品</Breadcrumbs.Item>
      <Breadcrumbs.Item>笔记本电脑</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
export function BreadcrumbsCustomSeparator() {
  return (
    <Breadcrumbs
      separator={
        <svg viewBox="0 0 256 512" xmlns="http://www.w3.org/2000/svg">
          <path d="M249.3 235.8c10.2 12.6 9.5 31.1-2.2 42.8l-128 128c-9.2 9.2-22.9 11.9-34.9 6.9S64.5 396.9 64.5 384l0-256c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l128 128 2.2 2.4z" />
        </svg>
      }
    >
      <Breadcrumbs.Item href="#">首页</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">产品</Breadcrumbs.Item>
      <Breadcrumbs.Item href="#">电子产品</Breadcrumbs.Item>
      <Breadcrumbs.Item>笔记本电脑</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
export function CustomStyles() {
  return (
    <Breadcrumbs xstyle={styles.root}>
      <Breadcrumbs.Item href="#" xstyle={styles.link}>
        首页
      </Breadcrumbs.Item>
      <Breadcrumbs.Item href="#" xstyle={styles.link}>
        产品
      </Breadcrumbs.Item>
      <Breadcrumbs.Item xstyle={styles.current}>笔记本电脑</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
export function RenderFunction() {
  return (
    <Breadcrumbs render={(props) => <nav {...props} data-custom="foo" />}>
      <Breadcrumbs.Item
        href="#"
        render={(props) => (
          <a {...props} data-custom="bar">
            {props.children}
          </a>
        )}
      >
        首页
      </Breadcrumbs.Item>
      <Breadcrumbs.Item
        href="#"
        render={(props) => (
          <a {...props} data-custom="bar">
            {props.children}
          </a>
        )}
      >
        产品
      </Breadcrumbs.Item>
      <Breadcrumbs.Item
        href="#"
        render={(props) => (
          <a {...props} data-custom="bar">
            {props.children}
          </a>
        )}
      >
        电子产品
      </Breadcrumbs.Item>
      <Breadcrumbs.Item
        render={(props) => (
          <a {...props} data-custom="bar">
            {props.children}
          </a>
        )}
      >
        笔记本电脑
      </Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
export { BreadcrumbsDisabled as default };

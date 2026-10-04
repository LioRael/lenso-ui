// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
"use client";

// Adapted from HeroUI v3.2.6 (e385ac2), Apache-2.0.
import {
  ArrowsRotateLeft,
  Box,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  CircleChevronDown,
  CreditCard,
  Minus,
  PlanetEarth,
  Plus,
  Receipt,
  ShoppingBag,
} from "@gravity-ui/icons";
import { Accordion, Button } from "@lenso/ui";
import { useState, type ComponentProps } from "react";
import * as stylex from "@stylexjs/stylex";
import { styles } from "../../en/accordion/source.stylex";
const orders = [
  {
    id: "order",
    title: "如何下单？",
    icon: <ShoppingBag />,
    content: "浏览我们的商品，将商品加入购物车并前往结账。完成购买需要提供收货与支付信息。",
  },
  {
    id: "modify",
    title: "可以修改或取消订单吗？",
    icon: <Receipt />,
    content: "可以，在订单发货前你可以修改或取消。订单一旦进入处理流程，将无法再更改。",
  },
  {
    id: "payment",
    title: "支持哪些支付方式？",
    icon: <CreditCard />,
    content: "我们接受主流信用卡，包括 Visa、Mastercard 和 American Express。",
  },
  {
    id: "shipping",
    title: "运费如何计算？",
    icon: <Box />,
    content: "运费因收货地址与订单体积而异。订单满 50 美元可享受免运费。",
  },
  {
    id: "international",
    title: "是否提供国际配送？",
    icon: <PlanetEarth />,
    content: "是的，我们可向多数国家/地区发货。请查看运费说明与政策了解更多信息。",
  },
  {
    id: "refund",
    title: "如何申请退款？",
    icon: <ArrowsRotateLeft />,
    content: "若对购买不满意，可在购买后 30 天内申请退款。请联系客服团队协助处理。",
  },
];
const concepts = [
  {
    id: "getting-started",
    title: "Getting Started",
    content:
      "Learn the basics of HeroUI and how to integrate it into your React project. This section covers installation, setup, and your first component.",
  },
  {
    id: "core-concepts",
    title: "Core Concepts",
    content:
      "Understand the fundamental concepts behind HeroUI, including the compound component pattern, styling with Tailwind CSS, and accessibility features.",
  },
  {
    id: "advanced-usage",
    title: "Advanced Usage",
    content:
      "Explore advanced features like custom variants, theme customization, and integration with other libraries in your React ecosystem.",
  },
  {
    id: "best-practices",
    title: "Best Practices",
    content:
      "Follow our recommended best practices for building performant, accessible, and maintainable applications with HeroUI components.",
  },
];
function OrderAccordion({
  renderParts = false,
  short = false,
  ...props
}: ComponentProps<typeof Accordion> & {
  renderParts?: boolean;
  short?: boolean;
}) {
  return (
    <Accordion
      xstyle={styles.root}
      {...props}
      render={renderParts ? (props) => <div {...props} data-custom="accordion" /> : undefined}
    >
      {(short ? orders.slice(0, 3) : orders).map((item) => (
        <Accordion.Item
          key={item.id}
          value={item.id}
          render={renderParts ? (props) => <div {...props} data-custom="item" /> : undefined}
        >
          <Accordion.Heading
            render={
              renderParts
                ? (props) => (
                    <h3 {...props} data-custom="heading">
                      {props.children}
                    </h3>
                  )
                : undefined
            }
          >
            <Accordion.Trigger
              render={
                renderParts ? (props) => <button {...props} data-custom="trigger" /> : undefined
              }
            >
              <span {...stylex.props(styles.icon)}>{item.icon}</span>
              {item.title}
              <Accordion.Indicator>
                <ChevronDown />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel
            render={renderParts ? (props) => <div {...props} data-custom="panel" /> : undefined}
          >
            <Accordion.Body>{item.content}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
export function Surface() {
  return <OrderAccordion variant="surface" />;
}
export function WithoutSeparator() {
  return <OrderAccordion short hideSeparator />;
}
export function RenderFunction() {
  return <OrderAccordion renderParts />;
}
export function Multiple() {
  return (
    <Accordion multiple xstyle={styles.root}>
      {concepts.map((item) => (
        <Accordion.Item key={item.id} value={item.id}>
          <Accordion.Heading>
            <Accordion.Trigger>
              {item.title}
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>{item.content}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
export function Controlled() {
  const [expanded, setExpanded] = useState<unknown[]>(["getting-started"]);
  const items = concepts.slice(0, 3);
  const index = items.findIndex((item) => item.id === expanded[0]);
  return (
    <div {...stylex.props(styles.root)}>
      <div {...stylex.props(styles.actions)}>
        <p {...stylex.props(styles.muted)}>
          Expanded: <strong>{expanded.join(", ") || "none"}</strong>
        </p>
        <div {...stylex.props(styles.buttons)}>
          <Button
            aria-label="Previous item"
            disabled={index <= 0}
            size="sm"
            variant="secondary"
            onClick={() => setExpanded([items[index - 1]!.id])}
          >
            <ChevronUp {...stylex.props(styles.smallIcon)} />
          </Button>
          <Button
            aria-label="Next item"
            disabled={index >= items.length - 1}
            size="sm"
            variant="secondary"
            onClick={() => setExpanded([items[index + 1]!.id])}
          >
            <ChevronDown {...stylex.props(styles.smallIcon)} />
          </Button>
        </div>
      </div>
      <Accordion value={expanded} onValueChange={setExpanded}>
        {items.map((item) => (
          <Accordion.Item key={item.id} value={item.id}>
            <Accordion.Heading>
              <Accordion.Trigger>
                {item.title}
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body>{item.content}</Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}
export function CustomIndicator() {
  const [expanded, setExpanded] = useState<unknown[]>([]);
  return (
    <Accordion value={expanded} onValueChange={setExpanded} variant="surface" xstyle={styles.root}>
      {[
        {
          id: "1",
          title: "Using Plus/Minus Icon",
          icon: expanded.includes("1") ? <Minus /> : <Plus />,
          content:
            "This accordion uses a plus icon that transforms when expanded. The icon automatically rotates 45 degrees to form an X.",
        },
        {
          id: "2",
          title: "Using Caret Icon",
          icon: <CircleChevronDown />,
          content:
            "This item uses a caret icon for the indicator. The rotation animation is applied automatically.",
        },
        {
          id: "3",
          title: "Using Arrow Icon",
          icon: <ChevronsDown />,
          content:
            "This item uses an arrow icon. Any icon you pass will receive the rotation animation when the item expands.",
        },
      ].map((item) => (
        <Accordion.Item key={item.id} value={item.id}>
          <Accordion.Heading>
            <Accordion.Trigger>
              {item.title}
              <Accordion.Indicator>{item.icon}</Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>{item.content}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
export function Disabled() {
  return (
    <div {...stylex.props(styles.disabledColumn)}>
      <div {...stylex.props(styles.disabledSection)}>
        <h3 {...stylex.props(styles.caption)}>Entire accordion disabled</h3>
        <Accordion disabled xstyle={styles.root}>
          {[1, 2].map((value) => (
            <Accordion.Item key={value} value={value}>
              <Accordion.Heading>
                <Accordion.Trigger>
                  Disabled Item {value}
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>
                  This content cannot be accessed when the accordion is disabled.
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
      <div {...stylex.props(styles.disabledSection)}>
        <h3 {...stylex.props(styles.caption)}>Individual items disabled</h3>
        <Accordion xstyle={styles.root}>
          {[
            {
              id: "active",
              title: "Active Item",
              content: "This item is active and can be toggled normally.",
            },
            {
              id: "disabled",
              title: "Disabled Item",
              content: "This content cannot be accessed when the item is disabled.",
            },
            {
              id: "another",
              title: "Another Active Item",
              content: "This item is also active and can be toggled.",
            },
          ].map((item) => (
            <Accordion.Item key={item.id} value={item.id} disabled={item.id === "disabled"}>
              <Accordion.Heading>
                <Accordion.Trigger>
                  {item.title}
                  <Accordion.Indicator />
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body>{item.content}</Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
export function FAQ() {
  const categories = [
    {
      title: "General",
      items: orders.slice(0, 2),
    },
    {
      title: "Licensing",
      items: [
        {
          id: "purchase",
          title: "How do I purchase a license?",
          content:
            "You can purchase a license directly from our website. Select the license type that fits your needs and proceed to checkout.",
        },
        {
          id: "license",
          title: "What is the difference between a standard and a pro license?",
          content:
            "A standard license is for personal use or small projects, while a pro license includes commercial use rights and priority support.",
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "support",
          title: "How do I get support?",
          content:
            "You can reach our support team through the contact form on our website, or email us directly at support@example.com.",
        },
      ],
    },
  ];
  return (
    <div {...stylex.props(styles.column)}>
      <div {...stylex.props(styles.headingGroup)}>
        <h2 {...stylex.props(styles.heading)}>Frequently Asked Questions</h2>
        <p {...stylex.props(styles.subtitle)}>
          Everything you need to know about licensing and usage.
        </p>
      </div>
      {categories.map((category) => (
        <div key={category.title}>
          <p {...stylex.props(styles.category)}>{category.title}</p>
          <Accordion xstyle={styles.full} variant="surface">
            {category.items.map((item) => (
              <Accordion.Item key={item.id} value={item.id}>
                <Accordion.Heading>
                  <Accordion.Trigger>
                    {item.title}
                    <Accordion.Indicator>
                      <ChevronDown />
                    </Accordion.Indicator>
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  <Accordion.Body>{item.content}</Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
export function CustomStyles() {
  const items = [
    {
      title: "Set Up Notifications",
      subtitle: "Receive account activity updates",
      content: "Stay informed about your account activity with real-time notifications.",
      iconUrl: "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/bell-small.png",
    },
    {
      title: "Set up Browser Extension",
      subtitle: "Connect your browser to your account",
      content: "Enhance your browsing experience by installing our official browser extension",
      iconUrl:
        "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/compass-small.png",
    },
    {
      title: "Mint Collectible",
      subtitle: "Create your first collectible",
      content:
        "Begin your journey into the world of digital collectibles by creating your first NFT. ",
      iconUrl:
        "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/3dicons/mint-collective-small.png",
    },
  ];
  return (
    <Accordion xstyle={styles.customRoot} variant="surface">
      {items.map((item) => (
        <Accordion.Item key={item.title} value={item.title}>
          <Accordion.Heading>
            <Accordion.Trigger xstyle={styles.customTrigger}>
              <img alt={item.title} src={item.iconUrl} {...stylex.props(styles.image)} />
              <div {...stylex.props(styles.customText)}>
                <span {...stylex.props(styles.customTitle)}>{item.title}</span>
                <span {...stylex.props(styles.customSubtitle)}>{item.subtitle}</span>
              </div>
              <Accordion.Indicator xstyle={styles.customIndicator}>
                <ChevronDown {...stylex.props(styles.smallIcon)} />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body xstyle={styles.customBody}>{item.content}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

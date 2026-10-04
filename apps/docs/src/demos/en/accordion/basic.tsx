"use client";
// Derived from HeroUI v3.2.6 (Apache-2.0); modified for native Accordion contracts and StyleX.

import {
  ArrowsRotateLeft,
  Box,
  ChevronDown,
  CreditCard,
  PlanetEarth,
  Receipt,
  ShoppingBag,
} from "@gravity-ui/icons";
import { Accordion } from "@lenso/ui";
import * as stylex from "@stylexjs/stylex";

const styles = stylex.create({
  root: { width: "100%", maxWidth: 448 },
  icon: { width: 16, height: 16, flexShrink: 0, marginInlineEnd: 12, color: "var(--muted)" },
});
const items = [
  {
    title: "How do I place an order?",
    Icon: ShoppingBag,
    content:
      "Browse our products, add items to your cart, and proceed to checkout. You'll need to provide shipping and payment information to complete your purchase.",
  },
  {
    title: "Can I modify or cancel my order?",
    Icon: Receipt,
    content:
      "Yes, you can modify or cancel your order before it's shipped. Once your order is processed, you can't make changes.",
  },
  {
    title: "What payment methods do you accept?",
    Icon: CreditCard,
    content: "We accept all major credit cards, including Visa, Mastercard, and American Express.",
  },
  {
    title: "How much does shipping cost?",
    Icon: Box,
    content:
      "Shipping costs vary based on your location and the size of your order. We offer free shipping for orders over $50.",
  },
  {
    title: "Do you ship internationally?",
    Icon: PlanetEarth,
    content:
      "Yes, we ship to most countries. Please check our shipping rates and policies for more information.",
  },
  {
    title: "How do I request a refund?",
    Icon: ArrowsRotateLeft,
    content:
      "If you're not satisfied with your purchase, you can request a refund within 30 days of purchase. Please contact our customer support team for assistance.",
  },
];
export function Basic() {
  return (
    <Accordion xstyle={styles.root}>
      {items.map(({ title, content, Icon }) => (
        <Accordion.Item key={title} value={title}>
          <Accordion.Heading>
            <Accordion.Trigger>
              <Icon aria-hidden="true" {...stylex.props(styles.icon)} />
              {title}
              <Accordion.Indicator>
                <ChevronDown />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body>{content}</Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}

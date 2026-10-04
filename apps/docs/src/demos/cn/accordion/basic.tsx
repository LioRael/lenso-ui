// Generated from HeroUI v3.2.6 (e385ac202b2cdb94b1bf6fa76d32c31c8259cc5e); Apache-2.0.
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
  root: {
    width: "100%",
    maxWidth: 448,
  },
  icon: {
    width: 16,
    height: 16,
    flexShrink: 0,
    marginInlineEnd: 12,
    color: "var(--muted)",
  },
});
const items = [
  {
    title: "如何下单？",
    Icon: ShoppingBag,
    content: "浏览我们的商品，将商品加入购物车并前往结账。完成购买需要提供收货与支付信息。",
  },
  {
    title: "可以修改或取消订单吗？",
    Icon: Receipt,
    content: "可以，在订单发货前你可以修改或取消。订单一旦进入处理流程，将无法再更改。",
  },
  {
    title: "支持哪些支付方式？",
    Icon: CreditCard,
    content: "我们接受主流信用卡，包括 Visa、Mastercard 和 American Express。",
  },
  {
    title: "运费如何计算？",
    Icon: Box,
    content: "运费因收货地址与订单体积而异。订单满 50 美元可享受免运费。",
  },
  {
    title: "是否提供国际配送？",
    Icon: PlanetEarth,
    content: "是的，我们可向多数国家/地区发货。请查看运费说明与政策了解更多信息。",
  },
  {
    title: "如何申请退款？",
    Icon: ArrowsRotateLeft,
    content: "若对购买不满意，可在购买后 30 天内申请退款。请联系客服团队协助处理。",
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

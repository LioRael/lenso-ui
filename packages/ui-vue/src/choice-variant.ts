import {
  defineComponent,
  h,
  inject,
  provide,
  type Component,
  type InjectionKey,
  type PropType,
} from "vue";

export type ChoiceVariant = "primary" | "secondary";

export function createChoiceVariant(key: InjectionKey<() => ChoiceVariant>) {
  const useVariant = () => inject(key, () => "primary");
  const withVariant = (part: Component, provideVariant: boolean) =>
    defineComponent({
      inheritAttrs: false,
      props: { variant: String as PropType<ChoiceVariant> },
      setup(props, { attrs, slots }) {
        const inherited = useVariant();
        if (provideVariant) provide(key, () => props.variant ?? inherited());
        return () =>
          h(
            part,
            provideVariant ? attrs : { ...attrs, variant: props.variant ?? inherited() },
            slots,
          );
      },
    });
  return withVariant;
}

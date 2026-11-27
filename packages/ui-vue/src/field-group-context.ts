import { defineComponent, h, provide, type Component, type InjectionKey } from "vue";
export const FieldGroupContext: InjectionKey<boolean> = Symbol("FieldGroup");
export function fieldGroupScope<C extends Component>(part: C, grouped: boolean): C {
  return defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      provide(FieldGroupContext, grouped);
      return () => h(part, attrs, slots);
    },
  }) as unknown as C;
}

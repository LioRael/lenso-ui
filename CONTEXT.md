# Lenso UI

Lenso UI is an independent public design system shared by Lenso products and community applications. It defines product-neutral interface foundations without inheriting the domain of any single consuming product.

## Language

**Lenso UI**:
The independent public design system that owns reusable, product-neutral interface foundations and components for Lenso products and community applications.
_Avoid_: Console UI, Lenso Console Design System

**Consumer**:
A Lenso product or community application that adopts Lenso UI while retaining ownership of its product-specific interface concepts.
_Avoid_: Client, downstream Console

**Foundation Component**:
A reusable interface component whose meaning and behavior are independent of any consuming product's domain.
_Avoid_: Generic component, Console primitive

**Product Component**:
An interface component that expresses concepts belonging to one consuming product and remains owned by that product.
_Avoid_: Lenso UI component, shared component

**Theme**:
A coherent assignment of public semantic token values that gives Lenso UI an appearance without owning a Consumer's preferences, assets, or product composition.
_Avoid_: Theme Bundle, skin

**Theme Scope**:
A boundary within which one Theme applies without changing the Theme of surrounding or sibling interface trees.
_Avoid_: Global theme, appearance settings

**Registry Component**:
An editable Consumer-owned copy of a Foundation Component installed from the Lenso registry.
_Avoid_: Package component, managed component

**Package Component**:
A Foundation Component consumed as a managed dependency from the published Lenso UI package.
_Avoid_: Registry component, copied component

**Release Snapshot**:
One immutable identity that binds package artifacts and registry artifacts generated from the same canonical component source.
_Avoid_: Latest registry, package version

**Recipe**:
An opinionated, product-oriented composition distributed as Consumer-owned registry source until repeated use proves it belongs in the stable package API.
_Avoid_: Foundation Component, template

**Product Primitive**:
A product-grade, headless interaction and state model whose behavior is reusable across multiple Recipes or Consumers without prescribing their visual composition.
_Avoid_: Recipe, styled product component, layout component

**Canonical Design Component**:
The single approved Figma component set that defines the visual contract for one Foundation Component.
_Avoid_: Demo component, synchronized copy, deprecated component

**Certified Consumer Path**:
A distribution-channel and framework combination that Lenso UI verifies with a real installation during release validation.
_Avoid_: Supported everywhere, example fixture

**Built-in Icon**:
A replaceable third-party icon supplied as the default visual for a component control whose icon may be overridden by the Consumer.
_Avoid_: Lenso icon, required icon component

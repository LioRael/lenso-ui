# Photos component contract audit

November 5, 2026. Source inspection of the Photos demo, not native visual acceptance.

## Corrected

Library Years/Months/All used Toolbar.Button with aria-pressed and a local selected
background. It now composes Tabs, Tabs.ListContainer, Tabs.List, Tabs.Tab,
Tabs.Indicator and Tabs.Panel. The existing library view state owns the controlled
value; the shared component owns focus, keyboard navigation and indicator motion.
The original repeated-current-view scroll action is retained. The page only sets
the selector's available width and height through existing Tabs geometry variables.
The hand-written selected fill and toolbar-specific selector maps were removed.

## Remaining findings

- Editor Adjust/Filters switches content using ordinary pressed Buttons. It should
  compose Tabs with associated panels; the current mode styles duplicate selection.
- Editor adjustment-tool and filter-preset choices are mutually exclusive, but use
  standalone pressed Buttons. Review ToggleButtonGroup with ToggleButton, preserving
  the image previews, labels and one selected value.
- Editor Compare is a persistent state implemented with a pressed Button. Use the
  ToggleButton contract while preserving the independent hold-original gesture.
- Library, Collections, Search, viewer, information, editor, share and selection
  surfaces still need a new rendered walkthrough. Source inspection is not evidence
  that their spacing, materials, animations or native-reference behavior is correct.

## Existing composition checked in source

Main navigation uses TabBar; header actions use Toolbar; filtering uses Menu;
search uses SearchField; editing uses Modal and Slider; captions use TextArea;
sharing uses Popover; selected-photo preview uses Sheet and deletion uses
AlertDialog. Existing component names alone do not establish correct composition
or native fidelity. Custom photo grid, image gestures, album covers and metadata
layout are content-specific rather than replacements for a generic input control.

## Verification limit

Affected format/lint and docs typechecks run for the selector replacement. Existing
TabBar scroll and Toolbar regressions are relevant shared coverage, not a rendered
acceptance of the new Tabs integration. Browser control repeatedly timed out and
reported unavailable pages; rendered geometry, narrow-screen overlap, keyboard
operation, and indicator motion remain pending. No visual PASS is claimed for this
change, and no previous screenshot is presented as evidence of this implementation.

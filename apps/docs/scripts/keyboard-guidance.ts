const guides: Record<string, [string, string]> = {
  menu: [
    `## Keyboard-only walkthrough

Use the Complete example in the preview above, with its default settings.

1. Press Tab until the Actions button (accessible name: Menu) is focused. Press Enter to open it.
2. Press End to focus Sort by, then Right Arrow to open its submenu.
3. Press Escape. Only the submenu closes, and focus returns to Sort by.
4. Press Escape again. The parent menu closes, and focus returns to Actions.

In the Console, both closing entries show open: false and end in keyboard. That last field is the input source, not the dismissal reason. The Sort by and Menu labels identify which layer closed. Up/Down Arrow navigates items; Enter activates the focused action. Left Arrow also returns from a submenu in a left-to-right layout.`,
    `## 纯键盘演练

在上方预览中选择「完整示例」，使用默认设置。

1. 按 Tab，直到「操作」按钮（无障碍名称为 Menu）获得焦点，按 Enter 打开菜单。
2. 按 End 聚焦「排序方式」（Sort by），再按右方向键打开子菜单。
3. 按 Escape。只有子菜单关闭，焦点回到「排序方式」。
4. 再按 Escape。父菜单关闭，焦点回到「操作」。

Console 中的两条关闭记录均显示 open: false，并以 keyboard 结尾。最后一项表示输入来源，不是关闭原因；「排序方式」与 Menu 标签用来区分关闭的层级。上/下方向键移动焦点，Enter 执行当前操作。在从左到右的布局中，左方向键也可从子菜单返回。`,
  ],
  "context-menu": [
    `## Keyboard-only walkthrough

1. Tab to Project notes in the default preview. Press the context-menu key (Menu where available, or Shift+F10 in browsers that map it) to open its menu.
2. Use Up/Down Arrow to focus Move to, then Right Arrow to enter its submenu in a left-to-right layout.
3. Press Escape to return to Move to without choosing a destination.
4. Press Escape again to close the parent menu and return focus to Project notes.

Enter activates the focused action. Opening and dismissing a menu does not run an action. The opening shortcut depends on the platform: Shift+F10 does not produce a context-menu event in every browser.`,
    `## 纯键盘演练

1. 在默认预览中按 Tab 聚焦 Project notes，按平台的上下文菜单键（键盘提供时使用 Menu，部分浏览器映射为 Shift+F10）打开菜单。
2. 用上/下方向键聚焦 Move to，在从左到右的布局中按右方向键进入子菜单。
3. 按 Escape 返回 Move to，不选择目标位置。
4. 再按 Escape 关闭父菜单，焦点回到 Project notes。

Enter 执行当前聚焦的操作。仅打开和关闭菜单不会执行操作。打开快捷键依赖平台，Shift+F10 并非在所有浏览器中都会产生上下文菜单事件。`,
  ],
  select: [
    `## Keyboard-only walkthrough

1. Tab to the State selector in the default preview. Press Enter to open its options.
2. Use Up/Down Arrow to browse. Home/End reaches the first/last enabled option.
3. Press Enter to choose the highlighted option. The list closes and the trigger displays the selection.
4. Open it again, move to another option, then press Escape. The list closes without replacing the committed value, and focus returns to the trigger.

Moving through the open list is not the same as committing a selection.`,
    `## 纯键盘演练

1. 在默认预览中按 Tab 聚焦 State 选择器，按 Enter 打开选项。
2. 用上/下方向键浏览，Home/End 到达首个/末个可用选项。
3. 按 Enter 选中高亮项。列表关闭，触发器显示所选值。
4. 再次打开并移到其他选项，按 Escape。列表关闭，已提交的值不变，焦点回到触发器。

在列表中移动高亮与提交选择是两种操作。`,
  ],
  "combo-box": [
    `## Keyboard-only walkthrough

1. Tab to Favorite animal in the default preview and type part of an animal's name. The options filter while focus stays in the input.
2. Use Down/Up Arrow to highlight an option, then Enter to choose it.
3. Edit the text again and press Escape while the list is open. The list closes and the selected option's label is restored; focus stays in the input.

Typing changes the query, not the committed option. Disabled and read-only examples do not accept a new selection.`,
    `## 纯键盘演练

1. 在默认预览中按 Tab 聚焦 Favorite animal，输入动物名称的一部分。选项随输入筛选，焦点留在输入框。
2. 用下/上方向键高亮选项，按 Enter 选中。
3. 再次编辑文字，在列表打开时按 Escape。列表关闭并恢复所选项的标签，焦点仍在输入框。

输入文字改变的是查询，不是已提交的选项。禁用和只读示例不接受新选择。`,
  ],
  autocomplete: [
    `## Keyboard-only walkthrough

1. Tab to State to visit in the default preview and type part of a state name.
2. Use Down/Up Arrow to highlight a suggestion, then Enter to accept its text.
3. Type your own text instead, then Tab out of the field. A suggestion is optional: this is a text input, not a Select restricted to listed values.

Escape dismisses the suggestions. Do not assume it undoes the text you typed.`,
    `## 纯键盘演练

1. 在默认预览中按 Tab 聚焦 State to visit，输入州名的一部分。
2. 用下/上方向键高亮建议，按 Enter 采用建议文字。
3. 也可输入自定义文字，再按 Tab 离开。无需选择建议：这是文本输入，不是只能接受列表值的 Select。

Escape 关闭建议列表，不应把它当作撤销输入的操作。`,
  ],
  command: [
    `## Keyboard-only walkthrough

1. Tab to Find a command and type Settings in the default preview.
2. Use Up/Down Arrow to move the highlight. Focus stays in the search field.
3. Press Enter to run the highlighted command and inspect the Selected output.
4. Press Escape to clear the query and show the commands again.

This preview is an inline command list, not a dialog. Escape does not close the page or preview; in nested command pages it clears the query before returning to the previous page.`,
    `## 纯键盘演练

1. 在默认预览中按 Tab 聚焦 Find a command，输入 Settings。
2. 用上/下方向键移动高亮，焦点留在搜索框。
3. 按 Enter 执行高亮命令，在 Selected 输出中查看结果。
4. 按 Escape 清空查询，重新显示命令。

此预览是内联命令列表，不是对话框。Escape 不会关闭页面或预览；对于嵌套命令页，它先清空查询，再返回上一页。`,
  ],
  modal: [
    `## Keyboard-only walkthrough

1. Tab to the default preview's open button and press Enter. Focus moves into the dialog.
2. Use Tab and Shift+Tab to visit its controls. In a modal dialog, focus stays inside while it is open.
3. Press Escape to dismiss it and return focus to the opening button.

An explicit Close or Cancel control can also be activated with Enter or Space. If dismissal is disabled, use the provided close action instead of expecting Escape to override that setting.`,
    `## 纯键盘演练

1. 按 Tab 聚焦默认预览的打开按钮，按 Enter，焦点进入对话框。
2. 用 Tab 和 Shift+Tab 遍历内部控件。模态对话框打开期间，焦点保持在内部。
3. 按 Escape 关闭，焦点回到打开按钮。

也可聚焦明确的 Close 或 Cancel 控件，用 Enter 或空格激活。若禁用了隐式关闭，应使用提供的关闭操作，不要期待 Escape 越过该设置。`,
  ],
  "alert-dialog": [
    `## Keyboard-only walkthrough

1. Tab to the default preview's confirmation trigger and press Enter.
2. Check the initially focused safe action. Tab and Shift+Tab move between the dialog's controls without leaving it.
3. Press Escape to cancel and return focus to the trigger, without confirming the destructive action.

To confirm, focus the explicit confirmation button and press Enter or Space. An action that is pending or a non-dismissible configuration can prevent Escape from closing the dialog.`,
    `## 纯键盘演练

1. 按 Tab 聚焦默认预览的确认弹窗触发器，按 Enter 打开。
2. 检查初始焦点所在的安全操作，用 Tab 和 Shift+Tab 在弹窗控件间移动，不离开弹窗。
3. 按 Escape 取消，焦点回到触发器，不确认危险操作。

需要确认时，聚焦明确的确认按钮，再按 Enter 或空格。操作执行中或禁止隐式关闭的配置可能阻止 Escape 关闭弹窗。`,
  ],
  sheet: [
    `## Keyboard-only walkthrough

1. Tab to Open sheet in the default preview and press Enter.
2. Tab through the sheet's controls. Activate Expand sheet or Collapse sheet with Enter to change its height without dragging.
3. Press Escape to close the dismissible sheet and return focus to Open sheet.

Tab and Shift+Tab stay within a modal sheet. The height controls provide a keyboard alternative to the drag gesture.`,
    `## 纯键盘演练

1. 在默认预览中按 Tab 聚焦 Open sheet，按 Enter 打开。
2. 用 Tab 遍历内部控件，聚焦 Expand sheet 或 Collapse sheet 后按 Enter，无需拖动即可改变高度。
3. 按 Escape 关闭可隐式关闭的 Sheet，焦点回到 Open sheet。

模态 Sheet 内的 Tab 和 Shift+Tab 不会移出浮层。高度按钮是拖动手势的键盘替代方式。`,
  ],
  "action-sheet": [
    `## Keyboard-only walkthrough

1. Tab to Photo actions in the default preview and press Enter.
2. Use Tab/Shift+Tab to reach an action or Cancel. These are buttons, not menu items navigated with arrow keys.
3. Activate Cancel with Enter, then reopen and press Escape. Both routes dismiss without choosing a destructive action and return focus to the trigger.

To run an action, focus its button and press Enter or Space.`,
    `## 纯键盘演练

1. 在默认预览中按 Tab 聚焦 Photo actions，按 Enter 打开。
2. 用 Tab/Shift+Tab 聚焦操作或 Cancel。这些是按钮，不是用方向键导航的菜单项。
3. 按 Enter 激活 Cancel，再次打开后按 Escape。两种方式均不选择危险操作，关闭后焦点回到触发器。

需要执行操作时，聚焦对应按钮并按 Enter 或空格。`,
  ],
  "share-sheet": [
    `## Keyboard-only walkthrough

1. Tab to Share photo in the default preview and press Enter.
2. Use Tab and Shift+Tab to browse the sheet's share and close controls.
3. Press Escape to dismiss and return focus to Share photo without invoking a share action.

Enter or Space activates a focused action. Share targets are buttons, not an arrow-key menu.`,
    `## 纯键盘演练

1. 在默认预览中按 Tab 聚焦 Share photo，按 Enter 打开。
2. 用 Tab 和 Shift+Tab 浏览分享及关闭控件。
3. 按 Escape 关闭，不执行分享操作，焦点回到 Share photo。

Enter 或空格激活聚焦的操作。分享目标是按钮，不是方向键菜单。`,
  ],
  toast: [
    `## Keyboard-only walkthrough

1. Tab to Show toast in the default preview and press Enter.
2. Press F6 to move focus to the newest toast. Its timer pauses while focus is inside the notification region.
3. Press F6 again to return to the control you came from, or Escape to dismiss the focused toast.

Tab visits notification controls. After dismissing the last toast, focus returns to the previous control. The region's shortcut can be configured or disabled; F6 is the default and has no effect when there are no toasts.`,
    `## 纯键盘演练

1. 在默认预览中按 Tab 聚焦 Show toast，按 Enter 显示通知。
2. 按 F6 将焦点移到最新通知。焦点位于通知区域内时，自动关闭计时暂停。
3. 再按 F6 返回原来的控件，或按 Escape 关闭聚焦的通知。

Tab 遍历通知控件。关闭最后一条通知后，焦点回到原来的控件。通知区域的快捷键可配置或禁用；默认使用 F6，没有通知时不拦截该键。`,
  ],
  popover: [
    `## Keyboard-only walkthrough

1. Tab to the default preview's popover trigger and press Enter.
2. Read the revealed title and description. This default example has no interactive controls inside.
3. Press Escape to close it and return focus to the trigger.

For a popover containing controls, use Tab/Shift+Tab to visit them. Do not assume every popover traps focus: that depends on its modal configuration. Hover is not required to open it from the keyboard.`,
    `## 纯键盘演练

1. 按 Tab 聚焦默认预览的 Popover 触发器，按 Enter 打开。
2. 阅读显示的标题和描述。默认示例内部没有交互控件。
3. 按 Escape 关闭，焦点回到触发器。

若 Popover 内含控件，可用 Tab/Shift+Tab 遍历。不是所有 Popover 都限制焦点离开，这取决于模态配置。键盘打开不需要鼠标悬停。`,
  ],
  tabs: [
    `## Keyboard reference

| Key | Result |
| --- | --- |
| Tab | Enter at the selected tab; the next Tab leaves the tab list. |
| Left/Right Arrow | Move between horizontal tabs; automatic activation also selects. |
| Up/Down Arrow | Move between vertical tabs. |
| Home/End | Focus the first/last tab. |
| Enter/Space | Select the focused tab when activation is manual. |

Try automatic and manual activation in the preview controls. In manual mode, moving focus alone must not change the selected value. Horizontal arrows follow the page's text direction.`,
    `## 键盘操作

| 按键 | 结果 |
| --- | --- |
| Tab | 从选中项进入，再按 Tab 离开标签列表。 |
| 左/右方向键 | 移动横向标签焦点；自动激活时同时选中。 |
| 上/下方向键 | 移动纵向标签焦点。 |
| Home/End | 聚焦首个/末个标签。 |
| Enter/空格 | 手动激活模式下选中聚焦的标签。 |

可在预览参数中切换自动与手动激活。手动模式下，只移动焦点不应改变选中值。横向方向键遵循页面文字方向。`,
  ],
  "radio-group": [
    `## Keyboard reference

| Key | Result |
| --- | --- |
| Tab | Enter at the checked option, or the first enabled option; Tab again leaves. |
| Arrow keys | Move to and check the next/previous enabled option. |
| Space | Check the focused option. |

Arrow navigation changes the value, unlike a manually activated tab list. Enter is not the radio selection key; in a form it can submit the form.`,
    `## 键盘操作

| 按键 | 结果 |
| --- | --- |
| Tab | 从已选项或首个可用选项进入，再按 Tab 离开。 |
| 方向键 | 移到并选中下一个/上一个可用选项。 |
| 空格 | 选中聚焦的选项。 |

方向键会改变值，不同于手动激活的标签列表。Enter 不是单选项的选择键，在表单中可能提交表单。`,
  ],
  toolbar: [
    `## Keyboard reference

| Key | Result |
| --- | --- |
| Tab | Enter the toolbar's roving tab stop; Tab again leaves the group. |
| Left/Right Arrow | Move focus in a horizontal toolbar. |
| Up/Down Arrow | Move focus in a vertical toolbar. |
| Home/End | Focus the first/last item, except while editing a field. |
| Enter/Space | Activate the focused button or toggle. |

Moving focus does not press a toggle. Embedded controls keep their own keys, such as Down Arrow for a menu. Horizontal arrows reverse in right-to-left text.`,
    `## 键盘操作

| 按键 | 结果 |
| --- | --- |
| Tab | 进入工具栏的漫游焦点，再按 Tab 离开。 |
| 左/右方向键 | 在横向工具栏中移动焦点。 |
| 上/下方向键 | 在纵向工具栏中移动焦点。 |
| Home/End | 聚焦首个/末个项目，编辑输入框时除外。 |
| Enter/空格 | 激活聚焦的按钮或切换按钮。 |

移动焦点不会按下切换按钮。内部控件保留自身按键，例如下方向键打开菜单。横向方向键在从右到左的文字中反转。`,
  ],
  "toggle-button-group": [
    `## Keyboard reference

| Key | Result |
| --- | --- |
| Tab | Enter the group at its roving tab stop; Tab again leaves. |
| Left/Right Arrow | Move focus in a horizontal group, following text direction. |
| Up/Down Arrow | Move focus in a vertical group. |
| Home/End | Focus the first/last toggle. |
| Enter/Space | Toggle the focused button. |

Arrow keys move focus without changing which buttons are pressed. Single and multiple selection retain the same focus model.`,
    `## 键盘操作

| 按键 | 结果 |
| --- | --- |
| Tab | 进入按钮组的漫游焦点，再按 Tab 离开。 |
| 左/右方向键 | 在横向组中移动焦点，遵循文字方向。 |
| 上/下方向键 | 在纵向组中移动焦点。 |
| Home/End | 聚焦首个/末个切换按钮。 |
| Enter/空格 | 切换聚焦按钮的按下状态。 |

方向键只移动焦点，不改变按下状态。单选和多选使用相同的焦点模型。`,
  ],
  slider: [
    `## Keyboard reference

| Key | Result with a thumb focused |
| --- | --- |
| Right/Up Arrow | Increase by one step. |
| Left/Down Arrow | Decrease by one step. |
| Page Up/Page Down or Shift+Arrow | Change by the large step. |
| Home/End | Move to the allowed minimum/maximum. |
| Tab | Move through the thumbs, then leave the slider. |

Each adjustment changes the value immediately. Range thumbs cannot cross their allowed neighbour bound. Left/Right reverse in right-to-left text.`,
    `## 键盘操作

| 按键 | 滑块手柄聚焦时的结果 |
| --- | --- |
| 右/上方向键 | 增加一个步长。 |
| 左/下方向键 | 减少一个步长。 |
| Page Up/Page Down 或 Shift+方向键 | 按大步长调整。 |
| Home/End | 到达允许的最小值/最大值。 |
| Tab | 依次遍历手柄，再离开滑块。 |

每次调整立即改变值。范围手柄不能越过相邻手柄的允许边界。左/右方向键在从右到左的文字中反转。`,
  ],
  "list-box": [
    `## Keyboard reference

| Key | Result |
| --- | --- |
| Tab | Enter the list, then leave it on the next Tab. |
| Up/Down Arrow | Move between options in the default vertical list. |
| Home/End | Reach the first/last enabled option. |
| Type an option's name | Find a matching option. |
| Space/Enter | Choose the focused option in manual single-selection mode. |
| Space | Toggle the focused option in multiple-selection mode. |

The default single-selection list selects as focus moves. With multiple selection, arrows normally move focus without changing selection; Shift+Arrow extends a range. Do not confuse highlighted focus with a selected value.`,
    `## 键盘操作

| 按键 | 结果 |
| --- | --- |
| Tab | 进入列表，再按 Tab 离开。 |
| 上/下方向键 | 在默认纵向列表中移动焦点。 |
| Home/End | 到达首个/末个可用选项。 |
| 输入选项名称 | 查找匹配项。 |
| 空格/Enter | 手动单选模式下选择聚焦项。 |
| 空格 | 多选模式下切换聚焦项的选择状态。 |

默认单选列表会随焦点移动而选择。多选时方向键通常只移动焦点，Shift+方向键扩展范围。焦点高亮不等于已选值。`,
  ],
  "number-field": [
    `## Keyboard reference

| Key | Result in the numeric input |
| --- | --- |
| Up/Down Arrow | Increase/decrease by one step. |
| Page Up/Page Down | Increase/decrease by the large step. |
| Home/End | Reach a configured minimum/maximum. |
| Enter or Tab out | Commit typed text using the field's bounds and step. |

Normal text editing remains available. Tab also reaches the decrement/increment buttons; Enter or Space activates them. Read-only values cannot be stepped.`,
    `## 键盘操作

| 按键 | 数字输入框内的结果 |
| --- | --- |
| 上/下方向键 | 增加/减少一个步长。 |
| Page Up/Page Down | 按大步长增加/减少。 |
| Home/End | 到达已配置的最小值/最大值。 |
| Enter 或 Tab 离开 | 按字段范围与步长提交输入文字。 |

保留常规文本编辑。Tab 也可到达减少/增加按钮，再用 Enter 或空格激活。只读值不能通过步进改变。`,
  ],
  "input-otp": [
    `## Keyboard reference

| Key | Result |
| --- | --- |
| Typing | Fill the code using accepted characters. |
| Left/Right Arrow, Home/End | Move the native input's selection within the code. |
| Backspace/Delete | Edit the code at the selection. |
| Platform paste/undo/redo shortcuts | Paste or edit through the native input. |

The visible slots belong to one input, not separate Tab stops. Tab leaves the code field instead of stepping through every slot.`,
    `## 键盘操作

| 按键 | 结果 |
| --- | --- |
| 输入文字 | 用允许的字符填写验证码。 |
| 左/右方向键、Home/End | 在验证码内移动原生输入框的选区。 |
| Backspace/Delete | 在选区位置编辑验证码。 |
| 平台的粘贴/撤销/重做快捷键 | 通过原生输入框粘贴或编辑。 |

可见槽位属于同一个输入框，不是独立的 Tab 停靠点。Tab 离开整个验证码字段，而不是逐个遍历槽位。`,
  ],
  "page-control": [
    `## Keyboard reference

| Key | Result |
| --- | --- |
| Tab | Focus the selected page indicator. |
| Right/Down Arrow | Select and focus the next page. |
| Left/Up Arrow | Select and focus the previous page. |
| Home/End | Select the first/last page. |

Selection changes immediately and stops at the ends. Left/Right follow text direction. Watch the Page output in the preview as you move.`,
    `## 键盘操作

| 按键 | 结果 |
| --- | --- |
| Tab | 聚焦当前选中的页面指示器。 |
| 右/下方向键 | 选中并聚焦下一页。 |
| 左/上方向键 | 选中并聚焦上一页。 |
| Home/End | 选中第一页/最后一页。 |

选择立即变化，在两端停止。左/右方向键遵循文字方向，可在预览的 Page 输出中观察变化。`,
  ],
  "wheel-picker": [
    `## Keyboard reference

| Key | Result in a focused wheel |
| --- | --- |
| Up/Down Arrow | Move through enabled options. |
| Home/End | Reach the first/last enabled option. |
| Tab | Move to the next wheel or leave the control. |

The wheel uses single-selection ListBox navigation, so moving to an option changes the value. In the default preview, adjust Hours and Minutes independently and inspect Duration. Scrolling is not required.`,
    `## 键盘操作

| 按键 | 滚轮聚焦时的结果 |
| --- | --- |
| 上/下方向键 | 在可用选项间移动。 |
| Home/End | 到达首个/末个可用选项。 |
| Tab | 移到下一个滚轮或离开控件。 |

滚轮使用单选 ListBox 导航，移到选项即改变值。默认预览中可分别调整 Hours 和 Minutes，在 Duration 中查看结果，不需要滚动手势。`,
  ],
  accordion: [
    `## Keyboard reference

| Key | Result |
| --- | --- |
| Tab/Shift+Tab | Visit each trigger and interactive content in expanded panels. |
| Enter/Space | Expand or collapse the focused trigger's panel. |

Arrow keys do not move between accordion headings in this implementation. Use Tab, not the tab-list or menu keyboard model.`,
    `## 键盘操作

| 按键 | 结果 |
| --- | --- |
| Tab/Shift+Tab | 遍历各触发器及已展开面板内的交互内容。 |
| Enter/空格 | 展开或收起聚焦触发器对应的面板。 |

当前实现不使用方向键在折叠标题间导航。请使用 Tab，不要套用标签列表或菜单的键盘模型。`,
  ],
  "swipe-actions": [
    `## Keyboard-only walkthrough

1. Tab to a row's labelled action-reveal button in the default inbox preview and press Enter.
2. Tab to an exposed action. Press Escape to hide the actions and restore focus without removing the row.
3. Reveal the actions again and activate Archive or Delete with Enter. The demo removes that row and updates its status.
4. Tab to Reset inbox and press Enter to restore the demo rows.

The reveal buttons provide the keyboard alternative to swiping. Arrow keys are not required to perform a swipe gesture.`,
    `## 纯键盘演练

1. 在默认收件箱预览中按 Tab 聚焦某行带标签的操作展开按钮，按 Enter 展开。
2. 按 Tab 聚焦已显示的操作。按 Escape 隐藏操作并恢复焦点，不移除该行。
3. 再次展开，用 Enter 激活 Archive 或 Delete。示例移除该行并更新状态。
4. 按 Tab 聚焦 Reset inbox，按 Enter 恢复示例行。

操作展开按钮是滑动手势的键盘替代方式，不需要用方向键模拟滑动。`,
  ],
  "search-field": [
    `## Keyboard reference

Tab focuses the search input. Type and edit with native text keys. Escape clears a non-empty editable query; the clear button is also reachable with Tab and activated with Enter or Space. Clearing keeps focus in the input. SearchField does not supply an arrow-key suggestion list by itself.`,
    `## 键盘操作

Tab 聚焦搜索框，使用原生文本按键输入和编辑。Escape 清空非空且可编辑的查询；也可用 Tab 聚焦清空按钮，再按 Enter 或空格。清空后焦点留在输入框。SearchField 本身不提供方向键建议列表。`,
  ],
  tooltip: [
    `## Keyboard reference

Tab to the tooltip trigger to reveal its description without hovering. Escape dismisses the tooltip without moving focus. Tab away to continue navigating. A tooltip is descriptive, not an interactive popup; use Popover for content that contains focusable controls.`,
    `## 键盘操作

按 Tab 聚焦触发器，无需悬停即可显示说明。Escape 关闭提示，不移动焦点；Tab 离开并继续导航。Tooltip 用于描述，不是交互浮层；包含可聚焦控件的内容应使用 Popover。`,
  ],
  "tag-group": [
    `## Keyboard reference

| Key | Result |
| --- | --- |
| Arrow keys | Move focus between enabled tags; Left/Right follows text direction. |
| Home/End | Focus the first/last enabled tag. |
| Enter/Space | Select the focused tag according to selectionMode. |
| Type a tag's name | Focus a matching tag. |
| Delete/Backspace | Remove the focused tag only when removal is configured. |

Moving focus alone does not select a tag. The default preview supports selection, not removal. A tag's own remove button, when provided, is a separate action.`,
    `## 键盘操作

| 按键 | 结果 |
| --- | --- |
| 方向键 | 在可用标签间移动焦点，左/右遵循文字方向。 |
| Home/End | 聚焦首个/末个可用标签。 |
| Enter/空格 | 按 selectionMode 选择聚焦标签。 |
| 输入标签名称 | 聚焦匹配标签。 |
| Delete/Backspace | 仅在配置了移除能力时移除聚焦标签。 |

只移动焦点不会选择标签。默认预览支持选择，不支持移除；若提供标签移除按钮，它是独立操作。`,
  ],
  "refresh-control": [
    `## Keyboard-only walkthrough

1. Tab to Refresh in the default preview and press Enter or Space instead of pulling the list down.
2. Wait for the refresh to finish. The updates count increases and the rows show Updated just now.
3. Activate Refresh again to repeat. A pending refresh does not start a second concurrent refresh.

The explicit trigger is the keyboard alternative to the pull gesture. The scroll viewport keeps its native scrolling keys.`,
    `## 纯键盘演练

1. 在默认预览中按 Tab 聚焦 Refresh，按 Enter 或空格，无需下拉列表。
2. 等待刷新结束，updates 计数增加，列表行显示 Updated just now。
3. 再次激活 Refresh 可重复刷新。刷新进行中不会并发启动第二次刷新。

明确的触发按钮是下拉手势的键盘替代方式，滚动视口保留原生滚动按键。`,
  ],
  "section-index": [
    `## Keyboard reference

Tab to an index entry, use arrow keys to move focus, and press Enter to jump to its section. Moving focus alone does not activate the section. Tab leaves the index. This is the keyboard alternative to dragging along the letters; it is not an automatically selecting tab list.`,
    `## 键盘操作

按 Tab 聚焦索引项，用方向键移动焦点，再按 Enter 跳到对应分区。只移动焦点不会激活分区，Tab 离开索引。这是沿字母拖动的键盘替代方式，不是自动选择的标签列表。`,
  ],
  calendar: [
    `## Keyboard-only walkthrough

1. Tab into the default calendar's day grid.
2. Use Left/Right Arrow to move one day or Up/Down Arrow to move one week. Focus moves without selecting a new date.
3. Press Page Up/Page Down to move a month, or Shift+Page Up/Page Down to move a year. Home/End reaches the start/end of the week.
4. Press Enter or Space to select the focused available date, then Tab to leave the grid.

Horizontal arrows follow text direction. Date bounds and unavailable dates can restrict selection; a focused date is not necessarily selectable.`,
    `## 纯键盘演练

1. 按 Tab 进入默认日历的日期网格。
2. 用左/右方向键移动一天，上/下方向键移动一周。焦点移动，不会直接选中新日期。
3. Page Up/Page Down 移动一个月，Shift+Page Up/Page Down 移动一年，Home/End 到达一周的开始/结束。
4. 按 Enter 或空格选中聚焦且可用的日期，再按 Tab 离开网格。

横向方向键遵循文字方向。日期范围及不可用日期可能限制选择，获得焦点不代表一定可选。`,
  ],
  "range-calendar": [
    `## Keyboard-only walkthrough

1. Tab into the default Trip dates grid and use arrow keys to focus a start date.
2. Press Enter or Space to begin a range.
3. Use arrow keys to focus an end date, then Enter or Space to complete the range.
4. Inspect the selected span, then Tab out of the grid.

Left/Right moves one day; Up/Down moves one week. Page Up/Page Down moves a month; Shift adds year navigation. Home/End follows the week's boundaries (Monday-first in this preview). Moving focus alone does not commit a range. Escape is not a documented keyboard reset for an unfinished range in this implementation.`,
    `## 纯键盘演练

1. 按 Tab 进入默认 Trip dates 网格，用方向键聚焦开始日期。
2. 按 Enter 或空格开始选择范围。
3. 用方向键聚焦结束日期，再按 Enter 或空格完成范围。
4. 检查已选日期跨度，按 Tab 离开网格。

左/右移动一天，上/下移动一周。Page Up/Page Down 移动一个月，加 Shift 则移动一年。Home/End 遵循一周边界（此预览从周一开始）。只移动焦点不会提交范围。当前实现没有将 Escape 定义为未完成范围的键盘重置操作。`,
  ],
  "calendar-year-picker": [
    `## Keyboard-only walkthrough

1. Tab to the calendar's month/year heading button and press Enter to reveal the year grid.
2. Use Left/Right Arrow to move one year, or Up/Down Arrow to move three years in the three-column grid. Home/End reaches the first/last displayed year.
3. Press Enter or Space to choose a year. The year grid closes and focus returns to its heading button.
4. Open it again and press Escape to return without choosing a year.

Choosing a year changes the calendar's focused year, not its selected date. Select a day separately to commit a date. Horizontal arrows follow text direction.`,
    `## 纯键盘演练

1. 按 Tab 聚焦日历的月份/年份标题按钮，按 Enter 展开年份网格。
2. 左/右方向键移动一年，上/下方向键在三列网格中移动三年，Home/End 到达首个/末个显示的年份。
3. 按 Enter 或空格选择年份。年份网格关闭，焦点回到标题按钮。
4. 再次打开并按 Escape，不选择年份直接返回。

选择年份只改变日历聚焦的年份，不提交选中日期。还需单独选择某一天。横向方向键遵循文字方向。`,
  ],
  "date-field": [
    `## Keyboard reference

| Key | Result in an editable segment |
| --- | --- |
| Tab/Shift+Tab, Left/Right Arrow | Move between editable segments. |
| Digits | Fill the current segment; entry can advance automatically. |
| Up/Down Arrow | Increment/decrement the segment. |
| Page Up/Page Down | Adjust by a larger, segment-specific amount. |
| Home/End | Set the segment's minimum/maximum, not the entire date's bounds. |
| Backspace/Delete | Clear the segment; Backspace on an empty segment moves back. |

Segment order follows the field's locale. In 12-hour time, A/P chooses AM/PM while that segment is focused. Read-only fields retain navigation but reject edits. Group wrappers add no separate keyboard model.`,
    `## 键盘操作

| 按键 | 可编辑分段内的结果 |
| --- | --- |
| Tab/Shift+Tab、左/右方向键 | 在可编辑分段间移动。 |
| 数字 | 填写当前分段，可能自动前进。 |
| 上/下方向键 | 增加/减少分段值。 |
| Page Up/Page Down | 按分段对应的大步长调整。 |
| Home/End | 设为该分段的最小值/最大值，不是整个日期的边界。 |
| Backspace/Delete | 清空该分段；空分段上按 Backspace 返回前一段。 |

分段顺序遵循字段的区域设置。12 小时制下，在上午/下午分段按 A/P 选择 AM/PM。只读字段仍可导航但不可编辑。分组外壳不增加独立的键盘模型。`,
  ],
  "date-picker": [
    `## Keyboard-only walkthrough

1. Tab through the default Date field's editable segments. Up/Down Arrow edits the focused segment; Left/Right Arrow moves between them.
2. Tab to Choose date and press Enter to open the calendar. Tab to a day in the grid if focus starts on a header control.
3. Use arrows to move the focused date, then Enter or Space to select it. The default date-only example closes after selection.
4. Reopen and press Escape to close without choosing another date. Focus returns to Choose date.

The input is segmented, not a plain text date string. Opening can focus the year heading instead of a day. If year selection is expanded, Escape closes it first and returns focus to the heading; another Escape closes the date popup.`,
    `## 纯键盘演练

1. 用 Tab 遍历默认 Date 字段的可编辑分段。上/下方向键编辑当前分段，左/右方向键移动分段焦点。
2. 按 Tab 聚焦 Choose date（选择日期），按 Enter 打开日历。若焦点先落在头部控件，用 Tab 到达日期网格。
3. 用方向键移动日期焦点，按 Enter 或空格选中。默认的纯日期示例在选择后关闭。
4. 再次打开后按 Escape，关闭而不选择新日期，焦点回到 Choose date。

输入框是分段字段，不是普通日期字符串。打开时可能先聚焦年份标题，而不是日期。若年份选择已展开，Escape 先将其关闭并把焦点移回标题，再按 Escape 关闭日期弹层。`,
  ],
  "date-range-picker": [
    `## Keyboard-only walkthrough

1. Tab through the start and end segments in Trip dates. Arrow keys edit a segment or move to its neighbour.
2. Tab to Choose date and press Enter. Use Tab to reach the calendar's day grid if needed.
3. Use arrows and Enter/Space to choose a start date, then an end date. The default date-only picker closes when the range is complete.
4. Reopen and press Escape to dismiss the popup and return focus to Choose date.

The start/end fields edit one range. Calendar arrows move focus; they do not complete a range. Escape closes the popup rather than resetting the range. If year selection is expanded, Escape closes that layer first; another Escape dismisses the popup.`,
    `## 纯键盘演练

1. 用 Tab 遍历 Trip dates 的开始和结束日期分段，方向键编辑当前分段或移到相邻分段。
2. 按 Tab 聚焦 Choose date（选择日期），按 Enter 打开。必要时再用 Tab 进入日期网格。
3. 用方向键和 Enter/空格依次选择开始、结束日期。默认纯日期选择器在范围完整后关闭。
4. 再次打开后按 Escape，弹层关闭，焦点回到 Choose date。

开始/结束字段共同编辑一个范围。日历方向键只移动焦点，不完成范围。Escape 关闭弹层，不重置范围。若年份选择已展开，Escape 先关闭该层，再按一次关闭日期弹层。`,
  ],
  "color-area": [
    `## Keyboard reference

| Key | Result with the area thumb focused |
| --- | --- |
| Left/Right Arrow | Adjust the horizontal channel by one step. |
| Up/Down Arrow | Adjust the vertical channel by one step. |
| Shift+Arrow | Adjust by ten steps. |
| Page Up/Page Down | Adjust vertically by one tenth of the range. |
| Home/End | Reach the start/end of the horizontal channel. |

The area has one two-dimensional thumb. Each adjustment changes the color immediately; Tab leaves the area rather than switching between two axis controls.`,
    `## 键盘操作

| 按键 | 色域手柄聚焦时的结果 |
| --- | --- |
| 左/右方向键 | 按一个步长调整横向通道。 |
| 上/下方向键 | 按一个步长调整纵向通道。 |
| Shift+方向键 | 调整十个步长。 |
| Page Up/Page Down | 按范围的十分之一调整纵向通道。 |
| Home/End | 到达横向通道的起点/终点。 |

色域只有一个二维手柄。每次调整立即改变颜色，Tab 离开色域，不是在两个轴控件间切换。`,
  ],
  "color-slider": [
    `## Keyboard reference

| Key | Result with the channel thumb focused |
| --- | --- |
| Arrow keys | Adjust the channel by one step. |
| Shift+Arrow | Adjust by ten steps. |
| Page Up/Page Down | Adjust by one tenth of the range. |
| Home/End | Reach the channel's start/end. |

Tab focuses the thumb, not the label, output or track. Each key adjustment commits the color; it is not just a visual highlight.`,
    `## 键盘操作

| 按键 | 通道手柄聚焦时的结果 |
| --- | --- |
| 方向键 | 按一个步长调整通道。 |
| Shift+方向键 | 调整十个步长。 |
| Page Up/Page Down | 按范围的十分之一调整。 |
| Home/End | 到达通道的起点/终点。 |

Tab 聚焦手柄，而不是标签、输出或轨道。每次按键调整都会提交颜色，不只是改变高亮。`,
  ],
  "color-field": [
    `## Keyboard reference

| Key | Result in the default whole-color text field |
| --- | --- |
| Typing | Edit the displayed color text. |
| Enter or Tab out | Commit the edited text. |
| Up/Down Arrow | Increment/decrement through the color value model. |
| Home/End | Reach the model's minimum/maximum. |

Escape is not a custom text-revert command here. A field configured with channel uses a numeric input instead; the group wrapper adds no separate keyboard interaction.`,
    `## 键盘操作

| 按键 | 默认整色文本字段内的结果 |
| --- | --- |
| 输入文字 | 编辑显示的颜色文字。 |
| Enter 或 Tab 离开 | 提交编辑后的文字。 |
| 上/下方向键 | 通过颜色值模型增加/减少。 |
| Home/End | 到达模型的最小值/最大值。 |

此处没有自定义的 Escape 文字还原操作。配置 channel 后使用数字输入框；分组外壳不增加独立的键盘交互。`,
  ],
  "color-swatch-picker": [
    `## Keyboard reference

Tab into the palette, then use arrow keys to move focus between presets. Press Enter or Space to choose the focused color. Moving focus alone does not select it. Tab leaves the palette. Presets use their hexadecimal color values as accessible names in this implementation.`,
    `## 键盘操作

按 Tab 进入调色板，用方向键在预设间移动焦点，再按 Enter 或空格选择聚焦的颜色。只移动焦点不会选中。Tab 离开调色板。当前实现使用十六进制颜色值作为预设的无障碍名称。`,
  ],
  "color-picker": [
    `## Keyboard-only walkthrough

1. Tab to Pick a color and press Enter to open Colors in the default preview.
2. Tab to the Grid palette. Use arrows to focus a color, then Enter or Space to select it.
3. Tab to the Opacity slider and use arrows to adjust its value. The palette and slider edit the same color.
4. Press Escape to close the popover and return focus to Pick a color.

Choosing a color need not close this picker. Grid, Spectrum and Sliders are tabs; their focus/activation is separate from selecting a color inside them.`,
    `## 纯键盘演练

1. 按 Tab 聚焦 Pick a color，按 Enter 打开默认预览的 Colors。
2. 用 Tab 到达 Grid 调色板，用方向键聚焦颜色，再按 Enter 或空格选中。
3. 用 Tab 聚焦 Opacity 滑块，用方向键调整。调色板和滑块编辑同一个颜色。
4. 按 Escape 关闭浮层，焦点回到 Pick a color。

选中颜色不一定关闭选择器。Grid、Spectrum 和 Sliders 是标签页，其焦点/激活与内部颜色选择相互独立。`,
  ],
};

const sharedGuides: Record<string, string> = {
  drawer: "modal",
  radio: "radio-group",
  "segmented-control": "radio-group",
  stepper: "number-field",
  "date-input-group": "date-field",
  "time-field": "date-field",
  "color-input-group": "color-field",
};

export function keyboardGuidance(family: string, locale: "en" | "cn") {
  return guides[sharedGuides[family] ?? family]?.[locale === "cn" ? 1 : 0] ?? "";
}

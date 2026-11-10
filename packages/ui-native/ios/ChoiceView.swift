import ExpoModulesCore

final class StepperView: ControlView {
  let control = UIStepper()
  let onSize = EventDispatcher()
  let onValueChange = EventDispatcher()
  override var hosted: UIView { control }
  override var sizeEvent: EventDispatcher { onSize }
  override var minimumHeight: CGFloat { 44 }
  var value = 0.0
  var minimum = 0.0
  var maximum = 100.0
  var step = 1.0

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    attach()
    control.addTarget(self, action: #selector(changed), for: .valueChanged)
  }
  func update() {
    // Expand before contracting: UIKit adjusts the opposite bound if assigned out of order.
    control.maximumValue = max(control.maximumValue, maximum)
    control.minimumValue = minimum
    control.maximumValue = maximum
    control.stepValue = step
    control.value = value
    setNeedsLayout()
  }
  @objc private func changed() {
    let proposed = control.value
    control.value = value
    onValueChange(["value": proposed])
  }
}

struct SegmentRecord: Record {
  @Field var value = ""
  @Field var label = ""
  @Field var disabled = false
}

final class SegmentedView: ControlView {
  let control = UISegmentedControl()
  let onSize = EventDispatcher()
  let onValueChange = EventDispatcher()
  override var hosted: UIView { control }
  override var sizeEvent: EventDispatcher { onSize }
  override var fillsWidth: Bool { true }
  var items: [SegmentRecord] = []
  var value: String?
  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    attach()
    control.addTarget(self, action: #selector(changed), for: .valueChanged)
  }
  func update() {
    control.removeAllSegments()
    for (index, item) in items.enumerated() {
      control.insertSegment(withTitle: item.label, at: index, animated: false)
      control.setEnabled(!item.disabled, forSegmentAt: index)
    }
    restore()
    setNeedsLayout()
  }
  func restore() { control.selectedSegmentIndex = items.firstIndex { $0.value == value } ?? UISegmentedControl.noSegment }
  @objc private func changed() {
    let index = control.selectedSegmentIndex
    restore()
    guard items.indices.contains(index), !items[index].disabled else { return }
    onValueChange(["value": items[index].value])
  }
}

final class SelectionView: ControlView {
  let button = UIButton(type: .system)
  let onSize = EventDispatcher()
  let onTrigger = EventDispatcher()
  override var hosted: UIView { button }
  override var sizeEvent: EventDispatcher { onSize }
  override var minimumHeight: CGFloat { 44 }
  var kind = "checkbox"
  var label = ""
  var checked = false
  var tint: UIColor?
  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    attach()
    button.addTarget(self, action: #selector(changed), for: .primaryActionTriggered)
  }
  func update() {
    var config = kind == "toggle" ? (checked ? UIButton.Configuration.tinted() : .gray()) : .plain()
    config.title = label
    config.imagePadding = 8
    config.contentInsets = NSDirectionalEdgeInsets(top: 10, leading: 4, bottom: 10, trailing: 4)
    if kind != "toggle" {
      let symbol = kind == "radio" ? (checked ? "largecircle.fill.circle" : "circle") : (checked ? "checkmark.square.fill" : "square")
      config.image = UIImage(systemName: symbol)
    }
    button.isSelected = checked
    button.configuration = config
    button.tintColor = tint
    setNeedsLayout()
  }
  @objc private func changed() { onTrigger() }
}

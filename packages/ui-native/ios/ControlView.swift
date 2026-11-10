// UIKit hosting adapted from onlymoein/liquidglass a2d26488 (MIT).
// Copyright (c) 2026 Kelvin Zhang and Moein Saharkhiz.
// Modified: bounded change-driven measurement and explicit controlled-state restoration.
import ExpoModulesCore

final class AppearanceView: ExpoView {}

class ControlView: ExpoView {
  var hosted: UIView { fatalError("ControlView subclasses must provide their native control") }
  var sizeEvent: EventDispatcher { fatalError("ControlView subclasses must provide onSize") }
  var fillsWidth: Bool { false }
  private var reported: CGSize = .zero

  func attach() { clipsToBounds = false; addSubview(hosted) }

  override func layoutSubviews() {
    super.layoutSubviews()
    let constraint = CGSize(width: fillsWidth ? bounds.width : .greatestFiniteMagnitude, height: .greatestFiniteMagnitude)
    let fitting = hosted.sizeThatFits(constraint)
    let size = CGSize(width: ceil(fitting.width), height: ceil(fitting.height))
    hosted.frame = fillsWidth ? bounds : CGRect(x: (bounds.width-size.width)/2, y: (bounds.height-size.height)/2, width: size.width, height: size.height)
    if size != reported && size.width.isFinite && size.height.isFinite && size.height > 0 {
      reported = size
      sizeEvent(["width": size.width, "height": size.height])
    }
  }
}

final class ButtonView: ControlView {
  let button = UIButton(type: .system)
  let onSize = EventDispatcher()
  let onTrigger = EventDispatcher()
  override var hosted: UIView { button }
  override var sizeEvent: EventDispatcher { onSize }
  var label = ""
  var prominent = false
  var size = "lg"
  var tint: UIColor?
  var prefersOpaque = false

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    attach()
    button.addTarget(self, action: #selector(trigger), for: .touchUpInside)
    update()
  }
  @objc private func trigger() { onTrigger() }
  func update() {
    var config: UIButton.Configuration
    if #available(iOS 26.0, *) {
      config = prefersOpaque ? (prominent ? .filled() : .gray()) : (prominent ? .prominentGlass() : .glass())
    } else {
      config = prominent ? .filled() : .gray()
    }
    config.title = label
    config.buttonSize = size == "sm" ? .small : size == "md" ? .medium : .large
    if let tint {
      if prominent {
        config.baseBackgroundColor = tint
      } else {
        config.baseForegroundColor = tint
        config.titleTextAttributesTransformer = UIConfigurationTextAttributesTransformer { incoming in
          var outgoing = incoming
          // Keep UIKit attributes explicit; `.white` can otherwise select a SwiftUI key.
          outgoing.uiKit.foregroundColor = tint
          return outgoing
        }
      }
    }
    button.configuration = config
    button.tintColor = tint
    setNeedsLayout()
  }
}

final class SwitchView: ControlView {
  let control = UISwitch()
  let onSize = EventDispatcher()
  let onValueChange = EventDispatcher()
  override var hosted: UIView { control }
  override var sizeEvent: EventDispatcher { onSize }
  private var checked = false

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    attach()
    control.addTarget(self, action: #selector(changed), for: .valueChanged)
  }
  func setChecked(_ value: Bool) {
    checked = value
    if control.isOn != value { control.setOn(value, animated: window != nil) }
  }
  @objc private func changed() {
    let proposed = control.isOn
    control.setOn(checked, animated: false)
    onValueChange(["value": proposed])
  }
}

final class SliderView: ControlView {
  let control = UISlider()
  let onSize = EventDispatcher()
  let onValueChange = EventDispatcher()
  let onValueChangeEnd = EventDispatcher()
  override var hosted: UIView { control }
  override var sizeEvent: EventDispatcher { onSize }
  override var fillsWidth: Bool { true }
  var step = 1.0
  private var value = 0.0

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    attach()
    control.addTarget(self, action: #selector(changed), for: .valueChanged)
    control.addTarget(self, action: #selector(ended), for: [.touchUpInside, .touchUpOutside])
    control.addTarget(self, action: #selector(cancelled), for: .touchCancel)
  }
  func setValue(_ value: Double) {
    self.value = value
    applyValue()
  }
  func applyValue() {
    if !control.isTracking { control.value = Float(value) }
  }
  private var snapped: Double {
    let min = Double(control.minimumValue), max = Double(control.maximumValue)
    let raw = Double(control.value)
    return Swift.max(min, Swift.min(max, step > 0 ? min + ((raw-min)/step).rounded()*step : raw))
  }
  @objc private func changed() {
    let proposed = snapped
    control.value = Float(control.isTracking ? proposed : value)
    onValueChange(["value": proposed])
  }
  @objc private func ended() {
    let proposed = snapped
    control.value = Float(value)
    onValueChangeEnd(["value": proposed])
  }
  @objc private func cancelled() { control.value = Float(value) }
}

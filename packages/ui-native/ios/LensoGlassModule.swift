import ExpoModulesCore

public class LensoGlassModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LensoGlass")
    View(AppearanceView.self) {
      Prop("dark") { (view: AppearanceView, value: Bool) in view.overrideUserInterfaceStyle = value ? .dark : .light }
    }
    Constants {
      let available: Bool
      if #available(iOS 26.0, *) { available = true } else { available = false }
      return ["systemGlass": available, "refractiveGlass": false, "blurredGlass": true, "maxFusionMembers": 0] as [String: Any]
    }
    View(ButtonView.self) {
      Events("onSize", "onTrigger")
      Prop("controlLabel") { (view: ButtonView, value: String?) in view.button.accessibilityLabel = value }
      Prop("label") { (view: ButtonView, value: String) in view.label = value; view.update() }
      Prop("variant") { (view: ButtonView, value: String) in view.prominent = value == "prominent"; view.update() }
      Prop("size") { (view: ButtonView, value: String) in view.size = value; view.update() }
      Prop("opaque") { (view: ButtonView, value: Bool) in view.prefersOpaque = value; view.update() }
      Prop("tint") { (view: ButtonView, value: UIColor?) in view.tint = value; view.update() }
      Prop("disabled") { (view: ButtonView, value: Bool) in view.button.isEnabled = !value }
      Prop("dark") { (view: ButtonView, value: Bool) in view.overrideUserInterfaceStyle = value ? .dark : .light }
    }
    View(SwitchView.self) {
      Events("onSize", "onValueChange")
      Prop("controlLabel") { (view: SwitchView, value: String?) in view.control.accessibilityLabel = value }
      Prop("checked") { (view: SwitchView, value: Bool) in view.setChecked(value) }
      Prop("disabled") { (view: SwitchView, value: Bool) in view.control.isEnabled = !value }
      Prop("tint") { (view: SwitchView, value: UIColor?) in view.control.onTintColor = value }
      Prop("dark") { (view: SwitchView, value: Bool) in view.overrideUserInterfaceStyle = value ? .dark : .light }
    }
    View(SliderView.self) {
      Events("onSize", "onValueChange", "onValueChangeEnd")
      Prop("controlLabel") { (view: SliderView, value: String?) in view.control.accessibilityLabel = value }
      OnViewDidUpdateProps { (view: SliderView) in view.applyValue() }
      Prop("value") { (view: SliderView, value: Double) in view.setValue(value) }
      Prop("min") { (view: SliderView, value: Double) in view.control.minimumValue = Float(value) }
      Prop("max") { (view: SliderView, value: Double) in view.control.maximumValue = Float(value) }
      Prop("step") { (view: SliderView, value: Double) in view.step = max(0, value) }
      Prop("disabled") { (view: SliderView, value: Bool) in view.control.isEnabled = !value }
      Prop("tint") { (view: SliderView, value: UIColor?) in view.control.minimumTrackTintColor = value }
      Prop("dark") { (view: SliderView, value: Bool) in view.overrideUserInterfaceStyle = value ? .dark : .light }
    }
  }
}

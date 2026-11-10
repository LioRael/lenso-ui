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
      Prop("variant") { (view: ButtonView, value: String) in view.prominent = value == "prominent"; view.borderless = value == "borderless"; view.update() }
      Prop("glass") { (view: ButtonView, value: Bool) in view.usesGlass = value; view.update() }
      Prop("loading") { (view: ButtonView, value: Bool) in view.loading = value; view.update() }
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
    View(StepperView.self) {
      Events("onSize", "onValueChange")
      Prop("controlLabel") { (view: StepperView, value: String?) in view.control.accessibilityLabel = value }
      Prop("value") { (view: StepperView, value: Double) in view.value = value; view.update() }
      Prop("min") { (view: StepperView, value: Double) in view.minimum = value; view.update() }
      Prop("max") { (view: StepperView, value: Double) in view.maximum = value; view.update() }
      Prop("step") { (view: StepperView, value: Double) in view.step = value; view.update() }
      Prop("disabled") { (view: StepperView, value: Bool) in view.control.isEnabled = !value }
      Prop("dark") { (view: StepperView, value: Bool) in view.overrideUserInterfaceStyle = value ? .dark : .light }
      Prop("tint") { (view: StepperView, value: UIColor?) in view.control.tintColor = value }
    }
    View(SegmentedView.self) {
      Events("onSize", "onValueChange")
      Prop("controlLabel") { (view: SegmentedView, value: String?) in view.control.accessibilityLabel = value }
      Prop("items") { (view: SegmentedView, value: [SegmentRecord]) in view.items = value; view.update() }
      Prop("value") { (view: SegmentedView, value: String?) in view.value = value; view.restore() }
      Prop("disabled") { (view: SegmentedView, value: Bool) in view.control.isEnabled = !value }
      Prop("dark") { (view: SegmentedView, value: Bool) in view.overrideUserInterfaceStyle = value ? .dark : .light }
      Prop("tint") { (view: SegmentedView, value: UIColor?) in view.control.selectedSegmentTintColor = value }
    }
    View(SelectionView.self) {
      Events("onSize", "onTrigger")
      Prop("controlLabel") { (view: SelectionView, value: String?) in view.button.accessibilityLabel = value }
      Prop("label") { (view: SelectionView, value: String) in view.label = value; view.update() }
      Prop("kind") { (view: SelectionView, value: String) in view.kind = value; view.update() }
      Prop("checked") { (view: SelectionView, value: Bool) in view.checked = value; view.update() }
      Prop("disabled") { (view: SelectionView, value: Bool) in view.button.isEnabled = !value }
      Prop("dark") { (view: SelectionView, value: Bool) in view.overrideUserInterfaceStyle = value ? .dark : .light }
      Prop("tint") { (view: SelectionView, value: UIColor?) in view.tint = value; view.update() }
    }
  }
}

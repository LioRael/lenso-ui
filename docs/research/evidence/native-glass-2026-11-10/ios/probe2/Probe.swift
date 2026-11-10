import UIKit

@main final class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  func application(_ application: UIApplication, didFinishLaunchingWithOptions options: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    let window = UIWindow(frame: UIScreen.main.bounds)
    window.rootViewController = ProbeController()
    window.makeKeyAndVisible()
    self.window = window
    return true
  }
}

final class ProbeController: UIViewController {
  private let names = ["H setTitleColor white", "I updater label white", "J prominentClearGlass", "K glass blue + white", "L background blue"]
  private var samples: [UIButton] = []
  private var captions: [UILabel] = []
  private let heading = UILabel()
  private let toggle = UIButton(type: .system)
  private var dark = false
  override var preferredStatusBarStyle: UIStatusBarStyle { dark ? .lightContent : .darkContent }

  override func viewDidLoad() {
    super.viewDidLoad()
    view.backgroundColor = UIColor(red: 127/255, green: 174/255, blue: 181/255, alpha: 1)
    view.overrideUserInterfaceStyle = .light
    heading.text = "Native Glass title comparison"
    heading.font = .boldSystemFont(ofSize: 21)
    heading.textColor = .label
    view.addSubview(heading)
    for (index, name) in names.enumerated() {
      let label = UILabel()
      label.text = name
      label.font = .systemFont(ofSize: 12)
      label.backgroundColor = .secondarySystemBackground
      label.textColor = .label
      label.numberOfLines = 2
      view.addSubview(label)
      captions.append(label)
      let button = UIButton(type: .system)
      var config = UIButton.Configuration.prominentGlass()
      config.title = "Continue"
      config.buttonSize = .large
      if index == 2 { config = .prominentClearGlass(); config.title = "Continue"; config.buttonSize = .large }
      if index == 3 { config = .glass(); config.title = "Continue"; config.buttonSize = .large; config.baseBackgroundColor = .systemBlue }
      if index == 4 { config.background.backgroundColor = .systemBlue }
      if index >= 2 {
        config.titleTextAttributesTransformer = UIConfigurationTextAttributesTransformer { incoming in
          var outgoing = incoming
          outgoing.uiKit.foregroundColor = UIColor.white
          return outgoing
        }
      }
      button.configuration = config
      if index == 0 {
        button.setTitleColor(UIColor.white, for: .normal)
        button.setTitleColor(UIColor.white, for: .highlighted)
      }
      if index == 1 {
        button.configurationUpdateHandler = { button in button.titleLabel?.textColor = UIColor.white }
        button.setNeedsUpdateConfiguration()
      }
      button.accessibilityIdentifier = "sample-\(index)"
      view.addSubview(button)
      samples.append(button)
    }
    toggle.setTitle("Use dark appearance", for: .normal)
    toggle.addTarget(self, action: #selector(changeAppearance), for: .touchUpInside)
    view.addSubview(toggle)
  }

  override func viewDidLayoutSubviews() {
    super.viewDidLayoutSubviews()
    let top = view.safeAreaInsets.top
    heading.frame = CGRect(x: 24, y: top + 12, width: view.bounds.width - 48, height: 30)
    for (index, button) in samples.enumerated() {
      let y = top + 66 + CGFloat(index) * 82
      let size = button.sizeThatFits(CGSize(width: 1000, height: 1000))
      button.frame = CGRect(x: view.bounds.width - size.width - 24, y: y, width: size.width, height: size.height)
      captions[index].frame = CGRect(x: 24, y: y, width: button.frame.minX - 40, height: size.height)
    }
    toggle.frame = CGRect(x: 24, y: top + 660, width: view.bounds.width - 48, height: 44)
  }

  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    reportColors()
  }

  @objc private func changeAppearance() {
    dark.toggle()
    view.overrideUserInterfaceStyle = dark ? .dark : .light
    toggle.setTitle(dark ? "Use light appearance" : "Use dark appearance", for: .normal)
    setNeedsStatusBarAppearanceUpdate()
    view.layoutIfNeeded()
    reportColors()
  }

  private func reportColors() {
    func rgba(_ color: UIColor?, traits: UITraitCollection) -> String {
      guard let color else { return "nil" }
      var r: CGFloat = 0, g: CGFloat = 0, b: CGFloat = 0, a: CGFloat = 0
      guard color.resolvedColor(with: traits).getRed(&r, green: &g, blue: &b, alpha: &a) else { return color.description }
      return "\(r),\(g),\(b),\(a)"
    }
    for (index, button) in samples.enumerated() {
      button.layoutIfNeeded()
      let traits = button.traitCollection
      let record = "case=\(index) dark=\(dark) highlighted=\(button.isHighlighted) label=\(rgba(button.titleLabel?.textColor, traits: traits)) baseFg=\(rgba(button.configuration?.baseForegroundColor, traits: traits)) baseBg=\(rgba(button.configuration?.baseBackgroundColor, traits: traits)) tint=\(rgba(button.tintColor, traits: traits))"
      NSLog("LensoColorDiff %@", record)
    }
  }
}

import UIKit
import WebKit

@main final class App: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, configurationForConnecting session: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let configuration = UISceneConfiguration(name: "Controls", sessionRole: session.role)
        configuration.delegateClass = Scene.self
        return configuration
    }
}

final class Scene: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?
    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options: UIScene.ConnectionOptions) {
        guard let scene = scene as? UIWindowScene else { return }
        let window = UIWindow(windowScene: scene)
        window.rootViewController = Probe()
        window.makeKeyAndVisible()
        self.window = window
    }
}

final class Probe: UIViewController, UITableViewDataSource, UITableViewDelegate, UIPickerViewDataSource, UIPickerViewDelegate {
    let implementation = UISegmentedControl(items: ["Native", "Web"])
    let family = UISegmentedControl(items: ["Swipe", "Wheel"])
    let appearance = UISegmentedControl(items: ["Light", "Dark"])
    let reset = UIButton(type: .system)
    let table = UITableView(frame: .zero, style: .insetGrouped)
    let picker = UIPickerView()
    let web = WKWebView()
    let receipt = UILabel()
    let names = ["Design review", "Travel plans", "Weekly notes"]
    var actions = 0
    var opened = 0
    override var prefersStatusBarHidden: Bool { true }

    override func viewDidLoad() {
        super.viewDidLoad()
        for control in [implementation, family, appearance] {
            control.selectedSegmentIndex = 0
            control.addTarget(self, action: #selector(update), for: .valueChanged)
            view.addSubview(control)
        }
        reset.setTitle("Reset", for: .normal)
        reset.addTarget(self, action: #selector(resetValues), for: .touchUpInside)
        view.addSubview(reset)
        table.dataSource = self
        table.delegate = self
        table.rowHeight = 68
        table.contentInsetAdjustmentBehavior = .never
        view.addSubview(table)
        picker.dataSource = self
        picker.delegate = self
        picker.selectRow(15, inComponent: 0, animated: false)
        view.addSubview(picker)
        web.isOpaque = false
        web.scrollView.contentInsetAdjustmentBehavior = .never
        view.addSubview(web)
        receipt.font = .monospacedSystemFont(ofSize: 15, weight: .regular)
        receipt.textAlignment = .center
        view.addSubview(receipt)
        update()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        let width = view.bounds.width
        implementation.frame = CGRect(x: 16, y: 18, width: (width - 40) / 2, height: 32)
        family.frame = CGRect(x: width / 2 + 4, y: 18, width: (width - 40) / 2, height: 32)
        appearance.frame = CGRect(x: 16, y: 62, width: 180, height: 32)
        reset.frame = CGRect(x: width - 88, y: 62, width: 72, height: 32)
        table.frame = CGRect(x: 0, y: 110, width: width, height: 300)
        picker.frame = CGRect(x: (width - 240) / 2, y: 174, width: 240, height: 216)
        web.frame = CGRect(x: 0, y: 110, width: width, height: view.bounds.height - 110)
        receipt.frame = CGRect(x: 16, y: 424, width: width - 32, height: 32)
    }

    @objc func resetValues() {
        actions = 0
        opened = 0
        table.setEditing(false, animated: false)
        picker.selectRow(15, inComponent: 0, animated: false)
        update()
    }

    @objc func update() {
        let isWeb = implementation.selectedSegmentIndex == 1
        let isWheel = family.selectedSegmentIndex == 1
        let dark = appearance.selectedSegmentIndex == 1
        overrideUserInterfaceStyle = dark ? .dark : .light
        view.backgroundColor = .systemGroupedBackground
        table.isHidden = isWeb || isWheel
        picker.isHidden = isWeb || !isWheel
        receipt.isHidden = isWeb
        web.isHidden = !isWeb
        receipt.text = isWheel ? "Value \(picker.selectedRow(inComponent: 0))" : "Actions \(actions) · Opened \(opened)"
        if isWeb {
            let preview = Bundle.main.object(forInfoDictionaryKey: "LensoPreviewURL") as? String ?? "http://127.0.0.1:4311/test/ios-controls.html"
            var parts = URLComponents(string: preview)!
            parts.queryItems = [URLQueryItem(name: "panel", value: isWheel ? "wheel" : "swipe"), URLQueryItem(name: "theme", value: dark ? "dark" : "light")]
            web.load(URLRequest(url: parts.url!))
        }
    }

    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int { names.count }
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = UITableViewCell(style: .subtitle, reuseIdentifier: nil)
        cell.textLabel?.text = names[indexPath.row]
        cell.detailTextLabel?.text = "Demo message"
        cell.selectionStyle = .none
        return cell
    }
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        opened += 1
        receipt.text = "Actions \(actions) · Opened \(opened)"
    }
    func tableView(_ tableView: UITableView, leadingSwipeActionsConfigurationForRowAt indexPath: IndexPath) -> UISwipeActionsConfiguration? {
        let action = UIContextualAction(style: .normal, title: "Archive") { [weak self] _, _, complete in
            self?.actions += 1
            self?.receipt.text = "Actions \(self?.actions ?? 0) · Opened \(self?.opened ?? 0)"
            complete(true)
        }
        action.backgroundColor = .systemBlue
        return UISwipeActionsConfiguration(actions: [action])
    }
    func tableView(_ tableView: UITableView, trailingSwipeActionsConfigurationForRowAt indexPath: IndexPath) -> UISwipeActionsConfiguration? {
        let more = UIContextualAction(style: .normal, title: "More") { [weak self] _, _, complete in
            self?.actions += 1
            self?.receipt.text = "Actions \(self?.actions ?? 0) · Opened \(self?.opened ?? 0)"
            complete(true)
        }
        let delete = UIContextualAction(style: .destructive, title: "Delete") { [weak self] _, _, complete in
            self?.actions += 1
            self?.receipt.text = "Actions \(self?.actions ?? 0) · Opened \(self?.opened ?? 0)"
            complete(true)
        }
        let configuration = UISwipeActionsConfiguration(actions: [delete, more])
        configuration.performsFirstActionWithFullSwipe = false
        return configuration
    }
    func numberOfComponents(in pickerView: UIPickerView) -> Int { 1 }
    func pickerView(_ pickerView: UIPickerView, numberOfRowsInComponent component: Int) -> Int { 60 }
    func pickerView(_ pickerView: UIPickerView, titleForRow row: Int, forComponent component: Int) -> String? { String(row) }
    func pickerView(_ pickerView: UIPickerView, didSelectRow row: Int, inComponent component: Int) { receipt.text = "Value \(row)" }
}

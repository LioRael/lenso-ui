// Local research only. The private WebKit preference is not a shipping API.
import AppKit
import WebKit

final class GlassComparison: NSObject, NSApplicationDelegate, WKNavigationDelegate {
    var window: NSWindow!
    var views: [WKWebView] = []
    var labels: [ObjectIdentifier: NSTextField] = [:]

    func applicationDidFinishLaunching(_ notification: Notification) {
        let menu = NSMenu()
        let item = NSMenuItem()
        menu.addItem(item)
        let submenu = NSMenu()
        submenu.addItem(withTitle: "Quit Glass Probe", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        item.submenu = submenu
        NSApp.mainMenu = menu

        window = NSWindow(contentRect: NSRect(x: 60, y: 60, width: 1320, height: 900),
                          styleMask: [.titled, .closable, .resizable, .miniaturizable], backing: .buffered, defer: false)
        window.title = "Lenso — Native Liquid Glass comparison"
        let columns = NSStackView()
        columns.orientation = .horizontal
        columns.distribution = .fillEqually
        columns.spacing = 12
        columns.translatesAutoresizingMaskIntoConstraints = false
        let content = window.contentView!
        content.addSubview(columns)
        NSLayoutConstraint.activate([
            columns.leadingAnchor.constraint(equalTo: content.leadingAnchor, constant: 12),
            columns.trailingAnchor.constraint(equalTo: content.trailingAnchor, constant: -12),
            columns.topAnchor.constraint(equalTo: content.topAnchor, constant: 12),
            columns.bottomAnchor.constraint(equalTo: content.bottomAnchor, constant: -12),
        ])
        for enabled in [false, true] {
            let configuration = WKWebViewConfiguration()
            configuration.websiteDataStore = .nonPersistent()
            let preferences = configuration.preferences
            let available = preferences.responds(to: NSSelectorFromString("_setUseSystemAppearance:"))
            if enabled && available {
                preferences.setValue(true, forKey: "useSystemAppearance")
            }
            let view = WKWebView(frame: .zero, configuration: configuration)
            view.navigationDelegate = self
            let title = enabled ? "PRIVATE ENABLED" : "DEFAULT"
            let heading = NSTextField(labelWithString: "\(title) — setter available: \(available)")
            let status = NSTextField(wrappingLabelWithString: "Loading…")
            status.setAccessibilityIdentifier(enabled ? "enabled-result" : "default-result")
            let column = NSStackView(views: [heading, status, view])
            column.orientation = .vertical
            column.alignment = .leading
            column.spacing = 8
            columns.addArrangedSubview(column)
            view.widthAnchor.constraint(equalTo: column.widthAnchor).isActive = true
            views.append(view)
            labels[ObjectIdentifier(view)] = status
            let file = Bundle.main.url(forResource: "probe", withExtension: "html")!
            view.loadFileURL(file, allowingReadAccessTo: file.deletingLastPathComponent())
        }
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        webView.evaluateJavaScript("JSON.stringify(window.probe())") { result, error in
            let label = self.labels[ObjectIdentifier(webView)]!
            if let json = result as? String,
               let data = json.data(using: .utf8),
               let probe = try? JSONSerialization.jsonObject(with: data) as? [String: Any] {
                label.stringValue = "CSS glass supported: \(probe["glass"] ?? "unknown"); system blur supported: \(probe["systemBlur"] ?? "unknown")"
            } else {
                label.stringValue = "JavaScript failed: \(String(describing: error))"
            }
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        labels[ObjectIdentifier(webView)]?.stringValue = "Navigation failed: \(error.localizedDescription)"
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
let delegate = GlassComparison()
app.setActivationPolicy(.regular)
app.delegate = delegate
app.run()

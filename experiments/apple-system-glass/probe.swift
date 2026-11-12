// Local research only: the optional private preference is not a shipping API.
import AppKit
import WebKit

final class Probe: NSObject, WKNavigationDelegate {
    let window = NSWindow(contentRect: NSRect(x: 100, y: 100, width: 900, height: 850),
                          styleMask: [.titled, .closable], backing: .buffered, defer: false)
    let webView: WKWebView
    let mode: String
    let output: String

    init(file: String, mode: String, output: String) {
        self.mode = mode
        self.output = output
        let configuration = WKWebViewConfiguration()
        if mode == "private-enabled" {
            let selector = NSSelectorFromString("_setUseSystemAppearance:")
            guard configuration.preferences.responds(to: selector) else {
                fatalError("Private preference unavailable")
            }
            configuration.preferences.setValue(true, forKey: "useSystemAppearance")
        }
        webView = WKWebView(frame: window.contentView!.bounds, configuration: configuration)
        super.init()
        webView.autoresizingMask = [.width, .height]
        webView.navigationDelegate = self
        window.contentView!.addSubview(webView)
        window.title = "Lenso system glass probe: \(mode)"
        window.makeKeyAndOrderFront(nil)
        let url = URL(fileURLWithPath: file)
        webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            webView.evaluateJavaScript("JSON.stringify(window.probe())") { value, error in
                guard let json = value as? String, error == nil else {
                    print("Probe failed: \(String(describing: error))")
                    NSApp.terminate(nil)
                    return
                }
                print("\(self.mode): \(json)")
                webView.takeSnapshot(with: nil) { image, error in
                    if let data = image?.tiffRepresentation,
                       let bitmap = NSBitmapImageRep(data: data),
                       let png = bitmap.representation(using: .png, properties: [:]) {
                        do { try png.write(to: URL(fileURLWithPath: self.output)) }
                        catch { print("Snapshot write failed: \(error)") }
                    } else { print("Snapshot failed: \(String(describing: error))") }
                    NSApp.terminate(nil)
                }
            }
        }
    }
}

guard CommandLine.arguments.count == 4 else {
    fatalError("Usage: probe <absolute-probe.html> <default|private-enabled> <snapshot.png>")
}
let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let probe = Probe(file: CommandLine.arguments[1], mode: CommandLine.arguments[2], output: CommandLine.arguments[3])
DispatchQueue.main.asyncAfter(deadline: .now() + 20) {
    print("Probe timed out")
    app.terminate(nil)
}
app.run()

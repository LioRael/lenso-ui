import UIKit
import WebKit

@main final class App: UIResponder, UIApplicationDelegate {
    func application(_ application: UIApplication, configurationForConnecting session: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let configuration = UISceneConfiguration(name: "Calibration", sessionRole: session.role)
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

final class Probe: UIViewController, WKNavigationDelegate {
    let scroll = UIScrollView()
    let picture = UIImageView(image: UIImage(named: "pattern"))
    let web = WKWebView()
    let bar = UIView()
    let titleLabel = UILabel()
    let modes = UISegmentedControl(items: ["Native", "Baseline", "Variance", "Calibrated", "Refined"])
    let themes = UISegmentedControl(items: ["Light", "Dark"])
    let offsets = UISegmentedControl(items: ["Y 0", "Y 128", "Y 384"])
    let images = UISegmentedControl(items: ["Pattern", "Photo"])
    let trials = UISegmentedControl(items: ["Prev", "A", "B", "C", "D", "E", "F", "G", "H", "Now"])
    let receipt = UILabel()
    var position: CGFloat { [0, 128, 384][offsets.selectedSegmentIndex] }
    override var prefersStatusBarHidden: Bool { true }

    override func viewDidLoad() {
        super.viewDidLoad()
        scroll.contentInsetAdjustmentBehavior = .never
        scroll.contentInset.top = 96
        scroll.topEdgeEffect.style = .soft
        scroll.bottomEdgeEffect.isHidden = true
        scroll.showsVerticalScrollIndicator = false
        scroll.addSubview(picture)
        picture.contentMode = .scaleToFill
        view.addSubview(scroll)
        view.addSubview(web)
        web.isOpaque = false
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.scrollView.topEdgeEffect.isHidden = true
        web.scrollView.bottomEdgeEffect.isHidden = true
        web.navigationDelegate = self
        titleLabel.text = "Scroll edge"
        titleLabel.font = .systemFont(ofSize: 24, weight: .semibold)
        bar.addSubview(titleLabel)
        view.addSubview(bar)
        let interaction = UIScrollEdgeElementContainerInteraction()
        interaction.scrollView = scroll
        interaction.edge = .top
        bar.addInteraction(interaction)
        for control in [modes, themes, offsets, images, trials] {
            control.selectedSegmentIndex = control === offsets ? 1 : 0
            control.addTarget(self, action: #selector(update), for: .valueChanged)
            view.addSubview(control)
        }
        receipt.font = .monospacedSystemFont(ofSize: 10, weight: .regular)
        receipt.numberOfLines = 2
        view.addSubview(receipt)
        update()
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        let w = view.bounds.width, h = view.bounds.height
        scroll.frame = CGRect(x: 0, y: 0, width: w, height: h - 184)
        web.frame = scroll.frame
        picture.frame = CGRect(x: 0, y: 0, width: w, height: 1800)
        scroll.contentSize = picture.bounds.size
        bar.frame = CGRect(x: 0, y: 0, width: w, height: 96)
        titleLabel.frame = CGRect(x: 16, y: 32, width: 240, height: 32)
        modes.frame = CGRect(x: 12, y: h - 177, width: w - 24, height: 30)
        themes.frame = CGRect(x: 12, y: h - 141, width: 130, height: 30)
        offsets.frame = CGRect(x: 150, y: h - 141, width: w - 162, height: 30)
        images.frame = CGRect(x: 12, y: h - 106, width: 160, height: 28)
        receipt.frame = CGRect(x: 180, y: h - 106, width: w - 192, height: 28)
        trials.frame = CGRect(x: 12, y: h - 72, width: w - 24, height: 28)
        scroll.setContentOffset(CGPoint(x: 0, y: position), animated: false)
    }

    @objc func update() {
        let dark = themes.selectedSegmentIndex == 1
        overrideUserInterfaceStyle = dark ? .dark : .light
        view.backgroundColor = dark ? .black : .white
        scroll.backgroundColor = view.backgroundColor
        picture.image = UIImage(named: images.selectedSegmentIndex == 1 ? "photo" : "pattern")
        titleLabel.textColor = dark ? .white : .black
        web.isHidden = modes.selectedSegmentIndex == 0
        scroll.isHidden = !web.isHidden
        scroll.setContentOffset(CGPoint(x: 0, y: position), animated: false)
        if !web.isHidden {
            var url = URLComponents(url: Bundle.main.url(forResource: "web", withExtension: "html")!, resolvingAgainstBaseURL: false)!
            url.queryItems = [URLQueryItem(name: "mode", value: ["native", "baseline", "variance", "calibrated", "refined"][modes.selectedSegmentIndex]), URLQueryItem(name: "dark", value: dark ? "1" : "0"), URLQueryItem(name: "y", value: "\(Int(position))")]
            url.queryItems?.append(URLQueryItem(name: "image", value: images.selectedSegmentIndex == 1 ? "photo" : "pattern"))
            url.queryItems?.append(URLQueryItem(name: "trial", value: ["previous", "A", "B", "C", "D", "E", "F", "G", "H", "current"][trials.selectedSegmentIndex]))
            web.loadFileURL(url.url!, allowingReadAccessTo: Bundle.main.bundleURL)
        }
        receipt.text = "\(modes.titleForSegment(at: modes.selectedSegmentIndex)!) · y=\(Int(scroll.contentOffset.y)) · native soft · edge=96"
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        webView.evaluateJavaScript("JSON.stringify({y:document.querySelector('#viewport').scrollTop,width:innerWidth,dpr:devicePixelRatio})") { value, error in
            self.receipt.text = "\(self.modes.titleForSegment(at: self.modes.selectedSegmentIndex)!) · \(value ?? "no receipt")"
        }
    }
}

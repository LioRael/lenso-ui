import XCTest

final class NativeQATests: XCTestCase {
  func testHarnessBootstrap() throws {
    let app = XCUIApplication(bundleIdentifier: "com.apple.Preferences")
    app.activate()
    XCTAssertTrue(app.wait(for: .runningForeground, timeout: 10))
    let hierarchy = XCTAttachment(string: app.debugDescription)
    hierarchy.name = "bootstrap-hierarchy"
    hierarchy.lifetime = .keepAlways
    add(hierarchy)
    let screenshot = XCTAttachment(screenshot: app.screenshot())
    screenshot.name = "bootstrap-settings"
    screenshot.lifetime = .keepAlways
    add(screenshot)
    print("NATIVE_QA_HIERARCHY\n" + app.debugDescription)
  }
  func testInspectLenso() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "dev.lenso.nativeexample")
    app.activate()
    XCTAssertTrue(app.wait(for: .runningForeground, timeout: 15))
    let ready = app.switches["Notifications"].waitForExistence(timeout: 40)
    capture(app, name: "lenso-initial")
    XCTAssertTrue(ready, "Expo fixture did not display the native Notifications switch")
  }

  private func capture(_ app: XCUIApplication, name: String) {
    let hierarchy = XCTAttachment(string: app.debugDescription)
    hierarchy.name = name + "-hierarchy"
    hierarchy.lifetime = .keepAlways
    add(hierarchy)
    let screenshot = XCTAttachment(screenshot: app.screenshot())
    screenshot.name = name
    screenshot.lifetime = .keepAlways
    add(screenshot)
    print("NATIVE_QA_" + name + "\n" + app.debugDescription)
  }

  func testOpenDevelopmentURL() throws {
    continueAfterFailure = false
    let system = XCUIApplication(bundleIdentifier: "com.apple.springboard")
    capture(system, name: "system-before-open")
    let open = system.buttons["打开"]
    if open.exists && open.isHittable { open.tap() }
    let app = XCUIApplication(bundleIdentifier: "dev.lenso.nativeexample")
    app.activate()
    let ready = app.switches["Notifications"].waitForExistence(timeout: 40)
    capture(system, name: "system-after-open")
    capture(app, name: "lenso-after-open")
    XCTAssertTrue(ready, "Native Notifications switch not yet visible")
  }

  func testManualURLInspect() throws {
    continueAfterFailure = false
    let system = XCUIApplication(bundleIdentifier: "com.apple.springboard")
    capture(system, name: "system-before-cancel")
    let cancel = system.buttons["取消"]
    if cancel.exists && cancel.isHittable { cancel.tap() }
    let app = XCUIApplication(bundleIdentifier: "dev.lenso.nativeexample")
    app.activate()
    capture(app, name: "launcher-before-manual")
    let manual = app.buttons["Enter URL manually"]
    XCTAssertTrue(manual.waitForExistence(timeout: 5))
    manual.tap()
    capture(app, name: "manual-url-form")
  }

  func testConnectManualURL() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "dev.lenso.nativeexample")
    app.activate()
    capture(app, name: "manual-before-connect")
    let field = app.textFields["http://"]
    XCTAssertTrue(field.waitForExistence(timeout: 5))
    field.tap()
    field.typeText("http://127.0.0.1:8084")
    let connect = app.buttons["Connect"]
    XCTAssertTrue(connect.isEnabled)
    connect.tap()
    let ready = app.switches["Notifications"].waitForExistence(timeout: 40)
    capture(app, name: "lenso-connected")
    capture(XCUIApplication(bundleIdentifier: "com.apple.springboard"), name: "system-after-connect")
    XCTAssertTrue(ready, "Native Notifications switch not visible after direct Metro connection")
  }

  func testDismissDevMenuAndInspectNative() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "dev.lenso.nativeexample")
    app.activate()
    capture(app, name: "before-dev-menu-close")
    let close = app.buttons["Close"]
    XCTAssertTrue(close.waitForExistence(timeout: 5))
    close.tap()
    capture(app, name: "native-fixture-uncovered")
  }

  func testSnapshotNative() throws {
    let app = XCUIApplication(bundleIdentifier: "dev.lenso.nativeexample")
    app.activate()
    capture(app, name: "reload-ready-inspect")
    print("NATIVE_QA_BUTTONS\n" + app.buttons.debugDescription)
  }

  func testReloadFixture() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "dev.lenso.nativeexample")
    app.activate()
    capture(app, name: "before-reload-shortcut")
    app.typeKey("d", modifierFlags: .control)
    capture(app, name: "after-dev-menu-shortcut")
    let reload = app.buttons["Reload"]
    XCTAssertTrue(reload.waitForExistence(timeout: 5), "Observed Expo developer-menu shortcut did not expose Reload")
    reload.tap()
    let ready = app.staticTexts["Apple system controls and Glass"].waitForExistence(timeout: 30)
    capture(app, name: "after-layout-reload")
    XCTAssertTrue(ready, "Reloaded fixture did not expose its platform description")
  }

  func testNativeAcceptance() throws {
    try testProminentFinalCheck()
  }

  private func expect(_ message: String, condition: @escaping () -> Bool) {
    let predicate = NSPredicate { _, _ in condition() }
    let expectation = XCTNSPredicateExpectation(predicate: predicate, object: nil)
    XCTAssertEqual(XCTWaiter.wait(for: [expectation], timeout: 5), .completed, message)
  }

  func testProminentFinalCheck() throws {
    continueAfterFailure = false
    let app = XCUIApplication(bundleIdentifier: "dev.lenso.nativeexample")
    app.activate()
    XCTAssertTrue(app.switches["Notifications"].waitForExistence(timeout: 20))
    if app.buttons["Close"].exists && app.buttons["Close"].isHittable { app.buttons["Close"].tap() }
    if app.buttons["Use light appearance"].exists { app.buttons["Use light appearance"].tap() }
    capture(app, name: "prominent-light-before")
    let actions = app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH %@", "Actions ")).firstMatch
    let count = Int(actions.label.replacingOccurrences(of: "Actions ", with: ""))!
    app.buttons["Continue"].tap()
    expect("one callback after foreground transformer") { actions.label == "Actions \(count + 1)" }
    capture(app, name: "prominent-light-after-click")
    app.buttons["Use dark appearance"].tap()
    XCTAssertTrue(app.buttons["Use light appearance"].waitForExistence(timeout: 5))
    capture(app, name: "prominent-dark")
    app.buttons["Reduce transparency"].tap()
    XCTAssertTrue(app.buttons["Restore transparency"].waitForExistence(timeout: 5))
    capture(app, name: "prominent-dark-opaque")
    app.buttons["Restore transparency"].tap()
    XCTAssertTrue(app.buttons["Reduce transparency"].waitForExistence(timeout: 5))
    app.buttons["Use light appearance"].tap()
    XCTAssertTrue(app.buttons["Use dark appearance"].waitForExistence(timeout: 5))
    capture(app, name: "prominent-final-restored-light")
  }

}

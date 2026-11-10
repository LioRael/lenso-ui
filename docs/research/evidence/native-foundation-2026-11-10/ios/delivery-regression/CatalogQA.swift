import XCTest

final class CatalogQATests: XCTestCase {
  let app = XCUIApplication(bundleIdentifier: "dev.lenso.nativeexample")
  func capture(_ name: String) {
    let tree = app.debugDescription
    print("CATALOG_SCENE \(name)\n\(tree)")
    let hierarchy = XCTAttachment(string: tree); hierarchy.name = name + "-hierarchy"; hierarchy.lifetime = .keepAlways; add(hierarchy)
    let shot = XCTAttachment(screenshot: app.screenshot()); shot.name = name; shot.lifetime = .keepAlways; add(shot)
  }
  func expect(_ message: String, _ condition: @escaping () -> Bool) {
    XCTAssertEqual(XCTWaiter.wait(for: [XCTNSPredicateExpectation(predicate: NSPredicate { _, _ in condition() }, object: nil)], timeout: 5), .completed, message)
  }
  func button(_ label: String) -> XCUIElement { app.buttons[label].firstMatch }
  func text(_ label: String) -> XCUIElement { app.staticTexts[label].firstMatch }
  var catalogScroll: XCUIElement {
    let scroll = app.scrollViews.allElementsBoundByIndex.first { $0.frame.minY < 100 && $0.frame.height > 100 && $0.identifier != "backdrop-scroll" }
    XCTAssertNotNil(scroll, "Observed main scroll viewport must exist")
    return scroll!
  }
  func scrollEdge(upwards: Bool) {
    if upwards { catalogScroll.swipeUp() } else { catalogScroll.swipeDown() }
  }

  func reveal(_ element: XCUIElement, upwards: Bool = true) {
    for _ in 0..<12 {
      let targetFrame = element.frame
      let scrollFrame = catalogScroll.frame
      let visibleTop = max(scrollFrame.minY + 10, 80)
      let visibleBottom = min(scrollFrame.maxY - 10, app.keyboards.firstMatch.exists ? app.keyboards.firstMatch.frame.minY - 100 : scrollFrame.maxY - 10)
      if element.exists && element.isHittable && targetFrame.minY >= visibleTop && targetFrame.maxY <= visibleBottom { return }
      let moveUp = targetFrame.height > 0 ? targetFrame.minY >= visibleTop : upwards
      scrollEdge(upwards: moveUp)
    }
    capture("reveal-failure")
    XCTAssertTrue(element.isHittable, "Expected observed element to become hittable: \(element)")
  }
  func top() { for _ in 0..<7 { scrollEdge(upwards: false) } }
  func enterCatalog() {
    app.terminate()
    app.launchArguments = ["--initialUrl", "http://127.0.0.1:8085"]
    app.launch()
    if button("Close").exists && button("Close").isHittable { button("Close").tap() }
    if button("Open native catalog").waitForExistence(timeout: 20) { reveal(button("Open native catalog")); button("Open native catalog").tap() }
    XCTAssertTrue(text("Native controls").waitForExistence(timeout: 20))
    capture("catalog-entry")
  }
  func testCatalogConnect20261110() throws {
    let system = XCUIApplication(bundleIdentifier: "com.apple.springboard")
    if system.buttons["取消"].exists { system.buttons["取消"].tap() }
    app.terminate()
    app.launchArguments = ["-EXDevLauncherTryToLaunchLastBundle", "NO"]
    app.launch()
    capture("launcher-before-manual")
    let manual = button("Enter URL manually")
    XCTAssertTrue(manual.waitForExistence(timeout: 10)); manual.tap()
    let field = app.textFields["http://"]
    XCTAssertTrue(field.waitForExistence(timeout: 5)); field.tap(); field.typeText("http://127.0.0.1:8085")
    button("Connect").tap()
    XCTAssertTrue(button("Open native catalog").waitForExistence(timeout: 60))
    if button("Close").exists && button("Close").isHittable { button("Close").tap() }
    capture("connected8085")
  }

  func testCatalogTextFocus20261110() throws {
    continueAfterFailure = false
    app.activate(); capture("notes-focus-before")
    let notes = app.textViews["Notes"]
    reveal(notes); notes.tap(); capture("notes-focus-first-tap")
    if !app.keyboards.firstMatch.exists { notes.coordinate(withNormalizedOffset: CGVector(dx: 0.3, dy: 0.2)).tap(); capture("notes-focus-retry-tap") }
    XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 5))
    let before = notes.value as? String ?? ""
    XCTAssertTrue(app.keys["Q"].exists)
    app.keys["Q"].tap()
    expect("software keyboard edits actual UITextView") { notes.value as? String != before }
    capture("notes-focus-after-software-key")
  }
  func testCatalogDisabledGroup20261110() throws {
    app.activate(); capture("groups-disabled-before")
    for label in ["Email updates", "Push updates", "Personal plan", "Business plan", "Bold", "Italic"] { print("GROUP_AX \(label) enabled=\(button(label).isEnabled) selected=\(button(label).isSelected)") }
    let email = button("Email updates")
    reveal(email); let was = email.isSelected
    email.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    XCTAssertEqual(email.isSelected, was)
    capture("groups-disabled-after-touch")
  }
  func testCatalogKeyboardScroll20261110() throws {
    continueAfterFailure = false
    app.activate(); capture("keyboard-scroll-before")
    catalogScroll.swipeUp(); capture("keyboard-scroll-after-native-swipe")
    let search = app.searchFields["Search notes"]
    reveal(search); search.tap(); search.typeText("z\n")
    expect("held search restored") { search.value as? String == "glass" }
    capture("keyboard-scroll-search-rejected")
  }
  func testCatalogHeldSearch20261110() throws {
    continueAfterFailure = false
    enterCatalog()
    let search = app.searchFields["Search notes"]
    reveal(search); search.tap(); search.typeText("glass\n")
    expect("accepted search value") { search.value as? String == "glass" && self.text("Search submitted: glass").exists }
    top(); button("Hold values").tap()
    reveal(search); search.tap()
    print("MAIN_SCROLL_SELECTED \(catalogScroll.frame)")
    capture("held-search-before")
    search.typeText("z\n")
    expect("held search restores owner value") { search.value as? String == "glass" }
    capture("held-search-after")
    top(); button("Allow values").tap(); button("Back to Glass").tap()
    XCTAssertTrue(button("Open native catalog").waitForExistence(timeout: 10))
  }
  func testCatalogHeldChoicesVisual20261110() throws {
    continueAfterFailure = false
    enterCatalog(); button("Hold values").tap()
    reveal(button("Push updates")); button("Push updates").tap()
    expect("held checkbox") { !self.button("Push updates").isSelected && self.button("Email updates").isSelected && self.text("Delivery email").exists }
    reveal(button("Business plan")); button("Business plan").tap()
    expect("held radio") { !self.button("Business plan").isSelected && self.button("Personal plan").isSelected && self.text("Plan personal").exists }
    reveal(button("Italic")); button("Italic").tap()
    expect("held toggle") { !self.button("Italic").isSelected && self.button("Bold").isSelected && self.text("Format bold").exists }
    let segments = app.segmentedControls["Audience"]
    reveal(segments); segments.buttons["Business"].tap()
    expect("held segmented") { segments.buttons["Personal"].isSelected && self.text("Audience personal").exists }
    let stepper = app.steppers["Guests"]
    reveal(stepper); stepper.buttons["Increment"].tap()
    expect("held stepper") { self.text("Guests 2").exists }
    capture("held-choices-system")
    reveal(text("Caller StyleX color")); capture("catalog-caller-stylex-light")
    top(); button("Allow values").tap(); button("Use dark appearance").tap()
    capture("catalog-dark-actions")
    reveal(app.textFields["Read only"]); capture("catalog-dark-fields")
    reveal(segments); capture("catalog-dark-system")
    reveal(text("Caller StyleX color")); capture("catalog-dark-feedback")
    top(); button("Use light appearance").tap(); capture("catalog-restored-light")
    button("Back to Glass").tap()
    XCTAssertTrue(button("Open native catalog").waitForExistence(timeout: 10))
    capture("glass-after-catalog")
  }
  func testDeliveryValueCallbackRegression20261110() throws {
    continueAfterFailure = false
    enterCatalog()
    reveal(button("Push updates")); button("Push updates").tap()
    expect("post-change checkbox accepted") { self.button("Push updates").isSelected && self.text("Delivery email,push").exists }
    reveal(button("Business plan")); button("Business plan").tap()
    expect("post-change radio accepted") { self.button("Business plan").isSelected && self.text("Plan business").exists }
    reveal(button("Italic")); button("Italic").tap()
    expect("post-change toggle accepted") { self.button("Italic").isSelected && self.text("Format bold,italic").exists }
    let segments = app.segmentedControls["Audience"]
    reveal(segments); segments.buttons["Business"].tap()
    expect("post-change segmented accepted") { segments.buttons["Business"].isSelected && self.text("Audience business").exists }
    let stepper = app.steppers["Guests"]
    reveal(stepper); stepper.buttons["Increment"].tap()
    expect("post-change stepper accepted") { self.text("Guests 3").exists }
    capture("delivery-catalog-accepted")
    top(); button("Hold values").tap()
    reveal(button("Push updates")); button("Push updates").tap()
    expect("post-change checkbox held") { self.button("Push updates").isSelected && self.text("Delivery email,push").exists }
    reveal(button("Personal plan")); button("Personal plan").tap()
    expect("post-change radio held") { self.button("Business plan").isSelected && self.text("Plan business").exists }
    reveal(button("Italic")); button("Italic").tap()
    expect("post-change toggle held") { self.button("Italic").isSelected && self.text("Format bold,italic").exists }
    reveal(segments); segments.buttons["Personal"].tap()
    expect("post-change segmented held") { segments.buttons["Business"].isSelected && self.text("Audience business").exists }
    reveal(stepper); stepper.buttons["Decrement"].tap()
    expect("post-change stepper held") { self.text("Guests 3").exists }
    capture("delivery-catalog-held")
    top(); button("Allow values").tap(); button("Back to Glass").tap()
    let toggle = app.switches["Notifications"]
    XCTAssertTrue(toggle.waitForExistence(timeout: 10))
    reveal(toggle); toggle.tap()
    expect("post-change Glass switch accepted") { toggle.value as? String == "0" }
    let slider = app.sliders["Level"]
    reveal(slider); slider.adjust(toNormalizedSliderPosition: 0.70)
    let level = app.staticTexts.matching(NSPredicate(format: "label MATCHES %@", "Level [0-9]+")).firstMatch
    expect("post-change Glass slider accepted") { level.label != "Level 42" }
    let acceptedLevel = level.label
    let acceptedNativeLevel = slider.value as? String
    XCTAssertEqual(acceptedNativeLevel, acceptedLevel.replacingOccurrences(of: "Level ", with: "") + "%")
    capture("delivery-glass-accepted")
    reveal(button("Hold controlled values")); button("Hold controlled values").tap()
    reveal(toggle, upwards: false); toggle.tap()
    expect("post-change Glass switch held") { toggle.value as? String == "0" }
    reveal(slider); slider.adjust(toNormalizedSliderPosition: 0.20)
    expect("post-change Glass slider held") { level.label == acceptedLevel && slider.value as? String == acceptedNativeLevel }
    capture("delivery-glass-held")
    reveal(button("Allow value changes")); button("Allow value changes").tap()
    capture("delivery-glass-unlocked")
  }
  func testCatalogDiscovery20261110() throws {
    continueAfterFailure = false
    enterCatalog()
    for index in 0..<5 { catalogScroll.swipeUp(); capture("catalog-discovery-\(index)") }
    top(); capture("catalog-discovery-restored")
  }
  func testCatalogAcceptance20261110() throws {
    continueAfterFailure = false
    enterCatalog()
    reveal(button("Save settings")); button("Save settings").tap()
    expect("single action callback") { self.text("Actions 1").exists }
    XCTAssertFalse(button("Disabled action").isEnabled)
    button("Disabled action").coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    XCTAssertTrue(text("Actions 1").exists)
    button("Start loading").tap(); XCTAssertFalse(button("Loading action").isEnabled)
    button("Loading action").coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    XCTAssertTrue(text("Actions 1").exists)
    capture("catalog-loading-disabled")
    button("Stop loading").tap(); button("Loading action").tap()
    expect("restored action callback") { self.text("Actions 2").exists }
    capture("catalog-actions-accepted")
    let name = app.textFields["Name"]
    reveal(button("Focus name")); scrollEdge(upwards: true)
    reveal(button("Focus name"), upwards: false); button("Focus name").tap()
    XCTAssertTrue(app.keyboards.firstMatch.waitForExistence(timeout: 5))
    capture("catalog-forwarded-ref-focus")
    name.typeText(String(repeating: XCUIKeyboardKey.delete.rawValue, count: 3) + "Grace\n")
    expect("accepted native text field") { name.value as? String == "Grace" }
    let notes = app.textViews["Notes"]
    reveal(notes); notes.tap()
    let qKey = app.keys.matching(NSPredicate(format: "label ==[c] %@", "q")).firstMatch
    XCTAssertTrue(qKey.waitForExistence(timeout: 5)); qKey.tap()
    if text("Your display name").isHittable { text("Your display name").tap() }
    let search = app.searchFields["Search notes"].exists ? app.searchFields["Search notes"] : app.textFields["Search notes"]
    reveal(search); search.tap(); search.typeText("glass\n")
    expect("search submit uses native event text") { self.text("Search submitted: glass").exists }
    let editedNotes = notes.value as? String ?? ""
    XCTAssertTrue(editedNotes.lowercased().contains("q")); XCTAssertTrue(editedNotes.contains("Bring notes"))
    expect("textarea owner accepts observed edit") { self.text("Notes value: \(editedNotes)").exists }
    XCTAssertFalse(app.textFields["Read only"].isEnabled)
    XCTAssertEqual(app.textFields["Read only"].value as? String, "Reference")
    XCTAssertFalse(app.textFields["Disabled field"].isEnabled)
    let validation = app.textFields["Validation example"]
    reveal(validation); XCTAssertTrue(text("Enter a value").exists)
    validation.tap(); validation.typeText("ok\n")
    expect("validation state clears after editing") { validation.value as? String == "ok" && !self.text("Enter a value").exists }
    capture("catalog-fields-accepted")

    reveal(button("Push updates")); button("Push updates").tap()
    expect("checkbox owner/native agree") { self.button("Push updates").isSelected && self.text("Delivery email,push").exists }
    button("Business plan").tap()
    expect("radio owner/native agree") { self.button("Business plan").isSelected && !self.button("Personal plan").isSelected && self.text("Plan business").exists }
    reveal(button("Italic")); button("Italic").tap()
    expect("toggle owner/native agree") { self.button("Italic").isSelected && self.text("Format bold,italic").exists }
    capture("catalog-choices-accepted")
    reveal(button("Disable groups"), upwards: false); button("Disable groups").tap()
    for label in ["Email updates", "Push updates", "Personal plan", "Business plan", "Bold", "Italic"] {
      XCTAssertFalse(button(label).isEnabled, "Disabled parent must dominate child disabled=false: \(label)")
    }
    reveal(button("Email updates")); button("Email updates").coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    XCTAssertTrue(button("Email updates").isSelected)
    XCTAssertTrue(text("Delivery email,push").exists)
    capture("catalog-parent-disabled")
    reveal(button("Enable groups"), upwards: false); button("Enable groups").tap()

    let segments = app.segmentedControls["Audience"]
    reveal(segments); segments.buttons["Business"].tap()
    expect("segmented accepted and selected") { segments.buttons["Business"].isSelected && self.text("Audience business").exists }
    XCTAssertFalse(segments.buttons["Unavailable"].isEnabled)
    segments.buttons["Unavailable"].coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    XCTAssertTrue(segments.buttons["Business"].isSelected)
    XCTAssertTrue(text("Audience business").exists)
    let stepper = app.steppers["Guests"]
    reveal(stepper); stepper.buttons["Increment"].tap()
    expect("stepper accepted upper bound") { self.text("Guests 3").exists }
    capture("catalog-stepper-upper-bound-before")
    stepper.buttons["Increment"].coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    XCTAssertTrue(text("Guests 3").exists)
    capture("catalog-stepper-upper-bound-after")
    stepper.buttons["Decrement"].tap(); stepper.buttons["Decrement"].tap()
    expect("stepper accepted lower bound") { self.text("Guests 1").exists }
    capture("catalog-stepper-lower-bound-before")
    stepper.buttons["Decrement"].coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5)).tap()
    XCTAssertTrue(text("Guests 1").exists)
    capture("catalog-stepper-lower-bound-after")
    stepper.buttons["Increment"].tap()
    expect("stepper reset midpoint") { self.text("Guests 2").exists }
    capture("catalog-system-accepted-bounds")

    top(); button("Hold values").tap()
    expect("owner controlled rejection enabled") { self.text("Owner values: held").exists }
    reveal(name); name.tap(); name.typeText("x\n")
    expect("native text restored after rejected proposal") { name.value as? String == "Grace" && self.text("Name value: Grace").exists }
    reveal(notes); notes.tap()
    XCTAssertTrue(qKey.waitForExistence(timeout: 5)); qKey.tap()
    expect("textarea rejects controlled proposal") { notes.value as? String == editedNotes }
    if text("Your display name").isHittable { text("Your display name").tap() }
    reveal(search); search.tap(); search.typeText("z\n")
    expect("search rejects controlled proposal") { search.value as? String == "glass" }
    reveal(button("Push updates")); button("Push updates").tap()
    expect("rejected checkbox remains selected") { self.button("Push updates").isSelected && self.text("Delivery email,push").exists }
    button("Personal plan").tap()
    expect("rejected radio retains selected item") { self.button("Business plan").isSelected && !self.button("Personal plan").isSelected && self.text("Plan business").exists }
    reveal(button("Italic")); button("Italic").tap()
    expect("rejected toggle remains selected") { self.button("Italic").isSelected && self.text("Format bold,italic").exists }
    reveal(segments); segments.buttons["Personal"].tap()
    expect("rejected segmented proposal restored") { segments.buttons["Business"].isSelected && self.text("Audience business").exists }
    reveal(stepper); stepper.buttons["Increment"].tap()
    expect("rejected stepper proposal restored") { self.text("Guests 2").exists }
    capture("catalog-controlled-rejection")
    reveal(text("Caller StyleX color")); capture("catalog-caller-stylex-light")
    top(); button("Allow values").tap(); button("Use dark appearance").tap()
    capture("catalog-dark-actions")
    reveal(app.textFields["Read only"]); capture("catalog-dark-fields")
    reveal(segments); capture("catalog-dark-system")
    reveal(text("Caller StyleX color")); capture("catalog-dark-feedback")
    top(); button("Use light appearance").tap()
    capture("catalog-restored-light")
    button("Back to Glass").tap()
    XCTAssertTrue(button("Open native catalog").waitForExistence(timeout: 10))
    capture("glass-after-catalog")
  }
}

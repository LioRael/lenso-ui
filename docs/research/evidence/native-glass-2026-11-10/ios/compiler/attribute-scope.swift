import UIKit
func ambiguous(_ incoming: AttributeContainer) -> AttributeContainer {
  var outgoing = incoming
  outgoing.foregroundColor = .white
  return outgoing
}
func explicitUIKit(_ incoming: AttributeContainer) -> AttributeContainer {
  var outgoing = incoming
  outgoing.uiKit.foregroundColor = UIColor.white
  return outgoing
}

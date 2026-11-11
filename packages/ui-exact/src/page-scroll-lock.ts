interface ScrollLock {
  owners: Set<HTMLElement>;
  value: string;
  priority: string;
}
const documents = new WeakMap<Document, ScrollLock>();

/** Dialogs and anchored menus share one restoration point for each document. */
export function setPageScrollLock(node: HTMLElement, active: boolean) {
  const doc = node.ownerDocument,
    style = doc.documentElement.style;
  let lock = documents.get(doc);
  if (active) {
    if (!lock) {
      lock = {
        owners: new Set(),
        value: style.getPropertyValue("overflow"),
        priority: style.getPropertyPriority("overflow"),
      };
      documents.set(doc, lock);
      style.setProperty("overflow", "hidden", "important");
    }
    lock.owners.add(node);
  } else if (lock?.owners.delete(node) && !lock.owners.size) {
    if (lock.value) style.setProperty("overflow", lock.value, lock.priority);
    else style.removeProperty("overflow");
    documents.delete(doc);
  }
}

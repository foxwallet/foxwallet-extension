import { isPlainObject } from "@reduxjs/toolkit";

// Port serialization loses object identity. Reuse unchanged branches so a
// balance update doesn't invalidate selectors for accounts, settings or tokens.
export function reconcileState<T>(previous: T, incoming: T): T {
  if (Object.is(previous, incoming)) return previous;
  if (Array.isArray(previous) && Array.isArray(incoming)) {
    const items = incoming.map((item, index) =>
      reconcileState(previous[index], item),
    );
    return (
      previous.length === items.length &&
      items.every((item, index) => Object.is(item, previous[index]))
        ? previous
        : items
    ) as T;
  }
  if (isPlainObject(previous) && isPlainObject(incoming)) {
    const previousObject = previous as Record<string, unknown>;
    const incomingObject = incoming as Record<string, unknown>;
    const keys = Object.keys(incomingObject);
    let unchanged = keys.length === Object.keys(previousObject).length;
    const entries = keys.map((key) => {
      const value = reconcileState(previousObject[key], incomingObject[key]);
      unchanged &&=
        Object.prototype.hasOwnProperty.call(previousObject, key) &&
        Object.is(value, previousObject[key]);
      return [key, value];
    });
    return (unchanged ? previous : Object.fromEntries(entries)) as T;
  }
  return incoming;
}

export function bindElementsById(ids, root = document) {
  const elements = {};
  ids.forEach((id) => {
    const element = root.getElementById(id);
    if (!element) {
      throw new Error(`Missing required DOM element: ${id}`);
    }
    elements[id] = element;
  });
  return elements;
}

export function onElement(id, event, handler, root = document) {
  const element = root.getElementById(id);
  if (!element) {
    throw new Error(`Missing required DOM element: ${id}`);
  }
  element.addEventListener(event, handler);
}

export function normalizeMapBackgroundDimensions({
  src,
  width,
  height,
  fallbackWidth = 1024,
  fallbackHeight = 1024
}) {
  const normalizedWidth = Number.isFinite(width) && width > 0 ? Math.round(width) : fallbackWidth;
  const normalizedHeight = Number.isFinite(height) && height > 0 ? Math.round(height) : fallbackHeight;
  return {
    src,
    width: normalizedWidth,
    height: normalizedHeight,
    backgroundImage: src
  };
}

export function loadMapBackgroundDimensions({
  src,
  ImageCtor,
  fallbackWidth = 1024,
  fallbackHeight = 1024
}) {
  if (!ImageCtor) {
    return Promise.resolve(normalizeMapBackgroundDimensions({
      src,
      width: fallbackWidth,
      height: fallbackHeight,
      fallbackWidth,
      fallbackHeight
    }));
  }

  return new Promise((resolve, reject) => {
    const image = new ImageCtor();
    image.onload = () => resolve(normalizeMapBackgroundDimensions({
      src,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      fallbackWidth,
      fallbackHeight
    }));
    image.onerror = () => reject(new Error(`Map background failed to load: ${src}`));
    image.src = src;
  });
}

export function applyMapBackgroundDimensions(state, dimensions) {
  state.mapWorld = normalizeMapBackgroundDimensions({
    src: dimensions.src || dimensions.backgroundImage,
    width: dimensions.width,
    height: dimensions.height
  });
  return state.mapWorld;
}

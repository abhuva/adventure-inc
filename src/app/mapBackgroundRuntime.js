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

export function loadMapBackgroundSet({
  backgrounds,
  ImageCtor
}) {
  return Promise.all(Object.entries(backgrounds || {}).map(async ([continentId, background]) => [
    continentId,
    await loadMapBackgroundDimensions({
      src: background.src,
      ImageCtor,
      fallbackWidth: background.fallbackWidth,
      fallbackHeight: background.fallbackHeight
    })
  ])).then((entries) => Object.fromEntries(entries));
}

export function applyMapBackgroundDimensions(state, dimensions) {
  state.mapWorld = normalizeMapBackgroundDimensions({
    src: dimensions.src || dimensions.backgroundImage,
    width: dimensions.width,
    height: dimensions.height
  });
  return state.mapWorld;
}

export function applyMapBackgroundSet(state, dimensionsByContinent = {}) {
  state.mapWorldByContinent = Object.fromEntries(Object.entries(dimensionsByContinent).map(([continentId, dimensions]) => [
    continentId,
    normalizeMapBackgroundDimensions({
      src: dimensions.src || dimensions.backgroundImage,
      width: dimensions.width,
      height: dimensions.height
    })
  ]));
  state.mapWorld = mapWorldForContinent(state);
  return state.mapWorldByContinent;
}

export function mapWorldForContinent(state, continentId = state.world?.focusedContinentId) {
  return state.mapWorldByContinent?.[continentId]
    || state.mapWorldByContinent?.old_marches
    || state.mapWorld
    || normalizeMapBackgroundDimensions({ src: "assets/map-bg.png" });
}

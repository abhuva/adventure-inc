export function createAppDataContext(initialPoiData = null) {
  let poiData = initialPoiData;

  return {
    getPoiData() {
      return poiData;
    },
    setPoiData(nextPoiData) {
      poiData = nextPoiData;
    }
  };
}

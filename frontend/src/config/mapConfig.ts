export const MAP_CONFIG = {
  berlin: {
    initial: {
      lat: 52.5163,
      lng: 13.3777,
      zoom: 11,
    },
    minZoom: 11,
    bounds: {
      sw: { lat: 52.338, lng: 13.088 },
      ne: { lat: 52.675, lng: 13.761 },
    },
  },
  lod: {
    districtZoom: 12,
    clusterZoom: 13,
  },
  delays: {
    warmupMs: 1200,
  },
} as const;

import {Deck} from '@deck.gl/core';
import {GeoJsonLayer, PolygonLayer} from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl';
import {LightingEffect, AmbientLight, _SunLight as SunLight} from '@deck.gl/core';
import {scaleThreshold} from 'd3-scale';

const DATA_URL =
  './buildings.geojson'; // eslint-disable-line

const COLOR_SCALE = scaleThreshold()
  .domain([2000.0, 2020.0])
  .range([
    [255,255,0],
    [255,0,0],
    [255,255,255],
  ]);

console.log(COLOR_SCALE(1999.0))

const INITIAL_VIEW_STATE = {
  latitude: 33.88,
  longitude: 35.52,
  zoom: 14,
  maxZoom: 16,
  pitch: 45,
  bearing: 0
};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 0.0
});

const dirLight = new SunLight({
  timestamp: Date.UTC(2019, 7, 1, 22),
  color: [255, 255, 255],
  intensity: 1.0,
  _shadow: true
});

const landCover = [[[-123.0, 49.196], [-123.0, 49.324], [-123.306, 49.324], [-123.306, 49.196]]];

// Set your mapbox token here
mapboxgl.accessToken = process.env.MapboxAccessToken; // eslint-disable-line

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v9',
  // Note: deck.gl will be in charge of interaction and event handling
  interactive: false,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom,
  bearing: INITIAL_VIEW_STATE.bearing,
  pitch: INITIAL_VIEW_STATE.pitch
});

const lightingEffect = new LightingEffect({ambientLight, dirLight});
lightingEffect.shadowColor = [0, 0, 0, 0.5];

export const deck = new Deck({
  canvas: 'deck-canvas',
  width: '100%',
  height: '100%',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: ({viewState}) => {
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    });
  },
  layers: [
    new PolygonLayer({
      id: 'ground',
      data: landCover,
      stroked: false,
      getPolygon: f => f,
      getFillColor: [0, 0, 0, 0]
    }),
    new GeoJsonLayer(
      {
        id: 'geojson',
        data: DATA_URL,
        opacity: 0.8,
        stroked: false,
        filled: true,
        extruded: true,
        wireframe: true,
        getElevation: f => f.properties.vacancy_ap * 50,
        getFillColor: f => {
          console.log(f.properties.Yr_Comp, COLOR_SCALE(f.properties.Yr_Comp));
          return COLOR_SCALE(f.properties.Yr_Comp)
        },
        pickable: true,
      }
    )
  ]
});

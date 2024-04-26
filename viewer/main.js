import "../style.css";
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { LineFeature } from "../draw/feature/DrawLine";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { SnapInteraction } from "../snapinteraction/Snap";
import { fromLonLat } from "ol/proj";
import { LineString, Point } from "ol/geom";
import { findIntersectPoint, findSlope } from "../utils/mathutils";
import { degToRad, radToDeg } from "three/src/math/MathUtils";
import { Style, RegularShape } from "ol/style";
import Stroke from "ol/style/Stroke";

let startCoordinate;

const style = [
  new Style({
    image: new RegularShape({
      stroke: new Stroke({ color: "orange", width: 3 }),
      points: 4,
      radius: 4,
      angle: Math.PI / 4,
      displacement: [5, 5],
    }),
  }),
  new Style({
    image: new RegularShape({
      stroke: new Stroke({ color: "orange", width: 3 }),
      points: 2,
      radius: 3,
      angle: Math.PI,
      displacement: [2, 12],
    }),
  }),
  new Style({
    image: new RegularShape({
      stroke: new Stroke({ color: "orange", width: 3 }),
      points: 2,
      radius: 3,
      angle: Math.PI / 2,
      displacement: [12, 2],
    }),
  }),
];

const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: fromLonLat([0, 0]),
    zoom: 2,
    projection: "EPSG:4326",
  }),
});

//axis layer and source

const axisSource = new VectorSource({});

const axisLayer = new VectorLayer({ source: axisSource });

const point = new Point([0, 0]);
const pointFeature = new Feature({ geometry: point });
axisSource.addFeature(pointFeature);
map.addLayer(axisLayer);

//xaxis

const xaxisFeature = new Feature({
  geometry: new LineString([
    [-500, 0],
    [500, 0],
  ]),
});

const yaxisFeature = new Feature({
  geometry: new LineString([
    [0, -500],
    [0, 500],
  ]),
});

axisSource.addFeatures([xaxisFeature, yaxisFeature]);

//source and layer for intersection coordinate

const intersectionFeature = new Feature();
const intersectionSource = new VectorSource({
  features: [intersectionFeature],
});
const interactionLayer = new VectorLayer({ source: intersectionSource });
map.addLayer(interactionLayer);

const drawSource = new VectorSource();
const drawLayer = new VectorLayer({ source: drawSource });

/**
 * line coordinate
 * 1st quadrant
 *
 */
const lineCoordinate = [
  [0, 0],
  [60, 60],
];

const lineString = new LineString(lineCoordinate);

const lineFeature = new Feature({ geometry: lineString });
drawSource.addFeature(lineFeature);

const drawLine = new LineFeature({ source: drawSource, type: "LineString" });

const snap = new SnapInteraction({ source: drawSource, pixelTolerance: 30 });

map.addInteraction(drawLine);
map.addInteraction(snap);

map.addLayer(drawLayer);

map.on("click", (browserEvent) => {
  startCoordinate = browserEvent.coordinate;
});

map.on("pointermove", (browserEvent) => {
  const endCoordinate = browserEvent.coordinate;
  if (startCoordinate) {
    let interactionCoordinate = findIntersectPoint(
      [startCoordinate, endCoordinate],
      lineCoordinate
    );

    interactionCoordinate = [interactionCoordinate.x, interactionCoordinate.y];
    const interactionPoint = new Point(interactionCoordinate);
    intersectionFeature.setGeometry(interactionPoint);
    //slope of pendulum clock
    const slopeOfPendulum = findSlope([startCoordinate, interactionCoordinate]);

    //slope of line
    // const slopeOfLine =
    //   (lineCoordinate[1][1] - lineCoordinate[0][1]) /
    //   (lineCoordinate[1][0] - lineCoordinate[0][0]);
    const slopeOfLine = Math.tan(degToRad(findSlope(lineCoordinate)));
    const lineStartCoordinate = lineCoordinate[0];
    const c2 = lineStartCoordinate[1] - slopeOfLine * lineStartCoordinate[0];
    const a2 = slopeOfLine;
    const b2 = -1;
    /**
     * perpendicularLine
     *
     * equation of line a1x+b1y+c1=0
     * equation fo line a2x+b2y+c2=0
     * point of intersection  (x,y) = ((b1×c2 − b2×c1)/(a1×b2 − a2×b1), (c1×a2 − c2×a1)/(a1×b2 − a2×b1))
     *
     */
    const slopeOfPerpendicularLine = -(1 / slopeOfLine);

    //y intercept of perpendicular line
    const c1 =
      startCoordinate[1] - slopeOfPerpendicularLine * startCoordinate[0];
    const a1 = slopeOfPerpendicularLine;
    const b1 = -1;
    const x = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1);
    const y = (c1 * a2 - c2 * a1) / (a1 * b2 - a2 * b1);
    console.log(x, y);
    const perpendicularIntersection = new Point([x, y]);
    const perpendicularFeature = new Feature({
      geometry: perpendicularIntersection,
    });
    perpendicularFeature.setStyle(style);
    axisSource.addFeature(perpendicularFeature);
  }
});

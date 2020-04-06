import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import MVT from 'ol/format/MVT';
import {Tile as TileLayer, VectorTile} from 'ol/layer';
import OSM from 'ol/source/OSM';
import { VectorTile as VectorTileSource} from 'ol/source';
import {Stroke, Style} from 'ol/style';
import {createXYZ} from 'ol/tilegrid';
import Overlay from 'ol/Overlay';

var raster = new TileLayer({
  source: new OSM()
});

var degrees2meters = function(lon,lat) {
  var x = lon * 20037508.34 / 180;
  var y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
  y = y * 20037508.34 / 180;
  return [x, y]
}

var styleSimple = new Style({
  stroke: new Stroke({
    color: '#880000',
    width: 3
  })
});

var vectorTileLayer = new VectorTile(
  {
    style: styleSimple,
    source: new VectorTileSource({
      tilePixelRatio: 1, // oversampling when > 1
      tileGrid: createXYZ({maxZoom: 19}),
      format: new MVT(),
      url: 'http://localhost:8080/geoserver/gwc/service/tms/1.0.0/vector_tiles_workspace:logradouro@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf'
    })
  }
);

var map = new Map({
  layers: [raster, vectorTileLayer],
  target: 'map',
  view: new View({
    center: degrees2meters(-46.643033731127005, -23.67397873817854),
    zoom: 18
  })
});


var info = document.createElement('div');
var overlay = new Overlay({element: info});
map.addOverlay(overlay);

var label = null;

map.on('pointermove', function(e) {

  vectorTileLayer.getFeatures(e.pixel).then(featureList => {

    featureList.forEach(feature => {
      label = feature.get('lg_nome');
      info.style.display = label ? '' : 'none';
      info.innerHTML = label;
      overlay.setPosition(e.coordinate);
    });
  });
});

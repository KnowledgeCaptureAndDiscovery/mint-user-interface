import '@polymer/polymer/polymer-legacy.js';
import '@danielturner/google-map/google-map.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

Polymer({
  is: 'google-map-bounding-box',

  _mapChanged: function() {
    if (this.map && this.map instanceof google.maps.Map && this.boundingBox) {
      this.map.data.setStyle({
        fillColor: '#1990d5',
        strokeColor: '#1990d5',
        strokeWeight: 1
      });
      // Remove existing layers
      var map = this.map;
      map.data.forEach(function(feature) {
        map.data.remove(feature);
      });

      var bbox = this.boundingBox;
      this.map.data.add({
        geometry: new google.maps.Data.Polygon([[
          {lat: bbox.ymax, lng: bbox.xmin},
          {lat: bbox.ymin, lng: bbox.xmin},
          {lat: bbox.ymin, lng: bbox.xmax},
          {lat: bbox.ymax, lng: bbox.xmax}
        ]])
      });
    }
  },

  properties: {
    map: {
      type: Object,
      observer: '_mapChanged'
    },
    boundingBox: {
      type: Object,
      observer: '_mapChanged'
    }
  }
});

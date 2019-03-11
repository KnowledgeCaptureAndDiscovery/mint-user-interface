import '@polymer/polymer/polymer-legacy.js';
import '@danielturner/google-map/google-map.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

Polymer({
  is: 'google-map-data-layer',

  _mapChanged: function() {
    if (this.map && this.map instanceof google.maps.Map && this.url) {
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
      
      this.map.data.loadGeoJson(this.url);
    }
  },

  properties: {
    map: {
      type: Object,
      observer: '_mapChanged'
    },
    url: {
      type: String,
      observer: '_mapChanged'
    }
  }
});

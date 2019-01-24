/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';

class MintCagData extends PolymerElement {
  static get is() {
    return 'mint-cag-data';
  }

  static get properties() {
    return {
      regions: {
        type: Array,
        value: null
      },
      regionName: String,
      region: {
        type: Object,
        computed: '_computeRegion(regionName, regions)',
        notify: true
      }
    };
  }

  _computeRegion(regionName, regions) {
    if(!regionName || !regions)
      return null;

    // Fetch the cags of the region. Note that the fetch is asynchronous,
    // which means `region.cags` may not be set initially (but that path
    // will be notified when the fetch completes).
    return this._getRegionObject(regionName, regions);
  }

  _getRegionObject(regionName, regions) {
    for (var i = 0; i< this.regions.length; i++) {
      var c = this.regions[i];
      if (c.id.endsWith("/" + regionName)) {
        return c;
      }
    }
    return null;
  }
}

window.customElements.define(MintCagData.is, MintCagData);

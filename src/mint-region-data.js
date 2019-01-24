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

class MintRegionData extends PolymerElement {
  static get is() {
    return 'mint-region-data';
  }

  static get properties() {
    return {
      regions: {
        type: Array,
        notify: true
      }
    };
  }

  constructor() {
    super();
    this._fetchCategories();
  }

  _fetchCategories() {
    var me = this
    //console.log('fetching regions');
    this._getResource({
      url: 'files/regions/list.json',
      onLoad(e) {
        me.set('regions', JSON.parse(e.target.responseText));
        //console.log(me.regions);
      },
      onError(e) {
      }
    }, 1);
  }

  _getResource(rq, attempts) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', function(e) {
      // Flaky connections might fail fetching resources
      if (attempts > 1) {
        this.debounce('_getResource', this._getResource.bind(this, rq, attempts - 1), 200);
      } else {
        rq.onError.call(this, e);
      }
    }.bind(this));

    xhr.open('GET', rq.url);
    xhr.send();
  }
}


window.customElements.define(MintRegionData.is, MintRegionData);

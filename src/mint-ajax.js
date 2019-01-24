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

class MintAjax extends PolymerElement {
  static get is() {
    return 'mint-ajax';
  }

  static get properties() {
    return {
      url: String,
      method: {
        type: String,
        value: "GET"
      },
      data: {
        type: Object,
        value: null
      },
      jsonData: {
        type: Boolean,
        value: false
      },
      result: {
        type: Object,
        notify: true
      },
      raw: {
        type: Boolean,
        value: false
      },
      auto: {
        type: Boolean,
        value: false
      },

      failure: {
        type: Boolean,
        notify: true,
        readOnly: true
      }
    };
  }

  static get observers() {
    return [
      '_fetchDataAuto(url, method, data)'
    ];
  }

  _fetchDataAuto(url, method, data) {
    return this._fetchData(url, method, data, false, null);
  }

  _fetchData(url, method, data, manual, info) {
    if(!url)
      return;
    if(!this.auto && !manual)
      return;

    var me = this;
    this._getResource({
      url: url,
      onLoad: function(e) {
        try {
          if(me.raw)
            me.set("result", e.target.responseText);
          else
            me.set("result", JSON.parse(e.target.responseText));
          me.dispatchEvent(new CustomEvent('mint-ajax-load', {detail: {response: me.result, info: info}}));
        }
        catch (ex) {
          console.log(ex);
          // No-op
        }
      },
      onError: function(e) {
        console.log("Cannot connect to wings");
        this._setFailure(true);
      }
    }, method, data);
  }

  _getResource(rq, method, data) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    xhr.withCredentials = true;
    if(method == "GET") {
      xhr.open(method, rq.url + (data ? ("?" + data) : ""));
      xhr.send();
    }
    else if(method == "POST") {
      xhr.open(method, rq.url);
      if(data) {
        if(this.jsonData) {
          xhr.setRequestHeader("Content-type", "application/json");
          xhr.send(JSON.stringify(data));
        }
        else {
          xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xhr.send(data);
        }
      }
      else
        xhr.send();
    }
  }

  _setFailure(val) {
    this.failure = true;
  }

  refresh() {
    this._fetchData(this.url, this.method, this.data, true, null);
  }

  fetch(info) {
    this._fetchData(this.url, this.method, this.data, true, info);
  }
}

customElements.define(MintAjax.is, MintAjax);

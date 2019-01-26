/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import { MintBaseRouter } from './mint-base-router.js';
import { scroll } from '@polymer/app-layout/helpers/helpers.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

//import './mint-button.js';
//import './mint-ajax.js';
//import './mint-image.js';
//import './mint-region-data.js';
import './mint-common-styles.js';
import './mint-base-router.js';

import './mint-govern-home.js';
import './mint-govern-planner.js';
import './mint-govern-cag.js';
import './mint-govern-load-cag.js';
import './mint-govern-analysis.js';

class MintGovern extends MintBaseRouter {
  static get is() { return 'mint-govern'; }

  static get template() {
    return html`
    <style include="mint-common-styles">

    </style>

    <!-- Insert parent template : app-router basically -->
    ${super.template}

    <!-- mint-region-data provides the list of regions -->
    <!--mint-region-data auto regions="{{regions}}"></mint-region-data-->

    <iron-pages role="main" selected="[[page]]" attr-for-selected="name" selected-attribute="visible">
      <!-- govern home  -->
      <mint-govern-home name="home" vocabulary="[[vocabulary]]"
        route="[[pageSubRoute.home]]"></mint-govern-home>

      <!-- govern analysis dashboard -->
      <mint-govern-analysis name="analysis" vocabulary="[[vocabulary]]"
        region="{{region}}" visible="[[visible]]"
        config="[[config]]" userid="[[userid]]"
        route="[[pageSubRoute.analysis]]"></mint-govern-analysis>

      <!-- govern planner -->
      <mint-govern-planner name="planner" vocabulary="[[vocabulary]]"
        region="{{region}}" visible="[[visible]]"
        config="[[config]]" userid="[[userid]]"
        route="[[pageSubRoute.planner]]"></mint-govern-planner>

      <!-- select variables from a cag -->
      <mint-govern-cag name="cag" vocabulary="[[vocabulary]]"
        visible="[[visible]]"
        config="[[config]]" userid="[[userid]]"
        route="[[pageSubRoute.cag]]"></mint-govern-cag>

      <!-- load a new cag and convert -->
      <mint-govern-load-cag name="load-cag" vocabulary="[[vocabulary]]"
        visible="[[visible]]"
        config="[[config]]" userid="[[userid]]"
        route="[[pageSubRoute.load-cag]]"></mint-govern-load-cag>
    </iron-pages>
`;
  }

  static get properties() {
    return Object.assign({}, super.properties, {
      config: Object,
      userid: String,

      modelCatalog: Object,
      vocabulary: Object,
      region: {
        type: Object,
        notify: true
      },
      visible: {
        type: Boolean,
        observer: '_visibleChanged'
      },
      page: {
        type: String,
        reflectToAttribute: true
      },
      numItems: {
        type: Number,
        value: 0
      },
      regions: {
        type: Array
      }
    });
  }

  ready() {
    super.ready();
    // listen for custom events
    this.addEventListener('change-section', (e)=>this._onChangeSection(e));
  }

  _visibleChanged(visible) {
    if (visible) {
      this.dispatchEvent(new CustomEvent('change-section', {
        bubbles: true, composed: true, detail: {title: 'GOVERN'}}));
    }
  }

  _onChangeSection(event) {
    var detail = event.detail;
    this.regionName = detail.region || '';
  }

  _routePageChanged(page) {
    //console.log("mint-govern: " + page);
    this.page = page || 'home';
    if(this.page != 'analysis')
      scroll({ top: 0, behavior: 'silent' });
  }
}

customElements.define(MintGovern.is, MintGovern);

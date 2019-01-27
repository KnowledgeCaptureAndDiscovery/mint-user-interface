import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/app-route/app-route.js';

import 'mint-map/mint-map.js';
import 'mint-chart/mint-chart.js';

import './mint-common-styles.js';

class MintVisualiztions extends PolymerElement {

  static get is() { return 'mint-visualizations'; }

  static get template() {
    return html`
    <style include="mint-common-styles">
      mint-map, mint-chart
      {
        width: 100%;
        height: 800px;
      }
    </style>

    <app-route route="[[route]]" pattern="/:datasetid/:viztype"
      data="{{routeData}}"></app-route>

    <div class="toolbar">
      <paper-button>Visualization</paper-button>
    </div>
    <div class="outer">
      <template is="dom-if" if="[[_isEqual(routeData.viztype, 'mint-map')]]">
        <mint-map variables="[[mapVariables]]"></mint-map>
      </template>
      <template is="dom-if" if="[[_isEqual(routeData.viztype, 'mint-chart')]]">
        <mint-chart id="[[routeData.datasetid]]"></mint-chart>
      </template>
    </div>
    <div class="toolbar bottom">
      <paper-button>&nbsp;</paper-button>
    </div>
`;
  }

  static get properties() {
    return {
      mapVariables: {
        type: Array,
        notify:true,
        readOnly:false,
        computed: '_getMapVariables(routeData)'
      }
    };
  }

  _isEqual(a, b) {
    return a==b;
  }

  _getMapVariables(routeData) {
    return [
      {
        dataset_id: routeData.datasetid
      }
    ];
  }
}

customElements.define(MintVisualiztions.is, MintVisualiztions);

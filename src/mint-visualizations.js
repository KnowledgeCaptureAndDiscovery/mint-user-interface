import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/app-route/app-route.js';

import './mint-common-styles.js';
import 'mint-map/mint-map.js';

class MintVisualiztions extends PolymerElement {

  static get is() { return 'mint-visualizations'; }

  static get template() {
    return html`
    <style include="mint-common-styles">
      mint-map, mint-trend
      {
        width: 100%;
        height: 800px;
      }
    </style>

    <app-route route="[[route]]" pattern="/:datasetid/:name/:viztype"
      data="{{routeData}}"></app-route>

    <template is="dom-if" if="[[_isEqual(routeData.viztype, 'mint-map')]]">
      <mint-map variables="[[mapVariables]]"></mint-trend>
    </template>


    <!--
    <div class="visualisation">
      <div class="toolbar">
        <paper-button>Visualization</paper-button>
      </div>
      <div class="outer">
        <iframe src="http://jonsnow.usc.edu:65532/mint-chart.html"></iframe>
      </div>
      <div class="toolbar bottom">
        <paper-button>&nbsp;</paper-button>
      </div>
    </div>

    <div>
        <h1>Other Visualizations</h1>
        <li><a href="http://jonsnow.usc.edu:65532/" target="_blank" class="text-muted">Mint-Map</a></li>
        <li><a href="http://jonsnow.usc.edu:65532/mint-trend.html" target="_blank" class="text-muted">Mint-Timeseries-Trend</a></li>
        <li><a href="http://jonsnow.usc.edu:65532/mint-chart.html" target="_blank" class="text-muted">Mint-Chart</a></li>
    </div>
    -->
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
        layerName: routeData.name.replace(/\s/, '_'),
        dataset_id: routeData.datasetid
      }
    ];
  }
}

customElements.define(MintVisualiztions.is, MintVisualiztions);

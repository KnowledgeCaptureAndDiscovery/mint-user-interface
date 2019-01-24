import '../node_modules/@polymer/polymer/polymer-element.js';
import './mint-common-styles.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { MintBaseRouter} from './mint-base-router.js';

import 'mint-map/mint-map.js';
import 'mint-trend/mint-trend.js';

class MintVisualiztions extends MintBaseRouter {

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
    <!-- Insert parent template : app-router basically -->
    ${super.template}

    <!--mint-map variables="[[mapVariables]]"></mint-map-->
    <mint-trend datasets="[[datasets]]"></mint-trend>

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
        value:[{ layerName: 'FLDAS_A_Rainf_f_tavg_2017_Daily',
                 md5: '604397880d1b057f4ea455d2a981de77',
                 dcid: 0
                }
              ]
      },
      datasets: {
        type: Object,
        notify:true,
        readOnly:false,
        value:{id: "fldas01_fldas02_trend_chart", type:"trend",url:""}
      }
    };
  }
}

customElements.define(MintVisualiztions.is, MintVisualiztions);

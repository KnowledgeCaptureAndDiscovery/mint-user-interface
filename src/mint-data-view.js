import '../node_modules/mint-chart/mint-chart.js';

import '@polymer/app-route/app-route.js';
import '@polymer/paper-button/paper-button.js';

import './mint-common-styles.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';

class MintDataView extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">
      mint-map, mint-chart, mint-time {
        height: 400px !important;
        width: 100%;
      }
      .visualisation {
        margin-bottom: 40px;
      }
    </style>

    <app-route route="[[route]]" pattern="/:dsid" data="{{routeData}}"></app-route>

    <div class="visualisation">
      <div class="toolbar">
        <paper-button>Visualize: [[routeData.dsid]]</paper-button>
      </div>
      <div class="outer">
        <mint-chart config="[[configBarChart]]"></mint-chart>
        <hr><br>
        <mint-chart config="[[configDotChart]]"></mint-chart>
        <hr><br>
        <mint-chart config="[[configPie2Chart]]"></mint-chart>
        <hr><br>
        <mint-chart config="[[configPieChart]]"></mint-chart>
        <hr><br>
        <mint-chart config="[[configBubbleBaseline]]"></mint-chart>
        <hr><br>
        <mint-chart config="[[configBubblePrecip_5_percent_dec]]"></mint-chart>
        <hr><br>
        <mint-chart config="[[configBubblePrecip_5_percent_inc]]"></mint-chart>
        <hr><br>
        <mint-chart config="[[configCombine]]"></mint-chart>
      </div>
      <div class="toolbar bottom">
        <paper-button>&nbsp;</paper-button>
      </div>
    </div>
`;
  }

  static get is() { return 'mint-data-view'; }

  static get properties() {
    return {
      route: Object,
      dataCatalog: Object,
      dsid: String,
      routeData: Object,
      configDotChart: {
        type: Object,
        notify:true,
        readOnly:false,
        value:{name: "dat", type:"dot", data:""}
      },
      configBarChart: {
        type: Object,
        notify:true,
        readOnly:false,
        value:{name: "climatology", type:"bar", data:""}
      },
      configCombine: {
        type: Object,
        notify:true,
        readOnly:false,
        value:{name: "", type:"combine", data:""}
      },
      configPieChart: {
        type: Object,
        notify:true,
        readOnly:false,
        value:{name: "", type:"pie", data:""}
      },
      configPie2Chart: {
        type: Object,
        notify:true,
        readOnly:false,
        value:{name: "second", type:"pie", data:""}
      },
      configBubbleBaseline: {
        type: Object,
        notify:true,
        readOnly:false,
        value:{name: "MINTlanduse Baseline 20180709", type:"bubble", data:"http://jonsnow.usc.edu:8081/mintmap/csv/MINTlanduse-baseline-20180709.json"}
      },
      configBubblePrecip_5_percent_dec:{
        type: Object,
        notify:true,
        readOnly:false,
        value:{name: "MINTlanduse Precip_5_percent_dec 20180709", type:"bubble", data:"http://jonsnow.usc.edu:8081/mintmap/csv/MINTlanduse-precip_5_percent_dec-20180709.json"}
      },
      configBubblePrecip_5_percent_inc:{
        type: Object,
        notify:true,
        readOnly:false,
        value:{name: "MINTlanduse Precip_5_percent_inc 20180709", type:"bubble", data:"http://jonsnow.usc.edu:8081/mintmap/csv/MINTlanduse-precip_5_percent_inc-20180709.json"}
      },
      visible: Boolean,
    };
  }

  static get observers() {
    return [
      '_routeDataChanged(visible, routeData.standardName, routeData.jsonHash)'
    ];
  }

  _routeDataChanged(visible, standardName, jsonHash) {
    var me = this;
    if(visible && standardName &&
        jsonHash && this.jsonHash != jsonHash) {
      var item = JSON.parse(atob(jsonHash.replace("|", "/")));
      this.set("datasetName", item.ds);
      var variable = {
        name: standardName,
        stdname: standardName,
        md5: item.md5,
        uri: item.id
      };
      me.set("variables", [variable]);
    }
  }

  _routePageChanged(page) {
    //console.log("mint-cags: " + page);
    this.page = page || 'home';
    if(this.page != 'list')
      scroll({ top: 0, behavior: 'silent' });
  }

  _getFileLocation(vid, fn) {
    this.dataCatalog.getDatasetLocation(vid, function(list) {
      if(list.length > 0)
        fn(list[0].storage_path.value);
    });
  }
}

customElements.define(MintDataView.is, MintDataView);

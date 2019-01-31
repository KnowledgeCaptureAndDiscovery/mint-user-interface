/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import '@polymer/app-route/app-route.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

import './mint-button.js';
import './mint-common-styles.js';
import './mint-ajax.js';
import './variable-graph.js';
import './mint-workflows.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

class MintGovernPlanner extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">

      :host {
        display: block;
      }

      .smooth {
        transition: opacity 0.4s;
        opacity: 0;
      }

      .smooth[has-content] {
        opacity: 1;
      }

      h1 {
        font-size: 24px;
        font-weight: 500;
        line-height: 28px;
        margin: 0;
      }

      .description {
        margin: 32px 0;
      }

      .description > h4 {
        margin: 16px 0;
      }

      .description > p {
        margin: 0;
        color: var(--app-secondary-color);
      }

      .detail {
        width: 90%;
        max-width: 1440px;
        margin:0 auto;
        margin-bottom: 5px;
      }

      .leftfull {
        width: 100%;
      }
      .rightnone {
        width: 0px;
        border-width: 0px;
      }
      .left {
        width: 60%;
      }
      .right {
        width: 40%;
      }

      #map {
        width:200px;
        height:150px;
      }
      .map {
        width: 200px;
        height: 150px;
        border: 2px solid var(--app-primary-color);
        border-radius: 4px;
        margin: 5px 0px;
      }
      .description {
        margin: 0px;
        vertical-align: top;
      }
      .detail h2 {
        margin: 5px 0px;
      }

      .content {
        @apply --layout-horizontal;
      }

      ul.footnote {
        padding: 2px;
        padding-left: 15px;
        font-size: 9px;
        margin: 0px;
        line-height: 1.2em;
      }

      @media (max-width: 767px) {
        .map {
          width: 100%;
          height: 150px;
          margin-bottom: 10px;
        }
        #map {
          width:100%;
          height:150px;
        }
        .description {
          margin-left: 0px;
        }
        .left, .right {
          width: 100%;
        }
        .content {
          @apply --layout-vertical;
          @apply --layout-center;
        }

        .detail {
          box-sizing: border-box;
          margin: 8px 0;
          padding: 0 24px;
          width: 100%;
          /*max-width: 600px;*/
        }

        h1 {
          font-size: 20px;
          line-height: 24px;
        }

      }
    </style>

    <!--
      app-route provides the name of the region and the cag.
    -->
    <app-route route="[[route]]" pattern="/:regionid/:questionid/:taskid/:dsid/:op" data="{{routeData}}"></app-route>

    <template is="dom-if" if="[[visible]]">
      <template is="dom-if" if="[[userid]]">
        <template is="dom-if" if="[[routeData.questionid]]">
          <iron-ajax auto="" url="[[config.server]]/users/[[userid]]/questions/[[routeData.questionid]]" handle-as="json" last-response="{{question}}"></iron-ajax>
          <template is="dom-if" if="[[question]]">
            <iron-ajax auto="" url="[[question.graph]]" handle-as="json" last-response="{{graph}}"></iron-ajax>
          </template>
          <iron-ajax auto="" url="[[config.server]]/users/[[userid]]/questions/[[routeData.questionid]]/tasks/[[routeData.taskid]]" handle-as="json" last-response="{{task}}"></iron-ajax>
        </template>
      </template>
    </template>

    <iron-media-query query="max-width: 767px" query-matches="{{smallScreen}}"></iron-media-query>

    <div smooth="">
      <!-- Variable Graph -->
      <div class="content">
        <div class="leftfull" id="graphdiv">
          <!--mint-ajax result="{{graphData}}" auto="" url="[[cag.json]]"></mint-ajax-->

          <iron-collapse id="main_graph" opened="" no-animation="">
            <variable-graph id="cag" visible="[[visible]]"
              config="[[config]]" userid="[[userid]]" region="[[region]]"
              questionid="[[routeData.questionid]]" question="[[question]]"
              taskid="[[routeData.taskid]]" task="[[task]]"
              operation="[[routeData.op]]" dsid="[[routeData.dsid]]"
              model-catalog="[[modelCatalog]]" data-catalog="[[dataCatalog]]"
              data="[[graph]]" workflows="{{workflows}}"
              editable="" auto-load=""></variable-graph>
          </iron-collapse>

          <iron-collapse id="temporary_graph" no-animation="">
            <variable-graph id="tmpcag" visible="[[visible]]" auto-layout=""
            data="[[selectedWorkflowGraph]]"></variable-graph>
          </iron-collapse>

          <ul class="footnote">
            <li>Double tap/click on the canvas to add a variable</li>
            <li>Double tap/click a variable to edit the variable</li>
            <li>Long press a variable to drag a link out of it</li>
          </ul>
        </div>

        <div class="rightnone" id="workflowdiv">
          <mint-workflows id="workflows" workflows="{{workflows}}"
            scenarios="[[scenarios]]" sub-region="[[cag.sub_region]]"
            selected-workflow="{{workflow}}" selected-graph="{{selectedWorkflowGraph}}"
            selected-items="{{selectedWorkflowItems}}"
            config="[[config]]" userid="[[userid]]"
            task="[[task]]" regionid="[[routeData.regionid]]"
            questionid="[[routeData.questionid]]" taskid="[[routeData.taskid]]"
            ></mint-workflows>
        </div>

      </div>
    </div>

`;
  }

  static get is() { return 'mint-govern-planner'; }

  static get properties() {
    return {
      config: Object,
      userid: {
        type: String,
        observer: '_useridChanged'
      },
      regionid: String,
      questionid: String,
      taskid: String,
      graph: Object,
      task: Object,
      operation: String,

      regions: Array,
      region: Object,
      workflow: Object,
      category: {
        type: Object,
        computed: '_computeCategory(visible, region.categories, routeData.category)'
      },
      cag: {
        type: Object,
        computed: '_computeCag(visible, category, routeData.cag)'
      },
      scenarios: {
        type: Array,
        computed: '_getScenarios(cag)'
      },
      route: Object,
      routeData: {
        type: Object,
        observer: '_routeChanged'
      },
      modelCatalog: Object,
      dataCatalog: Object,
      smallScreen: {
        type: Boolean,
        observer: '_resetSectionSizes'
      },

      workflows: {
        type: Array,
        observer: '_resetSectionSizes'
      },

      selectedWorkflowGraph: {
        type: Object,
        observer: '_temporaryGraphChanged'
      },

      selectedWorkflow: {
        type: Object
      },

      selectedWorkflowItems: {
        type: Array,
        observer: '_onSelectedWorkflowItemsChanged'
      },
      visible: {
        type: Boolean,
        value: false
      }
    };
  }

  _useridChanged(userid) {
    //console.log(userid);
  }
  _isDefined(cag) {
    return cag != null;
  }

  _computeCategory(visible, region_categories, catid) {
    if(!visible || !region_categories || !catid) return null;
    for (var i = 0; i<region_categories.length; i++) {
      var category = region_categories[i];
      if(category.name == catid) {
        // console.log(category);
        return category;
      }
    }
  }

  _computeCag(visible, category, cagid) {
    if(!visible || !category || !cagid) return null;
    for (var j=0; j<category.cags.length; j++) {
      var cag = category.cags[j];
      if (cag.id === cagid) {
        // console.log(cag);
        return cag;
      }
    }
  }

  _getScenarios(cag) {
    if(cag)
      return cag.scenarios;
  }

  /*
  _computeScenario(visible, cag, scenario_path) {
    if(!visible || !cag || !scenario_path) return null;
    for (var j=0; j<cag.scenarios.length; j++) {
      var scenario = cag.scenarios[j];
      if ("/"+scenario.id === scenario_path) {
        return scenario;
      }
    }
  }
  */

  _resetSectionSizes() {
    var t0 = d3.select(this.$.graphdiv)
    var t1 = d3.select(this.$.workflowdiv)
    if(this.workflows && this.workflows.length) {
      t1.style("display", "");
      if(!this.smallScreen) {
        t0.transition().style("width", "60%");
        t1.transition().style("opacity", 1).style("width", "40%");
      }
      else {
        t0.style("width", "100%");
        t1.transition().style("opacity", 1).style("width", "100%");
        var top = t1.node().offsetTop;
        scroll({top: top, behavior: 'smooth'});
      }
    }
    else {
      if(!this.smallScreen) {
        t0.style("width", "100%");
        var mycag = this.$.cag;
        window.setTimeout(function() {
          mycag.resetSize();
        }, 100);
      }
      t1.transition().style("width", "0px").style("opacity", 0);
      t1.style("display", "none");
    }
  }

  _temporaryGraphChanged(tmpgraph) {
    if(tmpgraph) {
      if(!this.$.temporary_graph.opened) {
        this.$.temporary_graph.toggle();
        this.$.main_graph.toggle();
        this.$.tmpcag.loadGraph();
      }
    }
    else {
      if(!this.$.main_graph.opened) {
        this.$.temporary_graph.toggle();
        this.$.main_graph.toggle();
        var mycag = this.$.cag;
        window.setTimeout(function() {
          mycag.resetSize();
        }, 100);
      }
    }
  }

  _onSelectedWorkflowItemsChanged(cags) {
  //  this.$.tmpcag.selectVariables(cags);
  }

  _routeChanged() {
    this.$.workflows._resetWorkflows();
  }
}

customElements.define(MintGovernPlanner.is, MintGovernPlanner);

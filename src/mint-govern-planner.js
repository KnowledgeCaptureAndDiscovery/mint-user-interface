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
import './loading-screen.js';
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
        width: 100%;
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
          <iron-ajax auto="" url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[routeData.questionid]]"
            handle-as="json" last-response="{{question}}"></iron-ajax>
          <iron-ajax auto="" url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[routeData.questionid]]/tasks/[[routeData.taskid]]"
            handle-as="json" last-response="{{task}}"></iron-ajax>
        </template>
      </template>
    </template>

    <div class="content">
      <mint-workflows id="workflows" workflows="{{workflows}}"
        selected-workflow="{{workflow}}" selected-graph="{{selectedWorkflowGraph}}"
        selected-items="{{selectedWorkflowItems}}"
        config="[[config]]" userid="[[userid]]" visible="[[visible]]"
        task="[[task]]" taskid="[[routeData.taskid]]"
        regionid="[[routeData.regionid]]" dsid="[[routeData.dsid]]"
        question="[[question]]" questionid="[[routeData.questionid]]"
        ></mint-workflows>
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
      vocabulary: Object,
      loading: {
        type: Boolean,
        value: true
      },
      regionid: String,
      questionid: String,
      taskid: String,
      task: Object,
      operation: String,

      regions: Array,
      region: Object,
      workflow: Object,
      route: Object,
      routeData: {
        type: Object,
        observer: '_routeChanged'
      },
      modelCatalog: Object,
      dataCatalog: Object,
      workflows: Array,
      selectedWorkflowGraph: {
        type: Object,
        //observer: '_temporaryGraphChanged'
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
        value: false,
        observer: '_visibleChanged'
      }
    };
  }

  _visibleChanged(visible) {
    if(!visible)
      this.$.workflows._resetWorkflows();
  }

  _useridChanged(userid) {
      //this.$.workflows._resetWorkflows();
  }

  _onSelectedWorkflowItemsChanged(cags) {
  //  this.$.tmpcag.selectVariables(cags);
  }

  _routeChanged() {
    this.$.workflows._resetWorkflows();
  }
}

customElements.define(MintGovernPlanner.is, MintGovernPlanner);

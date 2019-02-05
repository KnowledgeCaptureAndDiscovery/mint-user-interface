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

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';

import './mint-common-styles.js';

class MintWorkflowList extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">
      .outer {
        padding: 10px;
      }
    </style>

    <app-route route="[[route]]" pattern="/:domainid/:type"
      data="{{routeData}}" tail="{{subroute}}"></app-route>

    <app-route route="[[subroute]]" pattern="/:questionid/:taskid/:dsid"
      data="{{subrouteData}}"></app-route>

    <!-- Top toolbar -->
    <div class="toolbar">
      <paper-button>[[routeData.type]] Workflows</paper-button>
    </div>
    <div id="form" class="outer">
      <ul>
        <template is="dom-repeat" items="[[_getWorkflows(vocabulary, routeData.type)]]">
          <li><a href="[[_getWorkflowRunURL(config, item)]]">[[item.label]]</li>
        </template>
      </ul>
    </div>
    <!-- Bottom toolbar -->
    <div class="toolbar bottom">
      <paper-button>&nbsp;</paper-button>
    </div>
`;
  }

  static get is() { return 'mint-workflow-list'; }

  static get properties() {
    return {
      config: Object,
      userid: String,
      vocabulary: String,
      route: Object,
      routeData: Object,
      subroute: Object,
      subrouteData: Object,
      visible: Boolean
    };
  }

  _getWorkflowRunURL(config, item) {
    if(config && item) {
      var rd = this.routeData;
      var srd = this.subrouteData;
      if(rd) {
        var url = "workflow/run/";
        url += rd.domainid + "/" + item.domain;
        url += "/" + item.localName;
        if(srd && srd.questionid) {
          url += "/" + srd.questionid + "/" + srd.taskid + "/" + srd.dsid;
        }
        return url;
      }
    }
  }

  _getWorkflows(vocabulary, type) {
    if(!vocabulary)
      return;
    var workflows = [];
    for(var i=0; i<vocabulary.workflows.length; i++) {
      var wflow = vocabulary.workflows[i];
      if(wflow.type == type)
        workflows.push(wflow);
    }
    return workflows;
  }

}
customElements.define(MintWorkflowList.is, MintWorkflowList);

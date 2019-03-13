/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import './mint-button.js';
import './mint-image.js';
import './mint-common-styles.js';

class MintResultsHome extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">

      h2 {
        font-size: 1.3em;
        font-weight: 500;
        margin: 32px 0;
      }

    </style>

    <app-route route="[[route]]" pattern="/:domainid"
      data="{{routeData}}" tail="{{subroute}}"></app-route>

    <app-route route="[[subroute]]" pattern="/:questionid/:taskid"
      data="{{subrouteData}}"></app-route>

    <!-- Top toolbar -->
    <div class="toolbar">
      <paper-button>[[routeData.type]] Runs</paper-button>
    </div>
    <div id="form" class="outer">
      <ul>
        <template is="dom-repeat" items="[[_getWorkflows(vocabulary)]]" as="type">
          <li><div class="bold">[[type.id]]</div>
            <ul>
              <template is="dom-repeat" items="[[type.workflows]]">
                <li><a href="[[_getResultsListURL(config, item)]]">[[item.label]]</li>
              </template>
            </ul>
          </li>
        </template>
        <li>
          <a href="/results/list/[[config.wings.domain]]">ALL MODELING Runs</a>
        </li>
      </ul>
    </div>
    <!-- Bottom toolbar -->
    <div class="toolbar bottom">
      <paper-button>&nbsp;</paper-button>
    </div>
`;
  }

  static get is() { return 'mint-results-home'; }

  static get properties() {
    return {
      config: Object,
      userid: Object,
      vocabulary: Object
    };
  }

  _getResultsListURL(config, item) {
    if(config && item) {
      var rd = this.routeData;
      var srd = this.subrouteData;
      if(rd) {
        var url = "results/list/" + item.domain + "/" + item.localName;
        if(srd && srd.questionid) {
          url += "/" + srd.questionid + "/" + srd.taskid;
        }
        return url;
      }
    }
  }

  _getWorkflows(vocabulary) {
    if(vocabulary) {
      var types = [];
      var typemap = {};
      for(var i=0; i<vocabulary.workflows.length; i++) {
        var wflow = vocabulary.workflows[i];
        var wflowtype = wflow.type;
        var type_workflows = typemap[wflow.type];
        if(!type_workflows) {
          type_workflows = {
            id: wflowtype,
            workflows: []
          };
          types.push(type_workflows);
        }
        type_workflows.workflows.push(wflow);
        typemap[wflow.type] = type_workflows;
      }
      return types;
    }
  }
}
customElements.define(MintResultsHome.is, MintResultsHome);

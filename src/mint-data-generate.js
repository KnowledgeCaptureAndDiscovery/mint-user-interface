import '@polymer/app-route/app-route.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-ajax/iron-ajax.js';

import './mint-ajax.js';
import './loading-screen.js';
import './variable-graph.js';
import './mint-common-styles.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

class MintDataGenerate extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">
      .searchbox {
        @apply --layout-horizontal;
        width: 100%;
      }
      .searchbox paper-button {
        font-size: 14px;
      }
      .searchbox paper-input {
        width: 100%;
      }
    </style>

    <app-route route="[[route]]" pattern="/:regionid" data="{{routeData}}"></app-route>

    <mint-ajax auto result="{{workflowList}}"
      url="[[config.wings.server]]/users/[[userid]]/[[config.wings.gendomain]]/workflows/getTemplatesListJSON"
    ></mint-ajax>

    <!-- Top toolbar -->
    <div class="toolbar">
      <paper-button>Generate Datasets</paper-button>
    </div>
    <div class="outer">
      <ul>
        <template is="dom-repeat" items="[[workflowList]]">
          <li><a href="/run-workflow/[[config.wings.gendomain]]/[[_localName(item)]]">[[_localName(item)]]</li>
        </template>
      </ul>
    </div>
    <!-- Bottom toolbar -->
    <div class="toolbar bottom">
      <paper-button>&nbsp;</paper-button>
    </div>

  </a>
`;
  }

  static get is() { return 'mint-data-generate'; }

  static get properties() {
    return {
      dataCatalog: Object,
      config: Object,
      userid: String,
      workflowList: Array,
      routeData: Object,
      route: Object,
      regionid: String,
      visible: Boolean
    };
  }

  _localName(id) {
    return id.replace(/^.*#/, '');
  }
}

customElements.define(MintDataGenerate.is, MintDataGenerate);

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

import './mint-base-router.js';
import './mint-workflow-run.js';
import './mint-workflow-list.js';

class MintWorkflow extends MintBaseRouter {
  static get is() { return 'mint-workflow'; }

  static get template() {
    return html`

    <!-- Insert parent template : app-router basically -->
    ${super.template}

    <!-- mint-region-data provides the list of regions -->
    <!--mint-region-data auto regions="{{regions}}"></mint-region-data-->

    <iron-pages role="main" selected="[[page]]" attr-for-selected="name" selected-attribute="visible">
      <!-- workflow list -->
      <mint-workflow-list name="list" vocabulary="[[vocabulary]]"
        visible="[[visible]]" config="[[config]]" userid="[[userid]]"
        route="[[pageSubRoute.list]]"></mint-workflow-list>

      <!-- workflow run -->
      <mint-workflow-run name="run" vocabulary="[[vocabulary]]"
        visible="[[visible]]" config="[[config]]" userid="[[userid]]"
        route="[[pageSubRoute.run]]"></mint-workflow-run>

    </iron-pages>
`;
  }

  static get properties() {
    return Object.assign({}, super.properties, {
      config: Object,
      userid: String,
      vocabulary: Object,
      visible: Boolean,
      page: {
        type: String,
        reflectToAttribute: true
      }
    });
  }

  _routePageChanged(page) {
    this.page = page || 'list';
  }
}

customElements.define(MintWorkflow.is, MintWorkflow);

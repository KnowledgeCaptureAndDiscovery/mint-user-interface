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
import { scroll } from '@polymer/app-layout/helpers/helpers.js';
import '@polymer/app-route/app-route.js';

import './mint-results-home.js';
import './mint-results-publish.js';
import './mint-results-list.js';
import './mint-results-detail.js';

import { MintBaseRouter } from './mint-base-router.js';

class MintResults extends MintBaseRouter {
  static get is() { return 'mint-results'; }

  static get template() {
    return html`

    ${super.template}

    <iron-pages role="main" selected="[[page]]" attr-for-selected="name" selected-attribute="visible">
      <!-- Results Home -->
      <mint-results-home name="home" config="[[config]]" userid="[[userid]]"
        vocabulary="[[vocabulary]]"
        route="[[pageSubRoute.home]]"></mint-results-home>
      <!-- Results List -->
      <mint-results-list name="list" config="[[config]]" userid="[[userid]]"
        vocabulary="[[vocabulary]]"
        route="[[pageSubRoute.list]]"></mint-results-list>
      <!-- Results Detail -->
      <mint-results-detail name="detail" config="[[config]]" userid="[[userid]]"
        vocabulary="[[vocabulary]]"
        route="[[pageSubRoute.detail]]"></mint-results-detail>
      <!-- Results Publish -->
      <mint-results-publish name="publish" vocabulary="[[vocabulary]]"
        config="[[config]]" userid="[[userid]]"
        route="[[pageSubRoute.publish]]"></mint-results-publish>
    </iron-pages>
`;
  }

  static get properties() {
    return {
      config: Object,
      userid: String,
      page: {
        type: String,
        reflectToAttribute: true
      },
      vocabulary: Object,
      route: Object,
      routeData: Object,
      visible: {
        type: Boolean,
        observer: '_visibleChanged'
      }
    }
  }

  _visibleChanged(visible) {
    if (visible) {
      this.dispatchEvent(new CustomEvent('change-section', {
        bubbles: true, composed: true, detail: {title: 'Results'}}));
    }
  }

  _loadedGraph(data) {
      //console.log("Graph data loaded");
      //console.log(data);
  }

  _routePageChanged(page) {
    //console.log("mint-results: " + page);
    this.page = page || 'home';
    scroll({ top: 0, behavior: 'silent' });
  }

  _createGraphURL(cat, item) {
    if(cat && item) {
      var url = "files/" + cat + "/" + item + ".json";
      //console.log(url);
      return url;
    }
    return null;
  }
}
customElements.define(MintResults.is, MintResults);

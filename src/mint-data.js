/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import './mint-data-catalog.js';
import './mint-common-styles.js';
import './mint-data-browse.js';

import { MintBaseRouter } from './mint-base-router.js';

import { scroll } from '@polymer/app-layout/helpers/helpers.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

class MintData extends MintBaseRouter {

  static get is() { return 'mint-data'; }

  static get template() {
    return html`
    <style include="mint-common-styles">

      .item {
        display: block;
        text-decoration: none;
        text-align: center;
        margin-bottom: 40px;
      }

      h2 {
        font-size: 1.3em;
        font-weight: 500;
        margin: 32px 0;
      }

      .detail {
        margin: 10px;
        margin-top: 0px;
        width: calc(100% - 20px);
        transition: opacity 0.4s;
        @apply(--layout-center-justified);
      }

      .grid {
        @apply(--layout-horizontal);
        @apply(--layout-wrap);
        @apply(--layout-center);
        display: flex;
        flex-flow: row wrap;
        border: 1px solid #E3E3E3;
        border-width: 1px 0px 0px 1px;
      }

      .grid > a {
        -webkit-flex: 1 1;
        flex: 1 1;
        -webkit-flex-basis: calc(33.3333% - 11px);
        flex-basis: calc(33.3333% - 11px);
        max-width: calc(33.3333% - 11px);
        padding-left: 10px;
        height: 34px;
        line-height:34px;
        /*color: black;*/
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        border: 1px solid #E3E3E3;
        border-width: 0px 1px 1px 0px;
      }

      .grid > a:hover {
        background-color: #EEEEEE;
        text-decoration: underline;
      }

      .section {
        /*border: 1px solid #E3E3E3;*/
        margin-bottom: 15px;
      }

      .section .content {

      }

      .section .head {
        color: var(--app-secondary-color);
        font-size: 12px;
        height: 42px;
        line-height:42px;
        font-weight: 500;
        padding: 0px 10px;
        border: 1px solid #E3E3E3;
        border-width: 1px 1px 0px 1px;
        box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06), 0 2px 0 rgba(0, 0, 0, 0.075), 0 3px 0 rgba(0, 0, 0, 0.05), 0 4px 0 rgba(0, 0, 0, 0.015);
      }

      @media (max-width: 767px) {
        h2 {
          margin: 24px 0;
        }

        .grid a {
          -webkit-flex-basis: calc(50% - 11px);
          flex-basis: calc(50% - 11px);
          max-width: calc(50% - 11px);
        }
      }
    </style>

    ${super.template}

    <iron-pages role="main" selected="[[page]]" attr-for-selected="name" selected-attribute="visible">
      <!-- browse datasets for a region -->
      <mint-data-browse name="browse"
        data-catalog="[[dataCatalog]]"
        vocabulary="[[vocabulary]]"
        config="[[config]]" userid="[[userid]]"
        route="[[pageSubRoute.browse]]"></mint-data-browse>

    </iron-pages>
`;
  }

  static get properties() {
    return {
      config: Object,
      userid: String,
      vocabulary: Object,
      page: {
        type: String,
        reflectToAttribute: true
      },
      dataCatalog: Object,
      visible: {
        type: Boolean,
        observer: '_visibleChanged'
      }
    }
  }

  _visibleChanged(visible) {
    if (visible) {
      this.dispatchEvent(new CustomEvent('change-section', {
        bubbles: true, composed: true, detail: {title: 'Data'}}));
    }
  }

  _routePageChanged(page) {
    //console.log("mint-data: " + page);
    this.page = page || 'search';
    scroll({ top: 0, behavior: 'silent' });
  }

  _computeLoggedInStatus(userid) {
    return userid != null;
  }

  _isDefined(item) {
    return item != null;
  }

  _hashKeys(hash) {
    if(hash)
      return Object.keys(hash).sort();
  }

  _checkLogin(userid) {
    if(!userid)
      this.dataItems = null;
  }
}
customElements.define(MintData.is, MintData);

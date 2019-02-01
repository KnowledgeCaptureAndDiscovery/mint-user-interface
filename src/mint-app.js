/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { scroll } from '@polymer/app-layout/helpers/helpers.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import { timeOut } from '@polymer/polymer/lib/utils/async.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-route/app-location.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/iron-ajax/iron-ajax.js';

import { MintBaseRouter} from './mint-base-router.js';
import './loading-screen.js';
import './mint-icons.js';
import './mint-wings-login.js';
import './mint-common-styles.js';
import './mint-data-catalog.js';
import './mint-vocabulary.js';
//import './mint-home.js';
//import './mint-models.js';


class MintApp extends MintBaseRouter {
  static get is() { return 'mint-app'; }

  static get template() {
    return html`
    <style include="mint-common-styles">

      :host {
        display: block;
        position: relative;
        padding-top: 120px;
        padding-bottom: 54px;
        min-height: 100vh;
        --app-primary-color: #7F7F7F;
        --app-secondary-color: #7f888f;
        --app-accent-color: #1990d5;
        --paper-button-ink-color: var(--app-accent-color);
        --paper-icon-button-ink-color: var(--app-accent-color);
        --paper-spinner-color: var(--app-accent-color);
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
        color: var(--app-primary-color);
        background-color: #F5F6F7;
      }

      app-header {
        @apply(--layout-fixed-top);
        z-index: 1;
        background-color: rgba(255, 255, 255, 0.95);
        --app-header-shadow: {
          box-shadow: inset 0px 5px 6px -3px rgba(0, 0, 0, 0.2);
          height: 10px;
          bottom: -10px;
        };
      }

      paper-icon-button {
        color: var(--app-primary-color);
      }

      .logo {
        /*margin-left: calc(50% - 100px);*/
        margin-top: 10px;
      }

      .disclaimer {
        padding-left: 10px;
        font-size: 10px;
        max-height: 64px;
        overflow: auto;
      }
      .disclaimer .important {
        color: #EE0000;
      }

      .logo a {
        text-align: center;
        font-size: 16px;
        font-weight: 600;
        letter-spacing: 0.3em;
        color: var(--app-primary-color);
        text-decoration: none;
        /* required for IE 11, so this <a> can receive pointer events */
        display: inline-block;
        pointer-events: auto;
      }

      .left-bar-item {
        width: 40px;
      }

      .menu-btn {
        display: none;
      }

      .announcer {
        position: fixed;
        height: 0;
        overflow: hidden;
      }

      [hidden] {
        display: none !important;
      }

      #tabContainer {
        background-color: #F5F6F7;
        position: relative;
        height: 50px;
      }

      mint-tabs, mint-tab {
        --mint-tab-overlay: {
          border-bottom: 2px solid var(--app-accent-color);
        };
      }

      mint-tabs {
        height: 100%;
      }

      mint-tab {
        margin: 0 10px;
      }

      mint-tab a {
        display: inline-block;
        outline: none;
        padding: 9px 5px;
        font-size: 13px;
        font-weight: 500;
        text-decoration: none;
        color: var(--app-primary-color);
      }

      .drawer-list {
        margin: 0 20px;
      }

      .drawer-list a {
        display: block;
        padding: 0 16px;
        line-height: 40px;
        text-decoration: none;
        color: var(--app-secondary-color);
      }

      .drawer-list a.iron-selected {
        color: black;
        font-weight: bold;
      }

      app-drawer {
        z-index: 3;
      }

      iron-pages {
        max-width: 1440px;
        margin: 0 auto;
        padding: 0 20px;
      }

      footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        text-align: center;
        margin: 20px;
        line-height: 24px;
      }

      footer > a {
        color: var(--app-secondary-color);
        text-decoration: none;
      }

      footer > a:hover {
        text-decoration: underline;
      }

      app-toolbar {
        background-color: #F5F6F7;
        z-index: 100;
        padding: 0px;
      }

      app-toolbar paper-icon-button,
      app-toolbar mint-wings-login {
        color: #1990d5;
      }

      /* small screen */
      @media (max-width: 767px) {
        :host {
          padding-top: 64px;
        }

        .menu-btn {
          display: block;
        }

        :host([page=detail]) .menu-btn {
          display: none;
        }

        iron-pages {
          padding: 0 10px;
        }
      }

    </style>

    <!--
      app-location and app-route elements provide the state of the URL for the app.
    -->
    <app-location route="{{route}}"></app-location>

    ${super.template}

    <iron-media-query query="max-width: 767px" query-matches="{{smallScreen}}"></iron-media-query>
    <iron-ajax auto url="[[server]]/common/config" handle-as="json" last-response="{{config}}"></iron-ajax>

    <app-header role="navigation" id="header" effects="waterfall" condenses="" reveals="">
      <app-toolbar>
        <div class="left-bar-item">
          <paper-icon-button class="menu-btn" icon="menu" on-tap="_toggleDrawer" aria-label="Menu">
          </paper-icon-button>
        </div>

        <div main-title="" class="logo" title="">
          <template is="dom-if" if="[[smallScreen]]">
            <a href="" aria-label="MINT Home"><img height="40" src="images/logo_small.png"></a>
          </template>
          <template is="dom-if" if="[[!smallScreen]]">
            <a href="" aria-label="MINT Home"><img height="50" src="images/logo.png"></a>
          </template>
        </div>
        <div class="disclaimer">
          This is a demonstration system for the MINT framework that includes real models that have been
          used for many modeling exercises.
          <span class="important">HOWEVER, THE MODEL INTEGRATIONS AND MODEL PRODUCTS SHOWN IN THIS
          INTERFACE ARE NOT VALIDATED AND ARE FOR DEMONSTRATION PURPOSES ONLY TO ILLUSTRATE THE
          CAPABILITIES OF THE MINT FRAMEWORK.</span>
        </div>
        <mint-wings-login userid="{{userid}}" config="[[config]]"></mint-wings-login>
      </app-toolbar>

      <!-- Lazy-create the tabs for larger screen sizes. -->

      <div id="tabContainer" sticky$="[[_shouldShowTabs]]" hidden$="[[!_shouldShowTabs]]">
        <dom-if if="[[_shouldRenderTabs]]">
          <template>
            <mint-tabs selected="[[page]]" attr-for-selected="name">
              <mint-tab name="home"><a href="">Home</a></mint-tab>
              <mint-tab name="govern"><a href="govern/analysis/south_sudan">Analysis</a></mint-tab>
              <mint-tab name="data"><a href="data/browse">Data</a></mint-tab>
              <mint-tab name="models"><a href="models/browse">Models</a></mint-tab>
              <mint-tab name="results"><a href="results/home">Results</a></mint-tab>
              <!--mint-tab name="visualizations"><a href="visualizations">Visualizations</a></mint-tab-->
            </mint-tabs>
          </template>
        </dom-if>
      </div>
    </app-header>

    <!-- Lazy-create the drawer for small screen sizes. -->
    <template is="dom-if" if="[[_shouldRenderDrawer]]">
      <!-- Two-way bind \`drawerOpened\` since app-drawer can update \`opened\` itself. -->
      <app-drawer opened="{{drawerOpened}}" swipe-open="" tabindex="0">
        <iron-selector role="navigation" class="drawer-list" selected="[[page]]" attr-for-selected="name">
          <a name="home" href="">Home</a>
          <a name="govern" href="govern/analysis/south_sudan">Analysis</a>
          <a name="data" href="data/browse">Data</a>
          <a name="models" href="models/browse">Models</a>
          <a name="results" href="results/home">Results</a>
          <!--a name="visualizations" href="visualizations">Visualizations</a-->
        </iron-selector>
      </app-drawer>
    </template>

    <!-- Common Vocabulary Details -->
    <mint-vocabulary config="[[config]]" userid="[[userid]]" vocabulary="{{vocabulary}}"></mint-vocabulary>

    <!-- Data Catalog -->
    <mint-data-catalog config="[[config]]" userid="[[userid]]"
      region="[[region]]" data-catalog="{{dataCatalog}}"></mint-data-catalog>

    <!-- Loading screen -->
    <loading-screen loading="true" id="pageLoading"></loading-screen>

    <template is="dom-if" if="[[userid]]">
      <!-- Different Views of hte app -->
      <iron-pages role="main" selected="[[page]]" attr-for-selected="name" selected-attribute="visible">
        <!-- home view -->
        <mint-home name="home" route="{{pageSubRoute.home}}"></mint-home>

        <!-- govern view -->
        <mint-govern name="govern" vocabulary="[[vocabulary]]"
          config="[[config]]" userid="[[userid]]"
          route="{{pageSubRoute.govern}}"></mint-govern>

        <!-- results view -->
        <mint-results name="results" vocabulary="[[vocabulary]]"
          config="[[config]]" userid="[[userid]]"
          route="{{pageSubRoute.results}}"></mint-results>

        <!-- data view -->
        <mint-data name="data" config="[[config]]" userid="[[userid]]"
          data-catalog="[[dataCatalog]]" vocabulary="[[vocabulary]]"
          route="{{pageSubRoute.data}}"></mint-data>

        <!-- workflow view -->
        <mint-workflow name="workflow" config="[[config]]" userid="[[userid]]"
          vocabulary="[[vocabulary]]"
          route="{{pageSubRoute.workflow}}"></mint-workflow>

        <!-- models view -->
        <mint-models name="models" config="[[config]]" userid="[[userid]]"
          vocabulary="[[vocabulary]]"
          route="{{pageSubRoute.models}}"></mint-models>

        <!-- visualizations view -->
        <mint-visualizations name="visualizations"
          config="[[config]]" userid="[[userid]]"
          route="{{pageSubRoute.visualizations}}"></mint-visualizations>

      </iron-pages>
    </template>
    <template is="dom-if" if="[[_isNull(userid)]]">
      <center><h2>Please log in !</h2></center>
    </template>

    <!-- a11y announcer -->
    <div class="announcer" aria-live="assertive">[[_a11yLabel]]</div>
`;
  }

  static get properties() {
    return Object.assign({}, super.properties, {
      // Server is passed in
      server: String,

      // Fetch config from server
      config: {
        type: Object,
        notify: true
      },

      // Get userid from mint-wings-login
      userid: {
        type: String,
        value: null
      },

      // Data catalog object
      dataCatalog: Object,

      // Page specific objects
      region: {
        type: Object,
        notify: true
      },
      page: {
        type: String,
        reflectToAttribute: true,
        observer: '_pageChanged'
      },
      loadedPages: {
        type: Object,
        value: {}
      },
      _shouldShowTabs: {
        computed: '_computeShouldShowTabs(page, smallScreen)'
      },
      _shouldRenderTabs: {
        computed: '_computeShouldRenderTabs(_shouldShowTabs, loadComplete)'
      },
      _shouldRenderDrawer: {
        computed: '_computeShouldRenderDrawer(smallScreen, loadComplete)'
      }
    });
  }

  created() {
    window.performance && performance.mark && performance.mark('mint-app.created');
    // Custom elements polyfill safe way to indicate an element has been upgraded.
    this.removeAttribute('unresolved');
  }

  ready() {
    super.ready();
    // Custom elements polyfill safe way to indicate an element has been upgraded.
    this.removeAttribute('unresolved');
    // listen for custom events
    this.addEventListener('change-section', (e)=>this._onChangeSection(e));
    this.addEventListener('announce', (e)=>this._onAnnounce(e));
    // listen for online/offline
    afterNextRender(this, () => {
      window.addEventListener('online', (e)=>this._notifyNetworkStatus(e));
      window.addEventListener('offline', (e)=>this._notifyNetworkStatus(e));
    });
  }

  _isNull(item) {
    return item == null;
  }

  _routePageChanged(page) {
    // console.log("mint-app: " + page + ": " + this.route.prefix);
    this.page = page || 'home';
    // Close the drawer - in case the *route* change came from a link in the drawer.
    this.drawerOpened = false;
  }

  _pageChanged(page, oldPage) {
    if (page != null) {
      if(!this.loadedPages[page]) {
        this.$.pageLoading.loading = true;
        this.loadedPages[page] = true;
        let cb = this._pageLoaded.bind(this, Boolean(oldPage));
        import('./mint-' + page + '.js').then(cb, cb);
      }
    }
  }

  _pageLoaded(shouldResetLayout) {
    this._ensureLazyLoaded();
    if (shouldResetLayout) {
      // The size of the header depends on the page (e.g. on some pages the tabs
      // do not appear), so reset the header's layout only when switching pages.
      timeOut.run(() => {
        this.$.header.resetLayout();
        this.$.pageLoading.loading = false;
      }, 1);
    }
  }

  _ensureLazyLoaded() {
    // load lazy resources after render and set `loadComplete` when done.
    if (!this.loadComplete) {
      afterNextRender(this, () => {
        import(this.resolveUrl('./src/lazy-resources.js')).then( () => {
          // Register service worker if supported.
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./service-worker.js');
          }
          //this._notifyNetworkStatus();
          this.loadComplete = true;
          this.$.pageLoading.loading = false;
        });
      });
    }
  }

  _notifyNetworkStatus() {
    let oldOffline = this.offline;
    this.offline =  !navigator.onLine;
    // Show the snackbar if the user is offline when starting a new session
    // or if the network status changed.
    if (this.offline || (!this.offline && oldOffline === true)) {
      if (!this._networkSnackbar) {
        this._networkSnackbar = document.createElement('mint-snackbar');
        this.root.appendChild(this._networkSnackbar);
      }
      this._networkSnackbar.innerHTML = this.offline ?
          'You are offline' : 'You are online';
      this._networkSnackbar.open();
    }
  }

  _toggleDrawer() {
    this.drawerOpened = !this.drawerOpened;
  }

  // Elements in the app can notify section changes.
  // Response by a11y announcing the section and syncronizing the category.
  _onChangeSection(event) {
    let detail = event.detail;
    // Scroll to the top of the page
    scroll({ top: 0, behavior: 'silent' });

    // Announce the page's title
    if (detail.title) {
      document.title = detail.title + ' - MINT';
      this._announce(detail.title + ', loaded');
    }
  }

  // Elements in the app can notify a change to be a11y announced.
  _onAnnounce(e) {
    this._announce(e.detail);
  }

  // A11y announce the given message.
  _announce(message) {
    this._a11yLabel = '';
    this._announceDebouncer = Debouncer.debounce(this._announceDebouncer,
      timeOut.after(100), () => {
        this._a11yLabel = message;
      });
  }

  _computeShouldShowTabs(page, smallScreen) {
    return !smallScreen;
  }

  _computeShouldRenderTabs(_shouldShowTabs, loadComplete) {
    return _shouldShowTabs && loadComplete;
  }

  _computeShouldRenderDrawer(smallScreen, loadComplete) {
    return smallScreen && loadComplete;
  }

  _computePluralizedQuantity(quantity) {
    return quantity + ' ' + (quantity === 1 ? 'item' : 'items');
  }
}

customElements.define(MintApp.is, MintApp);

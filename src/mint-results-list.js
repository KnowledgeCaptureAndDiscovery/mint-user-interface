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
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';

import '@polymer/iron-ajax/iron-ajax.js';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid.js';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-column.js';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-selection-column.js';

import './mint-ajax.js';

class MintResultsList extends PolymerElement {
  static get is() { return 'mint-results-list'; }

  static get template() {
    return html`
    <style include="mint-common-styles">
      .detail {
        margin: 0px;
        transition: opacity 0.4s;
        opacity: 1;
      }

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

      vaadin-grid {
        margin: 0px;
      }

      @media (max-width: 767px) {
        h2 {
          margin: 24px 0;
        }
        .detail {
          margin: 0px 16px;
        }
      }

    </style>

    <app-route route="[[route]]" pattern="/:domain"
      data="{{routeData}}" tail="{{subroute}}"></app-route>

    <app-route route="[[subroute]]" pattern="/:template_id"
        data="{{subrouteData}}"></app-route>

    <mint-ajax id="runlistAjax"
      url="[[_getRunListURL(config.wings.server, userid, routeData.domain)]]"></mint-ajax>

    <!-- Top toolbar -->
    <div class="toolbar">
      <paper-button>Workflow Executions</paper-button>
    </div>
    <div id="form" class="outer">
      <vaadin-grid id="results" items="[[filteredRunList]]" class="detail" active-item="{{activeItem}}" >
        <vaadin-grid-selection-column hidden auto-select></vaadin-grid-selection-column>
        <vaadin-grid-column path="id" hidden></vaadin-grid-column>
        <vaadin-grid-column flex-grow="0" width="50px">
          <template>
            <template is="dom-if" if="[[_isEqual(item.runtimeInfo.status, 'SUCCESS')]]">
              <iron-icon icon="check" style="color:green" />
            </template>
            <template is="dom-if" if="[[_isEqual(item.runtimeInfo.status, 'FAILURE')]]">
              <iron-icon icon="close" style="color:red" />
            </template>
            <template is="dom-if" if="[[_isEqual(item.runtimeInfo.status, 'ONGOING')]]">
              <iron-icon icon="hourglass-empty" style="color:grey" />
            </template>
          </template>
        </vaadin-grid-column>
        <vaadin-grid-column header="Workflow Run" flex-grow="1">
          <template><b>[[_getLocalName(item.template_id)]]</b></template>
        </vaadin-grid-column>
        <vaadin-grid-column header="Start Time" flex-grow="0" width="200px">
          <template>[[_getTime(item.runtimeInfo.startTime)]]</template>
        </vaadin-grid-column>
        <vaadin-grid-column header="End Time" flex-grow="0" width="200px">
          <template>[[_getTime(item.runtimeInfo.endTime)]]</template>
        </vaadin-grid-column>
        <vaadin-grid-column header="Progress" flex-grow="0" width="200px"></vaadin-grid-column>
      </vaadin-grid>
    </div>
    <!-- Bottom toolbar -->
    <div class="toolbar bottom">
      <paper-button>&nbsp;</paper-button>
    </div>
`;
  }

  static get properties() {
    return {
      config: Object,
      userid: String,
      visible: {
        type: Boolean,
        value: false
      },
      activeItem: {
        type: Object,
        observer: '_changedActiveItem'
      },
      runList: Array,
      filteredRunList: {
        type: Array,
        computed: '_filterRunList(runList, subrouteData)'
      },
      route: Object,
      routeData: Object
    };
  }

  static get observers() {
    return [
      '_fetchResults(config, userid, routeData.domain, visible)'
    ];
  }

  ready() {
    super.ready();
    this._setupListeners();
    afterNextRender(this, () => {
      this._setupRenderers();
    });
  }

  _fetchResults(config, userid, domain, visible) {
    if(config && userid && domain && visible) {
      this.$.runlistAjax.fetch();
      //this._setupReloadTimer();
    }
    else {
      this.runList = [];
    }
  }

  _filterRunList(list, srd) {
    if(!srd || !srd.template_id)
      return list;
    var tname = srd.template_id;
    var nlist = [];
    for(var i=0; i<list.length; i++) {
      var runtname = this._getLocalName(list[i].template_id);
      if(runtname == tname)
        nlist.push(list[i]);
    }
    return nlist;
  }

  _getRunListURL(server, userid, domain) {
    if(server && userid && domain)
      return server + "/users/" + userid +  "/" + domain + "/executions/getRunList";
  }

  _progressRenderer(root, grid, rowData) {
    var d = rowData.item;
    var r = d.runtimeInfo;
    if (r.status == "SUCCESS")
      d.percent_done = 100;
    var w1 = 150;
    var w2 = Math.round(w1 * (d.percent_done + d.percent_failed + d.percent_running) / 100);
    var w3 = Math.round(w1 * (d.percent_done + d.percent_running) / 100);
    var w4 = Math.round(w1 * d.percent_done / 100);
    var html = "<div style='width:"+w1+"px;height:8px;background-color:#EEE;border-radius:5px'>";
    html += "<div style='width:"+w2+"px;height:8px;background-color:#F66;border-radius:5px'>";
    html += "<div style='width:"+w3+"px;height:8x;background-color:#999;border-radius:5px'>";
    html += "<div style='width:"+w4+"px;height:8px;background-color:#6E6;border-radius:5px'>";
    html += "&nbsp;</div></div></div></div>";
    root.innerHTML = html;
  }

  _getTime(time) {
    if(time)
      return new Date(time*1000).toISOString().slice(0,19).replace('T', ' ');
  }

  _getLocalName(id) {
    return id.replace(/^.*#/, '');
  }

  _isEqual(v1, v2) {
    return v1 == v2;
  }

  _setupRenderers() {
    var grid = this.$.results;
    var columns = grid.querySelectorAll('vaadin-grid-column');
    columns[5].renderer = this._progressRenderer;
  }

  _setupReloadTimer() {
    var me = this;
    window.setTimeout(function() {
      if(me.userid && me.visible) {
        //console.log("Refreshing");
        me.$.runlistAjax.refresh();
        //me._setupReloadTimer();
      }
    }, 30000);
  }

  _isDefined(item) {
    return item != null;
  }

  _sortList(list) {
    if(list != null) {
      list.sort(function(a, b) {
        return a.runtimeInfo.startTime < b.runtimeInfo.startTime ? 1 : -1;
      });
      return list;
    }
  }

  _changedActiveItem(item) {
    if(item) {
      var runid = this._getLocalName(item.id);
      var new_path = '/results/detail/' + this.routeData.domain + "/" + runid;
      window.history.pushState({}, null, new_path);
      window.dispatchEvent(new CustomEvent('location-changed'));
    }
  }

  _setupListeners() {
    var me = this;
    var grid = this.$.results;
    // Show details for the selected row

    /*
    grid.addEventListener('selected-items-changed', function(items) {
      console.log(items);
      grid.selection.selected(function(index) {
        var row = me.runList[index];
        me.selectedrunid = row.id.replace(/^.+#/,'');
      });
    });
    */

    this.$.runlistAjax.addEventListener('mint-ajax-load', function(e) {
      //console.log(e.detail.response);
      me.runList = me._sortList(e.detail.response);
    });
    //console.log("Setup listeners");
  }
}

customElements.define(MintResultsList.is, MintResultsList);

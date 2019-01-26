import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-ajax/iron-ajax.js';

import './variable-graph.js';

class MintGovernLoadCag extends PolymerElement {

  static get is() { return "mint-govern-load-cag"; }

  static get template() {
    return html`
    <style include="mint-common-styles">
      iron-icon {
        color: green;
      }
    </style>

    <app-route route="[[route]]" pattern="/:regionid"
      data="{{routeData}}" tail="{{subroute}}"></app-route>

    <input id="caginput" type="file" name="inputfile"
      on-change="_cagLoaded" accept=".json" class="inputfile"/>

    <br />
    <hr />

    <template is="dom-if" if="[[cag]]">
      <div><b>Name:</b> [[cag.name]]</div>
      <div><b>Created By:</b> [[cag.created_by]]</div>
      <div><b>Created On:</b> [[cag.dateCreated]]</div>

      <!--paper-button class="important" on-tap="_startAligning">Align Variables to GSN</paper-button-->
      <paper-button class="important" on-tap="_saveGraph">Save</paper-button>
      <hr />
    </template>

    <variable-graph id="cag" style="display:none" operation="edit"
      config="[[config]]" userid="[[userid]]"
      editable data="[[graphData]]"></variable-graph>
`
  }

  static get properties() {
    return {
      config: Object,
      userid: Object,
      cag: Object,
      graphData: Object,
      vocabulary: Object,
      route: Object,
      routeData: Object,
      visible: Boolean
    }
  }

  static get observers() {
    return [
      '_loadVariableGraph(graphData, visible)'
    ];
  }

  _cagLoaded(e) {
    var me = this;
    var input = this.$.caginput;
    var fileName = e.target.value.split( '\\' ).pop();
    if( fileName ) {
      var reader = new FileReader();
      reader.readAsText(input.files[0]);
      reader.onload = function( eload ) {
        var jsondata = eload.target.result;
        var json = JSON.parse(jsondata);
        if(!json.name)
          json.name = fileName.replace(".json", "");
        var graph = me._convertToGraph(json);
        me.set("cag", json);
        me.set("graphData", graph);
      }
    }
  }

  _loadVariableGraph(graphData, visible) {
    if(visible && graphData) {
      this.$.cag.style.display = "";
      this.$.cag.loading = true;
      this.$.cag.loadGraph();
      this.$.cag.loading = true;
      this.$.cag.layout(false);
    }
  }

  _getGraphDisplayCSS() {
    if(this.graphData)
      return "";
    return "none";
  }

  _convertToGraph(cag) {
    var graphid = this.config.server + "/common/graphs/" + cag.name;
    var graph = {
      id: graphid,
      label: cag.name,
      variables: [],
      links: []
    };

    var varmap = {};
    for(var i=0; i<cag.variables.length; i++) {
      var v = cag.variables[i];
      var gv = {
        id: graphid + "#" + v.name,
        label: v.name
      }
      varmap[v.name] = gv;
      // FIXME: Add canonical/standard names if alignment is there
      graph.variables.push(gv);
    }

    for(var i=0; i<cag.edge_data.length; i++) {
      var edge = cag.edge_data[i];
      var from = varmap[edge.source];
      var to = varmap[edge.target];
      if(from && to) {
        var link = {
          from:from.id,
          to:to.id
        };
        graph.links.push(link);
      }
    }
    return graph;
  }

  _saveGraph() {
    this.$.cag.save();
  }

  _startAligning() {
    if(this.cag) {
      var me = this;
      for(var i=0; i<this.cag.variables.length; i++) {
        var v = this.cag.variables[i];
        var url = this.config.gsn.server + "/match_phrase/" + v.name.replace(/\s+/, '_') + "/";
        this._getResource({
          url: url,
          onLoad: function(e) {
            var json = JSON.parse(e.target.responseText);
            me.set("cag.variables."+i+".alignment", json.results);
          },
          onError: function() {
            console.log("Cannot align variable");
          }
        });

        break;
      }
    }
  }

  _localName(id) {
    return id.replace(/^.+#/, '');
  }

  _getResource(rq) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    //xhr.withCredentials = true;
    xhr.open('GET', rq.url);
    xhr.send();
  }
}

customElements.define(MintGovernLoadCag.is, MintGovernLoadCag);

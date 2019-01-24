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
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';

import '@vaadin/vaadin-combo-box/theme/material/vaadin-combo-box.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';

import './mint-icons.js';
import './mint-image.js';
import './mint-common-styles.js';

class MintResultsPublish extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">
      h2 {
        font-size: 1.3em;
        font-weight: 500;
        margin: 32px 0;
      }
      fieldset {
        border:1px solid #aaa;
        background-color: #fafafa;
        margin-right: 7px;
        margin-top: 7px;
        /*border-radius: 5px;*/
        /*width: calc(50% - 32px);*/
        padding-top: 0px;
        padding-bottom: 15px;
      }
      fieldset.withButton {
        margin-top: 0px;
      }
      legend {
        font-weight: bold;
      }
      div.grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 5px;
        grid-auto-rows: minmax(100px, auto);
      }
      div.formatrow {
        display: flex;
        align-items: center;
      }
      div.formatrow paper-checkbox {
        width: 80px;
        color: "#999";
        margin-bottom: -15px;
      }
      div.row {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-flow: row;
      }
      div.row paper-input {
        /*width: calc(50% - 10px);*/
      }
      div.row paper-icon-button {
        width: 50px;
        margin-bottom: -20px;
      }
      paper-dropdown-menu {
        margin-left: 4px;
        width: calc(100% - 8px);
      }
      paper-input, paper-textarea {
        margin-left: 4px;
        width: calc(100% - 8px);
      }
      div.row paper-input.unitsinput {
        width: 140px;
      }

      @media (max-width: 767px) {
        div.grid {
          grid-template-columns: repeat(1, 1fr);
        }
      }
    </style>

    <app-route route="[[route]]" pattern="/:domain"
      data="{{routeData}}" tail="{{subroute}}"></app-route>

    <app-route route="[[subroute]]"
      pattern=":runid/:compid/:varid/:dsid"
      data="{{subrouteData}}"></app-route>

    <iron-ajax auto last-response="{{viz_type}}"
      url="[[config.visualization.server]]/viz_type"></iron-ajax>

    <div class="grid">
      <fieldset id="required">
        <legend>Required Information</legend>
        <paper-input label="Name" value="{{dataset_def.name}}"></paper-input>
        <paper-input label="Description" value="{{dataset_def.description}}"></paper-input>
        <paper-input label="URL" value="{{resource_def.data_url}}"></paper-input>
        <div class="formatrow">
          <paper-input label="Format" value="{{resource_def.resource_type}}"></paper-input>
          <paper-checkbox value="{{resource_def.is_zip}}">Is Zip ?</paper-input>
        </div>
      </fieldset>
      <fieldset id="custom" class="withButton">
        <legend>Custom Metadata<paper-icon-button on-tap="_addMetadata" icon="add"></paper-icon-button></legend>
        <div id="rowtemplate" class="row">
          <paper-input label="Key"></paper-input>
          <paper-input label="Value"></paper-input>
          <paper-icon-button icon="cancel" on-tap="_removeRow"></paper-icon-button>
        </div>
      </fieldset>
      <fieldset>
        <legend>Spatial Information</legend>
        <div class="row">
          <paper-input label="X Min" value="{{spatial.xmin}}"></paper-input>
          <paper-input label="Y Min" value="{{spatial.ymin}}"></paper-input>
        </div>
        <div class="row">
          <paper-input label="X Max" value="{{spatial.xmax}}"></paper-input>
          <paper-input label="Y Max" value="{{spatial.ymax}}"></paper-input>
        </div>
      </fieldset>
      <fieldset>
        <legend>Temporal Information</legend>
        <paper-input label="Start Time" value="{{temporal.start_time}}"></paper-input>
        <paper-input label="End Time" value="{{temporal.end_time}}"></paper-input>
      </fieldset>
      <fieldset id="variables" class="withButton">
        <legend>Dataset Variables<paper-icon-button on-tap="_addVariable" icon="add"></paper-icon-button></legend>
        <div id="vartemplate" class="row" style="display:none">
          <vaadin-combo-box items="[[standardVariables]]" label="Standard Name"
            item-label-path="name" item-value-path="id" allow-custom-value="true"></vaadin-combo-box>
          <paper-input label="Variable Name"></paper-input>
          <paper-input class="unitsinput" label="Units"></paper-input>
          <paper-icon-button icon="cancel" on-tap="_removeRow"></paper-icon-button>
        </div>
        <template is="dom-repeat" items="[[variables]]">
          <div class="row">
            <vaadin-combo-box items="[[standardVariables]]" label="Standard Name"
              item-label-path="name" item-value-path="id"></vaadin-combo-box>
            <paper-input label="Variable Name"></paper-input>
            <paper-input class="unitsinput" label="Units"></paper-input>
            <paper-icon-button icon="cancel" on-tap="_removeRow"></paper-icon-button>
          </div>
        </template>
      </fieldset>
      <fieldset>
        <legend>Visualization</legend>
        <paper-dropdown-menu no-animations="" label="Visualization Type">
          <paper-listbox slot="dropdown-content" attr-for-selected="value" selected="{{viz_config.viz_type}}">
            <paper-item value="">None</paper-item>
            <template is="dom-repeat" items="[[viz_type.types]]">
              <paper-item value="[[item]]">[[item]]</paper-item>
            </template>
          </paper-listbox>
        </paper-dropdown-menu>
        <template is="dom-if" if="[[viz_config.viz_type]]">
          <template is="dom-repeat" items="[[_getVizKeyMetadata(viz_config.viz_type)]]">
            <template is="dom-if" if="[[_isEqual(item.htmltag, 'select')]]">
              <paper-dropdown-menu no-animations name="[[item.name]]"
                  label="[[_makeLabel(item.name)]] ([[item.description]])"
                  placeholder="[[item.placeholder]]" always-float-label>
                <paper-listbox slot="dropdown-content"
                  attr-for-selected="value" selected="{{item.value}}">
                  <template is="dom-repeat" items="[[_getSelectOptions(item)]]" as="option">
                    <paper-item value="[[option]]">[[option]]</paper-item>
                  </template>
                </paper-listbox>
              </paper-dropdown-menu>
            </template>
            <template is="dom-if" if="[[_isEqual(item.htmltag, 'input')]]">
              <paper-input name="[[item.name]]" value="{{item.value}}"
                  label="[[_makeLabel(item.name)]] ([[item.description]])"
                  placeholder="[[item.placeholder]]" always-float-label></paper-input>
            </template>
          </template>
        </template>
      </fieldset>
    </div>
    <paper-button on-tap="_publishDataset">Publish</paper-button>
`;
  }

  static get is() { return 'mint-results-publish'; }

  static get properties() {
    return {
      config: Object,
      userid: Object,

      dsid: String,
      dsurl: String,
      metadata: Array,
      variables: Array,
      viz_type: Object,

      spatial: {
        type: Object,
        value: {}
      },
      temporal: {
        type: Object,
        value: {}
      },

      dataset_def: {
        type: Object,
        value: {
          metadata: {}
        }
      },
      resource_def: {
        type: Object,
        value: {
          metadata: {}
        }
      },
      viz_config: {
        type: Object,
        value: {
          metadata: {}
        }
      },
      vocabulary: Object,

      standardVariables: Array,

      tplhtml: String,
      varhtml: String,

      route:Object,
      subroute: Object,
      routeData: Object,
      subrouteData: Object,
    };
  }

  static get observers() {
    return [
      '_fetchGSNStandardVariables()',
      '_resetForm(subrouteData.dsid, subrouteData.compid, subrouteData.varid)',
      '_fetchMetadata(config, userid, vocabulary, routeData.domain, subrouteData.runid, subrouteData.compid, subrouteData.varid, subrouteData.dsid)'
    ]
  }


  // TODO: Also need to fetch existing data with the provided name
  // - If exists, then set all the defs accordingly


  ready() {
    super.ready();
    this.tplhtml = this.$.rowtemplate.innerHTML;
    this.varhtml = this.$.vartemplate.innerHTML;
  }

  _fetchMetadata(config, userid, vocabulary, dom, runid, cid, vid, dsid) {
    if(config && userid && vocabulary && dom && runid && cid && vid && dsid) {
      this.variables = this._getDataVariables(vocabulary, cid, vid);
      //console.log(this.variables);
    }
  }

  _fetchGSNStandardVariables() {
    var data = {
      name__in: [ "*" ],
      ontology__in: [ "GSN" ],
      limit: 1000
    };
    var me = this;
    me._postResource({
      url: me.config.catalogs.data + "/knowledge_graph/find_standard_variables",
      onLoad: function(e) {
        var json = JSON.parse(e.target.responseText);
        if(json.result == "success") {
          /*
          var varmap = {};
          for(var i=0; i<json.standard_variables.length; i++) {
            var v = json.standard_variables[i];
            varmap[v.name] = v;
          }*/
          me.set("standardVariables", json.standard_variables);
        }
      },
      onError: function() {
        console.log("Cannot query standard variables");
      }
    }, data);
  }

  _getVizKeyMetadata(viztype) {
    var metadata = [];
    if(this.viz_type && this.viz_type[viztype]) {
      var vtype = this.viz_type[viztype];
      for(var i=0; i<vtype.keys.length; i++) {
        var key = vtype.keys[i];
        var keymeta = vtype[key];
        keymeta.name = key;
        metadata.push(keymeta);
      }
    }
    return metadata;
  }

  _makeLabel(vizname) {
    var label = "";
    var parts = vizname.split(/-/);
    for(var i=0; i<parts.length; i++) {
      if(i > 0) label += " ";
      label += parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    }
    return label;
  }

  _isEqual(tag1, tag2) {
    return tag1 == tag2;
  }

  _getSelectOptions(meta) {
    return meta.options.split(/\s*;\s*/);
  }

  _arrayToLines(vars) {
    return vars.join("\n");
  }

  _resetForm(dsid, compid, varid) {
    if(dsid) {
      this.set("dataset_def.name", dsid);
    }
    if(compid && varid) {
      this.set("dataset_def.description", varid+" output from "+ compid);
    }
  }

  _removeRow(e) {
    e.target.parentNode.remove();
  }

  _addMetadata() {
    var div = document.createElement("div");
    div.className = "row";
    div.innerHTML = this.tplhtml;
    var btn = div.querySelector("paper-icon-button");
    btn.addEventListener("tap", this._removeRow);
    this.$.custom.appendChild(div);
  }

  _addVariable() {
    var div = document.createElement("div");
    div.className = "row";
    div.innerHTML = this.varhtml;
    var combo = div.querySelector("vaadin-combo-box");
    combo.items = this.standardVariables;
    var btn = div.querySelector("paper-icon-button");
    btn.addEventListener("tap", this._removeRow);
    this.$.variables.appendChild(div);
  }

  _getDataVariables(vocabulary, cid, vid) {
    var variables = [];
    for(var i=0; i<vocabulary.models.length; i++) {
      var m = vocabulary.models[i];
      if(m.localName == cid) {
        for(var j=0; j<m.outputs.length; j++) {
          var io = m.outputs[j];
          if(io.localName == vid) {
            for(var k=0; k<io.variables.length; k++) {
              variables.push(io.variables[k].standard_name);
            }
          }
        }
        for(var j=0; j<m.inputs.length; j++) {
          var io = m.inputs[j];
          if(io.localName == vid) {
            for(var k=0; k<io.variables.length; k++) {
              variables.push(io.variables[k].standard_name);
            }
          }
        }
      }
    }
    return variables;
  }

  _publishDataset() {
    // TODO: Do validation

    var provenance_id = "28793fa8-9f2f-49b5-b052-7b65af9a44a0";
    var dataset_id = "fa795c84-5bbb-40f6-a124-b0c133e06c3e";
    var resource_id = "9a795c84-5bbb-40f6-a124-b0c133e06c2e";

    console.log(this.standardVariables);

    // Create variable definition
    // - Query for standard names if they exist
    //    - knowledge_graph/find_standard_variables
    //    - Get standard name mapping to id
    // - If not, create standard names
    //    - knowledge_graph/register_standard_variables
    //    - Update standard name mapping to id
    // - Create dataset
    // - Create dataset variables
    //    - datasets/register_variables
    //      - dataset_id, name, metadata.units, standard_variable_ids
    // - Get variable ids back and use in resource_def ( variable_ids )
    // - Create resource

    // Create dataset definition
    this.dataset_def.record_id = dataset_id;
    this.dataset_def.provenance_id = provenance_id;
    this.dataset_def.metadata = this._getCustomMetadata();
    var dataset_defs = {
      datasets: [ this.dataset_def ]
    }

    // Create resource definition
    this.resource_def.record_id = resource_id;
    this.resource_def.dataset_id = dataset_id;
    this.resource_def.provenance_id = provenance_id;
    this.resource_def.variable_ids = []; // TODO: Do this automatically
    this.resource_def.layout = [];
    this.resource_def.metadata = {
      spatial_coverage:  {
        type: "BoundingBox",
        value: this.spatial
      },
      temporal_coverage: this.temporal
    };
    var resource_defs = {
      resources: [ this.resource_def ]
    }
    console.log(dataset_defs);
    console.log(resource_defs)
  }


  _getCustomMetadata() {
    var metadata = {};
    // Get metadata values specified by the user
    var inputs = this.$.custom.querySelectorAll("paper-input");
    for(var i=0; i<inputs.length; i+=2) {
      var kip = inputs[i];
      var vip = inputs[i+1];
      if(kip.value && vip.value)
        metadata[kip.value] = vip.value;
    }
    // Convert viz_config to metadata
    this.viz_config.transformed = false;
    this.viz_config.visualized = false;
    if(this.viz_config.viz_type) {
      var vtype = this.viz_type[this.viz_config.viz_type];
      var keys = vtype["keys"];
      this.viz_config.metadata = {};
      for(var i=0; i<keys.length; i++) {
        var key = keys[i];
        var value = vtype[key].value;
        this.viz_config.metadata[key] = value;
      }
      metadata["viz_config"] = this.viz_config;
    }
    return metadata;
  }

  _getDatasetVariables() {
    var variables = [];
    var inputs = this.$.variables.querySelectorAll("paper-input");
    for(var i=0; i<inputs.length; i+=3) {
      var stdname = inputs[i];
      var varname = inputs[i+1];
      var units = inputs[i+2];
      if(stdname.value) {
        var variable = {
          stdname: stdname.value,
          varname: varname.value,
          units: units.value
        }
        variables.push(variable);
      }
    }
    return variables;
  }

  _postResource(rq, data) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    //xhr.withCredentials = true;
    xhr.open('POST', rq.url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
  }

  _putResource(rq, data) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    //xhr.withCredentials = true;
    xhr.open('PUT', rq.url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
  }

}

customElements.define(MintResultsPublish.is, MintResultsPublish);

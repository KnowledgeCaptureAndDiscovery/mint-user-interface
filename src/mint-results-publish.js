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
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/iron-icon/iron-icon.js';

import '@vaadin/vaadin-combo-box/theme/material/vaadin-combo-box.js';
import '@vaadin/vaadin-date-picker/theme/material/vaadin-date-picker.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';

import { getResource, postJSONResource } from './mint-requests.js';

import './mint-icons.js';
import './mint-csv-input.js';
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
        border:1px solid #ccc;
        background-color: white;
        border-radius: 2px;
        /*width: calc(50% - 32px);*/
        padding-top: 0px;
        padding-bottom: 15px;
      }
      legend {
        font-weight: bold;
      }
      a.action {
        cursor:pointer;
        margin-bottom: -16px;
      }
      a.action iron-icon {
        width: 18px;
        height: 18px;
      }
      a.actionbig {
        cursor:pointer;
      }
      a.actionbig iron-icon {
        width: 24px;
        height: 24px;
      }
      div.grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 10px;
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

      paper-dropdown-menu {
        margin-left: 4px;
        width: calc(100% - 8px);
      }
      paper-input, vaadin-combo-box {
        margin-left: 4px;
        width: calc(100% - 8px);
      }
      vaadin-date-picker {
        width: calc(100% - 8px);
        margin-left: 4px;
        --vaadin-date-picker-text-field: {
          font-size: inherit;
        }
      }

      fieldset fieldset {
        margin: 5px;
        margin-bottom: 15px;
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
      pattern="/:runid/:compid/:varid/:vartype/:dsid"
      data="{{subrouteData}}"></app-route>

    <iron-ajax auto last-response="{{viz_type}}"
      url="[[config.visualization.server]]/viz_type"></iron-ajax>

    <div class="grid">

      <!-- Standard required information -->
      <fieldset id="required">
        <legend>Required Metadata</legend>
        <paper-input label="Name" value="{{dataset_def.name}}"></paper-input>
        <paper-input label="Description" value="{{dataset_def.description}}"></paper-input>
        <div class="formatrow">
          <paper-input label="URL" value="{{resource_def.data_url}}"></paper-input>
          <template is="dom-if" if="[[subrouteData.runid]]">
            <a class="action" on-tap="_publishFile" title="Get File URL"><iron-icon icon="cloud-upload" /></a>
          </template>
        </div>
        <div class="formatrow">
          <paper-input label="Format" value="{{resource_def.resource_type}}"></paper-input>
          <paper-checkbox checked="{{resource_def.is_zip}}">Is Zip ?</paper-input>
        </div>
        <paper-input label="Data Type" value="{{datatype}}"></paper-input>
      </fieldset>

      <!-- Spatial Metadata -->
      <fieldset>
        <legend>Spatial Metadata</legend>
        <vaadin-combo-box items="[[regionBoundingBoxes]]"
          label="Autofill Spatial information"
          value="{{spatial}}"></vaadin-combo-box>
        <div class="row">
          <paper-input type="number" label="X Min" value="{{spatial.xmin}}"></paper-input>
          <paper-input type="number" label="Y Min" value="{{spatial.ymin}}"></paper-input>
        </div>
        <div class="row">
          <paper-input type="number" label="X Max" value="{{spatial.xmax}}"></paper-input>
          <paper-input type="number" label="Y Max" value="{{spatial.ymax}}"></paper-input>
        </div>
      </fieldset>

      <!-- Temporal Metadata -->
      <fieldset id="temporal_fieldset">
        <legend>Temporal Metadata</legend>
        <vaadin-date-picker label="Start Time" value="{{temporal.start_time}}"></vaadin-date-picker>
        <vaadin-date-picker label="End Time" value="{{temporal.end_time}}"></vaadin-date-picker>
      </fieldset>

      <!-- Custom Metadata -->
      <fieldset id="custom" class="withButton">
        <legend>
          Custom Metadata
          <a class="actionbig" on-click="_addMetadata"><iron-icon icon="add" /></a>
        </legend>
        <div id="rowtemplate" class="row">
          <paper-input label="Key"></paper-input>
          <paper-input label="Value"></paper-input>
          <a class="action" on-click="_removeRow"><iron-icon icon="cancel" /></a>
        </div>
      </fieldset>

      <!-- Dataset Variables -->
      <fieldset id="variables" class="withButton">
        <legend>
          Dataset Variables
          <a class="actionbig" on-click="_addVariable"><iron-icon icon="add" /></a>
        </legend>
        <mint-csv-input data="{{csvVariables}}" label="Load from CSV"></mint-csv-input>
        <div id="vartemplate" class="row" style="display:none">
          <vaadin-combo-box items="[[standardVariables]]" label="Standard Name"
            item-label-path="name" item-value-path="name"
            allow-custom-value="true"></vaadin-combo-box>
          <paper-input label="Variable Name"></paper-input>
          <paper-input class="unitsinput" label="Units"></paper-input>
          <a class="action" on-click="_removeRow"><iron-icon icon="cancel" /></a>
        </div>
        <template is="dom-repeat" items="[[variables]]">
          <div class="row">
            <vaadin-combo-box items="[[standardVariables]]" label="Standard Name"
              item-label-path="name" item-value-path="name" value="[[item.standard_name]]"
              allow-custom-value="true"></vaadin-combo-box>
            <paper-input label="Variable Name" value="[[item.name]]"></paper-input>
            <paper-input class="unitsinput" label="Units" value="[[item.units]]"></paper-input>
            <a class="action" on-click="_removeRow"><iron-icon icon="cancel" /></a>
          </div>
        </template>
      </fieldset>

      <!-- Visualization -->
      <fieldset>
        <legend>
          Visualization Metadata
          <a class="actionbig" on-click="_addVisualization"><iron-icon icon="add" /></a>
        </legend>
        <template is="dom-repeat" items="[[viz_configs]]" as="viz_config">
          <fieldset>
            <legend>
              Visualization
              <a class="action" on-click="_delVisualization"><iron-icon icon="cancel" /></a>
            </legend>
            <paper-dropdown-menu no-animations="" label="Visualization Preference">
              <paper-listbox slot="dropdown-content" attr-for-selected="value" selected="{{viz_config.viz_type}}">
                <paper-item value="">None</paper-item>
                <template is="dom-repeat" items="[[viz_type.types]]">
                  <paper-item value="[[item]]">[[item]]</paper-item>
                </template>
              </paper-listbox>
            </paper-dropdown-menu>
            <template is="dom-if" if="[[viz_config.viz_type]]">
              <template is="dom-repeat" items="[[_getVizKeyMetadata(viz_config.id, viz_config.viz_type)]]">
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
        </template>
      </fieldset>
    </div>

    <paper-button class="important" on-tap="_publishDataset">Register</paper-button>
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
      viz_type: Object,
      keys: {
        type: Object,
        value: {}
      },

      spatial: {
        type: Object,
        value: {}
      },
      temporal: {
        type: Object,
        value: {}
      },
      datatype: String,

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
      viz_configs: {
        type: Array,
        value: []
      },
      vocabulary: Object,

      variables: Array,
      standardVariables: Array,
      csvVariables: {
        type: Array,
        observer: '_setVariablesFromCSV'
      },

      regionBoundingBoxes: {
        type: Array,
        computed: '_getBoundingBoxesForRegion(vocabulary)'
      },

      tplhtml: String,
      varhtml: String,

      route:Object,
      subroute: Object,
      routeData: Object,
      subrouteData: Object,

      britishLocale: {
        type: Boolean,
        computed: '_isBritishLocale()'
      }
    };
  }

  static get observers() {
    return [
      '_fetchGSNStandardVariables()',
      '_resetForm(subrouteData.dsid, subrouteData.compid, subrouteData.varid, subrouteData.vartype)',
      '_fetchMetadata(config, userid, vocabulary, routeData.domain, subrouteData.runid, subrouteData.compid, subrouteData.varid, subrouteData.vartype, subrouteData.dsid)'
    ]
  }


  // TODO: Also need to fetch existing data with the provided name
  // - If exists, then set all the defs accordingly


  ready() {
    super.ready();

    afterNextRender(this, () => {
      this.tplhtml = this.$.rowtemplate.innerHTML;
      this.varhtml = this.$.vartemplate.innerHTML;

      var datePickers = this.$.temporal_fieldset.querySelectorAll("vaadin-date-picker");
      for(var i=0; i<datePickers.length; i++) {
        var dp = datePickers[i];
        dp.set("i18n.formatDate", (function(a) { return this._formatDate(a); }).bind(this));
        dp.set("i18n.parseDate", (function(a) { return this._parseDate(a); }).bind(this));
      }
    });
  }

  _uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  _delVisualization(evnt) {
    var viz_config = evnt.model.get('viz_config');
    var index = this.viz_configs.indexOf(viz_config);
    if(index >= 0) {
      this.splice("viz_configs", index, 1);
    }
  }

  _addVisualization() {
    var viz_config = {
      id: this._uuidv4(),
      transformed: false,
      visualized: false,
      metadata: {}
    };
    this.push("viz_configs", viz_config);
  }

  _fetchMetadata(config, userid, vocabulary, dom, runid, cid, vid, vtype, dsid) {
    if(config && userid && vocabulary && dom && runid && cid && vid && vtype && dsid) {
      var variables = [];
      var vars = this._getDataVariables(vocabulary, cid, vid, vtype);
      for(var i=0; i<vars.length; i++) {
        if(vars[i].standard_name) {
          variables.push({
            standard_name: vars[i].standard_name,
            name: vars[i].name,
            units: vars[i].units
          });
        }
      }
      this.set("variables", variables);
    }
  }

  _publishFile(e) {
    var input = e.target.parentNode.parentNode.querySelector("paper-input");
    input.placeholder = "Fetching URL ... ";
    var url = this.config.wings.server + "/users/" + this.userid + "/" +
      this.routeData.domain + "/data/publish";
    var datalib = this.config.wings.internal_server + "/export/users/" +
      this.userid + "/" + this.routeData.domain + "/data/library.owl#" +
      this.subrouteData.dsid;
    url = url + "?data_id=" + encodeURIComponent(datalib);
    getResource({
      url: url,
      onLoad: function(e) {
        input.placeholder = null;
        input.value = e.target.responseText;
      },
      onError: function() {
        console.log("Cannot publish file");
      }
    }, true);
  }

  _fetchGSNStandardVariables() {
    var data = {
      name__in: [ "*" ],
      ontology__in: [ "GSN" ],
      limit: 1000
    };
    var me = this;
    postJSONResource({
      url: me.config.catalogs.data + "/knowledge_graph/find_standard_variables",
      onLoad: function(e) {
        var json = JSON.parse(e.target.responseText);
        if(json.result == "success") {
          me.set("standardVariables", json.standard_variables);
        }
      },
      onError: function() {
        console.log("Cannot query standard variables");
      }
    }, data);
  }

  _getBoundingBoxesForRegion(vocabulary) {
    if(!vocabulary || !vocabulary.regions.length)
      return [];

    var regions = vocabulary.regions.slice();
    var bboxregions = [];
    while(regions.length) {
      var region = regions.pop();
      if(region.bbox) {
        bboxregions.push({
          label: region.label,
          value: {
            xmin: region.bbox[0],
            ymin: region.bbox[1],
            xmax: region.bbox[2],
            ymax: region.bbox[3]
          }
        });
      }
      if(region.subRegions)
        regions = regions.concat(region.subRegions);
    }
    return bboxregions;
  }

  _setVariablesFromCSV(csvarray) {
    var indices = {};
    for(var i=0; i<csvarray.headers.length; i++) {
      var key = csvarray.headers[i].toLowerCase().replace(/\s+/,'');
      indices[key] = i;
    }
    var variables = [];
    for(var i=0; i<csvarray.content.length; i++) {
      var row = csvarray.content[i];
      variables.push({
        standard_name: row[indices.gsnname],
        name: row[indices.shortname],
        units: row[indices.units]
      });
    }
    this.set("variables", variables);
  }

  _formatDate(d) {
    if(d) {
      var date = new Date();
      date.setFullYear(d.year);
      date.setMonth(d.month);
      date.setDate(d.day);
      return date.toLocaleDateString();
    }
  }

  _isBritishLocale() {
    var date = new Date();
    date.setMonth(0);
    date.setDate(30);
    var dateString = date.toLocaleDateString();
    var parts = dateString.split("/");
    if(parts[0] == "30") {
      return true;
    }
    if(parts[1] == "30")
      return false;
  }

  _parseDate(dateString) {
    var parts = dateString.split("/");
    var d = {
      day: this.britishLocale ? parts[0] : parts[1],
      month: parseInt(this.britishLocale ? parts[1] : parts[0]) - 1,
      year: parts[2]
    };
    return d;
  }


  _getVizKeyMetadata(vizid, viztype) {
    var hashid = vizid + viztype;
    if(this.keys[hashid])
      return this.keys[hashid];
    var metadata = [];
    if(this.viz_type && this.viz_type[viztype]) {
      var vtype = this.viz_type[viztype];
      for(var i=0; i<vtype.keys.length; i++) {
        var key = vtype.keys[i];
        var keymeta = Object.assign({}, vtype[key]);
        keymeta.name = key;
        metadata.push(keymeta);
      }
    }
    this.keys[hashid] = metadata;
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

  _resetForm(dsid, compid, varid, vartype) {
    if(dsid) {
      this.set("dataset_def.name", dsid);
      this.set("resource_def.data_url", null);
    }
    if(compid && varid) {
      this.set("dataset_def.description", varid+" output from "+ compid);
    }
    if(vartype) {
      this.set("datatype", vartype);
    }
  }

  _removeRow(e) {
    e.target.parentNode.parentNode.remove();
  }

  _addMetadata() {
    var div = document.createElement("div");
    div.className = "row";
    div.innerHTML = this.tplhtml;
    var btn = div.querySelector("a");
    btn.addEventListener("click", this._removeRow);
    this.$.custom.appendChild(div);
  }

  _addVariable() {
    var div = document.createElement("div");
    div.className = "row";
    div.innerHTML = this.varhtml;
    this.$.variables.appendChild(div);

    var combo = div.querySelector("vaadin-combo-box");
    combo.items = this.standardVariables;
    var btn = div.querySelector("a");
    btn.addEventListener("click", this._removeRow);
  }

  _getDataVariables(vocabulary, cid, vid, vtype) {
    var variables = [];
    for(var i=0; i<vocabulary.models.length; i++) {
      var m = vocabulary.models[i];
      if(this._getLocalName(m.id) == cid) {
        for(var j=0; j<m.outputs.length; j++) {
          var io = m.outputs[j];
          // Match the model's io id or io type
          if(this._getLocalName(io.id) == vid ||
              this._getLocalName(io.type) == vtype) {
            this.set("datatype", this._getLocalName(io.type));
            this.set("resource_def.resource_type", io.format);
            for(var k=0; k<io.variables.length; k++) {
              variables.push({
                standard_name: io.variables[k].standard_name,
                name: this._getLocalName(io.variables[k].id),
                units: io.variables[k].units
              });
            }
          }
        }
        for(var j=0; j<m.inputs.length; j++) {
          var io = m.inputs[j];
          if(this._getLocalName(io.id) == vid ||
              this._getLocalName(io.type) == vtype) {
            this.set("datatype", this._getLocalName(io.type));
            this.set("resource_def.resource_type", io.format);
            for(var k=0; k<io.variables.length; k++) {
              variables.push({
                standard_name: io.variables[k].standard_name,
                name: this._getLocalName(io.variables[k].id),
                units: io.variables[k].units
              });
            }
          }
        }
      }
    }
    return variables;
  }

  _getLocalName(id) {
    if(id.match(/#/))
      return id.replace(/^.*#/, '');
    return id.substring(id.lastIndexOf("/") + 1);
  }

  _registerStandardNames(vars, fn) {
    if(!vars || !vars.length) {
      fn([]);
      return;
    }

    var std_var_defs = {
      standard_variables : []
    };
    for(var i=0; i<vars.length; i++) {
      var data = {
        name: vars[i],
        ontology: "GSN",
        uri: "http://www.geoscienceontology.org/svo/svl/variable/#" + vars[i]
      }
      std_var_defs.standard_variables.push(data);
    }
    //console.log(std_var_defs);

    // FIXME: Dummy response to test
    /*
    var json = {
      result: "success",
      standard_variables: []
    }
    var stdvars = std_var_defs.standard_variables;
    for(var i=0; i<stdvars.length; i++) {
      json.standard_variables.push({
        record_id: '2342342-23423-543353-132234'+i,
        name: stdvars[i].name,
        ontology: stdvars[i].ontology,
        uri: stdvars[i].uri
      })
    }
    var varmap = this._addNewStandardVariables(json.standard_variables);
    fn(varmap);*/

    var me = this;
    postJSONResource({
      url: me.config.catalogs.data + "/knowledge_graph/register_standard_variables",
      onLoad: function(e) {
        var json = JSON.parse(e.target.responseText);
        if(json.result == "success") {
          console.log(json);
          var varmap = me._addNewStandardVariables(json.standard_variables);
          fn(varmap);
        }
      },
      onError: function() {
        console.log("Cannot register standard variables");
      }
    }, std_var_defs);
  }

  _addNewStandardVariables(svars) {
    var varmap = {};
    for(var i=0; i<svars.length; i++) {
      var svar = svars[i];
      svar.id = svar.record_id;
      this.push("standardVariables", svar);
      varmap[svar.name] = svar.id;
    }
    return varmap;
  }

  _registerDataset(provid, fn) {
    var def = {
      name: this.dataset_def.name,
      description: this.dataset_def.description,
      provenance_id: provid,
      metadata: this._getCustomMetadata()
    };
    var dataset_defs = {
      datasets: [ def ]
    }

    //console.log(dataset_defs);

    // FIXME: Dummy response
    /*
    var json = {
      result: "success",
      datasets: [{
        record_id: "fa795c84-5bbb-40f6-a124-b0c133e06c3e"
      }]
    }
    for(var i=0; i<json.datasets.length; i++) {
      var ds = json.datasets[i];
      fn(ds.record_id, def);
    }*/


    var me = this;
    postJSONResource({
      url: me.config.catalogs.data + "/datasets/register_datasets",
      onLoad: function(e) {
        var json = JSON.parse(e.target.responseText);
        if(json.result == "success") {
          console.log(json);
          for(var i=0; i<json.datasets.length; i++) {
            var ds = json.datasets[i];
            fn(ds.record_id, def);
          }
        }
      },
      onError: function() {
        console.log("Cannot register dataset");
      }
    }, dataset_defs);
  }

  _registerDatasetVariables(dataset_id, variables, fn) {
    var var_defs = {
        variables: []
    };
    if(!variables || !variables.length) {
      fn([]);
      return;
    }

    for(var i=0; i<variables.length; i++) {
      var iv = variables[i];
      var ov = {
        dataset_id: dataset_id,
        name: iv.name,
        metadata: {},
        standard_variable_ids: [
          iv.standard_name.id
        ]
      }
      if(iv.units)
        ov.metadata.units = iv.units;

      var_defs.variables.push(ov);
    }


    //console.log(var_defs);

    // FIXME: Dummy response
    /*
    var json = {
      variables: []
    }
    for(var i=0; i<variables.length; i++) {
      json.variables.push({
        record_id: "8723423423-234-23454-"+i
      });
    }
    var varids = [];
    for(var i=0; i<json.variables.length; i++) {
      var v = json.variables[i];
      varids.push(v.record_id);
    }
    fn(varids);*/

    var me = this;
    postJSONResource({
      url: me.config.catalogs.data + "/datasets/register_variables",
      onLoad: function(e) {
        var json = JSON.parse(e.target.responseText);
        if(json.result == "success") {
          console.log(json);
          var varids = [];
          for(var i=0; i<json.variables.length; i++) {
            var v = json.variables[i];
            varids.push(v.record_id);
          }
          fn(varids);
        }
      },
      onError: function() {
        console.log("Cannot register dataset variables");
      }
    }, var_defs);
  }

  _registerResource(provid, dataset_id, varids, fn) {
    var temporal = {
      start_time: this.temporal.start_time+"T00:00:00",
      end_time: this.temporal.end_time+"T23:59:59"
    }
    var def = {
      dataset_id: dataset_id,
      provenance_id: provid,
      data_url: this.resource_def.data_url,
      resource_type: this.resource_def.resource_type,
      is_zip: this.resource_def.is_zip+"",
      name: this.dataset_def.name + '_resource',
      metadata: {
        spatial_coverage:  {
          type: "BoundingBox",
          value: this.spatial
        },
        temporal_coverage: temporal
      },
      variable_ids: varids,
      layout: {}
    };
    var resource_defs = {
      resources: [ def ]
    }

    //console.log(resource_defs);

    // FIXME: Dummy response
    // fn(def);

    var me = this;
    postJSONResource({
      url: me.config.catalogs.data + "/datasets/register_resources",
      onLoad: function(e) {
        var json = JSON.parse(e.target.responseText);
        if(json.result == "success") {
          console.log(json);
          fn(def);
        }
      },
      onError: function() {
        console.log("Cannot register resources");
      }
    }, resource_defs);
  }

  _validateItem(value, label) {
    if(!value) {
      alert(label + " is not Specified");
      return false;
    }
    return true;
  }

  _validateDataset() {
    return (
      this._validateItem(this.dataset_def.name, "Name") &&
      this._validateItem(this.dataset_def.description, "Description")
    );
  }

  _validateVariables() {
    var variables = this._getDatasetVariables();
    var newvars = [];
    for(var i=0; i<variables.length; i++) {
      var v = variables[i];
      if(!v.name) {
        alert("Variable name is empty");
        return false;
      }
      if(!v.standard_name.name) {
        alert("Standard name is empty");
        return false;
      }
      if(!v.standard_name.id) {
        newvars.push(v.standard_name.name);
      }
    }
    if(newvars.length) {
      var r = confirm("We are going to create the following new standard variables. Is this ok ?\n" + newvars);
      return r;
    }
    return true;
  }

  _validateMetadata() {
    var metadata = this._getCustomMetadata();

    for(var key in metadata) {
      if(key.match(/^viz_config/)) {
        // Viz config
        var viz_config = metadata[key];
        if(!this._validateItem(viz_config.viz_type, "Visualization Preference"))
          return false;
        for(var vizkey in viz_config.metadata) {
          if(!this._validateItem(viz_config.metadata[vizkey], "Visualization: " + vizkey)) {
            return false;
          }
        }
      }
      else {
        // Normal custom metadata
        if(!this._validateItem(key, "Metadata key")) {
          return false;
        }
        if(!this._validateItem(metadata[key], "Metadata " + key)) {
          return false;
        }
      }
    }
    return true;
  }

  _validateResource() {
    return (
      this._validateItem(this.resource_def.data_url, "URL") &&
      this._validateItem(this.resource_def.resource_type, "Format") &&
      this._validateItem(this.datatype, "Data Type") &&
      this._validateItem(this.spatial.xmin, "X Min") &&
      this._validateItem(this.spatial.xmax, "X Max") &&
      this._validateItem(this.spatial.ymin, "Y Min") &&
      this._validateItem(this.spatial.ymax, "Y Max") &&
      this._validateItem(this.temporal.start_time, "Start Time") &&
      this._validateItem(this.temporal.end_time, "End Time")
    );
  }

  _publishDataset() {
    // Simple Validation (Nothing empty)
    if(
      !this._validateDataset() ||
      !this._validateResource() ||
      !this._validateVariables() ||
      !this._validateMetadata()
    ) {
      return;
    }

    var provid = "217f5a9a-a8c5-4223-9db9-4fc8bcbf0411";
    var variables = this._getDatasetVariables();
    var vars_to_register = [];
    for(var i=0; i<variables.length; i++) {
      if(!variables[i].standard_name.id)
        vars_to_register.push(variables[i].standard_name.name);
    }

    var me = this;
    this._registerStandardNames(vars_to_register, function(varmap) {
      variables = me._getDatasetVariablesAfterUpdate();
      me._registerDataset(provid, function(dataset_id, dataset_def) {
        me._registerDatasetVariables(dataset_id, variables, function(varids) {
          me._registerResource(provid, dataset_id, varids, function(resource_def) {
            me._kickoffTransformation(dataset_id, dataset_def, resource_def, function(response) {
              alert("Successfully Registered");
              console.log(response);
            });
          });
        });
      });
    });
  }

  _kickoffTransformation(dataset_id, dataset_def, resource_def, fn) {
    dataset_def.dataset_id = dataset_id;
    dataset_def.data_url = resource_def.data_url;
    for(var key in dataset_def.metadata) {
      if(key.match(/^viz_config/)) {
        dataset_def.metadata[key].datatype = this.datatype;
      }
    }
    var me = this;
    postJSONResource({
      url: me.config.transformation.server,
      onLoad: function(e) {
        fn(e.target.responseText);
      },
      onError: function() {
        console.log("Cannot send job to Transformation Service");
      }
    }, dataset_def);
  }

  _getCustomMetadata() {
    var metadata = {
      datatype: this.datatype
    };
    // Get metadata values specified by the user
    var inputs = this.$.custom.querySelectorAll("paper-input");
    for(var i=0; i<inputs.length; i+=2) {
      var kip = inputs[i];
      var vip = inputs[i+1];
      if(kip.value && vip.value)
        metadata[kip.value] = vip.value;
    }
    // Convert viz_configs to metadata
    for(var i=0; i<this.viz_configs.length; i++) {
      var viz = this.viz_configs[i];
      var viz_config = {
        id: viz.id,
        transformed: false,
        visualized: false,
        datatype: this.datatype,
        viz_type: viz.viz_type,
        metadata: {}
      }
      if(viz.viz_type) {
        var hashid = viz.id + viz.viz_type;
        var keys = this.keys[hashid];
        if(keys) {
          for(var j=0; j<keys.length; j++) {
            var key = keys[j];
            viz_config.metadata[key.name] = key.value;
          }
        }
      }
      metadata["viz_config_"+viz_config.id] = viz_config;
    }
    return metadata;
  }

  _getDatasetVariablesAfterUpdate() {
    var combos = this.$.variables.querySelectorAll("vaadin-combo-box");
    var stdmap = {};
    for(var j=0; j<this.standardVariables.length; j++) {
      var v = this.standardVariables[j];
      stdmap[v.name] = v;
    }
    for(var i=0; i<combos.length; i++) {
      var combo = combos[i];
      if(!combo.selectedItem) {
        if(stdmap[combo.value])
          combos[i].selectedItem = stdmap[combo.value];
      }
    }
    return this._getDatasetVariables();
  }

  _getDatasetVariables() {
    var variables = [];
    var combos = this.$.variables.querySelectorAll("vaadin-combo-box");
    var inputs = this.$.variables.querySelectorAll("paper-input");
    for(var i=2; i<inputs.length; i+=2) {
      var stditem = combos[i/2];
      var varname = inputs[i];
      var units = inputs[i+1];
      var selitem = stditem.selectedItem;
      if(stditem.value && varname.value && units.value) {
        // Combobox will return an object if standard name exists
        // or will return a string if it doesn't
        var variable = {
          standard_name: {
            id: selitem ? selitem.id : null,
            name: stditem.value
          },
          name: varname.value,
          units: units.value
        }
        variables.push(variable);
      }
    }
    return variables;
  }
}

customElements.define(MintResultsPublish.is, MintResultsPublish);

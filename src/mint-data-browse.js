import '@polymer/app-route/app-route.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@vaadin/vaadin-date-picker/theme/material/vaadin-date-picker.js';

import './loading-screen.js';
import './mint-icons.js';
import './mint-common-styles.js';
import { putJSONResource, postJSONResource } from './mint-requests.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';

class MintDataBrowse extends PolymerElement {
  static get template() {
    return html`

    <style include="mint-common-styles">
      div.searchToolbar {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-flow: row;
        border-bottom: 2px solid var(--app-accent-color);
        background-color: #f6f6f6;
        padding: 4px;
      }
      .searchToolbar paper-button {
        margin-top: 20px;
      }
      .outer paper-button {
        margin-top: 10px;
        --paper-button: {
          padding: 4px 0px;
        }
      }
      paper-button.action {
        --paper-button: {
          padding: 0px;
        }
      }
      div.shifted {
        margin-left: -2px;
      }
      div.noscroll {
        overflow: hidden;
        padding-bottom: 70px;
      }
      div.searchToolbar paper-input {
        margin-top:2px;
      }
      div.searchToolbar * {
        margin-right: 5px;
      }
      a.mint-button {
        cursor: pointer;
        margin-right: 5px;
      }
      div.datarow {
        display: flex;
        flex-flow: row;
        justify-content: flex-start;
      }
      vaadin-date-picker {
        width: calc(100% - 8px);
        margin-left: 4px;
        margin-right: 4px;
        --vaadin-date-picker-text-field: {
          font-size: inherit;
        }
      }
      paper-input {
        width: calc(100% - 8px);
        font-size: inherit;
        --paper-input-container: {
          padding: 4px;
        }
      }
      paper-dropdown-menu {
        margin-left: 4px;
        width: calc(100% - 8px);
      }
      iron-icon {
        width: 20px;
        height: 20px;
      }
      div.selected_datasets {
        margin-left: 5px;
      }
      div.datarow .chartlink {
        margin-left: 5px;
      }
      iron-collapse.variables {
        font-size: 12px;
        font-style: italic;
        color: #999;
      }
      li {
        margin-bottom: 4px;
      }
      paper-checkbox {
        --paper-checkbox-size: 16px;
      }

      a.action {
        cursor:pointer;
      }
      div.dataset_area {
        display: flex;
        flex-flow: row;
        margin-left: 10px;
        padding-bottom: 80px;
      }
      div.dataset_list {
        width: 100%;
      }
      div.selected_datasets {
        width: 100%;
      }
      .selected_datasets ul {
        margin: 0px;
        padding-left: 15px;
      }
      .selected_datasets ul li {
        margin: 0px;
        color: #999;
      }

      .register_link {
        margin: 15px;
        margin-bottom: 5px;
        font-size: 12px;
      }
      .dataset_list ul {
        padding-left: 16px;
        list-style: circle;
      }
      .dataset_list > ul {
        margin-left: 0px;
        padding-left: 5px;
        list-style: none;
        margin-bottom: 5px;
      }
      .dataset_list ul b {
        display: block;
        margin-top: 16px;
        margin-bottom: 8px;
        font-size: 12px;
        line-height: 20px;
      }
      iron-icon.graph-icon {
        color: green;
      }

      @media (max-width: 767px) {
        div.searchToolbar {
          flex-flow: column;
        }
      }
    </style>

    <app-route route="[[route]]" pattern="/:regionid" data="{{routeData}}" tail="{{subroute}}"></app-route>
    <app-route route="[[subroute]]" pattern="/:questionid/:taskid/:varids/:op"
      data="{{subrouteData}}"></app-route>

    <template is="dom-if" if="[[selectMode]]">
      <!-- Get question, task, data specification, graph -->
      <template is="dom-if" if="[[visible]]">
        <template is="dom-if" if="[[userid]]">
          <template is="dom-if" if="[[subrouteData.questionid]]">
            <iron-ajax auto url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[subrouteData.questionid]]"
              handle-as="json" last-response="{{question}}"></iron-ajax>
            <iron-ajax auto
              url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[subrouteData.questionid]]/tasks/[[subrouteData.taskid]]"
              handle-as="json" last-response="{{task}}"></iron-ajax>
            <iron-ajax auto
              url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[subrouteData.questionid]]/data"
              handle-as="json" last-response="{{dataSpecs}}"></iron-ajax>
            <template is="dom-if" if="[[question]]">
              <iron-ajax auto="" url="[[question.graph]]" handle-as="json" last-response="{{graph}}"></iron-ajax>
            </template>
          </template>
        </template>
      </template>
    </template>

    <!-- Top toolbar -->
    <div class="toolbar">
      <paper-button>DATASETS: [[routeData.regionid]]</paper-button>
    </div>
    <div class="outer noscroll">
      <loading-screen loading="[[loading]]"></loading-screen>
      <div class="searchToolbar" id="searchToolbar">
        <!-- Select sub region -->
        <paper-dropdown-menu no-animations label="Select Sub-Region">
          <paper-listbox slot="dropdown-content" attr-for-selected="value" selected="{{subregion}}">
            <paper-item value="[[region]]">[[region.label]]</paper-item>
            <template is="dom-repeat" items="[[regionsList]]">
              <paper-item value="[[item]]">[[item.label]]</paper-item>
            </template>
          </paper-listbox>
        </paper-dropdown-menu>
        <paper-input label="Dataset Name" value="{{queryConfig.datasetName}}"></paper-input>
        <paper-input label="Standard Names" value="{{queryConfig.variables}}"></paper-input>
        <vaadin-date-picker label="Start Date" value="{{queryConfig.startDate}}"></vaadin-date-picker>
        <vaadin-date-picker label="End Date" value="{{queryConfig.endDate}}"></vaadin-date-picker>
        <paper-button class="important" on-tap="_getDataList">Search</paper-button>
      </div>

      <div class="outer shifted">
        <div class="register_link">
          <a href="/results/publish">REGISTER NEW DATASETS</a>
        </div>
        <div class="dataset_area">
          <template is="dom-if" if="[[_isEmpty(filesList, loading)]]">
            <div class="dataset_list">
              <br />
              <template is="dom-if" if="[[!_isEmptyHash(queryConfig)]]">
                NO DATASETS FOR CURRENT QUERY
              </template>
              <template is="dom-if" if="[[_isEmptyHash(queryConfig)]]">
                SEARCH FOR DATASETS
              </template>
            </div>
          </template>
          <template is="dom-if" if="[[!_isEmpty(filesList, loading)]]">
              <div class="dataset_list">
                <ul>
                  <template is="dom-repeat" items="[[filesList]]" as="type">
                    <li>
                      <b>[[type.datatype]]</b>
                      <ul>
                        <template is="dom-repeat" items="[[type.datasets]]" as="dataset">
                          <li>
                            <div class="datarow">
                              <template is="dom-if" if="[[selectMode]]">
                                <paper-checkbox on-change="_selectDataset" checked="[[dataset.selected]]"
                                  value="[[dataset]]"></paper-checkbox>
                              </template>
                              [[dataset.dataset_name]]
                              <template is="dom-if" if="[[dataset.resources]]">
                                &nbsp;
                                <a title="Show Resources" class="mint-button" on-tap="_toggleResources">
                                  ([[dataset.resources.length]] resources)</a>
                              </template>
                              <template is="dom-repeat" items="[[_getVizConfigs(dataset)]]" as="viz_config">
                                <a title="[[viz_config.metadata.title]]" class="chartlink"
                                  href="[[_getVisualizationLink(viz_config)]]">
                                  <iron-icon class="graph-icon" icon="[[_getVizIcon(viz_config)]]" />
                                </a>
                              </template>
                              <!--
                              <a title="Add Visualization" href="/results/publish/edit/[[dataset.dataset_id]]">
                                <iron-icon icon="add">
                              </a>
                              -->
                            </div>
                            <iron-collapse closed>
                              <ul>
                                <template is="dom-repeat" items="[[dataset.resources]]" as="res">
                                  <li>
                                    [[res.resource_name]]
                                    <a title="Download" href="[[res.resource_data_url]]"><iron-icon icon="file-download" /></a>
                                  </li>
                                </template>
                              </ul>
                            </iron-collapse>
                          </li>
                        </template>
                      </ul>
                    </li>
                  </template>
                </ul>
              </div>
            </template>

            <template is="dom-if" if="[[selectMode]]">
              <div class="selected_datasets">
                <b>SELECTED DATASETS</b>
                <paper-button class="important" on-tap="_submitDataSpecification">DONE</paper-button>
                <ul>
                  <template is="dom-repeat" items="[[dataSpec.ensemble]]" as="ensemble">
                    <template is="dom-repeat" items="[[ensemble.datasets]]" as="dataset">
                    <li>
                      <div class="dataset">
                        [[dataset.name]]
                        <a title="Show Variables" class="mint-button" on-tap="_toggleVariables">
                          ([[ensemble.variables.length]] variables)</a>
                        <a class="action" on-click="_removeDataset"><iron-icon icon="cancel" /></a>
                      </div>
                      <iron-collapse closed class="variables">
                        <template is="dom-repeat" items="[[ensemble.variables]]" as="vitem" index-as="vindex">
                          <template is="dom-if" if="[[vindex]]">,</template>
                          [[vitem]]
                        </template>
                      </iron-collapse>
                    </li>
                    </template>
                  </template>
                </ul>
              </div>
            </template>

          </div>

        </template>
      </div>
    </div>
    <!-- Bottom toolbar -->
    <div class="toolbar bottom">
      <paper-button>&nbsp;</paper-button>
    </div>
`;
  }

  static get is() { return 'mint-data-browse'; }

  static get properties() {
    return {
      dataCatalog: Object,
      config: Object,
      userid: String,
      vocabulary: Object,
      standardName: String,
      regionid: String,
      region: {
        type: Object,
        computed: '_getRegionObject(vocabulary, routeData.regionid)'
      },
      subregion: Object,
      dataList: Array,
      filesList: {
        type: Array,
        value: []
      },
      queryConfig: {
        type: Object,
        value: {}
      },
      britishLocale: {
        type: Boolean,
        computed: '_isBritishLocale()'
      },
      selectMode: {
        type: Boolean,
        computed: '_isSelectionMode(subrouteData.op)'
      },
      regionsList: {
        type: Array,
        computed: '_getSubRegions(vocabulary, routeData)'
      },
      dataSpecs: Array,
      dataSpec: Object,
      routeData: Object,
      route: Object,
      loading: {
        type: Boolean,
        value: false
      },
      visible: Boolean
    };
  }

  static get observers() {
    return [
      '_emptyHandler(route)',
      '_initialOverallDataFetch(region, subroute)',
      '_initialQuestionDataFetch(question, subrouteData.op, subrouteData.varids, subregion)',
      '_createDataSpecsDetails(dataSpecs)',
      '_setSubregionForQuestion(vocabulary, question)'
    ];
  }

  ready() {
    super.ready();
    afterNextRender(this, () => {
      var datePickers = this.$.searchToolbar.querySelectorAll("vaadin-date-picker");
      for(var i=0; i<datePickers.length; i++) {
        var dp = datePickers[i];
        dp.set("i18n.formatDate", (function(a) { return this._formatDate(a); }).bind(this));
        dp.set("i18n.parseDate", (function(a) { return this._parseDate(a); }).bind(this));
      }
    });
  }

  _getSubRegions(vocabulary, rd) {
    if(this.region)
      return this.region.subRegions;
    if(vocabulary)
      return vocabulary.regions;
  }

  _getVizConfigs(dataset) {
    var configs = [];
    if(!dataset)
      return configs;

    var meta = dataset.metadata;
    for(var key in meta) {
      if(key.match(/^viz_config/)) {
        var viz_config = meta[key];
        if(viz_config.viz_type && viz_config.visualized && viz_config.id)
          configs.push(viz_config);
      }
    }
    //console.log(configs);
    return configs;
  }

  _getVizIcon(config) {
    return config.viz_type.replace(/^mint-/, '');
  }

  _isVisualizable(dataset) {
    if(dataset.resources && dataset.resources.length > 0) {
      var meta = dataset.resources[0].dataset_metadata;
      for(var key in meta) {
        if(key.match(/^viz_config/)) {
          var viz_config = meta[key];
          if(viz_config.visualized && viz_config.id)
            return true;
        }
      }
    }
    return false;
  }

  _getVisualizationLink(viz_config) {
    var id = viz_config.id;
    return "/visualizations/"+id+"/"+viz_config.viz_type;
  }

  _emptyHandler(route) {
    if(!route.path || route.path == "" ) {
      this.set("dataSpecs", []);
      this.set("subrouteData", {});
      this.set("subregion", null);
      this.set("dataSpec", {});
      this.set("filesList", {});
      this.set("queryConfig", {});
    }
  }

  _initialOverallDataFetch(region, subroute) {
    if(!subroute.path || subroute.path == "" ) {
      if(region) {
        this.set("subregion", region);
        this.set("queryConfig.variables", null);
        this._getDataList();
      }
    }
  }

  _initialQuestionDataFetch(question, op, varids, subregion) {
    if(!question)
      return;
    if(varids)
      this.set("queryConfig.variables", varids);
    if(subregion)
      this.set("queryConfig.bbox", subregion.bbox);

    if(subregion && op == "select") {
      afterNextRender(this, () => {
        this._getDataList();
      });
    }
  }

  _getRegionObject(vocabulary, regionid) {
    if(vocabulary && regionid) {
      var regions = [].concat(vocabulary.regions);
      while(regions.length) {
        var region = regions.pop();
        if(regionid == this._getLocalName(region.id))
          return region;
        if(region.subRegions)
          regions = regions.concat(region.subRegions);
      }
    }
  }

  _setSubregionForQuestion(vocabulary, question) {
    if(vocabulary && question) {
      var subregion = this._getRegionObject(vocabulary, this._getLocalName(question.region));
      this.set("subregion", subregion);
    }
  }

  _createDataSpecsDetails(dataSpecs) {
    if(dataSpecs) {
      this.set("loading", false);
      if(dataSpecs.length > 0) {
        this.set("dataSpec", dataSpecs[0]);
      }
      else {
        this.dataSpec = {ensemble:[]};
      }
    }
  }

  _checkDatasetInSpec(dsid) {
    // Check that the dataset doesn't already exist
    var eindex = -1;
    var dsindex = -1;
    for(var i=0; i<this.dataSpec.ensemble.length; i++) {
      var ens = this.dataSpec.ensemble[i];
      for(var j=0; j<ens.datasets.length; j++) {
        if(ens.datasets[j].id == dsid) {
          eindex = i;
          dsindex = j;
          break;
        }
      }
      if(eindex >= 0)
        break;
    }
    return [eindex, dsindex];
  }

  _selectDataset(e) {
    var checkbox = e.target;
    var dataset = checkbox.value;

    // Check if dataset already exists
    var indices = this._checkDatasetInSpec(dataset.dataset_id);
    var eindex = indices[0];
    var dsindex = indices[1];

    if(checkbox.checked) {
      // Add the item
      if(eindex < 0) {
        if(!dataset.variables) {
          // Fetch dataset variables if they don't already exist
          var me =this;
          this.dataCatalog.getDatasetVariables(dataset.dataset_id, function(variables) {
            var varnames = [];
            if(variables) {
              for(var i=0; i<variables.length; i++) {
                varnames.push(variables[i].name);
              }
            }
            dataset.variables = varnames;
            me._addDatasetToSpec(dataset);
          });
        }
        else {
          this._addDatasetToSpec(dataset);
        }
      }
    }
    else {
      // Delete the item
      this._delDatasetFromSpec(dataset.dataset_id, eindex, dsindex);
    }
  }

  _addDatasetToSpec(dataset) {
    // Create a data spec dataset
    var ds = { id: dataset.dataset_id, name: dataset.dataset_name };

    // Check if another dataset with the same variables already exists
    var dsvars = dataset.variables.sort() + "";
    for(var i=0; i<this.dataSpec.ensemble.length; i++) {
      var ens = this.dataSpec.ensemble[i];
      var ensvars = ens.variables.sort() + "";
      if(dsvars == ensvars) {
        // Copy dataset here
        this.push("dataSpec.ensemble."+i+".datasets", ds);
        this._markDatasetInFileList(ds.id);
        return;
      }
    }
    // Else add a new ensemble entry
    this.push("dataSpec.ensemble", { datasets:[ds], variables:dataset.variables});
    this._markDatasetInFileList(ds.id);
  }

  _removeDataset(evnt) {
    var ds = evnt.model.get('dataset');
    var indices = this._checkDatasetInSpec(ds.id);
    var eindex = indices[0];
    var dsindex = indices[1];
    this._delDatasetFromSpec(ds.id, eindex, dsindex);
  }

  _delDatasetFromSpec(dsid, eindex, dsindex) {
    if(eindex >=0 && dsindex >=0) {
      var ens = this.dataSpec.ensemble[eindex];
      if(ens.datasets.length == 1)
        this.splice("dataSpec.ensemble", eindex, 1);
      else
        this.splice("dataSpec.ensemble."+eindex+".datasets", dsindex, 1);
    }
    this._unmarkDatasetInFileList(dsid);
  }

  _unmarkDatasetInFileList(dsid) {
    for(var i=0; i<this.filesList.length; i++) {
      var ds = this.filesList[i];
      if(ds.dataset_id == dsid) {
        this.set("filesList."+i+".selected", false);
        break;
      }
    }
  }

  _markDatasetInFileList(dsid) {
    for(var i=0; i<this.filesList.length; i++) {
      var ds = this.filesList[i];
      if(ds.dataset_id == dsid) {
        this.set("filesList."+i+".selected", true);
        break;
      }
    }
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

  _toggleResources(e) {
    e.target.parentNode.parentNode.querySelector("iron-collapse").toggle();
  }

  _toggleVariables(e) {
    e.target.parentNode.parentNode.querySelector("iron-collapse").toggle();
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

  _isSelectionMode(op) {
    return op == "select";
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

  _createGeoJsonURL(region) {
    if(region) {
      var url = region.boundaryVector;
      return url;
    }
    return null;
  }

  _getDataList() {
    var me = this;
    if(this.queryConfig) {
      me.set("loading", true);
      if(this.subregion)
        this.queryConfig.bbox = this.subregion.bbox;
      return this.dataCatalog.findDatasets(this.queryConfig, function(bindings) {
        me.set("loading", false);
        var selected = {};
        if(bindings) {
          if(me.dataSpec && me.dataSpec.ensemble) {
            var ens = me.dataSpec.ensemble;
            for(var j=0; j<ens.length; j++) {
              for(var i=0; i<ens[j].datasets.length; i++) {
                selected[ens[j].datasets[i].id] = true;
              }
            }
          }
          for(var i=0; i<bindings.length; i++) {
            bindings[i] = me._setExtraMetadata(bindings[i]);
            var dsid = bindings[i].dataset_id;
            bindings[i].selected = selected[dsid];
          }

          bindings = me._groupByDatatype(bindings);
          // TODO: Sort Bindings by
          me.set("filesList", bindings);
        }
      });
    }
  }

  _setExtraMetadata(binding) {
    for(var i=0; i<binding.resources.length; i++) {
      binding.metadata = binding.resources[i].dataset_metadata;
      delete binding.resources[i].dataset_metadata;
    }
    return binding;
  }

  _groupByDatatype(bindings) {
    var typemap = {};
    for(var i=0; i<bindings.length; i++) {
      var datatype = "Unknown Type";
      var b = bindings[i];
      if(b.metadata && b.metadata.datatype) {
        datatype = b.metadata.datatype;
      }
      var typeBindings = typemap[datatype];
      if(!typeBindings)
        typeBindings = [];
      typeBindings.push(b);
      typemap[datatype] = typeBindings;
    }
    var types = [];
    for(var typeid in typemap) {
      types.push({
        datatype: typeid,
        datasets: typemap[typeid]
      });
    }
    return types;
  }

  _submitDataSpecification() {
    var me = this;
    var existing = (me.dataSpecs && me.dataSpecs.length > 0);
    if(existing) {
      me.dataSpecs[0] = me.dataSpec;
      // PUT REQUEST
      putJSONResource({
        url: me.dataSpecs[0].id,
        onLoad: function(e) {
          me.setTaskOutput(me.dataSpecs[0].id);
        },
        onError: function() {
          console.log("Cannot update data");
        }
      }, me.dataSpecs[0]);
    }
    else {
      // POST REQUEST
      me.dataSpecs[0] = me.dataSpec;
      postJSONResource({
        url: me.config.server + "/users/" + me.userid + "/regions/" + me.routeData.regionid + "/questions/" + me.subrouteData.questionid + "/data",
        onLoad: function(e) {
          var outputid = e.target.responseText;
          me.setTaskOutput(outputid);
        },
        onError: function() {
          console.log("Cannot add data");
        }
      }, me.dataSpecs[0]);
    }
  }

  setTaskOutput(output) {
    var me = this;
    var empty = me.dataSpec.ensemble.length ? false: true;

    me.task.status = empty ? "NOT_STARTED" : "DONE";
    me.task.output = empty ? null : [output];
    for(var actid in me.task.activities) {
      if(actid.indexOf("SelectDatasets") > 0) {
        me.task.activities[actid].output = empty ? null : [output];
      }
    }

    putJSONResource({
      url: me.task.id,
      onLoad: function(e) {
        var new_path = '/govern/analysis/' + me._getLocalName(me.routeData.regionid) + "/" +
          me.subrouteData.questionid + "/" + me.subrouteData.taskid;

        window.history.pushState({task: me.task, dataSpecs: me.dataSpecs}, null, new_path);
        window.dispatchEvent(new CustomEvent('location-changed'));
        //location.reload();
      },
      onError: function() {
        console.log("Cannot update task");
      }
    }, me.task)
  }

  _getLocalName(id) {
    return id.substring(id.lastIndexOf("/") + 1);
  }

  _getViewDataURL(item) {
    var url = "data/view/"+item.dataset_id;
    return url;
  }

  _isEmpty(list, loading) {
    return !loading && (!Array.isArray(list) || list.length == 0);
  }

  _isEmptyHash(hash) {
    if(!hash)
      return true;
    for(var key in hash)
      if(hash[key])
        return false;
    return true;
  }
}

customElements.define(MintDataBrowse.is, MintDataBrowse);

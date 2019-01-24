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
      }
      div.dataset_list {
        width: 50%;
      }
      div.selected_datasets {
        width: 50%;
      }
      .selected_datasets ul {
        margin: 0px;
        padding-left: 15px;
      }
      .selected_datasets ul li {
        margin: 0px;
        color: #999;
      }

      @media (max-width: 767px) {
        div.searchToolbar {
          flex-flow: column;
        }
      }
    </style>

    <template is="dom-if" if="[[visible]]">
      <iron-ajax auto url="[[config.server]]/common/regions/[[routeData.regionid]]" handle-as="json" last-response="{{region}}"></iron-ajax>
      <iron-ajax auto url="[[_createGeoJsonURL(subregion)]]" handle-as="json" last-response="{{queryConfig.regionGeoJson}}"></iron-ajax>
    </template>

    <template is="dom-if" if="[[selectMode]]">
      <!-- Get question and task -->
      <template is="dom-if" if="[[visible]]">
        <template is="dom-if" if="[[userid]]">
          <template is="dom-if" if="[[routeData.questionid]]">
            <iron-ajax auto url="[[config.server]]/users/[[userid]]/questions/[[routeData.questionid]]"
              handle-as="json" last-response="{{question}}"></iron-ajax>
            <iron-ajax auto
              url="[[config.server]]/users/[[userid]]/questions/[[routeData.questionid]]/tasks/[[routeData.taskid]]"
              handle-as="json" last-response="{{task}}"></iron-ajax>
            <iron-ajax auto
              url="[[config.server]]/users/[[userid]]/questions/[[routeData.questionid]]/data"
              handle-as="json" last-response="{{dataSpecs}}"></iron-ajax>
          </template>
        </template>
      </template>
    </template>

    <template is="dom-if" if="[[visible]]">
      <template is="dom-if" if="[[userid]]">
        <template is="dom-if" if="[[routeData.questionid]]">
          <iron-ajax auto="" url="[[config.server]]/users/[[userid]]/questions/[[routeData.questionid]]" handle-as="json" last-response="{{question}}"></iron-ajax>
          <template is="dom-if" if="[[question]]">
            <iron-ajax auto="" url="[[question.graph]]" handle-as="json" last-response="{{graph}}"></iron-ajax>
          </template>
          <iron-ajax auto="" url="[[config.server]]/users/[[userid]]/questions/[[routeData.questionid]]/tasks/[[routeData.taskid]]" handle-as="json" last-response="{{task}}"></iron-ajax>
        </template>

        <iron-ajax auto="" url="[[config.server]]/common/regions/[[routeData.regionid]]" handle-as="json" last-response="{{region}}"></iron-ajax>
        <iron-ajax auto="" url="[[_createGeoJsonURL(region)]]" handle-as="json" last-response="{{regionGeoJson}}"></iron-ajax>

        <iron-ajax auto="" url="[[config.server]]/users/[[userid]]/questions/[[routeData.questionid]]/data" handle-as="json" last-response="{{dataSpecs}}"></iron-ajax>
      </template>
    </template>

    <!--
      TODO
      - For routeData.op of "select", add
        - Ajax for question id and task id
        - Function to update task
        - Function to update data selection
        - Checkboxes to select datasets
        - Button to save data specification
    -->

    <app-route route="[[route]]" pattern="/:regionid/:questionid/:taskid/:varids/:op" data="{{routeData}}"></app-route>

    <!-- Top toolbar -->
    <div class="toolbar">
      <paper-button>DATASETS: [[routeData.regionid]]</paper-button>
    </div>
    <div class="outer">
      <loading-screen loading="[[loading]]"></loading-screen>    
      <div class="searchToolbar" id="searchToolbar">
        <!-- Select sub region -->
        <paper-dropdown-menu no-animations="" hotizontal-align="left" label="Select Sub-Region">
          <paper-listbox slot="dropdown-content" attr-for-selected="value" selected="{{subregion}}">
            <paper-item value="[[region]]">[[region.label]]</paper-item>
            <template is="dom-repeat" items="[[region.subRegions]]">
              <paper-item value="[[item]]">[[item.label]]</paper-item>
            </template>
          </paper-listbox>
        </paper-dropdown-menu>
        <paper-input label="Dataset Name" value="{{queryConfig.datasetName}}"></paper-input>
        <paper-input label="Standard Names" value="{{queryConfig.variables}}"></paper-input>
        <vaadin-date-picker label="Start Date" value="{{queryConfig.startDate}}"></vaadin-date-picker>
        <vaadin-date-picker label="End Date" value="{{queryConfig.endDate}}"></vaadin-date-picker>
        <paper-button on-tap="_getDataList">Search</paper-button>
      </div>
      <div class="outer shifted">
        <template is="dom-if" if="[[_isEmpty(filesList, loading)]]">
          <br>
          <center>NO DATASETS FOUND</center>
        </template>

        <template is="dom-if" if="[[!_isEmpty(filesList, loading)]]">

          <div class="dataset_area">

            <div class="dataset_list">
              <ul>
                <template is="dom-repeat" items="[[filesList]]">
                  <li>
                    <div class="datarow">
                      <template is="dom-if" if="[[selectMode]]">
                        <paper-checkbox on-change="_selectDataset" checked="[[item.selected]]"
                          value="[[item]]"></paper-checkbox>
                      </template>
                      <template is="dom-if" if="[[item.resources]]">
                        <a title="Show Resources" class="mint-button" on-tap="_toggleResources">
                          [[item.dataset_name]] ([[item.resources.length]] resources)</a>
                      </template>
                      <template is="dom-if" if="[[!item.resources]]">
                          [[item.dataset_name]] ([[item.dataset_description]])
                      </template>
                      <a title="View" class="chartlink"
                        href="/data/view/[[item.dataset_id]]"><iron-icon icon="chart" /></a>
                    </div>

                    <iron-collapse closed>
                      <ul>
                        <template is="dom-repeat" items="[[item.resources]]" as="res">
                          <li>
                            [[res.resource_name]]
                            <a title="Download" href="[[res.resource_data_url]]"><iron-icon icon="file-download" /></a>
                          </li>
                        </template>
                      </ul>
                    </iron-collapse>
                  </li>
                  <!--li><a href="[[_getViewDataURL(item)]]">[[item.dataset.value]]</li-->
                </a></template>
              </ul>
            </div>

            <template is="dom-if" if="[[selectMode]]">
              <div class="selected_datasets">
                <b>SELECTED DATASETS</b>
                <paper-button on-tap="_submitDataSpecification">Submit</paper-button>
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
      standardName: String,
      regionid: String,
      region: Object,
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
        computed: '_isSelectionMode(routeData.op)'
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
      '_initialDataFetch(routeData.regionid, routeData.varids, routeData.op, dataSpec)',
      '_createDataSpecsDetails(dataSpecs)'
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
    console.log("unmark " + dsid);
    for(var i=0; i<this.filesList.length; i++) {
      var ds = this.filesList[i];
      if(ds.dataset_id == dsid) {
        console.log("done");
        this.set("filesList."+i+".selected", false);
        break;
      }
    }
  }

  _markDatasetInFileList(dsid) {
    console.log("mark " + dsid);
    for(var i=0; i<this.filesList.length; i++) {
      var ds = this.filesList[i];
      if(ds.dataset_id == dsid) {
        console.log("done");
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
      return this.dataCatalog.findDatasets(this.queryConfig, function(bindings) {
        var selected = {};
        if(me.dataSpec && me.dataSpec.ensemble) {
          var ens = me.dataSpec.ensemble;
          for(var j=0; j<ens.length; j++) {
            for(var i=0; i<ens[j].datasets.length; i++) {
              selected[ens[j].datasets[i].id] = true;
            }
          }
        }
        for(var i=0; i<bindings.length; i++) {
          var dsid = bindings[i].dataset_id;
          bindings[i].selected = selected[dsid];
        }
        me.set("loading", false);
        me.set("filesList", bindings);
      });
    }
  }

  _submitDataSpecification() {
    var me = this;
    var existing = (me.dataSpecs && me.dataSpecs.length > 0);
    if(existing) {
      me.dataSpecs[0] = me.dataSpec;
      // PUT REQUEST
      me._putResource({
        url: me.dataSpecs[0].id,
        onLoad: function(e) {
          me._goBack();
        },
        onError: function() {
          console.log("Cannot update data");
        }
      }, me.dataSpecs[0]);
    }
    else {
      // POST REQUEST
      me.dataSpecs[0] = me.dataSpec;
      me._postResource({
        url: me.config.server + "/users/" + me.userid + "/questions/" + me.routeData.questionid + "/data",
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

  _goBack() {
    var new_path = '/govern/analysis/' + this._getLocalName(this.routeData.regionid) + "/" +
      this.routeData.questionid + "/" + this.routeData.taskid;
    window.history.pushState({}, null, new_path)
    location.reload();
  }

  setTaskOutput(output) {
    var me = this;
    me.task.status = "DONE";
    me.task.output = [output];
    for(var actid in me.task.activities) {
      if(actid.indexOf("SelectDatasets") > 0) {
        me.task.activities[actid].output = [output];
      }
    }
    me._putResource({
      url: me.task.id,
      onLoad: function(e) {
        me._goBack();
      },
      onError: function() {
        console.log("Cannot update task");
      }
    }, me.task)
  }

  _getLocalName(id) {
    return id.substring(id.lastIndexOf("/") + 1);
  }

  _initialDataFetch(regionid, varids, op, dataSpec) {
    if(regionid && this.regionid != regionid && varids && dataSpec) {
      this.set("queryConfig.variables", varids);
      if(op == "select") {
        this._getDataList();
      }
    }
  }

  _getViewDataURL(item) {
    var url = "data/view/"+item.dataset_id;
    return url;
  }

  _isEmpty(list, loading) {
    return !loading && (!Array.isArray(list) || list.length == 0);
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

customElements.define(MintDataBrowse.is, MintDataBrowse);

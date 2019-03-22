import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-button/paper-button.js';

import { putJSONResource } from './mint-requests.js';
import './mint-common-styles.js';

class MintModels extends PolymerElement {
  static get is() { return 'mint-models'; }

  static get template() {
    return html`
    <style include="mint-common-styles">
      div.searchToolbar {
        display: flex;
        align-items: stretch;
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
      div.outer paper-input {
        width: 100%;
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
      .datarow {
        margin: 5px;
      }
      .mint-button {
        cursor:pointer;
      }
      paper-button.important {
        margin-left: 25px;
        margin-top: 25px;
      }
      div.shifted {
        display: flex;
        flex-flow: row;
      }
      a.action {
        cursor:pointer;
      }
      div.model_list {
        width: 50%;
      }
      div.selected_models {
        width: 50%;
      }
      .selected_models ul {
        margin: 0px;
        padding-left: 15px;
      }
      .selected_models ul li {
        margin: 0px;
        color: #999;
      }
      div.model_list ul li li {
        font-size: 12px;
        font-weight: normal;
      }
      iron-icon {
        width: 20px;
        height: 20px;
      }
      div.bold {
        font-weight: bold;
        margin-left: 10px;
        text-transform: uppercase;
        font-size: 12px;
      }
      div.description {
        font-size: 11px;
        font-weight: normal;
        font-style: italic;
        margin-bottom: 10px;
        margin-left: 12px;
      }
      .explorer_link {
        margin: 15px;
        margin-bottom: 5px;
        font-size: 12px;
      }
      @media (max-width: 767px) {
        div.searchToolbar {
          flex-flow: column;
        }
      }
    </style>

    <app-route route="[[route]]" pattern="/:regionid/:questionid/:taskid/:dvarids/:rvarids/:op"
      data="{{routeData}}"></app-route>

    <app-route route="[[route]]" pattern="/:op" data="{{plainData}}"></app-route>

    <app-route route="[[route]]" pattern="/:op/all" data="{{tmpData}}"></app-route>

    <!-- Get question, task -->
    <template is="dom-if" if="[[selectMode]]">
      <template is="dom-if" if="[[userid]]">
        <template is="dom-if" if="[[routeData.questionid]]">
          <iron-ajax auto url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[routeData.questionid]]"
            handle-as="json" last-response="{{question}}"></iron-ajax>
          <iron-ajax auto
            url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[routeData.questionid]]/tasks/[[routeData.taskid]]"
            handle-as="json" last-response="{{task}}"></iron-ajax>
        </template>
      </template>
    </template>

    <div class="toolbar">
      <paper-button>MODELS</paper-button>
    </div>

    <div class="outer noscroll">
      <loading-screen loading="[[loading]]"></loading-screen>
      <div class="searchToolbar">
        <paper-input label="Model Name" value="{{queryConfig.modelName}}"></paper-input>
        <paper-input label="Model Category" value="{{queryConfig.modelCategory}}"></paper-input>
        <paper-input label="Driving Variables" value="{{queryConfig.drivingVariables}}"></paper-input>
        <paper-input label="Response Variables" value="{{queryConfig.responseVariables}}"></paper-input>
        <paper-input label="Data Type" value="{{queryConfig.dataType}}"></paper-input>
        <paper-button class="important" on-tap="_setFilteredModelList">Search</paper-button>
      </div>
      <div class="outer shifted">
        <div class="model_list">
          <div class="explorer_link">
            <a href="https://model.mint.isi.edu" target="_blank">MODEL CATALOG EXPLORER</a>
          </div>
          <ul>
            <template is="dom-repeat" items="[[modelList]]" as="model">
              <li>
                <div class="datarow">
                  <template is="dom-if" if="[[selectMode]]">
                    <paper-checkbox on-change="_selectModel" checked="[[model.selected]]"
                      value="[[model]]"></paper-checkbox>
                  </template>
                  <a title="Show Details" class="mint-button"
                    on-tap="_toggleDetails">[[_getLocalName(model.id)]] ([[model.label]])</a>
                </div>
                <iron-collapse closed>
                  <div class='description'>[[model.type.description]]</div>
                  <div class='bold'>Link: <a href="[[model.id]]" target="_blank">[[_getLocalName(model.id)]]</a></div>
                  <div class='bold'>Category: [[model.type.category]]</div>
                  <div class='bold'>Inputs:</div>
                  <ul>
                    <template is="dom-repeat" items="[[model.inputs]]" as="io">
                      <li>
                        <a title="Show Variables" class="mint-button" on-tap="_toggleVariables">
                          [[_getLocalName(io.id)]] (type: [[_getLocalName(io.type)]])</a>
                        <iron-collapse closed>
                          <ul>
                            <template is="dom-repeat" items="[[io.variables]]" as="variable" index-as="varindex">
                              <li>[[_getLocalName(variable.id)]] ([[variable.standard_name]])</li>
                            </template>
                          </ul>
                        </iron-collapse>
                      </li>
                    </template>
                  </ul>
                  <div class='bold'>Parameters:</div>
                  <ul>
                    <template is="dom-repeat" items="[[model.parameters]]" as="param">
                      <li>
                        [[param.label]] (type: [[param.dataType]])
                      </li>
                    </template>
                  </ul>
                  <div class='bold'>Outputs:</div>
                  <ul>
                    <template is="dom-repeat" items="[[model.outputs]]" as="io">
                      <li>
                        <a title="Show Variables" class="mint-button" on-tap="_toggleVariables">
                          [[_getLocalName(io.id)]] (type: [[_getLocalName(io.type)]])</a>
                        <iron-collapse closed>
                          <ul>
                            <template is="dom-repeat" items="[[io.variables]]" as="variable" index-as="varindex">
                              <li>[[_getLocalName(variable.id)]] ([[variable.standard_name]])</li>
                            </template>
                          </ul>
                        </iron-collapse>
                      </li>
                    </template>
                  </ul>
                </iron-collapse>
              </li>
            </template>
          </ul>
        </div>

        <template is="dom-if" if="[[selectMode]]">
          <div class="selected_models">
            <b>SELECTED MODELS</b>
            <paper-button class="important" on-tap="_submitModelSpecification">DONE</paper-button>
            <ul>
              <template is="dom-repeat" items="[[modelSpecs]]" as="model">
              <li>
                <div class="model">
                  [[model.label]]
                  <a class="action" on-click="_removeModel"><iron-icon icon="cancel" /></a>
                </div>
              </li>
              </template>
            </ul>
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

  static get properties() {
    return {
      config: Object,
      userid: String,
      vocabulary: Object,
      selectMode: Boolean,
      question: Object,
      task: {
        type: Object,
        notify: true
      },
      showAllModels: {
        type: Boolean,
        value: false
      },
      modelSpecs: Array,
      modelList: Array,
      queryConfig: {
        type: Object,
        value: {}
      },
      routeData: {
        type: Object,
        observer: '_routeDataChanged'
      },
      tmpData: {
        type: Object,
        observer: '_tmpDataChanged'
      },
      plainData: {
        type: Object,
        observer: '_plainDataChanged'
      },
      visible: Boolean
    };
  }

  static get observers() {
    return [
      '_createModelSpecDetails(question, modelList)'
    ]
  }

  _routeDataChanged(rd) {
    if(rd && rd.op == "select") {
      this.set("selectMode", true);
    } else {
      this.set("selectMode", false);
      this._makeDefaultList(this.vocabulary.models);
    }
    if(rd) {
      if(rd.dvarids) {
        this.set("queryConfig.drivingVariables", rd.dvarids);
      }
      if(rd.rvarids) {
        this.set("queryConfig.responseVariables", rd.rvarids);
      }
      if(rd.questionid)
        this._setFilteredModelList();
    }
  }

  _tmpDataChanged(rd) {
    if(rd.op == "browse") {
      this.set("showAllModels", true);
      this._makeDefaultList(this.vocabulary.models);
    }
  }

  _plainDataChanged(rd) {
    if(rd.op == "browse") {
      this.set("showAllModels", false);
      this._makeDefaultList(this.vocabulary.models);
    }
  }

  _cloneModelsArray(models) {
    var newmodels = [];
    for(var i=0; i<models.length; i++) {
      if(models[i].type || this.showAllModels)
        newmodels.push(Object.assign({}, models[i]));
    }
    return newmodels;
  }

  _makeDefaultList(models, showAllModels) {
    this.set("modelList", this._cloneModelsArray(this.vocabulary.models));
  }

  _createModelSpecDetails(question, modelList) {
    if(question && modelList) {
      if(!question.models)
        question.models = [];

      for(var i=0; i<modelList.length; i++) {
        var m = modelList[i];
        this.set("modelList."+i+".selected", false);
        var index = question.models.indexOf(m.id);
        if(index >= 0) {
          this.set("modelList."+i+".selected", true);
        }
      }
      var modelSpecs = [];
      for(var i=0; i<this.vocabulary.models.length; i++) {
        var m = this.vocabulary.models[i];
        var index = question.models.indexOf(m.id);
        if(index >= 0) {
          modelSpecs.push(m);
        }
      }
      this.set("modelSpecs", modelSpecs);
    }
  }

  _filterByName(name, list) {
    var filtered = [];
    var regex = new RegExp("^" + name.split("*").join(".*") + "$", "i");
    for(var i=0; i<list.length; i++) {
      var m = list[i];
      if(regex.test(m.label) || regex.test(m.localName)) {
        filtered.push(m);
      }
    }
    return filtered;
  }

  _filterByCategory(category, list) {
    var filtered = [];
    var regex = new RegExp("^" + category.split("*").join(".*") + "$", "i");
    for(var i=0; i<list.length; i++) {
      var m = list[i];
      if(regex.test(m.type.category)) {
        filtered.push(m);
      }
    }
    return filtered;
  }

  _filterByVariables(varidstr, isinput, list) {
    var filtered = [];
    var varids = varidstr.split(/\s*,\s*/);
    for(var i=0; i<list.length; i++) {
      var m = list[i];
      var iolist = isinput ? m.inputs : m.outputs;
      var found = false;
      for(var j=0; j<iolist.length; j++) {
        for(var k=0; k<iolist[j].variables.length; k++) {
          var v = iolist[j].variables[k];
          if(varids.indexOf(v.standard_name) >= 0) {
            filtered.push(m);
            found = true;
            break;
          }
        }
        if(found)
          break;
      }
    }
    return filtered;
  }

  _filterByDatatype(dtype, list) {
    var filtered = [];
    for(var i=0; i<list.length; i++) {
      var m = list[i];
      var found = false;
      for(var j=0; j<m.inputs.length; j++) {
        var type = this._getLocalName(m.inputs[j].type);
        if(type == dtype) {
          filtered.push(m)
          found = true;
          break;
        }
      }
      if(!found) {
        for(var j=0; j<m.outputs.length; j++) {
          var type = this._getLocalName(m.outputs[j].type);
          if(type == dtype) {
            filtered.push(m)
            break;
          }
        }
      }
    }
    return filtered;
  }

  _unionLists(list1, list2) {
    var list = list1.concat(list2);
    return list.filter(function(item, pos) {
      return list.indexOf(item) == pos;
    });
  }

  _setFilteredModelList() {
    var qc = this.queryConfig;
    var list = this._cloneModelsArray(this.vocabulary.models);
    // Filter by model name (wildcards allowed)
    if(qc.modelName) {
      list = this._filterByName(qc.modelName, list);
    }
    // Filter by category (wildcards allowed)
    if(qc.modelCategory) {
      list = this._filterByCategory(qc.modelCategory, list);
    }
    // Union driving and response variable queries
    var list1 = list.slice();
    if(qc.drivingVariables) {
      list1 = this._filterByVariables(qc.drivingVariables, true, list1);
    }
    var list2 = list.slice();
    if(qc.responseVariables) {
      list2 = this._filterByVariables(qc.responseVariables, false, list2);
    }
    if(qc.drivingVariables && qc.responseVariables)
      list = this._unionLists(list1, list2);
    else if(qc.drivingVariables)
      list = list1;
    else if(qc.responseVariables)
      list = list2;

    // Filter by data type
    if(qc.dataType) {
      list = this._filterByDatatype(qc.dataType, list);
    }
    this.set("modelList", list);
  }

  _toggleDetails(e) {
    e.target.parentNode.parentNode.querySelector("iron-collapse").toggle();
  }

  _toggleVariables(e) {
    e.target.parentNode.querySelector("iron-collapse").toggle();
  }


  _checkModelInSpec(modelid) {
    // Check that the model doesn't already exist in the spec
    if(this.modelSpecs) {
      for(var i=0; i<this.modelSpecs.length; i++) {
        var model = this.modelSpecs[i];
        if(model.id == modelid) {
          return i;
        }
      }
    }
    return -1;
  }

  _selectModel(e) {
    if(!this.question)
      return;

    var checkbox = e.target;
    var model = checkbox.value;
    var index = this._checkModelInSpec(model.id);

    if(checkbox.checked) {
      // Add the item
      if(index < 0) {
        this.push("modelSpecs", model);
        this._markModelInList(model.id);
      }
    }
    else {
      // Delete the item
      this.splice("modelSpecs", index, 1);
      this._unmarkModelInList(model.id);
    }
  }

  _removeModel(evnt) {
    var model = evnt.model.get('model');
    var index = this._checkModelInSpec(model.id);
    if(index >=0) {
      this.splice("modelSpecs", index, 1);
      this._unmarkModelInList(model.id);
    }
  }

  _unmarkModelInList(modelid) {
    for(var i=0; i<this.modelList.length; i++) {
      var m = this.modelList[i];
      if(m.id == modelid) {
        this.set("modelList."+i+".selected", false);
        break;
      }
    }
  }

  _markModelInList(modelid) {
    for(var i=0; i<this.modelList.length; i++) {
      var m = this.modelList[i];
      if(m.id == modelid) {
        this.set("modelList."+i+".selected", true);
        break;
      }
    }
  }

  _setTaskOutput(question) {
    var me = this;
    /* Update Task */
    var modelids = question.models;
    var acttype = "ChooseModels";
    var done = true;
    var started = false;

    modelids = modelids.length ? modelids : null; // Setting to null on empty list

    for(var actid in me.task.activities) {
      var activity = me.task.activities[actid];
      if(actid.indexOf(acttype) > 0) {
        activity.output = modelids;
      }
      if(activity.output) {
        started = true;
      }
      if(!activity.output && activity.required) {
        done = false;
      }
    }

    me.task.status = done ? "DONE" : (started ? "ONGOING" : "NOT_STARTED");

    /* Save new Task in Server */
    putJSONResource({
      url: me.task.id,
      onLoad: function(e) {
        //window.history.back();
        var new_path = 'govern/analysis/' + me.routeData.regionid + "/" +
          me.routeData.questionid + "/" + me.routeData.taskid;
        window.history.pushState({question: question, task: me.task}, null, new_path);
        window.dispatchEvent(new CustomEvent('location-changed'));
        //location.reload();
      },
      onError: function() {
        console.log("Cannot update task");
      }
    }, me.task)
  }

  _getLocalName(id) {
    if(id.match(/#/))
      return id.replace(/^.*#/, '');
    return id.substring(id.lastIndexOf("/") + 1);
  }

  _submitModelSpecification() {
    this.question.models = [];
    for(var i=0; i<this.modelSpecs.length; i++)
      this.question.models.push(this.modelSpecs[i].id);

    var me = this;
    putJSONResource({
      url: me.question.id,
      onLoad: function(e) {
        me._setTaskOutput(me.question);
      },
      onError: function() {
        console.log("Cannot add models");
      }
    }, me.question)
  }
}

customElements.define(MintModels.is, MintModels);

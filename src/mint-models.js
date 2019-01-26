import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-button/paper-button.js';

import './mint-common-styles.js';

class MintModels extends PolymerElement {
  static get is() { return 'mint-models'; }

  static get template() {
    return html`
    <style include="mint-common-styles">
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
      div.outer {
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
      iron-icon {
        width: 20px;
        height: 20px;
      }
    </style>

    <app-route route="[[route]]" pattern="/:regionid/:questionid/:taskid"
      data="{{routeData}}"></app-route>

    <!-- Get question, task, data specification, graph -->
    <template is="dom-if" if="[[userid]]">
      <template is="dom-if" if="[[routeData.questionid]]">
        <iron-ajax auto url="[[config.server]]/users/[[userid]]/questions/[[routeData.questionid]]"
          handle-as="json" last-response="{{question}}"></iron-ajax>
        <iron-ajax auto
          url="[[config.server]]/users/[[userid]]/questions/[[routeData.questionid]]/tasks/[[routeData.taskid]]"
          handle-as="json" last-response="{{task}}"></iron-ajax>
      </template>
    </template>

    <div class="toolbar">
      <paper-button>MODELS</paper-button>
    </div>

    <div class="outer">
      <div class="model_list">
        <ul>
          <template is="dom-repeat" items="[[modelList]]" as="model">
            <li>
              <div class="datarow">
                <paper-checkbox on-change="_selectModel" checked="[[model.selected]]"
                  value="[[model]]"></paper-checkbox>
                <a title="Show Details" class="mint-button" on-tap="_toggleDetails">
                  [[_getLocalName(model.id)]] ([[model.label]])</a>
              </div>
              <iron-collapse closed>
                <b>Inputs:</b>
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
                Outputs:
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
      question: Object,
      modelSpecs: Array,
      modelList: {
        type: Array,
        computed: '_cloneArray(vocabulary.models)'
      },
      visible: Boolean
    };
  }

  static get observers() {
    return [
      '_createModelSpecDetails(question, modelList)'
    ]
  }

  _createModelSpecDetails(question, modelList) {
    if(question && modelList) {
      if(!question.models)
        question.models = [];

      var modelSpecs = [];
      for(var i=0; i<modelList.length; i++) {
        var m = modelList[i];
        this.set("modelList."+i+".selected", false);
        var index = question.models.indexOf(m.id);
        if(index >= 0) {
          this.set("modelList."+i+".selected", true);
          modelSpecs.push(m);
        }
      }
      this.set("modelSpecs", modelSpecs);
    }
  }

  _cloneArray(arr) {
    var newarr = [];
    for(var i=0; i<arr.length; i++) {
      newarr.push(Object.assign({}, arr[i]));
    }
    return newarr;
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

  _setTaskOutput(modelids) {
    var me = this;
    /* Update Task */
    var acttype = "ChooseModels";
    var done = true;
    for(var actid in me.task.activities) {
      var activity = me.task.activities[actid];
      if(actid.indexOf(acttype) > 0) {
        activity.output = modelids;
      }
      if(!activity.output && activity.required) {
        done = false;
      }
      else {
        me.task.status = "ONGOING";
      }
    }
    if(done) {
      me.task.status = "DONE";
    }

    /* Save new Task in Server */
    me._putResource({
      url: me.task.id,
      onLoad: function(e) {
        var new_path = 'govern/analysis/' + this._getLocalName(me.routeData.regionid) + "/" +
          me.routeData.questionid + "/" + me.routeData.taskid;
        window.history.pushState({}, null, new_path);
        location.reload();
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
    me._putResource({
      url: me.question.id,
      onLoad: function(e) {
        me._setTaskOutput(me.question.models);
      },
      onError: function() {
        console.log("Cannot add models");
      }
    }, me.question)
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

customElements.define(MintModels.is, MintModels);

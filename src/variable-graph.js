/*link rel="import" href="../bower_components/paper-dropdown-menu/paper-dropdown-menu.html">
<link rel="import" href="../bower_components/paper-listbox/paper-listbox.html"*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { html  } from '@polymer/polymer/lib/utils/html-tag.js';

import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/utils/render-status.js';

import './loading-screen.js';
import './mint-icons.js';
import './mint-common-styles.js';

import { VGraph } from "../js/gui/vgraph/variable-graph.js";
import { getLocalName, getNamespace } from "../js/gui/template/common.js";

/**
 * @customElement
 * @polymer
 */
class VariableVGraph extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">
      :host {
        display: block;
      }
      paper-toggle-button {
        --paper-toggle-button-checked-button-color:  white;
        --paper-toggle-button-unchecked-button-color:  var(--app-accent-color);
        --paper-toggle-button-label-color:  white;
      }
      .toolbar paper-button {
        min-width:32px;
      }
      .toolbar paper-button, .toolbar paper-icon-button {
        max-height: 36px;
      }
      #canvas {
        width:100%;
        height:100%;
      }
      paper-input, paper-dropdown-menu {
        margin:0px;
        width: calc(100% - 50px);
        --paper-input-container: {
          padding: 2px 0px;
        }
      }
      .heading {
        margin:0px;
        padding-top:4px;
        margin-bottom:8px;
        font-size:1.2em;
        background-color: var(--app-accent-color);
        color:white;
      }
      paper-item {
        min-height: 32px;
      }
      paper-button.delete {
        float:left;
        color: var(--paper-red-500);
      }
      paper-button.delete:hover {
        background-color: var(--paper-red-400);
        color:white;
      }
      div.grow {
        flex-grow:2;
      }
      loading-screen#loader {
        --loading-screen-color: var(--app-accent-color);
      }
      loading-screen.limitedloading {
        --loading-screen-position: relative;
      }
      div.buttons {
        padding: 8px 20px;
      }
      div.buttons paper-button {
        margin: 4px;
      }
      div.row {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-flow: row;
      }
      fieldset {
        border:1px solid #CCC;
        border-radius: 5px;;
        margin: 10px;
        padding: 0px;
        padding-bottom: 20px;
      }
      legend {
        font-weight: bold;
        margin-left: 15px;
      }
      a.action {
        cursor:pointer;
        margin-bottom: -16px;
      }
      a.action iron-icon {
        width: 18px;
        height: 18px;
      }
      @media (max-width: 767px) {
        .outer {
          height: 450px;
        }
      }
    </style>

    <template is="dom-if" if="[[_isAnalysis(operation)]]">
      <iron-ajax auto="" url="[[_createPlannerURL(questionid, dsid, userid, visible)]]" handle-as="json" last-response="{{workflows}}"></iron-ajax>
    </template>

    <!-- Top Toolbar -->
    <div class="toolbar">
      <template is="dom-if" if="[[!noToolbar]]">
        <template is="dom-if" if="[[editable]]">
          <template is="dom-if" if="[[_isEdit(operation)]]">
            <paper-button on-click="save">Save</paper-button>
          </template>
          <template is="dom-if" if="[[_isAnalysis(operation)]]">
            <paper-button on-click="analyze">ANALYZE</paper-button>
          </template>
          <paper-button>&nbsp;</paper-button>
        </template>
        <!--
        <paper-button on-click="save">Save</paper-button>
        <paper-button on-click="layout">Layout</paper-button>
        <template is="dom-if" if="[[editable]]">
          <paper-button on-click="analyze">ANALYZE</paper-button>
        </template>
        -->
        <template is="dom-if" if="[[!editable]]">
          <paper-button>VARIABLES</paper-button>
        </template>
      </template>
      <template is="dom-if" if="[[noToolbar]]">
        <paper-button>VARIABLES</paper-button>
      </template>
    </div>

    <!-- Variable Graph Canvas -->
    <div class="outer">
      <div id="canvas"></div>
      <loading-screen id="loader"></loading-screen>
    </div>

    <!-- Bottom Toolbar -->
    <div class="toolbar bottom">
      <paper-button on-click="zoomIn">+</paper-button>
      <paper-button on-click="zoomOut">-</paper-button>
      <paper-toggle-button on-checked-changed="toggleView">STANDARD NAMES</paper-toggle-button>
    </div>

    <!-- Edit/Add Variable Dialog -->
    <paper-dialog modal="" id="variable_editor" on-iron-overlay-closed="_editVariable">
      <div class="heading">Edit Graph Node</div>
      <paper-input label="Name" value="{{edItem.label}}"></paper-input>

      <fieldset>
        <legend>
          Standard Names
          <a class="action" title="Add new" on-click="_addStandardName"><iron-icon icon="add" /></a>
          <a class="action" title="Fetch Matching Standard Names from GSN"
            on-click="_fetchStandardNames">ALIGN<iron-icon icon="file-download" /></a>
        </legend>
        <div id="standard_names_template_row" style="display:none">
          <paper-input label="Standard Name" value="[[index]]"></paper-input>
          <a class="action" on-click="_removeRow"><iron-icon icon="cancel" /></a>
        </div>
        <div id="editor_standard_names">
          <loading-screen class="limitedloading" loading="[[loadingStandardNames]]"></loading-screen>
          <template is="dom-repeat" items="[[edItem.standard_names]]">
            <div class="row">
              <paper-input label="Standard Name" value="[[item]]"></paper-input>
              <a class="action" on-click="_removeRow"><iron-icon icon="cancel" /></a>
            </div>
          </template>
        </div>
      </fieldset>

      <div class="buttons">
        <paper-button on-click="_deleteVariable" class="delete">Delete</paper-button>
        <div class="grow">&nbsp;</div>
        <paper-button dialog-dismiss="">Cancel</paper-button>
        <paper-button class="important" dialog-confirm="" autofocus="">DONE</paper-button>
      </div>
    </paper-dialog>

    <!-- Temporary dialog to display graph json (no Saving for now) -->
    <paper-dialog id="save_display">
      <paper-dialog-scrollable>
        <paper-textarea label="Graph JSON" readonly="" value="[[graphJson]]"></paper-textarea>
      </paper-dialog-scrollable>
    </paper-dialog>
`;
  }

  static get is() {
    return 'variable-graph';
  }

  static get properties() {
    return {
      config: Object,
      userid: String,
      region: Object,
      question: Object,
      questionid: String,
      taskid: String,
      graphid: String,
      task: Object,
      operation: String,
      dsid: String,
      data: {
        type: Object
      },
      workflows: {
        type: Array,
        notify: true
      },
      editable: {
        type: Boolean,
        value: false
      },
      visible: {
        type: Boolean,
        value: false
      },
      autoLayout: Boolean,
      autoLoad: Boolean,
      noToolbar: {
        type: Boolean,
        value: false
      },
      width: {
        type: Number,
        value: 1280
      },
      height: {
        type: Number,
        value: 800
      },
      selectedItems: {
        type: Array,
        notify: true
      },
      edItem: Object,
      graphJson : String,
      modelCatalog: Object
    };
  }

  static get observers() {
    return [
      // Observer method name, followed by a list of dependencies, in parenthesis
      '_variablesEdited(data.variables.*)',
      '_linksAddedOrRemoved(data.links.splices)',
      '_cagChanged(data, visible)'
    ]
  }

  ready() {
    super.ready();
    this.variable_editor = this.$.variable_editor;
  }

  zoomIn() {
    this.graph.zoom(1.2, false);
  }

  zoomOut() {
    this.graph.zoom(1.0/1.2, false);
  }

  layout(animate) {
    this.$.loader.loading = true;
    this.graph.layout(animate, this.$.loader);
  }

  _createPlannerURL(questionid, dsid, userid, visible) {
    if(visible && userid)
      return this.config.server + "/users/" + userid + "/questions/" +
        questionid + "/planner/compose/" + dsid;
  }

  _removeRow(e) {
    e.target.parentNode.parentNode.remove();
  }

  _addStandardName() {
    var div = document.createElement("div");
    div.className = "row";
    div.innerHTML = this.$.standard_names_template_row.innerHTML;
    var btn = div.querySelector("a");
    btn.addEventListener("click", this._removeRow);
    this.$.editor_standard_names.appendChild(div);
  }

  _fetchStandardNames(e) {
    var label = this.edItem.label;
    var url = this.config.gsn.server + "/match_phrase/" + label.replace(/\s+/, '_') + "/";
    var me = this;
    me.set("loadingStandardNames", true);
    this._getResource({
      url: url,
      onLoad: function(e) {
        me.set("loadingStandardNames", false);
        var json = JSON.parse(e.target.responseText);
        var snames = [];
        for(var i=0; i<json.results.length; i++)
          snames.push(json.results[i].label);
        me.set("edItem.standard_names", snames);
      },
      onError: function() {
        me.set("loadingStandardNames", false);
        console.log("Cannot align variable");
      }
    });
  }

  _isEdit(operation) {
    return operation == "edit";
  }

  _isAnalysis(operation) {
    return operation == "analyze";
  }

  resetSize() {
    if(this.graph)
      this.graph.resizePanel();
  }

  setTaskOutput(output) {
    var me = this;
    me.task.status = "DONE";
    me.task.output = [output];
    for(var actid in me.task.activities) {
      me.task.activities[actid].output = [output];
    }
    me._putResource({
      url: me.task.id,
      onLoad: function(e) {
        var new_path = '/cags/list/' + getLocalName(me.region.id) + "/" + me.questionid + "/" + me.taskid;
        window.history.pushState({}, null, new_path)
        location.reload();
      },
      onError: function() {
        console.log("Cannot update question");
      }
    }, me.task)
  }

  save() {
    this.graph.savePositions();
    this._putResource({
      url: this.data.id,
      onLoad: function(e) {
        alert('Saved');
        //me.setTaskOutput(me.data.id);
      },
      onError: function() {
        console.log("Cannot edit graph");
      }
    }, this.data);

    /*
    var me = this;
    if(this.data.id.indexOf("/common/graphs") > 0) {
      me._postResource({
        url: me.config.server + "/users/" + me.userid + "/graphs",
        onLoad: function(e) {
          var id = e.target.responseText;
          me.question.graph = id;
          me._putResource({
            url: me.config.server + "/users/" + me.userid + "/questions/" + me.questionid,
            onLoad: function(e) {
              var graphid = e.target.responseText;
              //console.log(graphid);
              me.setTaskOutput(graphid);
              //location.reload();
            },
            onError: function() {
              console.log("Cannot update question");
            }
          }, me.question);
        },
        onError: function() {
          console.log("Cannot add graph");
        }
      }, me.data);
    } else {
      // Edit Graph call
      me._putResource({
        url: me.data.id,
        onLoad: function(e) {
          // Nothing to do
          // me.setTaskOutput(me.data.id);
        },
        onError: function() {
          console.log("Cannot edit graph");
        }
      }, me.data);
    }*/

    /*this.graphJson = JSON.stringify(this.data, null, 2);
    this.$.save_display.open();*/
  }

  toggleView(d) {
    if(this.graph)
      this.graph.switchText(d.detail.value);
  }

  analyze() {
    //this.set("workflows", this.modelCatalog.solve(this.data));
  }

  _cagChanged(data, visible) {
    if(data && visible && this.autoLoad) {
      this.loadGraph();
      if(this._isAnalysis(this.operation))
        this.analyze();
    }
  }

  loadGraph(loader) {
    if(!this.data)
      return;
    this.id = this.data.id;
    this.graph = new VGraph(this.id, this.data, this);
    this.graph.setEditable(this.editable);
    this.graph.draw(this.$.canvas);
    this._addEventListeners();
    //this.set("workflows", []);
    if(this.autoLayout)
      this.layout(false, loader);
    else
      this.graph.zoom(1);
  }

  _addEventListeners() {
    var me = this;
    this.graph.events.dispatch.on("select", function(items) {
      var graph_variables = [];
      for(var itemid in items) {
        graph_variables.push(itemid);
      }
      me.set("selectedItems", graph_variables);
    });
  }

  selectVariables(items) {
    if(items) {
      this.graph.events.deselectAllItems();
      var tns = this.graph.id + "#";
      for(var i=0; i<items.length; i++) {
        var itemid = tns + getLocalName(items[i]);
        if (itemid in this.graph.variables)
          this.graph.events.selectItem(this.graph.variables[itemid]);
      }
    }
  }

  _editVariable(e) {
    if(e.detail.confirmed) {
      if(this.edItem) {
        var editem = Object.assign({}, this.edItem);
        var inputs = this.$.editor_standard_names.querySelectorAll("paper-input");
        editem.standard_names = [];
        for(var i=0; i<inputs.length; i++) {
          if(inputs[i].value)
            editem.standard_names.push(inputs[i].value);
        }
        // Check if existing edited
        for (var i=0; i<this.data.variables.length; i++) {
          if(this.data.variables[i].id == this.edItem.id) {
            this.set("data.variables."+i, editem);
            return;
          }
        }
        // New Variable
        this.graph.editor.push("data.variables", editem);
      }
    }
    else {
      this.edItem = null;
    }
  }

  _deleteVariable() {
    for (var i=0; i<this.data.variables.length; i++) {
      if(this.data.variables[i].id == this.edItem.id) {
        this.splice("data.variables", i, 1);
        this.edItem = null;
        break;
      }
    }
    this.variable_editor.close();
  }

  _variablesEdited(data) {
    var v = data.value;
    if(v && !Array.isArray(v)) {
      if(v.indexSplices) {
        this._variablesAddedOrRemoved(v);
      }
      else if(v.id in this.graph.variables) {
        // Update
        this.graph.variables[v.id].setText(v.label);
        this.graph.variables[v.id].alternate_text = v.standard_names.join("\n");
        //this.graph.variables[v.id].config.setCategory(v.category);
        this.graph.variables[v.id].draw();
      }
    }
  }

  _variablesAddedOrRemoved(changeRecord) {
    if (changeRecord) {
      changeRecord.indexSplices.forEach(function(s) {
        s.removed.forEach(function(variable) {
          this.graph.removeVariable(variable);
        }, this);
        for (var i = 0; i < s.addedCount; i++) {
          var index = s.index + i;
          var newVariable = s.object[index];
          this.graph.addVariable(newVariable, true);
        }
      }, this);
    }
  }

  _linksAddedOrRemoved(changeRecord) {
    if (changeRecord) {
      changeRecord.indexSplices.forEach(function(s) {
        s.removed.forEach(function(link) {
          //console.log(link.label + ' was removed');
        });
        for (var i = 0; i < s.addedCount; i++) {
          var index = s.index + i;
          var newLink = s.object[index];
          this.graph.addLink(newLink);
        }
      }, this);
    }
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

  _getResource(rq) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    //xhr.withCredentials = true;
    xhr.open('GET', rq.url);
    xhr.send();
  }
}

window.customElements.define(VariableVGraph.is, VariableVGraph);

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

import { getResource, putJSONResource } from './mint-requests.js';
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

    <!--template is="dom-if" if="[[_isAnalysis(operation)]]">
      <iron-ajax auto="" url="[[_createPlannerURL(questionid, dsid, userid, visible)]]" handle-as="json" last-response="{{workflows}}"></iron-ajax>
    </template-->

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
        <div id="editor_standard_names">
          <loading-screen class="limitedloading" loading="[[loadingStandardNames]]"></loading-screen>
          <template is="dom-repeat" items="[[edItem.standard_names]]">
            <div class="row">
              <paper-input label="Standard Name" value="{{item}}"></paper-input>
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

  _removeRow(e) {
    var index = e.model.get('index');
    this.splice("edItem.standard_names", index, 1);
  }

  _addStandardName() {
    this.push("edItem.standard_names", null);
  }

  _fetchStandardNames(e) {
    var label = this.edItem.label;
    var url = this.config.gsn.server + "/match_phrase/" + label.replace(/\s+/, '_') + "/";
    var me = this;
    me.set("loadingStandardNames", true);
    getResource({
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

  save() {
    this.graph.savePositions();
    var me = this;
    putJSONResource({
      url: this.data.id,
      onLoad: function(e) {
        alert('Saved');
      },
      onError: function() {
        console.log("Cannot edit graph");
      }
    }, this.data);
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
        var newitem = Object.assign({}, this.edItem);
        newitem.standard_names = [];
        var snames = this.edItem.standard_names;
        if(snames) {
          for(var i=0; i<snames.length; i++) {
            if(snames[i])
              newitem.standard_names.push(snames[i]);
          }
        }
        // Clear existing item
        this.edItem = {};

        // Check if existing edited
        for (var i=0; i<this.data.variables.length; i++) {
          if(this.data.variables[i].id == newitem.id) {
            this.set("data.variables."+i, newitem);
            return;
          }
        }
        // New Variable
        this.graph.editor.push("data.variables", newitem);
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
}

window.customElements.define(VariableVGraph.is, VariableVGraph);

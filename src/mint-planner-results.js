import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';

import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/paper-slider/paper-slider.js';

import './mint-icons.js';
import './loading-screen.js';
import './wings-workflow.js';
import './mint-common-styles.js';

import { getNamespace, getLocalName } from "../js/gui/template/common.js";
import { getResource, postJSONResource, postFormResource, putJSONResource } from './mint-requests.js';

class MintPlannerResults extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">
      :host {
        display: block;
      }
      .toolbar paper-button {
        min-width:32px;
      }
      .horiz {
        @apply --layout-horizontal;
      }
      .horiz div {
        padding-right:5px;
      }
      #canvas {
        width:100%;
        height:100%;
      }
      paper-toggle-button {
        --paper-toggle-button-checked-button-color:  white;
        --paper-toggle-button-unchecked-button-color:  var(--app-accent-color);
        --paper-toggle-button-label-color:  white;
      }
      paper-button.important_inv {
        margin:0px;
      }
      paper-item {
        min-height: 32px;
        padding-left:6px;
        font-size: 13px;
      }
      .toolbar paper-button,
      .toolbar paper-icon-button {
        max-height: 36px;
      }
      .heading paper-icon-button {
        max-height: 20px;
        padding: 0px;
        color: white;
      }
      paper-button.delete {
        float:left;
        color: var(--paper-red-500);
      }
      paper-button.delete:hover {
        background-color: var(--paper-red-400);
        color:white;
      }
      paper-listbox {
        display: inline;
        cursor: pointer;
      }
      paper-slider {
        --paper-slider-knob-color: white;
        --paper-slider-active-color: white;
      }

      @media (max-width: 767px) {
        .toolbar {
          border-radius: 4px 4px 0px 0px;
        }
        .bottom {
          border-radius: 0px 0px 4px 4px;
        }
        .outer {
          height: 450px;
        }
      }

    </style>

    <iron-ajax auto="" url="[[_createPlannerURL(regionid, questionid, taskid, dsid, userid, visible)]]"
      handle-as="json" last-response="{{workflows}}"></iron-ajax>

    <!-- Top toolbar -->
    <div class="toolbar">
      <template is="dom-if" if="[[_workflowDefined(selectedWorkflow)]]">
        <paper-icon-button icon="arrow-back" on-click="_backToList"></paper-icon-button>
      </template>

      <div class="grow"><paper-button>&nbsp;</paper-button></div>

      <template is="dom-if" if="[[_workflowDefined(selectedWorkflow)]]">
        <paper-button on-click="zoomIn">+</paper-button>
        <paper-button on-click="zoomOut">-</paper-button>
        <paper-button class="important_inv" on-tap="_selectWorkflow">DONE</paper-button>

        <div class="grow"><paper-button>&nbsp;</paper-button></div>
        <paper-button>MODEL GRAPH</paper-button>
        <paper-toggle-button id="toggler" checked="{{showWorkflows}}"
          style$="[[_getVisibilityStyle(selectedWorkflow)]]">WORKFLOW</paper-toggle-button>
      </template>

      <template is="dom-if" if="[[!_workflowDefined(selectedWorkflow)]]">
        <paper-button noink>SELECT MODEL COMPOSITION</paper-button>
        <div class="grow"><paper-button>&nbsp;</paper-button></div>
      </template>

    </div>

    <!-- Variable Graph Canvas -->
    <div class="outer">
      <loading-screen loading="[[loading]]"></loading-screen>
      <iron-collapse id="list_section" opened="" no-animation="">
        <paper-listbox id="workflow_listbox" on-selected-changed="_changedSelection">
          <template is="dom-repeat" items="[[workflows]]" as="workflow" index-as="windex">
            <paper-item>
              <div class="horiz">
                <div>[[_plusone(windex)]].</div>
                <div>
                  <template is="dom-repeat" items="[[_getWorkflowNodes(workflow)]]" as="node">
                    <template is="dom-if" if="[[index]]">
                      &nbsp;/&nbsp;
                    </template>
                    [[_getLocalName(node.componentVariable.id)]]
                  </template>
                </div>
              </div>
            </paper-item>
          </template>
        </paper-listbox>
      </iron-collapse>
      <iron-collapse id="workflow_section" no-animation="">
        <wings-workflow id="workflow" data="[[_getWorkflowView(selectedWorkflow)]]"
          selected="{{selectedItems}}" visible="[[visible]]"></wings-workflow>
      </iron-collapse>
    </div>

    <!-- Bottom toolbar -->
    <div class="toolbar bottom">
      <template is="dom-if" if="[[_workflowDefined(selectedWorkflow)]]">
        <paper-button>DETAIL:</paper-button>
        <paper-slider value="1" min="1" max="3" on-value-changed="_changedDetailLevel"></paper-slider>
      </template>
    </div>

`;
  }

  static get is() {
    return 'mint-planner-results';
  }
  static get properties() {
    return {
      config: Object,
      userid: String,
      question: Object,
      questionid: String,
      regionid: String,
      taskid: String,
      task: Object,
      dsid: String,
      workflows: {
        type: Array,
        notify: true,
        observer: '_gotWorkflows'
      },
      loading: {
        type: Boolean,
        value: true
      },
      selectedWorkflow: {
        type: Object,
        notify: true
      },
      selectedGraph: {
        type: Object,
        notify: true
      },
      selectedItems: {
        type: Array,
        notify: true
      },
      task: Object,
      selectedScenarioIndex: String,
      scenarios: Array,
      subRegion: String,
      showWorkflows: {
        type: Boolean,
        value: false,
        observer: 'toggleView'
      }
    }
  }

  _resetWorkflows() {
    this.$.workflow_listbox.items = [];
    this.$.workflow_listbox.selected = null;
    this.$.list_section.show();
    this.$.workflow_section.hide();
    this.set("showWorkflows", false);
    this.set("workflows", null);
    this.set("selectedWorkflow", null);
    this.set("selectedGraph", null);
  }

  _getVisibilityStyle(wflow) {
    if(!wflow) {
      return "display:none";
    }
    return "";
  }

  _gotWorkflows(wflows) {
    if(wflows)
      this.set("loading", false);
  }

  _getLocalName(id) {
    return getLocalName(id);
  }

  _changedDetailLevel(e) {
    var value = e.detail.value;
    this.$.workflow.setDetailLevel(value);
  }

  _createPlannerURL(regionid, questionid, taskid, dsid, userid, visible) {
    if(visible && userid && questionid && taskid && dsid) {
      this.set("loading", true);
      return this.config.server + "/users/" + userid + "/regions/" + regionid
        + "/questions/" + questionid + "/planner/compose/" + dsid;
    }
  }

  _plusone(index) {
    return index+1;
  }

  _changedSelection(e, item) {
    if(item && item.value != null) {
      this.$.list_section.toggle();
      this.$.workflow_section.toggle();
      this.set("selectedWorkflow", this.workflows[item.value]);
      this.set("selectedGraph", this.selectedWorkflow.graph);
    }
  }

  _backToList(e) {
    this.$.list_section.toggle();
    this.$.workflow_section.toggle();
    this.$.workflow_listbox.selected = null;
    this.set("showWorkflows", false);
    this.set("selectedWorkflow", null);
    this.set("selectedGraph", null);
  }

  _getWorkflowNodes(workflow) {
    if(workflow) {
      var wnodes = [];
      var nodes = workflow.modelGraph.Nodes;
      for(var nid in nodes) {
        var n = nodes[nid];
        if(n.category && n.category != "none")
          wnodes.push(n);
      }
      wnodes.sort(function(a,b) {
        return a.id.localeCompare(b.id);
      });
      return wnodes;
    }
  }

  _setTaskOutput(output) {
    var me = this;
    me.task.status = "DONE";
    me.task.output = [output];
    for(var actid in me.task.activities) {
      if(actid.indexOf("CreateWorkflow") > 0) {
        me.task.activities[actid].output = [output];
      }
    }

    putJSONResource({
      url: me.task.id,
      onLoad: function(e) {
        me.set("loading", false);
        alert("Saved");
        var new_path = 'govern/analysis/' + me._getLocalName(me.regionid) + "/" +
          me._getLocalName(me.question.id) + "/" + me._getLocalName(me.task.id);
        window.history.pushState({task: me.task}, null, new_path);
        window.dispatchEvent(new CustomEvent('location-changed'));
      },
      onError: function() {
        console.log("Cannot update task");
      }
    }, me.task)
  }

  _selectWorkflow() {
    var me = this;
    var wflow = this.selectedWorkflow.wingsWorkflow;
    var tpl = wflow.template;
    var constraints = wflow.constraints;

    // Remove extra items and add coordinates
    for(var vid in tpl.Variables) {
      delete tpl.Variables[vid].extra;
      delete tpl.Variables[vid].category;
      delete tpl.Variables[vid].name;
    }
    for(var nid in tpl.Nodes) {
      delete tpl.Nodes[nid].category;
    }

    me.set("loading", true);
    me._elaborateTemplate(wflow, function(elaborated) {
      wflow.constraints = elaborated.constraints;
      // FIXME: me._addUnknownComponents(elaborated, function(){})
      me._saveTemplate(wflow, function() {
        me._setTaskOutput(wflow.template.id);
      });
    });
  }

  _workflowDefined(w) {
    return (w != null && w != undefined);
  }

  _showingWorkflows(w) {
    return this._workflowDefined(w) && this.showWorkflows;
  }

  _getWorkflowView(w) {
    if(!w)
      return;
    if(this.showWorkflows)
      return w.wingsWorkflow;
    else
      return w.modelGraph;
  }

  zoomIn() {
    this.$.workflow.zoomIn();
  }

  zoomOut() {
    this.$.workflow.zoomOut();
  }

  toggleView(showWorkflows) {
    if(!this.selectedWorkflow)
      return;
    if(showWorkflows)
      this.$.workflow.set("data", this.selectedWorkflow.wingsWorkflow.template);
    else
      this.$.workflow.set("data", this.selectedWorkflow.modelGraph);
  }

  _addUnknownComponents(tpl, fn) {
    var tpl_comps = {};
    // FIXME: Using the top dataobject as the role type here
    var topdata = tpl.props["ont.data.url"] + "#DataObject";
    var xsdns = "http://www.w3.org/2001/XMLSchema#";

    // Convert Template Nodes to Wings components
    for(var nid in tpl.Nodes) {
      var node = tpl.Nodes[nid];
      var cid = node.componentVariable.binding.id;
      var c = {
        id: cid,
        type: 1,
        inputs: [],
        outputs: [],
        rules: [],
        inheritedRules: [],
        requirement: {
          storageGB: 0,
          memoryGB: 0,
          needs64bit: false,
          softwareIds: []
        }
      };
      var i=1;
      var p=1;
      for(var pid in node.inputPorts) {
        var port = node.inputPorts[pid];
        var role = {
          id: cid + "_" + port.role.roleid,
          dimensionality: port.role.dimensionality,
          role: port.role.roleid
        };
        if(port.role.type == 2) {
          // Parameter
          role.prefix = "-p" + p++;
          role.isParam = true;
          //FIXME: Using xsd string as roleytpe here
          role.type = xsdns + "string";
        }
        else {
          // Data
          role.prefix = "-i" + i++;
          role.isParam = false;
          // FIXME: Using topdata as roletype here
          role.type = topdata;
        }
        c.inputs.push(role);
      }
      var o=1;
      for(var pid in node.outputPorts) {
        var port = node.outputPorts[pid];
        c.outputs.push({
          id: cid + "_" + port.role.roleid,
          dimensionality: port.role.dimensionality,
          role: port.role.roleid,
          prefix: "-o" + o++,
          isParam: false,
          // FIXME: Using topdata as roletype here
          type: topdata
        });
      }
      tpl_comps[cid] = c;
    }

    // Save components that aren't in Wings
    var me = this;
    this._getComponents(function(cmap, ctop) {
      for (var cid in cmap) {
        if(cid in tpl_comps)
          delete tpl_comps[cid];
      }
      // If all already accounted for, call callback
      var numleft = Object.keys(tpl_comps).length;
      if(numleft == 0)
        fn();

      for(cid in tpl_comps) {
        var c = tpl_comps[cid];

        // Add component and save component description (I/O etc)
        me._addComponent(c, ctop, function(comp) {
          me._saveComponentJSON(comp, function(comp2) {
            delete tpl_comps[comp2.id];
            var numleft = Object.keys(tpl_comps).length;
            // If all saved, then call callback
            if(numleft == 0)
              fn();
          });
        });
      }
    })
  }

  _getComponents(fn) {
    // Get url prefix for operations
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.config.wings.domain;
    getResource({
      url: purl + "/components/getComponentHierarchyJSON",
      onLoad: function(e) {
        var ctree = JSON.parse(e.target.responseText);
        var ctop = ctree.cls.id;
        var cmap = this._getComponentMap(ctree, {});
        fn(cmap, ctop);
      },
      onError: function() {
        console.log("Cannot fetch components");
      }
    }, true);
  }

  _getComponentMap(node, map) {
    var comp = node.cls.component;
    if(comp) {
      map[comp.id] = comp;
    }
    for(var i=0; i<node.children.length; i++) {
      map = this._getComponentMap(node.children[i], map);
    }
    return map;
  }

  _addComponent(c, ctop, fn) {
    // Get url prefix for operations
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.config.wings.domain;
    var data = {
      cid: c.id,
      parent_cid: null,
      parent_type: ctop
    };
    postFormResource({
      url: purl + "/components/type/addComponent",
      onLoad: function(e) {
        if(e.target.responseText == "OK")
          fn(c);
      },
      onError: function() {
        console.log("Cannot save");
      }
    }, data, true);
  }

  _saveComponentJSON(c, fn) {
    // Get url prefix for operations
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.config.wings.domain;
    var data = {
      cid: c.id,
      component_json: JSON.stringify(c)
    }
    postFormResource({
      url: purl + "/components/type/saveComponentJSON",
      onLoad: function(e) {
        if(e.target.responseText == "OK")
          fn(c);
      },
      onError: function() {
        console.log("Cannot save");
      }
    }, data, true);
  }

  _layoutTemplate(tpl, fn) {
    // Get url prefix for operations
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.config.wings.domain;
    postJSONResource({
      url: purl + "/workflows/layoutTemplate",
      onLoad: function(e) {
        var ntpl = JSON.parse(e.target.responseText);
        fn(ntpl);
      },
      onError: function() {
        console.log("Cannot layout template");
      }
    }, tpl, true);
  }

  _elaborateTemplate(tpl, fn) {
    // Get url prefix for operations
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.config.wings.domain;
    var data = {
      template_id: tpl.id,
      constraints_json: JSON.stringify(tpl.constraints),
      json: JSON.stringify(tpl.template)
    }
    postFormResource({
      url: purl + "/plan/elaborateTemplateJSON",
      onLoad: function(e) {
        var ntpl = JSON.parse(e.target.responseText);
        fn(ntpl);
      },
      onError: function() {
        console.log("Cannot elaborate template");
        // Try to save anyway
        fn(tpl);
      }
    }, data, true);
  }

  _saveTemplate(tpl, fn) {
    //TODO: Get a MD5 Hash for template to check if it is already saved.
    // - To avoid cluttering up template library

    // Get url prefix for operations
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.config.wings.domain;
    var data = {
      template_id: tpl.template.id,
      constraints_json: JSON.stringify(tpl.constraints),
      json: JSON.stringify(tpl.template)
    }
    postFormResource({
      url: purl + "/workflows/saveTemplateJSON",
      onLoad: function(e) {
        fn();
      },
      onError: function() {
        console.log("Cannot save");
      }
    }, data, true);
  }

}
window.customElements.define(MintPlannerResults.is, MintPlannerResults);

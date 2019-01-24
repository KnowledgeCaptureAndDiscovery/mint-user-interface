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

import './mint-icons.js';
import './wings-workflow.js';
import './mint-common-styles.js';

import { getNamespace, getLocalName } from "../js/gui/template/common.js";

class MintWorkflows extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">
      :host {
        display: block;
      }
      .toolbar {
        border-radius: 0px 4px 0px 0px;
      }
      .bottom {
        border-radius: 0px 0px 4px 0px;
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
      paper-item {
        min-height: 32px;
        padding-left:6px;
        font-size: 13px;
      }
      .toolbar paper-button,
      .toolbar paper-icon-button {
        max-height: 36px;
        color: white;
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

    <!-- Top toolbar -->
    <div class="toolbar">
      <template is="dom-if" if="[[_workflowDefined(selectedWorkflow)]]">
        <paper-icon-button icon="arrow-back" on-click="_backToList"></paper-icon-button>
      </template>

      <div class="grow">&nbsp;</div>

      <template is="dom-if" if="[[_workflowDefined(selectedWorkflow)]]">
        <template is="dom-if" if="[[!showWorkflows]]">
          <paper-button raised="" on-tap="_chooseModelGraph">Choose Model Graph</paper-button>
          <!--paper-button>Model Graph</paper-button-->
        </template>
      </template>

      <template is="dom-if" if="[[!_workflowDefined(selectedWorkflow)]]">
        <paper-button>Model choices</paper-button>
      </template>

      <!--template is="dom-if" if="[[_showingWorkflows(selectedWorkflow, showWorkflows)]]">
        <paper-button raised="" on-click="_chooseScenario">Run Workflow</paper-button>
      </template-->

      <div class="grow">&nbsp;</div>

      <paper-icon-button icon="close" on-click="_resetWorkflows"></paper-icon-button>
    </div>

    <!-- Variable Graph Canvas -->
    <div class="outer">
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
        <wings-workflow id="workflow" data="[[_getWorkflowView(selectedWorkflow)]]" selected="{{selectedItems}}"></wings-workflow>
      </iron-collapse>
    </div>

    <!-- Bottom toolbar -->
    <div class="toolbar bottom">
      <paper-button>&nbsp;</paper-button>
      <template is="dom-if" if="[[_workflowDefined(selectedWorkflow)]]">
        <paper-button on-click="zoomIn">+</paper-button>
        <paper-button on-click="zoomOut">-</paper-button>
      </template>
      <paper-toggle-button id="toggler" checked="{{showWorkflows}}" on-checked-changed="toggleView">WORKFLOW</paper-toggle-button>
    </div>

    <!-- Workflow Run Status dialog -->
    <paper-dialog id="runwindow">
      <div class="heading">
        <div>Workflow Run</div>
        <div class="grow">&nbsp;</div>
        <paper-icon-button icon="close" on-click="_closeRunWindow"></paper-icon-button>
      </div>
      <div id="runstatus"></div>
    </paper-dialog>

    <!-- Scenario Choose Dialog -->
    <paper-dialog id="scenario_chooser">
      <div class="heading">
        <div>Choose a Scenario</div>
        <div class="grow">&nbsp;</div>
        <paper-icon-button icon="close" on-click="_closeScenarioChooser"></paper-icon-button>
      </div>
      <paper-radio-group selected="{{selectedScenarioIndex}}">
        Sub Region: [[subRegion]] <br>
        <template is="dom-repeat" items="[[scenarios]]" as="scenario">
          <paper-radio-button name="[[index]]">[[scenario.name]]</paper-radio-button>
        </template>
      </paper-radio-group>
      <paper-button on-tap="_runScenario">Run Scenario</paper-button>
    </paper-dialog>
`;
  }

  static get is() {
    return 'mint-workflows';
  }
  static get properties() {
    return {
      config: Object,
      userid: String,
      questionid: String,
      regionid: String,
      taskid: String,
      workflows: {
        type: Array,
        notify: true
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
      showWorkflows: Boolean
    }
  }

  _resetWorkflows() {
    this.$.workflow_listbox.items = [];
    this.$.workflow_listbox.selected = null;
    this.$.list_section.show();
    this.$.workflow_section.hide();
    this.set("workflows", []);
    this.set("selectedWorkflow", null);
    this.set("selectedGraph", null);
  }

  _getLocalName(id) {
    return getLocalName(id);
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
    this.set("selectedWorkflow", null);
    this.set("selectedGraph", null);
  }

  _getWorkflowNodes(workflow) {
    if(workflow) {
      var wnodes = [];
      var nodes = workflow.modelGraph.Nodes;
      for(var nid in nodes) {
        var n = nodes[nid];
        //if(n.category && n.category != "none")
          wnodes.push(n);
      }
      return wnodes;
    }
  }

  setTaskOutput(output) {
    var me = this;
    me.task.status = "DONE";
    me.task.output = [output];
    for(var actid in me.task.activities) {
      if(actid.indexOf("ChooseModel") > 0) {
        me.task.activities[actid].output = [output];
      }
    }
    me._putResourceSimple({
      url: me.task.id,
      onLoad: function(e) {
        var new_path = '/cags/list/' + getLocalName(me.regionid) + "/" + me.questionid + "/" + me.taskid;
        window.history.pushState({}, null, new_path)
        location.reload();
      },
      onError: function() {
        console.log("Cannot update task");
      }
    }, me.task)
  }

  _putResourceSimple(rq, data) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    //xhr.withCredentials = true;
    xhr.open('PUT', rq.url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
  }

  _postResourceSimple(rq, data) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    //xhr.withCredentials = true;
    xhr.open('POST', rq.url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
  }

  _chooseModelGraph() {
    var me = this;

    /*
    var tpl = this.selectedWorkflow.wingsWorkflow;
    var gtpl = this.$.workflow;
    // Add coordinates to Nodes and Variables
    for(var nid in tpl.Nodes) {
      var coords = gtpl.nodes[nid].getCoords();
      tpl.Nodes[nid].comment = "center:x="+coords.x+",y="+coords.y;
    }
    for(var vid in tpl.Variables) {
      var coords = gtpl.variables[vid].getCoords();
      tpl.Variables[vid].comment = "center:x="+coords.x+",y="+coords.y;
    }
    this.selectedWorkflow.wingsWorkflow = tpl;
    */

    var data = {
      modelGraph: JSON.stringify(this.selectedWorkflow.modelGraph),
      wingsWorkflow: JSON.stringify(this.selectedWorkflow.wingsWorkflow)
    }
    me._postResourceSimple({
      url: me.config.server + "/users/" + me.userid + "/questions/" + me.questionid + "/workflows",
      onLoad: function(e) {
        var outputid = e.target.responseText;
        me.setTaskOutput(outputid);
      },
      onError: function() {
        console.log("Cannot add data");
      }
    }, data);
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
    if(this.$.toggler.checked)
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

  _chooseScenario() {
    if(!this.userid) {
      alert("You need to be logged in to run workflows");
    }
    else
      this.$.scenario_chooser.open();
  }

  _closeScenarioChooser() {
    this.$.scenario_chooser.close();
  }

  _runScenario() {
    var scenario = this.scenarios[this.selectedScenarioIndex];
    this._runWorkflow(scenario.data);
    this.$.scenario_chooser.close();
  }

  _runWorkflow(inputs) {
    var tpl = this.selectedWorkflow.wingsWorkflow;
    var gtpl = this.$.workflow;

    // Add coordinates to Nodes and Variables
    for(var nid in tpl.Nodes) {
      var coords = gtpl.nodes[nid].getCoords();
      tpl.Nodes[nid].comment = "center:x="+coords.x+",y="+coords.y;
    }
    for(var vid in tpl.Variables) {
      var coords = gtpl.variables[vid].getCoords();
      tpl.Variables[vid].comment = "center:x="+coords.x+",y="+coords.y;
    }

    var wflowns = getNamespace(tpl.id);
    var dclibns = tpl.props["lib.domain.data.url"] + "#";
    var bindings = {};
    for(var invar in inputs) {
      var invarid = wflowns + invar;
      bindings[invarid] = [ dclibns + inputs[invar] ];
    }
    this.$.runwindow.open();

    var me = this;
    // Save all components from workflow that aren't present
    me._addUnknownComponents(tpl, function() {
      // Save Template
      me._saveTemplate(tpl, function() {
        // Get Expansions for template
        me._getExpansions(tpl, bindings, function(expansions) {
          if(expansions && expansions["success"]) {
            var seed = expansions.data.seed;
            var xtpl = expansions.data.templates[0];
            me._executeWorkflow(xtpl, seed, function(viewuri) {
              dom(me.$.runstatus).innerHTML = "Workflow sent for execution. <br />" +
                "<a target='_blank' href='" + viewuri + "'>View Run</a>"
            });
          }
          else {
            dom(me.$.runstatus).innerHTML = "Workflow couldn't be run";
          }
        });
      });
    });
  }

  _closeRunWindow() {
    this.$.runwindow.close();
  }

  toggleView(d) {
    if(!this.selectedWorkflow)
      return;
    if(this.$.toggler.checked)
      this.$.workflow.set("data", this.selectedWorkflow.wingsWorkflow);
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
    var purl = this.server + "/users/" + this.userid + "/" + this.domain;
    this._getResource({
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
    })
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
    var purl = this.server + "/users/" + this.userid + "/" + this.domain;
    var data = "cid=" + encodeURIComponent(c.id);
    data += "&parent_cid=";
    data += "&parent_type=" + encodeURIComponent(ctop);
    dom(this.$.runstatus).innerHTML = "Adding component "+c.id;

    // fn();
    this._postResourceRaw({
      url: purl + "/components/type/addComponent",
      onLoad: function(e) {
        if(e.target.responseText == "OK")
          fn(c);
      },
      onError: function() {
        console.log("Cannot save");
      }
    }, data);
  }

  _saveComponentJSON(c, fn) {
    // Get url prefix for operations
    var purl = this.server + "/users/" + this.userid + "/" + this.domain;
    var data = "cid=" + encodeURIComponent(c.id);
    data += "&component_json=" + encodeURIComponent(JSON.stringify(c));
    // fn();
    this._postResourceRaw({
      url: purl + "/components/type/saveComponentJSON",
      onLoad: function(e) {
        if(e.target.responseText == "OK")
          fn(c);
      },
      onError: function() {
        console.log("Cannot save");
      }
    }, data);
  }

  _saveTemplate(tpl, fn) {
    //TODO: Get a MD5 Hash for template to check if it is already saved.
    // - To avoid cluttering up template library

    // Get url prefix for operations
    var purl = this.server + "/users/" + this.userid + "/" + this.domain;
    var data = "template_id=" + encodeURIComponent(tpl.id);
    data += "&constraints_json=[]";
    data += "&json=" + encodeURIComponent(JSON.stringify(tpl));
    dom(this.$.runstatus).innerHTML = "Saving workflow";
    // fn();
    this._postResourceRaw({
      url: purl + "/workflows/saveTemplateJSON",
      onLoad: function(e) {
        fn();
      },
      onError: function() {
        console.log("Cannot save");
      }
    }, data);
  }

  _getExpansions(tpl, bindings, fn) {
    // Get url prefix for operations
    var purl = this.server + "/users/" + this.userid + "/" + this.domain;
    var data = {
      templateId: tpl.id,
      parameterBindings: {},
      parameterTypes: {},
      componentBindings: {},
      dataBindings: bindings
    };

    dom(this.$.runstatus).innerHTML = "Preparing workflow for execution";
    this._postResourceJSON({
      url: purl + "/plan/getExpansions",
      onLoad: function(e) {
        var expansions = JSON.parse(e.target.responseText);
        fn(expansions);
      },
      onError: function() {
        console.log("Cannot save");
      }
    }, data);
  }

  _executeWorkflow(xtpl, seed, fn) {
    // Get url prefix for operations
    var purl = this.server + "/users/" + this.userid + "/" + this.domain;
    var data = {
      template_id: seed.template.id,
      json: JSON.stringify(xtpl.template),
      constraints_json: JSON.stringify(xtpl.constraints),
      seed_json: JSON.stringify(seed.template),
      seed_constraints_json: JSON.stringify(seed.constraints)
    };

    dom(this.$.runstatus).innerHTML = "Sending workflow for execution";
    this._postResource({
      url: purl + "/executions/runWorkflow",
      onLoad: function(e) {
        var runuri = e.target.responseText;
        var run_view_uri = purl + "/executions?run_id=" + encodeURIComponent(runuri);
        fn(run_view_uri);
      },
      onError: function() {
        console.log("Cannot execute");
      }
    }, data);
  }

  _getResource(rq) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    xhr.withCredentials = true;
    xhr.open('GET', rq.url);
    xhr.send();
  }

  _postResource(rq, data) {
    var rawstr = "";
    for(var key in data) {
      if(rawstr)
        rawstr += "&";
      rawstr += key + "=";
      if(data[key])
        rawstr += encodeURIComponent(data[key]);
    }
    this._postResourceRaw(rq, rawstr);
  }

  _postResourceRaw(rq, data) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    xhr.withCredentials = true;
    xhr.open('POST', rq.url, true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(data);
  }

  _postResourceJSON(rq, data) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    xhr.withCredentials = true;
    xhr.open('POST', rq.url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    var payload = JSON.stringify(data)
    xhr.send(payload);
  }
}
window.customElements.define(MintWorkflows.is, MintWorkflows);

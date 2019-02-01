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
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@pushkar8723/paper-dropdown/paper-dropdown.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/iron-ajax/iron-ajax.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';

import './wings-workflow.js';
import './mint-common-styles.js';
import { getResource, postJSONResource, postFormResource, putJSONResource } from './mint-requests.js';

class MintWorkflowRun extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">
      .outer {
        padding: 10px;
      }
      .grid {
        @apply(--layout-horizontal);
        @apply(--layout-wrap);
        @apply(--layout-center);
        display: flex;
        flex-flow: row wrap;
      }
      .grid paper-input,
      .grid paper-dropdown {
        width: calc(50% - 20px);
        margin-right: 10px;
      }
      paper-input {
        font-size: inherit;
        --paper-input-container-label: {
          font-size: inherit;
        }
        --paper-input-container-input: {
          font-size: inherit;
        };
      }
      paper-dropdown {
        --paper-dropdown-menu: {
          width: 100%;
        }
        --paper-input-container-input: {
          font-size: inherit;
        };
        --paper-input-container-label: {
          font-size: inherit;
        };
        --paper-item: {
          font-size: inherit;
        }
      }
      paper-button {
        margin: 0px;
      }
    </style>

    <app-route route="[[route]]" pattern="/:regionid/:wdomainid/:template_id"
      data="{{routeData}}" tail="{{subroute}}"></app-route>
    <app-route route="[[subroute]]" pattern="/:questionid/:taskid/:dsid"
      data="{{subrouteData}}"></app-route>

    <template is="dom-if" if="[[template_id]]">
      <mint-ajax auto result="{{workflowJSON}}"
        url="[[_getWorkflowURL(config, userid, routeData.wdomainid, template_id)]]"></mint-ajax>
    </template>

    <template is="dom-if" if="[[userid]]">
      <template is="dom-if" if="[[subrouteData.questionid]]">
        <iron-ajax auto url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[subrouteData.questionid]]"
          handle-as="json" last-response="{{question}}"></iron-ajax>
        <iron-ajax auto
          url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[subrouteData.questionid]]/tasks/[[subrouteData.taskid]]"
          handle-as="json" last-response="{{task}}"></iron-ajax>
      </template>
    </template>

    <!-- Top toolbar -->
    <div class="toolbar">
      <paper-button>Run Workflow</paper-button>
    </div>
    <div id="form" class="outer">
      <h3>[[_localName(template.id)]]</h3>
      <div id="documentation"></div>
      <template is="dom-if" if="[[template_id]]">
        <div class="grid">
          <template is="dom-repeat" items="[[inputs]]" as="input">
            <template is="dom-if" if="[[_isInputParam(input)]]">
              <paper-input id="[[input.id]]" label="[[input.name]]"
                type="[[_getInputType(input)]]" value="[[input.binding]]"></paper-input>
            </template>
            <template is="dom-if" if="[[_isInputData(input)]]">
              <template is="dom-if" if="[[_isMultiInput(input)]]">
                <paper-dropdown id="[[input.id]]"
                    no-animations multi="true" label="[[input.name]]">
                  <template is="dom-repeat" items="[[input.options]]" as="fileid">
                    <paper-item value$="[[fileid]]">[[_localName(fileid)]]</paper-item>
                  </template>
                </paper-dropdown>
              </template>
              <template is="dom-if" if="[[!_isMultiInput(input)]]">
                <paper-dropdown id="[[input.id]]" no-animations label="[[input.name]]">
                  <template is="dom-repeat" items="[[input.options]]" as="fileid">
                    <paper-item value$="[[fileid]]">[[_localName(fileid)]]</paper-item>
                  </template>
                </paper-dropdown>
              </template>
            </template>
          </template>
        </div>
        <paper-button class="important" on-tap="_runWorkflow">Run Workflow</paper-button>
        <wings-workflow id="workflow" data="[[template]]"></wings-workflow>
      </template>
    </div>
    <!-- Bottom toolbar -->
    <div class="toolbar bottom">
      <paper-button>&nbsp;</paper-button>
    </div>
`;
  }

  static get is() { return 'mint-workflow-run'; }

  static get properties() {
    return {
      config: Object,
      userid: String,
      template_id: {
        type: String,
        computed: '_getTemplateId(config, userid, routeData.wdomainid, routeData.template_id)'
      },
      workflowList: Array,
      workflowJSON: {
        type: Object,
        observer: '_workflowJsonReceived'
      },
      template: Object,
      inputs: Array,
      dataBindings: {
        type: Object,
        value: {}
      },
      parameterBindings: {
        type: Object,
        value: {}
      },
      parameterTypes: {
        type: Object,
        value: {}
      },
      question: Object,
      task: Object,
      route: Object,
      routeData: Object,
      subroute: Object,
      subrouteData: Object,

      visible: Boolean
    };
  }

  _getTemplateId(config, userid, dom, tname) {
    if(config && userid && dom && tname) {
      return config.wings.internal_server + "/export/users/" + userid + "/" +
        dom + "/workflows/" + tname + ".owl#" + tname;
    }
  }

  _getWorkflowURL(config, userid, domainid, template_id) {
    if(config && userid && domainid && template_id)
      return config.wings.server + "/users/" + userid + "/" +
        domainid + "/workflows/getViewerJSON?template_id=" + escape(template_id);
  }

  _workflowJsonReceived(json) {
    if(json) {
      this.template = json.template;
      this.inputs = json.inputs;
      this._resetBindings();
      this._sortInputData(this.inputs);
      if(this.template.metadata)
        this._setDocumentation(this.template.metadata.documentation);
    }
  }

  _setDocumentation(doc) {
    afterNextRender(this, () => {
      if(doc)
        this.$.documentation.innerHTML = doc;
      else
        this.$.documentation.innerHTML = '';
    });
  }

  _getInputType(input) {
    var dtype = input.dtype;
    if(dtype.match(/#int/))
      return "number";
    return "";
  }

  _setValues() {
    var paraminputs = this.$.form.querySelectorAll('paper-input');
    var datainputs = this.$.form.querySelectorAll('paper-dropdown');
    var inputMap = {};
    for(var i=0; i<this.inputs.length; i++)
      inputMap[this.inputs[i].id] = this.inputs[i];

    for(var i=0; i<paraminputs.length; i++) {
      var forminput = paraminputs[i];
      var input = inputMap[forminput.id];
      if(input) {
        var val = forminput.value;
        // If val is empty, then raise alarm
        this.parameterBindings[input.id] = val;
        this.parameterTypes[input.id] = input.dtype;
      }
    }
    for(var i=0; i<datainputs.length; i++) {
      var forminput = datainputs[i];
      var input = inputMap[forminput.id];
      if(input) {
        var val = forminput.value;
        if(!Array.isArray(val))
          val = [ val ];
        this.dataBindings[input.id] = val;
      }
    }
  }

  _resetBindings() {
    this.parameterBindings = {};
    this.parameterTypes = {};
    this.dataBindings = {};
    // Reset form values too
    var paraminputs = this.$.form.querySelectorAll('paper-input');
    var datainputs = this.$.form.querySelectorAll('paper-dropdown');
    for(var i=0; i<paraminputs.length; i++) {
      var input = paraminputs[i];
      input.value = null;
    }
    for(var i=0; i<datainputs.length; i++) {
      var input = datainputs[i];
      input.value = null;
    }
  }

  _sortInputData(inputs) {
    for(var i=0; i<inputs.length; i++) {
      if(inputs[i].options)
        inputs[i].options.sort();
    }
  }

  _isInputData(input) {
    return (input.type == "data");
  }

  _isInputParam(input) {
    return (input.type == "param");
  }

  _isMultiInput(input) {
    return (input.dim == 1);
  }

  _escape(url) {
    return escape(url);
  }

  _localName(id) {
    return id.replace(/^.+#/, '');
  }

  _setTaskOutput(output) {
    var me = this;
    me.task.status = "DONE";
    me.task.output = [output];
    for(var actid in me.task.activities) {
      if(actid.indexOf("RunWorkflow") > 0) {
        me.task.activities[actid].output = [output];
      }
    }
    putJSONResource({
      url: me.task.id,
      onLoad: function(e) {
        var new_path = 'govern/analysis/' + me.routeData.regionid + "/" +
          me.subrouteData.questionid + "/" + me.subrouteData.taskid;
        window.history.pushState({task: me.task}, null, new_path);
        window.dispatchEvent(new CustomEvent('location-changed'));
      },
      onError: function() {
        console.log("Cannot update task");
      }
    }, me.task)
  }

  _runWorkflow() {
    this._setValues();

    var me = this;
    me._getExpansions(function(expansions) {
      if(expansions && expansions["success"]) {
        var seed = expansions.data.seed;
        var xtpl = expansions.data.templates[0];
        me._executeWorkflow(xtpl, seed, function(runid) {
          //console.log(runid);
          me._setTaskOutput(runid);
          alert("Workflow sent for execution.");
        });
      }
      else {
        alert("Could not run workflow. Please see your browser console to debug");
        console.log(expansions);
      }
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
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.config.wings.domain;
    console.log(purl);
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
    }, true)
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
    }

    // fn();
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

  _saveTemplate(tpl, fn) {
    //TODO: Get a MD5 Hash for template to check if it is already saved.
    // - To avoid cluttering up template library

    // Get url prefix for operations
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.config.wings.domain;
    var data = {
      template_id: tpl.id,
      constraints_json: [],
      json: JSON.stringify(tpl)
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

  _getComponentBindings() {
    var cbindings = {};
    for(var nid in this.template.Nodes) {
      var c = this.template.Nodes[nid].componentVariable;
      cbindings[c.id] = c.binding.id;
    }
    return cbindings;
  }

  _getExpansions(fn) {
    // Get url prefix for operations
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.routeData.wdomainid;
    var data = {
      templateId: this.template.id,
      parameterBindings: this.parameterBindings,
      parameterTypes: this.parameterTypes,
      componentBindings: this._getComponentBindings(),
      dataBindings: this.dataBindings
    };

    postJSONResource({
      url: purl + "/plan/getExpansions",
      onLoad: function(e) {
        var expansions = JSON.parse(e.target.responseText);
        fn(expansions);
      },
      onError: function() {
        console.log("Cannot save");
      }
    }, data, true);
  }

  _executeWorkflow(xtpl, seed, fn) {
    // Get url prefix for operations
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.routeData.wdomainid;
    var data = {
      template_id: seed.template.id,
      json: JSON.stringify(xtpl.template),
      constraints_json: JSON.stringify(xtpl.constraints),
      seed_json: JSON.stringify(seed.template),
      seed_constraints_json: JSON.stringify(seed.constraints)
    };

    postFormResource({
      url: purl + "/executions/runWorkflow",
      onLoad: function(e) {
        var runuri = e.target.responseText;
        fn(runuri);
      },
      onError: function() {
        console.log("Cannot execute");
      }
    }, data, true);
  }

}
customElements.define(MintWorkflowRun.is, MintWorkflowRun);

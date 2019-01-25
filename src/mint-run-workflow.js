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

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';

import './wings-workflow.js';
import './mint-common-styles.js';

class MintRunWorkflow extends PolymerElement {
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

    <app-route route="[[route]]" pattern="/:domainid/:questionid/:taskid/:wdomainid"
      data="{{routeData}}" tail="{{subroute}}"></app-route>
    <app-route route="[[subroute]]" pattern="/:template_id" data="{{subrouteData}}"></app-route>

    <template is="dom-if" if="[[template_id]]">
      <mint-ajax auto result="{{workflowJSON}}"
        url="[[_getWorkflowURL(config, userid, routeData.wdomainid, template_id)]]"></mint-ajax>
    </template>

    <mint-ajax auto result="{{workflowList}}"
      url="[[_getWorkflowListURL(config, userid, routeData.wdomainid)]]"></mint-ajax>

    <!-- Top toolbar -->
    <div class="toolbar">
      <paper-button>Run Workflow</paper-button>
    </div>
    <div id="form" class="outer">
      <ul>
        <template is="dom-repeat" items="[[workflowList]]">
          <li><a href="[[_getWorkflowRunURL(routeData, item)]]">[[_localName(item)]]</li>
        </template>
      </ul>
      <template is="dom-if" if="[[template_id]]">
        <h3>[[_localName(template.id)]]</h3>
        <div id="documentation">[[template.metadata.documentation]]</div>
        <div class="grid">
          <template is="dom-repeat" items="[[inputs]]" as="input">
            <template is="dom-if" if="[[_isInputParam(input)]]">
              <paper-input id="[[input.id]]" label="[[input.name]]"></paper-input>
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

  static get is() { return 'mint-run-workflow'; }

  static get properties() {
    return {
      config: Object,
      userid: String,
      template_id: {
        type: String,
        computed: '_getTemplateId(config, userid, routeData.wdomainid, subrouteData.template_id)'
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
      route: Object,
      routeData: {
        type: Object,
        observer: '_routeDataChanged'
      },
      subroute: Object,
      subrouteData: {
        type: Object,
        observer: '_subrouteDataChanged'
      },
      visible: Boolean
    };
  }

  _getTemplateId(config, userid, dom, tname) {
    if(config && userid && dom && tname) {
      return config.wings.internal_server + "/export/users/" + userid + "/" +
        dom + "/workflows/" + tname + ".owl#" + tname;
    }
  }

  _subrouteDataChanged(rd) {
    if(!rd.template_id)
      this.template_id = null;
  }

  _routeDataChanged(rd) {
  }

  _getWorkflowURL(config, userid, domainid, template_id) {
    if(config && userid && domainid && template_id)
      return config.wings.server + "/users/" + userid + "/" +
        domainid + "/workflows/getViewerJSON?template_id=" + escape(template_id);
  }

  _getWorkflowRunURL(rd, template_id) {
    if(rd && template_id)
      return "run-workflow/"+rd.domainid+"/"+rd.questionid+"/"+rd.taskid+"/"+
        rd.wdomainid+"/"+this._localName(template_id);
  }

  _getWorkflowListURL(config, userid, domainid) {
    if(config && userid && domainid)
      return config.wings.server + "/users/" + userid + "/" + domainid +
        "/workflows/getTemplatesListJSON";
  }

  _workflowJsonReceived(json) {
    if(json) {
      this.template = json.template;
      this.inputs = json.inputs;
      this._resetBindings();
      this._sortInputData(this.inputs);
      //this._setDocumentation(this.template.metadata.documentation);
    }
  }

  _setDocumentation(doc) {
    if(doc)
      this.$.documentation.innerHTML = doc;
    else
      this.$.documentation.innerHTML = '';
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

  _putResourceSimple(rq, data) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    //xhr.withCredentials = true;
    xhr.open('PUT', rq.url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
  }

  _runWorkflow() {
    this._setValues();

    var me = this;
    me._getExpansions(function(expansions) {
      if(expansions && expansions["success"]) {
        var seed = expansions.data.seed;
        var xtpl = expansions.data.templates[0];
        me._executeWorkflow(xtpl, seed, function(viewuri) {
          console.log(viewuri);
          alert("Workflow sent for execution.");
        });
      }
      else {
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
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.config.wings.domain;
    var data = "cid=" + encodeURIComponent(c.id);
    data += "&parent_cid=";
    data += "&parent_type=" + encodeURIComponent(ctop);
    dom(this.$.runstatus).innerHTML += "<li>Adding component "+c.id;

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
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.config.wings.domain;
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
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.config.wings.domain;
    var data = "template_id=" + encodeURIComponent(tpl.id);
    data += "&constraints_json=[]";
    data += "&json=" + encodeURIComponent(JSON.stringify(tpl));
    dom(this.$.runstatus).innerHTML += "<li>Saving workflow";
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

  _getExpansions(fn) {
    // Get url prefix for operations
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.routeData.domain;
    var data = {
      templateId: this.template.id,
      parameterBindings: this.parameterBindings,
      parameterTypes: this.parameterTypes,
      componentBindings: {},
      dataBindings: this.dataBindings
    };

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
    var purl = this.config.wings.server + "/users/" + this.userid + "/" + this.routeData.wdomainid;
    var data = {
      template_id: seed.template.id,
      json: JSON.stringify(xtpl.template),
      constraints_json: JSON.stringify(xtpl.constraints),
      seed_json: JSON.stringify(seed.template),
      seed_constraints_json: JSON.stringify(seed.constraints)
    };

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
customElements.define(MintRunWorkflow.is, MintRunWorkflow);

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { getLocalName, getNamespace } from "../js/gui/template/common.js";

// !!!! *** UNUSED *** !!!!
class MintModelCatalog extends PolymerElement {
  static get is() {
    return 'mint-model-catalog';
  }

  static get properties() {
    return {
      config: Object,
      userid: String,
      modelCatalog: {
        type: Object,
        notify: true
      },
      dataCatalog: {
        type: Object
      },
      models: {
        type: Array,
        notify: true
      },
      data: {
        type: Array,
        notify: true,
        value: {}
      },
      workflow_fragments: {
        type: Array,
        notify: true
      }
    };
  }

  constructor() {
    super();
    /*
    this._fetchModels();
    this._fetchData();
    this._fetchWorkflowFragments();
    */
    this.set("modelCatalog", this);
  }

  _fetchModels() {
    var me = this
    //console.log('fetching categories');
    this._getResource({
      url: 'files/catalogs/models-new.json',
      onLoad(e) {
        me.set('models', JSON.parse(e.target.responseText));
        //console.log(me.models);
      },
      onError(e) {
      }
    }, 1);
  }

  _fetchData() {
    var me = this
    //console.log('fetching categories');
    this._getResource({
      url: 'files/catalogs/data-new.json',
      onLoad(e) {
        me.set('data', JSON.parse(e.target.responseText));
        //console.log(me.data);
      },
      onError(e) {
      }
    }, 1);
  }

  _fetchWorkflowFragments() {
    var me = this
    //console.log('fetching categories');
    this._getResource({
      url: 'files/workflows/list.json',
      onLoad(e) {
        me.set('workflow_fragments', JSON.parse(e.target.responseText));
        for(var i=0; i<me.workflow_fragments.length; i++) {
          var wfrag = me.workflow_fragments[i];
          me._fetchWorkflowFragment(i, wfrag.workflow);
        }
      },
      onError(e) {
      }
    }, 1);
  }

  _fetchWorkflowFragment(index, path) {
    var me = this
    //console.log('fetching categories');
    this._getResource({
      url: path,
      onLoad(e) {
        var wflow = JSON.parse(e.target.responseText);
        me.workflow_fragments[index].workflow = wflow;
      },
      onError(e) {
      }
    }, 1);
  }

  _getResource(rq, attempts) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', function(e) {
      // Flaky connections might fail fetching resources
      if (attempts > 1) {
        this.debounce('_getResource', this._getResource.bind(this, rq, attempts - 1), 200);
      } else {
        rq.onError.call(this, e);
      }
    }.bind(this));

    xhr.open('GET', rq.url);
    xhr.send();
  }

  solve(graph) {
    return this.solve_after_fetch(graph);
    /*
    var me = this;

    // Fetch any existing data from the data catalog
    var num_variables = graph.variables.length;
    var stdnames = [];
    for(var i=0; i<num_variables; i++) {
      var stdname = graph.variables[i].standard_name;
      if (!(stdname in this.data)) {
        // If this standard name's data is not fetched
        stdnames.push(stdname);
      }
    }
    this.dataCatalog.getBindingsForVariables(stdnames, function(bindings){
      for(var stdname in bindings) {
        var binding = bindings[stdname];
        // FIXME: Just using 1 data item for now
        var b = binding[0];
        me.data[stdname] = {
          id: b.md5hash.value,
          name: getLocalName(b.dataset.value)
        }
      }
      console.log(me.data);
      // Now solve
      me.solve_after_fetch(graph);
    });
    */
  }

  solve_after_fetch(graph) {
    var workflows = [];

    // Copy variables array
    var variables = graph.variables.slice(0);

    // Get databases that provide variables
    var data_providers = Object.assign({}, this.data);

    // Get models that provide variables
    var comp_providers = {};
    for (var i=0; i<this.models.length; i++) {
      var c = this.models[i];
      for (var j=0; j<c.outputs.length; j++) {
        var op = c.outputs[j];
        if(!op.variables) {
          op.variables = [];
        }
        for(var k=0; k<op.variables.length; k++) {
          if(!op.variables[k].canonical_name)
            op.variables[k].canonical_name = op.variables[k].standard_name;
          var v = op.variables[k].canonical_name;
          var prov = comp_providers[v];
          if(!prov) prov = [];
          prov.push(c);
          comp_providers[v] = prov;
        }
      }
      for (var j=0; j<c.inputs.length; j++) {
        var ip = c.inputs[j];
        if(!ip.variables) {
          ip.variables = [];
        }
        for(var k=0; k<ip.variables.length; k++) {
          if(!ip.variables[k].canonical_name)
            ip.variables[k].canonical_name = ip.variables[k].standard_name;
        }
      }
    }

    // Create solutions
    var solution_queue = [new Solution(variables)];
    while(solution_queue.length) {
      var solution = solution_queue.shift();
      // console.log("Expanding Solution---")
      var varqueue = solution.variables.slice(0);
      while(varqueue.length) {
        var v = varqueue.shift();
        // console.log("Checking variable " + v.name);
        var cname = v.canonical_name;
        var stdname = v.standard_name;
        // Skip if variable already resolved
        if(v.resolved) {
          // console.log(v.name + " already resolved. Continue.");
          continue;
        }

        // Check data provider
        if(stdname in data_providers) {
          // Mark variable as resolved
          v.resolved = true;
          v.provider = {
            type: "data",
            item: data_providers[stdname]
          }
          // console.log(v.name + " has a data provider. Variable resolved. Continue.");
          continue;
        }

        // Check model provider
        if(cname in comp_providers) {
          var comps = comp_providers[cname];
          // console.log(v.name + " has "+ comps.length+" model providers");

          // If more than one model, create extra solutions
          // from 2 onwards
          for(var i=1; i<comps.length; i++) {
            var newsolution = new Solution({});
            newsolution.copy(solution);
            newsolution.addModel(comps[i]);
            solution_queue.push(newsolution);
            // Mark variable as resolved
            var varhash = v.canonical_name;
            var newv = newsolution.varhash[varhash];
            newv.resolved = true;
            newv.provider = {
              type: "model",
              item: {
                id: comps[i].id,
                category: comps[i].category
              }
            };
          }

          // Use the first model to modify current solution
          var comp = comps[0];
          var newvars = solution.addModel(comp)
          for(var j=0; j<newvars.length; j++)
            varqueue.push(newvars[j]);
          // Mark variable as resolved
          v.resolved = true;
          v.provider = {
            type: "model",
            item: {
              id: comp.id,
              category: comp.category
            }
          };
        }
      }
      // console.log(solution);
      // Create workflow for solution
      var workflow = solution.createWorkflow(graph, this);
      if(workflow)
        workflows.push(workflow);
    }
    return workflows;
  }
}

class Solution {

  constructor(variables) {
    this.variables = [];
    this.models = [];
    this.varhash = {};
    for (var i=0; i<variables.length; i++) {
      // Copy graph variable
      var v = Object.assign({}, variables[i]);
      v.provenance = {};
      this.varhash[v.canonical_name] = v;
      this.variables.push(v);
    }
  }

  copy(solution) {
    this.variables = [];
    this.varhash = {};
    for (var i=0; i<solution.variables.length; i++) {
      // Deep copy solution variable
      var v = JSON.parse(JSON.stringify(solution.variables[i]));
      this.varhash[v.canonical_name] = v;
      this.variables.push(v);
    }
    this.models = solution.models.slice(0);
  }

  addModel(model) {
    var c = Object.assign({}, model);
    this.models.push(c);
    var newvars = [];
    for (var i=0; i<c.inputs.length; i++) {
      var ip = c.inputs[i];
      for(var k=0; k<ip.variables.length; k++) {
        var v = ip.variables[k];
        var hashid = v.canonical_name
        if(hashid in this.varhash) {
          var prov = new VariableProvenance(c.id, ip.id, v.metadata, true);
          this.varhash[hashid].provenance[c.id] = prov;
        }
        else {
          var newv = this.createNewVariable(v, c, ip, true);
          newvars.push(newv);
        }
      }
    }
    for (var i=0; i<c.outputs.length; i++) {
      var op = c.outputs[i];
      for(var k=0; k<op.variables.length; k++) {
        var v = op.variables[k];
        var hashid = v.canonical_name;
        if(hashid in this.varhash) {
          var prov = new VariableProvenance(c.id, op.id, v.metadata, false);
          v = this.varhash[hashid];
          v.provenance[c.id] = prov;
        }
        else {
          v = this.createNewVariable(v, c, op, false);
          newvars.push(v);
        }
        v.resolved = true;
        v.provider = {
          type: "model",
          item: {
            id: c.id,
            category: c.category
          }
        };
      }
    }
    // console.log(" - Adding "+c.id+" created "+newvars.length+" new variables");
    // console.log(newvars);
    for(var i=0; i<newvars.length; i++) {
      var hashid = newvars[i].canonical_name;
      this.varhash[hashid] = newvars[i];
      this.variables.push(newvars[i]);
    }
    return newvars;
  }

  createNewVariable(v, c, f, isinput) {
    // Create new variable
    var vid = 'v_' + Math.random().toString(36).substr(2, 9);
    var provenance = {};
    provenance[c.id] = new VariableProvenance(c.id, f.id, v.metadata, isinput);
    // console.log(v);
    return {
      id:vid,
      standard_name: v.standard_name,
      canonical_name: v.canonical_name,
      provenance: provenance,
      name: v.canonical_name.replace(/_+/g, " "),
      position: {x: 100, y: 100} // Should be set a bit more intelligently
    }
  }

  createWorkflow(graph, clib) {
    this.variables.reverse();
    var workflow = {
      name: graph.id,
      models: this.models,
      variables: this.variables,
      links: [],

      wings_workflow: null,
      graph: {}
    };
    var varlinks = {};
    for(var i=0; i<this.models.length; i++) {
      var c = this.models[i];
      // Handle all model inputs
      for(var j=0; j<c.inputs.length; j++) {
        var ip = c.inputs[j];
        for(var k=0; k<ip.variables.length; k++) {
          var hashid = ip.variables[k].canonical_name;
          var v = this.varhash[hashid];
          if(!v || !v.resolved || !v.provider) {
            // console.log("problem with " + c.id + " (" + hashid + ")");
            // console.log(v);
            return null;
          }
          workflow.links.push({
            from: v.provider.item.id,
            to: c.id,
            variable: v.id,
            type: v.provider.type
          });
          varlinks[v.id] = true;
        }
      }
    }
    // Check model outputs that aren't part of links. Add links
    for(var i=0; i<this.models.length; i++) {
      var c = this.models[i];
      // Handle all model outputs
      for(var j=0; j<c.outputs.length; j++) {
        var op = c.outputs[j];
        for(var k=0; k<op.variables.length; k++) {
          var hashid = op.variables[k].canonical_name;
          var v = this.varhash[hashid];
          if(v.id in varlinks) {
            continue;
          }
          workflow.links.push({
            from: c.id,
            variable: v.id,
            type: "output"
          });
          varlinks[v.id] = true;
        }
      }
    }
    // console.log(workflow);

    workflow.model_graph = this.createModelGraph(workflow);
    workflow.wings_workflow = this.createWingsWorkflow(workflow, clib);
    workflow.graph = this.createGraph(workflow);
    workflow.graph = this.diffGraph(workflow.graph, graph);

    // Do a diff between original graph and new graph
    return workflow;
  }

  diffGraph(newgraph, oldgraph) {
    var linkhash = {};
    var varhash = {};
    for(var i=0; i<oldgraph.variables.length; i++) {
      var v = oldgraph.variables[i];
      varhash[v.id] = true;
    }
    for(var i=0; i<oldgraph.links.length; i++) {
      var l = oldgraph.links[i];
      linkhash[l.from + "-" + l.to] = true;
    }
    // Annotate new graph
    for(var i=0; i<newgraph.variables.length; i++) {
      var v = newgraph.variables[i];
      if(!varhash[v.id])
        newgraph.variables[i].new = true;
    }
    for(var i=0; i<newgraph.links.length; i++) {
      var l = newgraph.links[i];
      if(!linkhash[l.from + "-" + l.to])
        newgraph.links[i].new = true;
    }
    return newgraph;
  }

  createGraph(wflow) {
    if(wflow == null)
      return null;
    var graph = {
      id: wflow.id,
      name: wflow.id,
      variables: [],
      links: []
    }
    var gvars = wflow.model_graph.template.Variables;

    var varid_hash = {};
    var cname_hash = {};
    for(var i=0; i<wflow.variables.length; i++) {
      var v = wflow.variables[i];
      if(!v.resolved)
        continue;
      var gvar = gvars[v.id];
      var vcat = gvar.category;
      var nv = {
        id: v.id, name: v.name, category: vcat,
        standard_name: v.standard_name,
        canonical_name: v.canonical_name,
        position: v.position
      }
      cname_hash[nv.canonical_name] = nv;
      varid_hash[nv.id] = nv;
      graph.variables.push(nv);
    }

    var compid_hash = {};
    for(var i=0; i<wflow.models.length; i++) {
      var c = wflow.models[i];
      compid_hash[c.id] = c;
    }

    for(var i=0; i<wflow.links.length; i++) {
      var l = wflow.links[i];
      var v = varid_hash[l.variable];
      if(l.from && l.type != "data") {
        var c = compid_hash[l.from];
        for(var j=0; j<c.inputs.length; j++) {
          var ip = c.inputs[j];
          for(var k=0; k<ip.variables.length; k++) {
            var fromvar = cname_hash[ip.variables[k].canonical_name];
            graph.links.push({from: fromvar.id, to: v.id});
            if(!fromvar.category)
              fromvar.category = c.category;
          }
        }
        if(!v.category)
          v.category = c.category;
      }
      if(l.to) {
        var c = compid_hash[l.to];
        for(var j=0; j<c.outputs.length; j++) {
          var op = c.outputs[j];
          for(var k=0; k<op.variables.length; k++) {
            var vname = op.variables[k].canonical_name;
            var tovar = cname_hash[vname];
            graph.links.push({from: v.id, to: tovar.id});
            if(!tovar.category)
              tovar.category = c.category;
          }
        }
        if(!v.category)
          v.category = c.category;
      }
    }
    return graph;
  }

  createModelGraph(wflow) {
    if(wflow == null)
      return null;
    var wingsw = {
      template: {
        version: 0,
        Nodes: {},
        Links: {},
        Variables: {}
      }
    }
    var tpl = wingsw.template;
    var varid_hash = {};
    var cname_hash = {};
    for(var i=0; i<wflow.variables.length; i++) {
      var v = wflow.variables[i];
      if(!v.resolved)
        continue;
      cname_hash[v.canonical_name] = v;
      varid_hash[v.id] = v;
      tpl.Variables[v.id] = {
        id: v.id,
        name: v.name,
        type: 1 //FIXME: use category here
      }
    }
    for(var i=0; i<wflow.models.length; i++) {
      var c = wflow.models[i];
      var nodeid = c.id;
      var node = {
        id: nodeid,
        name: c.name,
        inputPorts: {},
        outputPorts: {},
        category: c.category,
        componentVariable: {
          binding: {
            id: c.name,
            type: "uri"
          },
          id: "model_" + c.id
        }
      }
      for(var j=0; j<c.inputs.length; j++) {
        var ip = c.inputs[j];
        for(var k=0; k<ip.variables.length; k++) {
          var roleid = ip.variables[k].canonical_name; // Standard name
          var portid = "inport_" + roleid;
          node.inputPorts[portid] = {
            id: portid,
            role: {
              type: 1,
              roleid: roleid
            }
          }
        }
      }
      for(var j=0; j<c.outputs.length; j++) {
        var op = c.outputs[j];
        for(var k=0; k<op.variables.length; k++) {
          var roleid = op.variables[k].canonical_name; // Standard name
          var portid = "outport_" + roleid;
          node.outputPorts[portid] = {
            id: portid,
            role: {
              type: 1,
              roleid: roleid
            }
          }
        }
      }
      tpl.Nodes[nodeid] = node;
    }
    for(var i=0; i<wflow.links.length; i++) {
      var l = wflow.links[i];
      var v = varid_hash[l.variable];
      if(l.type == "data") {
        var lid = l.to+"_"+v.canonical_name;
        var link = {
          id: lid,
          toNode: {id: l.to},
          toPort: {id: "inport_" + v.canonical_name},
          variable: {id: v.id}
        }
        var cat = tpl.Nodes[l.to].category;
        if(cat)
          tpl.Variables[v.id].category = cat;

        tpl.Links[lid] = link;
      }
      else if(l.type == "output") {
        var lid = l.from+"_"+v.canonical_name;
        var link = {
          id: lid,
          fromNode: {id: l.from},
          fromPort: {id: "outport_" + v.canonical_name},
          variable: {id: v.id}
        }
        var cat = tpl.Nodes[l.from].category;
        if(!tpl.Variables[v.id].category && cat)
          tpl.Variables[v.id].category = cat;

        tpl.Links[lid] = link;
      }
      else if(l.type == "model") {
        var lid = l.from+"_"+l.to+"_"+v.canonical_name;
        var link = {
          id: lid,
          fromNode: {id: l.from},
          fromPort: {id: "outport_" + v.canonical_name},
          toNode: {id: l.to},
          toPort: {id: "inport_" + v.canonical_name},
          variable: {id: v.id}
        }
        var cat = tpl.Nodes[l.from].category;
        if(!tpl.Variables[v.id].category && cat)
          tpl.Variables[v.id].category = cat;
        else {
          cat = tpl.Nodes[l.to].category;
          if(!tpl.Variables[v.id].category && cat)
            tpl.Variables[v.id].category = cat;
        }

        tpl.Links[lid] = link;
      }
    }
    return wingsw;
  }

  createWingsWorkflow(wflow, clib) {
    if(wflow == null)
      return null;

    // FIXME: This is currently hardcoded. Should be configurable
    clib.storage = "/home/varun/.wings/storage";
    var dotpath = "/usr/bin/dot";
    var ontpfx = "http://www.wings-workflows.org/ontology";

    var tname = wflow.name + "_" + Math.random().toString(36).substr(2, 9);
    var usfx = "/users/" + clib.userid + "/" + clib.domain;
    var pfx = clib.server + "/export" + usfx;
    var tns = pfx + "/workflows/" + tname + ".owl#";
    var tid = tns + tname;

    var clibns = pfx + "/components/library.owl#";
    var purl = clib.server + usfx;
    var pdir = clib.storage + usfx;

    var wingsw = {
      template: {
        id: tid,
        Nodes: {},
        Links: {},
        Variables: {},
        inputRoles: {},
        outputRoles: {},
        onturl: ontpfx + "/workflow.owl",
        wflowns: ontpfx + "/workflow.owl#",
        version: 0,
        subtemplates: {},
        metadata: {},
        rules: {},
        props: {
          "lib.concrete.url": pfx + "/components/library.owl",
          "lib.domain.execution.url": pfx + "/executions/library.owl",
          "lib.domain.code.storage": pdir + "/code/library",
          "domain.workflows.dir.url": pfx + "/workflows",
          "user.id": clib.userid,
          "tdb.repository.dir": clib.storage + "/TDB",
          "viewer.id": clib.userid,
          "domain.executions.dir.url": pfx + "/executions",
          "lib.domain.data.url": pfx + "/data/library.owl",
          "ont.domain.data.url": pfx + "/data/ontology.owl",
          "lib.abstract.url": pfx + "/components/abstract.owl",
          "lib.provenance.url": clib.server + "/export/common/provenance/library.owl",
          "ont.data.url": ontpfx + "/data.owl",
          "lib.domain.data.storage": pdir + "/data",
          "lib.domain.workflow.url": pfx + "/workflows/library.owl",
          "lib.resource.url": clib.server + "/export/common/resource/library.owl",
          "ont.component.url": ontpfx + "/component.owl",
          "ont.workflow.url": ontpfx + "/workflow.owl",
          "ont.dir.url": ontpfx,
          "dot.path": dotpath,
          "ont.domain.component.ns": clibns,
          "ont.execution.url": ontpfx + "/execution.owl",
          "ont.resource.url": ontpfx + "/resource.owl"
        }
      }
    }
    var tpl = wingsw.template;

    // Create Workflow Nodes & Ports
    for(var i=0; i<wflow.models.length; i++) {
      var c = wflow.models[i];
      var nodeid = tns + c.id + "_node";
      var node = {
        id: nodeid,
        name: c.name,
        inputPorts: {},
        outputPorts: {},
        category: c.category,
        componentVariable: {
          binding: {
            id: clibns + c.name,
            type: "uri"
          },
          id: nodeid + "_component"
        }
      }
      for(var j=0; j<c.inputs.length; j++) {
        var ip = c.inputs[j];
        var roleid = ip.id;
        var portid = tns + roleid + "_inport";
        node.inputPorts[portid] = {
          id: portid,
          role: {
            type: 1,
            roleid: roleid,
            dimensionality: 0,
            id: portid + "_role"
          }
        }
      }
      for(var j=0; j<c.outputs.length; j++) {
        var op = c.outputs[j];
        var roleid = op.id;
        var portid = tns + roleid + "_outport";
        node.outputPorts[portid] = {
          id: portid,
          role: {
            type: 1,
            roleid: roleid,
            dimensionality: 0,
            id: portid + "_role"
          }
        }
      }
      tpl.Nodes[nodeid] = node;
    }
    // Workflow Variables
    var varid_hash = {};
    var filevars = {};
    for(var i=0; i<wflow.variables.length; i++) {
      var v = wflow.variables[i];
      if(!v.resolved)
        continue;
      // Create a hash of variable id to variable object
      varid_hash[v.id] = v;
      var fid = null;
      // Create a mapping of file ids to variables it contains
      for(var cid in v.provenance) {
        var fname = v.provenance[cid].file_id;
        var fid = tns + fname;
        if(!(fid in filevars))
          filevars[fid] = [];
        filevars[fid].push(v.id);
        tpl.Variables[fid] = {
          id: fid,
          name: fname,
          extra: {
            graph_variables: filevars[fid]
          },
          type: 1 //FIXME: use category here
        }
      }
    }

    // Create Workflow Links
    var vars_done = {};
    for(var i=0; i<wflow.links.length; i++) {
      var l = wflow.links[i];
      if(l.variable in vars_done)
        continue;

      var v = varid_hash[l.variable];
      var from = v.provenance[l.from];
      var to = v.provenance[l.to];

      // Create fully qualified uris for use in wings template
      l.from_uri = tns + l.from + "_node";
      l.to_uri = tns + l.to + "_node";
      if(from)
        from.file_uri = tns + from.file_id;
      if(to)
        to.file_uri = tns + to.file_id;

      if(l.type == "data") {
        var lid = l.to_uri+"_"+to.file_id;
        var link = {
          id: lid,
          toNode: {id: l.to_uri},
          toPort: {id: to.file_uri + "_inport"},
          variable: {id: to.file_uri}
        };
        var cat = tpl.Nodes[l.to_uri].category;
        if(!tpl.Variables[to.file_uri].category && cat)
          tpl.Variables[to.file_uri].category = cat;

        tpl.Links[lid] = link;
      }
      else if(l.type == "output") {
        var lid = l.from_uri+"_"+from.file_id;
        var link = {
          id: lid,
          fromNode: {id: l.from_uri},
          fromPort: {id: from.file_uri + "_outport"},
          variable: {id: from.file_uri}
        };
        var cat = tpl.Nodes[l.from_uri].category;
        if(!tpl.Variables[from.file_uri].category && cat)
          tpl.Variables[from.file_uri].category = cat;

        tpl.Links[lid] = link;
      }
      else if(l.type == "model") {
        // TODO:
        // Check from.metadata with to.metadata
        // If not same, then add conversion fragment if possible
        var frommeta = JSON.stringify(from.metadata);
        var tometa = JSON.stringify(to.metadata);
        if(frommeta != tometa) {
          for(var j=0; j<clib.workflow_fragments.length; j++) {
            var wfrag = clib.workflow_fragments[j];
            if(wfrag.variable == v.canonical_name) {
              var wfrommeta = JSON.stringify(wfrag.from.metadata);
              var wtometa = JSON.stringify(wfrag.to.metadata);
              if(frommeta == wfrommeta && tometa == wtometa) {
                // Found a Conversion worklfow match
                /*
                console.log("Adding conversion workflow " + wfrag.name + " for "+v.canonical_name
                +" from "+frommeta+" to "+tometa);
                */
                var wtplstr = JSON.stringify(wfrag.workflow.template);

                // Convert ids to fully qualified uris
                wtplstr = wtplstr.replace(/\[wflowns\]#/g, tns);
                wtplstr = wtplstr.replace(/\[clibns\]#/g, clibns);
                var wtpl = JSON.parse(wtplstr);

                wfrag.from.workflow_variable_uri = tns + wfrag.from.workflow_variable;
                wfrag.to.workflow_variable_uri = tns + wfrag.to.workflow_variable;

                // Copy fragment nodes and variables
                tpl.Nodes = Object.assign({}, tpl.Nodes, wtpl.Nodes);
                tpl.Variables = Object.assign({}, tpl.Variables, wtpl.Variables);

                // Replace I/O variables with variables from parent template
                delete tpl.Variables[wfrag.from.workflow_variable_uri];
                delete tpl.Variables[wfrag.to.workflow_variable_uri];

                tpl.Links = Object.assign({}, tpl.Links, wtpl.Links);
                for(var lid in tpl.Links) {
                  var wl = tpl.Links[lid];
                  if(wl.variable.id == wfrag.from.workflow_variable_uri) {
                    wl.variable.id = from.file_uri;
                    wl.fromNode = {id: l.from_uri};
                    wl.fromPort = {id: from.file_uri + "_outport"};
                  }
                  else if(wl.variable.id == wfrag.to.workflow_variable_uri) {
                    wl.variable.id = to.file_uri;
                    wl.toNode = {id: l.to_uri};
                    wl.toPort = {id: to.file_uri + "_inport"};
                  }
                  tpl.Links[lid] = wl;
                }
                tpl.Variables[from.file_uri].category = tpl.Nodes[l.from_uri].category;
                tpl.Variables[to.file_uri].category = tpl.Nodes[l.to_uri].category;
                break;
              }
            }
          }
          continue;
        }

        var lid = l.from_uri+"_"+l.to+"_"+from.file_id;
        var link = {
          id: lid,
          fromNode: {id: l.from_uri},
          fromPort: {id: from.file_uri + "_outport"},
          toNode: {id: l.to_uri},
          toPort: {id: to.file_uri + "_inport"},
          variable: {id: from.file_uri}
        }

        var cat = tpl.Nodes[l.from_uri].category;
        if(!tpl.Variables[from.file_uri].category && cat)
          tpl.Variables[from.file_uri].category = cat;
        else {
          var cat = tpl.Nodes[l.to_uri].category;
          if(tpl.Variables[to.file_uri] && !tpl.Variables[to.file_uri].category && cat)
            tpl.Variables[to.file_uri].category = cat;
        }

        tpl.Links[lid] = link;
        // Since we are combining 2 variables into 1 here as they are compatible
        // Delete one of them
        if(to.file_uri != from.file_uri)
          delete tpl.Variables[to.file_uri];
      }

      if(from) {
        for(var j=0; j<filevars[from.file_uri]; j++) {
          var vid = filevars[from.file_uri][j];
          vars_done[vid] = true;
        }
      }
      if(to) {
        for(var j=0; j<filevars[to.file_uri]; j++) {
          var vid = filevars[to.file_uri][j];
          vars_done[vid] = true;
        }
      }
    }

    // Create Input and Output links for unclaimed ports
    for(var nid in tpl.Nodes) {
      var n = tpl.Nodes[nid];
      for(var portid in n.inputPorts) {
        var p = n.inputPorts[portid];
        var fname = p.role.roleid;
        var lid = n.id+"_"+fname;
        var fid = tns + fname;
        var portid = fid + "_inport";
        // Check for links to port
        if(!this.hasLinksToPort(tpl, n.id, portid)) {
          tpl.Variables[fid] = {
            id: fid,
            name: fname,
            type: 1,
            category: n.category
          }
          tpl.Links[lid] = {
            id: lid,
            toNode: {id: n.id},
            toPort: {id: portid},
            variable: {id: fid}
          };
        }
      }
      for(var portid in n.outputPorts) {
        var p = n.outputPorts[portid];
        var fname = p.role.roleid;
        var lid = n.id+"_"+fname;
        var fid = tns + fname;
        var portid = fid + "_outport";
        if(!this.hasLinksFromPort(tpl, n.id, portid)) {
          tpl.Variables[fid] = {
            id: fid,
            name: fname,
            type: 1,
            category: n.category
          }
          tpl.Links[lid] = {
            id: lid,
            fromNode: {id: n.id},
            fromPort: {id: portid},
            variable: {id: fid}
          };
        }
      }
    }

    // Create Input and Output roles
    for(var lid in tpl.Links) {
      var link = tpl.Links[lid];
      var v = tpl.Variables[link.variable.id];
      if(!link.fromNode) {
        tpl.inputRoles[v.id] = {
          type: v.type,
          roleid: getLocalName(v.id),
          dimensionality: 0,
          id: v.id + "_irole"
        }
      }
      if(!link.toNode) {
        tpl.outputRoles[v.id] = {
          type: v.type,
          roleid: getLocalName(v.id),
          dimensionality: 0,
          id: v.id + "_orole"
        }
      }
    }
    return wingsw;
  }

  hasLinksToPort(tpl, nid, pid) {
    for(var lid in tpl.Links) {
      var l = tpl.Links[lid];
      if(l.toNode && l.toNode.id == nid &&
          l.toPort && l.toPort.id == pid)
        return true;
    }
    return false;
  }

  hasLinksFromPort(tpl, nid, pid) {
    for(var lid in tpl.Links) {
      var l = tpl.Links[lid];
      if(l.fromNode && l.fromNode.id == nid &&
          l.fromPort && l.fromPort.id == pid)
        return true;
    }
    return false;
  }
}

class VariableProvenance {
  constructor(cid, fid, metadata, isinput) {
    this.model = cid;
    this.file_id = fid;
    this.metadata = metadata;
    this.isinput = isinput;
  }
}

window.customElements.define(MintModelCatalog.is, MintModelCatalog);

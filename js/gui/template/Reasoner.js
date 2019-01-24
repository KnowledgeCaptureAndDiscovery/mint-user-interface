/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export function Reasoner(store) {
  this.complist = this.flattenComponents(store.components.tree);
  this.datalist = this.flattenData(store.data.tree);
  this.dtparents = this.getDatatypeParentMap(store.data.tree);
}

Reasoner.prototype.getComponentRoleType = function(cid, roleid) {
  var c = this.complist[cid];
  if (!c) return null;
  for (var i = 0; i < c.inputs.length; i++) {
    if (roleid == c.inputs[i].role)
      return c.inputs[i].type;
  }
  for (var i = 0; i < c.outputs.length; i++) {
    if (roleid == c.outputs[i].role)
      return c.outputs[i].type;
  }
  return null;
};

Reasoner.prototype.flattenComponents = function(comptree) {
  var comps = {};
  var tmp = comptree.children.concat();
  while (tmp.length) {
    var c = tmp.pop();
    if (c.cls.component)
      comps[c.cls.component.id] = c.cls.component;
    if (c.children)
      for (var i = 0; i < c.children.length; i++)
        tmp.push(c.children[i]);
  }
  return comps;
};

Reasoner.prototype.flattenData = function(data_root) {
  var data = {};
  var tmp = [data_root];
  while (tmp.length) {
    var d = tmp.pop();
    if (d.item) {
      data[d.item.id] = d.item;
    }
    if (d.children)
      for (var i = 0; i < d.children.length; i++)
        tmp.push(d.children[i]);
  }
  return data;
};


Reasoner.prototype.getDatatypeParentMap = function(data_root, parents) {
  var parentmap = {};
  var id = data_root.item.id;
  if (!parents) parents = [];
  parentmap[id] = parents;
  var children = data_root.children;
  if (children) {
    for (var i = 0; i < children.length; i++) {
      var cparents = parents.concat(); // duplicate
      cparents.push(id);
      var cmap = this.getDatatypeParentMap(children[i], cparents);
      for (var cid in cmap) parentmap[cid] = cmap[cid];
    }
  }
  return parentmap;
};

Reasoner.prototype.typeSubsumesType = function(type1, type2) {
  if (type1 == type2) return true;
  var parents = this.dtparents[type2];
  if (!parents) return false;
  for (var i = 0; i < parents.length; i++) {
    if (parents[i] == type1) return true;
  }
  return false;
};

/*
 * Check if this port is compatible to be linked with another port
 */
Reasoner.prototype.portsCompatible = function(port1, port2) {
  // Inputs can't connect to Inputs
  // Outputs can't connect to Outputs
  if (port1.isInput == port2.isInput)
    return false;

  // A Variable can't connect to another variable
  if ((port1.graphItem instanceof GraphVariable) &&
    (port2.graphItem instanceof GraphVariable))
    return false;

  // Cannot connect to ourselves
  if (port1.graphItem == port2.graphItem)
    return false;

  // Parameters can't be connected to Data
  if (port1.role.type != port2.role.type)
    return false;

  var port1 = port1.getComponentPort();
  var port2 = port2.getComponentPort();
  if (port1 == null || port2 == null)
    return false;

  var comp1 = port1.graphItem;
  var comp2 = port2.graphItem;

  var type1 = this.getComponentRoleType(comp1.binding.id, port1.role.roleid);
  var type2 = this.getComponentRoleType(comp2.binding.id, port2.role.roleid);

  if (port1.isInput)
    return this.typeSubsumesType(type1, type2);
  else
    return this.typeSubsumesType(type2, type1);
};

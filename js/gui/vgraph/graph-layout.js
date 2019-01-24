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

/*
 * Layout Class
 */

export function VGraphLayout() {
  this.graph = null;
};
// Global layout worker
VGraphLayout.layoutWorker = layoutWorker;

VGraphLayout.prototype.layout = function(graph, animate, loader) {
  this.graph = graph;
  var DPI = 72;
  var MAX_LINKS = 500;

  var numlinks = 0;
  for (var i in this.graph.links)
    numlinks++;

  if (numlinks > 500)
    return;
  //TODO: Instead do a simpler layout (no ports, no text)

  var nl = "\n";
  var tab = "\t";
  var dotstr = "digraph test {";
  dotstr += nl + tab + "node [shape=ellipse];";
  //dotstr += nl + tab + "nodesep = 1.5;";
  //dotstr += nl + tab + "ranksep = 0.2";
  //dotstr += nl + tab + "rankdir = \"LR\";";
  dotstr += nl + tab + "overlap = \"scalexy\";";
  dotstr += nl + tab + "sep = 0.4;";

  var idmap = {};

  for (var vid in this.graph.variables) {
    var v = this.graph.variables[vid];
    var text = this.cleanText(v.getText());
    var id = this.cleanID(v.getName());

    var fsize = v.config.getFontsize();
    var fname = v.config.getFont() + " " + v.config.getFontweight();

    var fsize = 12;
    dotstr += nl + tab + id +
      "[label=\"" + text + "\", " +
      "fontname=\"" + fname + "\", fontsize=\"" + fsize + "\"];";

    idmap[id] = v;
  }

  var donelinks = {};
  for (var lid in this.graph.links) {
    var l = this.graph.links[lid];
    var linkid = this.cleanID(l.fromVariable.id)
      + " -> " + this.cleanID(l.toVariable.id);

    if (!donelinks[linkid]) {
      dotstr += nl + tab + linkid;
      donelinks[linkid] = true;
    }
  }
  dotstr += nl + "}";

  var me = this;
  var myid = "variable-graph";
  var fn = function(e) {
    var response = e.data;
    // console.log(myid + ": received message from " + response[0]);
    if(response[0] != myid) // This response is not for me
      return;

    var layout = response[1];
    var lines = layout.split(/\n/);

    if(loader)
      loader.loading = false;

    var graph = lines[0].split(/\s+/);
    var gw = parseFloat(graph[2]);
    var gh = parseFloat(graph[3]);
    var curline = "";
    for (var i = 1; i < lines.length; i++) {
      var line = lines[i];
      if (line.match(/\\$/)) {
        curline += line.substring(0, line.length - 1);
        continue;
      }
      if (curline) {
        line = curline + line;
        curline = "";
      }
      var tmp = line.split(/\s+/);
      if (tmp.length < 4)
        continue;
      if (tmp[0] != "node")
        continue;
      var id = tmp[1];
      if (idmap[id]) {
        var item = idmap[id];
        var w = parseFloat(tmp[4]);
        var h = parseFloat(tmp[5]);
        var x = parseFloat(tmp[2]) * 1.1;
        var y = (gh - h / 2 - parseFloat(tmp[3])) / 1.5;
        //console.log("x="+x+", y="+y+", w="+w+", h="+h);
        var itemx = 10 + DPI * x; // - (item.bounds.width - item.textbounds.width)/2;
        var itemy = 30 + DPI * y;
        //console.log(line);
        //console.log(itemx + "," + itemy);
        item.setCoords({
          x: itemx,
          y: itemy
        }, animate);
      }
    }

    // Redraw links
    me.graph.drawLinks(false);
    me.graph.resizeViewport(true, false);
    me.graph.zoom(1);
  }
  var curfn = VGraphLayout.layoutWorker.listeners[myid];
  if(curfn)
    VGraphLayout.layoutWorker.removeEventListener("message", curfn);
  VGraphLayout.layoutWorker.listeners[myid] = fn;
  VGraphLayout.layoutWorker.addEventListener("message", fn);
  VGraphLayout.layoutWorker.postMessage([myid, dotstr, "fdp"]);
};

VGraphLayout.prototype.cleanID = function(id) {
  id = id.replace(/^.*#/g, "");
  id = id.replace(/[^a-zA-Z0-9_]/g, "_");
  if (id.match(/^([0-9]|\.|\-)/))
    id = '_' + id;
  return id;
};

VGraphLayout.prototype.cleanText = function(text, dim) {
  text = text.replace(/\n/g, '\\n');
  if(text.length > 35) {
    text = text.substr(0,35) + "...";
  }
  return text;
}

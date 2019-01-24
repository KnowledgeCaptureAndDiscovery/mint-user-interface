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

export function GraphLayout() {
  this.graph = null;
};
// Global layout worker
GraphLayout.layoutWorker = layoutWorker;

GraphLayout.prototype.layoutVizDot = function(loader, graph, animate, domnode) {
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
  dotstr += nl + tab + "node [shape=record];";
  dotstr += nl + tab + "nodesep = 0.1;";
  dotstr += nl + tab + "ranksep = 0.6;";

  var idmap = {};

  for (var nid in this.graph.nodes) {
    var n = this.graph.nodes[nid];
    var text = this.cleanText(n.getText(), n.getDimensionality());
    var id = this.cleanID(n.getName());
    /*var machine_text = n.getMachinesText();
    if(machine_text)
       text += "\n" + machine_text;*/

    var ips = n.getInputPorts();
    var ops = n.getOutputPorts();

    var fsize = n.config.getFontsize();
    var fname = n.config.getFont() + " " + n.config.getFontweight();

    dotstr += nl + tab + id + "[label=\"{{";
    for (var i = 0; i < ips.length; i++)
      dotstr += "|<" + this.cleanID(ips[i].getName()) + ">";
    dotstr += "|}|{" + text + "}|{";
    for (var i = 0; i < ops.length; i++)
      dotstr += "|<" + this.cleanID(ops[i].getName()) + ">";
    dotstr += "|}}\", fontname=\"" + fname + "\" fontsize=\"" + fsize + "\"];";
    idmap[id] = n;
  }

  for (var vid in this.graph.variables) {
    var v = this.graph.variables[vid];
    var text = this.cleanText(v.getText(), v.getDimensionality());
    var id = this.cleanID(v.getName());

    var fsize = v.config.getFontsize();
    var fname = v.config.getFont() + " " + v.config.getFontweight();

    var fsize = 13;
    dotstr += nl + tab + id +
      "[label=\"{{|<ip>|}|{" + text + "}|{|<op>|}}\", " +
      "fontname=\"" + fname + "\", fontsize=\"" + fsize + "\"];";

    idmap[id] = v;
  }

  var donelinks = {};
  for (var lid in this.graph.links) {
    var l = this.graph.links[lid];
    if (l.fromPort) {
      var linkid = this.cleanID(l.fromNode.getName()) + ":" +
        this.cleanID(l.fromPort.getName()) + " -> " +
        this.cleanID(l.variable.getName()) + ":ip;";
      if (!donelinks[linkid]) {
        dotstr += nl + tab + linkid;
        donelinks[linkid] = true;
      }
    }
    if (l.toPort) {
      var linkid = this.cleanID(l.variable.getName()) + ":op -> " +
        this.cleanID(l.toNode.getName()) + ":" +
        this.cleanID(l.toPort.getName()) + ";";
      if (!donelinks[linkid]) {
        dotstr += nl + tab + linkid;
        donelinks[linkid] = true;
      }
    }
  }
  dotstr += nl + "}";

  var me = this;
  var myid = "wings-workflow";
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
    if (domnode)
      me.graph.draw(domnode);
    else {
      // Redraw links
      me.graph.drawLinks(animate);
      me.graph.resizeViewport(true, animate);
    }
  }
  var curfn = GraphLayout.layoutWorker.listeners[myid];
  if(curfn)
    GraphLayout.layoutWorker.removeEventListener("message", curfn);
  GraphLayout.layoutWorker.listeners[myid] = fn;
  GraphLayout.layoutWorker.addEventListener("message", fn);
  GraphLayout.layoutWorker.postMessage([myid, dotstr, "dot"]);
};

GraphLayout.prototype.cleanID = function(id) {
  id = id.replace(/^.*#/g, "");
  id = id.replace(/[^a-zA-Z0-9_]/g, "_");
  if (id.match(/^([0-9]|\.|\-)/))
    id = '_' + id;
  return id;
};

GraphLayout.prototype.cleanText = function(text, dim) {
  var suffix = ""
  for (var i = 0; i < dim; i++)
    suffix += "D";

  text = text.replace(/\n/g, suffix + '\\n');
  text = text + suffix;
  text = text.replace(/([{}])/g, "1");
  return text;
}

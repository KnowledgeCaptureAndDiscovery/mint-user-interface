import * as d3 from 'd3'
import { getLocalName, getNamespace } from "../template/common.js";
import { VGraphVariable } from "./graph-variable.js";
import { VGraphLink } from "./graph-link.js";
import { VGraphLayout } from "./graph-layout.js";
import { VGraphVariableConfig, VGraphLinkConfig } from "./graph-item-config.js";
import { VGraphEvents } from "./graph-events.js";

export function VGraph(id, store, editor) {
  this.id = id;
  this.editor = editor;

  // Different sizes to handle scaling properly
  this.scale = 1;
  this.panelsize = {
    width: 0,
    height: 0
  };
  this.svgsize = {
    width: 0,
    height: 0
  };
  this.graphsize = {
    width: 0,
    height: 0
  };

  // SVG's width and height
  this.width = 0;
  this.height = 0;

  // D3 items
  this.svg = null;
  this.defs = null;
  this.grid = null;
  this.graph = null;
  this.tooltip = null;

  // Individual D3 Items
  this.links = {};
  this.variables = {};

  // sorted graph items
  this.graphItems = [];

  this.editable = false;
  this.use_alternate_text = false;
  this.initDrawingSurface();

  this.store = null;
  this.events = new VGraphEvents(this, this.svg);

  this.DBG = 0;

  this.setData(store);
}

VGraph.prototype.isEditable = function() {
  return this.editable;
};

VGraph.prototype.setEditable = function(editable) {
  var baseUrl = window.location.href;
  this.events.setEditable(editable);
  if(editable)
    this.grid.attr("fill", "url("+baseUrl+"#grid)");
};

VGraph.prototype.resizePanel = function(animate) {
  this.panelsize = {
    width: this.domnode.offsetWidth,
    height: this.domnode.offsetHeight
  };
  this.resizeViewport(false, animate);
};

VGraph.prototype.setScale = function(scale, animate) {
  this.scale = scale;
  this.calculateGraphSize();
  this.setViewport(animate);
  this.resizeSVG();
};

VGraph.prototype.setSVGSize = function(w, h, animate) {
  this.svgsize = {
    width: w,
    height: h
  };
  if (animate)
    this.svg.transition().attr("width", w).attr("height", h);
  else
    this.svg.attr("width", w).attr("height", h);
};

VGraph.prototype.setGraphSize = function(w, h) {
  if (w < this.panelsize.width/this.scale) {
    w = this.panelsize.width/this.scale;
  }
  if (h < this.panelsize.height/this.scale) {
    h = this.panelsize.height/this.scale;
  }
  this.graphsize = {
    width: w,
    height: h-3
  };
};

VGraph.prototype.resizeSVG = function(animate) {
  var w = this.scale * this.graphsize.width;
  var h = this.scale * this.graphsize.height
  if (w && h)
    this.setSVGSize(w, h, animate);
};

VGraph.prototype.addVariable = function(vardata, animate) {
  var gvar = this.variables[vardata.id];
  if(!gvar) {
    var gvar = new VGraphVariable(this, vardata, new VGraphVariableConfig(vardata.category, vardata.added));
    this.variables[vardata.id] = gvar;
    this.events.enableEventsForItem(gvar);
  }
  gvar.draw();
  gvar.setCoords(vardata.position);
  if(animate) {
    var curtrans = gvar.getItem().attr("transform");
    gvar.getItem().attr("transform", curtrans + " scale(0)");
    gvar.getItem().transition().attr("transform", curtrans + " scale(1)");
  }
  this.refreshGraphItems();
  //this.resizePanel(true);
}

VGraph.prototype.addLink = function(linkdata) {
  var fromVariable = this.variables[linkdata.from];
  var toVariable = this.variables[linkdata.to];
  var linkid = getLocalName(fromVariable.id) + "_to_" + getLocalName(toVariable.id);
  var glink = this.links[linkid];
  if(!glink) {
    glink = new VGraphLink(this.graph, this.id, linkid, fromVariable, toVariable, this.graphItems, new VGraphLinkConfig(linkdata.added));
    this.links[linkid] = glink;
  }
  glink.draw();
}

VGraph.prototype.removeVariable = function(variable) {
  var gvitem = this.variables[variable.id];
  gvitem.getItem().remove();
  delete this.variables[gvitem.id];

  // Also Delete all links from/to the variable
  for (var lid in this.links) {
    var gl = this.links[lid];
    if ((gl.fromVariable == gvitem) || (gl.toVariable == gvitem)) {
      this.removeLink(gl);
    }
  }

  this.refreshGraphItems();
};

VGraph.prototype.removeLink = function(link, from) {
  var glitem = this.links[link.id];
  if(glitem) {
    glitem.getItem().remove();
    delete this.links[glitem.id];
  }
};

VGraph.prototype.setData = function(store) {
  this.store = store;
  this.graph.id = store.id;
  this.graph.node().innerHTML = "";

  this.nodes = {};
  this.variables = {};
  this.links = {};

  // Create variables
  for (var i=0; i<store.variables.length; i++) {
    var vardata = store.variables[i];
    var varid = vardata.id;
    var gvar = new VGraphVariable(this, vardata, new VGraphVariableConfig(vardata.category, vardata.added));
    gvar.setCoords(this.getItemCoordinates(vardata));
    this.variables[varid] = gvar;
  }
  this.refreshGraphItems();

  // Create Links
  for (var i=0; i<store.links.length; i++) {
    var linkdata = store.links[i];

    var fromVariable = this.variables[linkdata.from];
    var toVariable = this.variables[linkdata.to];
    if(fromVariable && toVariable) {
      var linkid = fromVariable.id + "_to_" + toVariable.id;
      var glink = new VGraphLink(this.graph, this.id, linkid, fromVariable, toVariable, this.graphItems, new VGraphLinkConfig(linkdata.added));
      this.links[linkid] = glink;
    }
  }
};

VGraph.prototype.savePositions = function() {
  for (var i=0; i<this.store.variables.length; i++) {
    var v = this.store.variables[i];
    var gv = this.variables[v.id];
    v.position = gv.coords;
  }
};

VGraph.prototype.drawLinks = function(animate) {
  // Register new set of graph items to links (to do path avoidance)
  this.refreshGraphItems();
  for (var lid in this.links) {
    var l = this.links[lid];
    l.draw(animate);
  }
};

VGraph.prototype.draw = function(domnode) {
  if (domnode) {
    this.domnode = domnode;
    domnode.innerHTML = '';
    domnode.appendChild(this.svg.node());
    this.panelsize = {
      width: domnode.offsetWidth,
      height: domnode.offsetHeight
    };
    this.setResizeEvent(this.domnode);
  }

  // Draw variables
  for (var vid in this.variables) {
    var v = this.variables[vid];
    v.draw();
  }

  // Draw links
  this.drawLinks();

  this.resizeViewport(true);
  this.events.initialize();
};

VGraph.prototype.switchText = function(flag) {
  if(this.use_alternate_text != flag) {
    this.use_alternate_text = flag;
    this.draw();
  }
};

VGraph.prototype.setResizeEvent = function(domnode) {
  var me = this;
  window.addEventListener("resize", function() {
    me.resizePanel();
  });
};

VGraph.prototype.resizeViewport = function(fitclient, animate) {
  // Adjust viewport to see the whole graph
  this.calculateGraphSize();
  this.setViewport();
  if (fitclient) {
    if (this.graphsize.width && this.graphsize.height) {
      var scalex = this.panelsize.width / this.graphsize.width;
      var scaley = this.panelsize.height / this.graphsize.height;
      this.scale = scalex < scaley ? scalex : scaley;
    } else
      this.scale = 1;
  }
  this.resizeSVG(animate);
};

VGraph.prototype.calculateGraphSize = function() {
  var maxx = 0, maxy = 0;
  var xpad = 20, ypad = 20;
  var items = Object.assign({}, this.variables);
  for (var id in items) {
    var item = items[id];
    var bounds = item.getBounds();
    var coords = item.getCoords();
    var itemx = coords.x + bounds.x + bounds.width + xpad;
    var itemy = coords.y + bounds.y + bounds.height + ypad;
    if (maxx < itemx)
      maxx = itemx;
    if (maxy < itemy)
      maxy = itemy;
  }
  if (!maxx && !maxy) {
    maxx = this.panelsize.width;
    maxy = this.panelsize.height;
  }
  this.setGraphSize(maxx, maxy);
};

VGraph.prototype.calculateGraphSizeAfterMove = function(moveditems) {
  var maxx = 0,
    maxy = 0;
  var xpad = 20;
  ypad = 20;
  for (var id in moveditems) {
    var item = moveditems[id];
    var bounds = item.getBounds();
    var coords = item.getCoords();
    var itemx = coords.x + bounds.x + bounds.width + xpad;
    var itemy = coords.y + bounds.y + bounds.height + ypad;
    if (maxx < itemx)
      maxx = itemx;
    if (maxy < itemy)
      maxy = itemy;
  }
  this.setGraphSize(maxx, maxy);
};

VGraph.prototype.setViewport = function(animate) {
  var w = this.graphsize.width;
  var h = this.graphsize.height;
  if (animate)
    this.svg.transition().attr("viewBox", "0 0 " + w + " " + h);
  else
    this.svg.attr("viewBox", "0 0 " + w + " " + h);
};

VGraph.prototype.getItemCoordinates = function(item) {
  return item.position;
};

VGraph.prototype.refreshGraphItems = function() {
  // Get graph items sorted by y-position
  this.graphItems.length = 0;
  for (var vid in this.variables)
    this.graphItems.push(this.variables[vid]);
  this.graphItems.sort(function(p1, p2) {
    if (p1.getY() < p2.getY()) return -1;
    if (p1.getY() > p2.getY()) return 1;
    return 0;
  });
};

VGraph.prototype.initDrawingSurface = function() {
  // Clear existing svg
  if(this.svg)
    this.svg.remove();

  this.svg = d3.select(document.createElementNS(d3.namespaces.svg, "svg"))
    .attr("preserveAspectRatio", "xMinYMin");

  var tname = getLocalName(this.id);

  // arrow template
  this.defs = this.svg.append("svg:defs");
  this.defs.append("svg:marker")
    .attr("id", "arrow_" + tname)
    .attr("viewBox", "0 0 10 8")
    .attr("refX", 10)
    .attr("refY", 4)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 10)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M 0 0 L 10 4 L 0 8 z"); //L 5 4 z");

  this.createGrid();

  // Graph group
  this.graph = this.svg.append("g");

  // A dummy SVGPoint for coordinates translation
  this.pt = this.svg.node().createSVGPoint();

  // Define the div for the tooltip
  this.tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
};

VGraph.prototype.zoom = function(value, animate) {
  this.setScale(this.scale * value, animate);
};

VGraph.prototype.getImage = function() {
  var xml = new XMLSerializer().serializeToString(this.svg.node());
  var data = "data:image/svg+xml;base64," + btoa(xml);
  var img = new Image();
  img.setAttribute('src', data);
  return img;
};

VGraph.prototype.createGrid = function() {
  var baseUrl = window.location.href;

  this.defs.append("svg:pattern").attr("id", "smallGrid")
    .attr("width", 8).attr("height", 8)
    .attr("patternUnits", "userSpaceOnUse")
    .append("svg:path")
    .attr("d", "M 8 0 L 0 0 0 8")
    .attr("fill", "none").attr("stroke", "#BBB")
    .attr("stroke-width", "0.5");

  var gridpattern = this.defs.append("svg:pattern").attr("id", "grid")
    .attr("width", 80).attr("height", 80)
    .attr("patternUnits", "userSpaceOnUse")
  gridpattern.append("rect")
    .attr("width", 80).attr("height", 80).attr("fill", "url("+baseUrl+"#smallGrid)")
  gridpattern.append("svg:path")
    .attr("d", "M 80 0 L 0 0 0 80")
    .attr("fill", "none").attr("stroke", "#BBB")
    .attr("stroke-width", "1");

  this.grid = this.svg.append("rect")
    .attr("width", "100%").attr("height", "100%").attr("fill", "white");
};

VGraph.prototype.layout = function(animate, loader) {
  // Convert graph to dot
  var gviz = new VGraphLayout();
  gviz.layout(this, animate, loader);
};

VGraph.prototype.showTooltip = function(message, x, y) {
  this.tooltip.html(message);
  var bbox = this.tooltip.node().getBoundingClientRect();
  this.tooltip
    .style("left", (x - bbox.width / 2) + "px")
    .style("top", (y - bbox.height - 15) + "px");

  this.tooltip.transition().delay(200)
    .style("opacity", .9);
};

VGraph.prototype.hideTooltip = function() {
  this.tooltip.transition()
    .style("opacity", 0);
};

VGraph.prototype.transformEventCoordinates = function(x, y) {
  this.pt.x = x;
  this.pt.y = y;
  return this.pt.matrixTransform(this.svg.node().getScreenCTM().inverse());
};

VGraph.prototype.transformSVGCoordinates = function(x, y) {
  this.pt.x = x;
  this.pt.y = y;
  return this.pt.matrixTransform(this.svg.node().getScreenCTM());
};

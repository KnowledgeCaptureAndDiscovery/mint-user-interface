import { VGraphLinkConfig } from "./graph-item-config.js";
import { getLocalName } from "../template/common.js";

export function VGraphLink(parent, graphid, id,
  fromVariable, toVariable, graphItems, config) {
  this.parent = parent;
  this.graphid = graphid;
  this.id = id;

  this.fromVariable = fromVariable;
  this.toVariable = toVariable;

  this.config = config;
  this.inactive = false;

  this.graphItems = graphItems; // VGraph variable items (used to find non-intersecting paths)

  // D3 Objects
  this.item = null;
  // D3 Link path
  this.path = null;
  // D3 Line interpolation
  this.interpolation = null;

  this.create();
};

VGraphLink.prototype.create = function() {
  var baseUrl = window.location.href;

  this.item = this.parent.insert("g", "g").attr("id", this.id);

  var arrowid = "url(" + baseUrl + "#arrow_" + getLocalName(this.graphid) + ")";
  this.path = this.item.append("path")
    .attr("stroke", this.config.strokecolor)
    .attr("fill", "none")
    .attr("stroke-width", this.config.strokewidth)
    .attr("pointer-events", "none")
    .attr("opacity", this.config.strokeopacity)
    .attr("marker-mid", arrowid);

  this.interpolation = d3.line()
    .x(function(d) {
      return d.x;
    })
    .y(function(d) {
      return d.y;
    })
    .curve(this.config.interpolation);
};

VGraphLink.prototype.getItem = function() {
  return this.item;
};

VGraphLink.prototype.clear = function() {
  this.path.attr("d", null);
};

VGraphLink.prototype.setId = function(id) {
  this.id = id;
  if (this.item)
    this.item.attr("id", this.id);
};

VGraphLink.prototype.getName = function() {
  return this.id;
};

VGraphLink.prototype.getDescription = function() {
  return getLocalName(this.id) +
    (this.variable ? " (" + this.variable.getName() + ")" : "");
};

VGraphLink.prototype.configure = function() {
  if (this.inactive)
    this.item.style("opacity", this.config.inactiveopacity);
  else {
    if (this.variable && this.variable.autofill)
      this.item.style("opacity", this.config.autofillopacity);
    else
      this.item.style("opacity", 1);
  }
};

VGraphLink.prototype.draw = function(animate) {
  // Draw link from node to variable
  this.configure();
  this.drawLink(animate);
};

VGraphLink.prototype.drawLink = function(animate) {
  var start = this.fromVariable.getCoords();
  var end = this.toVariable.getCoords();
  var coords = this.getPathCoordinates(start, end);
  if (animate)
    this.path.transition().attr("d", this.interpolation(coords));
  else
    this.path.attr("d", this.interpolation(coords));
};

VGraphLink.prototype.getPathCoordinates = function(start, end) {
  var coords = [];
  coords.push(start);
  var segments = this.getLineSegments(start, end);
  if(segments.length == 0) {
    var mid = {
      x: ( start.x + end.x ) / 2,
      y: ( start.y + end.y ) / 2,
    };
    coords.push(mid);
  }
  else {
    for (var i = 0; i < segments.length; i++) {
      coords.push(segments[i]);
    }
  }
  coords.push(end);
  return coords;
};

VGraphLink.prototype.getLineSegments = function(start, end, index) {
  var segments = [];
  if (!index)
    index = 0;

  // TODO: use reverseVGraphItems if(start.y > end.y)
  for (var i = index; i < this.graphItems.length; i++) {
    var gitem = this.graphItems[i];
    if (gitem == this.fromVariable || gitem == this.toVariable) {
      continue;
    }
    var coords = gitem.getCoords();
    var bounds = gitem.getBounds();
    var pad = this.config.intersectionpad;

    var nwidth = bounds.width + pad * 2 ;
    var nheight = bounds.height;
    var nx = coords.x + bounds.x - pad;
    var ny = coords.y + bounds.y;

    var intersection = this.lineIntersects(start.x, start.y,
      end.x, end.y, nx, ny, nx + nwidth, ny + nheight);
    if (intersection != null) {
      var corners = [];
      corners[0] = {
        x: nx,
        y: ny
      }; // tl
      corners[1] = {
        x: nx + nwidth,
        y: ny
      }; // tr
      corners[2] = {
        x: nx,
        y: ny + nheight
      }; // bl
      corners[3] = {
        x: nx + nwidth,
        y: ny + nheight
      }; // br

      var stpt = this.findClosestCorner(corners, intersection[0]);
      var endpt = this.findClosestCorner(corners, intersection[1]);

      if (stpt != endpt) {
        if (stpt == corners[0] && endpt == corners[3]) {
          segments.push(corners[1]);
        } else if (stpt == corners[1] && endpt == corners[2]) {
          segments.push(corners[0]);
        } else if (stpt == corners[3] && endpt == corners[0]) {
          segments.push(corners[2]);
        } else if (stpt == corners[2] && endpt == corners[1]) {
          segments.push(corners[3]);
        } else {
          segments.push(stpt);
        }
      }
      segments.push(endpt);

      /*for(var j=i; j<this.graphItems.length; j++) {
      	var nitem = this.graphItems[j];
      	if(nitem.getY() > gitem.getY())
      		break;
      }*/
      // Get further segments
      var mpoints = this.getLineSegments(endpt, end, i + 1);

      for (var k = 0; k < mpoints.length; k++)
        segments.push(mpoints[k]);

      break;
    }
  }
  return segments;
};

VGraphLink.prototype.findClosestCorner = function(corners, point) {
  var current = null;
  var max = 99999;
  for (var j = 0; j < corners.length; j++) {
    var c = corners[j];
    var diff = Math.abs(point.x - c.x) + Math.abs(point.y - c.y);
    if (diff < max) {
      max = diff;
      current = c;
    }
  }
  return current;
};

VGraphLink.prototype.lineIntersects = function(x1, y1, x2, y2,
  xmin, ymin, xmax, ymax) {
  var u1 = 0.0;
  var u2 = 1.0;
  var r;
  var deltaX = (x2 - x1);
  var deltaY = (y2 - y1);
  /*
   * left edge, right edge, bottom edge and top edge checking
   */
  var pPart = [-1 * deltaX, deltaX, -1 * deltaY, deltaY];
  var qPart = [x1 - xmin, xmax - x1, y1 - ymin, ymax - y1];

  var accept = true;
  for (var i = 0; i < 4; i++) {
    var p = pPart[i];
    var q = qPart[i];
    if (p == 0 && q < 0) {
      accept = false;
      break;
    }
    r = q / p;
    if (p < 0)
      u1 = Math.max(u1, r);
    if (p > 0)
      u2 = Math.min(u2, r);

    if (u1 > u2) {
      accept = false;
      break;
    }
  }
  if (accept) {
    if (u2 < 1) {
      x2 = x1 + u2 * deltaX;
      y2 = y1 + u2 * deltaY;
    }
    if (u1 > 0) {
      x1 = x1 + u1 * deltaX;
      y1 = y1 + u1 * deltaY;
    }
    return [{
      x: x1,
      y: y1
    }, {
      x: x2,
      y: y2
    }];
  } else {
    return null;
  }
};

VGraphLink.prototype.setFromPort = function(fromPort) {
  // Alter existing fromPort (if any)
  if (this.fromPort)
    this.fromVariable.removeOutputLink(this);

  this.fromVariable = fromPort ? fromPort.graphItem : null;
  this.fromPort = fromPort;
  if (this.fromVariable)
    this.fromVariable.addOutputLink(this);

  this.setId(this.getLinkId());
};

VGraphLink.prototype.setToPort = function(toPort) {
  // Alter existing toPort (if any)
  if (this.toPort)
    this.toVariable.removeInputLink(this);

  this.toVariable = toPort ? toPort.graphItem : null;
  this.toPort = toPort;
  if (this.toVariable)
    this.toVariable.addInputLink(this);

  this.setId(this.getLinkId());
};

VGraphLink.prototype.equals = function(l) {
  if (!l)
    return false;

  if (!this.fromVariable && l.fromVariable)
    return false;
  if (!this.toVariable && l.toVariable)
    return false;
  if (!this.fromPort && l.fromPort)
    return false;
  if (!this.toPort && l.toPort)
    return false;
  if (!this.variable && l.variable)
    return false;

  if (this.fromVariable && !this.fromVariable.equals(l.fromVariable))
    return false;
  if (this.toVariable && !this.toVariable.equals(l.toVariable))
    return false;
  if (this.fromPort && !this.fromPort.equals(l.fromPort))
    return false;
  if (this.toPort && !this.toPort.equals(l.toPort))
    return false;
  if (this.variable && !this.variable.equals(l.variable))
    return false;

  return true;
};

VGraphLink.prototype.setPreview = function(operation) {
  this.preview = operation;
  if (!operation) {
    this.item.style("opacity", 1);
    this.pathToVariable.style("opacity", 1);
    this.pathFromVariable.style("opacity", 1);
  } else if (operation == "remove") {
    this.item.style("opacity", 0.2);
    this.pathToVariable.style("opacity", 1);
    this.pathFromVariable.style("opacity", 1);
    if (this.variable.variableLinks.length == 1)
      this.variable.setPreview("remove");
  } else if (operation == "changeFromPort")
    this.pathToVariable.style("opacity", 0.2);
  else if (operation == "changeToPort")
    this.pathFromVariable.style("opacity", 0.2);
};

import { VGraphVariableConfig } from "./graph-item-config.js";
import { getNamespace, getLocalName } from "../template/common.js";

export function VGraphVariable(graph, v, config) {
  this.parent = graph.graph;
  this.graph = graph;

  this.id = v.id
  this.text = v.label
  this.alternate_text = v.canonical_name || v.standard_name;
  this.config = config;

  this.binding = null;
  this.dimensionality = 0;
  this.newitem = false;

  this.textbounds = {
    x: 0, y: 0,
    width: 0, height: 0
  };
  this.bounds = {
    x: 0, y: 0,
    width: 0, height: 0
  };
  this.coords = {
    x: 0, y: 0
  };

  // D3 Objects
  this.item = null; // Main group
  this.textitem = null; // Text
  this.bgitem = null; // Background

  this.create();
};

VGraphVariable.prototype.create = function() {
  this.item = this.parent.append('g').attr("id", this.id);
  this.bgitem = this.createBackgroundItem(this.item);
  this.textitem = this.item.append('text');
};

VGraphVariable.prototype.configure = function() {
  this.textitem
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "bottom")
    .style("font-size", this.config.getFontsize() + "px")
    .style("font-family", this.config.getFont())
    .style("font-weight", this.config.getFontweight())
    .style("fill", this.config.getTextcolor())
    //.style("stroke", this.config.getStrokecolor())
    .attr("paint-order", "stroke")
    .attr("stroke-width", 0.8)

  if (this.bgitem) {
    this.bgitem.attr("stroke", this.config.getStrokecolor())
      .attr("stroke-width", this.config.getStrokewidth())
      .attr("fill", this.config.getBgcolor());
    this.bgitem.attr("pointer-events", this.config.placeholder ? "none" : null);
  }
};

VGraphVariable.prototype.createBackgroundItem = function(parent) {
  return parent.insert('rect');
};

VGraphVariable.prototype.drawBackgroundItem = function(bgitem, bounds) {
  bgitem
    .attr("x", bounds.x)
    .attr("y", bounds.y)
    .attr("rx", this.config.radius)
    .attr("ry", this.config.radius)
    .attr("width", bounds.width)
    .attr("height", bounds.height);
  /*
  bgitem
    .attr("cx", bounds.x + bounds.width/2.0)
    .attr("cy", bounds.y + bounds.height/2.0)
    .attr("rx", bounds.width/2.0)
    .attr("ry", bounds.height/2.0);*/
};

//** OVERRIDE in Subclases **
VGraphVariable.prototype.setDefaultColors = function() {
  this.config = new VGraphVariableConfig(this.config.category, this.config.newitem);
};

VGraphVariable.prototype.calculateBoundingBox = function() {
  // Get text bounding box
  var bbox = this.textitem.node().getBBox();
  // Calculate item's top-left corner from text size (to pass to
  // drawBackground)
  this.textbounds.x = bbox.x - this.config.getXpad();
  this.textbounds.y = bbox.y - this.config.getYpad();

  // Calculate item's width and height
  this.textbounds.width = bbox.width + this.config.getXpad() * 2;
  this.textbounds.height = bbox.height + this.config.getYpad() * 2;

  this.bounds = {
    x: this.textbounds.x,
    y: this.textbounds.y,
    width: this.textbounds.width,
    height: this.textbounds.height
  }
};

VGraphVariable.prototype.draw = function() {
  this.configure();
  this.drawText();
  this.calculateBoundingBox();
  this.drawBackgroundItem(this.bgitem, this.bounds);
};

VGraphVariable.prototype.getItem = function() {
  return this.item;
};

VGraphVariable.prototype.getBackground = function() {
  return this.bgitem;
};

VGraphVariable.prototype.getTextItem = function() {
  return this.textitem;
};

VGraphVariable.prototype.getId = function() {
  return this.id;
};

VGraphVariable.prototype.setId = function(id) {
  this.id = id;
  this.item.attr("id", id);
};

VGraphVariable.prototype.getName = function() {
  return getLocalName(this.id);
};

VGraphVariable.prototype.getText = function() {
  return this.text;
}

VGraphVariable.prototype.setText = function(text, redraw) {
  this.text = text;
  if (redraw) {
    this.draw(true);
  }
}

VGraphVariable.prototype.drawText = function() {
  this.textitem.node().innerHTML = "";
  var text = this.graph.use_alternate_text ? this.alternate_text : this.text;
  if(!text) {
    text = "None"
  }
  if(text.length > 35) {
    text = text.substr(0,35) + "...";
  }
  var lines = text.split(/\n/);
  for (var i = 0; i < lines.length; i++) {
    if (!lines[i])
      continue;
    var fontsize = this.config.getFontsize() * (i > 0 ? 0.65 : 1);
    var dysize = i == 1 ? fontsize * 1.5 : fontsize;
    this.textitem.append('tspan').text(lines[i])
      .style("font-size", fontsize + "px")
      .attr("x", 0).attr("dy", dysize/2.0);
  }
}

VGraphVariable.prototype.getX = function() {
  return this.coords.x;
}

VGraphVariable.prototype.setX = function(x) {
  this.setCoords({
    x: x,
    y: this.getY()
  });
}

VGraphVariable.prototype.getY = function() {
  return this.coords.y;
}

VGraphVariable.prototype.setY = function(y) {
  this.setCoords({
    x: this.getX(),
    y: y
  });
}

VGraphVariable.prototype.getCoords = function() {
  return this.coords;
}

VGraphVariable.prototype.setCoords = function(coords, animate) {
  if(!coords) {
    return;
  }
  if (coords.legacy)
    return this.setLegacyCoords(coords);

  if (coords.x < this.bounds.width / 2 + 1)
    coords.x = this.bounds.width / 2 + 1;
  if (coords.y < this.bounds.height / 2 + 1) {
    coords.y = this.bounds.height / 2 + 1;
  }
  if (animate)
    this.item.transition().attr("transform", "translate(" + coords.x + "," + coords.y + ")");
  else
    this.item.attr("transform", "translate(" + coords.x + "," + coords.y + ")");
  this.coords = coords;
}

VGraphVariable.prototype.setLegacyCoords = function(coords) {
  coords.x = coords.x + this.bounds.width / 2;
  coords.y = coords.y + this.bounds.height / 2;
  this.item.attr("transform", "translate(" + coords.x + "," + coords.y + ")");
  this.coords = coords;
}

VGraphVariable.prototype.getBounds = function() {
  return this.bounds;
};

VGraphVariable.prototype.getWidth = function() {
  return this.bounds.width;
}

VGraphVariable.prototype.getHeight = function() {
  return this.bounds.height;
}

// Override
VGraphVariable.prototype.getBindingText = function(binding) {
  if (!binding)
    return this.binding;
  return binding;
};

VGraphVariable.prototype.getBinding = function() {
  return this.binding;
};

VGraphVariable.prototype.setBinding = function(binding, redraw) {
  this.binding = binding;
  this.setText(this.getBindingText(), redraw);
};

VGraphVariable.prototype.getConfig = function() {
  return this.config;
};

VGraphVariable.prototype.setConfig = function(config) {
  this.config = config;
};

VGraphVariable.prototype.setNewItem = function(newitem) {
  this.newitem = newitem;
};

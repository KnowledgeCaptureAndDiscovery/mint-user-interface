export function VGraphLinkConfig(newitem) {
  this.strokecolor = "rgba(30,30,30,1)";
  this.strokewidth = 0.7
  this.strokeopacity = 0.5;
  this.intersectionpad = 15;
  this.linkstartpad = 15;
  this.interpolation = d3.curveBundle.beta(1);
  this.setNewItem(newitem);
};

VGraphLinkConfig.prototype.setNewItem = function(newitem) {
  this.newitem = newitem;
  if(this.newitem) {
    this.strokecolor = "orange";
  }
  else {
    this.strokecolor = "rgba(30,30,30,1)";
  }
};

export function VGraphVariableConfig(category, newitem) {
  // Configuration
  // TODO: Get from config file
  this.xpad = 8;
  this.ypad = 6;
  this.fontsize = 14;
  this.font = "Tahoma";
  this.bgcolor = "rgba(125,125,125,1)";
  this.textcolor = "rgba(245,245,245,1)";
  this.strokecolor = "rgba(0,0,0,0.7)";
  this.strokewidth = 0.5;
  this.fontweight = "normal";
  this.radius = 16;
  this.setCategory(category);
  this.setNewItem(newitem);
};

VGraphVariableConfig.prototype.setCategory = function(category) {
  this.category = category;
  if(this.category=="Climate") {
    this.bgcolor = "rgba(144,177,219,1)";
    //this.textcolor = "rgba(30,60,90)";
    //this.strokecolor = this.bgcolor;
  }
  else if(this.category=="Hydrology") {
    this.bgcolor = "rgba(70,116,190,1)";
    //this.strokecolor = this.bgcolor;
  }
  else if(this.category=="Agriculture") {
    this.bgcolor = "rgba(85,129,57,1)";
    //this.strokecolor = this.bgcolor;
  }
  else if(this.category=="Economic") {
    this.bgcolor = "rgba(190,96,51,1)";
    //this.strokecolor = this.bgcolor;
  }
};

VGraphVariableConfig.prototype.setNewItem = function(newitem) {
  this.newitem = newitem;
  if(this.newitem) {
    this.strokecolor = "orange";
    this.strokewidth = 3;
  }
  else {
    this.strokecolor = "rgba(0,0,0,0.7)";
    this.strokewidth = 0.5;
  }
};

VGraphVariableConfig.prototype.getXpad = function() {
  return this.xpad;
};

VGraphVariableConfig.prototype.setXpad = function(xpad) {
  this.xpad = xpad;
};

VGraphVariableConfig.prototype.getYpad = function() {
  return this.ypad;
};

VGraphVariableConfig.prototype.setYpad = function(ypad) {
  this.ypad = ypad;
};

VGraphVariableConfig.prototype.getStrokewidth = function() {
  return this.strokewidth;
};

VGraphVariableConfig.prototype.setStrokewidth = function(strokewidth) {
  this.strokewidth = strokewidth;
};

VGraphVariableConfig.prototype.getFontsize = function() {
  return this.fontsize;
};

VGraphVariableConfig.prototype.setFontsize = function(fontsize) {
  this.fontsize = fontsize;
};

VGraphVariableConfig.prototype.getFontweight = function() {
  return this.fontweight;
};

VGraphVariableConfig.prototype.setFontweight = function(fontweight) {
  this.fontweight = fontweight;
};

VGraphVariableConfig.prototype.getFont = function() {
  return this.font;
};

VGraphVariableConfig.prototype.setFont = function(font) {
  this.font = font;
};

VGraphVariableConfig.prototype.getTextcolor = function() {
  return this.textcolor;
};

VGraphVariableConfig.prototype.setTextcolor = function(textcolor) {
  this.textcolor = textcolor;
};

VGraphVariableConfig.prototype.getStrokecolor = function() {
  return this.strokecolor;
};

VGraphVariableConfig.prototype.setStrokecolor = function(strokecolor) {
  this.strokecolor = strokecolor;
};

VGraphVariableConfig.prototype.getBgcolor = function() {
  return this.bgcolor;
};

VGraphVariableConfig.prototype.setBgcolor = function(bgcolor) {
  this.bgcolor = bgcolor;
};

VGraphVariableConfig.prototype.setBgcolor = function(bgcolor) {
  this.bgcolor = bgcolor;
};

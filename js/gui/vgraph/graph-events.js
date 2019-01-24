import { VGraphLink } from "./graph-link.js";
import { VGraphLinkConfig } from "./graph-item-config.js";

export function VGraphEvents(graph, canvas) {
  this.graph = graph;
  this.canvas = canvas;

  this.dispatch = d3.dispatch("select", "link");

  this.selections = {};
  this.validports = {};

  this.fromport = null;
  this.toport = null;

  this.tmplink = null;
  this.tmpvariable = null;
  this.selectbox = null;
  this.adder = {last_tap: null, position: {x:0, y:0}};
  this.editor = {last_tap: null, item: null};
  this.linker = {waiting: false, active: false, timeout: null, from: null, to: null};

  this.editable = false;
}

VGraphEvents.prototype.initialize = function() {
  this.initializeDraggerItems();
  this.enableEvents();
};

VGraphEvents.prototype.initializeDraggerItems = function() {
  if (!this.selectbox)
    this.selectbox = this.graph.svg.append("rect")
    .attr("fill", "rgba(0,0,0,0.2)")
    .attr("border", "rgba(0,0,0,0.2)");

  if (!this.tmplink)
    this.tmplink = new VGraphLink(this.canvas, this.graph.id, "__dragger_link", null, null, [], new VGraphLinkConfig());

  if (!this.tmpvariable) {
    // Create a dummy variable
    this.tmpvariable = {
      coords: {
        x: 0,
        y: 0
      },
      graphItem: {},
      setCoords: function(coords) {
        this.coords = coords;
      },
      getCoords: function() {
        return this.coords;
      }
    };
  }
};

VGraphEvents.prototype.enableEvents = function() {
  var gitems = Object.assign({}, this.graph.variables);
  var me = this;

  // Enable individual item events
  for (var id in gitems) {
    var gitem = gitems[id];
    this.enableEventsForItem(gitem);
  }
  this.enableCanvasEvents();
};

VGraphEvents.prototype.setEditable = function(editable) {
  this.editable = editable;
};

VGraphEvents.prototype.getSelections = function() {
  return Object.keys(this.selections);
};

VGraphEvents.prototype.selectItem = function(gitem) {
  this.selections[gitem.id] = gitem;
  gitem.config.setBgcolor("yellow");
  //gitem.config.setStackcolor("yellow");
  gitem.config.setTextcolor("black");
  gitem.configure();
  this.dispatch.call("select", this, this.selections);
};

VGraphEvents.prototype.deselectItem = function(gitem) {
  delete this.selections[gitem.id];
  gitem.setDefaultColors();
  gitem.configure();
  this.dispatch.call("select", this, this.selections);
};

VGraphEvents.prototype.deselectAllItems = function() {
  // Deselect all earlier selections
  for (var selid in this.selections) {
    var gitem = this.selections[selid];
    gitem.setDefaultColors();
    gitem.configure();
  }
  this.selections = {};
  this.dispatch.call("select", this, this.selections);
};


VGraphEvents.prototype.enableEventsForItem = function(gitem) {
  var me = this;
  gitem.getItem().style("cursor", "default");
  var drag = d3.drag().subject(function(d) {
    return {
      x: 0,
      y: 0
    };
  });
  drag.on("start", function() {
    // Edit Variable information on double click/tap
    if(me.editable) {
      var e = d3.event.sourceEvent;
      var t2 = e.timeStamp;
      var t1 = me.editor.last_tap || t2;
      var dt = t2 - t1;

      me.editor.last_tap = t2;
      if (dt && dt < 400) {
        // double-click/tap
        me.editor.item = gitem;
        e.preventDefault();
        e.stopPropagation();
        me.deselectAllItems();
        me.editVariableInformation(gitem);
        return;
      }
    }

    // Select item
    if (!me.selections[gitem.id]) {
      var e = d3.event.sourceEvent;
      if(!e.ctrlKey && !e.metaKey && !e.shiftKey)
        me.deselectAllItems();
      me.selectItem(gitem);
    }
    for(var id in me.selections) {
      me.selections[id].dragstart = {
        x: me.selections[id].coords.x,
        y: me.selections[id].coords.y
      }
    }

    // Start linking after tap and hold
    if(me.editable && !me.linker.waiting) {
      me.linker.waiting = true;
      me.linker.from = gitem;
      me.linker.timeout = setTimeout(function() {
        if(me.linker.waiting) {
          me.linker.waiting = false;
          me.linker.active = true;
          var item = me.linker.from;
          item.setDefaultColors();
          item.config.setStrokecolor("#00FF00");
          item.config.setStrokewidth(5);
          item.configure();

          item.getItem().style("cursor", "pointer");
          me.canvas.style("cursor", "pointer");
        }
      }, 500);
    }
    d3.event.sourceEvent.preventDefault();
    d3.event.sourceEvent.stopPropagation();
  });
  drag.on("drag", function() {
    if(me.editable && me.linker.waiting) {
      // Cancel link drag if significant movement
      var dx = gitem.dragstart.x - gitem.coords.x;
      var dy = gitem.dragstart.y - gitem.coords.y;
      var diff = Math.sqrt(dx*dx + dy*dy);
      if (diff > 8/me.graph.scale) {
        me.linker.waiting = false;
        me.linker.active = false;
        clearTimeout(me.linker.timeout);
      }
    }
    if(me.editable && me.linker.active) {
      // Drag a link out from a variable
      var xy = d3.mouse(me.canvas.node());
      var pos = {x: xy[0], y:xy[1]};
      me.tmpvariable.setCoords(pos);
      me.tmplink.fromVariable = me.linker.from;
      me.tmplink.toVariable = me.tmpvariable;

      // Check if we are over any existing nodes
      for (var vid in me.graph.variables) {
        var gv = me.graph.variables[vid];
        if(me.linker.from == gv) {
          continue;
        }
        var b = gv.getBounds();
        var c = gv.getCoords();
        var gpos = {
          x1: c.x - b.x - b.width, y1: c.y - b.y - b.height,
          x2: c.x - b.x, y2: c.y - b.y
        };
        if(pos.x > gpos.x1 && pos.y > gpos.y1
            && pos.x < gpos.x2 && pos.y < gpos.y2) {
          me.linker.to = gv;
          gv.config.setStrokecolor("#00FF00");
          gv.config.setStrokewidth(5);
          gv.configure();
          gv.getItem().style("cursor", "pointer");
          me.tmplink.toVariable = gv;
        }
        else if(gv == me.linker.to) {
          gv.setDefaultColors();
          gv.configure();
          gv.getItem().style("cursor", "default");
          me.linker.to = null;
        }
      }

      // Draw the temporary link
      me.tmplink.draw();
      return false;
    }
    else {
      // Move the variable
      var dx = d3.event.x;
      var dy = d3.event.y;
      gitem.getItem().style("cursor", "move");
      var links = {};
      for (var id in me.selections) {
        var selitem = me.selections[id];
        selitem.setCoords({
          x: selitem.dragstart.x + dx,
          y: selitem.dragstart.y + dy
        });
      }
      var linksToRedraw = {};
      for (var lid in me.graph.links) {
        var gl = me.graph.links[lid];
        // Redraw only relevant links while dragging
        if ((gl.fromVariable != null && me.selections[gl.fromVariable.id]) ||
          (gl.toVariable != null && me.selections[gl.toVariable.id])) {
            linksToRedraw[gl.id] = gl;
        }
      }
      for (var lid in linksToRedraw)
        linksToRedraw[lid].draw();
      me.graph.calculateGraphSize(); //AfterMove(me.selections);
      me.graph.setViewport();
      me.graph.resizeSVG();
    }
  });
  drag.on("end", function() {
    // Clear linking if not held for long enough
    if(me.editable && me.linker.waiting) {
      me.linker.waiting = false;
      me.linker.active = false;
      me.linker.from = null;
      clearTimeout(me.linker.timeout);
    }
    // If linking active.. then link it !
    else if(me.editable && me.linker.active) {
      if (me.linker.to) {
        me.graph.editor.push("data.links", {
          "from": me.linker.from.id,
          "to": me.linker.to.id
        });
        me.linker.to.setDefaultColors();
        me.linker.to.configure();
        me.linker.to.getItem().style("cursor", "default");
      }
      me.tmplink.clear();
      me.linker.from.setDefaultColors();
      me.linker.from.configure();
      me.linker.from.getItem().style("cursor", "default");

      me.linker.from = null;
      me.linker.to = null;
      me.linker.active = false;
      me.linker.waiting = false;
      me.deselectAllItems();
      me.canvas.style("cursor", "default");
    }
    else {
      // Finish Variable Move (Redraw all links after dragging ended)
      gitem.getItem().style("cursor", "default");
      me.graph.drawLinks();
      for (var id in me.selections) {
        var selitem = me.selections[id];
        delete selitem.dragstart;
      }
    }
  });
  gitem.getItem().call(drag);
};

VGraphEvents.prototype.generateID = function () {
  return this.graph.id + '#v_' + Math.random().toString(36).substr(2, 9);
};

VGraphEvents.prototype.enableCanvasEvents = function() {
  var me = this;
  // Canvas events
  // Select items by dragging out a selection box on canvas
  var drag = d3.drag()
    .on("start", function() {
      // Add Variable on double click/tap
      if(me.editable) {
        var e = d3.event.sourceEvent;
        var t2 = e.timeStamp;
        var t1 = me.adder.last_tap || t2;
        var dt = t2 - t1;

        me.adder.last_tap = t2;
        if (dt && dt < 400) {
          // double-click/tap
          var x = d3.event.x/me.graph.scale;
          var y = d3.event.y/me.graph.scale;
          var vardata = {
            "id": me.generateID(),
            "label": "Variable",
            "category": "",
            "position": {
              "x": x,
              "y": y
            }
          };
          e.preventDefault();
          e.stopPropagation();
          // Ask user for new variable information
          me.addNewVariable(vardata);
          return;
        }
      }

      // Start selection box
      me.selectbox.startx = d3.event.x/me.graph.scale;
      me.selectbox.starty = d3.event.y/me.graph.scale;
      me.selectbox
        .attr("x", me.selectbox.startx).attr("y", me.selectbox.starty)
        .attr("width", 0).attr("height", 0);
      me.selectbox.style("display", "");

      // Deselect all current selections
      me.deselectAllItems();
      me.linker.from = null;
      me.tmplink.clear();
      d3.event.sourceEvent.preventDefault();
      d3.event.sourceEvent.stopPropagation();
    })
    .on("drag", function() {
      // Create the selectbox
      var x = d3.event.x/me.graph.scale;
      var y = d3.event.y/me.graph.scale;
      var w = x - me.selectbox.startx;
      var h = y - me.selectbox.starty;
      if (w > 0 && h > 0)
        me.selectbox.attr("width", w).attr("height", h);

      var gitems = Object.assign({}, me.graph.variables);
      for (var id in gitems) {
        var gitem = gitems[id];
        var b = gitem.getBounds();
        var c = gitem.getCoords();

        var x1 = c.x + b.x;
        var x2 = c.x + b.x + b.width;
        var y1 = c.y + b.y;
        var y2 = c.y + b.y + b.height;

        if (x1 > me.selectbox.startx && x2 < x &&
            y1 > me.selectbox.starty && y2 < y) {
          if(!(id in me.selections))
            me.selectItem(gitem);
        } else if (id in me.selections) {
          me.deselectItem(gitem);
        }
      }
    })
    .on("end", function() {
      me.selectbox.style("display", "none");
    });

  this.canvas.call(drag);

  // Disable tap and hold context menu
  /*window.oncontextmenu = function(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  };*/
};

VGraphEvents.prototype.addNewVariable = function(vardata) {
  var ed = this.graph.editor;
  ed.set('edItem', vardata);
  ed.variable_editor.open();
};

VGraphEvents.prototype.editVariableInformation = function(item) {
  var vardata = null;
  var data = this.graph.editor.data;
  for (var i=0; i<data.variables.length; i++)
    if(data.variables[i].id == item.id)
      vardata = data.variables[i];
  if(!vardata)
    return;

  var ed = this.graph.editor;
  ed.set('edItem', Object.assign({}, vardata));
  ed.variable_editor.open();
};

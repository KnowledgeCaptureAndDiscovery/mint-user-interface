import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

import './loading-screen.js';

import { Template } from "../js/gui/template/TemplateGraph.js";

/**
 * @customElement
 * @polymer
 */
class WingsWorkflow extends PolymerElement {
  static get template() {
   return html`
   <style>
     :host {
       display: block;
     }
     .outer {
       position: relative;
       width:100%;
       height:650px;
       overflow:auto;
     }
     #canvas {
       width:100%;
       height:calc(100% - 4px);
     }
     loading-screen#loader {
       --loading-screen-color: var(--app-accent-color);
     }
     @media (max-width: 767px) {
       .outer {
         height: 450px;
       }
     }
   </style>

   <div class="outer">
     <div id="canvas"></div>
     <loading-screen id="loader"></loading-screen>
   </div>
  `;
  }

  static get is() {
    return 'wings-workflow';
  }

  static get properties() {
    return {
      data: {
        type: Object
      },
      width: {
        type: Number,
        value: 1280
      },
      height: {
        type: Number,
        value: 800
      },
      selected: {
        type: Array,
        notify: true
      },
      visible: Boolean
    };
  }

  static get observers() {
   return [
     // Observer method name, followed by a list of dependencies, in parenthesis
     //'_variablesAddedOrRemoved(data.variables.splices)',
     //'_linksAddedOrRemoved(data.links.splices)',
     '_dataChanged(data, visible)'
   ]
  }

  ready() {
   super.ready();
   this.id = null;
  }

  _dataChanged(data, visible) {
    if (!data || !visible)
      return;

    this.$.loader.loading = true;
    this.data = data;

    var me = this;
    this.id = data.id;
    this.template = new Template(this.id, this.data, this);
    this.template.events.dispatch.on("select", function(items) {
      var graph_variables = [];
      for (var itemid in items) {
        if (items[itemid].extra) {
          graph_variables = graph_variables.concat(items[itemid].extra.graph_variables);
        } else {
          graph_variables.push(itemid);
        }
      }
      me.set("selected", graph_variables);
    });
    this.template.setEditable(false);
    this.template.draw(this.$.canvas);
    this.layout();
  }

  zoomIn() {
   this.template.zoom(1.2);
  }

  zoomOut() {
   this.template.zoom(1.0/1.2);
  }

  layout(animate) {
   this.template.layout(animate, this.$.loader);
  }

  setDetailLevel(level) {
    this.$.loader.loading = true;
    this.template.setData(this.data, parseInt(level));
    this.template.draw(this.$.canvas);
    this.layout();
  }
}

window.customElements.define(WingsWorkflow.is, WingsWorkflow);

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-ajax/iron-ajax.js';

import { putJSONResource } from './mint-requests.js';
import './variable-graph.js';

class MintGovernCag extends PolymerElement {

  static get is() { return "mint-govern-cag"; }

  static get template() {
    return html`
    <style include="mint-common-styles">
    </style>

    <app-route route="[[route]]" pattern="/:regionid/:op"
      data="{{routeData}}" tail="{{subroute}}"></app-route>
    <app-route route="[[subroute]]" pattern="/:questionid/:taskid"
      data="{{subrouteData}}"></app-route>

    <template is="dom-if" if="[[graphid]]">
      <iron-ajax url="[[graphid]]" auto handle-as="json" last-response="{{graphData}}"></iron-ajax>
    </template>

    <template is="dom-if" if="[[visible]]">
      <template is="dom-if" if="[[userid]]">
        <template is="dom-if" if="[[subrouteData.questionid]]">

          <iron-ajax auto
            url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[subrouteData.questionid]]"
            handle-as="json" last-response="{{question}}"></iron-ajax>
          <iron-ajax auto
            url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[subrouteData.questionid]]/tasks/[[subrouteData.taskid]]"
            handle-as="json" last-response="{{task}}"></iron-ajax>

          <b>[[_getHeading(routeData.op)]]: </b>
          <i>
            <template is="dom-repeat" items="[[selectedItems]]">
              <li>[[_getVariableDetail(item, graphData)]]</li>
            </template>
          </i>
          <br />
          <paper-button class="important" on-tap="_submitVariableSelection">DONE</paper-button>
        </template>
      </template>
    </template>

    <variable-graph id="cag" data="[[graphData]]"
      config="[[config]]" operation="edit"
      editable="[[_isEqual(routeData.op, 'browse')]]" selected-items="{{selectedItems}}"></variable-graph>
`
  }

  static get properties() {
    return {
      config: Object,
      userid: Object,
      graphid: {
        type: Object,
        computed: '_getGraphId(routeData.regionid, userid)'
      },
      selectedItems: Array,
      graphData: Object,
      vocabulary: Object,
      question: Object,
      task: Object,
      route: Object,
      routeData: {
        type: Object,
        observer: '_routeDataChanged'
      },
      subroute: Object,
      subrouteData: {
        type: Object,
        observer: '_subrouteDataChanged'
      },
      visible: Boolean
    }
  }

  static get observers() {
    return [
      '_loadVariableGraphPlain(graphData, visible, routeData.op)',
      '_loadVariableGraphQuestion(graphData, visible, question, routeData.op)'
      //'_initializeSelectedItems(routeData.op, question)'
    ];
  }

  _routeDataChanged(rd) {
    if(rd && rd.op == "browse") {
      this.subrouteData = {};
    }
  }

  _subrouteDataChanged(rd) {
    if(rd && rd.questionid) {

    }
  }

  _initializeSelectedItems(op, question) {
    if(op && question) {
      console.log(question);
      if(op == "SelectDrivingVariables")
        this.set("selectedItems", question.drivingVariables);
      if(op == "SelectResponseVariables")
        this.set("selectedItems", question.responseVariables);
    }
  }

  _getHeading(op) {
    if(op)
      return op.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  _localName(id) {
    return id.replace(/^.+#/, '');
  }

  _isEqual(a,b) {
    return a==b;
  }

  _getGraphId(regionid, userid) {
    if(regionid && userid)
      return this.config.server + "/users/" + userid + "/regions/" + regionid + "/cag";
    /*
    if(vocabulary && regionid) {
      for(var i=0; i<vocabulary.regions.length; i++) {
        var region = vocabulary.regions[i];
        var rid = region.id.replace(/^.+\//, '');
        if(rid == regionid) {
          return region.graph;
        }
      }
    }*/
  }

  _loadGraph() {
    this.$.cag.loading = true;
    this.$.cag.loadGraph();
    this.$.cag.loading = true;
    this.$.cag.layout(false);
  }

  _loadVariableGraphPlain(graphData, visible, op) {
    if(op == "browse" && graphData && visible) {
      this._loadGraph();
    }
  }

  _loadVariableGraphQuestion(graphData, visible, question, op) {
    if(visible && graphData && question && op != "browse") {
      this._loadGraph();

      if(question) {
        if(op == "SelectDrivingVariables")
          this.set("selectedItems", question.drivingVariables);
        if(op == "SelectResponseVariables")
          this.set("selectedItems", question.responseVariables);
        this.$.cag.selectVariables(this.selectedItems);
      }
    }
  }

  _setTaskOutput(question, varids) {
    var me = this;
    /* Update Task */
    var acttype = this.routeData.op;
    var done = true;
    var allvarids = [];
    for(var actid in me.task.activities) {
      var activity = me.task.activities[actid];
      if(actid.indexOf(acttype) > 0) {
        activity.output = varids;
      }
      if(!activity.output) {
        done = false;
      }
      else {
        me.task.status = "ONGOING";
        allvarids = allvarids.concat(activity.output);
      }
    }
    if(done) {
      me.task.status = "DONE";
      me.task.output = allvarids;
    }

    /* Save new Task in Server */
    putJSONResource({
      url: me.task.id,
      onLoad: function(e) {
        var new_path = 'govern/analysis/' + me._getLocalName(me.routeData.regionid) + "/" +
          me.subrouteData.questionid + "/" + me.subrouteData.taskid;

        window.history.pushState({question: question, task: me.task}, null, new_path);
        window.dispatchEvent(new CustomEvent('location-changed'));
        //location.reload();
      },
      onError: function() {
        console.log("Cannot update task");
      }
    }, me.task)
  }

  _getLocalName(id) {
    return id.substring(id.lastIndexOf("/") + 1);
  }

  _submitVariableSelection() {
    var variables = [];
    if(this.routeData.op.match(/DrivingVariables/i)) {
      this.question.drivingVariables = this.selectedItems;
    }
    if(this.routeData.op.match(/ResponseVariables/i)) {
      this.question.responseVariables = this.selectedItems;
    }

    var me = this;
    putJSONResource({
      url: me.question.id,
      onLoad: function(e) {
        me._setTaskOutput(me.question, me.selectedItems);
      },
      onError: function() {
        console.log("Cannot update task");
      }
    }, me.question)
  }

  _getVariableDetail(varid, graphData) {
    console.log(varid);
    console.log(graphData);
    if(varid && graphData) {
      var v = this._getGraphVariable(varid, graphData);
      if(v) {
        return v.label + " (" + (v.standard_names?v.standard_names.join(", "):'') + ")";
      }
    }
  }

  _getGraphVariable(varid, graphData) {
    for(var i=0; i<graphData.variables.length; i++) {
      var v = graphData.variables[i];
      if(v.id == varid) {
        return v;
      }
    }
  }
}

customElements.define(MintGovernCag.is, MintGovernCag);

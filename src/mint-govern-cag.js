import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/app-route/app-route.js';
import '@polymer/iron-ajax/iron-ajax.js';

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
            url="[[config.server]]/users/[[userid]]/questions/[[subrouteData.questionid]]"
            handle-as="json" last-response="{{question}}"></iron-ajax>
          <iron-ajax auto
            url="[[config.server]]/users/[[userid]]/questions/[[subrouteData.questionid]]/tasks/[[subrouteData.taskid]]"
            handle-as="json" last-response="{{task}}"></iron-ajax>

          <b>[[_getHeading(routeData.op)]]: </b>
          <i>
            <template is="dom-repeat" items="[[selectedItems]]">
              <template is="dom-if" if="[[index]]">,</template>
              [[_localName(item)]]
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
        computed: '_getGraphId(routeData.regionid, vocabulary)'
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
      subrouteData: Object,
      visible: Boolean
    }
  }

  static get observers() {
    return [
      '_loadVariableGraph(graphData, visible)'
    ];
  }

  _routeDataChanged(rd) {
    if(rd && rd.op == "browse")
      this.subrouteData = {};
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

  _getGraphId(regionid, vocabulary) {
    if(vocabulary && regionid) {
      for(var i=0; i<vocabulary.regions.length; i++) {
        var region = vocabulary.regions[i];
        var rid = region.id.replace(/^.+\//, '');
        if(rid == regionid) {
          return region.graph;
        }
      }
    }
  }

  _loadVariableGraph(graphData, visible) {
    if(visible && graphData) {
      this.$.cag.loading = true;
      this.$.cag.loadGraph();
      this.$.cag.loading = true;
      this.$.cag.layout(false);

      if(this.question) {
        if(this.routeData.op == "SelectDrivingVariables")
          this.$.cag.selectVariables(this.question.drivingVariables);
        else if(this.routeData.op == "SelectResponseVariables")
          this.$.cag.selectVariables(this.question.responseVariables);
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
    me._putResource({
      url: me.task.id,
      onLoad: function(e) {
        var new_path = 'govern/analysis/' + this._getLocalName(me.routeData.regionid) + "/" +
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
    me._putResource({
      url: me.question.id,
      onLoad: function(e) {
        me._setTaskOutput(me.question, me.selectedItems);
      },
      onError: function() {
        console.log("Cannot update task");
      }
    }, me.question)
  }

  _putResource(rq, data) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    //xhr.withCredentials = true;
    xhr.open('PUT', rq.url);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(data));
  }
}

customElements.define(MintGovernCag.is, MintGovernCag);

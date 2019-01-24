import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-ajax/iron-ajax.js';

import './mint-common-styles.js';

class MintSimpleQuestionCreator extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">
      paper-item {
        min-height: 32px;
        font-size: 13px;
      }
      .question_label {
        padding-left: 25px;
        width: calc(100% - 50px);
        font-weight: bold;
        font-size: 13px;
        margin-top: 5px;
      }
      .incomplete {
        color: maroon;
      }
      .complete {
        color: green;
      }

      paper-textarea {
        margin:0px;
        display: block;
        padding-left: 25px;
        width: calc(100% - 50px);
        --paper-input-container: {
          padding: 2px;
        }
      }
      paper-dropdown-menu {
        margin:0px;
        display: block;
        padding-left: 25px;
        width: calc(100% - 50px);
      }
    </style>

    <paper-textarea label="Question" value="{{text}}"></paper-textarea>

    <!-- Select sub region -->
    <paper-dropdown-menu no-animations="" hotizontal-align="left" label="Select Sub-Region">
      <paper-listbox slot="dropdown-content" attr-for-selected="value" selected="{{subregion}}">
        <paper-item value="[[region]]">[[region.label]]</paper-item>
        <template is="dom-repeat" items="[[_getAllSubRegions(region)]]">
          <paper-item value="[[item]]">[[item.label]]</paper-item>
        </template>
      </paper-listbox>
    </paper-dropdown-menu>

    <!-- Select year >
    <paper-dropdown-menu no-animations="" label="Select Year">
      <paper-listbox slot="dropdown-content" hotizontal-align="left" attr-for-selected="value" selected="{{timePeriod}}">
        <paper-item value="">None</paper-item>
        <template is="dom-repeat" items="[[_getYears(qtindex)]]">
          <paper-item value="[[item]]">[[item.label]]</paper-item>
        </template>
      </paper-listbox>
    </paper-dropdown-menu -->

`;
  }

  static get is() {
    return 'mint-simple-question-creator';
  }

  static get properties() {
    return {
      vocabulary: Object,
      region: Object,
      graphData: Object,

      question: {
        type: Object,
        notify: true
      },
      text: String,
      subregion: Object,
      timePeriod: Object
    };
  }

  static get observers() {
    return [
      '_createQuestion(text, subregion)'
    ]
  }

  _createQuestion(text) {
    if(text && this.region) {
      var regionid = this.subregion ? this.subregion.id : this.region.id;
      this.set("question", {
        label: text,
        region: regionid,
        graph: this.region.graph,
        type: "DIAGNOSTIC" // FIXME: Hardcoding this right now
      });
    }
  }

  _notNull(item) {
    return item != null;
  }

  _isPositive(item) {
    return item >= 0;
  }

  reset() {
    this.label = null;
    this.question = null;
    this.subregion = "";
    this.timePeriod = "";
  }

  _getAllSubRegions(region, add) {
    if(region) {
      var subregions = [];
      if(add) subregions.push(region);
      if(region.subRegions) {
        for(var i=0; i<region.subRegions.length; i++) {
          var subRegion = region.subRegions[i];
          subregions = subregions.concat(this._getAllSubRegions(subRegion, true));
        }
      }
      return subregions;
    }
  }

  _hasIntervention(qtindex) {
    var label = this.vocabulary.question_templates[qtindex].label;
    if(label.indexOf("<intervention>") >= 0)
      return true;
    return false;
  }

  _getInterventions(qtindex) {
    var interventions = this.vocabulary.question_templates[qtindex].interventions;
    var its = {}
    for(var i=0; i<this.vocabulary.intervention_types.length; i++) {
      var it = this.vocabulary.intervention_types[i];
      its[it.id] = it;
    }
    var fullits = [];
    for(var i=0; i<interventions.length; i++) {
      fullits.push(its[interventions[i]]);
    }
    return fullits;
  }

  _getYears(qtindex) {
    var years = this.vocabulary.question_templates[qtindex].years;
    var fullyears = [];
    for(var i=0; i<years.length; i++) {
      fullyears.push({
        id: {
          fromDate: new Date(years[i] + "-01-01").getTime(),
          toDate: new Date((years[i]+1) + "-01-01").getTime()
        },
        label: years[i]
      });
    }
    return fullyears;
  }
}

customElements.define(MintSimpleQuestionCreator.is, MintSimpleQuestionCreator);

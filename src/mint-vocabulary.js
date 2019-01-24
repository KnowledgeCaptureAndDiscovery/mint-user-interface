import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import '@polymer/iron-ajax/iron-ajax.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

class MintVocabulary extends PolymerElement {
  static get template() {
    return html`
    <template is="dom-if" if="[[config]]">
      <iron-ajax auto="" url="[[config.server]]/common/regions" handle-as="json" last-response="{{regions}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/question_templates" handle-as="json" last-response="{{question_templates}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/task_types" handle-as="json" last-response="{{task_types}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/event_types" handle-as="json" last-response="{{event_types}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/intervention_types" handle-as="json" last-response="{{intervention_types}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/graphs" handle-as="json" last-response="{{graphs}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/models" handle-as="json" last-response="{{models}}"></iron-ajax>
    </template>
`;
  }

  static get is() {
    return 'mint-vocabulary';
  }

  static get properties() {
    return {
      config: Object,
      vocabulary: {
        type: Object,
        notify: true,
        computed: '_computeVocabulary(regions, task_types, event_types, intervention_types, question_templates, graphs, models)'
      },
      regions: Array,
      task_types: Array,
      event_types: Array,
      question_templates: Array,
      intervention_types: Array,
      graphs: Array,
      models: Array
    };
  }

  _computeVocabulary(regions, task_types, event_types, intervention_types, question_templates, graphs, models) {
    if(regions && task_types && event_types && question_templates && graphs && models) {
      return {
        regions: regions,
        task_types: task_types,
        event_types: event_types,
        question_templates: question_templates,
        intervention_types: intervention_types,
        graphs: graphs,
        models: models
      };
    }
  }
}

customElements.define(MintVocabulary.is, MintVocabulary);

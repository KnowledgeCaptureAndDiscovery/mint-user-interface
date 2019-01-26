import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import '@polymer/iron-ajax/iron-ajax.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

class MintVocabulary extends PolymerElement {
  static get template() {
    return html`
    <template is="dom-if" if="[[config]]">
      <iron-ajax auto="" url="[[config.server]]/common/regions" handle-as="json" last-response="{{regions}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/task_types" handle-as="json" last-response="{{task_types}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/graphs" handle-as="json" last-response="{{graphs}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/models" handle-as="json" last-response="{{models}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/workflows" handle-as="json" last-response="{{workflows}}"></iron-ajax>
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
        computed: '_computeVocabulary(regions, task_types, graphs, models, workflows)'
      },
      regions: Array,
      task_types: Array,
      graphs: Array,
      models: Array,
      workflows: Array
    };
  }

  _computeVocabulary(regions, task_types, graphs, models, workflows) {
    if(regions && task_types && graphs && models, workflows) {
      return {
        regions: regions,
        task_types: task_types,
        graphs: graphs,
        models: models,
        workflows: workflows
      };
    }
  }
}

customElements.define(MintVocabulary.is, MintVocabulary);

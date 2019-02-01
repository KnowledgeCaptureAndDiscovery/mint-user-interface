import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import '@polymer/iron-ajax/iron-ajax.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

class MintVocabulary extends PolymerElement {
  static get template() {
    return html`
    <template is="dom-if" if="[[config]]">
      <iron-ajax auto="" url="[[config.server]]/common/regions" handle-as="json" last-response="{{vocabulary.regions}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/task_types" handle-as="json" last-response="{{vocabulary.task_types}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/models" handle-as="json" last-response="{{vocabulary.models}}"></iron-ajax>
      <iron-ajax auto="" url="[[config.server]]/common/workflows" handle-as="json" last-response="{{vocabulary.workflows}}"></iron-ajax>
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
        value: {}
      }
    };
  }
}

customElements.define(MintVocabulary.is, MintVocabulary);

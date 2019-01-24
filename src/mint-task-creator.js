import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-button/paper-button.js';
import './mint-common-styles.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

class MintTaskCreator extends PolymerElement {
  static get template() {
    return html`
    <style>
      paper-item {
        min-height: 32px;
        font-size: 13px;
      }
      .task_label {
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
      paper-dropdown-menu {
        margin:0px;
        display: block;
        padding-left: 25px;
        width: calc(100% - 50px);
      }
    </style>

    <!-- Select task template -->
    <paper-dropdown-menu no-animations="" hotizontal-align="left" label="Task Type">
      <paper-listbox slot="dropdown-content" attr-for-selected="role" selected="{{qtindex}}">
        <template is="dom-repeat" items="[[vocabulary.task_types]]">
          <paper-item role\$="[[index]]">[[item.label]]</paper-item>
        </template>
      </paper-listbox>
    </paper-dropdown-menu>
`;
  }

  static get is() {
    return 'mint-task-creator';
  }

  static get properties() {
    return {
      vocabulary: Object,
      qtindex: Number,
      task: {
        type: Object,
        notify: true,
        computed: '_getTask(qtindex)'
      }
    };
  }

  reset() {
    this.qtindex = null;
    this.task = null;
  }

  _getTask(qtindex) {
    if(qtindex && qtindex >=0) {
      var task_type = this.vocabulary.task_types[qtindex];
      var task = {
        type: task_type.id,
        label: task_type.label,
        activities: {}
      };
      for(var i=0; i<task_type.activity_types.length; i++) {
        var atype = task_type.activity_types[i];
        task.activities[atype.id] = {
          label: atype.label
        }
      }
      return task;
    }
  }
}

customElements.define(MintTaskCreator.is, MintTaskCreator);

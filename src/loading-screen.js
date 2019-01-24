import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';

class LoadingScreen extends PolymerElement {
  static get template() {
    return html`
    <style is="custom-style">
      :host {
        display: none;
        opacity: 0;
        height: 100%;
        width: 100%;
      }

      .screen {
        position: absolute;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: var(--loading-screen-opacity, 1);
        background-color: var(--loading-screen-background-color, #FFF);
      }

      .text {
        color: var(--loading-screen-color, "#999");
        font-weight: bold;
        padding-bottom:5px;
      }

      paper-spinner-lite {
        --paper-spinner-color: var(--loading-screen-color, #999);
      }

    </style>

    <div class="screen" hidden\$="[[!active]]">
      <div class="text">Loading</div>
      <paper-spinner-lite alt="[[alt]]" active="[[loading]]"></paper-spinner-lite>
    </div>
`;
  }

  static get is() { return 'loading-screen'; }

  static get properties() {
    return {
      loading: {
        type: Boolean,
        value: false,
        notify: true,
        observer: '_loadingChanged'
      },
      alt: {
        type: String,
        value: 'loading'
      }
    }
  }

  _loadingChanged(loading) {
    if (!loading) {
      this.style.display = "none";
      this.style.opacity = "0"
      /*d3.select(this).transition().style("opacity", 0).
        transition().style("display", "none");*/
    }
    else {
      this.style.display = "block";
      this.style.opacity = "1"
    }
  }
}

customElements.define(LoadingScreen.is, LoadingScreen);

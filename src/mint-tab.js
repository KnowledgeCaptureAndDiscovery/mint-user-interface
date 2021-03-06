/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';

import '../node_modules/@polymer/iron-flex-layout/iron-flex-layout.js';
import './mint-ripple-container.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="mint-tab">
  <template strip-whitespace="">
    <style>
      [hidden] {
        display: none !important;
      }

      :host {
        display: inline-block;
        position: relative;
      }

      #overlay {
        pointer-events: none;
        display: none;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        @apply --mint-tab-overlay;
      }

      :host(.mint-tabs-overlay-static-above) #overlay {
        display: block;
      }
    </style>
    <div id="overlay"></div>
    <mint-ripple-container>
      <slot></slot>
    </mint-ripple-container>
  </template>

</dom-module>`;

document.head.appendChild($_documentContainer.content);
class MintTab extends PolymerElement {
  static get is() { return 'mint-tab'; }
}

customElements.define(MintTab.is, MintTab);

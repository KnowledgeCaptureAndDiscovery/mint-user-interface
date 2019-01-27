/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import './mint-button.js';
import './mint-image.js';
import './mint-common-styles.js';

class MintResultsHome extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">

      h2 {
        font-size: 1.3em;
        font-weight: 500;
        margin: 32px 0;
      }

    </style>

    <ul>
      <li><a href="/results/list/[[config.wings.gendomain]]">Browse Data Generation workflow runs</a></li>
      <li><a href="/results/list/[[config.wings.domain]]">Browse Modeling workflow runs</a></li>
    </ul>
`;
  }

  static get is() { return 'mint-results-home'; }

  static get properties() {
    return {
      config: Object,
      userid: Object,
      vocabulary: Object
    };
  }
}
customElements.define(MintResultsHome.is, MintResultsHome);

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import './mint-common-styles.js';
import './mint-image.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

class MintHome extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">

      .item {
        display: block;
        text-decoration: none;
        text-align: center;
        margin-bottom: 0px;
      }

      mint-image {
        position: relative;
        height: 280px;
        margin-bottom: 10px;
        overflow: hidden;
        --mint-image-img: {
          position: absolute;
          top: 0;
          bottom: 0;
          left: -9999px;
          right: -9999px;
          max-width: none;
        };
      }

      h2 {
        font-size: 1.3em;
        font-weight: 500;
        margin: 32px 0;
      }

      /*.detail {
        width: 95%;
        max-width: 1440px;
        margin:0 auto;
        transition: opacity 0.4s;
      }*/

      .footer {
        margin-top: 50px;
        bottom: 0px;
      }
      .footerbg {
        padding-top: 5px;
        font-size: 8px;
        text-align: right;
      }

      @media (max-width: 767px) {
        mint-image {
          height: 240px;
        }

        h2 {
          margin: 24px 0;
        }

        /*.detail {
          margin: 16px 16px;
        }*/
      }

    </style>

    <div class="item">
      <mint-image src="images/mint-banner.jpg" alt="MINT"></mint-image>
    </div>
    <div class="detail" has-content="">
      <h1>Welcome to MINT</h1>
      <p>Major societal and environmental challenges require forecasting how natural processes
        and human activities affect one another. There are many areas of the globe where climate
        affects water resources and therefore food availability, with major economic and social
        implications. Today, such analyses require significant effort to integrate highly
        heterogeneous models from separate disciplines, including geosciences, agriculture,
        economics, and social sciences. Model integration requires resolving semantic,
        spatio-temporal, and execution mismatches, which are largely done by hand today
        and may take more than two years. The Model INTegration (MINT) project will develop
        a modeling environment which will significantly reduce the time needed to develop
        new integrated models, while ensuring their utility and accuracy.</p>
    </div>
    <div class="footer">
      <div class="footerbg">
        <img width="50" src="images/DARPA_Logo.jpg">
      </div>
    </div>
`;
  }

  static get is() { return 'mint-home'; }

  static get properties() { return {
    visible: {
      type: Boolean,
      observer: '_visibleChanged'
    }
  }}

  _visibleChanged(visible) {
    if (visible) {
      this.dispatchEvent(new CustomEvent('change-section', {
        bubbles: true, composed: true, detail: {title: 'Home'}}));
    }
  }
}

customElements.define(MintHome.is, MintHome);

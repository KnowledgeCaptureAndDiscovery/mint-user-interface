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

class MintGovernHome extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">

      .image-link {
        outline: none;
      }

      .image-link > mint-image::after {
        display: block;
        content: '';
        position: absolute;
        transition-property: opacity;
        transition-duration: 0s;
        transition-delay: 90ms;
        pointer-events: none;
        opacity: 0;
        top: 5px;
        left: 5px;
        right: 5px;
        bottom: 5px;
        outline: #2196F3 auto 5px;
        outline: -moz-mac-focusring auto 5px;
        outline: -webkit-focus-ring-color auto 5px;
      }

      .image-link:focus > mint-image::after {
        opacity: 1;
      }

      .item {
        display: block;
        text-decoration: none;
        text-align: center;
        position: relative;
        /*margin-bottom: 40px;*/
      }

      .item mint-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        opacity: 0.6;
      }

      .item mint-button:hover {
        opacity: 1;
      }

      /*.item:nth-of-type(2),
      .item:nth-of-type(3) {
        display: inline-block;
        width: 50%;
      }*/

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

      /*.item:nth-of-type(2) > h2,
      .item:nth-of-type(3) > h2 {
        font-size: 1.1em;
      }*/

      @media (max-width: 767px) {
        mint-image {
          height: 200px;
        }

        h2 {
          margin: 24px 0;
        }

        .item:nth-of-type(2),
        .item:nth-of-type(3) {
          display: block;
          width: 100%;
        }

        .item:nth-of-type(2) > mint-button > a,
        .item:nth-of-type(3) > mint-button > a {
          padding: 8px 24px;
        }
      }

    </style>

    <template is="dom-repeat" items="[[vocabulary.regions]]" strip-whitespace="">
      <div class="item">
        <a class="image-link" href\$="[[_getLink(item.id)]]">
          <mint-image src="[[item.image]]" alt="[[item.title]]" placeholder-img="[[item.placeholder]]"></mint-image>
        </a>
        <mint-button>
          <a aria-label\$="[[item.label]] Browse CAGs" href\$="[[_getLink(item.id)]]">[[item.label]]</a>
        </mint-button>
      </div>
    </template>
`;
  }

  static get is() { return 'mint-govern-home'; }

  static get properties() {
    return {
      vocabulary: Object
    };
  }

  _getLink(regionid) {
    return "govern/analysis/" + regionid.substring(regionid.lastIndexOf("/")+1);
  }
}
customElements.define(MintGovernHome.is, MintGovernHome);

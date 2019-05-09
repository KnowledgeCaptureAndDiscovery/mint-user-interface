import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="mint-common-styles">
<template>
  <style>

    [hidden] {
      display: none !important;
    }

    header {
      text-align: center;
    }

    header > h1 {
      margin: 0 0 4px 0;
      font-size: 1.3em;
      font-weight: 500;
    }

    header > span {
      color: var(--app-secondary-color);
      font-size: 12px;
    }

    header > mint-button[responsive] {
      margin-top: 20px;
    }

    a {
      color: var(--app-primary-color)
    }

    a:visited {
      color: var(--app-secondary-color)
    }

    a:hover {
      color: var(--app-accent-color)
    }

    .detail {
      /*margin: 32px 16px;
      width: 80%;
      max-width: 1200px;*/
      width: 100%;
      transition: opacity 0.4s;
      opacity: 0;
    }

    .detail[has-content] {
      opacity: 1;
    }

    paper-dialog {
      width:400px;
      max-width: 80%;
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
      background-color: white;
      border: 2px solid var(--app-accent-color);
      border-radius: 4px;
    }

    .heading {
      margin:0px;
      padding: 4px;
      font-size:16px;
      background-color: var(--app-accent-color);
      @apply --layout-horizontal;
      color:white;
    }

    div.grow {
      flex-grow:2;
    }

    .toolbar paper-button,
    .toolbar paper-icon-button {
      max-height: 36px;
      color: white;
    }
    .heading paper-icon-button {
      max-height: 20px;
      padding: 0px;
      color: white;
    }

    mint-map, mint-chart {
      height: 650px !important;
    }

    /* Basic 2-toolbar outer box container for main UI elements */
    .outer {
      position: relative;
      width:100%;
      height: 650px;
      overflow: auto;
      border: 2px solid var(--app-accent-color);
      border-width:0px 2px;
    }
    .toolbar {
      color:white;
      width:100%;
      background-color: var(--app-accent-color);
      border: 2px solid var(--app-accent-color);
      border-radius: 4px 4px 0px 0px;
      @apply --layout-horizontal;
      @apply --layout-no-wrap;
      @apply --layout-center-justified;
    }
    .bottom {
      border-radius: 0px 0px 4px 4px;
    }

    paper-button:hover {
      background-color: var(--app-accent-color);
      color: white;
    }

    paper-button.important {
      border: 1px solid var(--app-accent-color);
      color: var(--app-accent-color);
      background-color: white;
      font-weight: bold;
      margin: 4px;
    }
    paper-button.important:hover {
      background-color: var(--app-accent-color);
      border-color: white;
      color: white;
    }
    paper-button.important_inv {
      border: 1px solid white;
      color: white;
      background-color: var(--app-accent-color);;
      font-weight: bold;
      margin: 4px;
    }
    paper-button.important_inv:hover {
      background-color: white;
      border-color: var(--app-accent-color);;
      color: var(--app-accent-color);;
    }
    /* End of outer box */

    paper-dropdown-menu {
      font-size: inherit;
      --paper-item: {
        font-size: inherit;
      }
      --paper-item-min-height: 32px;
      --paper-input-container-label: {
       font-size:inherit;
      };
      --paper-input-container-input: {
       font-size: inherit;
      }
    }

    paper-input, paper-textarea {
      font-size: inherit;
      --paper-input-container-label: {
        font-size: inherit;
      }
      --paper-input-container-input: {
        font-size: inherit;
      };
      --paper-input-container: {
        padding: 2px;
      }
    }
    vaadin-text-field {
      font-size: inherit;
    }

    vaadin-grid {
      font-size: 12px;
      --vaadin-grid-row-height: 42px;
      --vaadin-grid-header-row-height: 42px;
      --vaadin-grid-row-cell: {
        padding: 0px 10px 0px 10px !important;
        background-color: transparent !important;
      }
      margin:10px;
      background-color: transparent !important;
      border: 1px solid #E3E3E3;
    }

    mint-tabs, mint-tab {
      --mint-tab-overlay: {
        border-bottom: 2px solid var(--app-accent-color);
      };
    }

    mint-tab {
      margin: 0 10px;
    }

    mint-tab a {
      display: inline-block;
      cursor: pointer;
      outline: none;
      padding: 9px 5px;
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      color: var(--app-primary-color);
    }

    @media (max-width: 767px) {

      header > h1 {
        font-size: 1.1em;
      }

      iron-pages {
         padding: 0px 5px !important;
      }

    }

  </style>
</template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/
;

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';

import './mint-common-styles.js';

class MintCSVInput extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">

      input {
        width: 100%;
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        padding: 8px 24px 8px 0;
        border: none;
        background-color: transparent;
        border-radius: 0;
        font-size: 1em;
        font-weight: 300;
        color: var(--app-primary-color);
        overflow: hidden;
        margin: 0;
        outline: none;
      }

      input::-ms-expand {
        display: none;
      }

      /* hide the focus ring in firefox */
      input:focus:-moz-focusring {
        color: transparent;
        text-shadow: 0 0 0 #000;
      }

      .inputfile {
         width: 0.1px;
         height: 0.1px;
         opacity: 0;
         overflow: hidden;
         position: absolute;
         z-index: -1;
       }
       label {
           color: var(--app-primary-color);
           display: inline-block;
           cursor: pointer;
           max-width: 100%;
           text-overflow: ellipsis;
           white-space: nowrap;
           cursor: pointer;
           display: inline-block;
           overflow: hidden;
           outline: none;
       }

       label svg {
           width: 1em;
           height: 1em;
           vertical-align: middle;
           fill: var(--app-primary-color);
           margin-top: -0.25em;
           /* 4px */
           margin-right: 0.25em;
           /* 4px */
       }

       label {
           width: 100%;
           border: 1px solid #DDD;
       }

       label span,
       label strong {
           padding: 0.5rem 0.7rem;
           font-weight: normal;
       }

       label span {
           min-height: 1em;
           display: inline-block;
           text-overflow: ellipsis;
           white-space: nowrap;
           overflow: hidden;
           vertical-align: top;
           color: var(--app-primary-color);
       }

       label strong {
           height: 100%;
           width: 30%;
           color: var(--app-primary-color);
           background-color: #DDD;
           display: inline-block;
       }

       label:hover span,
       label:hover strong {
           color: var(--app-accent-color);;
       }

       @media screen and (max-width: 50em) {
       	/*.inputfile-6 + label strong {
       		display: block;
       	}*/
       }
    </style>

    <label>
      <input id="fileinput" type="file" name="inputfile" accept=".csv" class="inputfile inputfile-6"/>
      <strong>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17">
          <path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4
          2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2
          2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4
          1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path>
        </svg>
        [[label]]
      </strong>
      <span></span>
    </label>
`
  }

  static get is() { return "mint-csv-input"; }

  static get properties() {
    return {
      label: String,
      separator: {
        type: String,
        value: ','
      },
      data: {
        type: Object,
        readOnly: true,
        notify: true
      }
    }
  }

  ready() {
    super.ready();
    var me = this;
    var input = me.$.fileinput;
    var label	 = input.parentNode,
      labelVal = label.innerHTML;
    input.addEventListener( 'change', function( e ) {
      var fileName = '';
      if( this.files && this.files.length > 1 )
        fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
      else
        fileName = e.target.value.split( '\\' ).pop();

      if( fileName ) {
        label.querySelector( 'span' ).innerHTML = fileName;
        var reader = new FileReader();
        reader.readAsText(this.files[0]);
        reader.onload = function( eload ) {
          var csvdata = eload.target.result;
          me._setData(me.parseCSV(csvdata));
        }
      }
      else
        label.innerHTML = labelVal;
    });

    // Firefox bug fix
    input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
    input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
  }

  parseCSV(csvdata) {
    if (csvdata) {
      var data = {headers:[], content:[]};
      var csvRaw = csvdata.split(/\r\n|\r|\n/g);
      var csv = csvRaw.filter(function(el) {
        return !!el;
      });
      data.headers = csv[0].split(this.separator);
      var rowsCnt = csv.length - 1;
      var colsCnt = data.headers.length;
      for (var i = 1; i <= rowsCnt; i++) {
        data.content[i] = this._CSVtoArray(csv[i]);
        if (data.content[i].length < colsCnt) {
          // fill cells with empty strings if thead has more cols than tbody
          for (var j = data.content[i].length; j < colsCnt; j++) {
            data.content[i][j] = '';
          }
        }
        else {
          // cut extra cells if tbody has more cols than thead
          data.content[i].length = colsCnt;
        }
      }
      data.content.splice(0, 1);
      return data;
    }
  }

  // Return array of string values, or NULL if CSV string not well formed.
  _CSVtoArray(text) {
      var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
      var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
      // Return NULL if input string is not well formed CSV string.
      if (!re_valid.test(text)) return null;
      var a = [];                     // Initialize array to receive values.
      text.replace(re_value, // "Walk" the string using replace with callback.
          function(m0, m1, m2, m3) {
              // Remove backslash from \' in single quoted values.
              if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
              // Remove backslash from \" in double quoted values.
              else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
              else if (m3 !== undefined) a.push(m3);
              return ''; // Return empty string.
          });
      // Handle special case of empty last value.
      if (/,\s*$/.test(text)) a.push('');
      return a;
  }

  clear() {
    var input = this.$$("input[type=file]");
    input.value = "";
    var label	 = input.parentNode;
    label.querySelector( 'span' ).innerHTML = "";
    this._setData(null);
  }
}

customElements.define(MintCSVInput.is, MintCSVInput);

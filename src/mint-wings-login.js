import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-icon/iron-icon.js';

import './mint-icons.js';
import './mint-ajax.js';
import './mint-common-styles.js';
import { getResource, postFormResource } from './mint-requests.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

class MintWingsLogin extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">

      paper-button {
        font-size: 12px;
      }
      paper-input {
        font-size: 16px;
        margin:0px;
        --paper-input-container: {
          padding: 2px 0px;
        }
      }
      paper-dialog {
        width:300px;
        max-width: 80%;
      }
      .heading {
        text-align: center;
      }
    </style>

    <template is="dom-if" if="{{!loggedIn}}">
      <paper-button on-tap="_openDialog">
        <iron-icon icon="account-circle"></iron-icon>Login
      </paper-button>
    </template>
    <template is="dom-if" if="{{loggedIn}}">
      <paper-button on-tap="_logout">
        Logout [[userid]]
      </paper-button>
    </template>

    <paper-dialog id="logindialog" on-iron-overlay-opened="_clearDialog" on-iron-overlay-closed="_checkAndLogin">
      <div class="heading">LOGIN</div>
      <paper-input label="Username" value="{{input_userid}}"></paper-input>
      <paper-input label="Password" type="password" value="{{password}}"></paper-input>
      <div class="buttons">
        <paper-button dialog-dismiss="">Cancel</paper-button>
        <paper-button dialog-confirm="" autofocus="">Login</paper-button>
      </div>
    </paper-dialog>
`;
  }

  static get is() { return 'mint-wings-login'; }

  static get properties() {
    return {
      config: {
        type: Object,
        observer: '_login'
      },
      input_userid: String,
      userid: {
        type: String,
        notify: true
      },
      password: String,
      loggedIn: {
        type: Boolean,
        value: false,
        notify: true
      },
      failure: {
        type: Boolean,
        notify: true,
        readOnly: true
      }
    };
  }

  /*static get observers() {
    return [
      '_login(userid, password, server)'
    ],
  }*/

  _clearDialog() {
    this.input_userid = null;
    this.password = null;
  }

  _openDialog() {
    this.$.logindialog.open();
  }

  _checkAndLogin(e) {
    if(e.detail.confirmed)
      this._login();
  }

  _login() {
    var me = this;
    if(!me.config)
      return;

    // FIXME: Dummy login for now:
    /*
    me.input_userid = "admin";
    me.userid = me.input_userid;
    me.loggedIn = true;
    return;
    */

    getResource({
      url: me.config.wings.server + '/login',
      onLoad: function(e) {
        var txt = e.target.responseText;
        if(txt.match(/j_security_check/)) {
          if(!me.input_userid || !me.password)
            return;
          var data = {
            j_username: me.input_userid,
            j_password: me.password
          };
          postFormResource({
            url: me.config.wings.server + '/j_security_check',
            onLoad: function(e2) {
              var txt2 = e2.target.responseText;
              if(txt2.match(/j_security_check/)) {
                console.log("Incorrect Login ?");
                me._setFailure(true);
              }
              else {
                // Success: Logged in
                me.userid = me.input_userid;
                me.loggedIn = true;
                console.log("Success !! Logged in");
              }
            },
            onError: function() {
              //console.log("Cannot login");
              getResource({
                url: me.config.wings.server + '/login',
                onLoad: function(e2) {
                  var match = /USER_ID\s*=\s*"(.+)"\s*;/.exec(e2.target.responseText);
                  if(match) {
                    me.userid = match[1];
                    me.loggedIn = true;
                    //console.log("Logged in as " + me.userid + " !");
                  }
                },
                onError: function(){}
              }, true);
            }
          }, data, true);
        } else {
          var match = /USER_ID\s*=\s*"(.+)"\s*;/.exec(txt);
          if(match) {
            me.userid = match[1];
            me.loggedIn = true;
            //console.log("Logged in as " + me.userid + " !");
          }
        }
      },
      onError: function(e) {
        console.log("Cannot connect to wings");
        this._setFailure(true);
      }
    }, true);
  }

  _logout() {
    var me = this;
    if(!me.config.wings.server)
      return;

    getResource({
      url: me.config.wings.server + '/jsp/login/logout.jsp',
      onLoad: function(e) {
        me.loggedIn = false;
        me.userid = null;
      },
      onError: function(e) {
        me.userid = null;
        me.loggedIn = false;
        //console.log("Could not logout !");
      }
    }, true);
  }

  _setFailure(val) {
    this.failure = true;
  }
}

customElements.define(MintWingsLogin.is, MintWingsLogin);

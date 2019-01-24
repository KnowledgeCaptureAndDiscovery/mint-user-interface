import '@polymer/polymer/polymer-legacy.js';
import '@polymer/app-route/app-route.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/iron-icon/iron-icon.js';

import './mint-icons.js';
import './mint-ajax.js';
import './loading-screen.js';
import './variable-graph.js';
import './mint-common-styles.js';

import { scroll } from '@polymer/app-layout/helpers/helpers.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

class MintResultsDetail extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">
      :host {
        display: block;
      }

      #content {
        @apply(--layout-horizontal);
        @apply(--layout-center-justified);
      }

      h1 {
        font-size: 24px;
        font-weight: 500;
        line-height: 28px;
        margin: 0;
      }

      .grid {
        @apply(--layout-horizontal);
        @apply(--layout-wrap);
        @apply(--layout-center);
        display: flex;
        flex-flow: row wrap;
      }

      .grid > span {
        -webkit-flex: 1 1;
        flex: 1 1;
        -webkit-flex-basis: calc(50% - 5px);
        flex-basis: calc(50% - 5px);
        max-width: calc(50% - 5px);
        padding-right: 5px;
        height: 32px;
        line-height:32px;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .grid > span {
        color: var(--app-secondary-color);
      }

      .section {
        margin-bottom: 5px;
      }

      .section .head {
        color: var(--app-secondary-color);
        font-size: 12px;
        height: 32px;
        line-height:32px;
        font-weight: 500;
        border-bottom: 1px solid #E3E3E3;
      }

      div.detail {
        margin: 10px;
        margin-top: 0px;
        width: calc(100% - 20px);
        opacity: 0;
      }

      .grid iron-icon {
        height: 20px;
      }

      .grid iron-icon.upload {
        color: green;
      }

      @media (max-width: 767px) {
        #content {
          @apply(--layout-vertical);
          @apply(--layout-center);
        }

        .detail {
          box-sizing: border-box;
          margin: 16px 0;
          padding: 0 24px;
          width: 100%;
          max-width: 600px;
        }

        h1 {
          font-size: 20px;
          line-height: 24px;
        }

        .grid > span {
          -webkit-flex-basis: calc(100% - 5px);
          flex-basis: calc(100% - 5px);
          max-width: calc(100% - 5px);
        }

      }

    </style>

    <app-route
        route="[[route]]"
        pattern="/:domain/:runid"
        data="{{routeData}}"></app-route>

    <mint-ajax id="rundetailAjax" method="POST"
      result="{{runDetail}}"></mint-ajax>

    <mint-ajax auto result="{{originalTemplate}}" url="[[_getOriginalTemplateURL(runDetail)]]"></mint-ajax>

    <div id="content">
      <template is="dom-if" if="[[_isDefined(userid)]]">
        <div class="detail" has-content$="[[_isRunDefined(runDetail)]]">
          <h1>Ran the workflow '[[_localName(runDetail.execution.originalTemplateId)]]'
            [[_formatTime(runDetail.execution.runtimeInfo.startTime)]] ago</h1>
          <!--h4>Run Id: [[runid]]</h4-->
          <template is="dom-if" if="[[_isSuccessful(runDetail.execution.runtimeInfo.status)]]">
            <h2>The workflow produced the following data:</h2>
            <div class="section">
              <template is="dom-repeat"
              items="[[_getVariableBindings(runDetail.variables.output, originalTemplate)]]" as="varbinding">
                <div class="head">[[varbinding.variable]]</div>
                <div class="grid">
                    <template is="dom-repeat" items="[[varbinding.bindings]]" as="binding">
                      <span>
                        <template is="dom-if" if="[[binding.value]]">
                          [[binding.value]]
                        </template>
                        <template is="dom-if" if="[[binding.id]]">
                          [[_localName(binding.id)]]
                          <a title="Download"
                            href="[[config.wings.server]]/users/[[userid]]/[[routeData.domain]]/data/fetch?data_id=[[_escape(binding.id)]]"
                            ><iron-icon icon="file-download"></iron-icon></a>
                          <a title="Publish"
                            href="/results/publish/[[routeData.domain]]/[[runid]]/[[varbinding.component]]/[[varbinding.variable]]/[[_localName(binding.id)]]"
                            ><iron-icon class="upload" icon="cloud-upload"></iron-icon></a>
                        </template>
                      </span>
                    </template>
                </div>
              </template>
            </div>
          </template>
          <template is="dom-if" if="[[_isFailed(runDetail.execution.runtimeInfo.status)]]">
            <h2>The workflow failed</h2>
          </template>
          <template is="dom-if" if="[[_isRunning(runDetail.execution.runtimeInfo.status)]]">
            <h2>The workflow is still running</h2>
          </template>
          <h2>The workflow used these inputs:</h2>
          <div class="section">
            <template is="dom-repeat"
            items="[[_getVariableBindings(runDetail.variables.input, originalTemplate)]]" as="varbinding">
              <div class="head">[[varbinding.variable]]</div>
              <div class="grid">
                <template is="dom-repeat" items="[[varbinding.bindings]]" as="binding">
                  <span>
                    <template is="dom-if" if="[[binding.value]]">
                      [[binding.value]]
                    </template>
                    <template is="dom-if" if="[[binding.id]]">
                      [[_localName(binding.id)]]
                      <a title="Download"
                        href="[[config.wings.server]]/users/[[userid]]/[[routeData.domain]]/data/fetch?data_id=[[_escape(binding.id)]]">
                        <iron-icon icon="file-download"></iron-icon>
                      </a>
                    </template>
                  </span>
                </template>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>`;
  }

  static get is() { return 'mint-results-detail'; }

  static get properties() {
    return {
      config: Object,
      userid: String,
      runid: String,
      route: Object,
      routeData: Object,
      failure: Boolean,
      originalTemplate: Object,
      runDetail: Object,
      visible: {
        type: Boolean,
        observer: '_checkVisibility'
      }
    }
  }

  static get observers() {
    return [
      '_fetchResults(config, userid, routeData.domain, runid, visible)',
      '_routePageChanged(routeData.runid)'
    ];
  }

  _getOriginalTemplateURL(run) {
    if(run && run.execution) {
      var turl = run.execution.originalTemplateId;
      turl = turl.replace(/#.+$/, '');
      turl = turl.replace(this.config.wings.internal_server, this.config.wings.server);
      return turl + "?format=json";
    }
  }

  _getVariableBindings(bindings, tpl) {
    if(!bindings || !tpl)
      return bindings;

    var bhash = {}
    var regex = /.+_(\d{4})/;
    for(var i=0; i<bindings.length; i++) {
      var binding = bindings[i];
      var varname = this._localName(binding.derivedFrom);
      var tvarname = this._localName(binding.id);
      var matches;
      if(matches = regex.exec(tvarname)) {
        if(!bhash[varname])
          bhash[varname] = [];
        bhash[varname][parseInt(matches[1])-1] = binding.binding;
      }
      else {
        bhash[varname] = [binding.binding];
      }
    }

    var nbindings = [];
    for(var varname in bhash) {
      nbindings.push({
        variable: varname,
        component: this._getVariableProducer(tpl, varname),
        bindings: bhash[varname]
      })
    }

    nbindings.sort(function(a, b) {
      if(b.bindings.length != a.bindings.length)
        return b.bindings.length - a.bindings.length;
      return b.bindings[0].id ? 1 : -1;
    });
    return nbindings;
  }

  _getVariableProducer(tpl, varname) {
    var gitems = tpl["@graph"];
    var onodeid = null;
    for(var i=0; i<gitems.length; i++) {
      if(gitems[i]["hasVariable"] == "#" + varname) {
        onodeid = gitems[i]["hasOriginNode"];
      }
    }
    if(onodeid) {
      var cvarid = null;
      for(var i=0; i<gitems.length; i++) {
        if(gitems[i]["@id"] == onodeid) {
          cvarid = gitems[i]["hasComponent"];
        }
      }
      if(cvarid) {
        for(var i=0; i<gitems.length; i++) {
          if(gitems[i]["@id"] == cvarid) {
            var cid = gitems[i]["hasComponentBinding"];
            return cid.replace(/^.+#/, '');
          }
        }
      }
    }
    return null;
  }

  _formatTime(ts) {
    var date = new Date(ts*1000); //.toISOString().slice(0,19).replace('T', ' ');
    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
        return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
        return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
        return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
        return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
        return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  }

  _localName(url) {
    return url.replace(/^.*#/, '');
  }

  _routePageChanged(page) {
    if(page) {
      this.runid = page;
      scroll({ top: 0, behavior: 'silent' });
    }
  }

  _isSuccessful(status) {
     return (status == 'SUCCESS');
  }

  _isFailed(status) {
     return (status == 'FAILURE');
  }

  _isRunning(status) {
     return (status == 'RUNNING');
  }

  _checkVisibility(visible) {
    /*if (!visible)
      this.runDetail = null;*/
  }

  _escape(url) {
    return escape(url);
  }

  _fetchResults(config, userid, domain, runid, visible) {
    //this.runDetail = null;
    if(config && userid && domain && runid && visible) {
      var runurl = this._getExportUrl(config.wings.internal_server, userid, domain, runid);
      this.$.rundetailAjax.data = "run_id=" + escape(runurl);
      this.$.rundetailAjax.url= this._getRequestUrl(config.wings.server, userid, domain) + "getRunDetails";
      this.$.rundetailAjax.fetch();
      this._setupReloadTimer();
    }
    else {
      this.runDetail = {};
    }
  }

  _setupReloadTimer() {
    var me = this;
    window.setTimeout(function() {
      if(me.userid && me.visible &&
          (!me.runDetail ||
            (me.runDetail && me._isRunning(me.runDetail.execution.runtimeInfo.status))
          )) {
        //console.log("Refreshing run details");
        me.$.rundetailAjax.refresh();
        me._setupReloadTimer();
      }
    }, 30000);
  }

  _localName(url) {
    if(url != null)
      return url.replace(/^.*#/, '');
  }

  _isRunDefined(run) {
    return run && run.execution && run.execution.originalTemplateId != null;
  }

  _isDefined(item) {
    return item != null;
  }

  _getRequestUrl(server, userid, domain) {
    return server + "/users/" + userid +  "/" + domain + "/executions/";
  }

  _getExportUrl(server, userid, domain, runid) {
    return server + "/export/users/" + userid +  "/" + domain + "/executions/"
      + runid + ".owl#" + runid;
  }
}

customElements.define(MintResultsDetail.is, MintResultsDetail);

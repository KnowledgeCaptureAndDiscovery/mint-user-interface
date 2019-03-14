import '@polymer/polymer/polymer-legacy.js';
import '@polymer/app-route/app-route.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/iron-ajax/iron-ajax.js';


import './mint-icons.js';
import './mint-ajax.js';
import './loading-screen.js';
import './variable-graph.js';
import './mint-common-styles.js';

import { scroll } from '@polymer/app-layout/helpers/helpers.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@vaadin/vaadin-grid/theme/material/vaadin-grid.js';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-column.js';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-tree-column.js';
import '@vaadin/vaadin-grid/theme/material/vaadin-grid-selection-column.js';
import '@vaadin/vaadin-tabs/vaadin-tab.js';
import '@vaadin/vaadin-tabs/vaadin-tabs.js';

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

      iron-icon {
        height: 20px;
      }

      iron-icon.upload {
        color: green;
      }

      h2 {
        font-size: 12px;
        text-transform: uppercase;
        padding: 5px;
        margin-bottom:0px;
      }

      h3 {
        background-color: var(--app-primary-color);
        color: #DDD;
        font-size: 12px;
        text-transform: uppercase;
        padding: 5px;
        margin-bottom:0px;
      }

      .scroller {
        padding: 10px;
        font-size: 12px;
      }

      .varbindings {
        display: grid;
        grid-template-columns: 0.3fr 1fr;
        border: 1px solid #DDD;
        border-top: 0px;
        font-size: 12px;
      }
      .varbindings > div {
        padding: 5px;
      }
      .varbindings .variable {
        background-color: #DDD;
        border-bottom: 1px solid #CCC;
      }
      .varbindings .binding {
        display: flex;
        flex-flow: column;
        border-bottom: 1px solid #DDD;
      }
      .varbindings > div.binding:last-child {
        border-bottom: 0px;
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
      
    <mint-ajax id="runpublishAjax" method="POST"
    result="{{runPublisher}}"></mint-ajax>

    <iron-ajax 
    id="getRemoteURL" 
    url="[[getProvenanceQuery]]"
    handle-as="json"
    last-response="{{endpointData}}">
    </iron-ajax>

    <mint-ajax auto result="{{seededTemplate}}" url="[[_getOriginalTemplateURL(runDetail)]]"></mint-ajax>
    <!-- Top toolbar -->
    <div class="toolbar">
      <paper-button>Workflow Execution : [[_localName(runDetail.execution.originalTemplateId)]]</paper-button>
      <paper-button>Register Provenance Trace</paper-button>
    </div>
    
     
    
    <div id="form" class="outer">
      <vaadin-tabs selected="{{page}}" theme="small">
        <vaadin-tab>Data</vaadin-tab>
        <vaadin-tab>Run Log</vaadin-tab>
       
      </vaadin-tabs>

      <iron-pages selected="[[page]]">
        <page>
          <i>In order to visualize a result or save it beyond this session,
          please click on the cloud icon <iron-icon class="upload" icon="cloud-upload"></iron-icon> to archive it in the Data Catalog</i>
          <!-- Data Section -->
          <template is="dom-repeat"
            items="[[_getAllVariableBindings(runDetail.variables, hashedTemplate)]]" as="iobinding">
            <h3>[[iobinding.type]]</h3>
            <div class="varbindings">
              <template is="dom-repeat" items="[[iobinding.varbindings]]" as="varbinding">
                <div class="variable">[[varbinding.variable]]</div>
                <div class="binding">
                  <template is="dom-repeat" items="[[varbinding.bindings]]" as="binding">
                    <div class="bindingitem">
                      <template is="dom-if" if="[[binding.value]]">
                        [[binding.value]]
                      </template>
                      <template is="dom-if" if="[[binding.id]]">
                        [[_localName(binding.id)]]
                        <a title="Download"
                          href="[[config.wings.server]]/users/[[userid]]/[[routeData.domain]]/data/fetch?data_id=[[_escape(binding.id)]]"
                          ><iron-icon icon="file-download"></iron-icon></a>
                        <template is="dom-if" if="[[!_isEqual(iobinding.type, 'Inputs')]]">
                        <a value=[[_escape(binding.id)]] title="Publish" href="javascript:void(0)" icon="upload"  on-click="checkProvenanceTrace"><iron-icon class="upload" icon="cloud-upload"></iron-icon></a>
                            <paper-dialog id="actions1">
                                <p>Registering the dataset will automatically register the provenance trace. Are you sure?</p>
                            <div class="buttons">
                            <paper-button on-click="registerDataset" autofocus ">Yes</paper-button></a>
                            <paper-button dialog-dismiss>N0</paper-button>
                            </div>
                            </paper-dialog>
                      
                          <a title="Publish"
                            href="/results/publish/[[routeData.domain]]/[[runid]]/[[varbinding.component]]/[[varbinding.variable]]/[[varbinding.vartype]]/[[_localName(binding.id)]]"
                            &gt;
                            <iron-icon class="upload" icon="cloud-upload"></iron-icon></a>
                        </template>
                      </template>
                    </div>
                  </template>
                </div>
              </template>
            </div>
          </template>
        </page>

        <page>
</paper-dialog>
        
          <!-- Run Log -->
          <div class="scroller">
            <pre>[[_getRunLog(runDetail.execution)]]</pre>
          </div>
        </page>
      </iron-pages>
    </div>
    <!-- Bottom toolbar -->
    <div class="toolbar bottom">
      <paper-button>&nbsp;</paper-button>
    </div>
    `;
    }

    static get is() { return 'mint-results-detail'; }

    static get properties() {
        return {
            config: Object,
            userid: String,
            runid: String,
            route: Object,
            dataid: String,
            routeData: Object,
            failure: Boolean,
            seededTemplate: Object,
            provenanceServer: {
              type: String,
              value: "http://www.opmw.org/export/resource/WorkflowExecutionArtifact/"
            },
            endpointFuseki: {
              type: String,
              value: "http://ontosoft.isi.edu:3030/provenance/query"
            },
            getProvenanceQuery: {
              type: String,
              value: "http://ontosoft.isi.edu:8001/api/mintproject/MINT-ProvenanceQueries/getPublishUri"
            },
            hashedTemplate: {
                type: Object,
                computed: '_hashTemplate(seededTemplate)'
            },
            endpointData: {
              type: Object,
              observer: '_redirectUpload'
            },            
            runDetail: Object,
            runPublisher: {
              type: Object,
              observer: '_publishReady'
            },
            visible: {
                type: Boolean,
                observer: '_checkVisibility'
            }
        }
    }

    static get observers() {
        return [
            '_fetchResults(config, userid, routeData.domain, runid, visible)',
            '_routePageChanged(routeData.runid)',
        ];
    }

    _getOriginalTemplateURL(run) {
        if(run && run.execution) {
            var turl = run.execution.seededTemplateId;
            turl = turl.replace(/#.+$/, '');
            turl = turl.replace(this.config.wings.internal_server, this.config.wings.server);
            return turl + "?format=json";
        }
    }

    _hashTemplate(tpl) {
        var hash = {};
        var gitems = tpl["@graph"];
        for(var i=0; i<gitems.length; i++) {
            var id = gitems[i]["@id"];
            hash[id] = gitems[i];
        }
        return hash;
    }

    _isEqual(a, b) { return a == b; }

    _getAllVariableBindings(variables, tpl) {
        if(variables && tpl) {
            return [
                {
                    type: "Output Files",
                    varbindings: this._getVariableBindings(variables.output, tpl)
                },
                {
                    type: "Intermediate Files",
                    varbindings: this._getVariableBindings(variables.intermediate, tpl)
                },
                {
                    type: "Inputs",
                    varbindings: this._getVariableBindings(variables.input, tpl)
                }
            ];
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
                vartype: this._getVariableType(tpl, varname),
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
        var onodeid = null;
        for(var id in tpl) {
            if(tpl[id]["hasVariable"] == "#" + varname) {
                onodeid = tpl[id]["hasOriginNode"];
            }
        }
        if(onodeid) {
            var cvarid = tpl[onodeid]["hasComponent"];
            if(cvarid) {
                var cid = tpl[cvarid]["hasComponentBinding"];
                return cid.replace(/^.+#/, '');
            }
        }
        return null;
    }

    _getVariableType(tpl, varname) {
        var varitem = tpl["#"+varname];
        if(varitem) {
            var type = varitem["@type"];
            if(Array.isArray(type)) {
                for(var i=0; i<type.length; i++) {
                    if(!type[i].match(/(Data|Parameter)Variable/)) {
                        type = type[i];
                        break;
                    }
                }
            }
            return type.replace(/^.+#/, '');
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

    _getRunLog(exec) {
        if(!exec)
            return;
        var log = "";
        exec.queue.steps.sort(function(a, b) {
            if (a.runtimeInfo.startTime != b.runtimeInfo.startTime) {
                return a.runtimeInfo.startTime > b.runtimeInfo.startTime ? 1 : -1;
            } else if (a.runtimeInfo.endTime == null)
                return 1;
            else if (b.runtimeInfo.endTime == null)
                return -1;
            else return a.runtimeInfo.endTime > b.runtimeInfo.endTime ? 1 :
                    a.runtimeInfo.endTime < b.runtimeInfo.endTime ? -1 : 0;
        });
        for (var i = 0; i < exec.queue.steps.length; i++) {
            var step = exec.queue.steps[i];
            if (step.runtimeInfo.status != 'WAITING' &&
                step.runtimeInfo.status != 'QUEUED') {
                log += "=====================================\n";
                log += "[ JOB: " + this._localName(step.id) + " ]";
                log += "\n[ STARTED: " + new Date(step.runtimeInfo.startTime * 1000) + " ]";
                if (step.runtimeInfo.endTime) {
                    log += "\n[ ENDED: " + new Date(step.runtimeInfo.endTime * 1000) + " ]";
                }
                log += "\n[ STATUS: " + step.runtimeInfo.status + " ]\n";
                log += "=====================================\n";
                log += step.runtimeInfo.log + "\n";
            }
        }
        log += exec.runtimeInfo.log;
        return log;
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
        return encodeURIComponent(url);
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
        return run && run.execution && run.execution.seededTemplateId != null;
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
    
    //open modal and get the daid
    checkProvenanceTrace(e){
        this.dataid = this._localName(decodeURIComponent(e.currentTarget.value))
        this.shadowRoot.querySelector('#actions1').open()
    }
    //go to grlc and query the remote url
    //todo: get provencanceServer and endponintFuseki from config
    _publishReady(){
      var fileURI = this.provenanceServer + this.runid + '_' + this.dataid
      var params = {exec: fileURI, endpoint: this.endpointFuseki};
      this.$.getRemoteURL.params = params
      this.$.getRemoteURL.generateRequest();
    }

    //When we get the information about the remote url, redirect
    _redirectUpload(){
      var url = window.location.href.replace('results/detail/','results/publish/')
      if (this.endpointData["results"]["bindings"] == 0 ){
        window.location.replace(url);
      }
      var value = this.endpointData["results"]["bindings"][0]["result"].value
      url = url + "?remoteURL=" + value
      window.location.replace(url);
    }

    //Run the method publish run of WINGS
    registerDataset(){
      var runurl = this._getRequestUrl(this.config.wings.server, this.userid, this.domain) + "publishRun";
      this.$.runpublishAjax.url = runurl;
      this.$.runpublishAjax.method = "GET"
      this.$.runpublishAjax.raw = true
      this.$.runpublishAjax.fetch();
    }
}

customElements.define(MintResultsDetail.is, MintResultsDetail);

/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import '@polymer/app-route/app-route.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-radio-group/paper-radio-group.js';
import '@polymer/paper-radio-button/paper-radio-button.js';
import '@danielturner/google-map/google-map.js';

import './google-map-data-layer.js';
import './mint-common-styles.js';
import './mint-button.js';
import './mint-icons.js';
import './mint-simple-question-creator.js';
import './mint-task-creator.js';
import { deleteResource, putJSONResource, postJSONResource } from './mint-requests.js';

import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce.js';
import { microTask } from '@polymer/polymer/lib/utils/async.js';
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';

class MintGovernAnalysis extends PolymerElement {
  static get template() {
    return html`
    <style include="mint-common-styles">
      #map {
        width:140px;
        height:140px;
      }
      .map {
        width: 140px;
        height: 140px;
        margin-left: 10px;
        border: 1px solid #638a40;
        border-radius: 2px;
        /*
        border: 2px solid var(--app-primary-color);
        border-radius: 4px;
        margin: 5px 0px;*/
      }
      .description {
        margin: 0px;
        margin-left: 15px;
        vertical-align: top;
        height: 140px;
        overflow: auto;
      }
      .content {
        @apply --layout-horizontal;
        margin-bottom: 10px;
      }
      .dashboard {
        display: grid;
        grid-gap: 10px;
        width: 100%;
        grid-template-columns: 1fr 1fr 1fr 1fr;
      }
      .panel {
        background-color: #EEE;
        border-radius: 2px;
      }
      .panel legend.panel_heading {
        font-size: 12px;
        display: flex;
        flex-flow: row;
        text-align: center;
        text-transform: uppercase;
        /*padding-left: 15px;
        font-size: 14px;*/
      }
      .panel .title {
        left: 0;
        font-weight: bold;
      }
      .panel .add_button, .panel .delete_button {
        /*font-weight:lighter*/;
        font-size: 10px;
      }
      .panel .add_button {
        margin-left: 10px;
      }
      .panel .add_button,
      .panel .edit_button,
      .panel .delete_button {
        padding: 0px;
      }
      .panel .buttons {
        display: flex;
        flex-flow: column;
        align-items: stretch;
        margin: 5px;
      }
      .panel .buttons .button {
        min-width: 50px;
        margin: 2px;
        padding: 5px;
        line-height: 18px;
        background-color: #DDD;
        font-size: 13px;
        /*max-width: 250px;*/
        text-decoration: none;
        color:inherit;
        border-radius: 2px;
      }
      .admin_region {
        margin-top: 10px;
        text-transform: uppercase;
        writing-mode: vertical-rl;
        text-orientation: upright;
        font-size: 14px;
        font-weight: bold;
        padding : 4px;
        margin-right: 10px;
        background-color: #EEE;
        border: 1px solid #999;
        border-radius: 2px;
      }
      fieldset.panel {
        padding: 2px;
      }
      fieldset.panel legend {
        display: flex;
        flex-flow: row;
        align-items: center;
      }
      .region_information {
        grid-column: 1 / 4;
      }
      .region_exploration {
        grid-column: 4 / 5;
      }
      .region_exploration,
      .region_information {
        background-color:#e5efdb;
        border: 1px solid #638a40;
      }
      .region_exploration .buttons .button {
        background-color: #cadeb8;
        border: 1px solid #638a40;
      }
      .region_exploration .buttons a.button:hover {
        background-color: #638a40;
        color:white;
      }
      .question {
        grid-column: 1 / 3;
        background-color: #fdf2d0;
        border: 1px solid #c69908;
      }
      .question .buttons .button {
        background-color: #fbe6a3;
        border: 1px solid #c69908;
      }
      .question .buttons a.button:hover,
      .question .buttons a.selected {
        background-color: #c69908;
        color:white;
      }
      .questions_list {
        max-height: 300px;
        overflow:auto;
      }
      .question a div {
        white-space: nowrap;
      }
      .question paper-icon-button {
        flex-shrink: 0;
        flex-grow: 0;
        margin-left: 5px;
        --paper-icon-button: {
          height:16px;
          width:16px;
        }
        --paper-icon-button-hover: {
          color: var(--app-accent-color);
        }
      }
      .question paper-icon-button.delete_button {
        --paper-icon-button-hover: {
          color: maroon;
        }
      }
      .question .buttons a {
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
      }
      .panel .buttons a.selected {
        font-weight: bold;
      }
      .task {
        grid-column: 3 / 4;
        background-color: #dce3f2;
        border: 1px solid #385995;
      }
      .task .buttons .button {
        background-color: #b7c7e4;
        border: 1px solid #385995;
      }
      .task .buttons a.button:hover,
      .task .buttons a.selected {
        background-color: #385995;
        color:white;
      }
      .task .buttons .task_done {
        color: green;
        font-weight: bold;
      }
      .activity {
        grid-column: 4 / 5;
        background-color: #f7e6d8;
        border: 1px solid #b1631f;
      }
      .activity .buttons .button {
        background-color: #f1cfb1;
        border: 1px solid #b1631f;
      }
      .activity .buttons a.button:hover {
        background-color: #b1631f;
        color:white;
      }
      .activity .buttons .activity_done {
        color: green;
        font-weight: bold;
      }
      .activity .buttons .activity_optional {
        opacity: 0.7;
      }
      .history {
        grid-column: 1 / 5;
        border: 1px solid #999999;
      }
      .history .scroller {
        display: flex;
        align-content: stretch;
        flex-flow: row;
        padding: 0px;
        /*background-color: white;*/
        font-size: 13px;
        overflow-y: scroll;
        max-height: 400px;
        word-break: break-word;
      }

      .left, .middle, .right {
        padding: 10px;
        width: calc(100% - 30px);
        margin-right: 10px;
        background-color: white;
        border-radius: 5px;
        border: 1px solid #DDD;
      }
      .scroller b {
        font-size: 12px;
        color: var(--app-accent-color);
      }
      .right {
        margin-right: 0px;
      }

      a.button iron-icon {
        width: 16px;
        height: 16px;
      }
      .add_button iron-icon {
        width: 16px;
        height: 16px;
      }

      paper-dialog {
        width:800px;
      }
      mint-simple-question-creator, mint-task-creator {
        padding: 0px;
        margin: 0px;
      }
      paper-dialog.question {
        background-color: #fdf2d0;
      }
      paper-dialog.question .heading {
        background-color: #fbe6a3;
        color: var(--app-primary-color);
        font-weight: bold;
        font-size: 14px;
        border-bottom: 1px solid #c69908;
      }
      paper-dialog.question .heading paper-icon-button {
        color: var(--app-primary-color);
      }

      paper-dialog.task {
        background-color: #dce3f2;
      }
      paper-dialog.task .heading {
        background-color: #b7c7e4;
        color: var(--app-primary-color);
        font-weight: bold;
        font-size: 14px;
        border-bottom: 1px solid #385995;
      }
      paper-dialog.task .heading paper-icon-button {
        color: var(--app-primary-color);
      }

      .history .scroller {
        padding: 10px;
      }
      .scroller ul {
        margin: 5px;
        padding-left: 20px;
      }
      .scroller ul li {
        margin: 0px;
        color: #999;
      }
      .scroller b {
        font-size: 12px;
      }
      paper-button.important {
        margin-left: 25px;
        margin-bottom: 10px;
      }
      span.variables {
        font-style: italic;
        font-weight: lighter;
        font-size: 10px;
      }

      @media (max-width: 767px) {
        .dashboard {
          display: block;
        }
        .panel {
          margin: 0px;
          margin-bottom: 10px;
          padding: 0 5px;
        }
        .admin_region {
          display: none;
        }
        .history .scroller {
          display: flex;
          flex-flow: column;
          align-items: stretch;
          padding: 5px;
        }
        .history .scroller div {
          margin-bottom: 5px;
        }
        .left, .middle, .right {
          margin-right: 0px;
          width: calc(100% - 20px);
        }
      }
    </style>

    <!--
      app-route provides the name of the region.
    -->
    <app-route route="[[route]]" pattern="/:regionid" tail="{{subroute}}"
      data="{{routeData}}"></app-route>
    <app-route route="[[subroute]]" pattern="/:questionid" tail="{{subroute2}}"
      data="{{qrouteData}}"></app-route>
    <app-route route="[[subroute2]]" pattern="/:taskid"
      data="{{trouteData}}"></app-route>

    <template is="dom-if" if="[[visible]]">
      <template is="dom-if" if="[[userid]]">
        <template is="dom-if" if="[[region]]">
          <iron-ajax auto
            url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/cag"
            handle-as="json" last-response="{{graphData}}"></iron-ajax>
          <iron-ajax auto=""
            url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions"
            handle-as="json" last-response="{{questions}}"></iron-ajax>
        </template>
        <template is="dom-if" if="[[questionid]]">
          <iron-ajax auto=""
            url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[questionid]]/tasks"
            handle-as="json" last-response="{{tasks}}"></iron-ajax>
          <iron-ajax auto
            url="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[questionid]]/data"
            handle-as="json" last-response="{{dataSpecs}}"></iron-ajax>
        </template>
      </template>
    </template>

    <!-- New Question Dialog -->
    <paper-dialog id="question_creator_dialog" class="question">
      <div class="heading">
        <div>Create a Question</div>
        <div class="grow">&nbsp;</div>
        <paper-icon-button icon="close" on-click="_closeQuestionCreator"></paper-icon-button>
      </div>

      <mint-simple-question-creator id="question_creator" question="{{newQuestion}}"
        region="[[region]]" userid="[[userid]]" config="[[config]]"
        vocabulary="[[vocabulary]]"></mint-simple-question-creator>

      <paper-button class="important" on-tap="_addQuestion">OK</paper-button>
    </paper-dialog>

    <!-- New Task Creator -->
    <paper-dialog id="task_creator_dialog" class="task">
      <div class="heading">
        <div>Create a Task</div>
        <div class="grow">&nbsp;</div>
        <paper-icon-button icon="close" on-click="_closeTaskCreator"></paper-icon-button>
      </div>

      <mint-task-creator id="task_creator" task="{{newTask}}" vocabulary="[[vocabulary]]"></mint-task-creator>

      <paper-button class="important" on-tap="_addTask">OK</paper-button>
    </paper-dialog>

    <!-- GOVERN /dashboard -->
    <div class="dashboard">
      <!-- Region Exploration Panel -->
      <fieldset class="panel region_information">
        <legend align="center"class="panel_heading">
          <div class="title">
            Region Information
          </div>
        </legend>

        <div class="content">
          <!-- Map -->
          <div class="map">
            <template is="dom-if" if="[[visible]]">
              <google-map id="map" api-key="AIzaSyAuaqVMFvr8yEr9WzFEDg0veeOQ2HDwoHU" disable-default-ui=""
                  latitude="[[region.latitude]]" longitude="[[region.longitude]]"
                  zoom="[[region.zoom]]" styles="[[mapStyles]]">
                <google-map-data-layer url="[[_createGeoJsonURL(region, visible)]]"></google-map-data-layer>
                <google-map-data-layer url="[[_createGeoJsonURL(questionRegion, visible)]]"></google-map-data-layer>
              </google-map>
            </template>
          </div>
          <!-- Description-->
          <div class="description">
            [[region.description]]
          </div>
        </div>
      </fieldset>

      <fieldset class="panel region_exploration">
        <legend align="center"class="panel_heading">
          <div class="title">
            Region Exploration
          </div>
        </legend>

        <div class="buttons">
          <a class="button" href="data/browse/[[routeData.regionid]]">Browse data</a>
          <a class="button" href="workflow/list/[[routeData.regionid]]/DATA_GENERATION">Generate new data</a>
          <template is="dom-if" if="[[graphData]]">
            <a class="button" href="govern/cag/[[routeData.regionid]]/browse">Browse CAG</a>
          </template>
          <a class="button" href="govern/loadcag/[[routeData.regionid]]">Load New CAG</a>
        </div>
      </fieldset>

      <!-- Question Panel -->
      <fieldset class="panel question">
        <legend align="center" class="panel_heading">
          <span class="title">
            Questions
          </span>
          <paper-button class="add_button" on-click="_openQuestionCreator">
            <iron-icon icon="add"></iron-icon> Add new question
          </paper-button>
        </legend>
        <div class="questions_list">
          <div class="buttons">
            <template is="dom-repeat" items="[[questions]]">
              <a class\$="[[_getQuestionClass(item, questionid)]]"
                href="/govern/analysis/[[_getLocalName(region.id)]]/[[_getLocalName(item.id)]]">[[item.label]]
                <div>
                  <paper-icon-button class="edit_button" on-tap="_editQuestion" icon="edit"></paper-icon-button>
                  <paper-icon-button class="delete_button" on-tap="_deleteQuestion" icon="cancel"></paper-icon-button>
                </div>
              </a>
            </template>
          </div>
        </div>
      </fieldset>

      <!-- Task Panel -->
      <fieldset class="panel task">
        <legend align="center"class="panel_heading">
          <div class="title">
            Tasks
          </div>
          <!--
          <template is="dom-if" if="[[questionid]]">
            <div class="add_button">
              <paper-button on-click="_openTaskCreator">+ Add new task</paper-button>
            </div>
            <template is="dom-if" if="[[taskid]]">
              <div class="delete_button">
                <paper-button on-click="_deleteTask">- Delete task</paper-button>
              </div>
            </template>
          </template>
          -->
        </legend>
        <div class="buttons">
          <template is="dom-if" if="[[questionid]]">
            <template is="dom-repeat" items="[[tasks]]">
              <a class\$="[[_getTaskClass(item, taskid)]]" href="/govern/analysis/[[_getLocalName(region.id)]]/[[questionid]]/[[_getLocalName(item.id)]]">
                <template is="dom-if" if="[[_isTaskDone(item)]]">
                  <iron-icon icon="check"></iron-icon>
                </template>
                <template is="dom-if" if="[[_isTaskPartlyDone(item)]]">
                  <iron-icon icon="hourglass-empty"></iron-icon>
                </template>
                [[item.label]]
              </a>
            </template>
          </template>
        </div>
      </fieldset>

      <!-- Activity Panel -->
      <fieldset class="panel activity">
        <legend align="center"class="panel_heading">
          <div class="title">
            Activities
          </div>
        </legend>
        <template is="dom-if" if="[[_notNull(task)]]">
          <div class="buttons">
            <template is="dom-if" if="[[questionid]]">
              <template is="dom-repeat" items="[[taskActivities]]">
                <a class\$="[[_getActivityClass(item)]]" href="[[_getActivityLink(item.link, region, questionid, taskid)]]">
                  <template is="dom-if" if="[[_isActivityDone(item)]]">
                    <iron-icon icon="check"></iron-icon>
                  </template>
                  [[item.label]]
                </a>
              </template>
            </template>
          </div>
        </template>
      </fieldset>

      <!-- Information Panel (TODO) -->
      <template is="dom-if" if="[[questionid]]">
        <fieldset class="panel history">
          <legend align="center"class="panel_heading">
            <div class="title">
              Your Selections
            </div>
            <a target="_blank" class="mint-button"
              href="[[config.server]]/users/[[userid]]/regions/[[routeData.regionid]]/questions/[[qrouteData.questionid]]/selections">
              <iron-icon icon="file-download"></iron-icon> Download</a>
          </legend>
          <div>
            <div class="scroller">
              <div class="left">
                <b>SUB REGION</b>
                <ul>
                  <template is="dom-if" if="[[questionRegion]]">
                    <li>[[questionRegion.label]]</li>
                  </template>
                </ul>

                <b>DRIVING VARIABLES</b>
                <ul>
                  <template is="dom-repeat" items="[[question.drivingVariables]]">
                    <li>[[_getVariableDetail(item, graphData)]]</li>
                  </template>
                </ul>

                <b>RESPONSE VARIABLES:</b>
                <ul>
                  <template is="dom-repeat" items="[[question.responseVariables]]">
                    <li>[[_getVariableDetail(item, graphData)]]</li>
                  </template>
                </ul>
              </div>
              <div class="middle">
                <b>DATASETS:</b>
                <ul>
                  <template is="dom-repeat" items="[[dataSpecs]]" as="dataSpec">
                    <template is="dom-repeat" items="[[dataSpec.ensemble]]" as="ensemble">
                      <template is="dom-repeat" items="[[ensemble.datasets]]" as="dataset">
                      <li>
                        <div class="dataset">
                          [[dataset.name]]
                        </div>
                      </li>
                      </template>
                    </template>
                  </template>
                </ul>

                <b>MODELS:</b>
                <ul>
                  <template is="dom-repeat" items="[[question.models]]">
                    <li>[[_getModelDetail(item, vocabulary)]]</li>
                  </template>
                </ul>
              </div>

              <div class="right">
                <b>WORKFLOWS:</b>
                <ul>
                  <template is="dom-if" if="[[workflow]]">
                    <li>[[_getWorkflowDetail(workflow)]]</li>
                  </template>
                </ul>

                <b>RUNS:</b>
                <ul>
                  <template is="dom-if" if="[[run]]">
                    <li>[[_getRunDetail(run)]]</li>
                  </template>
                </ul>
              </div>
            </div>
          </div>
        </fieldset>
      </template>
    </div>
`;
  }

  static get is() { return 'mint-govern-analysis'; }

  static get properties() {
    return {
      config: Object,
      userid: String,

      questionid: String,
      questions: Array,
      question: {
        type: Object,
        notify: true,
        computed: '_getQuestionObject(questions, questionid)'
      },
      questionRegion: {
        type: Object,
        computed: '_getQuestionRegion(region, question)'
      },
      graphData: Object,
      newQuestion: Object,

      taskid: String,
      tasks: Array,
      task: {
        type: Object,
        notify: true,
        computed: '_getTaskObject(tasks, taskid)'
      },
      taskActivities: {
        type: Array,
        notify: true,
        computed: '_getTaskActivities(vocabulary, task)'
      },
      newTask: Object,

      vocabulary: Object,

      region: {
        type: Object,
        notify: true
      },

      dsid: {
        type: String,
        computed: '_getDSId(tasks)'
      },
      workflow: {
        type: String,
        computed: '_getWorkflow(tasks)'
      },
      run: {
        type: String,
        computed: '_getRun(tasks)'
      },
      dataSpecs: Array,

      route: Object,
      routeData: Object,
      qrouteData: {
        type: Object,
        observer: '_qrouteDataChanged'
      },
      trouteData: {
        type: Object,
        observer: '_trouteDataChanged'
      },
      visible: Boolean,

      geoJsonURL: String,
      mapStyles: {
        type: String,
        value:[{"featureType":"landscape","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"stylers":[{"hue":"#00aaff"},{"saturation":-100},{"gamma":2.15},{"lightness":12}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"visibility":"on"},{"lightness":24}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":57}]}]
      }
    };
  }

  static get observers() {
    return [
      '_routeDataChanged(routeData, vocabulary)'
    ]
  }

  _routeDataChanged(rd, vocabulary) {
    if(rd && vocabulary && vocabulary.regions) {
      // Region changed
      if(rd.regionid) {
        // No change in region ?
        if(this.region && (rd.regionid == this._getLocalName(this.region.id))) {
          // Check if this page was called again after updating application state
          var state = window.history.state;
          if(state) {
            if(state.task && this.tasks) {
              this._updateTaskList(state.task);
            }
            if(state.question && this.questions) {
              this._updateQuestionList(state.question);
            }
            if(state.dataSpecs) {
              this.set("dataSpecs", state.dataSpecs);
            }
            if(state.cag) {
              this.set("graphData", state.cag);
            }
            // Reset history state
            window.history.pushState({}, null);
          }

          if(!this.subroute.path) {
            this.set("questionid", null);
            this.set("taskid", null);
          }
          else if(!this.subroute2.path) {
            this.set("taskid", null);
          }
          return;
        }

        // Fetch region object from vocabulary
        for(var i=0; i<vocabulary.regions.length; i++) {
          var region = vocabulary.regions[i];
          if(rd.regionid == this._getLocalName(region.id)) {
            var region = Object.assign({}, region);
            this.set("region", region);
          }
        }
      }
    }
  }

  _updateTaskList(task) {
    var newtasks = [];
    for(var i=0; i<this.tasks.length; i++) {
      newtasks[i] = this.tasks[i];
      if(this.tasks[i].id == task.id) {
        newtasks[i] = task;
      }
    }
    this.set("tasks", newtasks);
  }

  _updateQuestionList(question) {
    var newquestions = [];
    for(var i=0; i<this.questions.length; i++) {
      newquestions[i] = this.questions[i];
      if(this.questions[i].id == question.id) {
        newquestions[i] = question;
      }
    }
    this.set("questions", newquestions);
  }

  _qrouteDataChanged(rd) {
    // Question changed
    if(rd.questionid) {
      // No change in question ?
      if(this.question && (rd.questionid == this.questionid))
        return;
      // Change question id
      this.set("questionid", rd.questionid);
    }
  }

  _trouteDataChanged(rd) {
    // Task changed
    if(rd.taskid) {
      // No change in task ?
      if(this.task && (rd.taskid == this._getLocalName(this.task.id)))
        return;
      // Change task id
      this.set("taskid", rd.taskid);
    }
  }

  _getListItems(govern) {
    // Return placeholder govern when the govern haven't loaded yet.
    return govern || [];
  }

  _notNull(item) {
    return item != null;
  }

  _isNull(item) {
    return item == null;
  }

  _isEmptyQuestion(question) {
    console.log(question);
    if(!question || !question.label || !question.region)
      return true;
    return false;
  }

  _getVariableDetail(varid, graphData) {
    if(varid && graphData) {
      var v = this._getGraphVariable(varid, graphData);
      if(v) {
        return v.label + " (" + (v.standard_names?v.standard_names.join(", "):'') + ")";
      }
    }
  }

  _getModelDetail(modelid, vocabulary) {
    if(modelid && vocabulary) {
      for(var i=0; i<vocabulary.models.length; i++) {
        if(vocabulary.models[i].id == modelid) {
          var m = vocabulary.models[i];
          return this._getLocalName(m.id) + " (" + m.label + ")";
        }
      }
    }
  }

  _getWorkflowDetail(workflow) {
    return workflow.name;
  }

  _getRunDetail(run) {
    return run.name;
  }

  _getGraphVariable(varid, graphData) {
    for(var i=0; i<graphData.variables.length; i++) {
      var v = graphData.variables[i];
      if(v.id == varid) {
        return v;
      }
    }
  }

  _getStandardNames(varids, graphData) {
    var varnames = [];
    for(var i=0; i<graphData.variables.length; i++) {
      var v = graphData.variables[i];
      for(var j=0; j<varids.length; j++) {
        if(v.id == varids[j]) {
          if(v.standard_names)
            varnames = varnames.concat(v.standard_names);
          break;
        }
      }
    }
    return varnames;
  }

  _getQuestionClass(question, questionid) {
    var qtype = question.type ? question.type : 'diagnostic';
    var cls = "button " + qtype.toLowerCase();
    if(this._getLocalName(question.id) == questionid)
      cls += " selected";
    return cls;
  }

  _addQuestion() {
    var me = this;
    if(this.newQuestion.id) {
      // Editing existing Question
      var nq = JSON.parse(JSON.stringify(this.newQuestion));
      if(this._isEmptyQuestion(nq)) {
        alert("Please fill in all values");
        return;
      }
      putJSONResource({
        url: nq.id,
        onLoad: function(e) {
          me._updateQuestionList(nq);
          me.$.question_creator_dialog.close();
        },
        onError: function() {
          console.log("Cannot update question");
        }
      }, nq);
    }
    else {
      // Adding new Question
      var nq = me.$.question_creator.createNewQuestion();
      if(this._isEmptyQuestion(nq)) {
        alert("Please fill in all values");
        return;
      }
      postJSONResource({
        url: me.config.server + "/users/" + me.userid +
          "/regions/" + me.routeData.regionid + "/questions",
        onLoad: function(e) {
          var id = e.target.responseText;
          nq.id = id;
          me.push("questions", nq);
          me.$.question_creator_dialog.close();
        },
        onError: function() {
          console.log("Cannot add question");
        }
      }, nq);
    }
  }

  _removeQuestionFromList(questionid) {
    for (var i=0; i<this.questions.length; i++) {
      if(this._getLocalName(this.questions[i].id) == questionid) {
        this.splice("questions", i, 1);
        break;
      }
    }
  }

  _editQuestion(evnt) {
    var question = evnt.model.get('item');
    this._openQuestionCreator();
    this.set("newQuestion", question);
  }

  _deleteQuestion(evnt) {
    var question = evnt.model.get('item');
    var me = this;
    var ok = confirm("Are you sure you want to delete the question: '" + question.label + "' ?");
    if(ok) {
      deleteResource({
        url: question.id,
        onLoad: function(e) {
          me._removeQuestionFromList(me.questionid);
          me.set("question", null);
          me.set("questionid", null);
          me.set("taskid", null);
          me.set("tasks", null);
          me.set("taskActivities", null);
          var new_path = '/govern/analysis/' + me._getLocalName(me.region.id);
          window.history.pushState({}, null, new_path)
        },
        onError: function() {
          console.log("Cannot remove question");
        }
      });
    }
  }

  _addTask() {
    var me = this;
    var newTask = this.newTask;
    postJSONResource({
      url: me.config.server + "/users/" + me.userid + "/regions/" + me.routeData.regionid + "/questions/" + me.questionid + "/tasks",
      onLoad: function(e) {
        var id = e.target.responseText;
        newTask.id = id;
        me.push("tasks", newTask);
        me.$.task_creator_dialog.close();
      },
      onError: function() {
        console.log("Cannot add task");
      }
    }, newTask);
  }

  _removeTaskFromList(taskid) {
    for (var i=0; i<this.tasks.length; i++) {
      if(this._getLocalName(this.tasks[i].id) == taskid) {
        this.splice("tasks", i, 1);
        break;
      }
    }
  }

  _deleteTask() {
    var me = this;
    me._delResource({
      url: me.config.server + "/users/" + me.userid + "/regions/" + me.routeData.regionid + "/questions/" + me.questionid + "/tasks/" + me.taskid,
      onLoad: function(e) {
        me._removeTaskFromList(me.taskid);
        me.set("task", null);
        me.set("taskid", null);
        me.set("taskActivities", null);
        var new_path = '/govern/analysis/' + me._getLocalName(me.region.id) + "/" + me.questionid;
        window.history.pushState({}, null, new_path)
      },
      onError: function() {
        console.log("Cannot remove task");
      }
    });
  }

  _getTaskClass(task, taskid) {
    var cls = "button";
    if(this._isTaskDone(task))
      cls += " task_done";
    if(this._getLocalName(task.id) == taskid)
      cls += " selected";
    return cls;
  }

  _getActivityClass(activity) {
    var cls = "button";
    if(this._isActivityDone(activity))
      cls += " activity_done";
    if(!activity.required)
      cls += " activity_optional";
    return cls;
  }

  _getDSId(tasks) {
    if(tasks == null)
      return null;
    for(var i=0; i<tasks.length; i++) {
      var task = tasks[i];
      if(task.type.indexOf("SelectDatasets") > 0) {
        for(var activity_type in task.activities) {
          if(activity_type.indexOf("SelectDatasets") > 0) {
            var act = task.activities[activity_type];
            if(act.output && act.output.length > 0) {
              return act.output[0];
            }
          }
        }
      }
    }
  }

  _getWorkflow(tasks) {
    if(tasks == null)
      return null;
    for(var i=0; i<tasks.length; i++) {
      var task = tasks[i];
      if(task.type.indexOf("ComposeWorkflow") > 0) {
        if(task.output && task.output.length > 0) {
          var wflowid = task.output[0];
          var regex = /\/([^\/]+)\/workflows\/([^\/]+)\.owl/;
          var m = regex.exec(wflowid);
          if(m) {
            return {
              id: wflowid,
              name: m[2],
              label: m[2],
              domain: m[1]
            };
          }
        }
      }
    }
  }

  _getRun(tasks) {
    if(tasks == null)
      return null;
    for(var i=0; i<tasks.length; i++) {
      var task = tasks[i];
      if(task.type.indexOf("RunWorkflow") > 0) {
        if(task.output && task.output.length > 0) {
          var runid = task.output[0];
          var regex = /\/([^\/]+)\/executions\/([^\/]+)\.owl/;
          var m = regex.exec(runid);
          if(m) {
            return {
              id: runid,
              name: m[2],
              label: m[2],
              domain: m[1]
            };
          }
        }
      }
    }
  }

  _getActivityLink(link, region, questionid, taskid) {
    if(!link || !region)
      return;
    link = link.replace("<regionid>", this._getLocalName(region.id));
    link = link.replace("<questionid>", questionid);
    link = link.replace("<taskid>", taskid);
    if(link.indexOf("<dsid>") > 0) {
      if(!this.dsid) {
        //alert("Please select datasets first");
        return null;
      }
      link = link.replace("<dsid>", this._getLocalName(this.dsid));
    }
    if(link.indexOf("<question_regionid>") > 0) {
      if(this.question)
        link = link.replace("<question_regionid>", this._getLocalName(this.question.region));
      else
        link = link.replace("<question_regionid>", "");
    }
    if(link.indexOf("<driving_variables>") > 0) {
      if(this.question && this.question.drivingVariables)
        link = link.replace("<driving_variables>",
          this._getStandardNames(this.question.drivingVariables, this.graphData));
      else
        link = link.replace("<driving_variables>", "");
    }
    if(link.indexOf("<response_variables>") > 0) {
      if(this.question && this.question.responseVariables)
        link = link.replace("<response_variables>",
          this._getStandardNames(this.question.responseVariables, this.graphData));
      else
        link = link.replace("<response_variables>", "");
    }
    if(link.indexOf("<workflow.") > 0 && this.workflow) {
      var m;
      while(m = link.match(/\<workflow\.(.+?)\>/)) {
        if(!m)
          break;
        link = link.replace("<workflow."+m[1]+">", this.workflow[m[1]]);
      }
    }
    if(link.indexOf("<run.") > 0 && this.run) {
      var m;
      while(m = link.match(/\<run\.(.+?)\>/)) {
        if(!m)
          break;
        link = link.replace("<run."+m[1]+">", this.run[m[1]]);
      }
    }
    if(link.indexOf("<config.wings.") > 0) {
      var m = link.match(/\<config\.wings\.(.+?)\>/);
      if(m) {
        link = link.replace("<config.wings."+m[1]+">", this.config.wings[m[1]]);
      }
    }
    return link;
  }

  _openQuestionCreator() {
    this.$.question_creator.reset();
    this.set("newQuestion", {});
    this.$.question_creator_dialog.open();
  }
  _closeQuestionCreator() {
    this.$.question_creator_dialog.close();
  }

  _openTaskCreator() {
    this.$.task_creator.reset();
    this.$.task_creator_dialog.open();
  }
  _closeTaskCreator() {
    this.$.task_creator_dialog.close();
  }

  _isActivityDone(activity) {
    return activity.instance && activity.instance.output;
  }

  _isTaskDone(task) {
    return task.status == "DONE" && task.output;
  }

  _isTaskPartlyDone(task) {
    return task.status == "ONGOING";
  }

  _getPluralizedQuantity(quantity) {
    if (!quantity) {
      return '';
    }
    var pluralizedQ = quantity === 1 ? 'y' : 'ies';
    return  '(' + quantity + ' categor' + pluralizedQ + ')';
  }

  _getLocalName(id) {
    return id.substring(id.lastIndexOf("/") + 1);
  }

  _getHashLocalName(id) {
    return id.substring(id.lastIndexOf("#") + 1);
  }

  _subRouteChanged(subroute) {
    var questionid = null;
    var taskid = null;
    if(subroute.path) {
      var items = subroute.path.split("/");
      if(items.length > 1 && items[1])
        questionid = items[1];
      if(items.length > 2 && items[2])
        taskid = items[2];
    }
    this.set("questionid", questionid);
    this.set("taskid", taskid);
  }

  _getTaskObject(tasks, taskid) {
    if(tasks && taskid) {
      for(var i=0; i<tasks.length; i++) {
        if(this._getLocalName(tasks[i].id) == taskid)
          return tasks[i];
      }
    }
  }

  _getQuestionObject(questions, questionid) {
    if(questions && questionid) {
      for(var i=0; i<questions.length; i++) {
        if(this._getLocalName(questions[i].id) == questionid)
          return questions[i];
      }
    }
    else {
      this.dataSpecs = null;
    }
  }

  _getQuestionRegion(region, question) {
    if(region && question) {
      if(region.id == question.region)
        return region;
      if(region.subRegions) {
        for(var i=0; i<region.subRegions.length; i++) {
          var qregion = this._getQuestionRegion(region.subRegions[i], question);
          if(qregion) {
            return qregion;
          }
        }
      }
      return null;
    }
  }

  _getTaskActivities(vocabulary, task) {
    if(task) {
      for(var i=0; i<vocabulary.task_types.length; i++) {
        var activity_types = [];
        if(vocabulary.task_types[i].id == task.type) {
          activity_types = vocabulary.task_types[i].activity_types;
          break;
        }
      }
      var activities = [];
      for(var i=0; i<activity_types.length; i++) {
        var activity_type = activity_types[i];
        var activity = Object.assign({}, activity_type); // copy over activity type to activity
        if(task.activities[activity_type.id]) {
          activity.instance = task.activities[activity_type.id]; // Add instance
        }
        activities.push(activity);
      }
      return activities;
    }
  }

  _createGeoJsonURL(region, visible) {
    if(region && visible) {
      var url = region.boundaryVector;
      //console.log(url);
      return url;
    }
    return null;
  }

}

customElements.define(MintGovernAnalysis.is, MintGovernAnalysis);

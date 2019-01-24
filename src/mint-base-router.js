/*
Borrowed from here:
https://github.com/PolymerElements/app-route/issues/164#issuecomment-386971309
*/
/*
  FIXME(polymer-modulizer): the above comments were extracted
  from HTML and may be out of place here. Review them and
  then delete this comment!
*/

import '@polymer/app-route/app-route.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';

export class MintBaseRouter extends PolymerElement {
  static get is() { return 'mint-base-router'; }

  static get template() {
    return html`
    <app-route
        route="[[route]]"
        pattern="[[base]]:page"
        data="{{routeData}}"
        tail="{{subRoute}}"></app-route>`;
  }

  static get properties() {
    return {
      base: {
        type: String,
        value: "/"
      },
      pageSubRoute: {
        type: Object,
        value: {}
      },
      routeData: Object,
      subRoute: Object
    };
  }

  static get observers() {
    return [
      '_routePageChanged(routeData.page)',
      '_subRouteChanged(subRoute.*, subRoute)',
      '_pageSubRouteChanged(pageSubRoute.*,pageSubRoute)'
    ]
  }

  _afterLastSlash (s) {
    if (!s) return ''
    var items = s.split('/');
    return items[items.length-1];
  }

  // subRoute has changed. Work out what page it changed for, and update that page's
  // own's subRoute
  _subRouteChanged (subRouteObj) {
    var subRoute = subRouteObj.base
    if (!subRoute) return
    if (this._protectPageSubRoute) return;
    var page = this._afterLastSlash(subRoute.prefix)
    if (page) {
      //console.log("Setting pageSubRoute."+page);
      this.set('pageSubRoute.' + page, JSON.parse(JSON.stringify(this.subRoute)))
    }
  }
  // This is triggered when a sub-page changes its route. Then the question is:
  // do we propagate it up to the app's `subRoute` property, which is the tail?
  // The answer is YES
  _pageSubRouteChanged (pageSubRouteObj) {
    var pageSubRoute = pageSubRouteObj.base
    if (!this.subRoute) return
    var page = this._afterLastSlash(this.subRoute.prefix)
    if (page in pageSubRoute) {
      this._protectPageSubRoute = true;
      this.set('subRoute', JSON.parse(JSON.stringify(pageSubRoute[page])));
      this._protectPageSubRoute = false;
    }
  }

  _routePageChanged (page) {
    // Define this in the extensions of this class
  }

}
customElements.define(MintBaseRouter.is, MintBaseRouter);

import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';
import { getResource, postJSONResource } from './mint-requests.js';

class MintDataCatalog extends PolymerElement {
  static get is() {
    return 'mint-data-catalog';
  }

  static get properties() {
    return {
      region: Object,
      config: {
        type: Object,
        observer: '_getAuthHeaders'
      },
      userid: String,
      authHeaders: {
        type: Object,
        observer: '_attendToPending'
      },
      pendingRequests: {
        type: Array,
        value: []
      },

      dataCatalog: {
        type: Object,
        notify: true
      }
    };
  }

  constructor() {
    super();
    this.set("dataCatalog", this);
  }

  _calculateBoundingBox(regionGeoJson) {
    var xmin=99999, ymin=99999, xmax=-99999, ymax=-99999;
    var coords = regionGeoJson.features[0].geometry.coordinates[0];
    for(var i=0; i<coords.length; i++) {
      var c = coords[i];
      if(c[0] < xmin)
        xmin = c[0];
      if(c[1] < ymin)
        ymin = c[1];
      if(c[0] > xmax)
        xmax = c[0];
      if(c[1] > ymax)
        ymax = c[1];
    }
    return [xmin-0.01, ymin-0.01, xmax+0.01, ymax+0.01];
  }

  _getAuthHeaders(config) {
    if(!config)
      return;
    var url = config.catalogs.data + "/get_session_token";

    var me = this;
    getResource({
      url: url,
      onLoad: function(e) {
        var obj = JSON.parse(e.target.responseText);
        me.authHeaders = obj;
      },
      onError: function() {
        console.log("Cannot get authorization token");
      }
    });
  }

  _attendToPending(authHeaders) {
    if(authHeaders) {
      // If authHeaders is set, attend to all pending requests
      while(this.pendingRequests.length) {
        (this.pendingRequests.shift())();
      }
    }
  }

  getDatasetVariables(dsid, fn) {
    var url = this.config.catalogs.data + "/datasets/dataset_standard_variables";
    if(dsid) {
      var data = { dataset_id: dsid };
      postJSONResource({
        url: url,
        onLoad: function(e) {
          var response = JSON.parse(e.target.responseText);
          if(response.result == "success" && response.dataset) {
            fn(response.dataset.standard_variables);
          }
          else {
            fn(null);
          }
        },
        onError: function() {
          console.log("Cannot get dataset variables");
          fn(null);
        }
      }, data, false, this.authHeaders);
    }
    else {
      fn(null);
    }
  }

  _createQueryData(queryConfig) {
    var data = {};
    if(queryConfig.bbox) {
      data["spatial_coverage__intersects"] = queryConfig.bbox;
    }
    if(queryConfig.startDate) {
      data["end_time__gte"] = queryConfig.startDate+"T00:00:00";
    }
    if(queryConfig.endDate) {
      data["start_time__lte"] = queryConfig.endDate+"T00:00:00";
    }
    if(queryConfig.datasetName) {
      data["dataset_names__in"] = [ queryConfig.datasetName ];
    }
    if(queryConfig.variables) {
      data["standard_variable_names__in"] = queryConfig.variables.split(/\s*,\s*/);
    }
    data["limit"] = 1000;
    return data;
  }

  _findStandardVariable(variable, fn) {
    var me = this;
    var query = { name__in: [ variable ] };
    postJSONResource({
      url: me.config.catalogs.data + "/knowledge_graph/find_standard_variables",
      onLoad: function(e) {
        var bdata = JSON.parse(e.target.responseText);
        if(bdata.standard_variables.length > 0)
          fn(bdata.standard_variables[0].id)
        fn(null);
      },
      onError: function() {
        console.log("Cannot fetch datasets");
      }
    }, query, false, this.authHeaders);
  }

  wrapFunction(fn, context, params) {
    return function() {
      fn.apply(context, params);
    };
  }

  _groupDatasets(bindings) {
    var groupedBindings = [];
    var bmap = {};
    for(var i=0; i< bindings.length; i++) {
      var b = bindings[i];
      var gbinding = bmap[b.dataset_id];
      if(!gbinding) {
        gbinding = {
          dataset_id: b.dataset_id,
          dataset_name: b.dataset_name,
          resources: []
        }
      }
      gbinding.resources.push(b);
      bmap[b.dataset_id] = gbinding;
    }
    for(var bid in bmap) {
      groupedBindings.push(bmap[bid]);
    }
    return groupedBindings;
  }

  findDatasets(queryConfig, fn) {
    var me = this;
    if(!queryConfig)
      return;

    if(!me.authHeaders) {
      var pending = this.wrapFunction(this.findDatasets, this, [queryConfig, fn]);
      this.pendingRequests.push(pending);
      return;
    };

    var data = this._createQueryData(queryConfig);
    var url = me.config.catalogs.data + "/datasets/find";
    /*
    if(!data['start_time__gte'] && !data['end_time__gte'] && !data['spatial_coverage__intersects']) {
      url = me.config.catalogs.data + "/find_datasets";
    }*/
    postJSONResource({
      url: url,
      onLoad: function(e) {
        var bdata = JSON.parse(e.target.responseText);
        var bindings = bdata.datasets;
        if(!bindings && bdata.resources)
          bindings = me._groupDatasets(bdata.resources);
        fn(bindings);
      },
      onError: function() {
        console.log("Cannot fetch datasets");
      }
    }, data, false, this.authHeaders);
  }

  __fakeFindDatasets(queryConfig, fn) {
    var me = this;
    if(!queryConfig)
      return;

    me.getResource({
      url: me.config.server + "/common/datasets",
      onLoad: function(e) {
        var dslist = JSON.parse(e.target.responseText);
        fn(dslist);
      },
      onError: function() {
        console.log("Cannot fetch datasets");
      }
    });
  }

}
customElements.define(MintDataCatalog.is, MintDataCatalog);

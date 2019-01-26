import { PolymerElement } from '../node_modules/@polymer/polymer/polymer-element.js';

class MintDataCatalog extends PolymerElement {
  static get is() {
    return 'mint-data-catalog';
  }

  static get properties() {
    return {
      region: Object,
      config: {
        type: Object,
        observer: '_getAuthToken'
      },
      userid: String,
      authToken: {
        type: String,
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

  _getAuthToken(config) {
    if(!config)
      return;
    var url = config.catalogs.data + "/get_session_token";

    var me = this;
    this._getResource({
      url: url,
      onLoad: function(e) {
        var obj = JSON.parse(e.target.responseText);
        me.authToken = obj["X-Api-Key"];
      },
      onError: function() {
        console.log("Cannot get authorization token");
      }
    });
  }

  _attendToPending(authToken) {
    if(authToken) {
      // If authToken is set, attend to all pending requests
      while(this.pendingRequests.length) {
        (this.pendingRequests.shift())();
      }
    }
  }

  getDatasetVariables(dsid, fn) {
    var url = this.config.catalogs.data + "/datasets/dataset_standard_variables";
    if(dsid) {
      var data = { dataset_id: dsid };
      this._postResource({
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
      }, JSON.stringify(data));
    }
    else {
      fn(null);
    }
  }

  getVariableData(standard_name, fn) {
    var url = this.server + "/data_sets?standard_name=" +
      encodeURIComponent(standard_name);
    this._getResource({
      url: url,
      onLoad: function(e) {
        var metalist = JSON.parse(e.target.responseText);
        var blist = metalist.results.bindings;
        fn(blist);
      },
      onError: function() {
        console.log("Cannot fetch files info");
      }
    });
  }

  getVariableFiles(standard_name, fn) {
    var files = [];
    var me = this;
    this.getVariableData(standard_name, function(blist) {
      var num=0;
      for(let i=0; i<blist.length; i++) {
        let binding = blist[i];
        files.push(binding);
        // console.log(binding);
        let bid = binding.variable_id.value;
        me.getDatasetLocation(bid, function(bindings) {
          num++;
          binding.plan = bindings;
          if(num == blist.length) {
            fn(files);
          }
        });
      }
      if(blist.length == 0)
        fn(null);
    });
  }

  getDatasetLocation(vid, fn) {
    var me = this;
    var data = {variable_id: vid};
    me._postResource({
      url: me.server + "/data_sets/get_location_url",
      onLoad: function(e) {
        var bdata = JSON.parse(e.target.responseText);
        var bindings = bdata.results.bindings;
        fn(bindings);
      },
      onError: function() {
        console.log("Cannot fetch file location");
      }
    }, JSON.stringify(data));
  }

  getBindingsForVariables(variables, fn) {
    var me = this;
    var variable_bindings = {};
    var num = 0;
    for(var i=0; i<variables.length; i++) {
      let v = variables[i];
      this.getVariableFiles(v, function(bindings) {
        num++;
        if(bindings)
          variable_bindings[v] = bindings;
        if(num==variables.length)
          fn(variable_bindings);
      });
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
    me._postResource({
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
    }, JSON.stringify({
      name__in: [ variable ]
    }));
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

    if(!me.authToken) {
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
    me._postResource({
      url: url,
      onLoad: function(e) {
        var bdata = JSON.parse(e.target.responseText);
        var bindings = bdata.datasets;
        if(!bindings && bdata.resources)
          bindings = this._groupDatasets(bdata.resources);
        fn(bindings);
      },
      onError: function() {
        console.log("Cannot fetch datasets");
      }
    }, JSON.stringify(data));
  }

  __fakeFindDatasets(queryConfig, fn) {
    var me = this;
    if(!queryConfig)
      return;

    me._getResource({
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

  _getResource(rq) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    //xhr.withCredentials = true;
    xhr.open('GET', rq.url);
    //xhr.setRequestHeader("X-Api-Key", this.authToken);
    xhr.send();
  }

  _postResource(rq, data) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', rq.onLoad.bind(this));
    xhr.addEventListener('error', rq.onError.bind(this));
    //xhr.withCredentials = true;
    xhr.open('POST', rq.url);
    xhr.setRequestHeader("Content-type", "application/json");
    //xhr.setRequestHeader("X-Api-Key", this.authToken);
    xhr.send(data);
  }
}
customElements.define(MintDataCatalog.is, MintDataCatalog);

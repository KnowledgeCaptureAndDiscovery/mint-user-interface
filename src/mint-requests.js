export function getResource(rq, withCredentials) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', rq.onLoad.bind(this));
  xhr.addEventListener('error', rq.onError.bind(this));
  xhr.withCredentials = withCredentials;
  xhr.open('GET', rq.url);
  xhr.send();
}

function sendData(xhr, payload) {
  if(payload.length > 5000) {
    // Zip larger payloads
    var myid = Math.random()
    xhr.setRequestHeader("Content-Encoding", "gzip");
    gzipWorker.addEventListener("message", function(e) {
      var msgid = e.data[0];
      if(msgid == myid) {
        gzipWorker.removeEventListener("message", this);
        var data = new Uint8Array(e.data[1]);
        xhr.send(data);
      }
    });
    gzipWorker.postMessage([myid, payload]);
  }
  else {
    xhr.send(payload);
  }
}

export function postJSONResource(rq, data, withCredentials, authHeaders) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', rq.onLoad.bind(this));
  xhr.addEventListener('error', rq.onError.bind(this));
  xhr.withCredentials = withCredentials;
  xhr.open('POST', rq.url);
  xhr.setRequestHeader("Content-type", "application/json");
  if(authHeaders) {
    for(var header in authHeaders) {
      xhr.setRequestHeader(header, authHeaders[header]);
    }
  }
  sendData(xhr, JSON.stringify(data));
}

export function putJSONResource(rq, data, withCredentials) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', rq.onLoad.bind(this));
  xhr.addEventListener('error', rq.onError.bind(this));
  xhr.withCredentials = withCredentials;
  xhr.open('PUT', rq.url);
  xhr.setRequestHeader("Content-type", "application/json");
  sendData(xhr, JSON.stringify(data));
}

export function postFormResource(rq, keyvalues, withCredentials) {
  // Crate form data
  var data = "";
  for(var key in keyvalues) {
    if(data)
      data += "&";
    data += key + "=" + encodeURIComponent(keyvalues[key]);
  }
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', rq.onLoad.bind(this));
  xhr.addEventListener('error', rq.onError.bind(this));
  xhr.withCredentials = withCredentials;
  xhr.open('POST', rq.url);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  sendData(xhr, data);
}

export function deleteResource(rq, withCredentials) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener('load', rq.onLoad.bind(this));
  xhr.addEventListener('error', rq.onError.bind(this));
  xhr.withCredentials = withCredentials;
  xhr.open('DELETE', rq.url);
  xhr.send();
}

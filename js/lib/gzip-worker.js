importScripts("jsonc.min.js");

onmessage = function(e) {
  postMessage([e.data[0], gzip.zip(e.data[1])]);
};

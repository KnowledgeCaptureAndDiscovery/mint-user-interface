importScripts("viz.js");

onmessage = function(e) {
  var layoutdata = Viz(e.data[1], { engine: e.data[2], format: "plain" });
  postMessage([e.data[0], layoutdata]);
};

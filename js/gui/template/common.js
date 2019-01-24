/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function _console(msg, trace) {
  if (window.console) {
    window.console.log(msg);
    if (trace)
      window.console.trace();
  }
}

export function getRDFID(id) {
  id = id.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  if (id.match(/^([0-9]|\.|\-)/))
    id = '_' + id;
  return id;
}

export function getLocalName(url) {
  if (!url)
    return url;
  if (url.indexOf('urn:') == 0)
    return url.replace(/^.*:/, '');
  return url.replace(/^.*(#|\/)/, '');
}

export function getNamespace(url) {
  if (!url)
    return url;
  if (url.indexOf('urn:') == 0)
    return url.replace(/:.*$/, ':');
  return url.replace(/#.*$/, '#');
}

export function getPrefixedUrl(url, nsmap, default_ns) {
  if (!url)
    return url;
  // If what's passed in isn't a string (i.e. no replace function), just
  // return it as it is
  if (typeof url.replace != "function")
    return url;

  var nurl = url;
  for (var pfx in nsmap) {
    var nsurl = nsmap[pfx];
    nurl = nurl.replace(nsurl, pfx + ":");
  }
  if (default_ns) {
    nurl = nurl.replace(default_ns, "");
  } else if (nurl == url) {
    nurl = getLocalName(nurl);
  }
  return nurl;
}

export function xsdDateTime(date) {
  function pad(n) {
    var s = n.toString();
    return s.length < 2 ? '0' + s : s;
  }
  var yyyy = date.getFullYear();
  var mm1 = pad(date.getMonth() + 1);
  var dd = pad(date.getDate());
  var hh = pad(date.getHours());
  var mm2 = pad(date.getMinutes());
  var ss = pad(date.getSeconds());

  return yyyy + '-' + mm1 + '-' + dd + 'T' + hh + ':' + mm2 + ':' + ss;
}

export function getTreePath(node, field, separator) {
  field = field || node.idProperty;
  separator = separator || '/';

  var path = [node.get(field)];

  var parent = node.parentNode;
  while (parent) {
    path.unshift(parent.get(field));
    parent = parent.parentNode;
  }
  return separator + path.join(separator);
}

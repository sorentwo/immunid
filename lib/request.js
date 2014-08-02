var merge    = require('./merge');
var Promise = require('es6-promise').Promise;

var Response = function(request) {
  this.request = request;
  this.xhr     = this.request.xhr;
  this.text    = this.xhr.responseText;
  this.body    = JSON.parse(this.text);
  this.header  = this.parseHeader(this.xhr.getAllResponseHeaders());
  this.status  = this.xhr.status;
};

merge(Response.prototype, {
  parseHeader: function(string) {
    var lines  = string.split(/\r?\n/);
    var fields = {};
    var index, line, field, value;

    lines.pop(); // trailing CRLF

    for (var i = 0, len = lines.length; i < len; ++i) {
      line  = lines[i];
      index = line.indexOf(':');
      field = line.slice(0, index).toLowerCase();
      value = line.slice(index + 1).trim();
      fields[field] = value;
    }

    return fields;
  }
});

var Request = function(method, url) {
  this.method = method;
  this.url    = url;
  this.data   = {};
  this.header = {};
};

merge(Request.prototype, {
  set: function(field, value) {
    this.header[field] = value;

    return this;
  },

  send: function(data) {
    merge(this.data, data);

    return this;
  },

  end: function() {
    var xhr      = this.xhr = new XMLHttpRequest();
    var promise  = new Promise();
    var response = new Response(this);

    xhr.addEventListener('load', function() {
      promise.fulfill(response);
    });

    xhr.addEventListener('error', function() {
      promise.reject(response);
    });

    xhr.addEventListener('abort', function() {
      promise.reject(response);
    });

    if (this.isXDomainRequest()) {
      xhr.withCredentials = true;
    }

    xhr.open(this.method, this.url, true);

    for (var field in this.header) {
      xhr.setRequestHeader(field, this.header[field]);
    }

    xhr.send(this.serialized());

    return promise;
  },

  isXDomainRequest: function(hostname) {
    hostname = hostname || window.location.hostname;
    var hostnameMatch = this.url.match(/http[s]?:\/\/([^\/]*)/);

    return (hostnameMatch && hostnameMatch[1] !== hostname);
  },

  serialized: function() {
    return this.parser()(this.data);
  },

  parser: function() {
    if (this.method !== 'GET' && this.method !== 'HEAD') {
      return JSON.stringify;
    } else {
      return function(value) { return value; };
    }
  }
});

module.exports = Request;

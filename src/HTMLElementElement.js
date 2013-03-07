/*
 * Copyright 2013 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

HTMLElementElement = document.register('element', {
  prototype: Object.create(HTMLElement.prototype, {
    readyCallback: {
      value: function() {
        parseElementElement.call(this);
      },
      enumerable: true
    },
    register: {
      value: function(inMore) {
        if (inMore) {
          this.options.lifecycle = inMore.lifecycle;
          if (inMore.prototype) {
            mixin(this.options.prototype, inMore.prototype);
          }
        }
      },
      enumerable: true
    }
  })
});

function parseElementElement() {
  // options to glean from inElement attributes
  var options = {
    name: '',
    extends: null
  };
  // glean them
  takeAttributes(this, options);
  // default base
  var base = HTMLElement.prototype;
  // optional specified base
  if (options.extends) {
    // build an instance of options.extends
    var archetype = document.createElement(options.extends);
    // 'realize' a Nohd 
    // TODO(sjmiles): polyfill pollution
    archetype = archetype.node || archetype;
    // acquire the prototype
    base = archetype.__proto__ || Object.getPrototypeOf(archetype);
  }
  // extend base
  options.prototype = Object.create(base);
  // install options
  this.options = options;
  // locate user script
  var script = this.querySelector('script,scripts');
  if (script) {
    // execute user script in 'inElement' context
    executeComponentScript(script.textContent, this, options.name);
  };
  // register our new element
  document.register(options.name, options);
}

// each property in inDictionary takes a value
// from the matching attribute in inElement, if any
function takeAttributes(inElement, inDictionary) {
  for (var n in inDictionary) {
    var a = inElement.attributes[n];
    if (a) {
      inDictionary[n] = a.value;
    }
  }
}

// invoke inScript in inContext scope
function executeComponentScript(inScript, inContext, inName) {
  // set (highlander) context
  context = inContext;
  // source location
  var owner = context.ownerDocument;
  // compose script
  var code = "__componentScript('"
    + inName
    + "', function(){"
    + inScript
    + "});"
    + "\n//@ sourceURL=" + (owner._URL || owner.URL) + "\n"
  ;
  // inject script
  eval(code);
}

var context;

// global necessary for script injection
window.__componentScript = function(inName, inFunc) {
  inFunc.call(context);
};
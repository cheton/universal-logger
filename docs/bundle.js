/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "../node_modules/error-stack-parser/error-stack-parser.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__("../node_modules/stackframe/stackframe.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if (typeof exports === 'object') {
        module.exports = factory(require('stackframe'));
    } else {
        root.ErrorStackParser = factory(root.StackFrame);
    }
}(this, function ErrorStackParser(StackFrame) {
    'use strict';

    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+\:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+\:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code\])?$/;

    return {
        /**
         * Given an Error object, extract the most information from it.
         *
         * @param {Error} error object
         * @return {Array} of StackFrames
         */
        parse: function ErrorStackParser$$parse(error) {
            if (typeof error.stacktrace !== 'undefined' || typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            } else if (error.stack) {
                return this.parseFFOrSafari(error);
            } else {
                throw new Error('Cannot parse given Error object');
            }
        },

        // Separate line and column numbers from a string of the form: (URI:Line:Column)
        extractLocation: function ErrorStackParser$$extractLocation(urlLike) {
            // Fail-fast but return locations like "(native)"
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }

            var regExp = /(.+?)(?:\:(\d+))?(?:\:(\d+))?$/;
            var parts = regExp.exec(urlLike.replace(/[\(\)]/g, ''));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },

        parseV8OrIE: function ErrorStackParser$$parseV8OrIE(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this);

            return filtered.map(function(line) {
                if (line.indexOf('(eval ') > -1) {
                    // Throw away eval information until we implement stacktrace.js/stackframe#8
                    line = line.replace(/eval code/g, 'eval').replace(/(\(eval at [^\()]*)|(\)\,.*$)/g, '');
                }
                var tokens = line.replace(/^\s+/, '').replace(/\(eval code/g, '(').split(/\s+/).slice(1);
                var locationParts = this.extractLocation(tokens.pop());
                var functionName = tokens.join(' ') || undefined;
                var fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];

                return new StackFrame({
                    functionName: functionName,
                    fileName: fileName,
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        },

        parseFFOrSafari: function ErrorStackParser$$parseFFOrSafari(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);

            return filtered.map(function(line) {
                // Throw away eval information until we implement stacktrace.js/stackframe#8
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval\:\d+\:\d+/g, ':$1');
                }

                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    // Safari eval frames only have function names and nothing else
                    return new StackFrame({
                        functionName: line
                    });
                } else {
                    var tokens = line.split('@');
                    var locationParts = this.extractLocation(tokens.pop());
                    var functionName = tokens.join('@') || undefined;

                    return new StackFrame({
                        functionName: functionName,
                        fileName: locationParts[0],
                        lineNumber: locationParts[1],
                        columnNumber: locationParts[2],
                        source: line
                    });
                }
            }, this);
        },

        parseOpera: function ErrorStackParser$$parseOpera(e) {
            if (!e.stacktrace || (e.message.indexOf('\n') > -1 &&
                e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            } else if (!e.stack) {
                return this.parseOpera10(e);
            } else {
                return this.parseOpera11(e);
            }
        },

        parseOpera9: function ErrorStackParser$$parseOpera9(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame({
                        fileName: match[2],
                        lineNumber: match[1],
                        source: lines[i]
                    }));
                }
            }

            return result;
        },

        parseOpera10: function ErrorStackParser$$parseOpera10(e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(
                        new StackFrame({
                            functionName: match[3] || undefined,
                            fileName: match[2],
                            lineNumber: match[1],
                            source: lines[i]
                        })
                    );
                }
            }

            return result;
        },

        // Opera 10.65+ Error.stack very similar to FF/Safari
        parseOpera11: function ErrorStackParser$$parseOpera11(error) {
            var filtered = error.stack.split('\n').filter(function(line) {
                return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
            }, this);

            return filtered.map(function(line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = (tokens.shift() || '');
                var functionName = functionCall
                        .replace(/<anonymous function(: (\w+))?>/, '$2')
                        .replace(/\([^\)]*\)/g, '') || undefined;
                var argsRaw;
                if (functionCall.match(/\(([^\)]*)\)/)) {
                    argsRaw = functionCall.replace(/^[^\(]+\(([^\)]*)\)$/, '$1');
                }
                var args = (argsRaw === undefined || argsRaw === '[arguments not available]') ?
                    undefined : argsRaw.split(',');

                return new StackFrame({
                    functionName: functionName,
                    args: args,
                    fileName: locationParts[0],
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                    source: line
                });
            }, this);
        }
    };
}));


/***/ }),

/***/ "../node_modules/events/events.js":
/***/ (function(module, exports) {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}


/***/ }),

/***/ "../node_modules/node-emoji/index.js":
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("../node_modules/node-emoji/lib/emoji.js");

/***/ }),

/***/ "../node_modules/node-emoji/lib/emoji.js":
/***/ (function(module, exports, __webpack_require__) {

/*jslint node: true*/
__webpack_require__("../node_modules/string.prototype.codepointat/codepointat.js");

"use strict";

/**
 * regex to parse emoji in a string - finds emoji, e.g. :coffee:
 */
var parser = /:([a-zA-Z0-9_\-\+]+):/g;

/**
 * Removes colons on either side
 * of the string if present
 * @param  {string} str
 * @return {string}
 */
var trim = function(str) {
  var colonIndex = str.indexOf(':');
  if (colonIndex > -1) {
    // :emoji: (http://www.emoji-cheat-sheet.com/)
    if (colonIndex === str.length - 1) {
      str = str.substring(0, colonIndex);
      return trim(str);
    } else {
      str = str.substr(colonIndex + 1);
      return trim(str);
    }
  }
  return str;
}
/**
 * Emoji namespace
 */
var Emoji = module.exports = {
  emoji: __webpack_require__("../node_modules/node-emoji/lib/emoji.json")
};

/**
 * get emoji code from name
 * @param  {string} emoji
 * @return {string}
 */
Emoji._get = function _get(emoji) {
  if (Emoji.emoji.hasOwnProperty(emoji)) {
    return Emoji.emoji[emoji];
  }
  return ':' + emoji + ':';
};

/**
 * get emoji code from :emoji: string or name
 * @param  {string} emoji
 * @return {string}
 */
Emoji.get = function get(emoji) {
  emoji = trim(emoji);

  return Emoji._get(emoji);
};

/**
 * get emoji name from code
 * @param  {string} emoji_code
 * @return {string}
 */
Emoji.which = function which(emoji_code) {
  for (var prop in Emoji.emoji) {
    if (Emoji.emoji.hasOwnProperty(prop)) {
      if (Emoji.emoji[prop].codePointAt() === emoji_code.codePointAt()) {
        return prop;
      }
    }
  }
};

/**
 * emojify a string (replace :emoji: with an emoji)
 * @param  {string} str
 * @param  {function} on_missing (gets emoji name without :: and returns a proper emoji if no emoji was found)
 * @return {string}
 */
Emoji.emojify = function emojify(str, on_missing) {
  if (!str) return '';

  return str.split(parser) // parse emoji via regex
            .map(function parseEmoji(s, i) {
              // every second element is an emoji, e.g. "test :fast_forward:" -> [ "test ", "fast_forward" ]
              if (i % 2 === 0) return s;
              var emoji = Emoji._get(s);
              if (emoji.indexOf(':') > -1 && typeof on_missing === 'function') {
                return on_missing(emoji.substr(1, emoji.length-2));
              }
              return emoji;
            })
            .join('') // convert back to string
  ;
};

/**
 * return a random emoji
 * @return {string}
 */
Emoji.random = function random() {
  var emojiKeys = Object.keys(Emoji.emoji);
  var randomIndex = Math.floor(Math.random() * emojiKeys.length);
  var key = emojiKeys[randomIndex];
  var emoji = Emoji._get(key);
  return {key: key, emoji: emoji};
}

/**
 *  return an collection of potential emoji matches
 *  @param {string} str
 *  @return {Array.<Object>}
 */
Emoji.search = function search(str) {
  var emojiKeys = Object.keys(Emoji.emoji);
  var matcher = trim(str)
  var matchingKeys = emojiKeys.filter(function(key) {
    return key.toString().indexOf(matcher) === 0;
  });
  return matchingKeys.map(function(key) {
    return {
      key: key,
      emoji: Emoji._get(key),
    };
  });
}


/***/ }),

/***/ "../node_modules/node-emoji/lib/emoji.json":
/***/ (function(module, exports) {

module.exports = {
	"100": "💯",
	"1234": "🔢",
	"interrobang": "⁉️",
	"tm": "™️",
	"information_source": "ℹ️",
	"left_right_arrow": "↔️",
	"arrow_up_down": "↕️",
	"arrow_upper_left": "↖️",
	"arrow_upper_right": "↗️",
	"arrow_lower_right": "↘️",
	"arrow_lower_left": "↙️",
	"keyboard": "⌨",
	"sunny": "☀️",
	"cloud": "☁️",
	"umbrella": "☔️",
	"showman": "☃",
	"comet": "☄",
	"ballot_box_with_check": "☑️",
	"coffee": "☕️",
	"shamrock": "☘",
	"skull_and_crossbones": "☠",
	"radioactive_sign": "☢",
	"biohazard_sign": "☣",
	"orthodox_cross": "☦",
	"wheel_of_dharma": "☸",
	"white_frowning_face": "☹",
	"aries": "♈️",
	"taurus": "♉️",
	"sagittarius": "♐️",
	"capricorn": "♑️",
	"aquarius": "♒️",
	"pisces": "♓️",
	"spades": "♠️",
	"clubs": "♣️",
	"hearts": "♥️",
	"diamonds": "♦️",
	"hotsprings": "♨️",
	"hammer_and_pick": "⚒",
	"anchor": "⚓️",
	"crossed_swords": "⚔",
	"scales": "⚖",
	"alembic": "⚗",
	"gear": "⚙",
	"scissors": "✂️",
	"white_check_mark": "✅",
	"airplane": "✈️",
	"email": "✉️",
	"envelope": "✉️",
	"black_nib": "✒️",
	"heavy_check_mark": "✔️",
	"heavy_multiplication_x": "✖️",
	"star_of_david": "✡",
	"sparkles": "✨",
	"eight_spoked_asterisk": "✳️",
	"eight_pointed_black_star": "✴️",
	"snowflake": "❄️",
	"sparkle": "❇️",
	"question": "❓",
	"grey_question": "❔",
	"grey_exclamation": "❕",
	"exclamation": "❗️",
	"heavy_exclamation_mark": "❗️",
	"heavy_heart_exclamation_mark_ornament": "❣",
	"heart": "❤️",
	"heavy_plus_sign": "➕",
	"heavy_minus_sign": "➖",
	"heavy_division_sign": "➗",
	"arrow_heading_up": "⤴️",
	"arrow_heading_down": "⤵️",
	"wavy_dash": "〰️",
	"congratulations": "㊗️",
	"secret": "㊙️",
	"copyright": "©️",
	"registered": "®️",
	"bangbang": "‼️",
	"leftwards_arrow_with_hook": "↩️",
	"arrow_right_hook": "↪️",
	"watch": "⌚️",
	"hourglass": "⌛️",
	"fast_forward": "⏩",
	"rewind": "⏪",
	"arrow_double_up": "⏫",
	"arrow_double_down": "⏬",
	"black_right_pointing_double_triangle_with_vertical_bar": "⏭",
	"black_left_pointing_double_triangle_with_vertical_bar": "⏮",
	"black_right_pointing_triangle_with_double_vertical_bar": "⏯",
	"alarm_clock": "⏰",
	"stopwatch": "⏱",
	"timer_clock": "⏲",
	"hourglass_flowing_sand": "⏳",
	"double_vertical_bar": "⏸",
	"black_square_for_stop": "⏹",
	"black_circle_for_record": "⏺",
	"m": "Ⓜ️",
	"black_small_square": "▪️",
	"white_small_square": "▫️",
	"arrow_forward": "▶️",
	"arrow_backward": "◀️",
	"white_medium_square": "◻️",
	"black_medium_square": "◼️",
	"white_medium_small_square": "◽️",
	"black_medium_small_square": "◾️",
	"phone": "☎️",
	"telephone": "☎️",
	"point_up": "☝️",
	"star_and_crescent": "☪",
	"peace_symbol": "☮",
	"yin_yang": "☯",
	"relaxed": "☺️",
	"gemini": "♊️",
	"cancer": "♋️",
	"leo": "♌️",
	"virgo": "♍️",
	"libra": "♎️",
	"scorpius": "♏️",
	"recycle": "♻️",
	"wheelchair": "♿️",
	"atom_symbol": "⚛",
	"fleur_de_lis": "⚜",
	"warning": "⚠️",
	"zap": "⚡️",
	"white_circle": "⚪️",
	"black_circle": "⚫️",
	"coffin": "⚰",
	"funeral_urn": "⚱",
	"soccer": "⚽️",
	"baseball": "⚾️",
	"snowman": "⛄️",
	"partly_sunny": "⛅️",
	"thunder_cloud_and_rain": "⛈",
	"ophiuchus": "⛎",
	"pick": "⛏",
	"helmet_with_white_cross": "⛑",
	"chains": "⛓",
	"no_entry": "⛔️",
	"shinto_shrine": "⛩",
	"church": "⛪️",
	"mountain": "⛰",
	"umbrella_on_ground": "⛱",
	"fountain": "⛲️",
	"golf": "⛳️",
	"ferry": "⛴",
	"boat": "⛵️",
	"sailboat": "⛵️",
	"skier": "⛷",
	"ice_skate": "⛸",
	"person_with_ball": "⛹",
	"tent": "⛺️",
	"fuelpump": "⛽️",
	"fist": "✊",
	"hand": "✋",
	"raised_hand": "✋",
	"v": "✌️",
	"writing_hand": "✍",
	"pencil2": "✏️",
	"latin_cross": "✝",
	"x": "❌",
	"negative_squared_cross_mark": "❎",
	"arrow_right": "➡️",
	"curly_loop": "➰",
	"loop": "➿",
	"arrow_left": "⬅️",
	"arrow_up": "⬆️",
	"arrow_down": "⬇️",
	"black_large_square": "⬛️",
	"white_large_square": "⬜️",
	"star": "⭐️",
	"o": "⭕️",
	"part_alternation_mark": "〽️",
	"mahjong": "🀄️",
	"black_joker": "🃏",
	"a": "🅰️",
	"b": "🅱️",
	"o2": "🅾️",
	"parking": "🅿️",
	"ab": "🆎",
	"cl": "🆑",
	"cool": "🆒",
	"free": "🆓",
	"id": "🆔",
	"new": "🆕",
	"ng": "🆖",
	"ok": "🆗",
	"sos": "🆘",
	"up": "🆙",
	"vs": "🆚",
	"koko": "🈁",
	"sa": "🈂️",
	"u7121": "🈚️",
	"u6307": "🈯️",
	"u7981": "🈲",
	"u7a7a": "🈳",
	"u5408": "🈴",
	"u6e80": "🈵",
	"u6709": "🈶",
	"u6708": "🈷️",
	"u7533": "🈸",
	"u5272": "🈹",
	"u55b6": "🈺",
	"ideograph_advantage": "🉐",
	"accept": "🉑",
	"cyclone": "🌀",
	"foggy": "🌁",
	"closed_umbrella": "🌂",
	"night_with_stars": "🌃",
	"sunrise_over_mountains": "🌄",
	"sunrise": "🌅",
	"city_sunset": "🌆",
	"city_sunrise": "🌇",
	"rainbow": "🌈",
	"bridge_at_night": "🌉",
	"ocean": "🌊",
	"volcano": "🌋",
	"milky_way": "🌌",
	"earth_africa": "🌍",
	"earth_americas": "🌎",
	"earth_asia": "🌏",
	"globe_with_meridians": "🌐",
	"new_moon": "🌑",
	"waxing_crescent_moon": "🌒",
	"first_quarter_moon": "🌓",
	"moon": "🌔",
	"waxing_gibbous_moon": "🌔",
	"full_moon": "🌕",
	"waning_gibbous_moon": "🌖",
	"last_quarter_moon": "🌗",
	"waning_crescent_moon": "🌘",
	"crescent_moon": "🌙",
	"new_moon_with_face": "🌚",
	"first_quarter_moon_with_face": "🌛",
	"last_quarter_moon_with_face": "🌜",
	"full_moon_with_face": "🌝",
	"sun_with_face": "🌞",
	"star2": "🌟",
	"stars": "🌠",
	"thermometer": "🌡",
	"mostly_sunny": "🌤",
	"sun_small_cloud": "🌤",
	"barely_sunny": "🌥",
	"sun_behind_cloud": "🌥",
	"partly_sunny_rain": "🌦",
	"sun_behind_rain_cloud": "🌦",
	"rain_cloud": "🌧",
	"snow_cloud": "🌨",
	"lightning": "🌩",
	"lightning_cloud": "🌩",
	"tornado": "🌪",
	"tornado_cloud": "🌪",
	"fog": "🌫",
	"wind_blowing_face": "🌬",
	"hotdog": "🌭",
	"taco": "🌮",
	"burrito": "🌯",
	"chestnut": "🌰",
	"seedling": "🌱",
	"evergreen_tree": "🌲",
	"deciduous_tree": "🌳",
	"palm_tree": "🌴",
	"cactus": "🌵",
	"hot_pepper": "🌶",
	"tulip": "🌷",
	"cherry_blossom": "🌸",
	"rose": "🌹",
	"hibiscus": "🌺",
	"sunflower": "🌻",
	"blossom": "🌼",
	"corn": "🌽",
	"ear_of_rice": "🌾",
	"herb": "🌿",
	"four_leaf_clover": "🍀",
	"maple_leaf": "🍁",
	"fallen_leaf": "🍂",
	"leaves": "🍃",
	"mushroom": "🍄",
	"tomato": "🍅",
	"eggplant": "🍆",
	"grapes": "🍇",
	"melon": "🍈",
	"watermelon": "🍉",
	"tangerine": "🍊",
	"lemon": "🍋",
	"banana": "🍌",
	"pineapple": "🍍",
	"apple": "🍎",
	"green_apple": "🍏",
	"pear": "🍐",
	"peach": "🍑",
	"cherries": "🍒",
	"strawberry": "🍓",
	"hamburger": "🍔",
	"pizza": "🍕",
	"meat_on_bone": "🍖",
	"poultry_leg": "🍗",
	"rice_cracker": "🍘",
	"rice_ball": "🍙",
	"rice": "🍚",
	"curry": "🍛",
	"ramen": "🍜",
	"spaghetti": "🍝",
	"bread": "🍞",
	"fries": "🍟",
	"sweet_potato": "🍠",
	"dango": "🍡",
	"oden": "🍢",
	"sushi": "🍣",
	"fried_shrimp": "🍤",
	"fish_cake": "🍥",
	"icecream": "🍦",
	"shaved_ice": "🍧",
	"ice_cream": "🍨",
	"doughnut": "🍩",
	"cookie": "🍪",
	"chocolate_bar": "🍫",
	"candy": "🍬",
	"lollipop": "🍭",
	"custard": "🍮",
	"honey_pot": "🍯",
	"cake": "🍰",
	"bento": "🍱",
	"stew": "🍲",
	"egg": "🍳",
	"fork_and_knife": "🍴",
	"tea": "🍵",
	"sake": "🍶",
	"wine_glass": "🍷",
	"cocktail": "🍸",
	"tropical_drink": "🍹",
	"beer": "🍺",
	"beers": "🍻",
	"baby_bottle": "🍼",
	"knife_fork_plate": "🍽",
	"champagne": "🍾",
	"popcorn": "🍿",
	"ribbon": "🎀",
	"gift": "🎁",
	"birthday": "🎂",
	"jack_o_lantern": "🎃",
	"christmas_tree": "🎄",
	"santa": "🎅",
	"fireworks": "🎆",
	"sparkler": "🎇",
	"balloon": "🎈",
	"tada": "🎉",
	"confetti_ball": "🎊",
	"tanabata_tree": "🎋",
	"crossed_flags": "🎌",
	"bamboo": "🎍",
	"dolls": "🎎",
	"flags": "🎏",
	"wind_chime": "🎐",
	"rice_scene": "🎑",
	"school_satchel": "🎒",
	"mortar_board": "🎓",
	"medal": "🎖",
	"reminder_ribbon": "🎗",
	"studio_microphone": "🎙",
	"level_slider": "🎚",
	"control_knobs": "🎛",
	"film_frames": "🎞",
	"admission_tickets": "🎟",
	"carousel_horse": "🎠",
	"ferris_wheel": "🎡",
	"roller_coaster": "🎢",
	"fishing_pole_and_fish": "🎣",
	"microphone": "🎤",
	"movie_camera": "🎥",
	"cinema": "🎦",
	"headphones": "🎧",
	"art": "🎨",
	"tophat": "🎩",
	"circus_tent": "🎪",
	"ticket": "🎫",
	"clapper": "🎬",
	"performing_arts": "🎭",
	"video_game": "🎮",
	"dart": "🎯",
	"slot_machine": "🎰",
	"8ball": "🎱",
	"game_die": "🎲",
	"bowling": "🎳",
	"flower_playing_cards": "🎴",
	"musical_note": "🎵",
	"notes": "🎶",
	"saxophone": "🎷",
	"guitar": "🎸",
	"musical_keyboard": "🎹",
	"trumpet": "🎺",
	"violin": "🎻",
	"musical_score": "🎼",
	"running_shirt_with_sash": "🎽",
	"tennis": "🎾",
	"ski": "🎿",
	"basketball": "🏀",
	"checkered_flag": "🏁",
	"snowboarder": "🏂",
	"runner": "🏃",
	"running": "🏃",
	"surfer": "🏄",
	"sports_medal": "🏅",
	"trophy": "🏆",
	"horse_racing": "🏇",
	"football": "🏈",
	"rugby_football": "🏉",
	"swimmer": "🏊",
	"weight_lifter": "🏋",
	"golfer": "🏌",
	"racing_motorcycle": "🏍",
	"racing_car": "🏎",
	"cricket_bat_and_ball": "🏏",
	"volleyball": "🏐",
	"field_hockey_stick_and_ball": "🏑",
	"ice_hockey_stick_and_puck": "🏒",
	"table_tennis_paddle_and_ball": "🏓",
	"snow_capped_mountain": "🏔",
	"camping": "🏕",
	"beach_with_umbrella": "🏖",
	"building_construction": "🏗",
	"house_buildings": "🏘",
	"cityscape": "🏙",
	"derelict_house_building": "🏚",
	"classical_building": "🏛",
	"desert": "🏜",
	"desert_island": "🏝",
	"national_park": "🏞",
	"stadium": "🏟",
	"house": "🏠",
	"house_with_garden": "🏡",
	"office": "🏢",
	"post_office": "🏣",
	"european_post_office": "🏤",
	"hospital": "🏥",
	"bank": "🏦",
	"atm": "🏧",
	"hotel": "🏨",
	"love_hotel": "🏩",
	"convenience_store": "🏪",
	"school": "🏫",
	"department_store": "🏬",
	"factory": "🏭",
	"izakaya_lantern": "🏮",
	"lantern": "🏮",
	"japanese_castle": "🏯",
	"european_castle": "🏰",
	"waving_white_flag": "🏳",
	"waving_black_flag": "🏴",
	"rosette": "🏵",
	"label": "🏷",
	"badminton_racquet_and_shuttlecock": "🏸",
	"bow_and_arrow": "🏹",
	"amphora": "🏺",
	"skin-tone-2": "🏻",
	"skin-tone-3": "🏼",
	"skin-tone-4": "🏽",
	"skin-tone-5": "🏾",
	"skin-tone-6": "🏿",
	"rat": "🐀",
	"mouse2": "🐁",
	"ox": "🐂",
	"water_buffalo": "🐃",
	"cow2": "🐄",
	"tiger2": "🐅",
	"leopard": "🐆",
	"rabbit2": "🐇",
	"cat2": "🐈",
	"dragon": "🐉",
	"crocodile": "🐊",
	"whale2": "🐋",
	"snail": "🐌",
	"snake": "🐍",
	"racehorse": "🐎",
	"ram": "🐏",
	"goat": "🐐",
	"sheep": "🐑",
	"monkey": "🐒",
	"rooster": "🐓",
	"chicken": "🐔",
	"dog2": "🐕",
	"pig2": "🐖",
	"boar": "🐗",
	"elephant": "🐘",
	"octopus": "🐙",
	"shell": "🐚",
	"bug": "🐛",
	"ant": "🐜",
	"bee": "🐝",
	"honeybee": "🐝",
	"beetle": "🐞",
	"fish": "🐟",
	"tropical_fish": "🐠",
	"blowfish": "🐡",
	"turtle": "🐢",
	"hatching_chick": "🐣",
	"baby_chick": "🐤",
	"hatched_chick": "🐥",
	"bird": "🐦",
	"penguin": "🐧",
	"koala": "🐨",
	"poodle": "🐩",
	"dromedary_camel": "🐪",
	"camel": "🐫",
	"dolphin": "🐬",
	"flipper": "🐬",
	"mouse": "🐭",
	"cow": "🐮",
	"tiger": "🐯",
	"rabbit": "🐰",
	"cat": "🐱",
	"dragon_face": "🐲",
	"whale": "🐳",
	"horse": "🐴",
	"monkey_face": "🐵",
	"dog": "🐶",
	"pig": "🐷",
	"frog": "🐸",
	"hamster": "🐹",
	"wolf": "🐺",
	"bear": "🐻",
	"panda_face": "🐼",
	"pig_nose": "🐽",
	"feet": "🐾",
	"paw_prints": "🐾",
	"chipmunk": "🐿",
	"eyes": "👀",
	"eye": "👁",
	"ear": "👂",
	"nose": "👃",
	"lips": "👄",
	"tongue": "👅",
	"point_up_2": "👆",
	"point_down": "👇",
	"point_left": "👈",
	"point_right": "👉",
	"facepunch": "👊",
	"punch": "👊",
	"wave": "👋",
	"ok_hand": "👌",
	"+1": "👍",
	"thumbsup": "👍",
	"-1": "👎",
	"thumbsdown": "👎",
	"clap": "👏",
	"open_hands": "👐",
	"crown": "👑",
	"womans_hat": "👒",
	"eyeglasses": "👓",
	"necktie": "👔",
	"shirt": "👕",
	"tshirt": "👕",
	"jeans": "👖",
	"dress": "👗",
	"kimono": "👘",
	"bikini": "👙",
	"womans_clothes": "👚",
	"purse": "👛",
	"handbag": "👜",
	"pouch": "👝",
	"mans_shoe": "👞",
	"shoe": "👞",
	"athletic_shoe": "👟",
	"high_heel": "👠",
	"sandal": "👡",
	"boot": "👢",
	"footprints": "👣",
	"bust_in_silhouette": "👤",
	"busts_in_silhouette": "👥",
	"boy": "👦",
	"girl": "👧",
	"man": "👨",
	"woman": "👩",
	"family": "👨‍👩‍👦",
	"man-woman-boy": "👨‍👩‍👦",
	"couple": "👫",
	"man_and_woman_holding_hands": "👫",
	"two_men_holding_hands": "👬",
	"two_women_holding_hands": "👭",
	"cop": "👮",
	"dancers": "👯",
	"bride_with_veil": "👰",
	"person_with_blond_hair": "👱",
	"man_with_gua_pi_mao": "👲",
	"man_with_turban": "👳",
	"older_man": "👴",
	"older_woman": "👵",
	"baby": "👶",
	"construction_worker": "👷",
	"princess": "👸",
	"japanese_ogre": "👹",
	"japanese_goblin": "👺",
	"ghost": "👻",
	"angel": "👼",
	"alien": "👽",
	"space_invader": "👾",
	"imp": "👿",
	"skull": "💀",
	"information_desk_person": "💁",
	"guardsman": "💂",
	"dancer": "💃",
	"lipstick": "💄",
	"nail_care": "💅",
	"massage": "💆",
	"haircut": "💇",
	"barber": "💈",
	"syringe": "💉",
	"pill": "💊",
	"kiss": "💋",
	"love_letter": "💌",
	"ring": "💍",
	"gem": "💎",
	"couplekiss": "💏",
	"bouquet": "💐",
	"couple_with_heart": "💑",
	"wedding": "💒",
	"heartbeat": "💓",
	"broken_heart": "💔",
	"two_hearts": "💕",
	"sparkling_heart": "💖",
	"heartpulse": "💗",
	"cupid": "💘",
	"blue_heart": "💙",
	"green_heart": "💚",
	"yellow_heart": "💛",
	"purple_heart": "💜",
	"gift_heart": "💝",
	"revolving_hearts": "💞",
	"heart_decoration": "💟",
	"diamond_shape_with_a_dot_inside": "💠",
	"bulb": "💡",
	"anger": "💢",
	"bomb": "💣",
	"zzz": "💤",
	"boom": "💥",
	"collision": "💥",
	"sweat_drops": "💦",
	"droplet": "💧",
	"dash": "💨",
	"hankey": "💩",
	"poop": "💩",
	"shit": "💩",
	"muscle": "💪",
	"dizzy": "💫",
	"speech_balloon": "💬",
	"thought_balloon": "💭",
	"white_flower": "💮",
	"moneybag": "💰",
	"currency_exchange": "💱",
	"heavy_dollar_sign": "💲",
	"credit_card": "💳",
	"yen": "💴",
	"dollar": "💵",
	"euro": "💶",
	"pound": "💷",
	"money_with_wings": "💸",
	"chart": "💹",
	"seat": "💺",
	"computer": "💻",
	"briefcase": "💼",
	"minidisc": "💽",
	"floppy_disk": "💾",
	"cd": "💿",
	"dvd": "📀",
	"file_folder": "📁",
	"open_file_folder": "📂",
	"page_with_curl": "📃",
	"page_facing_up": "📄",
	"date": "📅",
	"calendar": "📆",
	"card_index": "📇",
	"chart_with_upwards_trend": "📈",
	"chart_with_downwards_trend": "📉",
	"bar_chart": "📊",
	"clipboard": "📋",
	"pushpin": "📌",
	"round_pushpin": "📍",
	"paperclip": "📎",
	"straight_ruler": "📏",
	"triangular_ruler": "📐",
	"bookmark_tabs": "📑",
	"ledger": "📒",
	"notebook": "📓",
	"notebook_with_decorative_cover": "📔",
	"closed_book": "📕",
	"book": "📖",
	"open_book": "📖",
	"green_book": "📗",
	"blue_book": "📘",
	"orange_book": "📙",
	"books": "📚",
	"name_badge": "📛",
	"scroll": "📜",
	"memo": "📝",
	"pencil": "📝",
	"telephone_receiver": "📞",
	"pager": "📟",
	"fax": "📠",
	"satellite": "🛰",
	"loudspeaker": "📢",
	"mega": "📣",
	"outbox_tray": "📤",
	"inbox_tray": "📥",
	"package": "📦",
	"e-mail": "📧",
	"incoming_envelope": "📨",
	"envelope_with_arrow": "📩",
	"mailbox_closed": "📪",
	"mailbox": "📫",
	"mailbox_with_mail": "📬",
	"mailbox_with_no_mail": "📭",
	"postbox": "📮",
	"postal_horn": "📯",
	"newspaper": "📰",
	"iphone": "📱",
	"calling": "📲",
	"vibration_mode": "📳",
	"mobile_phone_off": "📴",
	"no_mobile_phones": "📵",
	"signal_strength": "📶",
	"camera": "📷",
	"camera_with_flash": "📸",
	"video_camera": "📹",
	"tv": "📺",
	"radio": "📻",
	"vhs": "📼",
	"film_projector": "📽",
	"prayer_beads": "📿",
	"twisted_rightwards_arrows": "🔀",
	"repeat": "🔁",
	"repeat_one": "🔂",
	"arrows_clockwise": "🔃",
	"arrows_counterclockwise": "🔄",
	"low_brightness": "🔅",
	"high_brightness": "🔆",
	"mute": "🔇",
	"speaker": "🔈",
	"sound": "🔉",
	"loud_sound": "🔊",
	"battery": "🔋",
	"electric_plug": "🔌",
	"mag": "🔍",
	"mag_right": "🔎",
	"lock_with_ink_pen": "🔏",
	"closed_lock_with_key": "🔐",
	"key": "🔑",
	"lock": "🔒",
	"unlock": "🔓",
	"bell": "🔔",
	"no_bell": "🔕",
	"bookmark": "🔖",
	"link": "🔗",
	"radio_button": "🔘",
	"back": "🔙",
	"end": "🔚",
	"on": "🔛",
	"soon": "🔜",
	"top": "🔝",
	"underage": "🔞",
	"keycap_ten": "🔟",
	"capital_abcd": "🔠",
	"abcd": "🔡",
	"symbols": "🔣",
	"abc": "🔤",
	"fire": "🔥",
	"flashlight": "🔦",
	"wrench": "🔧",
	"hammer": "🔨",
	"nut_and_bolt": "🔩",
	"hocho": "🔪",
	"knife": "🔪",
	"gun": "🔫",
	"microscope": "🔬",
	"telescope": "🔭",
	"crystal_ball": "🔮",
	"six_pointed_star": "🔯",
	"beginner": "🔰",
	"trident": "🔱",
	"black_square_button": "🔲",
	"white_square_button": "🔳",
	"red_circle": "🔴",
	"large_blue_circle": "🔵",
	"large_orange_diamond": "🔶",
	"large_blue_diamond": "🔷",
	"small_orange_diamond": "🔸",
	"small_blue_diamond": "🔹",
	"small_red_triangle": "🔺",
	"small_red_triangle_down": "🔻",
	"arrow_up_small": "🔼",
	"arrow_down_small": "🔽",
	"om_symbol": "🕉",
	"dove_of_peace": "🕊",
	"kaaba": "🕋",
	"mosque": "🕌",
	"synagogue": "🕍",
	"menorah_with_nine_branches": "🕎",
	"clock1": "🕐",
	"clock2": "🕑",
	"clock3": "🕒",
	"clock4": "🕓",
	"clock5": "🕔",
	"clock6": "🕕",
	"clock7": "🕖",
	"clock8": "🕗",
	"clock9": "🕘",
	"clock10": "🕙",
	"clock11": "🕚",
	"clock12": "🕛",
	"clock130": "🕜",
	"clock230": "🕝",
	"clock330": "🕞",
	"clock430": "🕟",
	"clock530": "🕠",
	"clock630": "🕡",
	"clock730": "🕢",
	"clock830": "🕣",
	"clock930": "🕤",
	"clock1030": "🕥",
	"clock1130": "🕦",
	"clock1230": "🕧",
	"candle": "🕯",
	"mantelpiece_clock": "🕰",
	"hole": "🕳",
	"man_in_business_suit_levitating": "🕴",
	"sleuth_or_spy": "🕵",
	"dark_sunglasses": "🕶",
	"spider": "🕷",
	"spider_web": "🕸",
	"joystick": "🕹",
	"linked_paperclips": "🖇",
	"lower_left_ballpoint_pen": "🖊",
	"lower_left_fountain_pen": "🖋",
	"lower_left_paintbrush": "🖌",
	"lower_left_crayon": "🖍",
	"raised_hand_with_fingers_splayed": "🖐",
	"middle_finger": "🖕",
	"reversed_hand_with_middle_finger_extended": "🖕",
	"spock-hand": "🖖",
	"desktop_computer": "🖥",
	"printer": "🖨",
	"three_button_mouse": "🖱",
	"trackball": "🖲",
	"frame_with_picture": "🖼",
	"card_index_dividers": "🗂",
	"card_file_box": "🗃",
	"file_cabinet": "🗄",
	"wastebasket": "🗑",
	"spiral_note_pad": "🗒",
	"spiral_calendar_pad": "🗓",
	"compression": "🗜",
	"old_key": "🗝",
	"rolled_up_newspaper": "🗞",
	"dagger_knife": "🗡",
	"speaking_head_in_silhouette": "🗣",
	"left_speech_bubble": "🗨",
	"right_anger_bubble": "🗯",
	"ballot_box_with_ballot": "🗳",
	"world_map": "🗺",
	"mount_fuji": "🗻",
	"tokyo_tower": "🗼",
	"statue_of_liberty": "🗽",
	"japan": "🗾",
	"moyai": "🗿",
	"grinning": "😀",
	"grin": "😁",
	"joy": "😂",
	"smiley": "😃",
	"smile": "😄",
	"sweat_smile": "😅",
	"laughing": "😆",
	"satisfied": "😆",
	"innocent": "😇",
	"smiling_imp": "😈",
	"wink": "😉",
	"blush": "😊",
	"yum": "😋",
	"relieved": "😌",
	"heart_eyes": "😍",
	"sunglasses": "😎",
	"smirk": "😏",
	"neutral_face": "😐",
	"expressionless": "😑",
	"unamused": "😒",
	"sweat": "😓",
	"pensive": "😔",
	"confused": "😕",
	"confounded": "😖",
	"kissing": "😗",
	"kissing_heart": "😘",
	"kissing_smiling_eyes": "😙",
	"kissing_closed_eyes": "😚",
	"stuck_out_tongue": "😛",
	"stuck_out_tongue_winking_eye": "😜",
	"stuck_out_tongue_closed_eyes": "😝",
	"disappointed": "😞",
	"worried": "😟",
	"angry": "😠",
	"rage": "😡",
	"cry": "😢",
	"persevere": "😣",
	"triumph": "😤",
	"disappointed_relieved": "😥",
	"frowning": "😦",
	"anguished": "😧",
	"fearful": "😨",
	"weary": "😩",
	"sleepy": "😪",
	"tired_face": "😫",
	"grimacing": "😬",
	"sob": "😭",
	"open_mouth": "😮",
	"hushed": "😯",
	"cold_sweat": "😰",
	"scream": "😱",
	"astonished": "😲",
	"flushed": "😳",
	"sleeping": "😴",
	"dizzy_face": "😵",
	"no_mouth": "😶",
	"mask": "😷",
	"smile_cat": "😸",
	"joy_cat": "😹",
	"smiley_cat": "😺",
	"heart_eyes_cat": "😻",
	"smirk_cat": "😼",
	"kissing_cat": "😽",
	"pouting_cat": "😾",
	"crying_cat_face": "😿",
	"scream_cat": "🙀",
	"slightly_frowning_face": "🙁",
	"slightly_smiling_face": "🙂",
	"upside_down_face": "🙃",
	"face_with_rolling_eyes": "🙄",
	"no_good": "🙅",
	"ok_woman": "🙆",
	"bow": "🙇",
	"see_no_evil": "🙈",
	"hear_no_evil": "🙉",
	"speak_no_evil": "🙊",
	"raising_hand": "🙋",
	"raised_hands": "🙌",
	"person_frowning": "🙍",
	"person_with_pouting_face": "🙎",
	"pray": "🙏",
	"rocket": "🚀",
	"helicopter": "🚁",
	"steam_locomotive": "🚂",
	"railway_car": "🚃",
	"bullettrain_side": "🚄",
	"bullettrain_front": "🚅",
	"train2": "🚆",
	"metro": "🚇",
	"light_rail": "🚈",
	"station": "🚉",
	"tram": "🚊",
	"train": "🚋",
	"bus": "🚌",
	"oncoming_bus": "🚍",
	"trolleybus": "🚎",
	"busstop": "🚏",
	"minibus": "🚐",
	"ambulance": "🚑",
	"fire_engine": "🚒",
	"police_car": "🚓",
	"oncoming_police_car": "🚔",
	"taxi": "🚕",
	"oncoming_taxi": "🚖",
	"car": "🚗",
	"red_car": "🚗",
	"oncoming_automobile": "🚘",
	"blue_car": "🚙",
	"truck": "🚚",
	"articulated_lorry": "🚛",
	"tractor": "🚜",
	"monorail": "🚝",
	"mountain_railway": "🚞",
	"suspension_railway": "🚟",
	"mountain_cableway": "🚠",
	"aerial_tramway": "🚡",
	"ship": "🚢",
	"rowboat": "🚣",
	"speedboat": "🚤",
	"traffic_light": "🚥",
	"vertical_traffic_light": "🚦",
	"construction": "🚧",
	"rotating_light": "🚨",
	"triangular_flag_on_post": "🚩",
	"door": "🚪",
	"no_entry_sign": "🚫",
	"smoking": "🚬",
	"no_smoking": "🚭",
	"put_litter_in_its_place": "🚮",
	"do_not_litter": "🚯",
	"potable_water": "🚰",
	"non-potable_water": "🚱",
	"bike": "🚲",
	"no_bicycles": "🚳",
	"bicyclist": "🚴",
	"mountain_bicyclist": "🚵",
	"walking": "🚶",
	"no_pedestrians": "🚷",
	"children_crossing": "🚸",
	"mens": "🚹",
	"womens": "🚺",
	"restroom": "🚻",
	"baby_symbol": "🚼",
	"toilet": "🚽",
	"wc": "🚾",
	"shower": "🚿",
	"bath": "🛀",
	"bathtub": "🛁",
	"passport_control": "🛂",
	"customs": "🛃",
	"baggage_claim": "🛄",
	"left_luggage": "🛅",
	"couch_and_lamp": "🛋",
	"sleeping_accommodation": "🛌",
	"shopping_bags": "🛍",
	"bellhop_bell": "🛎",
	"bed": "🛏",
	"place_of_worship": "🛐",
	"hammer_and_wrench": "🛠",
	"shield": "🛡",
	"oil_drum": "🛢",
	"motorway": "🛣",
	"railway_track": "🛤",
	"motor_boat": "🛥",
	"small_airplane": "🛩",
	"airplane_departure": "🛫",
	"airplane_arriving": "🛬",
	"passenger_ship": "🛳",
	"zipper_mouth_face": "🤐",
	"money_mouth_face": "🤑",
	"face_with_thermometer": "🤒",
	"nerd_face": "🤓",
	"thinking_face": "🤔",
	"face_with_head_bandage": "🤕",
	"robot_face": "🤖",
	"hugging_face": "🤗",
	"the_horns": "🤘",
	"sign_of_the_horns": "🤘",
	"crab": "🦀",
	"lion_face": "🦁",
	"scorpion": "🦂",
	"turkey": "🦃",
	"unicorn_face": "🦄",
	"cheese_wedge": "🧀",
	"hash": "#️⃣",
	"keycap_star": "*⃣",
	"zero": "0️⃣",
	"one": "1️⃣",
	"two": "2️⃣",
	"three": "3️⃣",
	"four": "4️⃣",
	"five": "5️⃣",
	"six": "6️⃣",
	"seven": "7️⃣",
	"eight": "8️⃣",
	"nine": "9️⃣",
	"flag-ac": "🇦🇨",
	"flag-ad": "🇦🇩",
	"flag-ae": "🇦🇪",
	"flag-af": "🇦🇫",
	"flag-ag": "🇦🇬",
	"flag-ai": "🇦🇮",
	"flag-al": "🇦🇱",
	"flag-am": "🇦🇲",
	"flag-ao": "🇦🇴",
	"flag-aq": "🇦🇶",
	"flag-ar": "🇦🇷",
	"flag-as": "🇦🇸",
	"flag-at": "🇦🇹",
	"flag-au": "🇦🇺",
	"flag-aw": "🇦🇼",
	"flag-ax": "🇦🇽",
	"flag-az": "🇦🇿",
	"flag-ba": "🇧🇦",
	"flag-bb": "🇧🇧",
	"flag-bd": "🇧🇩",
	"flag-be": "🇧🇪",
	"flag-bf": "🇧🇫",
	"flag-bg": "🇧🇬",
	"flag-bh": "🇧🇭",
	"flag-bi": "🇧🇮",
	"flag-bj": "🇧🇯",
	"flag-bl": "🇧🇱",
	"flag-bm": "🇧🇲",
	"flag-bn": "🇧🇳",
	"flag-bo": "🇧🇴",
	"flag-bq": "🇧🇶",
	"flag-br": "🇧🇷",
	"flag-bs": "🇧🇸",
	"flag-bt": "🇧🇹",
	"flag-bv": "🇧🇻",
	"flag-bw": "🇧🇼",
	"flag-by": "🇧🇾",
	"flag-bz": "🇧🇿",
	"flag-ca": "🇨🇦",
	"flag-cc": "🇨🇨",
	"flag-cd": "🇨🇩",
	"flag-cf": "🇨🇫",
	"flag-cg": "🇨🇬",
	"flag-ch": "🇨🇭",
	"flag-ci": "🇨🇮",
	"flag-ck": "🇨🇰",
	"flag-cl": "🇨🇱",
	"flag-cm": "🇨🇲",
	"flag-cn": "🇨🇳",
	"cn": "🇨🇳",
	"flag-co": "🇨🇴",
	"flag-cp": "🇨🇵",
	"flag-cr": "🇨🇷",
	"flag-cu": "🇨🇺",
	"flag-cv": "🇨🇻",
	"flag-cw": "🇨🇼",
	"flag-cx": "🇨🇽",
	"flag-cy": "🇨🇾",
	"flag-cz": "🇨🇿",
	"flag-de": "🇩🇪",
	"de": "🇩🇪",
	"flag-dg": "🇩🇬",
	"flag-dj": "🇩🇯",
	"flag-dk": "🇩🇰",
	"flag-dm": "🇩🇲",
	"flag-do": "🇩🇴",
	"flag-dz": "🇩🇿",
	"flag-ea": "🇪🇦",
	"flag-ec": "🇪🇨",
	"flag-ee": "🇪🇪",
	"flag-eg": "🇪🇬",
	"flag-eh": "🇪🇭",
	"flag-er": "🇪🇷",
	"flag-es": "🇪🇸",
	"es": "🇪🇸",
	"flag-et": "🇪🇹",
	"flag-eu": "🇪🇺",
	"flag-fi": "🇫🇮",
	"flag-fj": "🇫🇯",
	"flag-fk": "🇫🇰",
	"flag-fm": "🇫🇲",
	"flag-fo": "🇫🇴",
	"flag-fr": "🇫🇷",
	"fr": "🇫🇷",
	"flag-ga": "🇬🇦",
	"flag-gb": "🇬🇧",
	"gb": "🇬🇧",
	"uk": "🇬🇧",
	"flag-gd": "🇬🇩",
	"flag-ge": "🇬🇪",
	"flag-gf": "🇬🇫",
	"flag-gg": "🇬🇬",
	"flag-gh": "🇬🇭",
	"flag-gi": "🇬🇮",
	"flag-gl": "🇬🇱",
	"flag-gm": "🇬🇲",
	"flag-gn": "🇬🇳",
	"flag-gp": "🇬🇵",
	"flag-gq": "🇬🇶",
	"flag-gr": "🇬🇷",
	"flag-gs": "🇬🇸",
	"flag-gt": "🇬🇹",
	"flag-gu": "🇬🇺",
	"flag-gw": "🇬🇼",
	"flag-gy": "🇬🇾",
	"flag-hk": "🇭🇰",
	"flag-hm": "🇭🇲",
	"flag-hn": "🇭🇳",
	"flag-hr": "🇭🇷",
	"flag-ht": "🇭🇹",
	"flag-hu": "🇭🇺",
	"flag-ic": "🇮🇨",
	"flag-id": "🇮🇩",
	"flag-ie": "🇮🇪",
	"flag-il": "🇮🇱",
	"flag-im": "🇮🇲",
	"flag-in": "🇮🇳",
	"flag-io": "🇮🇴",
	"flag-iq": "🇮🇶",
	"flag-ir": "🇮🇷",
	"flag-is": "🇮🇸",
	"flag-it": "🇮🇹",
	"it": "🇮🇹",
	"flag-je": "🇯🇪",
	"flag-jm": "🇯🇲",
	"flag-jo": "🇯🇴",
	"flag-jp": "🇯🇵",
	"jp": "🇯🇵",
	"flag-ke": "🇰🇪",
	"flag-kg": "🇰🇬",
	"flag-kh": "🇰🇭",
	"flag-ki": "🇰🇮",
	"flag-km": "🇰🇲",
	"flag-kn": "🇰🇳",
	"flag-kp": "🇰🇵",
	"flag-kr": "🇰🇷",
	"kr": "🇰🇷",
	"flag-kw": "🇰🇼",
	"flag-ky": "🇰🇾",
	"flag-kz": "🇰🇿",
	"flag-la": "🇱🇦",
	"flag-lb": "🇱🇧",
	"flag-lc": "🇱🇨",
	"flag-li": "🇱🇮",
	"flag-lk": "🇱🇰",
	"flag-lr": "🇱🇷",
	"flag-ls": "🇱🇸",
	"flag-lt": "🇱🇹",
	"flag-lu": "🇱🇺",
	"flag-lv": "🇱🇻",
	"flag-ly": "🇱🇾",
	"flag-ma": "🇲🇦",
	"flag-mc": "🇲🇨",
	"flag-md": "🇲🇩",
	"flag-me": "🇲🇪",
	"flag-mf": "🇲🇫",
	"flag-mg": "🇲🇬",
	"flag-mh": "🇲🇭",
	"flag-mk": "🇲🇰",
	"flag-ml": "🇲🇱",
	"flag-mm": "🇲🇲",
	"flag-mn": "🇲🇳",
	"flag-mo": "🇲🇴",
	"flag-mp": "🇲🇵",
	"flag-mq": "🇲🇶",
	"flag-mr": "🇲🇷",
	"flag-ms": "🇲🇸",
	"flag-mt": "🇲🇹",
	"flag-mu": "🇲🇺",
	"flag-mv": "🇲🇻",
	"flag-mw": "🇲🇼",
	"flag-mx": "🇲🇽",
	"flag-my": "🇲🇾",
	"flag-mz": "🇲🇿",
	"flag-na": "🇳🇦",
	"flag-nc": "🇳🇨",
	"flag-ne": "🇳🇪",
	"flag-nf": "🇳🇫",
	"flag-ng": "🇳🇬",
	"flag-ni": "🇳🇮",
	"flag-nl": "🇳🇱",
	"flag-no": "🇳🇴",
	"flag-np": "🇳🇵",
	"flag-nr": "🇳🇷",
	"flag-nu": "🇳🇺",
	"flag-nz": "🇳🇿",
	"flag-om": "🇴🇲",
	"flag-pa": "🇵🇦",
	"flag-pe": "🇵🇪",
	"flag-pf": "🇵🇫",
	"flag-pg": "🇵🇬",
	"flag-ph": "🇵🇭",
	"flag-pk": "🇵🇰",
	"flag-pl": "🇵🇱",
	"flag-pm": "🇵🇲",
	"flag-pn": "🇵🇳",
	"flag-pr": "🇵🇷",
	"flag-ps": "🇵🇸",
	"flag-pt": "🇵🇹",
	"flag-pw": "🇵🇼",
	"flag-py": "🇵🇾",
	"flag-qa": "🇶🇦",
	"flag-re": "🇷🇪",
	"flag-ro": "🇷🇴",
	"flag-rs": "🇷🇸",
	"flag-ru": "🇷🇺",
	"ru": "🇷🇺",
	"flag-rw": "🇷🇼",
	"flag-sa": "🇸🇦",
	"flag-sb": "🇸🇧",
	"flag-sc": "🇸🇨",
	"flag-sd": "🇸🇩",
	"flag-se": "🇸🇪",
	"flag-sg": "🇸🇬",
	"flag-sh": "🇸🇭",
	"flag-si": "🇸🇮",
	"flag-sj": "🇸🇯",
	"flag-sk": "🇸🇰",
	"flag-sl": "🇸🇱",
	"flag-sm": "🇸🇲",
	"flag-sn": "🇸🇳",
	"flag-so": "🇸🇴",
	"flag-sr": "🇸🇷",
	"flag-ss": "🇸🇸",
	"flag-st": "🇸🇹",
	"flag-sv": "🇸🇻",
	"flag-sx": "🇸🇽",
	"flag-sy": "🇸🇾",
	"flag-sz": "🇸🇿",
	"flag-ta": "🇹🇦",
	"flag-tc": "🇹🇨",
	"flag-td": "🇹🇩",
	"flag-tf": "🇹🇫",
	"flag-tg": "🇹🇬",
	"flag-th": "🇹🇭",
	"flag-tj": "🇹🇯",
	"flag-tk": "🇹🇰",
	"flag-tl": "🇹🇱",
	"flag-tm": "🇹🇲",
	"flag-tn": "🇹🇳",
	"flag-to": "🇹🇴",
	"flag-tr": "🇹🇷",
	"flag-tt": "🇹🇹",
	"flag-tv": "🇹🇻",
	"flag-tw": "🇹🇼",
	"flag-tz": "🇹🇿",
	"flag-ua": "🇺🇦",
	"flag-ug": "🇺🇬",
	"flag-um": "🇺🇲",
	"flag-us": "🇺🇸",
	"us": "🇺🇸",
	"flag-uy": "🇺🇾",
	"flag-uz": "🇺🇿",
	"flag-va": "🇻🇦",
	"flag-vc": "🇻🇨",
	"flag-ve": "🇻🇪",
	"flag-vg": "🇻🇬",
	"flag-vi": "🇻🇮",
	"flag-vn": "🇻🇳",
	"flag-vu": "🇻🇺",
	"flag-wf": "🇼🇫",
	"flag-ws": "🇼🇸",
	"flag-xk": "🇽🇰",
	"flag-ye": "🇾🇪",
	"flag-yt": "🇾🇹",
	"flag-za": "🇿🇦",
	"flag-zm": "🇿🇲",
	"flag-zw": "🇿🇼",
	"man-man-boy": "👨‍👨‍👦",
	"man-man-boy-boy": "👨‍👨‍👦‍👦",
	"man-man-girl": "👨‍👨‍👧",
	"man-man-girl-boy": "👨‍👨‍👧‍👦",
	"man-man-girl-girl": "👨‍👨‍👧‍👧",
	"man-woman-boy-boy": "👨‍👩‍👦‍👦",
	"man-woman-girl": "👨‍👩‍👧",
	"man-woman-girl-boy": "👨‍👩‍👧‍👦",
	"man-woman-girl-girl": "👨‍👩‍👧‍👧",
	"man-heart-man": "👨‍❤️‍👨",
	"man-kiss-man": "👨‍❤️‍💋‍👨",
	"woman-woman-boy": "👩‍👩‍👦",
	"woman-woman-boy-boy": "👩‍👩‍👦‍👦",
	"woman-woman-girl": "👩‍👩‍👧",
	"woman-woman-girl-boy": "👩‍👩‍👧‍👦",
	"woman-woman-girl-girl": "👩‍👩‍👧‍👧",
	"woman-heart-woman": "👩‍❤️‍👩",
	"woman-kiss-woman": "👩‍❤️‍💋‍👩"
};

/***/ }),

/***/ "../node_modules/stack-generator/stack-generator.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__("../node_modules/stackframe/stackframe.js")], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if (typeof exports === 'object') {
        module.exports = factory(require('stackframe'));
    } else {
        root.StackGenerator = factory(root.StackFrame);
    }
}(this, function(StackFrame) {
    return {
        backtrace: function StackGenerator$$backtrace(opts) {
            var stack = [];
            var maxStackSize = 10;

            if (typeof opts === 'object' && typeof opts.maxStackSize === 'number') {
                maxStackSize = opts.maxStackSize;
            }

            var curr = arguments.callee;
            while (curr && stack.length < maxStackSize) {
                // Allow V8 optimizations
                var args = new Array(curr['arguments'].length);
                for (var i = 0; i < args.length; ++i) {
                    args[i] = curr['arguments'][i];
                }
                if (/function(?:\s+([\w$]+))+\s*\(/.test(curr.toString())) {
                    stack.push(new StackFrame({functionName: RegExp.$1 || undefined, args: args}));
                } else {
                    stack.push(new StackFrame({args: args}));
                }

                try {
                    curr = curr.caller;
                } catch (e) {
                    break;
                }
            }
            return stack;
        }
    };
}));


/***/ }),

/***/ "../node_modules/stackframe/stackframe.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function(root, factory) {
    'use strict';
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, Rhino, and browsers.

    /* istanbul ignore next */
    if (true) {
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.StackFrame = factory();
    }
}(this, function() {
    'use strict';
    function _isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    function _capitalize(str) {
        return str[0].toUpperCase() + str.substring(1);
    }

    function _getter(p) {
        return function() {
            return this[p];
        };
    }

    var booleanProps = ['isConstructor', 'isEval', 'isNative', 'isToplevel'];
    var numericProps = ['columnNumber', 'lineNumber'];
    var stringProps = ['fileName', 'functionName', 'source'];
    var arrayProps = ['args'];

    var props = booleanProps.concat(numericProps, stringProps, arrayProps);

    function StackFrame(obj) {
        if (obj instanceof Object) {
            for (var i = 0; i < props.length; i++) {
                if (obj.hasOwnProperty(props[i]) && obj[props[i]] !== undefined) {
                    this['set' + _capitalize(props[i])](obj[props[i]]);
                }
            }
        }
    }

    StackFrame.prototype = {
        getArgs: function() {
            return this.args;
        },
        setArgs: function(v) {
            if (Object.prototype.toString.call(v) !== '[object Array]') {
                throw new TypeError('Args must be an Array');
            }
            this.args = v;
        },

        getEvalOrigin: function() {
            return this.evalOrigin;
        },
        setEvalOrigin: function(v) {
            if (v instanceof StackFrame) {
                this.evalOrigin = v;
            } else if (v instanceof Object) {
                this.evalOrigin = new StackFrame(v);
            } else {
                throw new TypeError('Eval Origin must be an Object or StackFrame');
            }
        },

        toString: function() {
            var functionName = this.getFunctionName() || '{anonymous}';
            var args = '(' + (this.getArgs() || []).join(',') + ')';
            var fileName = this.getFileName() ? ('@' + this.getFileName()) : '';
            var lineNumber = _isNumber(this.getLineNumber()) ? (':' + this.getLineNumber()) : '';
            var columnNumber = _isNumber(this.getColumnNumber()) ? (':' + this.getColumnNumber()) : '';
            return functionName + args + fileName + lineNumber + columnNumber;
        }
    };

    for (var i = 0; i < booleanProps.length; i++) {
        StackFrame.prototype['get' + _capitalize(booleanProps[i])] = _getter(booleanProps[i]);
        StackFrame.prototype['set' + _capitalize(booleanProps[i])] = (function(p) {
            return function(v) {
                this[p] = Boolean(v);
            };
        })(booleanProps[i]);
    }

    for (var j = 0; j < numericProps.length; j++) {
        StackFrame.prototype['get' + _capitalize(numericProps[j])] = _getter(numericProps[j]);
        StackFrame.prototype['set' + _capitalize(numericProps[j])] = (function(p) {
            return function(v) {
                if (!_isNumber(v)) {
                    throw new TypeError(p + ' must be a Number');
                }
                this[p] = Number(v);
            };
        })(numericProps[j]);
    }

    for (var k = 0; k < stringProps.length; k++) {
        StackFrame.prototype['get' + _capitalize(stringProps[k])] = _getter(stringProps[k]);
        StackFrame.prototype['set' + _capitalize(stringProps[k])] = (function(p) {
            return function(v) {
                this[p] = String(v);
            };
        })(stringProps[k]);
    }

    return StackFrame;
}));


/***/ }),

/***/ "../node_modules/string.prototype.codepointat/codepointat.js":
/***/ (function(module, exports) {

/*! http://mths.be/codepointat v0.2.0 by @mathias */
if (!String.prototype.codePointAt) {
	(function() {
		'use strict'; // needed to support `apply`/`call` with `undefined`/`null`
		var defineProperty = (function() {
			// IE 8 only supports `Object.defineProperty` on DOM elements
			try {
				var object = {};
				var $defineProperty = Object.defineProperty;
				var result = $defineProperty(object, object, object) && $defineProperty;
			} catch(error) {}
			return result;
		}());
		var codePointAt = function(position) {
			if (this == null) {
				throw TypeError();
			}
			var string = String(this);
			var size = string.length;
			// `ToInteger`
			var index = position ? Number(position) : 0;
			if (index != index) { // better `isNaN`
				index = 0;
			}
			// Account for out-of-bounds indices:
			if (index < 0 || index >= size) {
				return undefined;
			}
			// Get the first code unit
			var first = string.charCodeAt(index);
			var second;
			if ( // check if it’s the start of a surrogate pair
				first >= 0xD800 && first <= 0xDBFF && // high surrogate
				size > index + 1 // there is a next code unit
			) {
				second = string.charCodeAt(index + 1);
				if (second >= 0xDC00 && second <= 0xDFFF) { // low surrogate
					// http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
					return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
				}
			}
			return first;
		};
		if (defineProperty) {
			defineProperty(String.prototype, 'codePointAt', {
				'value': codePointAt,
				'configurable': true,
				'writable': true
			});
		} else {
			String.prototype.codePointAt = codePointAt;
		}
	}());
}


/***/ }),

/***/ "../node_modules/universal-logger-browser/lib/index.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.styleable = exports.minimal = undefined;

var _minimal2 = __webpack_require__("../node_modules/universal-logger-browser/lib/minimal.js");

var _minimal3 = _interopRequireDefault(_minimal2);

var _styleable2 = __webpack_require__("../node_modules/universal-logger-browser/lib/styleable.js");

var _styleable3 = _interopRequireDefault(_styleable2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports.minimal = _minimal3['default'];
exports.styleable = _styleable3['default'];

/***/ }),

/***/ "../node_modules/universal-logger-browser/lib/minimal.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/* eslint no-console: 0 */
var defaultFormatter = function defaultFormatter(context, messages) {
    var _context = _extends({}, context),
        level = _context.level,
        namespace = _context.namespace;

    var formatters = [];

    if (level && level.name) {
        formatters.push(level.name.toUpperCase());
    }

    if (namespace) {
        formatters.push(namespace);
    }

    messages = [formatters.join(' ')].concat(messages);

    return messages;
};

var nativeConsoleMethods = {
    trace: typeof console !== 'undefined' && console.trace,
    debug: typeof console !== 'undefined' && console.debug,
    info: typeof console !== 'undefined' && console.info,
    warn: typeof console !== 'undefined' && console.warn,
    error: typeof console !== 'undefined' && console.error
};

var noop = function noop() {};

var minimal = function minimal(options) {
    var _options = _extends({}, options),
        _options$useNativeCon = _options.useNativeConsoleMethods,
        useNativeConsoleMethods = _options$useNativeCon === undefined ? true : _options$useNativeCon,
        _options$showSource = _options.showSource,
        showSource = _options$showSource === undefined ? true : _options$showSource,
        _options$formatter = _options.formatter,
        formatter = _options$formatter === undefined ? defaultFormatter : _options$formatter;

    if (typeof formatter !== 'function') {
        formatter = function formatter(context, messages) {
            return messages;
        };
    }

    return function (context, messages) {
        var next = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : noop;

        if (typeof next !== 'function') {
            next = noop;
        }
        if (typeof console === 'undefined') {
            next();
            return;
        }
        messages = formatter(context, messages);

        if (showSource && context.stackframes.length > 0) {
            var stackframeIndex = Math.min(4, context.stackframes.length - 1);
            var source = context.stackframes[stackframeIndex].source || '';
            messages = messages.concat(source);
        }

        var log = useNativeConsoleMethods ? nativeConsoleMethods[context.level.name] || console.log || noop : console.log || noop;
        Function.prototype.apply.call(log, console, messages);

        next();
    };
};

exports['default'] = minimal;

/***/ }),

/***/ "../node_modules/universal-logger-browser/lib/object-to-css.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
var unitless = {
    animationIterationCount: true,
    boxFlex: true,
    boxFlexGroup: true,
    boxOrdinalGroup: true,
    columnCount: true,
    flex: true,
    flexGrow: true,
    flexPositive: true,
    flexShrink: true,
    flexNegative: true,
    flexOrder: true,
    gridRow: true,
    gridColumn: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    tabSize: true,
    widows: true,
    zIndex: true,
    zoom: true,

    // SVG properties
    fillOpacity: true,
    stopOpacity: true,
    strokeDashoffset: true,
    strokeOpacity: true,
    strokeWidth: true
};

var normalizeVendorPrefix = function () {
    var uppercasePattern = /[A-Z]/g;
    var msPattern = /^ms-/;
    return function (str) {
        return str.replace(uppercasePattern, '-$&').toLowerCase().replace(msPattern, '-ms-');
    };
}();

var normalizeStyleValue = function normalizeStyleValue(name, value) {
    if (typeof value === 'number' && !unitless[name]) {
        return value + 'px';
    }
    return value;
};

exports['default'] = function () {
    var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return Object.keys(obj).map(function (key) {
        var val = obj[key];
        return normalizeVendorPrefix(key) + ':' + normalizeStyleValue(key, val) + ';';
    }).join('');
};

/***/ }),

/***/ "../node_modules/universal-logger-browser/lib/styleable-style.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _objectToCss = __webpack_require__("../node_modules/universal-logger-browser/lib/object-to-css.js");

var _objectToCss2 = _interopRequireDefault(_objectToCss);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

exports['default'] = {
    timestamp: (0, _objectToCss2['default'])({
        lineHeight: 2,
        padding: '2px 0',
        color: '#3B5998',
        background: '#EDEFF4'
    }),
    namespace: (0, _objectToCss2['default'])({
        lineHeight: 2,
        color: '#036F96'
    }),
    level: {
        trace: (0, _objectToCss2['default'])({
            lineHeight: 2,
            padding: '2px 5px',
            border: '1px solid #4F8A10',
            color: '#4F8A10',
            background: '#DFF2BF'
        }),
        debug: (0, _objectToCss2['default'])({
            lineHeight: 2,
            padding: '2px 5px',
            border: '1px solid #222',
            color: '#222',
            background: '#FFF'
        }),
        info: (0, _objectToCss2['default'])({
            lineHeight: 2,
            padding: '2px 5px',
            border: '1px solid #00529B',
            color: '#00529B',
            background: '#BDE5F8'
        }),
        warn: (0, _objectToCss2['default'])({
            lineHeight: 2,
            padding: '2px 5px',
            border: '1px solid #9F6000',
            color: '#9F6000',
            background: '#EFEFB3'
        }),
        error: (0, _objectToCss2['default'])({
            lineHeight: 2,
            padding: '2px 5px',
            border: '1px solid #D8000C',
            color: '#D8000C',
            background: '#FFBABA'
        })
    }
};

/***/ }),

/***/ "../node_modules/universal-logger-browser/lib/styleable.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /* eslint no-console: 0 */


var _objectToCss = __webpack_require__("../node_modules/universal-logger-browser/lib/object-to-css.js");

var _objectToCss2 = _interopRequireDefault(_objectToCss);

var _styleableStyle = __webpack_require__("../node_modules/universal-logger-browser/lib/styleable-style.js");

var _styleableStyle2 = _interopRequireDefault(_styleableStyle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var noop = function noop() {};

var styleable = function styleable(options) {
    var _options = _extends({}, options),
        _options$colorized = _options.colorized,
        colorized = _options$colorized === undefined ? true : _options$colorized,
        _options$showSource = _options.showSource,
        showSource = _options$showSource === undefined ? true : _options$showSource,
        _options$showTimestam = _options.showTimestamp,
        showTimestamp = _options$showTimestam === undefined ? false : _options$showTimestam,
        _options$formatTimest = _options.formatTimestamp,
        formatTimestamp = _options$formatTimest === undefined ? function (t) {
        return new Date(t).toISOString();
    } : _options$formatTimest;

    options = options || {};
    options.style = options.style || {};
    options.style.level = options.style.level || {};
    var style = _extends({}, _styleableStyle2['default'], options.style, {
        level: _extends({}, _styleableStyle2['default'].level, options.style.level)
    });

    return function (context, messages, next) {
        if (typeof next !== 'function') {
            next = noop;
        }
        if (typeof console === 'undefined') {
            next();
            return;
        }

        var _context = _extends({}, context),
            namespace = _context.namespace,
            level = _context.level,
            _context$stackframes = _context.stackframes,
            stackframes = _context$stackframes === undefined ? [] : _context$stackframes;

        var timestamp = new Date().getTime();
        var formatters = [];
        var styles = [];

        if (showTimestamp) {
            var str = typeof formatTimestamp === 'function' ? formatTimestamp(timestamp) : timestamp;

            if (colorized) {
                formatters.push('%c ' + str + ' %c');
                styles.push(style.timestamp);
                styles.push('');
            } else {
                formatters.push(str);
            }
        }

        if (level && level.name) {
            if (colorized) {
                var _str = level.name.toUpperCase();
                formatters.push('%c' + _str + '%c');
                var styledLevel = style.level[level.name] || '';

                if ((typeof styledLevel === 'undefined' ? 'undefined' : _typeof(styledLevel)) === 'object') {
                    styles.push((0, _objectToCss2['default'])(styledLevel));
                } else {
                    styles.push(String(styledLevel));
                }
                styles.push('');
            } else {
                formatters.push(level.name.toUpperCase());
            }
        }

        if (namespace) {
            if (colorized) {
                formatters.push('%c' + name + '%c');
                styles.push(style.name);
                styles.push('');
            } else {
                formatters.push(name);
            }
        }

        messages = [formatters.join(' ')].concat(styles, messages);

        if (showSource && stackframes.length > 0) {
            var stackframeIndex = Math.min(4, stackframes.length - 1);
            var source = stackframes[stackframeIndex].source || '';
            messages = messages.concat(source);
        }

        var log = console.log || noop;
        Function.prototype.apply.call(log, console, messages);

        next();
    };
};

exports['default'] = styleable;

/***/ }),

/***/ "../src/LogLevel.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LogLevel = function LogLevel(name, value) {
    _classCallCheck(this, LogLevel);

    this.name = '';
    this.value = 9999;

    if (typeof name !== 'string' || !name) {
        throw new Error('The given name (' + name + ') is not a valid string.');
    }
    if (typeof value !== 'number') {
        throw new Error('The given value (' + value + ') is not a valid number.');
    }

    this.name = String(name || '');
    this.value = Number(value) || 0;
};

exports['default'] = LogLevel;

/***/ }),

/***/ "../src/Logger.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _events = __webpack_require__("../node_modules/events/events.js");

var _stacktrace = __webpack_require__("../src/stacktrace.js");

var _stacktrace2 = _interopRequireDefault(_stacktrace);

var _LogLevel = __webpack_require__("../src/LogLevel.js");

var _LogLevel2 = _interopRequireDefault(_LogLevel);

var _constants = __webpack_require__("../src/constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Logger = function (_EventEmitter) {
    _inherits(Logger, _EventEmitter);

    function Logger(namespace, options) {
        _classCallCheck(this, Logger);

        var _this = _possibleConstructorReturn(this, _EventEmitter.call(this));

        _this.namespace = '';
        _this.level = _constants.OFF;
        _this.stacktrace = false;
        _this.chainedHandlers = [];


        if ((typeof namespace === 'undefined' ? 'undefined' : _typeof(namespace)) === 'object') {
            options = namespace;
            namespace = ''; // master
        }

        var _options = _extends({}, options),
            _options$level = _options.level,
            level = _options$level === undefined ? _this.level : _options$level;

        _this.namespace = namespace;
        _this.setLevel(level);
        return _this;
    }

    Logger.prototype.invokeChainedHandlers = function invokeChainedHandlers(level, messages) {
        var _this2 = this;

        var i = 0;

        var context = {
            namespace: this.namespace,
            level: level,
            stackframes: []
        };
        var next = function next() {
            var handler = i < _this2.chainedHandlers.length ? _this2.chainedHandlers[i] : null;
            if (!handler) {
                return;
            }

            ++i;
            handler(_extends({}, context), messages, next);
        };

        if (this.stacktrace) {
            try {
                var stackframes = _stacktrace2['default'].get();
                context.stackframes = stackframes;
                this.emit('log', _extends({}, context), messages);
            } catch (e) {
                // Ignore
            }

            next();
        } else {
            try {
                this.emit('log', _extends({}, context), messages);
            } catch (e) {
                // Ignore
            }

            next();
        }
    };

    Logger.prototype.use = function use(handler) {
        if (typeof handler === 'function') {
            this.chainedHandlers.push(handler);
        }
        return this;
    };

    Logger.prototype.enableStackTrace = function enableStackTrace() {
        this.stacktrace = true;
    };

    Logger.prototype.disableStackTrace = function disableStackTrace() {
        this.stacktrace = false;
    };
    // Changes the current logging level for the logging instance


    Logger.prototype.setLevel = function setLevel(level) {
        if (level instanceof _LogLevel2['default']) {
            this.level = level;
        }

        this.emit('setLevel', this.level);

        return this.level;
    };
    // Returns the current logging level fo the logging instance


    Logger.prototype.getLevel = function getLevel() {
        return this.level;
    };

    Logger.prototype.log = function log(level) {
        if (level instanceof _LogLevel2['default'] && level.value >= this.level.value) {
            for (var _len = arguments.length, messages = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                messages[_key - 1] = arguments[_key];
            }

            this.invokeChainedHandlers(level, messages);
        }
    };

    Logger.prototype.trace = function trace() {
        if (_constants.TRACE.value >= this.level.value) {
            for (var _len2 = arguments.length, messages = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                messages[_key2] = arguments[_key2];
            }

            this.invokeChainedHandlers(_constants.TRACE, messages);
        }
    };

    Logger.prototype.debug = function debug() {
        if (_constants.DEBUG.value >= this.level.value) {
            for (var _len3 = arguments.length, messages = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                messages[_key3] = arguments[_key3];
            }

            this.invokeChainedHandlers(_constants.DEBUG, messages);
        }
    };

    Logger.prototype.info = function info() {
        if (_constants.INFO.value >= this.level.value) {
            for (var _len4 = arguments.length, messages = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                messages[_key4] = arguments[_key4];
            }

            this.invokeChainedHandlers(_constants.INFO, messages);
        }
    };

    Logger.prototype.warn = function warn() {
        if (_constants.WARN.value >= this.level.value) {
            for (var _len5 = arguments.length, messages = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
                messages[_key5] = arguments[_key5];
            }

            this.invokeChainedHandlers(_constants.WARN, messages);
        }
    };

    Logger.prototype.error = function error() {
        if (_constants.ERROR.value >= this.level.value) {
            for (var _len6 = arguments.length, messages = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
                messages[_key6] = arguments[_key6];
            }

            this.invokeChainedHandlers(_constants.ERROR, messages);
        }
    };

    return Logger;
}(_events.EventEmitter);

exports['default'] = Logger;

/***/ }),

/***/ "../src/constants.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.OFF = exports.ERROR = exports.WARN = exports.INFO = exports.DEBUG = exports.TRACE = undefined;

var _LogLevel = __webpack_require__("../src/LogLevel.js");

var _LogLevel2 = _interopRequireDefault(_LogLevel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// Predefined logging levels.
var TRACE = exports.TRACE = new _LogLevel2['default']('trace', 0);
var DEBUG = exports.DEBUG = new _LogLevel2['default']('debug', 1);
var INFO = exports.INFO = new _LogLevel2['default']('info', 2);
var WARN = exports.WARN = new _LogLevel2['default']('warn', 3);
var ERROR = exports.ERROR = new _LogLevel2['default']('error', 4);
var OFF = exports.OFF = new _LogLevel2['default']('off', 9999);

/***/ }),

/***/ "../src/index.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _Logger = __webpack_require__("../src/Logger.js");

var _Logger2 = _interopRequireDefault(_Logger);

var _LogLevel = __webpack_require__("../src/LogLevel.js");

var _LogLevel2 = _interopRequireDefault(_LogLevel);

var _constants = __webpack_require__("../src/constants.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var contextualLoggers = {};

var globalLogger = new _Logger2['default']({
    level: _constants.DEBUG
});

globalLogger.on('setLevel', function (level) {
    // Apply filter level to all registered contextual loggers
    Object.keys(contextualLoggers).forEach(function (key) {
        var logger = contextualLoggers[key];
        logger.setLevel(level);
    });
});

module.exports = function (name) {
    name = String(name || '');

    if (!name) {
        return globalLogger;
    }

    if (!contextualLoggers[name]) {
        contextualLoggers[name] = new _Logger2['default'](name, {
            level: globalLogger.level
        });
    }

    return contextualLoggers[name];
};

module.exports.TRACE = _constants.TRACE;
module.exports.DEBUG = _constants.DEBUG;
module.exports.INFO = _constants.INFO;
module.exports.WARN = _constants.WARN;
module.exports.ERROR = _constants.ERROR;
module.exports.OFF = _constants.OFF;

module.exports.defineLogLevel = function (name, value) {
    return new _LogLevel2['default'](name, value);
};

/***/ }),

/***/ "../src/stacktrace.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _errorStackParser = __webpack_require__("../node_modules/error-stack-parser/error-stack-parser.js");

var _errorStackParser2 = _interopRequireDefault(_errorStackParser);

var _stackGenerator = __webpack_require__("../node_modules/stack-generator/stack-generator.js");

var _stackGenerator2 = _interopRequireDefault(_stackGenerator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

// https://github.com/stacktracejs/stacktrace.js/blob/master/stacktrace.js
var generateError = function stacktrace$$generateError() {
    try {
        // Error must be thrown to get stack in IE
        throw new Error();
    } catch (err) {
        return err;
    }
};

var isShapedLikeParsableError = function stacktrace$$isShapedLikeParsableError(err) {
    return err.stack || err['opera#sourceloc'];
};

module.exports = {
    get: function stacktrace$$get(options) {
        var err = generateError();
        var stackframes = isShapedLikeParsableError(err) ? _errorStackParser2['default'].parse(err) : _stackGenerator2['default'].backtrace(options);
        return stackframes;
    }
};

/***/ }),

/***/ "./index.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _nodeEmoji = __webpack_require__("../node_modules/node-emoji/index.js");

var _nodeEmoji2 = _interopRequireDefault(_nodeEmoji);

var _universalLoggerBrowser = __webpack_require__("../node_modules/universal-logger-browser/lib/index.js");

var _src = __webpack_require__("../src/index.js");

var _src2 = _interopRequireDefault(_src);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var log = (0, _src2['default'])().use((0, _universalLoggerBrowser.minimal)()).on('log', function (context, messages) {
    // Custom log processing
}); /* eslint no-console: 0 */


log.enableStackTrace();
log.setLevel(_src.TRACE);

log.log(_src.INFO, 'The logger has initialized');
log.trace(_nodeEmoji2['default'].get('mostly_sunny'));
log.debug(_nodeEmoji2['default'].get('sun_small_cloud'));
log.info(_nodeEmoji2['default'].get('barely_sunny'));
log.warn(_nodeEmoji2['default'].get('rain_cloud'));
log.error(_nodeEmoji2['default'].get('lightning_cloud'));

log.setLevel(_src.OFF); // Turn off logging
log.error(_nodeEmoji2['default'].get('scream'));

var contextLog = (0, _src2['default'])(_nodeEmoji2['default'].get('rainbow')).use((0, _universalLoggerBrowser.minimal)({
    useNativeConsoleMethods: false
})).use((0, _universalLoggerBrowser.styleable)({
    showTimestamp: true
})).on('log', function (context, messages) {
    // Custom log processing
});

contextLog.setLevel(_src.INFO);
contextLog.enableStackTrace();
contextLog.trace(_nodeEmoji2['default'].get('mostly_sunny'));
contextLog.debug(_nodeEmoji2['default'].get('sun_small_cloud'));
contextLog.info(_nodeEmoji2['default'].get('barely_sunny'));
contextLog.warn(_nodeEmoji2['default'].get('rain_cloud'));
contextLog.error(_nodeEmoji2['default'].get('lightning_cloud'));

/***/ })

/******/ });
//# sourceMappingURL=bundle.js.map?683d5ec3e31eec34bd07
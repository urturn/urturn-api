/**
 * URTURN API
 */
if (!urturn) {

  var urturn = (function(window) {

    // Create a JSON object only if one does not already exist. We create the
    // methods in a closure to avoid creating global variables.

    // We create the API object
    var urturn = {};

    /**
     * The API HOST (usefull for debug in local env)
     * @type {String}
     */
    var HOST = 'www.urturn.com';

    /**
     * API ENDPOINT
     * @type {String}
     */
    var ENDPOINT = '/api/';

    /**
     * List of request support by this endpoint
     * @type {Object}
     */
    var TYPES = {
      post : {
        name : 'posts',
        selectors : {
          id : 'id',
          username : 'username',
          expression : 'expression_name',
          query : 'q',
          expressionCreator : 'expression_creator'
        }
      },
      expression : {
        name : 'expressions',
        selectors : {
          id : 'id',
          username : 'username',
          expression : 'expression_name',
          query : 'q'
        }
      }
    };

    /**
     * urturn.get let you retrieve post from urturn
     * This method can be called in 3 different ways :
     *
     * #1 : Using an option object :
     * urturn.get(options, successCallback, errorCallback)
     * 
     * @param  {Object} options A set of options
     *       {
     *         queryType {String} : The type of query to perform (ex:  'post'),
     *         querySelector {String} : The selector to apply to query (ex : username),
     *         query {String} : The query to get,
     *         perPage (optional, default 50 or last set value on this query) {Number}: The page to return,
     *         page (optional, default 0 or last page called + 1) {Number}: the page number
     *       }
     * @param  {Function} successCallback The success callback
     * @param  {Function} (optional) errorCallback The errorcallback
     *
     * #2 : Using a query to return posts directly :
     * urturn.get(query, successCallback, errorCallback)
     * 
     * @param  {String} query All post matching this query will be returned (ex : 'test')
     * @param  {Function} successCallback The success callback
     * @param  {Function} (optional) errorCallback The errorcallback
     *
     * #3 : Using more arguments (type, by, query);
     * urturn.get(type, by, query, successCallback, errorCallback)
     *
     * @param  {String} type The type of query to perform (ex:  'post')
     * @param  {String} by The slector of query to perform (ex:  'username')
     * @param  {String} query The query to perform (ex:  'q')
     * @param  {Function} successCallback The success callback
     * @param  {Function} (optional) errorCallback The errorcallback
     *
     *
     * Note : 
     *  - All result reurned are paginated. If no page specific page is asked, the query will return
     *  first page first time it is called, second page second time it is called, ....
     *
     *  - the 'post' type is supported with the following selector :
     *    ~ 'id' : Select a post by id. Return only one post
     *    ~ 'username' : Select post by username. Return all posts of an user
     *    ~ 'expression' : Select post by expression. Return all posts of from a given expression
     *    ~ 'query' : Select post by a query. Return all posts matching the query
     *  
     *  - the 'expression' type is supported with the following selector :
     *    ~ 'id' : Select a expression by id. Return only one expression
     *    ~ 'username' : Select expression by username. Return all expression of an user
     *    ~ 'expression' : Select expression by expression name. Return this expression
     *    ~ 'query' : Select expression by a query. Return all expressions matching the query
     *    
     *   @return {bool} Return true when fails, false when no issues detected
     */
  

    urturn.get = function(options, successCallback, errorCallback) {

      // Step 1 : We Adapt to the differents function signatures.

      // check if we are in case #3, prototype is : type, by, query, successCallback, errorCallback(optional)
      if (arguments.length >= 4) {
        options = {
          queryType     : arguments[0],
          querySelector : arguments[1],
          query         : arguments[2]
        };
      
        if (typeof(arguments[3]) === 'number') {
          options.id = arguments[3];
          successCallback = arguments[4];
          errorCallback = arguments[5];
        }
        else {
          successCallback = arguments[3];
          errorCallback = arguments[4];
        }
      }

      // check if we are in case #2, prototype is : query, successCallback, errorCallback(optional)
      else if (typeof (options) === 'string') {
        options = {
          query         : options,
          queryType     : 'post',
          querySelector : 'query'
        };
      }

      if (!options.id) {
        options.id = 0;
      }

      // Step 2 : We Check validity to the differents arguments
  
      if (checkForErrorInArguments(options)) {
        return true;
      }

      // Step 3 : We get the corresponding query object
      
      var query = _queryStore.get(options);


      // Step 4 : We set page and perPages options
      
      if (options.page) {
        query.setPage(options.page);
      }

      if (options.perPage) {
        query.setPageSize(options.perPage);
      }

      // Step 4 : We get the next datas

      query.next(successCallback, errorCallback);

      return false;
    };

    /**
     * GEt the HOST
     * @return The Host
     */
    urturn.getHost = function() {
      return HOST;
    };
    
    /**
     * Internals Stuff
     */

    /**
    * A function to check validity of arguments
    */
    var checkForErrorInArguments = function (options, successCallback, errorCallback) {
      
      if (!options.query) {
        errorCallback(error('get', 'MISSING_QUERY', {}));
        return true;
      }
      
      if (!options.queryType) {
        errorCallback(error('get', 'MISSING_QUERY_TYPE', {}));
        return true;
      }

      if (!options.querySelector) {
        errorCallback(error('get', 'MISSING_QUERY_SELECTOR', {}));
        return true;
      }

      if (typeof(options.query) !== 'string') {
        errorCallback(error('get', 'WRONG_FORMAT', {key : 'options.query', type : typeof(options.query)}));
        return true;
      }

      if (typeof(options.queryType) !== 'string') {
        errorCallback(error('get', 'WRONG_FORMAT', {key : 'options.queryType', type : typeof(options.queryType)}));
        return true;
      }

      if (typeof(options.querySelector) !== 'string') {
        errorCallback(error('get', 'WRONG_FORMAT', {key : 'options.querySelector', type : typeof(options.querySelector)}));
        return true;
      }

      if (options.page) {
        if (typeof(options.page) !== 'number') {
          errorCallback(error('get', 'WRONG_FORMAT', {key : 'options.page', type : typeof(options.page)}));
          return true;
        }
      }

      if (options.perPage) {
        if (typeof(options.perPage) !== 'number') {
          errorCallback(error('get', 'WRONG_FORMAT', {key : 'options.perPage', type : typeof(options.perPage)}));
          return true;
        }
      }
      
      return false;
    };


    /**
     * The Query object
     * An objext use to handle a query
     */
    var Query = function(options) {
      this.query = options.query;
      this.queryType = options.queryType;
      this.querySelector = options.querySelector;
      this.page = 1;
      this.perPages = 50;

      /**
       * return the ne
       * @return {Function} [description]
       */
      this.next = function (successCallback, errorCallback) {
        var url = '//' + HOST + ENDPOINT + TYPES[this.queryType].name + '.json?';

        url +=  TYPES[this.queryType].selectors[this.querySelector] + '=' + encodeURIComponent(this.query);
        url += '&page=' + this.page++;
        url += '&per_page=' + this.perPages;

        if (errorCallback == 'widget') {
          url+= '&track=1&href=' + window.location.href;
        }

        var status = AJAX(url, successCallback, errorCallback);
        if (status) {
          errorCallback(error('get', status, {}));
        }
      };

      this.setPage = function(page) {
        if (page | 0 > 0) {
          // |0 we prevent not rounded values!
          this.page = page | 0;
        }
      };

      this.setPageSize = function(pageSize) {
        this.perPages = pageSize;
      };

    };


    /**
     * A helper to manage AJAX
     */
    var AJAX = function(url, successCallback, errorCallback) {
      var xhr = false;

      // Creat XMLHTTPRequest object
      if (window.XMLHttpRequest) { // if Mozilla, Safari etc
        xhr = new XMLHttpRequest();
      }
      else if (window.ActiveXObject) {// if IE
        try {
          xhr = new window.ActiveXObject('Msxml2.XMLHTTP');
        }
        catch (catchedError) {
          try {
            xhr = new window.ActiveXObject('Microsoft.XMLHTTP');
          }
          catch (catchedError2) {
            return 'XHR_IE_FAIL';
          }
        }
      }
      else {
        return 'NO_XHR';
      }

      xhr.open('GET', url, true);

      xhr.onreadystatechange = function (e) {
        if (xhr.readyState != 4)
          return false;
        var result = JSON.parse(xhr.responseText);
        successCallback(result);
      };

      /* // IE6 Do not support that
      xhr.ontimeout = function(e) {
        errorCallback(error('get', 'XHR_TIMEOUT', {}));
      };

      xhr.onerror = function (e) {
        errorCallback(error('get', 'XHR_ERROR', {}));
      };
       */
 
      xhr.send(null);
    };


    /**
     * An object to manage query (singleton)
     *
     * _queyStore.get(queryOption) return a query object corresponding to this options
     * 
     * @return {[type]} [description]
     */
    var _queryStore = new function () {
      /**
       * An hash table to manage query history
       */
      this._queryHistory = {};

      /**
       * get Query Object
       */
      this.get = function(options) {

        // We generate an (almost :) ) unique signature for this query
        var querySignature = options.id + '::' + options.queryType + '::' + options.querySelector + '::' + options.query;

        // We check the query store to see if we already get it and if so return it
        if (this._queryHistory[querySignature]) {
          return this._queryHistory[querySignature];
        }

        // if we do not get this query we return a new one!
        var _query = new Query(options);
        this._queryHistory[querySignature] = _query;
        return _query;
      };
    }();

    /**
     * A function that create human readable error messages
     */
    var error = function(fn, code, options) {
      var errorHash = {};

      errorHash.apiMethod = 'urturn.' + fn;
      errorHash.message = 'An unknow Error happen!';
      errorHash.code = code;

      var messages = {
        'MISSING_QUERY' : 'No query in options hash. We do not know what to search.',
        'MISSING_QUERY_TYPE' : 'No queryType in options hash. We do not know what to search.',
        'MISSING_QUERY_SELECTOR' : 'No querySelector in options hash. We do not know what to search.',
        'WRONG_FORMAT' : '{key} should be a String, was a {type} instead!',
        'NO_XHR' : 'Can not instanciate XMLHttpRequest Object.',
        'XHR_ERROR' : 'There was an error on urturn server.',
        'XHR_TIMEOUT' : 'Request to urturn server Timeout.',
        'XHR_IE_FAIL' : 'No ActiveXObject for XMLHTTP. (ActiveX not activated?)'
      };

      if (messages[code]) {
        errorHash.message = messages[code];
        for (var key in options) {
          errorHash.message.replace('{' + key + '}', options.key);
        }
      }
      return errorHash;
    };

    // IE JSON Polyfill
    
    if (typeof JSON !== 'object') {
        JSON = {};
    }

    (function () {
        'use strict';

        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        if (typeof Date.prototype.toJSON !== 'function') {

            Date.prototype.toJSON = function () {

                return isFinite(this.valueOf())
                    ? this.getUTCFullYear()     + '-' +
                        f(this.getUTCMonth() + 1) + '-' +
                        f(this.getUTCDate())      + 'T' +
                        f(this.getUTCHours())     + ':' +
                        f(this.getUTCMinutes())   + ':' +
                        f(this.getUTCSeconds())   + 'Z'
                    : null;
            };

            String.prototype.toJSON      =
                Number.prototype.toJSON  =
                Boolean.prototype.toJSON = function () {
                    return this.valueOf();
                };
        }

        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            },
            rep;


        function quote(string) {

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.

            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }


        function str(key, holder) {

    // Produce a string from holder[key].

            var i,          // The loop counter.
                k,          // The member key.
                v,          // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];

    // If the value has a toJSON method, call it to obtain a replacement value.

            if (value && typeof value === 'object' &&
                    typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }

    // If we were called with a replacer function, then call the replacer to
    // obtain a replacement value.

            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }

    // What happens next depends on the value's type.

            switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

    // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

    // If the value is a boolean or null, convert it to a string. Note:
    // typeof null does not produce 'null'. The case is included here in
    // the remote chance that this gets fixed someday.

                return String(value);

    // If the type is 'object', we might be dealing with an object or an array or
    // null.

            case 'object':

    // Due to a specification blunder in ECMAScript, typeof null is 'object',
    // so watch out for that case.

                if (!value) {
                    return 'null';
                }

    // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

    // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

    // The value is an array. Stringify every element. Use null as a placeholder
    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

    // Join all of the elements together, separated with commas, and wrap them in
    // brackets.

                    v = partial.length === 0
                        ? '[]'
                        : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

    // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

    // Join all of the member texts together, separated with commas,
    // and wrap them in braces.

                v = partial.length === 0
                    ? '{}'
                    : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
            }
        }

    // If the JSON object does not yet have a stringify method, give it one.

        if (typeof JSON.stringify !== 'function') {
            JSON.stringify = function (value, replacer, space) {

    // The stringify method takes a value and an optional replacer, and an optional
    // space parameter, and returns a JSON text. The replacer can be a function
    // that can replace values, or an array of strings that will select the keys.
    // A default replacer method can be provided. Use of the space parameter can
    // produce text that is more easily readable.

                var i;
                gap = '';
                indent = '';

    // If the space parameter is a number, make an indent string containing that
    // many spaces.

                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }

    // If the space parameter is a string, it will be used as the indent string.

                } else if (typeof space === 'string') {
                    indent = space;
                }

    // If there is a replacer, it must be a function or an array.
    // Otherwise, throw an error.

                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                        (typeof replacer !== 'object' ||
                        typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }

    // Make a fake root object containing our value under the key of ''.
    // Return the result of stringifying the value.

                return str('', {'': value});
            };
        }


    // If the JSON object does not yet have a parse method, give it one.

        if (typeof JSON.parse !== 'function') {
            JSON.parse = function (text, reviver) {

    // The parse method takes a text and an optional reviver function, and returns
    // a JavaScript value if the text is a valid JSON text.

                var j;

                function walk(holder, key) {

    // The walk method is used to recursively walk the resulting structure so
    // that modifications can be made.

                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }


    // Parsing happens in four stages. In the first stage, we replace certain
    // Unicode characters with escape sequences. JavaScript handles many characters
    // incorrectly, either silently deleting them, or treating them as line endings.

                text = String(text);
                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                    });
                }

    // In the second stage, we run the text against regular expressions that look
    // for non-JSON patterns. We are especially concerned with '()' and 'new'
    // because they can cause invocation, and '=' because it can cause mutation.
    // But just to be safe, we want to reject all unexpected forms.

    // We split the second stage into 4 regexp operations in order to work around
    // crippling inefficiencies in IE's and Safari's regexp engines. First we
    // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
    // replace all simple value tokens with ']' characters. Third, we delete all
    // open brackets that follow a colon or comma or that begin the text. Finally,
    // we look to see that the remaining characters are only whitespace or ']' or
    // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

                if (/^[\],:{}\s]*$/
                        .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                            .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

    // In the third stage we use the eval function to compile the text into a
    // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
    // in JavaScript: it can begin a block or an object literal. We wrap the text
    // in parens to eliminate the ambiguity.

                    j = eval('(' + text + ')');

    // In the optional fourth stage, we recursively walk the new structure, passing
    // each name/value pair to a reviver function for possible transformation.

                    return typeof reviver === 'function'
                        ? walk({'': j}, '')
                        : j;
                }

    // If the text is not JSON parseable, then a SyntaxError is thrown.

                throw new SyntaxError('JSON.parse');
            };
        }
    }());

    // We return the api object
    return urturn;
  })(window);
}

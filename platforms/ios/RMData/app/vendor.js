(global["webpackJsonp"] = global["webpackJsonp"] || []).push([["vendor"],{

/***/ "../node_modules/@nativescript/core/data/observable/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WrappedValue", function() { return WrappedValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Observable", function() { return Observable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromObject", function() { return fromObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromObjectRecursive", function() { return fromObjectRecursive; });
let _wrappedIndex = 0;
class WrappedValue {
  constructor(wrapped) {
    this.wrapped = wrapped;
  }

  static unwrap(value) {
    return value instanceof WrappedValue ? value.wrapped : value;
  }

  static wrap(value) {
    const w = _wrappedValues[_wrappedIndex++ % 5];
    w.wrapped = value;
    return w;
  }

}
const _wrappedValues = [new WrappedValue(null), new WrappedValue(null), new WrappedValue(null), new WrappedValue(null), new WrappedValue(null)];
const _globalEventHandlers = {};
class Observable {
  constructor() {
    this._observers = {};
  }

  get(name) {
    return this[name];
  }

  set(name, value) {
    // TODO: Parameter validation
    const oldValue = this[name];

    if (this[name] === value) {
      return;
    }

    const newValue = WrappedValue.unwrap(value);
    this[name] = newValue;
    this.notifyPropertyChange(name, newValue, oldValue);
  }

  setProperty(name, value) {
    const oldValue = this[name];

    if (this[name] === value) {
      return;
    }

    this[name] = value;
    this.notifyPropertyChange(name, value, oldValue);
    const specificPropertyChangeEventName = name + 'Change';

    if (this.hasListeners(specificPropertyChangeEventName)) {
      const eventData = this._createPropertyChangeData(name, value, oldValue);

      eventData.eventName = specificPropertyChangeEventName;
      this.notify(eventData);
    }
  }

  on(eventNames, callback, thisArg) {
    this.addEventListener(eventNames, callback, thisArg);
  }

  once(event, callback, thisArg) {
    if (typeof event !== 'string') {
      throw new TypeError('Event must be string.');
    }

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be function.');
    }

    const list = this._getEventList(event, true);

    list.push({
      callback,
      thisArg,
      once: true
    });
  }

  off(eventNames, callback, thisArg) {
    this.removeEventListener(eventNames, callback, thisArg);
  }

  addEventListener(eventNames, callback, thisArg) {
    if (typeof eventNames !== 'string') {
      throw new TypeError('Events name(s) must be string.');
    }

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be function.');
    }

    const events = eventNames.split(',');

    for (let i = 0, l = events.length; i < l; i++) {
      const event = events[i].trim();

      const list = this._getEventList(event, true); // TODO: Performance optimization - if we do not have the thisArg specified, do not wrap the callback in additional object (ObserveEntry)


      list.push({
        callback: callback,
        thisArg: thisArg
      });
    }
  }

  removeEventListener(eventNames, callback, thisArg) {
    if (typeof eventNames !== 'string') {
      throw new TypeError('Events name(s) must be string.');
    }

    if (callback && typeof callback !== 'function') {
      throw new TypeError('callback must be function.');
    }

    const events = eventNames.split(',');

    for (let i = 0, l = events.length; i < l; i++) {
      const event = events[i].trim();

      if (callback) {
        const list = this._getEventList(event, false);

        if (list) {
          const index = Observable._indexOfListener(list, callback, thisArg);

          if (index >= 0) {
            list.splice(index, 1);
          }

          if (list.length === 0) {
            delete this._observers[event];
          }
        }
      } else {
        this._observers[event] = undefined;
        delete this._observers[event];
      }
    }
  }

  static on(eventName, callback, thisArg) {
    this.addEventListener(eventName, callback, thisArg);
  }

  static once(eventName, callback, thisArg) {
    if (typeof eventName !== 'string') {
      throw new TypeError('Event must be string.');
    }

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be function.');
    }

    const eventClass = this.name === 'Observable' ? '*' : this.name;

    if (!_globalEventHandlers[eventClass]) {
      _globalEventHandlers[eventClass] = {};
    }

    if (!Array.isArray(_globalEventHandlers[eventClass][eventName])) {
      _globalEventHandlers[eventClass][eventName] = [];
    }

    _globalEventHandlers[eventClass][eventName].push({
      callback,
      thisArg,
      once: true
    });
  }

  static off(eventName, callback, thisArg) {
    this.removeEventListener(eventName, callback, thisArg);
  }

  static removeEventListener(eventName, callback, thisArg) {
    if (typeof eventName !== 'string') {
      throw new TypeError('Event must be string.');
    }

    if (callback && typeof callback !== 'function') {
      throw new TypeError('callback must be function.');
    }

    const eventClass = this.name === 'Observable' ? '*' : this.name; // Short Circuit if no handlers exist..

    if (!_globalEventHandlers[eventClass] || !Array.isArray(_globalEventHandlers[eventClass][eventName])) {
      return;
    }

    const events = _globalEventHandlers[eventClass][eventName];

    if (thisArg) {
      for (let i = 0; i < events.length; i++) {
        if (events[i].callback === callback && events[i].thisArg === thisArg) {
          events.splice(i, 1);
          i--;
        }
      }
    } else if (callback) {
      for (let i = 0; i < events.length; i++) {
        if (events[i].callback === callback) {
          events.splice(i, 1);
          i--;
        }
      }
    } else {
      // Clear all events of this type
      delete _globalEventHandlers[eventClass][eventName];
    }

    if (events.length === 0) {
      // Clear all events of this type
      delete _globalEventHandlers[eventClass][eventName];
    } // Clear the primary class grouping if no events are left


    const keys = Object.keys(_globalEventHandlers[eventClass]);

    if (keys.length === 0) {
      delete _globalEventHandlers[eventClass];
    }
  }

  static addEventListener(eventName, callback, thisArg) {
    if (typeof eventName !== 'string') {
      throw new TypeError('Event must be string.');
    }

    if (typeof callback !== 'function') {
      throw new TypeError('callback must be function.');
    }

    const eventClass = this.name === 'Observable' ? '*' : this.name;

    if (!_globalEventHandlers[eventClass]) {
      _globalEventHandlers[eventClass] = {};
    }

    if (!Array.isArray(_globalEventHandlers[eventClass][eventName])) {
      _globalEventHandlers[eventClass][eventName] = [];
    }

    _globalEventHandlers[eventClass][eventName].push({
      callback,
      thisArg
    });
  }

  _globalNotify(eventClass, eventType, data) {
    // Check for the Global handlers for JUST this class
    if (_globalEventHandlers[eventClass]) {
      const event = data.eventName + eventType;
      const events = _globalEventHandlers[eventClass][event];

      if (events) {
        Observable._handleEvent(events, data);
      }
    } // Check for he Global handlers for ALL classes


    if (_globalEventHandlers['*']) {
      const event = data.eventName + eventType;
      const events = _globalEventHandlers['*'][event];

      if (events) {
        Observable._handleEvent(events, data);
      }
    }
  }

  notify(data) {
    const eventClass = this.constructor.name;

    this._globalNotify(eventClass, 'First', data);

    const observers = this._observers[data.eventName];

    if (observers) {
      Observable._handleEvent(observers, data);
    }

    this._globalNotify(eventClass, '', data);
  }

  static _handleEvent(observers, data) {
    if (!observers) {
      return;
    }

    for (let i = observers.length - 1; i >= 0; i--) {
      const entry = observers[i];

      if (entry.once) {
        observers.splice(i, 1);
      }

      if (entry.thisArg) {
        entry.callback.apply(entry.thisArg, [data]);
      } else {
        entry.callback(data);
      }
    }
  }

  notifyPropertyChange(name, value, oldValue) {
    this.notify(this._createPropertyChangeData(name, value, oldValue));
  }

  hasListeners(eventName) {
    return eventName in this._observers;
  }

  _createPropertyChangeData(propertyName, value, oldValue) {
    return {
      eventName: Observable.propertyChangeEvent,
      object: this,
      propertyName,
      value,
      oldValue
    };
  }

  _emit(eventNames) {
    const events = eventNames.split(',');

    for (let i = 0, l = events.length; i < l; i++) {
      const event = events[i].trim();
      this.notify({
        eventName: event,
        object: this
      });
    }
  }

  _getEventList(eventName, createIfNeeded) {
    if (!eventName) {
      throw new TypeError('EventName must be valid string.');
    }

    let list = this._observers[eventName];

    if (!list && createIfNeeded) {
      list = [];
      this._observers[eventName] = list;
    }

    return list;
  }

  static _indexOfListener(list, callback, thisArg) {
    for (let i = 0; i < list.length; i++) {
      const entry = list[i];

      if (thisArg) {
        if (entry.callback === callback && entry.thisArg === thisArg) {
          return i;
        }
      } else {
        if (entry.callback === callback) {
          return i;
        }
      }
    }

    return -1;
  }

}
Observable.propertyChangeEvent = 'propertyChange';

class ObservableFromObject extends Observable {
  constructor() {
    super(...arguments);
    this._map = {};
  }

  get(name) {
    return this._map[name];
  }

  set(name, value) {
    const currentValue = this._map[name];

    if (currentValue === value) {
      return;
    }

    const newValue = WrappedValue.unwrap(value);
    this._map[name] = newValue;
    this.notifyPropertyChange(name, newValue, currentValue);
  }

}

function defineNewProperty(target, propertyName) {
  Object.defineProperty(target, propertyName, {
    get: function () {
      return target._map[propertyName];
    },
    set: function (value) {
      target.set(propertyName, value);
    },
    enumerable: true,
    configurable: true
  });
}

function addPropertiesFromObject(observable, source, recursive = false) {
  Object.keys(source).forEach(prop => {
    let value = source[prop];

    if (recursive && !Array.isArray(value) && value && typeof value === 'object' && !(value instanceof Observable)) {
      value = fromObjectRecursive(value);
    }

    defineNewProperty(observable, prop);
    observable.set(prop, value);
  });
}

function fromObject(source) {
  const observable = new ObservableFromObject();
  addPropertiesFromObject(observable, source, false);
  return observable;
}
function fromObjectRecursive(source) {
  const observable = new ObservableFromObject();
  addPropertiesFromObject(observable, source, true);
  return observable;
}

/***/ }),

/***/ "../node_modules/@nativescript/core/debugger/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getNetwork", function() { return getNetwork; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setNetwork", function() { return setNetwork; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDOM", function() { return getDOM; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setDOM", function() { return setDOM; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCSS", function() { return getCSS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCSS", function() { return setCSS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "NetworkAgent", function() { return NetworkAgent; });
let network;
function getNetwork() {
  return network;
}
function setNetwork(newNetwork) {
  network = newNetwork;
}
let dom;
function getDOM() {
  return dom;
}
function setDOM(newDOM) {
  dom = newDOM;
}
let css;
function getCSS() {
  return css;
}
function setCSS(newCSS) {
  css = newCSS;
}
var NetworkAgent;

(function (NetworkAgent) {
  function responseReceived(requestId, result, headers) {
    const requestIdStr = requestId.toString(); // Content-Type and content-type are both common in headers spelling

    const mimeType = headers['Content-Type'] || headers['content-type'] || 'application/octet-stream';
    const contentLengthHeader = headers['Content-Length'] || headers['content-length'];
    let contentLength = parseInt(contentLengthHeader, 10);

    if (isNaN(contentLength)) {
      contentLength = 0;
    }

    const response = {
      url: result.url || '',
      status: result.statusCode,
      statusText: result.statusText || '',
      headers: headers,
      mimeType: mimeType,
      fromDiskCache: false,
      connectionReused: true,
      connectionId: 0,
      encodedDataLength: contentLength,
      securityState: 'info'
    };
    const responseData = {
      requestId: requestIdStr,
      type: mimeTypeToType(response.mimeType),
      response: response,
      timestamp: getTimeStamp()
    };

    global.__inspector.responseReceived(responseData);

    global.__inspector.loadingFinished({
      requestId: requestIdStr,
      timestamp: getTimeStamp(),
      encodedDataLength: contentLength
    });

    const hasTextContent = responseData.type === 'Document' || responseData.type === 'Script';
    let data;

    if (!hasTextContent) {
      if (responseData.type === 'Image') {
        const bitmap = result.responseAsImage;

        if (bitmap) {
          const outputStream = new java.io.ByteArrayOutputStream();
          bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, outputStream);
          const base64Image = android.util.Base64.encodeToString(outputStream.toByteArray(), android.util.Base64.DEFAULT);
          data = base64Image;
        }
      }
    } else {
      data = result.responseAsString;
    }

    const successfulRequestData = {
      requestId: requestIdStr,
      data: data,
      hasTextContent: hasTextContent
    };

    global.__inspector.dataForRequestId(successfulRequestData);
  }

  NetworkAgent.responseReceived = responseReceived;

  function requestWillBeSent(requestId, options) {
    const request = {
      url: options.url,
      method: options.method,
      headers: options.headers || {},
      postData: options.content ? options.content.toString() : '',
      initialPriority: 'Medium',
      referrerPolicy: 'no-referrer-when-downgrade'
    };
    const requestData = {
      requestId: requestId.toString(),
      url: request.url,
      request: request,
      timestamp: getTimeStamp(),
      type: 'Document',
      wallTime: 0
    };

    global.__inspector.requestWillBeSent(requestData);
  }

  NetworkAgent.requestWillBeSent = requestWillBeSent;

  function getTimeStamp() {
    const d = new Date();
    return Math.round(d.getTime() / 1000);
  }

  function mimeTypeToType(mimeType) {
    let type = 'Document';

    if (mimeType) {
      if (mimeType.indexOf('image') === 0) {
        type = 'Image';
      } else if (mimeType.indexOf('javascript') !== -1 || mimeType.indexOf('json') !== -1) {
        type = 'Script';
      }
    }

    return type;
  }
})(NetworkAgent || (NetworkAgent = {}));
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("../node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../node_modules/@nativescript/core/file-system/file-system-access.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FileSystemAccess", function() { return FileSystemAccess; });
/* harmony import */ var _text__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/text/index.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("../node_modules/@nativescript/core/utils/index.js");

 // TODO: Implement all the APIs receiving callback using async blocks
// TODO: Check whether we need try/catch blocks for the iOS implementation

class FileSystemAccess {
  constructor() {
    this.readText = this.readTextSync.bind(this);
    this.read = this.readSync.bind(this);
    this.writeText = this.writeTextSync.bind(this);
    this.write = this.writeSync.bind(this);
  }

  getLastModified(path) {
    const fileManager = NSFileManager.defaultManager;
    const attributes = fileManager.attributesOfItemAtPathError(path);

    if (attributes) {
      return attributes.objectForKey('NSFileModificationDate');
    } else {
      return new Date();
    }
  }

  getFileSize(path) {
    const fileManager = NSFileManager.defaultManager;
    const attributes = fileManager.attributesOfItemAtPathError(path);

    if (attributes) {
      return attributes.objectForKey('NSFileSize');
    } else {
      return 0;
    }
  }

  getParent(path, onError) {
    try {
      const fileManager = NSFileManager.defaultManager;
      const nsString = NSString.stringWithString(path);
      const parentPath = nsString.stringByDeletingLastPathComponent;
      const name = fileManager.displayNameAtPath(parentPath);
      return {
        path: parentPath.toString(),
        name: name
      };
    } catch (exception) {
      if (onError) {
        onError(exception);
      }

      return undefined;
    }
  }

  getFile(path, onError) {
    try {
      const fileManager = NSFileManager.defaultManager;
      const exists = fileManager.fileExistsAtPath(path);

      if (!exists) {
        const parentPath = this.getParent(path, onError).path;

        if (!fileManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(parentPath, true, null) || !fileManager.createFileAtPathContentsAttributes(path, null, null)) {
          if (onError) {
            onError(new Error("Failed to create file at path '" + path + "'"));
          }

          return undefined;
        }
      }

      const fileName = fileManager.displayNameAtPath(path);
      return {
        path: path,
        name: fileName,
        extension: this.getFileExtension(path)
      };
    } catch (exception) {
      if (onError) {
        onError(exception);
      }

      return undefined;
    }
  }

  getFolder(path, onError) {
    try {
      const fileManager = NSFileManager.defaultManager;
      const exists = this.folderExists(path);

      if (!exists) {
        try {
          fileManager.createDirectoryAtPathWithIntermediateDirectoriesAttributesError(path, true, null);
        } catch (ex) {
          if (onError) {
            onError(new Error("Failed to create folder at path '" + path + "': " + ex));
          }

          return undefined;
        }
      }

      const dirName = fileManager.displayNameAtPath(path);
      return {
        path: path,
        name: dirName
      };
    } catch (ex) {
      if (onError) {
        onError(new Error("Failed to create folder at path '" + path + "'"));
      }

      return undefined;
    }
  }

  getExistingFolder(path, onError) {
    try {
      const fileManager = NSFileManager.defaultManager;
      const exists = this.folderExists(path);

      if (exists) {
        const dirName = fileManager.displayNameAtPath(path);
        return {
          path: path,
          name: dirName
        };
      }

      return undefined;
    } catch (ex) {
      if (onError) {
        onError(new Error("Failed to get folder at path '" + path + "'"));
      }

      return undefined;
    }
  }

  eachEntity(path, onEntity, onError) {
    if (!onEntity) {
      return;
    }

    this.enumEntities(path, onEntity, onError);
  }

  getEntities(path, onError) {
    const fileInfos = new Array();

    const onEntity = function (entity) {
      fileInfos.push(entity);
      return true;
    };

    let errorOccurred;

    const localError = function (error) {
      if (onError) {
        onError(error);
      }

      errorOccurred = true;
    };

    this.enumEntities(path, onEntity, localError);

    if (!errorOccurred) {
      return fileInfos;
    }

    return null;
  }

  fileExists(path) {
    const result = this.exists(path);
    return result.exists;
  }

  folderExists(path) {
    const result = this.exists(path);
    return result.exists && result.isDirectory;
  }

  exists(path) {
    const fileManager = NSFileManager.defaultManager;
    const isDirectory = new interop.Reference(interop.types.bool, false);
    const exists = fileManager.fileExistsAtPathIsDirectory(path, isDirectory);
    return {
      exists: exists,
      isDirectory: isDirectory.value
    };
  }

  concatPath(left, right) {
    return NSString.pathWithComponents([left, right]).toString();
  }

  deleteFile(path, onError) {
    this.deleteEntity(path, onError);
  }

  deleteFolder(path, onError) {
    this.deleteEntity(path, onError);
  }

  emptyFolder(path, onError) {
    const fileManager = NSFileManager.defaultManager;
    const entities = this.getEntities(path, onError);

    if (!entities) {
      return;
    }

    for (let i = 0; i < entities.length; i++) {
      try {
        fileManager.removeItemAtPathError(entities[i].path);
      } catch (ex) {
        if (onError) {
          onError(new Error("Failed to empty folder '" + path + "': " + ex));
        }

        return;
      }
    }
  }

  rename(path, newPath, onError) {
    const fileManager = NSFileManager.defaultManager;

    try {
      fileManager.moveItemAtPathToPathError(path, newPath);
    } catch (ex) {
      if (onError) {
        onError(new Error("Failed to rename '" + path + "' to '" + newPath + "': " + ex));
      }
    }
  }

  getLogicalRootPath() {
    const mainBundlePath = NSBundle.mainBundle.bundlePath;
    const resolvedPath = NSString.stringWithString(mainBundlePath).stringByResolvingSymlinksInPath;
    return resolvedPath;
  }

  getDocumentsFolderPath() {
    return this.getKnownPath(9
    /* DocumentDirectory */
    );
  }

  getTempFolderPath() {
    return this.getKnownPath(13
    /* CachesDirectory */
    );
  }

  getCurrentAppPath() {
    return _utils__WEBPACK_IMPORTED_MODULE_1__["iOSNativeHelper"].getCurrentAppPath();
  }

  readTextAsync(path, encoding) {
    const actualEncoding = encoding || _text__WEBPACK_IMPORTED_MODULE_0__["encoding"].UTF_8;
    return new Promise((resolve, reject) => {
      try {
        NSString.stringWithContentsOfFileEncodingCompletion(path, actualEncoding, (result, error) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.toString());
          }
        });
      } catch (ex) {
        reject(new Error("Failed to read file at path '" + path + "': " + ex));
      }
    });
  }

  readTextSync(path, onError, encoding) {
    const actualEncoding = encoding || _text__WEBPACK_IMPORTED_MODULE_0__["encoding"].UTF_8;

    try {
      const nsString = NSString.stringWithContentsOfFileEncodingError(path, actualEncoding);
      return nsString.toString();
    } catch (ex) {
      if (onError) {
        onError(new Error("Failed to read file at path '" + path + "': " + ex));
      }
    }
  }

  readAsync(path) {
    return new Promise((resolve, reject) => {
      try {
        NSData.dataWithContentsOfFileCompletion(path, resolve);
      } catch (ex) {
        reject(new Error("Failed to read file at path '" + path + "': " + ex));
      }
    });
  }

  readSync(path, onError) {
    try {
      return NSData.dataWithContentsOfFile(path);
    } catch (ex) {
      if (onError) {
        onError(new Error("Failed to read file at path '" + path + "': " + ex));
      }
    }
  }

  writeTextAsync(path, content, encoding) {
    const nsString = NSString.stringWithString(content);
    const actualEncoding = encoding || _text__WEBPACK_IMPORTED_MODULE_0__["encoding"].UTF_8;
    return new Promise((resolve, reject) => {
      try {
        nsString.writeToFileAtomicallyEncodingCompletion(path, true, actualEncoding, error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      } catch (ex) {
        reject(new Error("Failed to write file at path '" + path + "': " + ex));
      }
    });
  }

  writeTextSync(path, content, onError, encoding) {
    const nsString = NSString.stringWithString(content);
    const actualEncoding = encoding || _text__WEBPACK_IMPORTED_MODULE_0__["encoding"].UTF_8; // TODO: verify the useAuxiliaryFile parameter should be false

    try {
      nsString.writeToFileAtomicallyEncodingError(path, false, actualEncoding);
    } catch (ex) {
      if (onError) {
        onError(new Error("Failed to write to file '" + path + "': " + ex));
      }
    }
  }

  writeAsync(path, content) {
    return new Promise((resolve, reject) => {
      try {
        content.writeToFileAtomicallyCompletion(path, true, () => {
          resolve();
        });
      } catch (ex) {
        reject(new Error("Failed to write file at path '" + path + "': " + ex));
      }
    });
  }

  writeSync(path, content, onError) {
    try {
      content.writeToFileAtomically(path, true);
    } catch (ex) {
      if (onError) {
        onError(new Error("Failed to write to file '" + path + "': " + ex));
      }
    }
  }

  getKnownPath(folderType) {
    const fileManager = NSFileManager.defaultManager;
    const paths = fileManager.URLsForDirectoryInDomains(folderType, 1
    /* UserDomainMask */
    );
    const url = paths.objectAtIndex(0);
    return url.path;
  } // TODO: This method is the same as in the iOS implementation.
  // Make it in a separate file / module so it can be reused from both implementations.


  getFileExtension(path) {
    // TODO [For Panata]: The definitions currently specify "any" as a return value of this method
    //const nsString = Foundation.NSString.stringWithString(path);
    //const extension = nsString.pathExtension();
    //if (extension && extension.length > 0) {
    //    extension = extension.concat(".", extension);
    //}
    //return extension;
    const dotIndex = path.lastIndexOf('.');

    if (dotIndex && dotIndex >= 0 && dotIndex < path.length) {
      return path.substring(dotIndex);
    }

    return '';
  }

  deleteEntity(path, onError) {
    const fileManager = NSFileManager.defaultManager;

    try {
      fileManager.removeItemAtPathError(path);
    } catch (ex) {
      if (onError) {
        onError(new Error("Failed to delete file at path '" + path + "': " + ex));
      }
    }
  }

  enumEntities(path, callback, onError) {
    try {
      const fileManager = NSFileManager.defaultManager;
      let files;

      try {
        files = fileManager.contentsOfDirectoryAtPathError(path);
      } catch (ex) {
        if (onError) {
          onError(new Error("Failed to enum files for folder '" + path + "': " + ex));
        }

        return;
      }

      for (let i = 0; i < files.count; i++) {
        const file = files.objectAtIndex(i);
        const info = {
          path: this.concatPath(path, file),
          name: file,
          extension: ''
        };

        if (!this.folderExists(this.joinPath(path, file))) {
          info.extension = this.getFileExtension(info.path);
        }

        const retVal = callback(info);

        if (retVal === false) {
          // the callback returned false meaning we should stop the iteration
          break;
        }
      }
    } catch (ex) {
      if (onError) {
        onError(ex);
      }
    }
  }

  getPathSeparator() {
    return '/';
  }

  normalizePath(path) {
    const nsString = NSString.stringWithString(path);
    const normalized = nsString.stringByStandardizingPath;
    return normalized;
  }

  joinPath(left, right) {
    const nsString = NSString.stringWithString(left);
    return nsString.stringByAppendingPathComponent(right);
  }

  joinPaths(paths) {
    return _utils__WEBPACK_IMPORTED_MODULE_1__["iOSNativeHelper"].joinPaths(...paths);
  }

}

/***/ }),

/***/ "../node_modules/@nativescript/core/file-system/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFileAccess", function() { return getFileAccess; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FileSystemEntity", function() { return FileSystemEntity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "File", function() { return File; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Folder", function() { return Folder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "knownFolders", function() { return knownFolders; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "path", function() { return path; });
/* harmony import */ var _file_system_access__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/file-system/file-system-access.js");
 // The FileSystemAccess implementation, used through all the APIs.

let fileAccess;
/**
 * Returns FileSystemAccess, a shared singleton utility class to provide methods to access and work with the file system. This is used under the hood of all the file system apis in @nativescript/core and provided as a lower level convenience if needed.
 * @returns FileSystemAccess
 */

function getFileAccess() {
  if (!fileAccess) {
    fileAccess = new _file_system_access__WEBPACK_IMPORTED_MODULE_0__["FileSystemAccess"]();
  }

  return fileAccess;
}

function createFile(info) {
  const file = new File();
  file._path = info.path;
  file._name = info.name;
  file._extension = info.extension;
  return file;
}

function createFolder(info) {
  const documents = knownFolders.documents();

  if (info.path === documents.path) {
    return documents;
  }

  const temp = knownFolders.temp();

  if (info.path === temp.path) {
    return temp;
  }

  const folder = new Folder();
  folder._path = info.path;
  folder._name = info.name;
  return folder;
}

class FileSystemEntity {
  get parent() {
    const onError = function (error) {
      throw error;
    };

    const folderInfo = getFileAccess().getParent(this.path, onError);

    if (!folderInfo) {
      return undefined;
    }

    return createFolder(folderInfo);
  }

  remove() {
    return new Promise((resolve, reject) => {
      let hasError = false;

      const localError = function (error) {
        hasError = true;
        reject(error);
      };

      this.removeSync(localError);

      if (!hasError) {
        resolve();
      }
    });
  }

  removeSync(onError) {
    if (this._isKnown) {
      if (onError) {
        onError({
          message: 'Cannot delete known folder.'
        });
      }

      return;
    }

    const fileAccess = getFileAccess();

    if (this instanceof File) {
      fileAccess.deleteFile(this.path, onError);
    } else if (this instanceof Folder) {
      fileAccess.deleteFolder(this.path, onError);
    }
  }

  rename(newName) {
    return new Promise((resolve, reject) => {
      let hasError = false;

      const localError = function (error) {
        hasError = true;
        reject(error);
      };

      this.renameSync(newName, localError);

      if (!hasError) {
        resolve();
      }
    });
  }

  renameSync(newName, onError) {
    if (this._isKnown) {
      if (onError) {
        onError(new Error('Cannot rename known folder.'));
      }

      return;
    }

    const parentFolder = this.parent;

    if (!parentFolder) {
      if (onError) {
        onError(new Error('No parent folder.'));
      }

      return;
    }

    const fileAccess = getFileAccess();
    const path = parentFolder.path;
    const newPath = fileAccess.joinPath(path, newName);

    const localError = function (error) {
      if (onError) {
        onError(error);
      }

      return null;
    };

    fileAccess.rename(this.path, newPath, localError);
    this._path = newPath;
    this._name = newName;

    if (this instanceof File) {
      this._extension = fileAccess.getFileExtension(newPath);
    }
  }

  get name() {
    return this._name;
  }

  get path() {
    return this._path;
  }

  get lastModified() {
    let value = this._lastModified;

    if (!this._lastModified) {
      value = this._lastModified = getFileAccess().getLastModified(this.path);
    }

    return value;
  }

}
class File extends FileSystemEntity {
  static fromPath(path) {
    const onError = function (error) {
      throw error;
    };

    const fileInfo = getFileAccess().getFile(path, onError);

    if (!fileInfo) {
      return undefined;
    }

    return createFile(fileInfo);
  }

  static exists(path) {
    return getFileAccess().fileExists(path);
  }

  get extension() {
    return this._extension;
  }

  get isLocked() {
    // !! is a boolean conversion/cast, handling undefined as well
    return !!this._locked;
  }

  get size() {
    return getFileAccess().getFileSize(this.path);
  }

  read() {
    return new Promise((resolve, reject) => {
      try {
        this.checkAccess();
      } catch (ex) {
        reject(ex);
        return;
      }

      this._locked = true;
      getFileAccess().readAsync(this.path).then(result => {
        resolve(result);
        this._locked = false;
      }, error => {
        reject(error);
        this._locked = false;
      });
    });
  }

  readSync(onError) {
    this.checkAccess();
    this._locked = true;
    const that = this;

    const localError = error => {
      that._locked = false;

      if (onError) {
        onError(error);
      }
    };

    const content = getFileAccess().readSync(this.path, localError);
    this._locked = false;
    return content;
  }

  write(content) {
    return new Promise((resolve, reject) => {
      try {
        this.checkAccess();
      } catch (ex) {
        reject(ex);
        return;
      }

      this._locked = true;
      getFileAccess().writeAsync(this.path, content).then(() => {
        resolve();
        this._locked = false;
      }, error => {
        reject(error);
        this._locked = false;
      });
    });
  }

  writeSync(content, onError) {
    this.checkAccess();

    try {
      this._locked = true;
      const that = this;

      const localError = function (error) {
        that._locked = false;

        if (onError) {
          onError(error);
        }
      };

      getFileAccess().writeSync(this.path, content, localError);
    } finally {
      this._locked = false;
    }
  }

  readText(encoding) {
    return new Promise((resolve, reject) => {
      try {
        this.checkAccess();
      } catch (ex) {
        reject(ex);
        return;
      }

      this._locked = true;
      getFileAccess().readTextAsync(this.path, encoding).then(result => {
        resolve(result);
        this._locked = false;
      }, error => {
        reject(error);
        this._locked = false;
      });
    });
  }

  readTextSync(onError, encoding) {
    this.checkAccess();
    this._locked = true;
    const that = this;

    const localError = error => {
      that._locked = false;

      if (onError) {
        onError(error);
      }
    };

    const content = getFileAccess().readTextSync(this.path, localError, encoding);
    this._locked = false;
    return content;
  }

  writeText(content, encoding) {
    return new Promise((resolve, reject) => {
      try {
        this.checkAccess();
      } catch (ex) {
        reject(ex);
        return;
      }

      this._locked = true;
      getFileAccess().writeTextAsync(this.path, content, encoding).then(() => {
        resolve();
        this._locked = false;
      }, error => {
        reject(error);
        this._locked = false;
      });
    });
  }

  writeTextSync(content, onError, encoding) {
    this.checkAccess();

    try {
      this._locked = true;
      const that = this;

      const localError = function (error) {
        that._locked = false;

        if (onError) {
          onError(error);
        }
      };

      getFileAccess().writeTextSync(this.path, content, localError, encoding);
    } finally {
      this._locked = false;
    }
  }

  checkAccess() {
    if (this.isLocked) {
      throw new Error('Cannot access a locked file.');
    }
  }

}
class Folder extends FileSystemEntity {
  static fromPath(path) {
    const onError = function (error) {
      throw error;
    };

    const folderInfo = getFileAccess().getFolder(path, onError);

    if (!folderInfo) {
      return undefined;
    }

    return createFolder(folderInfo);
  }

  static exists(path) {
    return getFileAccess().folderExists(path);
  }

  contains(name) {
    const fileAccess = getFileAccess();
    const path = fileAccess.joinPath(this.path, name);

    if (fileAccess.fileExists(path)) {
      return true;
    }

    return fileAccess.folderExists(path);
  }

  clear() {
    return new Promise((resolve, reject) => {
      let hasError = false;

      const onError = function (error) {
        hasError = true;
        reject(error);
      };

      this.clearSync(onError);

      if (!hasError) {
        resolve();
      }
    });
  }

  clearSync(onError) {
    getFileAccess().emptyFolder(this.path, onError);
  }

  get isKnown() {
    return this._isKnown;
  }

  getFile(name) {
    const fileAccess = getFileAccess();
    const path = fileAccess.joinPath(this.path, name);

    const onError = function (error) {
      throw error;
    };

    const fileInfo = fileAccess.getFile(path, onError);

    if (!fileInfo) {
      return undefined;
    }

    return createFile(fileInfo);
  }

  getFolder(name) {
    const fileAccess = getFileAccess();
    const path = fileAccess.joinPath(this.path, name);

    const onError = function (error) {
      throw error;
    };

    const folderInfo = fileAccess.getFolder(path, onError);

    if (!folderInfo) {
      return undefined;
    }

    return createFolder(folderInfo);
  }

  getEntities() {
    return new Promise((resolve, reject) => {
      let hasError = false;

      const localError = function (error) {
        hasError = true;
        reject(error);
      };

      const entities = this.getEntitiesSync(localError);

      if (!hasError) {
        resolve(entities);
      }
    });
  }

  getEntitiesSync(onError) {
    const fileInfos = getFileAccess().getEntities(this.path, onError);

    if (!fileInfos) {
      return null;
    }

    const entities = new Array();

    for (let i = 0; i < fileInfos.length; i++) {
      if (fileInfos[i].extension) {
        entities.push(createFile(fileInfos[i]));
      } else {
        entities.push(createFolder(fileInfos[i]));
      }
    }

    return entities;
  }

  eachEntity(onEntity) {
    if (!onEntity) {
      return;
    }

    const onSuccess = function (fileInfo) {
      let entity;

      if (fileInfo.extension) {
        entity = createFile(fileInfo);
      } else {
        entity = createFolder(fileInfo);
      }

      return onEntity(entity);
    };

    const onError = function (error) {
      throw error;
    };

    getFileAccess().eachEntity(this.path, onSuccess, onError);
  }

}
var knownFolders;

(function (knownFolders) {
  let _documents;

  let _temp;

  let _app;

  function documents() {
    if (!_documents) {
      const path = getFileAccess().getDocumentsFolderPath();
      _documents = new Folder();
      _documents._path = path;
      _documents._isKnown = true;
    }

    return _documents;
  }

  knownFolders.documents = documents;

  function temp() {
    if (!_temp) {
      const path = getFileAccess().getTempFolderPath();
      _temp = new Folder();
      _temp._path = path;
      _temp._isKnown = true;
    }

    return _temp;
  }

  knownFolders.temp = temp;

  function currentApp() {
    if (!_app) {
      const path = getFileAccess().getCurrentAppPath();
      _app = new Folder();
      _app._path = path;
      _app._isKnown = true;
    }

    return _app;
  }

  knownFolders.currentApp = currentApp;
  let ios;

  (function (ios) {
    function _checkPlatform(knownFolderName) {
      if (false) {}
    }

    let _library;

    function library() {
      _checkPlatform('library');

      if (!_library) {
        let existingFolderInfo = getExistingFolderInfo(5
        /* LibraryDirectory */
        );

        if (existingFolderInfo) {
          _library = existingFolderInfo.folder;
          _library._path = existingFolderInfo.path;
          _library._isKnown = true;
        }
      }

      return _library;
    }

    ios.library = library;

    let _developer;

    function developer() {
      _checkPlatform('developer');

      if (!_developer) {
        let existingFolderInfo = getExistingFolderInfo(6
        /* DeveloperDirectory */
        );

        if (existingFolderInfo) {
          _developer = existingFolderInfo.folder;
          _developer._path = existingFolderInfo.path;
          _developer._isKnown = true;
        }
      }

      return _developer;
    }

    ios.developer = developer;

    let _desktop;

    function desktop() {
      _checkPlatform('desktop');

      if (!_desktop) {
        let existingFolderInfo = getExistingFolderInfo(12
        /* DesktopDirectory */
        );

        if (existingFolderInfo) {
          _desktop = existingFolderInfo.folder;
          _desktop._path = existingFolderInfo.path;
          _desktop._isKnown = true;
        }
      }

      return _desktop;
    }

    ios.desktop = desktop;

    let _downloads;

    function downloads() {
      _checkPlatform('downloads');

      if (!_downloads) {
        let existingFolderInfo = getExistingFolderInfo(15
        /* DownloadsDirectory */
        );

        if (existingFolderInfo) {
          _downloads = existingFolderInfo.folder;
          _downloads._path = existingFolderInfo.path;
          _downloads._isKnown = true;
        }
      }

      return _downloads;
    }

    ios.downloads = downloads;

    let _movies;

    function movies() {
      _checkPlatform('movies');

      if (!_movies) {
        let existingFolderInfo = getExistingFolderInfo(17
        /* MoviesDirectory */
        );

        if (existingFolderInfo) {
          _movies = existingFolderInfo.folder;
          _movies._path = existingFolderInfo.path;
          _movies._isKnown = true;
        }
      }

      return _movies;
    }

    ios.movies = movies;

    let _music;

    function music() {
      _checkPlatform('music');

      if (!_music) {
        let existingFolderInfo = getExistingFolderInfo(18
        /* MusicDirectory */
        );

        if (existingFolderInfo) {
          _music = existingFolderInfo.folder;
          _music._path = existingFolderInfo.path;
          _music._isKnown = true;
        }
      }

      return _music;
    }

    ios.music = music;

    let _pictures;

    function pictures() {
      _checkPlatform('pictures');

      if (!_pictures) {
        let existingFolderInfo = getExistingFolderInfo(19
        /* PicturesDirectory */
        );

        if (existingFolderInfo) {
          _pictures = existingFolderInfo.folder;
          _pictures._path = existingFolderInfo.path;
          _pictures._isKnown = true;
        }
      }

      return _pictures;
    }

    ios.pictures = pictures;

    let _sharedPublic;

    function sharedPublic() {
      _checkPlatform('sharedPublic');

      if (!_sharedPublic) {
        let existingFolderInfo = getExistingFolderInfo(21
        /* SharedPublicDirectory */
        );

        if (existingFolderInfo) {
          _sharedPublic = existingFolderInfo.folder;
          _sharedPublic._path = existingFolderInfo.path;
          _sharedPublic._isKnown = true;
        }
      }

      return _sharedPublic;
    }

    ios.sharedPublic = sharedPublic;

    function getExistingFolderInfo(pathDirectory
    /* NSSearchPathDirectory */
    ) {
      const fileAccess = getFileAccess();
      const folderPath = fileAccess.getKnownPath(pathDirectory);
      const folderInfo = fileAccess.getExistingFolder(folderPath);

      if (folderInfo) {
        return {
          folder: createFolder(folderInfo),
          path: folderPath
        };
      }

      return undefined;
    }
  })(ios = knownFolders.ios || (knownFolders.ios = {}));
})(knownFolders || (knownFolders = {}));

var path;

(function (path_1) {
  function normalize(path) {
    return getFileAccess().normalizePath(path);
  }

  path_1.normalize = normalize;

  function join(...paths) {
    const fileAccess = getFileAccess();
    return fileAccess.joinPaths(paths);
  }

  path_1.join = join;
  path_1.separator = getFileAccess().getPathSeparator();
})(path || (path = {}));

/***/ }),

/***/ "../node_modules/@nativescript/core/http/http-request/http-request-common.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFilenameFromUrl", function() { return getFilenameFromUrl; });
function getFilenameFromUrl(url) {
  const fs = __webpack_require__("../node_modules/@nativescript/core/file-system/index.js");

  const slashPos = url.lastIndexOf('/') + 1;
  const questionMarkPos = url.lastIndexOf('?');
  let actualFileName;

  if (questionMarkPos !== -1) {
    actualFileName = url.substring(slashPos, questionMarkPos);
  } else {
    actualFileName = url.substring(slashPos);
  }

  const result = fs.path.join(fs.knownFolders.documents().path, actualFileName);
  return result;
}

/***/ }),

/***/ "../node_modules/@nativescript/core/http/http-request/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HttpResponseEncoding", function() { return HttpResponseEncoding; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "request", function() { return request; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "addHeader", function() { return addHeader; });
/* harmony import */ var _utils_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/utils/types.js");
/* harmony import */ var _debugger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("../node_modules/@nativescript/core/debugger/index.js");
/* harmony import */ var _http_request_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("../node_modules/@nativescript/core/http/http-request/http-request-common.js");



var HttpResponseEncoding;

(function (HttpResponseEncoding) {
  HttpResponseEncoding[HttpResponseEncoding["UTF8"] = 0] = "UTF8";
  HttpResponseEncoding[HttpResponseEncoding["GBK"] = 1] = "GBK";
})(HttpResponseEncoding || (HttpResponseEncoding = {}));

const currentDevice = UIDevice.currentDevice;
const device = currentDevice.userInterfaceIdiom === 0
/* Phone */
? 'Phone' : 'Pad';
const osVersion = currentDevice.systemVersion;
const GET = 'GET';
const USER_AGENT_HEADER = 'User-Agent';
const USER_AGENT = `Mozilla/5.0 (i${device}; CPU OS ${osVersion.replace('.', '_')} like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/${osVersion} Mobile/10A5355d Safari/8536.25`;
const sessionConfig = NSURLSessionConfiguration.defaultSessionConfiguration;
const queue = NSOperationQueue.mainQueue;

function parseJSON(source) {
  const src = source.trim();

  if (src.lastIndexOf(')') === src.length - 1) {
    return JSON.parse(src.substring(src.indexOf('(') + 1, src.lastIndexOf(')')));
  }

  return JSON.parse(src);
}

var NSURLSessionTaskDelegateImpl =
/** @class */
function (_super) {
  __extends(NSURLSessionTaskDelegateImpl, _super);

  function NSURLSessionTaskDelegateImpl() {
    return _super !== null && _super.apply(this, arguments) || this;
  }

  NSURLSessionTaskDelegateImpl.prototype.URLSessionTaskWillPerformHTTPRedirectionNewRequestCompletionHandler = function (session, task, response, request, completionHandler) {
    completionHandler(null);
  };

  NSURLSessionTaskDelegateImpl.ObjCProtocols = [NSURLSessionTaskDelegate];
  return NSURLSessionTaskDelegateImpl;
}(NSObject);

const sessionTaskDelegateInstance = NSURLSessionTaskDelegateImpl.new();
let defaultSession;

function ensureDefaultSession() {
  if (!defaultSession) {
    defaultSession = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(sessionConfig, null, queue);
  }
}

let sessionNotFollowingRedirects;

function ensureSessionNotFollowingRedirects() {
  if (!sessionNotFollowingRedirects) {
    sessionNotFollowingRedirects = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(sessionConfig, sessionTaskDelegateInstance, queue);
  }
}

let imageSource;

function ensureImageSource() {
  if (!imageSource) {
    imageSource = __webpack_require__("../node_modules/@nativescript/core/image-source/index.js");
  }
}

let fs;

function ensureFileSystem() {
  if (!fs) {
    fs = __webpack_require__("../node_modules/@nativescript/core/file-system/index.js");
  }
}

function request(options) {
  return new Promise((resolve, reject) => {
    if (!options.url) {
      reject(new Error('Request url was empty.'));
      return;
    }

    try {
      const network = _debugger__WEBPACK_IMPORTED_MODULE_1__["getNetwork"]();
      const debugRequest = network && network.create();
      const urlRequest = NSMutableURLRequest.requestWithURL(NSURL.URLWithString(options.url));
      urlRequest.HTTPMethod = _utils_types__WEBPACK_IMPORTED_MODULE_0__["isDefined"](options.method) ? options.method : GET;
      urlRequest.setValueForHTTPHeaderField(USER_AGENT, USER_AGENT_HEADER);

      if (options.headers) {
        for (let header in options.headers) {
          urlRequest.setValueForHTTPHeaderField(options.headers[header] + '', header);
        }
      }

      if (_utils_types__WEBPACK_IMPORTED_MODULE_0__["isString"](options.content) || options.content instanceof FormData) {
        urlRequest.HTTPBody = NSString.stringWithString(options.content.toString()).dataUsingEncoding(4);
      } else if (options.content instanceof ArrayBuffer) {
        const buffer = options.content;
        urlRequest.HTTPBody = NSData.dataWithData(buffer);
      }

      if (_utils_types__WEBPACK_IMPORTED_MODULE_0__["isNumber"](options.timeout)) {
        urlRequest.timeoutInterval = options.timeout / 1000;
      }

      let session;

      if (_utils_types__WEBPACK_IMPORTED_MODULE_0__["isBoolean"](options.dontFollowRedirects) && options.dontFollowRedirects) {
        ensureSessionNotFollowingRedirects();
        session = sessionNotFollowingRedirects;
      } else {
        ensureDefaultSession();
        session = defaultSession;
      }

      const dataTask = session.dataTaskWithRequestCompletionHandler(urlRequest, function (data, response, error) {
        if (error) {
          reject(new Error(error.localizedDescription));
        } else {
          const headers = {};

          if (response && response.allHeaderFields) {
            const headerFields = response.allHeaderFields;
            headerFields.enumerateKeysAndObjectsUsingBlock((key, value, stop) => {
              addHeader(headers, key, value);
            });
          }

          if (debugRequest) {
            debugRequest.mimeType = response.MIMEType;
            debugRequest.data = data;
            const debugResponse = {
              url: options.url,
              status: response.statusCode,
              statusText: NSHTTPURLResponse.localizedStringForStatusCode(response.statusCode),
              headers: headers,
              mimeType: response.MIMEType,
              fromDiskCache: false
            };
            debugRequest.responseReceived(debugResponse);
            debugRequest.loadingFinished();
          }

          resolve({
            content: {
              raw: data,
              toArrayBuffer: () => interop.bufferFromData(data),
              toString: encoding => {
                const str = NSDataToString(data, encoding);

                if (typeof str === 'string') {
                  return str;
                } else {
                  throw new Error('Response content may not be converted to string');
                }
              },
              toJSON: encoding => parseJSON(NSDataToString(data, encoding)),
              toImage: () => {
                ensureImageSource();
                return new Promise((resolve, reject) => {
                  UIImage.tns_decodeImageWithDataCompletion(data, image => {
                    if (image) {
                      resolve(new imageSource.ImageSource(image));
                    } else {
                      reject(new Error('Response content may not be converted to an Image'));
                    }
                  });
                });
              },
              toFile: destinationFilePath => {
                ensureFileSystem();

                if (!destinationFilePath) {
                  destinationFilePath = Object(_http_request_common__WEBPACK_IMPORTED_MODULE_2__["getFilenameFromUrl"])(options.url);
                }

                if (data instanceof NSData) {
                  // ensure destination path exists by creating any missing parent directories
                  const file = fs.File.fromPath(destinationFilePath);
                  data.writeToFileAtomically(destinationFilePath, true);
                  return file;
                } else {
                  reject(new Error(`Cannot save file with path: ${destinationFilePath}.`));
                }
              }
            },
            statusCode: response.statusCode,
            headers: headers
          });
        }
      });

      if (options.url && debugRequest) {
        const request = {
          url: options.url,
          method: 'GET',
          headers: options.headers
        };
        debugRequest.requestWillBeSent(request);
      }

      dataTask.resume();
    } catch (ex) {
      reject(ex);
    }
  });
}

function NSDataToString(data, encoding) {
  let code = NSUTF8StringEncoding; // long:4

  if (encoding === HttpResponseEncoding.GBK) {
    code = 1586
    /* kCFStringEncodingGB_18030_2000 */
    ; // long:1586
  }

  let encodedString = NSString.alloc().initWithDataEncoding(data, code); // If UTF8 string encoding fails try with ISO-8859-1

  if (!encodedString) {
    code = NSISOLatin1StringEncoding; // long:5

    encodedString = NSString.alloc().initWithDataEncoding(data, code);
  }

  return encodedString.toString();
}

function addHeader(headers, key, value) {
  if (!headers[key]) {
    headers[key] = value;
  } else if (Array.isArray(headers[key])) {
    headers[key].push(value);
  } else {
    const values = [headers[key]];
    values.push(value);
    headers[key] = values;
  }
}

/***/ }),

/***/ "../node_modules/@nativescript/core/http/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HttpResponseEncoding", function() { return HttpResponseEncoding; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getString", function() { return getString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getJSON", function() { return getJSON; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getImage", function() { return getImage; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getFile", function() { return getFile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getBinary", function() { return getBinary; });
/* harmony import */ var _http_request__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/http/http-request/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "request", function() { return _http_request__WEBPACK_IMPORTED_MODULE_0__["request"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "addHeader", function() { return _http_request__WEBPACK_IMPORTED_MODULE_0__["addHeader"]; });



var HttpResponseEncoding;

(function (HttpResponseEncoding) {
  HttpResponseEncoding[HttpResponseEncoding["UTF8"] = 0] = "UTF8";
  HttpResponseEncoding[HttpResponseEncoding["GBK"] = 1] = "GBK";
})(HttpResponseEncoding || (HttpResponseEncoding = {}));

function getString(arg) {
  return new Promise((resolve, reject) => {
    _http_request__WEBPACK_IMPORTED_MODULE_0__["request"](typeof arg === 'string' ? {
      url: arg,
      method: 'GET'
    } : arg).then(r => {
      try {
        const str = r.content.toString();
        resolve(str);
      } catch (e) {
        reject(e);
      }
    }, e => reject(e));
  });
}
function getJSON(arg) {
  return new Promise((resolve, reject) => {
    _http_request__WEBPACK_IMPORTED_MODULE_0__["request"](typeof arg === 'string' ? {
      url: arg,
      method: 'GET'
    } : arg).then(r => {
      try {
        const json = r.content.toJSON();
        resolve(json);
      } catch (e) {
        reject(e);
      }
    }, e => reject(e));
  });
}
function getImage(arg) {
  return new Promise((resolve, reject) => {
    _http_request__WEBPACK_IMPORTED_MODULE_0__["request"](typeof arg === 'string' ? {
      url: arg,
      method: 'GET'
    } : arg).then(r => {
      try {
        resolve(r.content.toImage());
      } catch (err) {
        reject(err);
      }
    }, err => {
      reject(err);
    });
  });
}
function getFile(arg, destinationFilePath) {
  return new Promise((resolve, reject) => {
    _http_request__WEBPACK_IMPORTED_MODULE_0__["request"](typeof arg === 'string' ? {
      url: arg,
      method: 'GET'
    } : arg).then(r => {
      try {
        const file = r.content.toFile(destinationFilePath);
        resolve(file);
      } catch (e) {
        reject(e);
      }
    }, e => reject(e));
  });
}
function getBinary(arg) {
  return new Promise((resolve, reject) => {
    _http_request__WEBPACK_IMPORTED_MODULE_0__["request"](typeof arg === 'string' ? {
      url: arg,
      method: 'GET'
    } : arg).then(r => {
      try {
        const arrayBuffer = r.content.toArrayBuffer();
        resolve(arrayBuffer);
      } catch (e) {
        reject(e);
      }
    }, e => reject(e));
  });
}

/***/ }),

/***/ "../node_modules/@nativescript/core/image-source/image-source-common.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getScaledDimensions", function() { return getScaledDimensions; });
function getScaledDimensions(width, height, maxSize) {
  if (height >= width) {
    if (height <= maxSize) {
      // if image already smaller than the required height
      return {
        width,
        height
      };
    }

    return {
      width: Math.round(maxSize * width / height),
      height: maxSize
    };
  }

  if (width <= maxSize) {
    // if image already smaller than the required width
    return {
      width,
      height
    };
  }

  return {
    width: maxSize,
    height: Math.round(maxSize * height / width)
  };
}

/***/ }),

/***/ "../node_modules/@nativescript/core/image-source/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ImageSource", function() { return ImageSource; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromAsset", function() { return fromAsset; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromResource", function() { return fromResource; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromFile", function() { return fromFile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromData", function() { return fromData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromFontIconCode", function() { return fromFontIconCode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromBase64", function() { return fromBase64; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromNativeSource", function() { return fromNativeSource; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromUrl", function() { return fromUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fromFileOrResource", function() { return fromFileOrResource; });
/* harmony import */ var _ui_styling_font__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/ui/styling/font.js");
/* harmony import */ var _file_system__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("../node_modules/@nativescript/core/file-system/index.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("../node_modules/@nativescript/core/utils/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isFileOrResourcePath", function() { return _utils__WEBPACK_IMPORTED_MODULE_2__["isFileOrResourcePath"]; });

/* harmony import */ var _image_source_common__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("../node_modules/@nativescript/core/image-source/image-source-common.js");
 // Types.





let http;

function ensureHttp() {
  if (!http) {
    http = __webpack_require__("../node_modules/@nativescript/core/http/index.js");
  }
}

class ImageSource {
  constructor(nativeSource) {
    if (nativeSource) {
      this.setNativeSource(nativeSource);
    }
  }

  get height() {
    if (this.ios) {
      return this.ios.size.height;
    }

    return NaN;
  }

  get width() {
    if (this.ios) {
      return this.ios.size.width;
    }

    return NaN;
  }

  get rotationAngle() {
    return NaN;
  }

  set rotationAngle(_value) {// compatibility with Android
  }

  static fromAsset(asset) {
    return new Promise((resolve, reject) => {
      asset.getImageAsync((image, err) => {
        if (image) {
          resolve(new ImageSource(image));
        } else {
          reject(err);
        }
      });
    });
  }

  static fromUrl(url) {
    ensureHttp();
    return http.getImage(url);
  }

  static fromResourceSync(name) {
    const nativeSource = UIImage.tns_safeImageNamed(name) || UIImage.tns_safeImageNamed(`${name}.jpg`);
    return nativeSource ? new ImageSource(nativeSource) : null;
  }

  static fromResource(name) {
    return new Promise((resolve, reject) => {
      try {
        UIImage.tns_safeDecodeImageNamedCompletion(name, image => {
          if (image) {
            resolve(new ImageSource(image));
          } else {
            UIImage.tns_safeDecodeImageNamedCompletion(`${name}.jpg`, image => {
              resolve(new ImageSource(image));
            });
          }
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  static fromFileSync(path) {
    const uiImage = UIImage.imageWithContentsOfFile(getFileName(path));
    return uiImage ? new ImageSource(uiImage) : null;
  }

  static fromFile(path) {
    return new Promise((resolve, reject) => {
      try {
        UIImage.tns_decodeImageWidthContentsOfFileCompletion(getFileName(path), uiImage => {
          resolve(new ImageSource(uiImage));
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  static fromFileOrResourceSync(path) {
    if (!Object(_utils__WEBPACK_IMPORTED_MODULE_2__["isFileOrResourcePath"])(path)) {
      throw new Error('Path "' + '" is not a valid file or resource.');
    }

    if (path.indexOf(_utils__WEBPACK_IMPORTED_MODULE_2__["RESOURCE_PREFIX"]) === 0) {
      return ImageSource.fromResourceSync(path.substr(_utils__WEBPACK_IMPORTED_MODULE_2__["RESOURCE_PREFIX"].length));
    }

    return ImageSource.fromFileSync(path);
  }

  static fromDataSync(data) {
    const uiImage = UIImage.imageWithData(data);
    return uiImage ? new ImageSource(uiImage) : null;
  }

  static fromData(data) {
    return new Promise((resolve, reject) => {
      try {
        UIImage.tns_decodeImageWithDataCompletion(data, uiImage => {
          resolve(new ImageSource(uiImage));
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  static fromBase64Sync(source) {
    let uiImage;

    if (typeof source === 'string') {
      const data = NSData.alloc().initWithBase64EncodedStringOptions(source, 1
      /* IgnoreUnknownCharacters */
      );
      uiImage = UIImage.imageWithData(data);
    }

    return uiImage ? new ImageSource(uiImage) : null;
  }

  static fromBase64(source) {
    return new Promise((resolve, reject) => {
      try {
        const data = NSData.alloc().initWithBase64EncodedStringOptions(source, 1
        /* IgnoreUnknownCharacters */
        );
        const main_queue = dispatch_get_current_queue();
        const background_queue = dispatch_get_global_queue(21
        /* QOS_CLASS_DEFAULT */
        , 0);
        dispatch_async(background_queue, () => {
          const uiImage = UIImage.imageWithData(data);
          dispatch_async(main_queue, () => {
            resolve(new ImageSource(uiImage));
          });
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  static fromFontIconCodeSync(source, font, color) {
    font = font || _ui_styling_font__WEBPACK_IMPORTED_MODULE_0__["Font"].default;
    let fontSize = _utils__WEBPACK_IMPORTED_MODULE_2__["layout"].toDevicePixels(font.fontSize);

    if (!fontSize) {
      // TODO: Consider making 36 font size as default for optimal look on TabView and ActionBar
      fontSize = UIFont.labelFontSize;
    }

    const density = _utils__WEBPACK_IMPORTED_MODULE_2__["layout"].getDisplayDensity();
    const scaledFontSize = fontSize * density;
    const attributes = {
      [NSFontAttributeName]: font.getUIFont(UIFont.systemFontOfSize(scaledFontSize))
    };

    if (color) {
      attributes[NSForegroundColorAttributeName] = color.ios;
    }

    const attributedString = NSAttributedString.alloc().initWithStringAttributes(source, attributes);
    UIGraphicsBeginImageContextWithOptions(attributedString.size(), false, 0.0);
    attributedString.drawAtPoint(CGPointMake(0, 0));
    const iconImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return iconImage ? new ImageSource(iconImage) : null;
  }

  fromAsset(asset) {
    console.log('fromAsset() is deprecated. Use ImageSource.fromAsset() instead.');
    return ImageSource.fromAsset(asset).then(imgSource => {
      this.setNativeSource(imgSource.ios);
      return this;
    });
  }

  loadFromResource(name) {
    console.log('loadFromResource() is deprecated. Use ImageSource.fromResourceSync() instead.');
    const imgSource = ImageSource.fromResourceSync(name);
    this.ios = imgSource ? imgSource.ios : null;
    return !!this.ios;
  }

  fromResource(name) {
    console.log('fromResource() is deprecated. Use ImageSource.fromResource() instead.');
    return ImageSource.fromResource(name).then(imgSource => {
      this.ios = imgSource.ios;
      return !!this.ios;
    });
  }

  loadFromFile(path) {
    console.log('loadFromFile() is deprecated. Use ImageSource.fromFileSync() instead.');
    const imgSource = ImageSource.fromFileSync(path);
    this.ios = imgSource ? imgSource.ios : null;
    return !!this.ios;
  }

  fromFile(path) {
    console.log('fromFile() is deprecated. Use ImageSource.fromFile() instead.');
    return ImageSource.fromFile(path).then(imgSource => {
      this.ios = imgSource.ios;
      return !!this.ios;
    });
  }

  loadFromData(data) {
    console.log('loadFromData() is deprecated. Use ImageSource.fromDataSync() instead.');
    const imgSource = ImageSource.fromDataSync(data);
    this.ios = imgSource ? imgSource.ios : null;
    return !!this.ios;
  }

  fromData(data) {
    console.log('fromData() is deprecated. Use ImageSource.fromData() instead.');
    return ImageSource.fromData(data).then(imgSource => {
      this.ios = imgSource.ios;
      return !!this.ios;
    });
  }

  loadFromBase64(source) {
    console.log('loadFromBase64() is deprecated. Use ImageSource.fromBase64Sync() instead.');
    const imgSource = ImageSource.fromBase64Sync(source);
    this.ios = imgSource ? imgSource.ios : null;
    return !!this.ios;
  }

  fromBase64(source) {
    console.log('fromBase64() is deprecated. Use ImageSource.fromBase64() instead.');
    return ImageSource.fromBase64(source).then(imgSource => {
      this.ios = imgSource.ios;
      return !!this.ios;
    });
  }

  loadFromFontIconCode(source, font, color) {
    console.log('loadFromFontIconCode() is deprecated. Use ImageSource.fromFontIconCodeSync() instead.');
    const imgSource = ImageSource.fromFontIconCodeSync(source, font, color);
    this.ios = imgSource ? imgSource.ios : null;
    return !!this.ios;
  }

  setNativeSource(source) {
    if (source && !(source instanceof UIImage)) {
      throw new Error('The method setNativeSource() expects UIImage instance.');
    }

    this.ios = source;
  }

  saveToFile(path, format, quality) {
    if (!this.ios) {
      return false;
    }

    if (quality) {
      quality = (quality - 0) / (100 - 0); // Normalize quality on a scale of 0 to 1
    }

    const data = getImageData(this.ios, format, quality);

    if (data) {
      return NSFileManager.defaultManager.createFileAtPathContentsAttributes(path, data, null);
    }

    return false;
  }

  toBase64String(format, quality) {
    let res = null;

    if (!this.ios) {
      return res;
    }

    if (quality) {
      quality = (quality - 0) / (100 - 0); // Normalize quality on a scale of 0 to 1
    }

    const data = getImageData(this.ios, format, quality);

    if (data) {
      res = data.base64Encoding();
    }

    return res;
  }

  resize(maxSize, options) {
    const size = this.ios.size;
    const dim = Object(_image_source_common__WEBPACK_IMPORTED_MODULE_3__["getScaledDimensions"])(size.width, size.height, maxSize);
    const newSize = CGSizeMake(dim.width, dim.height);
    UIGraphicsBeginImageContextWithOptions(newSize, true, this.ios.scale);
    this.ios.drawInRect(CGRectMake(0, 0, newSize.width, newSize.height));
    const resizedImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return new ImageSource(resizedImage);
  }

}

function getFileName(path) {
  let fileName = typeof path === 'string' ? path.trim() : '';

  if (fileName.indexOf('~/') === 0) {
    fileName = _file_system__WEBPACK_IMPORTED_MODULE_1__["path"].join(_file_system__WEBPACK_IMPORTED_MODULE_1__["knownFolders"].currentApp().path, fileName.replace('~/', ''));
  }

  return fileName;
}

function getImageData(instance, format, quality = 0.9) {
  let data = null;

  switch (format) {
    case 'png':
      data = UIImagePNGRepresentation(instance);
      break;

    case 'jpeg':
    case 'jpg':
      data = UIImageJPEGRepresentation(instance, quality);
      break;
  }

  return data;
}

function fromAsset(asset) {
  console.log('fromAsset() is deprecated. Use ImageSource.fromAsset() instead.');
  return ImageSource.fromAsset(asset);
}
function fromResource(name) {
  console.log('fromResource() is deprecated. Use ImageSource.fromResourceSync() instead.');
  return ImageSource.fromResourceSync(name);
}
function fromFile(path) {
  console.log('fromFile() is deprecated. Use ImageSource.fromFileSync() instead.');
  return ImageSource.fromFileSync(path);
}
function fromData(data) {
  console.log('fromData() is deprecated. Use ImageSource.fromDataSync() instead.');
  return ImageSource.fromDataSync(data);
}
function fromFontIconCode(source, font, color) {
  console.log('fromFontIconCode() is deprecated. Use ImageSource.fromFontIconCodeSync() instead.');
  return ImageSource.fromFontIconCodeSync(source, font, color);
}
function fromBase64(source) {
  console.log('fromBase64() is deprecated. Use ImageSource.fromBase64Sync() instead.');
  return ImageSource.fromBase64Sync(source);
}
function fromNativeSource(nativeSource) {
  console.log('fromNativeSource() is deprecated. Use ImageSource constructor instead.');
  return new ImageSource(nativeSource);
}
function fromUrl(url) {
  console.log('fromUrl() is deprecated. Use ImageSource.fromUrl() instead.');
  return ImageSource.fromUrl(url);
}
function fromFileOrResource(path) {
  console.log('fromFileOrResource() is deprecated. Use ImageSource.fromFileOrResourceSync() instead.');
  return ImageSource.fromFileOrResourceSync(path);
}

/***/ }),

/***/ "../node_modules/@nativescript/core/platform/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "platformNames", function() { return platformNames; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Device", function() { return Device; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Screen", function() { return Screen; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isAndroid", function() { return isAndroid; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isIOS", function() { return isIOS; });
/* tslint:disable:class-name */
const platformNames = {
  android: 'Android',
  ios: 'iOS'
};

class DeviceRef {
  get manufacturer() {
    return 'Apple';
  }

  get os() {
    return platformNames.ios;
  }

  get osVersion() {
    if (!this._osVersion) {
      this._osVersion = UIDevice.currentDevice.systemVersion;
    }

    return this._osVersion;
  }

  get model() {
    if (!this._model) {
      this._model = UIDevice.currentDevice.model;
    }

    return this._model;
  }

  get sdkVersion() {
    if (!this._sdkVersion) {
      this._sdkVersion = UIDevice.currentDevice.systemVersion;
    }

    return this._sdkVersion;
  }

  get deviceType() {
    if (!this._deviceType) {
      if (UIDevice.currentDevice.userInterfaceIdiom === 0
      /* Phone */
      ) {
          this._deviceType = 'Phone';
        } else {
        this._deviceType = 'Tablet';
      }
    }

    return this._deviceType;
  }

  get uuid() {
    const userDefaults = NSUserDefaults.standardUserDefaults;
    const uuid_key = 'TNSUUID';
    let app_uuid = userDefaults.stringForKey(uuid_key);

    if (!app_uuid) {
      app_uuid = NSUUID.UUID().UUIDString;
      userDefaults.setObjectForKey(app_uuid, uuid_key);
      userDefaults.synchronize();
    }

    return app_uuid;
  }

  get language() {
    if (!this._language) {
      const languages = NSLocale.preferredLanguages;
      this._language = languages[0];
    }

    return this._language;
  }

  get region() {
    if (!this._region) {
      this._region = NSLocale.currentLocale.objectForKey(NSLocaleCountryCode);
    }

    return this._region;
  }

}

class MainScreen {
  get screen() {
    if (!this._screen) {
      this._screen = UIScreen.mainScreen;
    }

    return this._screen;
  }

  get widthPixels() {
    return this.widthDIPs * this.scale;
  }

  get heightPixels() {
    return this.heightDIPs * this.scale;
  }

  get scale() {
    return this.screen.scale;
  }

  get widthDIPs() {
    return this.screen.bounds.size.width;
  }

  get heightDIPs() {
    return this.screen.bounds.size.height;
  }

}

const Device = new DeviceRef();
class Screen {}
Screen.mainScreen = new MainScreen();
const isAndroid = false;
const isIOS = true;

/***/ }),

/***/ "../node_modules/@nativescript/core/profiling/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* WEBPACK VAR INJECTION */(function(global) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "uptime", function() { return uptime; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "log", function() { return log; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "time", function() { return time; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "start", function() { return start; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stop", function() { return stop; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "timer", function() { return timer; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "print", function() { return print; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isRunning", function() { return isRunning; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Level", function() { return Level; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "enable", function() { return enable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "disable", function() { return disable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "profile", function() { return profile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dumpProfiles", function() { return dumpProfiles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resetProfiles", function() { return resetProfiles; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "startCPUProfile", function() { return startCPUProfile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "stopCPUProfile", function() { return stopCPUProfile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "level", function() { return level; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "trace", function() { return trace; });
function uptime() {
  return global.android ? org.nativescript.Process.getUpTime() : global.__tns_uptime();
}
function log(message) {
  if (global.__nslog) {
    global.__nslog('CONSOLE LOG: ' + message);
  }

  console.log(message);
} // Use object instead of map as it is a bit faster

const timers = {};
const anyGlobal = global;
const profileNames = [];
const time = global.__time || Date.now;
function start(name) {
  let info = timers[name];

  if (info) {
    info.currentStart = time();
    info.runCount++;
  } else {
    info = {
      totalTime: 0,
      count: 0,
      currentStart: time(),
      runCount: 1
    };
    timers[name] = info;
    profileNames.push(name);
  }
}
function stop(name) {
  const info = timers[name];

  if (!info) {
    throw new Error(`No timer started: ${name}`);
  }

  if (info.runCount) {
    info.runCount--;

    if (info.runCount) {
      info.count++;
    } else {
      info.lastTime = time() - info.currentStart;
      info.totalTime += info.lastTime;
      info.count++;
      info.currentStart = 0;
    }
  } else {
    throw new Error(`Timer ${name} paused more times than started.`);
  }

  return info;
}
function timer(name) {
  return timers[name];
}
function print(name) {
  const info = timers[name];

  if (!info) {
    throw new Error(`No timer started: ${name}`);
  }

  console.log(`---- [${name}] STOP total: ${info.totalTime} count:${info.count}`);
  return info;
}
function isRunning(name) {
  const info = timers[name];
  return !!(info && info.runCount);
}

function countersProfileFunctionFactory(fn, name, type = 1
/* Instance */
) {
  profileNames.push(name);
  return function () {
    start(name);

    try {
      return fn.apply(this, arguments);
    } finally {
      stop(name);
    }
  };
}

function timelineProfileFunctionFactory(fn, name, type = 1
/* Instance */
) {
  return type === 1
  /* Instance */
  ? function () {
    const start = time();

    try {
      return fn.apply(this, arguments);
    } finally {
      const end = time();
      console.log(`Timeline: Modules: ${name} ${this}  (${start}ms. - ${end}ms.)`);
    }
  } : function () {
    const start = time();

    try {
      return fn.apply(this, arguments);
    } finally {
      const end = time();
      console.log(`Timeline: Modules: ${name}  (${start}ms. - ${end}ms.)`);
    }
  };
}

var Level;

(function (Level) {
  Level[Level["none"] = 0] = "none";
  Level[Level["lifecycle"] = 1] = "lifecycle";
  Level[Level["timeline"] = 2] = "timeline";
})(Level || (Level = {}));

let tracingLevel = Level.none;
let profileFunctionFactory;
function enable(mode = 'counters') {
  profileFunctionFactory = mode && {
    counters: countersProfileFunctionFactory,
    timeline: timelineProfileFunctionFactory
  }[mode];
  tracingLevel = {
    lifecycle: Level.lifecycle,
    timeline: Level.timeline
  }[mode] || Level.none;
}

try {
  const appConfig = __webpack_require__("~/package.json");

  if (appConfig && appConfig.profiling) {
    enable(appConfig.profiling);
  }
} catch (e1) {
  try {
    console.log('Profiling startup failed to figure out defaults from package.json, error: ' + e1);
  } catch (e2) {// We can get here if an exception is thrown in the mksnapshot as there is no console there.
  }
}

function disable() {
  profileFunctionFactory = undefined;
}

function profileFunction(fn, customName) {
  return profileFunctionFactory(fn, customName || fn.name);
}

const profileMethodUnnamed = (target, key, descriptor) => {
  // save a reference to the original method this way we keep the values currently in the
  // descriptor and don't overwrite what another decorator might have done to the descriptor.
  if (descriptor === undefined) {
    descriptor = Object.getOwnPropertyDescriptor(target, key);
  }

  const originalMethod = descriptor.value;
  let className = '';

  if (target && target.constructor && target.constructor.name) {
    className = target.constructor.name + '.';
  }

  let name = className + key; //editing the descriptor/value parameter

  descriptor.value = profileFunctionFactory(originalMethod, name, 1
  /* Instance */
  ); // return edited descriptor as opposed to overwriting the descriptor

  return descriptor;
};

const profileStaticMethodUnnamed = (ctor, key, descriptor) => {
  // save a reference to the original method this way we keep the values currently in the
  // descriptor and don't overwrite what another decorator might have done to the descriptor.
  if (descriptor === undefined) {
    descriptor = Object.getOwnPropertyDescriptor(ctor, key);
  }

  const originalMethod = descriptor.value;
  let className = '';

  if (ctor && ctor.name) {
    className = ctor.name + '.';
  }

  let name = className + key; //editing the descriptor/value parameter

  descriptor.value = profileFunctionFactory(originalMethod, name, 0
  /* Static */
  ); // return edited descriptor as opposed to overwriting the descriptor

  return descriptor;
};

function profileMethodNamed(name) {
  return (target, key, descriptor) => {
    // save a reference to the original method this way we keep the values currently in the
    // descriptor and don't overwrite what another decorator might have done to the descriptor.
    if (descriptor === undefined) {
      descriptor = Object.getOwnPropertyDescriptor(target, key);
    }

    const originalMethod = descriptor.value; //editing the descriptor/value parameter

    descriptor.value = profileFunctionFactory(originalMethod, name); // return edited descriptor as opposed to overwriting the descriptor

    return descriptor;
  };
}

const voidMethodDecorator = () => {// no op
};

function profile(nameFnOrTarget, fnOrKey, descriptor, attrs) {
  if (typeof nameFnOrTarget === 'object' && (typeof fnOrKey === 'string' || typeof fnOrKey === 'symbol')) {
    if (!profileFunctionFactory) {
      return;
    }

    return profileMethodUnnamed(nameFnOrTarget, fnOrKey, descriptor);
  } else if (typeof nameFnOrTarget === 'function' && (typeof fnOrKey === 'string' || typeof fnOrKey === 'symbol')) {
    if (!profileFunctionFactory) {
      return;
    }

    return profileStaticMethodUnnamed(nameFnOrTarget, fnOrKey, descriptor);
  } else if (typeof nameFnOrTarget === 'string' && typeof fnOrKey === 'function') {
    if (!profileFunctionFactory) {
      return fnOrKey;
    }

    return profileFunction(fnOrKey, nameFnOrTarget);
  } else if (typeof nameFnOrTarget === 'function') {
    if (!profileFunctionFactory) {
      return nameFnOrTarget;
    }

    return profileFunction(nameFnOrTarget);
  } else if (typeof nameFnOrTarget === 'string') {
    if (!profileFunctionFactory) {
      return voidMethodDecorator;
    }

    return profileMethodNamed(nameFnOrTarget);
  } else {
    if (!profileFunctionFactory) {
      return voidMethodDecorator;
    }

    return profileMethodUnnamed;
  }
}
function dumpProfiles() {
  profileNames.forEach(function (name) {
    const info = timers[name];

    if (info) {
      console.log('---- [' + name + '] STOP total: ' + info.totalTime + ' count:' + info.count);
    } else {
      console.log('---- [' + name + '] Never called');
    }
  });
}
function resetProfiles() {
  profileNames.forEach(function (name) {
    const info = timers[name];

    if (info) {
      if (info.runCount) {
        console.log('---- timer with name [' + name + "] is currently running and won't be reset");
      } else {
        timers[name] = undefined;
      }
    }
  });
}
function startCPUProfile(name) {
  if (anyGlobal.android) {
    __startCPUProfiler(name);
  }
}
function stopCPUProfile(name) {
  if (anyGlobal.android) {
    __stopCPUProfiler(name);
  }
}
function level() {
  return tracingLevel;
}
function trace(message, start, end) {
  log(`Timeline: Modules: ${message}  (${start}ms. - ${end}ms.)`);
}
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("../node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../node_modules/@nativescript/core/text/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "encoding", function() { return encoding; });
/* harmony import */ var _text_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/text/text-common.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TextDecoder", function() { return _text_common__WEBPACK_IMPORTED_MODULE_0__["TextDecoder"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TextEncoder", function() { return _text_common__WEBPACK_IMPORTED_MODULE_0__["TextEncoder"]; });


var encoding;

(function (encoding) {
  encoding.ISO_8859_1 = 5; //NSISOLatin1StringEncoding

  encoding.US_ASCII = 1; //NSASCIIStringEncoding

  encoding.UTF_16 = 10; //NSUnicodeStringEncoding

  encoding.UTF_16BE = 0x90000100; //NSUTF16BigEndianStringEncoding

  encoding.UTF_16LE = 0x94000100; //NSUTF16LittleEndianStringEncoding

  encoding.UTF_8 = 4; //NSUTF8StringEncoding
})(encoding || (encoding = {}));

/***/ }),

/***/ "../node_modules/@nativescript/core/text/text-common.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextDecoder", function() { return TextDecoder; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TextEncoder", function() { return TextEncoder; });
const Object_prototype_toString = {}.toString;
const ArrayBufferString = Object_prototype_toString.call(ArrayBuffer.prototype);

function decoderReplacer(encoded) {
  var codePoint = encoded.charCodeAt(0) << 24;
  var leadingOnes = Math.clz32(~codePoint) | 0;
  var endPos = 0,
      stringLen = encoded.length | 0;
  var result = '';

  if (leadingOnes < 5 && stringLen >= leadingOnes) {
    codePoint = codePoint << leadingOnes >>> 24 + leadingOnes;

    for (endPos = 1; endPos < leadingOnes; endPos = endPos + 1 | 0) {
      codePoint = codePoint << 6 | encoded.charCodeAt(endPos) & 0x3f
      /*0b00111111*/
      ;
    }

    if (codePoint <= 0xffff) {
      // BMP code point
      result += String.fromCharCode(codePoint);
    } else if (codePoint <= 0x10ffff) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      codePoint = codePoint - 0x10000 | 0;
      result += String.fromCharCode((codePoint >> 10) + 0xd800 | 0, // highSurrogate
      (codePoint & 0x3ff) + 0xdc00 | 0 // lowSurrogate
      );
    } else {
      endPos = 0;
    } // to fill it in with INVALIDs

  }

  for (; endPos < stringLen; endPos = endPos + 1 | 0) {
    result += '\ufffd';
  }

  return result;
}

function encoderReplacer(nonAsciiChars) {
  // make the UTF string into a binary UTF-8 encoded string
  var point = nonAsciiChars.charCodeAt(0) | 0;

  if (point >= 0xd800 && point <= 0xdbff) {
    var nextcode = nonAsciiChars.charCodeAt(1) | 0;

    if (nextcode !== nextcode) {
      // NaN because string is 1 code point long
      return String.fromCharCode(0xef
      /*11101111*/
      , 0xbf
      /*10111111*/
      , 0xbd
      /*10111101*/
      );
    } // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae


    if (nextcode >= 0xdc00 && nextcode <= 0xdfff) {
      point = (point - 0xd800 << 10) + nextcode - 0xdc00 + 0x10000 | 0;

      if (point > 0xffff) {
        return String.fromCharCode(0x1e
        /*0b11110*/
        << 3 | point >>> 18, 0x2
        /*0b10*/
        << 6 | point >>> 12 & 0x3f
        /*0b00111111*/
        , 0x2
        /*0b10*/
        << 6 | point >>> 6 & 0x3f
        /*0b00111111*/
        , 0x2
        /*0b10*/
        << 6 | point & 0x3f
        /*0b00111111*/
        );
      }
    } else {
      return String.fromCharCode(0xef, 0xbf, 0xbd);
    }
  }

  if (point <= 0x007f) {
    return nonAsciiChars;
  } else if (point <= 0x07ff) {
    return String.fromCharCode(0x6 << 5 | point >>> 6, 0x2 << 6 | point & 0x3f);
  } else {
    return String.fromCharCode(0xe
    /*0b1110*/
    << 4 | point >>> 12, 0x2
    /*0b10*/
    << 6 | point >>> 6 & 0x3f
    /*0b00111111*/
    , 0x2
    /*0b10*/
    << 6 | point & 0x3f
    /*0b00111111*/
    );
  }
}

class TextDecoder {
  constructor() {
    this[Symbol.toStringTag] = 'TextDecoder';
  }

  get encoding() {
    return 'utf-8';
  }

  decode(input) {
    const buffer = ArrayBuffer.isView(input) ? input.buffer : input;

    if (Object_prototype_toString.call(buffer) !== ArrayBufferString) {
      throw Error("Failed to execute 'decode' on 'TextDecoder': The provided value is not of type '(ArrayBuffer or ArrayBufferView)'");
    }

    let inputAs8 = new Uint8Array(buffer);
    let resultingString = '';

    for (let index = 0, len = inputAs8.length | 0; index < len; index = index + 32768 | 0) {
      resultingString += String.fromCharCode.apply(0, inputAs8.slice(index, index + 32768 | 0));
    }

    return resultingString.replace(/[\xc0-\xff][\x80-\xbf]*/g, decoderReplacer);
  }

  toString() {
    return '[object TextDecoder]';
  }

}
class TextEncoder {
  constructor() {
    this[Symbol.toStringTag] = 'TextEncoder';
  }

  get encoding() {
    return 'utf-8';
  }

  encode(input = '') {
    // 0xc0 => 0b11000000; 0xff => 0b11111111; 0xc0-0xff => 0b11xxxxxx
    // 0x80 => 0b10000000; 0xbf => 0b10111111; 0x80-0xbf => 0b10xxxxxx
    const encodedString = input === undefined ? '' : ('' + input).replace(/[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g, encoderReplacer);
    const len = encodedString.length | 0,
          result = new Uint8Array(len);

    for (let i = 0; i < len; i = i + 1 | 0) {
      result[i] = encodedString.charCodeAt(i);
    }

    return result;
  }

  toString() {
    return '[object TextEncoder]';
  }

}

/***/ }),

/***/ "../node_modules/@nativescript/core/trace/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Trace", function() { return Trace; });
let enabled = false;
let _categories = {};
let _writers = [];
let _eventListeners = [];

let _errorHandler;

var Trace;

(function (Trace) {
  /**
   * Enables the trace module.
   */
  function enable() {
    enabled = true;
  }

  Trace.enable = enable;
  /**
   * Disables the trace module.
   */

  function disable() {
    enabled = false;
  }

  Trace.disable = disable;
  /**
   * A function that returns whether the tracer is enabled and there is a point in writing messages.
   * Check this to avoid writing complex string templates.
   * Send error messages even if tracing is disabled.
   */

  function isEnabled() {
    return enabled;
  }

  Trace.isEnabled = isEnabled;
  /**
   * Adds a TraceWriter instance to the trace module.
   * @param writer The TraceWriter instance to add.
   */

  function addWriter(writer) {
    _writers.push(writer);
  }

  Trace.addWriter = addWriter;
  /**
   * Removes a TraceWriter instance from the trace module.
   * @param writer The TraceWriter instance to remove.
   */

  function removeWriter(writer) {
    let index = _writers.indexOf(writer);

    if (index >= 0) {
      _writers.splice(index, 1);
    }
  }

  Trace.removeWriter = removeWriter;
  /**
   * Clears all the writers from the trace module.
   */

  function clearWriters() {
    if (_writers.length > 0) {
      _writers.splice(0, _writers.length);
    }
  }

  Trace.clearWriters = clearWriters;
  /**
   * Sets the categories the module will trace.
   * @param categories The comma-separated list of categories. If not specified all messages from all categories will be traced.
   */

  function setCategories(categories) {
    _categories = {};
    addCategories(categories);
  }

  Trace.setCategories = setCategories;
  /**
   * Adds categories to existing categories the module will trace.
   * @param categories The comma-separated list of categories. If not specified all messages from all categories will be traced.
   */

  function addCategories(categories) {
    let split = categories.split(',');

    for (let i = 0; i < split.length; i++) {
      _categories[split[i].trim()] = true;
    }
  }

  Trace.addCategories = addCategories;
  /**
   * Check if category is already set in trace module.
   * @param category The category to check.
   */

  function isCategorySet(category) {
    return category in _categories;
  }

  Trace.isCategorySet = isCategorySet;
  /**
   * Writes a message using the available writers.
   * @param message The message to be written.
   * @param category The category of the message.
   * @param type Optional, the type of the message - info, warning, error.
   */

  function write(message, category, type) {
    // print error no matter what
    let i;

    if (type === messageType.error) {
      for (i = 0; i < _writers.length; i++) {
        _writers[i].write(message, category, type);
      }

      return;
    }

    if (!enabled) {
      return;
    }

    if (!(category in _categories)) {
      return;
    }

    for (i = 0; i < _writers.length; i++) {
      _writers[i].write(message, category, type);
    }
  }

  Trace.write = write;
  /**
   * Notifies all the attached listeners for an event that has occurred in the sender object.
   * @param object The Object instance that raised the event.
   * @param name The name of the raised event.
   * @param data An optional parameter that passes the data associated with the event.
   */

  function notifyEvent(object, name, data) {
    if (!enabled) {
      return;
    }

    let i, listener, filters;

    for (i = 0; i < _eventListeners.length; i++) {
      listener = _eventListeners[i];

      if (listener.filter) {
        filters = listener.filter.split(',');
        filters.forEach(value => {
          if (value.trim() === name) {
            listener.on(object, name, data);
          }
        });
      } else {
        listener.on(object, name, data);
      }
    }
  }

  Trace.notifyEvent = notifyEvent;

  function addEventListener(listener) {
    _eventListeners.push(listener);
  }

  Trace.addEventListener = addEventListener;

  function removeEventListener(listener) {
    const index = _eventListeners.indexOf(listener);

    if (index >= 0) {
      _eventListeners.splice(index, 1);
    }
  }

  Trace.removeEventListener = removeEventListener;
  let messageType;

  (function (messageType) {
    messageType.log = 0;
    messageType.info = 1;
    messageType.warn = 2;
    messageType.error = 3;
  })(messageType = Trace.messageType || (Trace.messageType = {}));
  /**
   * all predefined categories.
   */


  let categories;

  (function (categories) {
    categories.VisualTreeEvents = 'VisualTreeEvents';
    categories.Layout = 'Layout';
    categories.Style = 'Style';
    categories.ViewHierarchy = 'ViewHierarchy';
    categories.NativeLifecycle = 'NativeLifecycle';
    categories.Debug = 'Debug';
    categories.Navigation = 'Navigation';
    categories.Test = 'Test';
    categories.Binding = 'Binding';
    categories.BindingError = 'BindingError';
    categories.Error = 'Error';
    categories.Animation = 'Animation';
    categories.Transition = 'Transition';
    categories.Livesync = 'Livesync';
    categories.ModuleNameResolver = 'ModuleNameResolver';
    categories.separator = ',';
    categories.All = [categories.VisualTreeEvents, categories.Layout, categories.Style, categories.ViewHierarchy, categories.NativeLifecycle, categories.Debug, categories.Navigation, categories.Test, categories.Binding, categories.Error, categories.Animation, categories.Transition, categories.Livesync, categories.ModuleNameResolver].join(categories.separator);

    function concat(...args) {
      let result;

      for (let i = 0; i < arguments.length; i++) {
        if (!result) {
          result = arguments[i];
          continue;
        }

        result = result.concat(categories.separator, arguments[i]);
      }

      return result;
    }

    categories.concat = concat;
  })(categories = Trace.categories || (Trace.categories = {}));

  class ConsoleWriter {
    write(message, category, type) {
      if (!console) {
        return;
      }

      let msgType;

      if (type === undefined) {
        msgType = messageType.log;
      } else {
        msgType = type;
      }

      switch (msgType) {
        case messageType.log:
          console.log(category + ': ' + message);
          break;

        case messageType.info:
          console.info(category + ': ' + message);
          break;

        case messageType.warn:
          console.warn(category + ': ' + message);
          break;

        case messageType.error:
          console.error(category + ': ' + message);
          break;
      }
    }

  } // register a ConsoleWriter by default


  addWriter(new ConsoleWriter());

  class DefaultErrorHandler {
    handlerError(error) {
      throw error;
    }

  }

  Trace.DefaultErrorHandler = DefaultErrorHandler;
  setErrorHandler(new DefaultErrorHandler());

  function getErrorHandler() {
    return _errorHandler;
  }

  Trace.getErrorHandler = getErrorHandler;

  function setErrorHandler(handler) {
    _errorHandler = handler;
  }

  Trace.setErrorHandler = setErrorHandler;
  /**
   * Passes an error to the registered ErrorHandler
   * @param error The error to be handled.
   */

  function error(error) {
    if (!_errorHandler) {
      return;
    }

    if (typeof error === 'string') {
      error = new Error(error);
    }

    _errorHandler.handlerError(error);
  }

  Trace.error = error;
})(Trace || (Trace = {}));

/***/ }),

/***/ "../node_modules/@nativescript/core/ui/builder/module-name-sanitizer.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "sanitizeModuleName", function() { return sanitizeModuleName; });
/**
 * Helps sanitize a module name if it is prefixed with '~/', '~' or '/'
 * @param moduleName the name
 * @param removeExtension whether to remove extension
 */
function sanitizeModuleName(moduleName, removeExtension = true) {
  moduleName = moduleName.trim();

  if (moduleName.startsWith('~/')) {
    moduleName = moduleName.substring(2);
  } else if (moduleName.startsWith('~')) {
    moduleName = moduleName.substring(1);
  } else if (moduleName.startsWith('/')) {
    moduleName = moduleName.substring(1);
  }

  if (removeExtension) {
    const extToRemove = ['js', 'ts', 'xml', 'html', 'css', 'scss'];
    const extensionRegEx = new RegExp(`(.*)\\.(?:${extToRemove.join('|')})`, 'i');
    moduleName = moduleName.replace(extensionRegEx, '$1');
  }

  return moduleName;
}

/***/ }),

/***/ "../node_modules/@nativescript/core/ui/core/properties/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unsetValue", function() { return unsetValue; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_printUnregisteredProperties", function() { return _printUnregisteredProperties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_getProperties", function() { return _getProperties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_getStyleProperties", function() { return _getStyleProperties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isCssVariable", function() { return isCssVariable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isCssCalcExpression", function() { return isCssCalcExpression; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isCssVariableExpression", function() { return isCssVariableExpression; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_evaluateCssVariableExpression", function() { return _evaluateCssVariableExpression; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "_evaluateCssCalcExpression", function() { return _evaluateCssCalcExpression; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Property", function() { return Property; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CoercibleProperty", function() { return CoercibleProperty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InheritedProperty", function() { return InheritedProperty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CssProperty", function() { return CssProperty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CssAnimationProperty", function() { return CssAnimationProperty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "InheritedCssProperty", function() { return InheritedCssProperty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ShorthandProperty", function() { return ShorthandProperty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "initNativeView", function() { return initNativeView; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applyPendingNativeSetters", function() { return applyPendingNativeSetters; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "applyAllNativeSetters", function() { return applyAllNativeSetters; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resetNativeView", function() { return resetNativeView; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearInheritedProperties", function() { return clearInheritedProperties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resetCSSProperties", function() { return resetCSSProperties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "propagateInheritableProperties", function() { return propagateInheritableProperties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "propagateInheritableCssProperties", function() { return propagateInheritableCssProperties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeValidator", function() { return makeValidator; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeParser", function() { return makeParser; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getSetProperties", function() { return getSetProperties; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getComputedCssValues", function() { return getComputedCssValues; });
/* harmony import */ var reduce_css_calc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/reduce-css-calc/dist/index.js");
/* harmony import */ var reduce_css_calc__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(reduce_css_calc__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _data_observable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("../node_modules/@nativescript/core/data/observable/index.js");
/* harmony import */ var _trace__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("../node_modules/@nativescript/core/trace/index.js");
/* harmony import */ var _profiling__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("../node_modules/@nativescript/core/profiling/index.js");
 // Types.




/**
 * Value specifing that Property should be set to its initial value.
 */

const unsetValue = new Object();
let cssPropertyNames = [];
let symbolPropertyMap = {};
let cssSymbolPropertyMap = {};
let inheritableProperties = new Array();
let inheritableCssProperties = new Array();

function print(map) {
  let symbols = Object.getOwnPropertySymbols(map);

  for (let symbol of symbols) {
    const prop = map[symbol];

    if (!prop.registered) {
      console.log(`Property ${prop.name} not Registered!!!!!`);
    }
  }
}

function _printUnregisteredProperties() {
  print(symbolPropertyMap);
  print(cssSymbolPropertyMap);
}
function _getProperties() {
  return getPropertiesFromMap(symbolPropertyMap);
}
function _getStyleProperties() {
  return getPropertiesFromMap(cssSymbolPropertyMap);
}
function isCssVariable(property) {
  return /^--[^,\s]+?$/.test(property);
}
function isCssCalcExpression(value) {
  return value.includes('calc(');
}
function isCssVariableExpression(value) {
  return value.includes('var(--');
}
function _evaluateCssVariableExpression(view, cssName, value) {
  if (typeof value !== 'string') {
    return value;
  }

  if (!isCssVariableExpression(value)) {
    // Value is not using css-variable(s)
    return value;
  }

  let output = value.trim(); // Evaluate every (and nested) css-variables in the value.

  let lastValue;

  while (lastValue !== output) {
    lastValue = output;
    const idx = output.lastIndexOf('var(');

    if (idx === -1) {
      continue;
    }

    const endIdx = output.indexOf(')', idx);

    if (endIdx === -1) {
      continue;
    }

    const matched = output.substring(idx + 4, endIdx).split(',').map(v => v.trim()).filter(v => !!v);
    const cssVariableName = matched.shift();
    let cssVariableValue = view.style.getCssVariable(cssVariableName);

    if (cssVariableValue === null && matched.length) {
      cssVariableValue = _evaluateCssVariableExpression(view, cssName, matched.join(', ')).split(',')[0];
    }

    if (!cssVariableValue) {
      cssVariableValue = 'unset';
    }

    output = `${output.substring(0, idx)}${cssVariableValue}${output.substring(endIdx + 1)}`;
  }

  return output;
}
function _evaluateCssCalcExpression(value) {
  if (typeof value !== 'string') {
    return value;
  }

  if (isCssCalcExpression(value)) {
    // WORKAROUND: reduce-css-calc can't handle the dip-unit.
    return reduce_css_calc__WEBPACK_IMPORTED_MODULE_0__(value.replace(/([0-9]+(\.[0-9]+)?)dip\b/g, '$1'));
  } else {
    return value;
  }
}

function getPropertiesFromMap(map) {
  const props = [];
  Object.getOwnPropertySymbols(map).forEach(symbol => props.push(map[symbol]));
  return props;
}

class Property {
  constructor(options) {
    this.enumerable = true;
    this.configurable = true;
    const propertyName = options.name;
    this.name = propertyName;
    const key = Symbol(propertyName + ':propertyKey');
    this.key = key;
    const getDefault = Symbol(propertyName + ':getDefault');
    this.getDefault = getDefault;
    const setNative = Symbol(propertyName + ':setNative');
    this.setNative = setNative;
    const defaultValueKey = Symbol(propertyName + ':nativeDefaultValue');
    this.defaultValueKey = defaultValueKey;
    const defaultValue = options.defaultValue;
    this.defaultValue = defaultValue;
    const eventName = propertyName + 'Change';
    const equalityComparer = options.equalityComparer;
    const affectsLayout = options.affectsLayout;
    const valueChanged = options.valueChanged;
    const valueConverter = options.valueConverter;
    const property = this;

    this.set = function (boxedValue) {
      const reset = boxedValue === unsetValue;
      let value;
      let wrapped;

      if (reset) {
        value = defaultValue;
      } else {
        wrapped = boxedValue && boxedValue.wrapped;
        value = wrapped ? _data_observable__WEBPACK_IMPORTED_MODULE_1__["WrappedValue"].unwrap(boxedValue) : boxedValue;

        if (valueConverter && typeof value === 'string') {
          value = valueConverter(value);
        }
      }

      const oldValue = key in this ? this[key] : defaultValue;
      const changed = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;

      if (wrapped || changed) {
        if (affectsLayout) {
          this.requestLayout();
        }

        if (reset) {
          delete this[key];

          if (valueChanged) {
            valueChanged(this, oldValue, value);
          }

          if (this[setNative]) {
            if (this._suspendNativeUpdatesCount) {
              if (this._suspendedUpdates) {
                this._suspendedUpdates[propertyName] = property;
              }
            } else {
              if (defaultValueKey in this) {
                this[setNative](this[defaultValueKey]);
                delete this[defaultValueKey];
              } else {
                this[setNative](defaultValue);
              }
            }
          }
        } else {
          this[key] = value;

          if (valueChanged) {
            valueChanged(this, oldValue, value);
          }

          if (this[setNative]) {
            if (this._suspendNativeUpdatesCount) {
              if (this._suspendedUpdates) {
                this._suspendedUpdates[propertyName] = property;
              }
            } else {
              if (!(defaultValueKey in this)) {
                this[defaultValueKey] = this[getDefault] ? this[getDefault]() : defaultValue;
              }

              this[setNative](value);
            }
          }
        }

        if (this.hasListeners(eventName)) {
          this.notify({
            object: this,
            eventName,
            propertyName,
            value,
            oldValue
          });
        }

        if (this.domNode) {
          if (reset) {
            this.domNode.attributeRemoved(propertyName);
          } else {
            this.domNode.attributeModified(propertyName, value);
          }
        }
      }
    };

    this.get = function () {
      return key in this ? this[key] : defaultValue;
    };

    this.nativeValueChange = function (owner, value) {
      const oldValue = key in owner ? owner[key] : defaultValue;
      const changed = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;

      if (changed) {
        owner[key] = value;

        if (valueChanged) {
          valueChanged(owner, oldValue, value);
        }

        if (owner.nativeViewProtected && !(defaultValueKey in owner)) {
          owner[defaultValueKey] = owner[getDefault] ? owner[getDefault]() : defaultValue;
        }

        if (owner.hasListeners(eventName)) {
          owner.notify({
            object: owner,
            eventName,
            propertyName,
            value,
            oldValue
          });
        }

        if (affectsLayout) {
          owner.requestLayout();
        }

        if (owner.domNode) {
          owner.domNode.attributeModified(propertyName, value);
        }
      }
    };

    symbolPropertyMap[key] = this;
  }

  register(cls) {
    if (this.registered) {
      throw new Error(`Property ${this.name} already registered.`);
    }

    this.registered = true;
    Object.defineProperty(cls.prototype, this.name, this);
  }

  isSet(instance) {
    return this.key in instance;
  }

}
Property.prototype.isStyleProperty = false;
class CoercibleProperty extends Property {
  constructor(options) {
    super(options);
    const propertyName = options.name;
    const key = this.key;
    const getDefault = this.getDefault;
    const setNative = this.setNative;
    const defaultValueKey = this.defaultValueKey;
    const defaultValue = this.defaultValue;
    const coerceKey = Symbol(propertyName + ':coerceKey');
    const eventName = propertyName + 'Change';
    const affectsLayout = options.affectsLayout;
    const equalityComparer = options.equalityComparer;
    const valueChanged = options.valueChanged;
    const valueConverter = options.valueConverter;
    const coerceCallback = options.coerceValue;
    const property = this;

    this.coerce = function (target) {
      const originalValue = coerceKey in target ? target[coerceKey] : defaultValue; // need that to make coercing but also fire change events

      target[propertyName] = originalValue;
    };

    this.set = function (boxedValue) {
      const reset = boxedValue === unsetValue;
      let value;
      let wrapped;

      if (reset) {
        value = defaultValue;
        delete this[coerceKey];
      } else {
        wrapped = boxedValue && boxedValue.wrapped;
        value = wrapped ? _data_observable__WEBPACK_IMPORTED_MODULE_1__["WrappedValue"].unwrap(boxedValue) : boxedValue;

        if (valueConverter && typeof value === 'string') {
          value = valueConverter(value);
        }

        this[coerceKey] = value;
        value = coerceCallback(this, value);
      }

      const oldValue = key in this ? this[key] : defaultValue;
      const changed = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;

      if (wrapped || changed) {
        if (reset) {
          delete this[key];

          if (valueChanged) {
            valueChanged(this, oldValue, value);
          }

          if (this[setNative]) {
            if (this._suspendNativeUpdatesCount) {
              if (this._suspendedUpdates) {
                this._suspendedUpdates[propertyName] = property;
              }
            } else {
              if (defaultValueKey in this) {
                this[setNative](this[defaultValueKey]);
                delete this[defaultValueKey];
              } else {
                this[setNative](defaultValue);
              }
            }
          }
        } else {
          this[key] = value;

          if (valueChanged) {
            valueChanged(this, oldValue, value);
          }

          if (this[setNative]) {
            if (this._suspendNativeUpdatesCount) {
              if (this._suspendedUpdates) {
                this._suspendedUpdates[propertyName] = property;
              }
            } else {
              if (!(defaultValueKey in this)) {
                this[defaultValueKey] = this[getDefault] ? this[getDefault]() : defaultValue;
              }

              this[setNative](value);
            }
          }
        }

        if (this.hasListeners(eventName)) {
          this.notify({
            object: this,
            eventName,
            propertyName,
            value,
            oldValue
          });
        }

        if (affectsLayout) {
          this.requestLayout();
        }

        if (this.domNode) {
          if (reset) {
            this.domNode.attributeRemoved(propertyName);
          } else {
            this.domNode.attributeModified(propertyName, value);
          }
        }
      }
    };
  }

}
class InheritedProperty extends Property {
  constructor(options) {
    super(options);
    const name = options.name;
    const key = this.key;
    const defaultValue = options.defaultValue;
    const sourceKey = Symbol(name + ':valueSourceKey');
    this.sourceKey = sourceKey;
    const setBase = this.set;

    const setFunc = valueSource => function (value) {
      const that = this;
      let unboxedValue;
      let newValueSource;

      if (value === unsetValue) {
        // If unsetValue - we want to reset the property.
        const parent = that.parent; // If we have parent and it has non-default value we use as our inherited value.

        if (parent && parent[sourceKey] !== 0
        /* Default */
        ) {
            unboxedValue = parent[name];
            newValueSource = 1
            /* Inherited */
            ;
          } else {
          unboxedValue = defaultValue;
          newValueSource = 0
          /* Default */
          ;
        }
      } else {
        // else we are set through property set.
        unboxedValue = value;
        newValueSource = valueSource;
      } // take currentValue before calling base - base may change it.


      const currentValue = that[key];
      setBase.call(that, unboxedValue);
      const newValue = that[key];
      that[sourceKey] = newValueSource;

      if (currentValue !== newValue) {
        const reset = newValueSource === 0
        /* Default */
        ;
        that.eachChild(child => {
          const childValueSource = child[sourceKey] || 0
          /* Default */
          ;

          if (reset) {
            if (childValueSource === 1
            /* Inherited */
            ) {
                setFunc.call(child, unsetValue);
              }
          } else {
            if (childValueSource <= 1
            /* Inherited */
            ) {
                setInheritedValue.call(child, newValue);
              }
          }

          return true;
        });
      }
    };

    const setInheritedValue = setFunc(1
    /* Inherited */
    );
    this.setInheritedValue = setInheritedValue;
    this.set = setFunc(3
    /* Local */
    );
    inheritableProperties.push(this);
  }

}
class CssProperty {
  constructor(options) {
    const propertyName = options.name;
    this.name = propertyName;
    cssPropertyNames.push(options.cssName);
    this.cssName = `css:${options.cssName}`;
    this.cssLocalName = options.cssName;
    const key = Symbol(propertyName + ':propertyKey');
    this.key = key;
    const sourceKey = Symbol(propertyName + ':valueSourceKey');
    this.sourceKey = sourceKey;
    const getDefault = Symbol(propertyName + ':getDefault');
    this.getDefault = getDefault;
    const setNative = Symbol(propertyName + ':setNative');
    this.setNative = setNative;
    const defaultValueKey = Symbol(propertyName + ':nativeDefaultValue');
    this.defaultValueKey = defaultValueKey;
    const defaultValue = options.defaultValue;
    this.defaultValue = defaultValue;
    const eventName = propertyName + 'Change';
    const affectsLayout = options.affectsLayout;
    const equalityComparer = options.equalityComparer;
    const valueChanged = options.valueChanged;
    const valueConverter = options.valueConverter;
    const property = this;

    function setLocalValue(newValue) {
      const view = this.viewRef.get();

      if (!view) {
        _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].write(`${newValue} not set to view because ".viewRef" is cleared`, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].categories.Style, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].messageType.warn);
        return;
      }

      const reset = newValue === unsetValue || newValue === '';
      let value;

      if (reset) {
        value = defaultValue;
        delete this[sourceKey];
      } else {
        this[sourceKey] = 3
        /* Local */
        ;
        value = valueConverter && typeof newValue === 'string' ? valueConverter(newValue) : newValue;
      }

      const oldValue = key in this ? this[key] : defaultValue;
      const changed = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;

      if (changed) {
        if (reset) {
          delete this[key];

          if (valueChanged) {
            valueChanged(this, oldValue, value);
          }

          if (view[setNative]) {
            if (view._suspendNativeUpdatesCount) {
              if (view._suspendedUpdates) {
                view._suspendedUpdates[propertyName] = property;
              }
            } else {
              if (defaultValueKey in this) {
                view[setNative](this[defaultValueKey]);
                delete this[defaultValueKey];
              } else {
                view[setNative](defaultValue);
              }
            }
          }
        } else {
          this[key] = value;

          if (valueChanged) {
            valueChanged(this, oldValue, value);
          }

          if (view[setNative]) {
            if (view._suspendNativeUpdatesCount) {
              if (view._suspendedUpdates) {
                view._suspendedUpdates[propertyName] = property;
              }
            } else {
              if (!(defaultValueKey in this)) {
                this[defaultValueKey] = view[getDefault] ? view[getDefault]() : defaultValue;
              }

              view[setNative](value);
            }
          }
        }

        if (this.hasListeners(eventName)) {
          this.notify({
            object: this,
            eventName,
            propertyName,
            value,
            oldValue
          });
        }

        if (affectsLayout) {
          view.requestLayout();
        }
      }
    }

    function setCssValue(newValue) {
      const view = this.viewRef.get();

      if (!view) {
        _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].write(`${newValue} not set to view because ".viewRef" is cleared`, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].categories.Style, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].messageType.warn);
        return;
      }

      const currentValueSource = this[sourceKey] || 0
      /* Default */
      ; // We have localValueSource - NOOP.

      if (currentValueSource === 3
      /* Local */
      ) {
          return;
        }

      const reset = newValue === unsetValue || newValue === '';
      let value;

      if (reset) {
        value = defaultValue;
        delete this[sourceKey];
      } else {
        value = valueConverter && typeof newValue === 'string' ? valueConverter(newValue) : newValue;
        this[sourceKey] = 2
        /* Css */
        ;
      }

      const oldValue = key in this ? this[key] : defaultValue;
      const changed = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;

      if (changed) {
        if (reset) {
          delete this[key];

          if (valueChanged) {
            valueChanged(this, oldValue, value);
          }

          if (view[setNative]) {
            if (view._suspendNativeUpdatesCount) {
              if (view._suspendedUpdates) {
                view._suspendedUpdates[propertyName] = property;
              }
            } else {
              if (defaultValueKey in this) {
                view[setNative](this[defaultValueKey]);
                delete this[defaultValueKey];
              } else {
                view[setNative](defaultValue);
              }
            }
          }
        } else {
          this[key] = value;

          if (valueChanged) {
            valueChanged(this, oldValue, value);
          }

          if (view[setNative]) {
            if (view._suspendNativeUpdatesCount) {
              if (view._suspendedUpdates) {
                view._suspendedUpdates[propertyName] = property;
              }
            } else {
              if (!(defaultValueKey in this)) {
                this[defaultValueKey] = view[getDefault] ? view[getDefault]() : defaultValue;
              }

              view[setNative](value);
            }
          }
        }

        if (this.hasListeners(eventName)) {
          this.notify({
            object: this,
            eventName,
            propertyName,
            value,
            oldValue
          });
        }

        if (affectsLayout) {
          view.requestLayout();
        }
      }
    }

    function get() {
      return key in this ? this[key] : defaultValue;
    }

    this.cssValueDescriptor = {
      enumerable: true,
      configurable: true,
      get: get,
      set: setCssValue
    };
    this.localValueDescriptor = {
      enumerable: true,
      configurable: true,
      get: get,
      set: setLocalValue
    };
    cssSymbolPropertyMap[key] = this;
  }

  register(cls) {
    if (this.registered) {
      throw new Error(`Property ${this.name} already registered.`);
    }

    this.registered = true;
    Object.defineProperty(cls.prototype, this.name, this.localValueDescriptor);
    Object.defineProperty(cls.prototype, this.cssName, this.cssValueDescriptor);

    if (this.cssLocalName !== this.cssName) {
      Object.defineProperty(cls.prototype, this.cssLocalName, this.localValueDescriptor);
    }
  }

  isSet(instance) {
    return this.key in instance;
  }

}
CssProperty.prototype.isStyleProperty = true;
class CssAnimationProperty {
  constructor(options) {
    const propertyName = options.name;
    this.name = propertyName;
    cssPropertyNames.push(options.cssName);
    CssAnimationProperty.properties[propertyName] = this;

    if (options.cssName && options.cssName !== propertyName) {
      CssAnimationProperty.properties[options.cssName] = this;
    }

    this._valueConverter = options.valueConverter;
    const cssLocalName = options.cssName || propertyName;
    this.cssLocalName = cssLocalName;
    const cssName = 'css:' + cssLocalName;
    this.cssName = cssName;
    const keyframeName = 'keyframe:' + propertyName;
    this.keyframe = keyframeName;
    const defaultName = 'default:' + propertyName;
    const defaultValueKey = Symbol(defaultName);
    this.defaultValueKey = defaultValueKey;
    this.defaultValue = options.defaultValue;
    const cssValue = Symbol(cssName);
    const styleValue = Symbol(`local:${propertyName}`);
    const keyframeValue = Symbol(keyframeName);
    const computedValue = Symbol('computed-value:' + propertyName);
    this.key = computedValue;
    const computedSource = Symbol('computed-source:' + propertyName);
    this.source = computedSource;
    this.getDefault = Symbol(propertyName + ':getDefault');
    const getDefault = this.getDefault;
    const setNative = this.setNative = Symbol(propertyName + ':setNative');
    const eventName = propertyName + 'Change';
    const property = this;

    function descriptor(symbol, propertySource, enumerable, configurable, getsComputed) {
      return {
        enumerable,
        configurable,
        get: getsComputed ? function () {
          return this[computedValue];
        } : function () {
          return this[symbol];
        },

        set(boxedValue) {
          const view = this.viewRef.get();

          if (!view) {
            _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].write(`${boxedValue} not set to view because ".viewRef" is cleared`, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].categories.Animation, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].messageType.warn);
            return;
          }

          const oldValue = this[computedValue];
          const oldSource = this[computedSource];
          const wasSet = oldSource !== 0
          /* Default */
          ;
          const reset = boxedValue === unsetValue || boxedValue === '';

          if (reset) {
            this[symbol] = unsetValue;

            if (this[computedSource] === propertySource) {
              // Fallback to lower value source.
              if (this[styleValue] !== unsetValue) {
                this[computedSource] = 3
                /* Local */
                ;
                this[computedValue] = this[styleValue];
              } else if (this[cssValue] !== unsetValue) {
                this[computedSource] = 2
                /* Css */
                ;
                this[computedValue] = this[cssValue];
              } else {
                delete this[computedSource];
                delete this[computedValue];
              }
            }
          } else {
            if (options.valueConverter && typeof boxedValue === 'string') {
              boxedValue = options.valueConverter(boxedValue);
            }

            this[symbol] = boxedValue;

            if (this[computedSource] <= propertySource) {
              this[computedSource] = propertySource;
              this[computedValue] = boxedValue;
            }
          }

          const value = this[computedValue];
          const source = this[computedSource];
          const isSet = source !== 0
          /* Default */
          ;
          const computedValueChanged = oldValue !== value && (!options.equalityComparer || !options.equalityComparer(oldValue, value));

          if (computedValueChanged && options.valueChanged) {
            options.valueChanged(this, oldValue, value);
          }

          if (view[setNative] && (computedValueChanged || isSet !== wasSet)) {
            if (view._suspendNativeUpdatesCount) {
              if (view._suspendedUpdates) {
                view._suspendedUpdates[propertyName] = property;
              }
            } else {
              if (isSet) {
                if (!wasSet && !(defaultValueKey in this)) {
                  this[defaultValueKey] = view[getDefault] ? view[getDefault]() : options.defaultValue;
                }

                view[setNative](value);
              } else if (wasSet) {
                if (defaultValueKey in this) {
                  view[setNative](this[defaultValueKey]);
                } else {
                  view[setNative](options.defaultValue);
                }
              }
            }
          }

          if (computedValueChanged && this.hasListeners(eventName)) {
            this.notify({
              object: this,
              eventName,
              propertyName,
              value,
              oldValue
            });
          }
        }

      };
    }

    const defaultPropertyDescriptor = descriptor(defaultValueKey, 0
    /* Default */
    , false, false, false);
    const cssPropertyDescriptor = descriptor(cssValue, 2
    /* Css */
    , false, false, false);
    const stylePropertyDescriptor = descriptor(styleValue, 3
    /* Local */
    , true, true, true);
    const keyframePropertyDescriptor = descriptor(keyframeValue, 4
    /* Keyframe */
    , false, false, false);
    symbolPropertyMap[computedValue] = this;
    cssSymbolPropertyMap[computedValue] = this;

    this.register = cls => {
      cls.prototype[computedValue] = options.defaultValue;
      cls.prototype[computedSource] = 0
      /* Default */
      ;
      cls.prototype[cssValue] = unsetValue;
      cls.prototype[styleValue] = unsetValue;
      cls.prototype[keyframeValue] = unsetValue;
      Object.defineProperty(cls.prototype, defaultName, defaultPropertyDescriptor);
      Object.defineProperty(cls.prototype, cssName, cssPropertyDescriptor);
      Object.defineProperty(cls.prototype, propertyName, stylePropertyDescriptor);

      if (options.cssName && options.cssName !== options.name) {
        Object.defineProperty(cls.prototype, options.cssName, stylePropertyDescriptor);
      }

      Object.defineProperty(cls.prototype, keyframeName, keyframePropertyDescriptor);
    };
  }

  _initDefaultNativeValue(target) {
    const view = target.viewRef.get();

    if (!view) {
      _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].write(`_initDefaultNativeValue not executed to view because ".viewRef" is cleared`, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].categories.Animation, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].messageType.warn);
      return;
    }

    const defaultValueKey = this.defaultValueKey;

    if (!(defaultValueKey in target)) {
      const getDefault = this.getDefault;
      target[defaultValueKey] = view[getDefault] ? view[getDefault]() : this.defaultValue;
    }
  }

  static _getByCssName(name) {
    return this.properties[name];
  }

  static _getPropertyNames() {
    return Object.keys(CssAnimationProperty.properties);
  }

  isSet(instance) {
    return instance[this.source] !== 0
    /* Default */
    ;
  }

}
CssAnimationProperty.properties = {};
CssAnimationProperty.prototype.isStyleProperty = true;
class InheritedCssProperty extends CssProperty {
  constructor(options) {
    super(options);
    const propertyName = options.name;
    const key = this.key;
    const sourceKey = this.sourceKey;
    const getDefault = this.getDefault;
    const setNative = this.setNative;
    const defaultValueKey = this.defaultValueKey;
    const eventName = propertyName + 'Change';
    const defaultValue = options.defaultValue;
    const affectsLayout = options.affectsLayout;
    const equalityComparer = options.equalityComparer;
    const valueChanged = options.valueChanged;
    const valueConverter = options.valueConverter;
    const property = this;

    const setFunc = valueSource => function (boxedValue) {
      const view = this.viewRef.get();

      if (!view) {
        _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].write(`${boxedValue} not set to view's property because ".viewRef" is cleared`, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].categories.Style, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].messageType.warn);
        return;
      }

      const reset = boxedValue === unsetValue || boxedValue === '';
      const currentValueSource = this[sourceKey] || 0
      /* Default */
      ;

      if (reset) {
        // If we want to reset cssValue and we have localValue - return;
        if (valueSource === 2
        /* Css */
        && currentValueSource === 3
        /* Local */
        ) {
            return;
          }
      } else {
        if (currentValueSource > valueSource) {
          return;
        }
      }

      const oldValue = key in this ? this[key] : defaultValue;
      let value;
      let unsetNativeValue = false;

      if (reset) {
        // If unsetValue - we want to reset this property.
        let parent = view.parent;
        let style = parent ? parent.style : null; // If we have parent and it has non-default value we use as our inherited value.

        if (style && style[sourceKey] > 0
        /* Default */
        ) {
            value = style[propertyName];
            this[sourceKey] = 1
            /* Inherited */
            ;
            this[key] = value;
          } else {
          value = defaultValue;
          delete this[sourceKey];
          delete this[key];
          unsetNativeValue = true;
        }
      } else {
        this[sourceKey] = valueSource;

        if (valueConverter && typeof boxedValue === 'string') {
          value = valueConverter(boxedValue);
        } else {
          value = boxedValue;
        }

        this[key] = value;
      }

      const changed = equalityComparer ? !equalityComparer(oldValue, value) : oldValue !== value;

      if (changed) {
        if (valueChanged) {
          valueChanged(this, oldValue, value);
        }

        if (view[setNative]) {
          if (view._suspendNativeUpdatesCount) {
            if (view._suspendedUpdates) {
              view._suspendedUpdates[propertyName] = property;
            }
          } else {
            if (unsetNativeValue) {
              if (defaultValueKey in this) {
                view[setNative](this[defaultValueKey]);
                delete this[defaultValueKey];
              } else {
                view[setNative](defaultValue);
              }
            } else {
              if (!(defaultValueKey in this)) {
                this[defaultValueKey] = view[getDefault] ? view[getDefault]() : defaultValue;
              }

              view[setNative](value);
            }
          }
        }

        if (this.hasListeners(eventName)) {
          this.notify({
            object: this,
            eventName,
            propertyName,
            value,
            oldValue
          });
        }

        if (affectsLayout) {
          view.requestLayout();
        }

        view.eachChild(child => {
          const childStyle = child.style;
          const childValueSource = childStyle[sourceKey] || 0
          /* Default */
          ;

          if (reset) {
            if (childValueSource === 1
            /* Inherited */
            ) {
                setDefaultFunc.call(childStyle, unsetValue);
              }
          } else {
            if (childValueSource <= 1
            /* Inherited */
            ) {
                setInheritedFunc.call(childStyle, value);
              }
          }

          return true;
        });
      }
    };

    const setDefaultFunc = setFunc(0
    /* Default */
    );
    const setInheritedFunc = setFunc(1
    /* Inherited */
    );
    this.setInheritedValue = setInheritedFunc;
    this.cssValueDescriptor.set = setFunc(2
    /* Css */
    );
    this.localValueDescriptor.set = setFunc(3
    /* Local */
    );
    inheritableCssProperties.push(this);
  }

}
class ShorthandProperty {
  constructor(options) {
    this.name = options.name;
    const key = Symbol(this.name + ':propertyKey');
    this.key = key;
    this.cssName = `css:${options.cssName}`;
    this.cssLocalName = `${options.cssName}`;
    const converter = options.converter;

    function setLocalValue(value) {
      const view = this.viewRef.get();

      if (!view) {
        _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].write(`setLocalValue not executed to view because ".viewRef" is cleared`, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].categories.Animation, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].messageType.warn);
        return;
      }

      view._batchUpdate(() => {
        for (let [p, v] of converter(value)) {
          this[p.name] = v;
        }
      });
    }

    function setCssValue(value) {
      const view = this.viewRef.get();

      if (!view) {
        _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].write(`setCssValue not executed to view because ".viewRef" is cleared`, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].categories.Animation, _trace__WEBPACK_IMPORTED_MODULE_2__["Trace"].messageType.warn);
        return;
      }

      view._batchUpdate(() => {
        for (let [p, v] of converter(value)) {
          this[p.cssName] = v;
        }
      });
    }

    this.cssValueDescriptor = {
      enumerable: true,
      configurable: true,
      get: options.getter,
      set: setCssValue
    };
    this.localValueDescriptor = {
      enumerable: true,
      configurable: true,
      get: options.getter,
      set: setLocalValue
    };
    this.propertyBagDescriptor = {
      enumerable: false,
      configurable: true,

      set(value) {
        converter(value).forEach(([property, value]) => {
          this[property.cssLocalName] = value;
        });
      }

    };
    cssSymbolPropertyMap[key] = this;
  }

  register(cls) {
    if (this.registered) {
      throw new Error(`Property ${this.name} already registered.`);
    }

    this.registered = true;
    Object.defineProperty(cls.prototype, this.name, this.localValueDescriptor);
    Object.defineProperty(cls.prototype, this.cssName, this.cssValueDescriptor);

    if (this.cssLocalName !== this.cssName) {
      Object.defineProperty(cls.prototype, this.cssLocalName, this.localValueDescriptor);
    }

    Object.defineProperty(cls.prototype.PropertyBag, this.cssLocalName, this.propertyBagDescriptor);
  }

}

function inheritablePropertyValuesOn(view) {
  const array = new Array();

  for (let prop of inheritableProperties) {
    const sourceKey = prop.sourceKey;
    const valueSource = view[sourceKey] || 0
    /* Default */
    ;

    if (valueSource !== 0
    /* Default */
    ) {
        // use prop.name as it will return value or default value.
        // prop.key will return undefined if property is set the same value as default one.
        array.push({
          property: prop,
          value: view[prop.name]
        });
      }
  }

  return array;
}

function inheritableCssPropertyValuesOn(style) {
  const array = new Array();

  for (let prop of inheritableCssProperties) {
    const sourceKey = prop.sourceKey;
    const valueSource = style[sourceKey] || 0
    /* Default */
    ;

    if (valueSource !== 0
    /* Default */
    ) {
        // use prop.name as it will return value or default value.
        // prop.key will return undefined if property is set the same value as default one.
        array.push({
          property: prop,
          value: style[prop.name]
        });
      }
  }

  return array;
}

const initNativeView = Object(_profiling__WEBPACK_IMPORTED_MODULE_3__["profile"])('"properties".initNativeView', function initNativeView(view) {
  if (view._suspendedUpdates) {
    applyPendingNativeSetters(view);
  } else {
    applyAllNativeSetters(view);
  } // Would it be faster to delete all members of the old object?


  view._suspendedUpdates = {};
});
function applyPendingNativeSetters(view) {
  // TODO: Check what happens if a view was suspended and its value was reset, or set back to default!
  const suspendedUpdates = view._suspendedUpdates;

  for (let propertyName in suspendedUpdates) {
    const property = suspendedUpdates[propertyName];
    const setNative = property.setNative;

    if (view[setNative]) {
      const {
        getDefault,
        isStyleProperty,
        defaultValueKey,
        defaultValue
      } = property;
      let value;

      if (isStyleProperty) {
        const style = view.style;

        if (property.isSet(view.style)) {
          if (!(defaultValueKey in style)) {
            style[defaultValueKey] = view[getDefault] ? view[getDefault]() : defaultValue;
          }

          value = view.style[propertyName];
        } else {
          value = style[defaultValueKey];
        }
      } else {
        if (property.isSet(view)) {
          if (!(defaultValueKey in view)) {
            view[defaultValueKey] = view[getDefault] ? view[getDefault]() : defaultValue;
          }

          value = view[propertyName];
        } else {
          value = view[defaultValueKey];
        }
      } // TODO: Only if value is different from the value before the scope was created.


      view[setNative](value);
    }
  }
}
function applyAllNativeSetters(view) {
  let symbols = Object.getOwnPropertySymbols(view);

  for (let symbol of symbols) {
    const property = symbolPropertyMap[symbol];

    if (!property) {
      continue;
    }

    const setNative = property.setNative;
    const getDefault = property.getDefault;

    if (setNative in view) {
      const defaultValueKey = property.defaultValueKey;

      if (!(defaultValueKey in view)) {
        view[defaultValueKey] = view[getDefault] ? view[getDefault]() : property.defaultValue;
      }

      const value = view[symbol];
      view[setNative](value);
    }
  }

  const style = view.style;
  symbols = Object.getOwnPropertySymbols(style);

  for (let symbol of symbols) {
    const property = cssSymbolPropertyMap[symbol];

    if (!property) {
      continue;
    }

    if (view[property.setNative]) {
      const defaultValueKey = property.defaultValueKey;

      if (!(defaultValueKey in style)) {
        style[defaultValueKey] = view[property.getDefault] ? view[property.getDefault]() : property.defaultValue;
      }

      const value = style[symbol];
      view[property.setNative](value);
    }
  }
}
function resetNativeView(view) {
  let symbols = Object.getOwnPropertySymbols(view);

  for (let symbol of symbols) {
    const property = symbolPropertyMap[symbol];

    if (!property) {
      continue;
    }

    if (view[property.setNative]) {
      if (property.defaultValueKey in view) {
        view[property.setNative](view[property.defaultValueKey]);
        delete view[property.defaultValueKey];
      } else {
        view[property.setNative](property.defaultValue);
      }
    }
  }

  const style = view.style;
  symbols = Object.getOwnPropertySymbols(style);

  for (let symbol of symbols) {
    const property = cssSymbolPropertyMap[symbol];

    if (!property) {
      continue;
    }

    if (view[property.setNative]) {
      if (property.defaultValueKey in style) {
        view[property.setNative](style[property.defaultValueKey]);
        delete style[property.defaultValueKey];
      } else {
        view[property.setNative](property.defaultValue);
      }
    }
  }
}
function clearInheritedProperties(view) {
  for (let prop of inheritableProperties) {
    const sourceKey = prop.sourceKey;

    if (view[sourceKey] === 1
    /* Inherited */
    ) {
        prop.set.call(view, unsetValue);
      }
  }

  const style = view.style;

  for (let prop of inheritableCssProperties) {
    const sourceKey = prop.sourceKey;

    if (style[sourceKey] === 1
    /* Inherited */
    ) {
        prop.setInheritedValue.call(style, unsetValue);
      }
  }
}
function resetCSSProperties(style) {
  let symbols = Object.getOwnPropertySymbols(style);

  for (let symbol of symbols) {
    let cssProperty;

    if (cssProperty = cssSymbolPropertyMap[symbol]) {
      style[cssProperty.cssName] = unsetValue;

      if (cssProperty instanceof CssAnimationProperty) {
        style[cssProperty.keyframe] = unsetValue;
      }
    }
  }
}
function propagateInheritableProperties(view, child) {
  const inheritablePropertyValues = inheritablePropertyValuesOn(view);

  for (let pair of inheritablePropertyValues) {
    const prop = pair.property;
    const sourceKey = prop.sourceKey;
    const currentValueSource = child[sourceKey] || 0
    /* Default */
    ;

    if (currentValueSource <= 1
    /* Inherited */
    ) {
        prop.setInheritedValue.call(child, pair.value);
      }
  }
}
function propagateInheritableCssProperties(parentStyle, childStyle) {
  const inheritableCssPropertyValues = inheritableCssPropertyValuesOn(parentStyle);

  for (let pair of inheritableCssPropertyValues) {
    const prop = pair.property;
    const sourceKey = prop.sourceKey;
    const currentValueSource = childStyle[sourceKey] || 0
    /* Default */
    ;

    if (currentValueSource <= 1
    /* Inherited */
    ) {
        prop.setInheritedValue.call(childStyle, pair.value, 1
        /* Inherited */
        );
      }
  }
}
function makeValidator(...values) {
  const set = new Set(values);
  return value => set.has(value);
}
function makeParser(isValid) {
  return value => {
    const lower = value && value.toLowerCase();

    if (isValid(lower)) {
      return lower;
    } else {
      throw new Error('Invalid value: ' + value);
    }
  };
}
function getSetProperties(view) {
  const result = [];
  Object.getOwnPropertyNames(view).forEach(prop => {
    result.push([prop, view[prop]]);
  });
  let symbols = Object.getOwnPropertySymbols(view);

  for (let symbol of symbols) {
    const property = symbolPropertyMap[symbol];

    if (!property) {
      continue;
    }

    const value = view[property.key];
    result.push([property.name, value]);
  }

  return result;
}
function getComputedCssValues(view) {
  const result = [];
  const style = view.style;

  for (let prop of cssPropertyNames) {
    result.push([prop, style[prop]]);
  } // Add these to enable box model in chrome-devtools styles tab


  result.push(['top', 'auto']);
  result.push(['left', 'auto']);
  result.push(['bottom', 'auto']);
  result.push(['right', 'auto']);
  return result;
}

/***/ }),

/***/ "../node_modules/@nativescript/core/ui/styling/font-common.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Font", function() { return Font; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FontStyle", function() { return FontStyle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FontWeight", function() { return FontWeight; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseFontFamily", function() { return parseFontFamily; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "genericFontFamilies", function() { return genericFontFamilies; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseFont", function() { return parseFont; });
/* harmony import */ var _core_properties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/ui/core/properties/index.js");
/* harmony import */ var _font_interfaces__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("../node_modules/@nativescript/core/ui/styling/font-interfaces.js");
/* empty/unused harmony star reexport */

class Font {
  constructor(fontFamily, fontSize, fontStyle, fontWeight) {
    this.fontFamily = fontFamily;
    this.fontSize = fontSize;
    this.fontStyle = fontStyle;
    this.fontWeight = fontWeight;
  }

  get isItalic() {
    return this.fontStyle === FontStyle.ITALIC;
  }

  get isBold() {
    return this.fontWeight === FontWeight.SEMI_BOLD || this.fontWeight === FontWeight.BOLD || this.fontWeight === '700' || this.fontWeight === FontWeight.EXTRA_BOLD || this.fontWeight === FontWeight.BLACK;
  }

  static equals(value1, value2) {
    // both values are falsy
    if (!value1 && !value2) {
      return true;
    } // only one is falsy


    if (!value1 || !value2) {
      return false;
    }

    return value1.fontFamily === value2.fontFamily && value1.fontSize === value2.fontSize && value1.fontStyle === value2.fontStyle && value1.fontWeight === value2.fontWeight;
  }

}
Font.default = undefined;
var FontStyle;

(function (FontStyle) {
  FontStyle.NORMAL = 'normal';
  FontStyle.ITALIC = 'italic';
  FontStyle.isValid = Object(_core_properties__WEBPACK_IMPORTED_MODULE_0__["makeValidator"])(FontStyle.NORMAL, FontStyle.ITALIC);
  FontStyle.parse = Object(_core_properties__WEBPACK_IMPORTED_MODULE_0__["makeParser"])(FontStyle.isValid);
})(FontStyle || (FontStyle = {}));

var FontWeight;

(function (FontWeight) {
  FontWeight.THIN = '100';
  FontWeight.EXTRA_LIGHT = '200';
  FontWeight.LIGHT = '300';
  FontWeight.NORMAL = 'normal';
  FontWeight.MEDIUM = '500';
  FontWeight.SEMI_BOLD = '600';
  FontWeight.BOLD = 'bold';
  FontWeight.EXTRA_BOLD = '800';
  FontWeight.BLACK = '900';
  FontWeight.isValid = Object(_core_properties__WEBPACK_IMPORTED_MODULE_0__["makeValidator"])(FontWeight.THIN, FontWeight.EXTRA_LIGHT, FontWeight.LIGHT, FontWeight.NORMAL, '400', FontWeight.MEDIUM, FontWeight.SEMI_BOLD, FontWeight.BOLD, '700', FontWeight.EXTRA_BOLD, FontWeight.BLACK);
  FontWeight.parse = Object(_core_properties__WEBPACK_IMPORTED_MODULE_0__["makeParser"])(FontWeight.isValid);
})(FontWeight || (FontWeight = {}));

function parseFontFamily(value) {
  const result = new Array();

  if (!value) {
    return result;
  }

  const split = value.split(',');

  for (let i = 0; i < split.length; i++) {
    let str = split[i].trim().replace(/['"]+/g, '');

    if (str) {
      result.push(str);
    }
  }

  return result;
}
var genericFontFamilies;

(function (genericFontFamilies) {
  genericFontFamilies.serif = 'serif';
  genericFontFamilies.sansSerif = 'sans-serif';
  genericFontFamilies.monospace = 'monospace';
  genericFontFamilies.system = 'system';
})(genericFontFamilies || (genericFontFamilies = {}));

const styles = new Set();
[FontStyle.NORMAL, FontStyle.ITALIC].forEach((val, i, a) => styles.add(val)); // http://www.w3schools.com/cssref/pr_font_weight.asp
//- normal(same as 400)
//- bold(same as 700)
//- 100(Thin) (API16 -thin)
//- 200(Extra Light / Ultra Light) (API16 -light)
//- 300(Light) (API16 -light)
//- 400(Normal)
//- 500(Medium) (API21 -medium)
//- 600(Semi Bold / Demi Bold) (API21 -medium)
//- 700(Bold) (API16 -bold)
//- 800(Extra Bold / Ultra Bold) (API16 -bold)
//- 900(Black / Heavy) (API21 -black)

const weights = new Set();
[FontWeight.THIN, FontWeight.EXTRA_LIGHT, FontWeight.LIGHT, FontWeight.NORMAL, '400', FontWeight.MEDIUM, FontWeight.SEMI_BOLD, FontWeight.BOLD, '700', FontWeight.EXTRA_BOLD, FontWeight.BLACK].forEach((val, i, a) => weights.add(val));
function parseFont(fontValue) {
  let result = {
    fontStyle: 'normal',
    fontVariant: 'normal',
    fontWeight: 'normal'
  };
  const parts = fontValue.split(/\s+/);
  let part;

  while (part = parts.shift()) {
    if (part === 'normal') {// nothing to do here
    } else if (part === 'small-caps') {
      // The only supported font variant in shorthand font
      result.fontVariant = part;
    } else if (styles.has(part)) {
      result.fontStyle = part;
    } else if (weights.has(part)) {
      result.fontWeight = part;
    } else if (!result.fontSize) {
      let sizes = part.split('/');
      result.fontSize = sizes[0];
      result.lineHeight = sizes.length > 1 ? sizes[1] : undefined;
    } else {
      result.fontFamily = part;

      if (parts.length) {
        result.fontFamily += ' ' + parts.join(' ');
      }

      break;
    }
  }

  return result;
}

/***/ }),

/***/ "../node_modules/@nativescript/core/ui/styling/font-interfaces.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);


/***/ }),

/***/ "../node_modules/@nativescript/core/ui/styling/font.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Font", function() { return Font; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ios", function() { return ios; });
/* harmony import */ var _font_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/ui/styling/font-common.js");
/* harmony import */ var _trace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("../node_modules/@nativescript/core/trace/index.js");
/* harmony import */ var _platform__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("../node_modules/@nativescript/core/platform/index.js");
/* harmony import */ var _file_system__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("../node_modules/@nativescript/core/file-system/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FontStyle", function() { return _font_common__WEBPACK_IMPORTED_MODULE_0__["FontStyle"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FontWeight", function() { return _font_common__WEBPACK_IMPORTED_MODULE_0__["FontWeight"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "parseFontFamily", function() { return _font_common__WEBPACK_IMPORTED_MODULE_0__["parseFontFamily"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "genericFontFamilies", function() { return _font_common__WEBPACK_IMPORTED_MODULE_0__["genericFontFamilies"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "parseFont", function() { return _font_common__WEBPACK_IMPORTED_MODULE_0__["parseFont"]; });






const EMULATE_OBLIQUE = true;
const OBLIQUE_TRANSFORM = CGAffineTransformMake(1, 0, 0.2, 1, 0, 0);
const DEFAULT_SERIF = 'Times New Roman';
const DEFAULT_MONOSPACE = 'Courier New';
const SUPPORT_FONT_WEIGHTS = parseFloat(_platform__WEBPACK_IMPORTED_MODULE_2__["Device"].osVersion) >= 10.0;
class Font extends _font_common__WEBPACK_IMPORTED_MODULE_0__["Font"] {
  constructor(family, size, style, weight) {
    super(family, size, style, weight);
  }

  withFontFamily(family) {
    return new Font(family, this.fontSize, this.fontStyle, this.fontWeight);
  }

  withFontStyle(style) {
    return new Font(this.fontFamily, this.fontSize, style, this.fontWeight);
  }

  withFontWeight(weight) {
    return new Font(this.fontFamily, this.fontSize, this.fontStyle, weight);
  }

  withFontSize(size) {
    return new Font(this.fontFamily, size, this.fontStyle, this.fontWeight);
  }

  getUIFont(defaultFont) {
    if (!this._uiFont) {
      this._uiFont = createUIFont(this, defaultFont);
    }

    return this._uiFont;
  }

  getAndroidTypeface() {
    return undefined;
  }

}
Font.default = new Font(undefined, undefined, _font_common__WEBPACK_IMPORTED_MODULE_0__["FontStyle"].NORMAL, _font_common__WEBPACK_IMPORTED_MODULE_0__["FontWeight"].NORMAL);

function getFontFamilyRespectingGenericFonts(fontFamily) {
  if (!fontFamily) {
    return fontFamily;
  }

  switch (fontFamily.toLowerCase()) {
    case _font_common__WEBPACK_IMPORTED_MODULE_0__["genericFontFamilies"].serif:
      return DEFAULT_SERIF;

    case _font_common__WEBPACK_IMPORTED_MODULE_0__["genericFontFamilies"].monospace:
      return DEFAULT_MONOSPACE;

    default:
      return fontFamily;
  }
}

function shouldUseSystemFont(fontFamily) {
  return !fontFamily || fontFamily === _font_common__WEBPACK_IMPORTED_MODULE_0__["genericFontFamilies"].sansSerif || fontFamily === _font_common__WEBPACK_IMPORTED_MODULE_0__["genericFontFamilies"].system;
}

function getNativeFontWeight(fontWeight) {
  switch (fontWeight) {
    case _font_common__WEBPACK_IMPORTED_MODULE_0__["FontWeight"].THIN:
      return UIFontWeightUltraLight;

    case _font_common__WEBPACK_IMPORTED_MODULE_0__["FontWeight"].EXTRA_LIGHT:
      return UIFontWeightThin;

    case _font_common__WEBPACK_IMPORTED_MODULE_0__["FontWeight"].LIGHT:
      return UIFontWeightLight;

    case _font_common__WEBPACK_IMPORTED_MODULE_0__["FontWeight"].NORMAL:
    case '400':
    case undefined:
    case null:
      return UIFontWeightRegular;

    case _font_common__WEBPACK_IMPORTED_MODULE_0__["FontWeight"].MEDIUM:
      return UIFontWeightMedium;

    case _font_common__WEBPACK_IMPORTED_MODULE_0__["FontWeight"].SEMI_BOLD:
      return UIFontWeightSemibold;

    case _font_common__WEBPACK_IMPORTED_MODULE_0__["FontWeight"].BOLD:
    case '700':
      return UIFontWeightBold;

    case _font_common__WEBPACK_IMPORTED_MODULE_0__["FontWeight"].EXTRA_BOLD:
      return UIFontWeightHeavy;

    case _font_common__WEBPACK_IMPORTED_MODULE_0__["FontWeight"].BLACK:
      return UIFontWeightBlack;

    default:
      throw new Error(`Invalid font weight: "${fontWeight}"`);
  }
}

function getSystemFont(size, nativeWeight, italic, symbolicTraits) {
  let result = UIFont.systemFontOfSizeWeight(size, nativeWeight);

  if (italic) {
    let descriptor = result.fontDescriptor.fontDescriptorWithSymbolicTraits(symbolicTraits);
    result = UIFont.fontWithDescriptorSize(descriptor, size);
  }

  return result;
}

function createUIFont(font, defaultFont) {
  let result;
  const size = font.fontSize || defaultFont.pointSize;
  const nativeWeight = getNativeFontWeight(font.fontWeight);
  const fontFamilies = Object(_font_common__WEBPACK_IMPORTED_MODULE_0__["parseFontFamily"])(font.fontFamily);
  let symbolicTraits = 0;

  if (font.isBold) {
    symbolicTraits |= 2
    /* TraitBold */
    ;
  }

  if (font.isItalic) {
    symbolicTraits |= 1
    /* TraitItalic */
    ;
  }

  let fontDescriptorTraits = {
    [UIFontSymbolicTrait]: symbolicTraits
  }; // IOS versions below 10 will not return the correct font when UIFontWeightTrait is set
  // In this case - rely on UIFontSymbolicTrait only

  if (SUPPORT_FONT_WEIGHTS) {
    fontDescriptorTraits[UIFontWeightTrait] = nativeWeight;
  }

  for (let i = 0; i < fontFamilies.length; i++) {
    const fontFamily = getFontFamilyRespectingGenericFonts(fontFamilies[i]);

    if (shouldUseSystemFont(fontFamily)) {
      result = getSystemFont(size, nativeWeight, font.isItalic, symbolicTraits);
      break;
    } else {
      const fontAttributes = {
        [UIFontDescriptorFamilyAttribute]: fontFamily,
        [UIFontDescriptorTraitsAttribute]: fontDescriptorTraits
      };
      let descriptor = UIFontDescriptor.fontDescriptorWithFontAttributes(fontAttributes);
      result = UIFont.fontWithDescriptorSize(descriptor, size);
      let actualItalic = result.fontDescriptor.symbolicTraits & 1
      /* TraitItalic */
      ;

      if (font.isItalic && !actualItalic && EMULATE_OBLIQUE) {
        // The font we got is not actually italic so emulate that with a matrix
        descriptor = descriptor.fontDescriptorWithMatrix(OBLIQUE_TRANSFORM);
        result = UIFont.fontWithDescriptorSize(descriptor, size);
      } // Check if the resolved font has the correct font-family
      // If not - fallback to the next font-family


      if (result.familyName === fontFamily) {
        break;
      } else {
        result = null;
      }
    }
  } // Couldn't resolve font - fallback to the system font


  if (!result) {
    result = getSystemFont(size, nativeWeight, font.isItalic, symbolicTraits);
  }

  return result;
}

var ios;

(function (ios) {
  function registerFont(fontFile) {
    let filePath = _file_system__WEBPACK_IMPORTED_MODULE_3__["path"].join(_file_system__WEBPACK_IMPORTED_MODULE_3__["knownFolders"].currentApp().path, 'fonts', fontFile);

    if (!_file_system__WEBPACK_IMPORTED_MODULE_3__["File"].exists(filePath)) {
      filePath = _file_system__WEBPACK_IMPORTED_MODULE_3__["path"].join(_file_system__WEBPACK_IMPORTED_MODULE_3__["knownFolders"].currentApp().path, fontFile);
    }

    const fontData = NSFileManager.defaultManager.contentsAtPath(filePath);

    if (!fontData) {
      throw new Error('Could not load font from: ' + fontFile);
    }

    const provider = CGDataProviderCreateWithCFData(fontData);
    const font = CGFontCreateWithDataProvider(provider);

    if (!font) {
      throw new Error('Could not load font from: ' + fontFile);
    }

    const error = new interop.Reference();

    if (!CTFontManagerRegisterGraphicsFont(font, error)) {
      if (_trace__WEBPACK_IMPORTED_MODULE_1__["Trace"].isEnabled()) {
        _trace__WEBPACK_IMPORTED_MODULE_1__["Trace"].write('Error occur while registering font: ' + CFErrorCopyDescription(error.value), _trace__WEBPACK_IMPORTED_MODULE_1__["Trace"].categories.Error, _trace__WEBPACK_IMPORTED_MODULE_1__["Trace"].messageType.error);
      }
    }
  }

  ios.registerFont = registerFont;
})(ios || (ios = {}));

function registerFontsInFolder(fontsFolderPath) {
  const fontsFolder = _file_system__WEBPACK_IMPORTED_MODULE_3__["Folder"].fromPath(fontsFolderPath);
  fontsFolder.eachEntity(fileEntity => {
    if (_file_system__WEBPACK_IMPORTED_MODULE_3__["Folder"].exists(_file_system__WEBPACK_IMPORTED_MODULE_3__["path"].join(fontsFolderPath, fileEntity.name))) {
      return true;
    }

    if (fileEntity instanceof _file_system__WEBPACK_IMPORTED_MODULE_3__["File"] && (fileEntity.extension === '.ttf' || fileEntity.extension === '.otf')) {
      ios.registerFont(fileEntity.name);
    }

    return true;
  });
}

function registerCustomFonts() {
  const appDir = _file_system__WEBPACK_IMPORTED_MODULE_3__["knownFolders"].currentApp().path;
  const fontsDir = _file_system__WEBPACK_IMPORTED_MODULE_3__["path"].join(appDir, 'fonts');

  if (_file_system__WEBPACK_IMPORTED_MODULE_3__["Folder"].exists(fontsDir)) {
    registerFontsInFolder(fontsDir);
  }
}

registerCustomFonts();

/***/ }),

/***/ "../node_modules/@nativescript/core/utils/debug.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "debug", function() { return debug; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Source", function() { return Source; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ScopeError", function() { return ScopeError; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SourceError", function() { return SourceError; });
/* harmony import */ var _file_system__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/file-system/index.js");

let debug = true;
let applicationRootPath;

function ensureAppRootPath() {
  if (!applicationRootPath) {
    applicationRootPath = _file_system__WEBPACK_IMPORTED_MODULE_0__["knownFolders"].currentApp().path;
    applicationRootPath = applicationRootPath.substr(0, applicationRootPath.length - 'app/'.length);
  }
}

class Source {
  constructor(uri, line, column) {
    ensureAppRootPath();

    if (uri.length > applicationRootPath.length && uri.substr(0, applicationRootPath.length) === applicationRootPath) {
      this._uri = 'file://' + uri.substr(applicationRootPath.length);
    } else {
      this._uri = uri;
    }

    this._line = line;
    this._column = column;
  }

  get uri() {
    return this._uri;
  }

  get line() {
    return this._line;
  }

  get column() {
    return this._column;
  }

  toString() {
    return this._uri + ':' + this._line + ':' + this._column;
  }

  static get(object) {
    return object[Source._source];
  }

  static set(object, src) {
    object[Source._source] = src;
  }

}
Source._source = Symbol('source');
class ScopeError extends Error {
  constructor(inner, message) {
    let formattedMessage;

    if (message && inner.message) {
      formattedMessage = message + '\n > ' + inner.message.replace('\n', '\n  ');
    } else {
      formattedMessage = message || inner.message || undefined;
    }

    super(formattedMessage);
    this.stack =  false ? undefined : inner.stack;
    this.message = formattedMessage;
  }

}
class SourceError extends ScopeError {
  constructor(child, source, message) {
    super(child, message ? message + ' @' + source + '' : source + '');
  }

}

/***/ }),

/***/ "../node_modules/@nativescript/core/utils/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openFile", function() { return openFile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GC", function() { return GC; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "releaseNativeObject", function() { return releaseNativeObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "openUrl", function() { return openUrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isRealDevice", function() { return isRealDevice; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ad", function() { return ad; });
/* harmony import */ var _native_helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/utils/native-helper.js");
/* harmony import */ var _trace__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("../node_modules/@nativescript/core/trace/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "iOSNativeHelper", function() { return _native_helper__WEBPACK_IMPORTED_MODULE_0__["iOSNativeHelper"]; });

/* harmony import */ var _utils_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("../node_modules/@nativescript/core/utils/utils-common.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "layout", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["layout"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "dispatchToMainThread", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["dispatchToMainThread"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isMainThread", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["isMainThread"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RESOURCE_PREFIX", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["RESOURCE_PREFIX"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FILE_PREFIX", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["FILE_PREFIX"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "escapeRegexSymbols", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["escapeRegexSymbols"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "convertString", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["convertString"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getModuleName", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["getModuleName"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isFileOrResourcePath", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["isFileOrResourcePath"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isFontIconURI", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["isFontIconURI"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isDataURI", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["isDataURI"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mergeSort", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["mergeSort"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "merge", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["merge"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "hasDuplicates", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["hasDuplicates"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "eliminateDuplicates", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["eliminateDuplicates"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "executeOnMainThread", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["executeOnMainThread"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mainThreadify", function() { return _utils_common__WEBPACK_IMPORTED_MODULE_2__["mainThreadify"]; });

/* harmony import */ var _debug__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("../node_modules/@nativescript/core/utils/debug.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Source", function() { return _debug__WEBPACK_IMPORTED_MODULE_3__["Source"]; });






function openFile(filePath) {
  try {
    const appPath = _native_helper__WEBPACK_IMPORTED_MODULE_0__["iOSNativeHelper"].getCurrentAppPath();
    let path = _native_helper__WEBPACK_IMPORTED_MODULE_0__["iOSNativeHelper"].isRealDevice() ? filePath.replace('~', appPath) : filePath;
    const controller = UIDocumentInteractionController.interactionControllerWithURL(NSURL.fileURLWithPath(path));
    controller.delegate = _native_helper__WEBPACK_IMPORTED_MODULE_0__["iOSNativeHelper"].createUIDocumentInteractionControllerDelegate();
    return controller.presentPreviewAnimated(true);
  } catch (e) {
    _trace__WEBPACK_IMPORTED_MODULE_1__["Trace"].write('Error in openFile', _trace__WEBPACK_IMPORTED_MODULE_1__["Trace"].categories.Error, _trace__WEBPACK_IMPORTED_MODULE_1__["Trace"].messageType.error);
  }

  return false;
}
function GC() {
  __collect();
}
function releaseNativeObject(object) {
  __releaseNativeCounterpart(object);
}
function openUrl(location) {
  try {
    const url = NSURL.URLWithString(location.trim());

    if (UIApplication.sharedApplication.canOpenURL(url)) {
      return UIApplication.sharedApplication.openURL(url);
    }
  } catch (e) {
    // We Don't do anything with an error.  We just output it
    _trace__WEBPACK_IMPORTED_MODULE_1__["Trace"].write('Error in OpenURL', _trace__WEBPACK_IMPORTED_MODULE_1__["Trace"].categories.Error, _trace__WEBPACK_IMPORTED_MODULE_1__["Trace"].messageType.error);
  }

  return false;
}
function isRealDevice() {
  return _native_helper__WEBPACK_IMPORTED_MODULE_0__["iOSNativeHelper"].isRealDevice();
}
const ad = 0;

/***/ }),

/***/ "../node_modules/@nativescript/core/utils/layout-helper/index.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeMeasureSpec", function() { return makeMeasureSpec; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getDisplayDensity", function() { return getDisplayDensity; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toDevicePixels", function() { return toDevicePixels; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toDeviceIndependentPixels", function() { return toDeviceIndependentPixels; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "measureNativeView", function() { return measureNativeView; });
/* harmony import */ var _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/utils/layout-helper/layout-helper-common.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MODE_SHIFT", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["MODE_SHIFT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MODE_MASK", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["MODE_MASK"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UNSPECIFIED", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["UNSPECIFIED"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EXACTLY", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["EXACTLY"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "AT_MOST", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["AT_MOST"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MEASURED_HEIGHT_STATE_SHIFT", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["MEASURED_HEIGHT_STATE_SHIFT"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MEASURED_STATE_TOO_SMALL", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["MEASURED_STATE_TOO_SMALL"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MEASURED_STATE_MASK", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["MEASURED_STATE_MASK"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MEASURED_SIZE_MASK", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["MEASURED_SIZE_MASK"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getMode", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["getMode"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getMeasureSpecMode", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["getMeasureSpecMode"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getMeasureSpecSize", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["getMeasureSpecSize"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "measureSpecToString", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["measureSpecToString"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "round", function() { return _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["round"]; });



function makeMeasureSpec(size, mode) {
  return Math.round(Math.max(0, size)) & ~_layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["MODE_MASK"] | mode & _layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["MODE_MASK"];
}
function getDisplayDensity() {
  return UIScreen.mainScreen.scale;
}
function toDevicePixels(value) {
  return value * UIScreen.mainScreen.scale;
}
function toDeviceIndependentPixels(value) {
  return value / UIScreen.mainScreen.scale;
}
function measureNativeView(nativeView
/* UIView */
, width, widthMode, height, heightMode) {
  const view = nativeView;
  const nativeSize = view.sizeThatFits({
    width: widthMode === 0
    /* layout.UNSPECIFIED */
    ? Number.POSITIVE_INFINITY : toDeviceIndependentPixels(width),
    height: heightMode === 0
    /* layout.UNSPECIFIED */
    ? Number.POSITIVE_INFINITY : toDeviceIndependentPixels(height)
  });
  nativeSize.width = Object(_layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["round"])(toDevicePixels(nativeSize.width));
  nativeSize.height = Object(_layout_helper_common__WEBPACK_IMPORTED_MODULE_0__["round"])(toDevicePixels(nativeSize.height));
  return nativeSize;
}

/***/ }),

/***/ "../node_modules/@nativescript/core/utils/layout-helper/layout-helper-common.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MODE_SHIFT", function() { return MODE_SHIFT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MODE_MASK", function() { return MODE_MASK; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UNSPECIFIED", function() { return UNSPECIFIED; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EXACTLY", function() { return EXACTLY; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AT_MOST", function() { return AT_MOST; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MEASURED_HEIGHT_STATE_SHIFT", function() { return MEASURED_HEIGHT_STATE_SHIFT; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MEASURED_STATE_TOO_SMALL", function() { return MEASURED_STATE_TOO_SMALL; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MEASURED_STATE_MASK", function() { return MEASURED_STATE_MASK; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MEASURED_SIZE_MASK", function() { return MEASURED_SIZE_MASK; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMode", function() { return getMode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMeasureSpecMode", function() { return getMeasureSpecMode; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMeasureSpecSize", function() { return getMeasureSpecSize; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "measureSpecToString", function() { return measureSpecToString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "round", function() { return round; });
// cache the MeasureSpec constants here, to prevent extensive marshaling calls to and from Java
// TODO: While this boosts the performance it is error-prone in case Google changes these constants
const MODE_SHIFT = 30;
const MODE_MASK = 0x3 << MODE_SHIFT;
const UNSPECIFIED = 0 << MODE_SHIFT;
const EXACTLY = 1 << MODE_SHIFT;
const AT_MOST = 2 << MODE_SHIFT;
const MEASURED_HEIGHT_STATE_SHIFT = 0x00000010;
/* 16 */

const MEASURED_STATE_TOO_SMALL = 0x01000000;
const MEASURED_STATE_MASK = 0xff000000;
const MEASURED_SIZE_MASK = 0x00ffffff;
function getMode(mode) {
  switch (mode) {
    case EXACTLY:
      return 'Exact';

    case AT_MOST:
      return 'AtMost';

    default:
      return 'Unspecified';
  }
}
function getMeasureSpecMode(spec) {
  return spec & MODE_MASK;
}
function getMeasureSpecSize(spec) {
  return spec & ~MODE_MASK;
}
function measureSpecToString(measureSpec) {
  const mode = getMeasureSpecMode(measureSpec);
  const size = getMeasureSpecSize(measureSpec);
  let text = 'MeasureSpec: ';

  if (mode === UNSPECIFIED) {
    text += 'UNSPECIFIED ';
  } else if (mode === EXACTLY) {
    text += 'EXACTLY ';
  } else if (mode === AT_MOST) {
    text += 'AT_MOST ';
  }

  text += size;
  return text;
}
function round(value) {
  const res = Math.floor(value + 0.5);

  if (res !== 0) {
    return res;
  } else if (value === 0) {
    return 0;
  } else if (value > 0) {
    return 1;
  }

  return -1;
}

/***/ }),

/***/ "../node_modules/@nativescript/core/utils/mainthread-helper.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "dispatchToMainThread", function() { return dispatchToMainThread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isMainThread", function() { return isMainThread; });
function dispatchToMainThread(func) {
  NSOperationQueue.mainQueue.addOperationWithBlock(func);
}
function isMainThread() {
  return NSThread.isMainThread;
}

/***/ }),

/***/ "../node_modules/@nativescript/core/utils/native-helper.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "iOSNativeHelper", function() { return iOSNativeHelper; });
/* harmony import */ var _trace__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/trace/index.js");

const radToDeg = Math.PI / 180;

function isOrientationLandscape(orientation) {
  return orientation === 3
  /* LandscapeLeft */

  /* 3 */
  || orientation === 4
  /* LandscapeRight */

  /* 4 */
  ;
}

function openFileAtRootModule(filePath) {
  try {
    const appPath = iOSNativeHelper.getCurrentAppPath();
    let path = iOSNativeHelper.isRealDevice() ? filePath.replace('~', appPath) : filePath;
    const controller = UIDocumentInteractionController.interactionControllerWithURL(NSURL.fileURLWithPath(path));
    controller.delegate = iOSNativeHelper.createUIDocumentInteractionControllerDelegate();
    return controller.presentPreviewAnimated(true);
  } catch (e) {
    _trace__WEBPACK_IMPORTED_MODULE_0__["Trace"].write('Error in openFile', _trace__WEBPACK_IMPORTED_MODULE_0__["Trace"].categories.Error, _trace__WEBPACK_IMPORTED_MODULE_0__["Trace"].messageType.error);
  }

  return false;
}

var iOSNativeHelper;

(function (iOSNativeHelper) {
  // TODO: remove for NativeScript 7.0
  function getter(_this, property) {
    console.log('utils.ios.getter() is deprecated; use the respective native property instead');

    if (typeof property === 'function') {
      return property.call(_this);
    } else {
      return property;
    }
  }

  iOSNativeHelper.getter = getter;
  let collections;

  (function (collections) {
    function jsArrayToNSArray(str) {
      return NSArray.arrayWithArray(str);
    }

    collections.jsArrayToNSArray = jsArrayToNSArray;

    function nsArrayToJSArray(a) {
      const arr = [];

      if (a !== undefined) {
        let count = a.count;

        for (let i = 0; i < count; i++) {
          arr.push(a.objectAtIndex(i));
        }
      }

      return arr;
    }

    collections.nsArrayToJSArray = nsArrayToJSArray;
  })(collections = iOSNativeHelper.collections || (iOSNativeHelper.collections = {}));

  function isLandscape() {
    console.log('utils.ios.isLandscape() is deprecated; use application.orientation instead');
    const deviceOrientation = UIDevice.currentDevice.orientation;
    const statusBarOrientation = UIApplication.sharedApplication.statusBarOrientation;
    const isDeviceOrientationLandscape = isOrientationLandscape(deviceOrientation);
    const isStatusBarOrientationLandscape = isOrientationLandscape(statusBarOrientation);
    return isDeviceOrientationLandscape || isStatusBarOrientationLandscape;
  }

  iOSNativeHelper.isLandscape = isLandscape;
  iOSNativeHelper.MajorVersion = NSString.stringWithString(UIDevice.currentDevice.systemVersion).intValue;

  function openFile(filePath) {
    console.log('utils.ios.openFile() is deprecated; use utils.openFile() instead');
    return openFileAtRootModule(filePath);
  }

  iOSNativeHelper.openFile = openFile;

  function getCurrentAppPath() {
    const currentDir = __dirname;
    const tnsModulesIndex = currentDir.indexOf('/tns_modules'); // Module not hosted in ~/tns_modules when bundled. Use current dir.

    let appPath = currentDir;

    if (tnsModulesIndex !== -1) {
      // Strip part after tns_modules to obtain app root
      appPath = currentDir.substring(0, tnsModulesIndex);
    }

    return appPath;
  }

  iOSNativeHelper.getCurrentAppPath = getCurrentAppPath;

  function joinPaths(...paths) {
    if (!paths || paths.length === 0) {
      return '';
    }

    return NSString.stringWithString(NSString.pathWithComponents(paths)).stringByStandardizingPath;
  }

  iOSNativeHelper.joinPaths = joinPaths;

  function getVisibleViewController(rootViewController) {
    if (rootViewController.presentedViewController) {
      return getVisibleViewController(rootViewController.presentedViewController);
    }

    if (rootViewController.isKindOfClass(UINavigationController.class())) {
      return getVisibleViewController(rootViewController.visibleViewController);
    }

    if (rootViewController.isKindOfClass(UITabBarController.class())) {
      return getVisibleViewController(rootViewController);
    }

    return rootViewController;
  }

  iOSNativeHelper.getVisibleViewController = getVisibleViewController;

  function applyRotateTransform(transform, x, y, z) {
    if (x) {
      transform = CATransform3DRotate(transform, x * radToDeg, 1, 0, 0);
    }

    if (y) {
      transform = CATransform3DRotate(transform, y * radToDeg, 0, 1, 0);
    }

    if (z) {
      transform = CATransform3DRotate(transform, z * radToDeg, 0, 0, 1);
    }

    return transform;
  }

  iOSNativeHelper.applyRotateTransform = applyRotateTransform;

  function createUIDocumentInteractionControllerDelegate() {
    var UIDocumentInteractionControllerDelegateImpl =
    /** @class */
    function (_super) {
      __extends(UIDocumentInteractionControllerDelegateImpl, _super);

      function UIDocumentInteractionControllerDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
      }

      UIDocumentInteractionControllerDelegateImpl.prototype.getViewController = function () {
        var app = UIApplication.sharedApplication;
        return app.keyWindow.rootViewController;
      };

      UIDocumentInteractionControllerDelegateImpl.prototype.documentInteractionControllerViewControllerForPreview = function (controller) {
        return this.getViewController();
      };

      UIDocumentInteractionControllerDelegateImpl.prototype.documentInteractionControllerViewForPreview = function (controller) {
        return this.getViewController().view;
      };

      UIDocumentInteractionControllerDelegateImpl.prototype.documentInteractionControllerRectForPreview = function (controller) {
        return this.getViewController().view.frame;
      };

      UIDocumentInteractionControllerDelegateImpl.ObjCProtocols = [UIDocumentInteractionControllerDelegate];
      return UIDocumentInteractionControllerDelegateImpl;
    }(NSObject);

    return new UIDocumentInteractionControllerDelegateImpl();
  }

  iOSNativeHelper.createUIDocumentInteractionControllerDelegate = createUIDocumentInteractionControllerDelegate;

  function isRealDevice() {
    try {
      // https://stackoverflow.com/a/5093092/4936697
      const sourceType = UIImagePickerControllerSourceType.UIImagePickerControllerSourceTypeCamera;
      const mediaTypes = UIImagePickerController.availableMediaTypesForSourceType(sourceType);
      return mediaTypes;
    } catch (e) {
      return true;
    }
  }

  iOSNativeHelper.isRealDevice = isRealDevice;
})(iOSNativeHelper || (iOSNativeHelper = {}));

/***/ }),

/***/ "../node_modules/@nativescript/core/utils/types.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isString", function() { return isString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNumber", function() { return isNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isBoolean", function() { return isBoolean; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFunction", function() { return isFunction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isObject", function() { return isObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isUndefined", function() { return isUndefined; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDefined", function() { return isDefined; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isNullOrUndefined", function() { return isNullOrUndefined; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "verifyCallback", function() { return verifyCallback; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getClass", function() { return getClass; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getClassInfo", function() { return getClassInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getBaseClasses", function() { return getBaseClasses; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ClassInfo", function() { return ClassInfo; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "toUIString", function() { return toUIString; });
function isString(value) {
  return typeof value === 'string' || value instanceof String;
}
function isNumber(value) {
  return typeof value === 'number' || value instanceof Number;
}
function isBoolean(value) {
  return typeof value === 'boolean' || value instanceof Boolean;
}
function isFunction(value) {
  if (!value) {
    return false;
  }

  return typeof value === 'function';
}
function isObject(value) {
  if (!value) {
    return false;
  }

  return typeof value === 'object';
}
function isUndefined(value) {
  return typeof value === 'undefined';
}
function isDefined(value) {
  return typeof value !== 'undefined';
}
function isNullOrUndefined(value) {
  return typeof value === 'undefined' || value === null;
}
function verifyCallback(value) {
  if (value && !isFunction(value)) {
    throw new TypeError('Callback must be a valid function.');
  }
}
const classInfosMap = new Map(); // ES3-5 type classes are "function blah()", new ES6+ classes can be "class blah"

const funcNameRegex = /(?:function|class)\s+(\w+).*/;
function getClass(object) {
  return getClassInfo(object).name;
}
function getClassInfo(object) {
  const constructor = object.constructor;
  let result = classInfosMap.get(constructor);

  if (!result) {
    result = new ClassInfo(constructor);
    classInfosMap.set(constructor, result);
  }

  return result;
}
function getBaseClasses(object) {
  const result = [];
  let info = getClassInfo(object);

  while (info) {
    result.push(info.name);
    info = info.baseClassInfo;
  }

  return result;
}
class ClassInfo {
  constructor(typeConstructor) {
    this._typeConstructor = typeConstructor;
  }

  get name() {
    if (!this._name) {
      if (this._typeConstructor.name) {
        this._name = this._typeConstructor.name;
      } else {
        const results = funcNameRegex.exec(this._typeConstructor.toString());
        this._name = results && results.length > 1 ? results[1] : '';
      }
    }

    return this._name;
  }

  get baseClassInfo() {
    if (isUndefined(this._baseClassInfo)) {
      this._baseClassInfo = ClassInfo._getBase(this); // While extending some classes for platform specific versions results in duplicate class types in hierarchy.

      if (this._baseClassInfo && this._baseClassInfo.name === this.name) {
        this._baseClassInfo = ClassInfo._getBase(this._baseClassInfo);
      }
    }

    return this._baseClassInfo;
  }

  static _getBase(info) {
    let result = null;
    const constructorProto = info._typeConstructor.prototype;

    if (constructorProto.__proto__) {
      result = getClassInfo(constructorProto.__proto__);
    }

    return result;
  }

}
function toUIString(obj) {
  return isNullOrUndefined(obj) ? '' : obj + '';
}

/***/ }),

/***/ "../node_modules/@nativescript/core/utils/utils-common.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RESOURCE_PREFIX", function() { return RESOURCE_PREFIX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "FILE_PREFIX", function() { return FILE_PREFIX; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "escapeRegexSymbols", function() { return escapeRegexSymbols; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "convertString", function() { return convertString; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getModuleName", function() { return getModuleName; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFileOrResourcePath", function() { return isFileOrResourcePath; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isFontIconURI", function() { return isFontIconURI; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isDataURI", function() { return isDataURI; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mergeSort", function() { return mergeSort; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "merge", function() { return merge; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hasDuplicates", function() { return hasDuplicates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "eliminateDuplicates", function() { return eliminateDuplicates; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "executeOnMainThread", function() { return executeOnMainThread; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mainThreadify", function() { return mainThreadify; });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("../node_modules/@nativescript/core/utils/types.js");
/* harmony import */ var _mainthread_helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("../node_modules/@nativescript/core/utils/mainthread-helper.js");
/* harmony import */ var _ui_builder_module_name_sanitizer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("../node_modules/@nativescript/core/ui/builder/module-name-sanitizer.js");
/* harmony import */ var _layout_helper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("../node_modules/@nativescript/core/utils/layout-helper/index.js");
/* harmony reexport (module object) */ __webpack_require__.d(__webpack_exports__, "layout", function() { return _layout_helper__WEBPACK_IMPORTED_MODULE_3__; });
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "dispatchToMainThread", function() { return _mainthread_helper__WEBPACK_IMPORTED_MODULE_1__["dispatchToMainThread"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isMainThread", function() { return _mainthread_helper__WEBPACK_IMPORTED_MODULE_1__["isMainThread"]; });







const RESOURCE_PREFIX = 'res://';
const FILE_PREFIX = 'file:///';
function escapeRegexSymbols(source) {
  let escapeRegex = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
  return source.replace(escapeRegex, '\\$&');
}
function convertString(value) {
  let result;

  if (!_types__WEBPACK_IMPORTED_MODULE_0__["isString"](value) || value.trim() === '') {
    result = value;
  } else {
    // Try to convert value to number.
    const valueAsNumber = +value;

    if (!isNaN(valueAsNumber)) {
      result = valueAsNumber;
    } else if (value && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
      result = value.toLowerCase() === 'true' ? true : false;
    } else {
      result = value;
    }
  }

  return result;
}
function getModuleName(path) {
  let moduleName = path.replace('./', '');
  return Object(_ui_builder_module_name_sanitizer__WEBPACK_IMPORTED_MODULE_2__["sanitizeModuleName"])(moduleName);
}
function isFileOrResourcePath(path) {
  if (!_types__WEBPACK_IMPORTED_MODULE_0__["isString"](path)) {
    return false;
  }

  return path.indexOf('~/') === 0 || // relative to AppRoot
  path.indexOf('/') === 0 || // absolute path
  path.indexOf(RESOURCE_PREFIX) === 0; // resource
}
function isFontIconURI(uri) {
  if (!_types__WEBPACK_IMPORTED_MODULE_0__["isString"](uri)) {
    return false;
  }

  const firstSegment = uri.trim().split('//')[0];
  return firstSegment && firstSegment.indexOf('font:') === 0;
}
function isDataURI(uri) {
  if (!_types__WEBPACK_IMPORTED_MODULE_0__["isString"](uri)) {
    return false;
  }

  const firstSegment = uri.trim().split(',')[0];
  return firstSegment && firstSegment.indexOf('data:') === 0 && firstSegment.indexOf('base64') >= 0;
}
function mergeSort(arr, compareFunc) {
  if (arr.length < 2) {
    return arr;
  }

  const middle = arr.length / 2;
  const left = arr.slice(0, middle);
  const right = arr.slice(middle, arr.length);
  return merge(mergeSort(left, compareFunc), mergeSort(right, compareFunc), compareFunc);
}
function merge(left, right, compareFunc) {
  let result = [];

  while (left.length && right.length) {
    if (compareFunc(left[0], right[0]) <= 0) {
      result.push(left.shift());
    } else {
      result.push(right.shift());
    }
  }

  while (left.length) {
    result.push(left.shift());
  }

  while (right.length) {
    result.push(right.shift());
  }

  return result;
}
function hasDuplicates(arr) {
  return arr.length !== eliminateDuplicates(arr).length;
}
function eliminateDuplicates(arr) {
  return Array.from(new Set(arr));
}
function executeOnMainThread(func) {
  if (Object(_mainthread_helper__WEBPACK_IMPORTED_MODULE_1__["isMainThread"])()) {
    return func();
  } else {
    Object(_mainthread_helper__WEBPACK_IMPORTED_MODULE_1__["dispatchToMainThread"])(func);
  }
}
function mainThreadify(func) {
  return function () {
    const argsToPass = arguments;
    executeOnMainThread(() => func.apply(this, argsToPass));
  };
}

/***/ }),

/***/ "../node_modules/@nativescript/webpack/helpers/hot.js":
/***/ (function(module, exports, __webpack_require__) {

const hmrPrefix = 'HMR:';
const log = {
  info: message => console.info(`${hmrPrefix} ${message}`),
  warn: message => console.warn(`${hmrPrefix} ${message}`),
  error: message => console.error(`${hmrPrefix} ${message}`)
};
const refresh = 'Application needs to be restarted in order to apply the changes.';
const hotOptions = {
  ignoreUnaccepted: false,
  ignoreDeclined: false,
  ignoreErrored: false,

  onUnaccepted(data) {
    const chain = [].concat(data.chain);
    const last = chain[chain.length - 1];

    if (last === 0) {
      chain.pop();
    }

    log.warn(`Ignored an update to unaccepted module: `);
    chain.forEach(mod => log.warn(`         ➭ ${mod}`));
  },

  onDeclined(data) {
    log.warn(`Ignored an update to declined module:`);
    data.chain.forEach(mod => log.warn(`         ➭ ${mod}`));
  },

  onErrored(data) {
    log.warn(`Ignored an error while updating module ${data.moduleId} <${data.type}>`);
    log.warn(data.error);
  }

};
let nextHash;
let currentHash;

function upToDate() {
  return nextHash.indexOf(__webpack_require__.h()) >= 0;
}

function result(modules, appliedModules) {
  const unaccepted = modules.filter(moduleId => appliedModules && appliedModules.indexOf(moduleId) < 0);

  if (unaccepted.length > 0) {
    log.warn('The following modules could not be updated:');

    for (const moduleId of unaccepted) {
      log.warn(`          ⦻ ${moduleId}`);
    }
  }

  if (!(appliedModules || []).length) {
    log.info('No Modules Updated.');
  } else {
    log.info('The following modules were updated:');

    for (const moduleId of appliedModules) {
      log.info(`         ↻ ${moduleId}`);
    }

    const numberIds = appliedModules.every(moduleId => typeof moduleId === 'number');

    if (numberIds) {
      log.info('Please consider using the NamedModulesPlugin for module names.');
    }
  }
}

function check(options) {
  return module.hot.check().then(modules => {
    if (!modules) {
      log.warn(`Cannot find update. ${refresh}`);
      return null;
    }

    return module.hot.apply(hotOptions).then(appliedModules => {
      let nextCheck;

      if (!upToDate()) {
        nextCheck = check(options);
      }

      result(modules, appliedModules);

      if (upToDate()) {
        // Do not modify message - CLI depends on this exact content to determine hmr operation status.
        log.info(`Successfully applied update with hmr hash ${currentHash}. App is up to date.`);
      }

      return nextCheck || null;
    }).catch(err => {
      const status = module.hot.status();

      if (['abort', 'fail'].indexOf(status) >= 0) {
        // Do not modify message - CLI depends on this exact content to determine hmr operation status.
        log.error(`Cannot apply update with hmr hash ${currentHash}.`);
        log.error(err.message || err.stack);
      } else {
        log.error(`Update failed: ${err.message || err.stack}`);
      }
    });
  }).catch(err => {
    const status = module.hot.status();

    if (['abort', 'fail'].indexOf(status) >= 0) {
      log.error(`Cannot check for update. ${refresh}`);
      log.error(err.message || err.stack);
    } else {
      log.error(`Update check failed: ${err.message || err.stack}`);
    }
  });
}

if (true) {
  log.info('Hot Module Replacement Enabled. Waiting for signal.');
} else {}

function update(latestHash, options) {
  nextHash = latestHash;

  if (!upToDate()) {
    const status = module.hot.status();

    if (status === 'idle') {
      //Do not modify message - CLI depends on this exact content to determine hmr operation status.
      log.info(`Checking for updates to the bundle with hmr hash ${currentHash}.`);
      return check(options);
    } else if (['abort', 'fail'].indexOf(status) >= 0) {
      log.warn(`Cannot apply update. A previous update ${status}ed. ${refresh}`);
    }
  }
}

;

function getNextHash(hash, getFileContent) {
  const file = getFileContent(`${hash}.hot-update.json`);

  if (!file) {
    return Promise.resolve(hash);
  }

  return file.readText().then(hotUpdateContent => {
    if (hotUpdateContent) {
      const manifest = JSON.parse(hotUpdateContent);
      const newHash = manifest.h;
      return getNextHash(newHash, getFileContent);
    } else {
      return Promise.resolve(hash);
    }
  }).catch(error => Promise.reject(error));
}

module.exports = function checkState(initialHash, getFileContent) {
  currentHash = initialHash;
  return getNextHash(initialHash, getFileContent).then(nextHash => {
    if (nextHash != initialHash) {
      return update(nextHash, {});
    }
  });
};

/***/ }),

/***/ "../node_modules/@nativescript/webpack/helpers/load-application-css-regular.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {const loadCss = __webpack_require__("../node_modules/@nativescript/webpack/helpers/load-application-css.js");

module.exports = function () {
  loadCss(function () {
    const appCssContext = __webpack_require__("./ sync ^\\.\\/app\\.(css|scss|less|sass)$");

    global.registerWebpackModules(appCssContext);
  });
};
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("../node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../node_modules/@nativescript/webpack/helpers/load-application-css.js":
/***/ (function(module, exports, __webpack_require__) {

module.exports = function (loadModuleFn) {
  const nsCore = __webpack_require__("@nativescript/core");

  __webpack_require__("@nativescript/core/ui/styling/style-scope");

  loadModuleFn();
  nsCore.Application.loadAppCss();
};

/***/ }),

/***/ "../node_modules/@nativescript/webpack/hmr/hmr-update.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hmrUpdate = void 0;

const hot = __webpack_require__("../node_modules/@nativescript/webpack/helpers/hot.js");

function hmrUpdate() {
  const coreFile = __webpack_require__("@nativescript/core");

  const currentAppFolder = coreFile.knownFolders.currentApp();

  const latestHash = __webpack_require__['h']();

  return hot(latestHash, filename => {
    const fullFilePath = coreFile.path.join(currentAppFolder.path, filename);
    return coreFile.File.exists(fullFilePath) ? currentAppFolder.getFile(filename) : null;
  });
}

exports.hmrUpdate = hmrUpdate;

/***/ }),

/***/ "../node_modules/@nativescript/webpack/hmr/index.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hmrUpdate = void 0;

var hmr_update_1 = __webpack_require__("../node_modules/@nativescript/webpack/hmr/hmr-update.js");

Object.defineProperty(exports, "hmrUpdate", {
  enumerable: true,
  get: function () {
    return hmr_update_1.hmrUpdate;
  }
});

/***/ }),

/***/ "../node_modules/css-loader/dist/runtime/api.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names

module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ "../node_modules/css-unit-converter/index.js":
/***/ (function(module, exports) {

var conversions = {
  // length
  'px': {
    'px': 1,
    'cm': 96.0 / 2.54,
    'mm': 96.0 / 25.4,
    'in': 96,
    'pt': 96.0 / 72.0,
    'pc': 16
  },
  'cm': {
    'px': 2.54 / 96.0,
    'cm': 1,
    'mm': 0.1,
    'in': 2.54,
    'pt': 2.54 / 72.0,
    'pc': 2.54 / 6.0
  },
  'mm': {
    'px': 25.4 / 96.0,
    'cm': 10,
    'mm': 1,
    'in': 25.4,
    'pt': 25.4 / 72.0,
    'pc': 25.4 / 6.0
  },
  'in': {
    'px': 1.0 / 96.0,
    'cm': 1.0 / 2.54,
    'mm': 1.0 / 25.4,
    'in': 1,
    'pt': 1.0 / 72.0,
    'pc': 1.0 / 6.0
  },
  'pt': {
    'px': 0.75,
    'cm': 72.0 / 2.54,
    'mm': 72.0 / 25.4,
    'in': 72,
    'pt': 1,
    'pc': 12
  },
  'pc': {
    'px': 6.0 / 96.0,
    'cm': 6.0 / 2.54,
    'mm': 6.0 / 25.4,
    'in': 6,
    'pt': 6.0 / 72.0,
    'pc': 1
  },
  // angle
  'deg': {
    'deg': 1,
    'grad': 0.9,
    'rad': 180 / Math.PI,
    'turn': 360
  },
  'grad': {
    'deg': 400 / 360,
    'grad': 1,
    'rad': 200 / Math.PI,
    'turn': 400
  },
  'rad': {
    'deg': Math.PI / 180,
    'grad': Math.PI / 200,
    'rad': 1,
    'turn': Math.PI * 2
  },
  'turn': {
    'deg': 1 / 360,
    'grad': 1 / 400,
    'rad': 0.5 / Math.PI,
    'turn': 1
  },
  // time
  's': {
    's': 1,
    'ms': 1 / 1000
  },
  'ms': {
    's': 1000,
    'ms': 1
  },
  // frequency
  'Hz': {
    'Hz': 1,
    'kHz': 1000
  },
  'kHz': {
    'Hz': 1 / 1000,
    'kHz': 1
  },
  // resolution
  'dpi': {
    'dpi': 1,
    'dpcm': 1.0 / 2.54,
    'dppx': 1 / 96
  },
  'dpcm': {
    'dpi': 2.54,
    'dpcm': 1,
    'dppx': 2.54 / 96.0
  },
  'dppx': {
    'dpi': 96,
    'dpcm': 96.0 / 2.54,
    'dppx': 1
  }
};

module.exports = function (value, sourceUnit, targetUnit, precision) {
  if (!conversions.hasOwnProperty(targetUnit)) throw new Error("Cannot convert to " + targetUnit);
  if (!conversions[targetUnit].hasOwnProperty(sourceUnit)) throw new Error("Cannot convert from " + sourceUnit + " to " + targetUnit);
  var converted = conversions[targetUnit][sourceUnit] * value;

  if (precision !== false) {
    precision = Math.pow(10, parseInt(precision) || 5);
    return Math.round(converted * precision) / precision;
  }

  return converted;
};

/***/ }),

/***/ "../node_modules/nativescript-vue/dist/index.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * NativeScript-Vue v2.8.3
 * (Using Vue v2.6.12)
 * (c) 2017-2020 rigor789
 * Released under the MIT license.
 */


global.process = global.process || {};
global.process.env = global.process.env || {};

var core = __webpack_require__("@nativescript/core");
/*  */


var emptyObject = Object.freeze({}); // These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.

function isUndef(v) {
  return v === undefined || v === null;
}

function isDef(v) {
  return v !== undefined && v !== null;
}

function isTrue(v) {
  return v === true;
}

function isFalse(v) {
  return v === false;
}
/**
 * Check if value is primitive.
 */


function isPrimitive(value) {
  return typeof value === 'string' || typeof value === 'number' || // $flow-disable-line
  typeof value === 'symbol' || typeof value === 'boolean';
}
/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */


function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}
/**
 * Get the raw type string of a value, e.g., [object Object].
 */


var _toString = Object.prototype.toString;

function toRawType(value) {
  return _toString.call(value).slice(8, -1);
}
/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */


function isPlainObject(obj) {
  return _toString.call(obj) === '[object Object]';
}

function isRegExp(v) {
  return _toString.call(v) === '[object RegExp]';
}
/**
 * Check if val is a valid array index.
 */


function isValidArrayIndex(val) {
  var n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val);
}

function isPromise(val) {
  return isDef(val) && typeof val.then === 'function' && typeof val.catch === 'function';
}
/**
 * Convert a value to a string that is actually rendered.
 */


function toString(val) {
  return val == null ? '' : Array.isArray(val) || isPlainObject(val) && val.toString === _toString ? JSON.stringify(val, null, 2) : String(val);
}
/**
 * Convert an input value to a number for persistence.
 * If the conversion fails, return original string.
 */


function toNumber(val) {
  var n = parseFloat(val);
  return isNaN(n) ? val : n;
}
/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */


function makeMap(str, expectsLowerCase) {
  var map = Object.create(null);
  var list = str.split(',');

  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }

  return expectsLowerCase ? function (val) {
    return map[val.toLowerCase()];
  } : function (val) {
    return map[val];
  };
}
/**
 * Check if a tag is a built-in tag.
 */


var isBuiltInTag = makeMap('slot,component', true);
/**
 * Check if an attribute is a reserved attribute.
 */

var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');
/**
 * Remove an item from an array.
 */

function remove(arr, item) {
  if (arr.length) {
    var index = arr.indexOf(item);

    if (index > -1) {
      return arr.splice(index, 1);
    }
  }
}
/**
 * Check whether an object has the property.
 */


var hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}
/**
 * Create a cached version of a pure function.
 */


function cached(fn) {
  var cache = Object.create(null);
  return function cachedFn(str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}
/**
 * Camelize a hyphen-delimited string.
 */


var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) {
    return c ? c.toUpperCase() : '';
  });
});
/**
 * Capitalize a string.
 */

var capitalize = cached(function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
/**
 * Hyphenate a camelCase string.
 */

var hyphenateRE = /\B([A-Z])/g;
var hyphenate = cached(function (str) {
  return str.replace(hyphenateRE, '-$1').toLowerCase();
});
/**
 * Simple bind polyfill for environments that do not support it,
 * e.g., PhantomJS 1.x. Technically, we don't need this anymore
 * since native bind is now performant enough in most browsers.
 * But removing it would mean breaking code that was able to run in
 * PhantomJS 1.x, so this must be kept for backward compatibility.
 */

/* istanbul ignore next */

function polyfillBind(fn, ctx) {
  function boundFn(a) {
    var l = arguments.length;
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx);
  }

  boundFn._length = fn.length;
  return boundFn;
}

function nativeBind(fn, ctx) {
  return fn.bind(ctx);
}

var bind = Function.prototype.bind ? nativeBind : polyfillBind;
/**
 * Convert an Array-like object to a real Array.
 */

function toArray(list, start) {
  start = start || 0;
  var i = list.length - start;
  var ret = new Array(i);

  while (i--) {
    ret[i] = list[i + start];
  }

  return ret;
}
/**
 * Mix properties into target object.
 */


function extend(to, _from) {
  for (var key in _from) {
    to[key] = _from[key];
  }

  return to;
}
/**
 * Merge an Array of Objects into a single Object.
 */


function toObject(arr) {
  var res = {};

  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }

  return res;
}
/* eslint-disable no-unused-vars */

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */


function noop(a, b, c) {}
/**
 * Always return false.
 */


var no = function (a, b, c) {
  return false;
};
/* eslint-enable no-unused-vars */

/**
 * Return the same value.
 */


var identity = function (_) {
  return _;
};
/**
 * Generate a string containing static keys from compiler modules.
 */


function genStaticKeys(modules) {
  return modules.reduce(function (keys, m) {
    return keys.concat(m.staticKeys || []);
  }, []).join(',');
}
/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */


function looseEqual(a, b) {
  if (a === b) {
    return true;
  }

  var isObjectA = isObject(a);
  var isObjectB = isObject(b);

  if (isObjectA && isObjectB) {
    try {
      var isArrayA = Array.isArray(a);
      var isArrayB = Array.isArray(b);

      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every(function (e, i) {
          return looseEqual(e, b[i]);
        });
      } else if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
      } else if (!isArrayA && !isArrayB) {
        var keysA = Object.keys(a);
        var keysB = Object.keys(b);
        return keysA.length === keysB.length && keysA.every(function (key) {
          return looseEqual(a[key], b[key]);
        });
      } else {
        /* istanbul ignore next */
        return false;
      }
    } catch (e) {
      /* istanbul ignore next */
      return false;
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b);
  } else {
    return false;
  }
}
/**
 * Return the first index at which a loosely equal value can be
 * found in the array (if value is a plain object, the array must
 * contain an object of the same shape), or -1 if it is not present.
 */


function looseIndexOf(arr, val) {
  for (var i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) {
      return i;
    }
  }

  return -1;
}
/**
 * Ensure a function is called only once.
 */


function once(fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      fn.apply(this, arguments);
    }
  };
}
/*  */

/**
 * unicode letters used for parsing html tags, component names and property paths.
 * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
 * skipping \u10000-\uEFFFF due to it freezing up PhantomJS
 */


var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;
/**
 * Check if a string starts with $ or _
 */

function isReserved(str) {
  var c = (str + '').charCodeAt(0);
  return c === 0x24 || c === 0x5F;
}
/**
 * Define a property.
 */


function def(obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value: val,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  });
}
/**
 * Parse simple path.
 */


var bailRE = new RegExp("[^" + unicodeRegExp.source + ".$_\\d]");

function parsePath(path) {
  if (bailRE.test(path)) {
    return;
  }

  var segments = path.split('.');
  return function (obj) {
    for (var i = 0; i < segments.length; i++) {
      if (!obj) {
        return;
      }

      obj = obj[segments[i]];
    }

    return obj;
  };
}
/*  */
// can we use __proto__?


var hasProto = ('__proto__' in {}); // Browser environment sniffing

var inBrowser = typeof window !== 'undefined';
var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
var UA = inBrowser && window.navigator.userAgent.toLowerCase();
var isIE = UA && /msie|trident/.test(UA);
var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
var isEdge = UA && UA.indexOf('edge/') > 0;
var isAndroid = UA && UA.indexOf('android') > 0 || weexPlatform === 'android';
var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA) || weexPlatform === 'ios';
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
var isPhantomJS = UA && /phantomjs/.test(UA);
var isFF = UA && UA.match(/firefox\/(\d+)/); // Firefox has a "watch" function on Object.prototype...

var nativeWatch = {}.watch;
var supportsPassive = false;

if (inBrowser) {
  try {
    var opts = {};
    Object.defineProperty(opts, 'passive', {
      get: function get() {
        /* istanbul ignore next */
        supportsPassive = true;
      }
    }); // https://github.com/facebook/flow/issues/285

    window.addEventListener('test-passive', null, opts);
  } catch (e) {}
} // this needs to be lazy-evaled because vue may be required before
// vue-server-renderer can set VUE_ENV


var _isServer = false;

var isServerRendering = function () {
  return _isServer;
};
/* istanbul ignore next */


function isNative(Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}

var hasSymbol = typeof Symbol !== 'undefined' && isNative(Symbol) && typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

var _Set;
/* istanbul ignore if */
// $flow-disable-line


if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set;
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = /*@__PURE__*/function () {
    function Set() {
      this.set = Object.create(null);
    }

    Set.prototype.has = function has(key) {
      return this.set[key] === true;
    };

    Set.prototype.add = function add(key) {
      this.set[key] = true;
    };

    Set.prototype.clear = function clear() {
      this.set = Object.create(null);
    };

    return Set;
  }();
}

var SSR_ATTR = 'data-server-rendered';
var ASSET_TYPES = ['component', 'directive', 'filter'];
var LIFECYCLE_HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestroy', 'destroyed', 'activated', 'deactivated', 'errorCaptured', 'serverPrefetch'];
/*  */

var config = {
  /**
   * Option merge strategies (used in core/util/options)
   */
  // $flow-disable-line
  optionMergeStrategies: Object.create(null),

  /**
   * Whether to suppress warnings.
   */
  silent: false,

  /**
   * Show production mode tip message on boot?
   */
  productionTip: "development" !== 'production',

  /**
   * Whether to enable devtools
   */
  devtools: "development" !== 'production',

  /**
   * Whether to record perf
   */
  performance: false,

  /**
   * Error handler for watcher errors
   */
  errorHandler: null,

  /**
   * Warn handler for watcher warns
   */
  warnHandler: null,

  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],

  /**
   * Custom user key aliases for v-on
   */
  // $flow-disable-line
  keyCodes: Object.create(null),

  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,

  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,

  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,

  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,

  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,

  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,

  /**
   * Perform updates asynchronously. Intended to be used by Vue Test Utils
   * This will significantly reduce performance if set to false.
   */
  async: true,

  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
};
/*  */

var warn = noop;
var tip = noop;
var generateComponentTrace = noop; // work around flow check

var formatComponentName = noop;

if (true) {
  var hasConsole = typeof console !== 'undefined';
  var classifyRE = /(?:^|[-_])(\w)/g;

  var classify = function (str) {
    return str.replace(classifyRE, function (c) {
      return c.toUpperCase();
    }).replace(/[-_]/g, '');
  };

  warn = function (msg, vm) {
    var trace = vm ? generateComponentTrace(vm) : '';

    if (config.warnHandler) {
      config.warnHandler.call(null, msg, vm, trace);
    } else if (hasConsole && !config.silent) {
      console.error("[Vue warn]: " + msg + trace);
    }
  };

  tip = function (msg, vm) {
    if (hasConsole && !config.silent) {
      console.warn("[Vue tip]: " + msg + (vm ? generateComponentTrace(vm) : ''));
    }
  };

  formatComponentName = function (vm, includeFile) {
    if (vm.$root === vm) {
      return '<Root>';
    }

    var options = typeof vm === 'function' && vm.cid != null ? vm.options : vm._isVue ? vm.$options || vm.constructor.options : vm;
    var name = options.name || options._componentTag;
    var file = options.__file;

    if (!name && file) {
      var match = file.match(/([^/\\]+)\.vue$/);
      name = match && match[1];
    }

    return (name ? "<" + classify(name) + ">" : "<Anonymous>") + (file && includeFile !== false ? " at " + file : '');
  };

  var repeat = function (str, n) {
    var res = '';

    while (n) {
      if (n % 2 === 1) {
        res += str;
      }

      if (n > 1) {
        str += str;
      }

      n >>= 1;
    }

    return res;
  };

  generateComponentTrace = function (vm) {
    if (vm._isVue && vm.$parent) {
      var tree = [];
      var currentRecursiveSequence = 0;

      while (vm) {
        if (tree.length > 0) {
          var last = tree[tree.length - 1];

          if (last.constructor === vm.constructor) {
            currentRecursiveSequence++;
            vm = vm.$parent;
            continue;
          } else if (currentRecursiveSequence > 0) {
            tree[tree.length - 1] = [last, currentRecursiveSequence];
            currentRecursiveSequence = 0;
          }
        }

        tree.push(vm);
        vm = vm.$parent;
      }

      return '\n\nfound in\n\n' + tree.map(function (vm, i) {
        return "" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm) ? formatComponentName(vm[0]) + "... (" + vm[1] + " recursive calls)" : formatComponentName(vm));
      }).join('\n');
    } else {
      return "\n\n(found in " + formatComponentName(vm) + ")";
    }
  };
}
/*  */


var uid = 0;
/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */

var Dep = function Dep() {
  this.id = uid++;
  this.subs = [];
};

Dep.prototype.addSub = function addSub(sub) {
  this.subs.push(sub);
};

Dep.prototype.removeSub = function removeSub(sub) {
  remove(this.subs, sub);
};

Dep.prototype.depend = function depend() {
  if (Dep.target) {
    Dep.target.addDep(this);
  }
};

Dep.prototype.notify = function notify() {
  // stabilize the subscriber list first
  var subs = this.subs.slice();

  if ( true && !config.async) {
    // subs aren't sorted in scheduler if not running async
    // we need to sort them now to make sure they fire in correct
    // order
    subs.sort(function (a, b) {
      return a.id - b.id;
    });
  }

  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update();
  }
}; // The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.


Dep.target = null;
var targetStack = [];

function pushTarget(target) {
  targetStack.push(target);
  Dep.target = target;
}

function popTarget() {
  targetStack.pop();
  Dep.target = targetStack[targetStack.length - 1];
}
/*  */


var VNode = function VNode(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
  this.tag = tag;
  this.data = data;
  this.children = children;
  this.text = text;
  this.elm = elm;
  this.ns = undefined;
  this.context = context;
  this.fnContext = undefined;
  this.fnOptions = undefined;
  this.fnScopeId = undefined;
  this.key = data && data.key;
  this.componentOptions = componentOptions;
  this.componentInstance = undefined;
  this.parent = undefined;
  this.raw = false;
  this.isStatic = false;
  this.isRootInsert = true;
  this.isComment = false;
  this.isCloned = false;
  this.isOnce = false;
  this.asyncFactory = asyncFactory;
  this.asyncMeta = undefined;
  this.isAsyncPlaceholder = false;
};

var prototypeAccessors = {
  child: {
    configurable: true
  }
}; // DEPRECATED: alias for componentInstance for backwards compat.

/* istanbul ignore next */

prototypeAccessors.child.get = function () {
  return this.componentInstance;
};

Object.defineProperties(VNode.prototype, prototypeAccessors);

var createEmptyVNode = function (text) {
  if (text === void 0) text = '';
  var node = new VNode();
  node.text = text;
  node.isComment = true;
  return node;
};

function createTextVNode(val) {
  return new VNode(undefined, undefined, undefined, String(val));
} // optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.


function cloneVNode(vnode) {
  var cloned = new VNode(vnode.tag, vnode.data, // #7975
  // clone children array to avoid mutating original in case of cloning
  // a child.
  vnode.children && vnode.children.slice(), vnode.text, vnode.elm, vnode.context, vnode.componentOptions, vnode.asyncFactory);
  cloned.ns = vnode.ns;
  cloned.isStatic = vnode.isStatic;
  cloned.key = vnode.key;
  cloned.isComment = vnode.isComment;
  cloned.fnContext = vnode.fnContext;
  cloned.fnOptions = vnode.fnOptions;
  cloned.fnScopeId = vnode.fnScopeId;
  cloned.asyncMeta = vnode.asyncMeta;
  cloned.isCloned = true;
  return cloned;
}
/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */


var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);
var methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];
/**
 * Intercept mutating methods and emit events
 */

methodsToPatch.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator() {
    var args = [],
        len = arguments.length;

    while (len--) args[len] = arguments[len];

    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;

    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;

      case 'splice':
        inserted = args.slice(2);
        break;
    }

    if (inserted) {
      ob.observeArray(inserted);
    } // notify change


    ob.dep.notify();
    return result;
  });
});
/*  */

var arrayKeys = Object.getOwnPropertyNames(arrayMethods);
/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */

var shouldObserve = true;

function toggleObserving(value) {
  shouldObserve = value;
}
/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 */


var Observer = function Observer(value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);

  if (Array.isArray(value)) {
    if (hasProto) {
      protoAugment(value, arrayMethods);
    } else {
      copyAugment(value, arrayMethods, arrayKeys);
    }

    this.observeArray(value);
  } else {
    this.walk(value);
  }
};
/**
 * Walk through all properties and convert them into
 * getter/setters. This method should only be called when
 * value type is Object.
 */


Observer.prototype.walk = function walk(obj) {
  var keys = Object.keys(obj);

  for (var i = 0; i < keys.length; i++) {
    defineReactive(obj, keys[i]);
  }
};
/**
 * Observe a list of Array items.
 */


Observer.prototype.observeArray = function observeArray(items) {
  for (var i = 0, l = items.length; i < l; i++) {
    observe(items[i]);
  }
}; // helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 */


function protoAugment(target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}
/**
 * Augment a target Object or Array by defining
 * hidden properties.
 */

/* istanbul ignore next */


function copyAugment(target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}
/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */


function observe(value, asRootData) {
  if (!isObject(value) || value instanceof VNode) {
    return;
  }

  var ob;

  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
  } else if (shouldObserve && !isServerRendering() && (Array.isArray(value) || isPlainObject(value)) && Object.isExtensible(value) && !value._isVue) {
    ob = new Observer(value);
  }

  if (asRootData && ob) {
    ob.vmCount++;
  }

  return ob;
}
/**
 * Define a reactive property on an Object.
 */


function defineReactive(obj, key, val, customSetter, shallow) {
  var dep = new Dep();
  var property = Object.getOwnPropertyDescriptor(obj, key);

  if (property && property.configurable === false) {
    return;
  } // cater for pre-defined getter/setters


  var getter = property && property.get;
  var setter = property && property.set;

  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key];
  }

  var childOb = !shallow && observe(val);
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      var value = getter ? getter.call(obj) : val;

      if (Dep.target) {
        dep.depend();

        if (childOb) {
          childOb.dep.depend();

          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
      }

      return value;
    },
    set: function reactiveSetter(newVal) {
      var value = getter ? getter.call(obj) : val;
      /* eslint-disable no-self-compare */

      if (newVal === value || newVal !== newVal && value !== value) {
        return;
      }
      /* eslint-enable no-self-compare */


      if ( true && customSetter) {
        customSetter();
      } // #7981: for accessor properties without setter


      if (getter && !setter) {
        return;
      }

      if (setter) {
        setter.call(obj, newVal);
      } else {
        val = newVal;
      }

      childOb = !shallow && observe(newVal);
      dep.notify();
    }
  });
}
/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */


function set(target, key, val) {
  if ( true && (isUndef(target) || isPrimitive(target))) {
    warn("Cannot set reactive property on undefined, null, or primitive value: " + target);
  }

  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key);
    target.splice(key, 1, val);
    return val;
  }

  if (key in target && !(key in Object.prototype)) {
    target[key] = val;
    return val;
  }

  var ob = target.__ob__;

  if (target._isVue || ob && ob.vmCount) {
     true && warn('Avoid adding reactive properties to a Vue instance or its root $data ' + 'at runtime - declare it upfront in the data option.');
    return val;
  }

  if (!ob) {
    target[key] = val;
    return val;
  }

  defineReactive(ob.value, key, val);
  ob.dep.notify();
  return val;
}
/**
 * Delete a property and trigger change if necessary.
 */


function del(target, key) {
  if ( true && (isUndef(target) || isPrimitive(target))) {
    warn("Cannot delete reactive property on undefined, null, or primitive value: " + target);
  }

  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1);
    return;
  }

  var ob = target.__ob__;

  if (target._isVue || ob && ob.vmCount) {
     true && warn('Avoid deleting properties on a Vue instance or its root $data ' + '- just set it to null.');
    return;
  }

  if (!hasOwn(target, key)) {
    return;
  }

  delete target[key];

  if (!ob) {
    return;
  }

  ob.dep.notify();
}
/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */


function dependArray(value) {
  for (var e = void 0, i = 0, l = value.length; i < l; i++) {
    e = value[i];
    e && e.__ob__ && e.__ob__.dep.depend();

    if (Array.isArray(e)) {
      dependArray(e);
    }
  }
}
/*  */

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */


var strats = config.optionMergeStrategies;
/**
 * Options with restrictions
 */

if (true) {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn("option \"" + key + "\" can only be used during instance " + 'creation with the `new` keyword.');
    }

    return defaultStrat(parent, child);
  };
}
/**
 * Helper that recursively merges two data objects together.
 */


function mergeData(to, from) {
  if (!from) {
    return to;
  }

  var key, toVal, fromVal;
  var keys = hasSymbol ? Reflect.ownKeys(from) : Object.keys(from);

  for (var i = 0; i < keys.length; i++) {
    key = keys[i]; // in case the object is already observed...

    if (key === '__ob__') {
      continue;
    }

    toVal = to[key];
    fromVal = from[key];

    if (!hasOwn(to, key)) {
      set(to, key, fromVal);
    } else if (toVal !== fromVal && isPlainObject(toVal) && isPlainObject(fromVal)) {
      mergeData(toVal, fromVal);
    }
  }

  return to;
}
/**
 * Data
 */


function mergeDataOrFn(parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal;
    }

    if (!parentVal) {
      return childVal;
    } // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.


    return function mergedDataFn() {
      return mergeData(typeof childVal === 'function' ? childVal.call(this, this) : childVal, typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal);
    };
  } else {
    return function mergedInstanceDataFn() {
      // instance merge
      var instanceData = typeof childVal === 'function' ? childVal.call(vm, vm) : childVal;
      var defaultData = typeof parentVal === 'function' ? parentVal.call(vm, vm) : parentVal;

      if (instanceData) {
        return mergeData(instanceData, defaultData);
      } else {
        return defaultData;
      }
    };
  }
}

strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    if (childVal && typeof childVal !== 'function') {
       true && warn('The "data" option should be a function ' + 'that returns a per-instance value in component ' + 'definitions.', vm);
      return parentVal;
    }

    return mergeDataOrFn(parentVal, childVal);
  }

  return mergeDataOrFn(parentVal, childVal, vm);
};
/**
 * Hooks and props are merged as arrays.
 */


function mergeHook(parentVal, childVal) {
  var res = childVal ? parentVal ? parentVal.concat(childVal) : Array.isArray(childVal) ? childVal : [childVal] : parentVal;
  return res ? dedupeHooks(res) : res;
}

function dedupeHooks(hooks) {
  var res = [];

  for (var i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i]);
    }
  }

  return res;
}

LIFECYCLE_HOOKS.forEach(function (hook) {
  strats[hook] = mergeHook;
});
/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

function mergeAssets(parentVal, childVal, vm, key) {
  var res = Object.create(parentVal || null);

  if (childVal) {
     true && assertObjectType(key, childVal, vm);
    return extend(res, childVal);
  } else {
    return res;
  }
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets;
});
/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */

strats.watch = function (parentVal, childVal, vm, key) {
  // work around Firefox's Object.prototype.watch...
  if (parentVal === nativeWatch) {
    parentVal = undefined;
  }

  if (childVal === nativeWatch) {
    childVal = undefined;
  }
  /* istanbul ignore if */


  if (!childVal) {
    return Object.create(parentVal || null);
  }

  if (true) {
    assertObjectType(key, childVal, vm);
  }

  if (!parentVal) {
    return childVal;
  }

  var ret = {};
  extend(ret, parentVal);

  for (var key$1 in childVal) {
    var parent = ret[key$1];
    var child = childVal[key$1];

    if (parent && !Array.isArray(parent)) {
      parent = [parent];
    }

    ret[key$1] = parent ? parent.concat(child) : Array.isArray(child) ? child : [child];
  }

  return ret;
};
/**
 * Other object hashes.
 */


strats.props = strats.methods = strats.inject = strats.computed = function (parentVal, childVal, vm, key) {
  if (childVal && "development" !== 'production') {
    assertObjectType(key, childVal, vm);
  }

  if (!parentVal) {
    return childVal;
  }

  var ret = Object.create(null);
  extend(ret, parentVal);

  if (childVal) {
    extend(ret, childVal);
  }

  return ret;
};

strats.provide = mergeDataOrFn;
/**
 * Default strategy.
 */

var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined ? parentVal : childVal;
};
/**
 * Validate component names
 */


function checkComponents(options) {
  for (var key in options.components) {
    validateComponentName(key);
  }
}

function validateComponentName(name) {
  if (!new RegExp("^[a-zA-Z][\\-\\.0-9_" + unicodeRegExp.source + "]*$").test(name)) {
    warn('Invalid component name: "' + name + '". Component names ' + 'should conform to valid custom element name in html5 specification.');
  }

  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn('Do not use built-in or reserved HTML elements as component ' + 'id: ' + name);
  }
}
/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */


function normalizeProps(options, vm) {
  var props = options.props;

  if (!props) {
    return;
  }

  var res = {};
  var i, val, name;

  if (Array.isArray(props)) {
    i = props.length;

    while (i--) {
      val = props[i];

      if (typeof val === 'string') {
        name = camelize(val);
        res[name] = {
          type: null
        };
      } else if (true) {
        warn('props must be strings when using array syntax.');
      }
    }
  } else if (isPlainObject(props)) {
    for (var key in props) {
      val = props[key];
      name = camelize(key);
      res[name] = isPlainObject(val) ? val : {
        type: val
      };
    }
  } else if (true) {
    warn("Invalid value for option \"props\": expected an Array or an Object, " + "but got " + toRawType(props) + ".", vm);
  }

  options.props = res;
}
/**
 * Normalize all injections into Object-based format
 */


function normalizeInject(options, vm) {
  var inject = options.inject;

  if (!inject) {
    return;
  }

  var normalized = options.inject = {};

  if (Array.isArray(inject)) {
    for (var i = 0; i < inject.length; i++) {
      normalized[inject[i]] = {
        from: inject[i]
      };
    }
  } else if (isPlainObject(inject)) {
    for (var key in inject) {
      var val = inject[key];
      normalized[key] = isPlainObject(val) ? extend({
        from: key
      }, val) : {
        from: val
      };
    }
  } else if (true) {
    warn("Invalid value for option \"inject\": expected an Array or an Object, " + "but got " + toRawType(inject) + ".", vm);
  }
}
/**
 * Normalize raw function directives into object format.
 */


function normalizeDirectives(options) {
  var dirs = options.directives;

  if (dirs) {
    for (var key in dirs) {
      var def = dirs[key];

      if (typeof def === 'function') {
        dirs[key] = {
          bind: def,
          update: def
        };
      }
    }
  }
}

function assertObjectType(name, value, vm) {
  if (!isPlainObject(value)) {
    warn("Invalid value for option \"" + name + "\": expected an Object, " + "but got " + toRawType(value) + ".", vm);
  }
}
/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */


function mergeOptions(parent, child, vm) {
  if (true) {
    checkComponents(child);
  }

  if (typeof child === 'function') {
    child = child.options;
  }

  normalizeProps(child, vm);
  normalizeInject(child, vm);
  normalizeDirectives(child); // Apply extends and mixins on the child options,
  // but only if it is a raw options object that isn't
  // the result of another mergeOptions call.
  // Only merged options has the _base property.

  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm);
    }

    if (child.mixins) {
      for (var i = 0, l = child.mixins.length; i < l; i++) {
        parent = mergeOptions(parent, child.mixins[i], vm);
      }
    }
  }

  var options = {};
  var key;

  for (key in parent) {
    mergeField(key);
  }

  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key);
    }
  }

  function mergeField(key) {
    var strat = strats[key] || defaultStrat;
    options[key] = strat(parent[key], child[key], vm, key);
  }

  return options;
}
/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */


function resolveAsset(options, type, id, warnMissing) {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return;
  }

  var assets = options[type]; // check local registration variations first

  if (hasOwn(assets, id)) {
    return assets[id];
  }

  var camelizedId = camelize(id);

  if (hasOwn(assets, camelizedId)) {
    return assets[camelizedId];
  }

  var PascalCaseId = capitalize(camelizedId);

  if (hasOwn(assets, PascalCaseId)) {
    return assets[PascalCaseId];
  } // fallback to prototype chain


  var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];

  if ( true && warnMissing && !res) {
    warn('Failed to resolve ' + type.slice(0, -1) + ': ' + id, options);
  }

  return res;
}
/*  */


function validateProp(key, propOptions, propsData, vm) {
  var prop = propOptions[key];
  var absent = !hasOwn(propsData, key);
  var value = propsData[key]; // boolean casting

  var booleanIndex = getTypeIndex(Boolean, prop.type);

  if (booleanIndex > -1) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false;
    } else if (value === '' || value === hyphenate(key)) {
      // only cast empty string / same name to boolean if
      // boolean has higher priority
      var stringIndex = getTypeIndex(String, prop.type);

      if (stringIndex < 0 || booleanIndex < stringIndex) {
        value = true;
      }
    }
  } // check default value


  if (value === undefined) {
    value = getPropDefaultValue(vm, prop, key); // since the default value is a fresh copy,
    // make sure to observe it.

    var prevShouldObserve = shouldObserve;
    toggleObserving(true);
    observe(value);
    toggleObserving(prevShouldObserve);
  }

  if (true) {
    assertProp(prop, key, value, vm, absent);
  }

  return value;
}
/**
 * Get the default value of a prop.
 */


function getPropDefaultValue(vm, prop, key) {
  // no default, return undefined
  if (!hasOwn(prop, 'default')) {
    return undefined;
  }

  var def = prop.default; // warn against non-factory defaults for Object & Array

  if ( true && isObject(def)) {
    warn('Invalid default value for prop "' + key + '": ' + 'Props with type Object/Array must use a factory function ' + 'to return the default value.', vm);
  } // the raw prop value was also undefined from previous render,
  // return previous default value to avoid unnecessary watcher trigger


  if (vm && vm.$options.propsData && vm.$options.propsData[key] === undefined && vm._props[key] !== undefined) {
    return vm._props[key];
  } // call factory function for non-Function types
  // a value is Function if its prototype is function even across different execution context


  return typeof def === 'function' && getType(prop.type) !== 'Function' ? def.call(vm) : def;
}
/**
 * Assert whether a prop is valid.
 */


function assertProp(prop, name, value, vm, absent) {
  if (prop.required && absent) {
    warn('Missing required prop: "' + name + '"', vm);
    return;
  }

  if (value == null && !prop.required) {
    return;
  }

  var type = prop.type;
  var valid = !type || type === true;
  var expectedTypes = [];

  if (type) {
    if (!Array.isArray(type)) {
      type = [type];
    }

    for (var i = 0; i < type.length && !valid; i++) {
      var assertedType = assertType(value, type[i]);
      expectedTypes.push(assertedType.expectedType || '');
      valid = assertedType.valid;
    }
  }

  if (!valid) {
    warn(getInvalidTypeMessage(name, value, expectedTypes), vm);
    return;
  }

  var validator = prop.validator;

  if (validator) {
    if (!validator(value)) {
      warn('Invalid prop: custom validator check failed for prop "' + name + '".', vm);
    }
  }
}

var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

function assertType(value, type) {
  var valid;
  var expectedType = getType(type);

  if (simpleCheckRE.test(expectedType)) {
    var t = typeof value;
    valid = t === expectedType.toLowerCase(); // for primitive wrapper objects

    if (!valid && t === 'object') {
      valid = value instanceof type;
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value);
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value);
  } else {
    valid = value instanceof type;
  }

  return {
    valid: valid,
    expectedType: expectedType
  };
}
/**
 * Use function string name to check built-in types,
 * because a simple equality check will fail when running
 * across different vms / iframes.
 */


function getType(fn) {
  var match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : '';
}

function isSameType(a, b) {
  return getType(a) === getType(b);
}

function getTypeIndex(type, expectedTypes) {
  if (!Array.isArray(expectedTypes)) {
    return isSameType(expectedTypes, type) ? 0 : -1;
  }

  for (var i = 0, len = expectedTypes.length; i < len; i++) {
    if (isSameType(expectedTypes[i], type)) {
      return i;
    }
  }

  return -1;
}

function getInvalidTypeMessage(name, value, expectedTypes) {
  var message = "Invalid prop: type check failed for prop \"" + name + "\"." + " Expected " + expectedTypes.map(capitalize).join(', ');
  var expectedType = expectedTypes[0];
  var receivedType = toRawType(value);
  var expectedValue = styleValue(value, expectedType);
  var receivedValue = styleValue(value, receivedType); // check if we need to specify expected value

  if (expectedTypes.length === 1 && isExplicable(expectedType) && !isBoolean(expectedType, receivedType)) {
    message += " with value " + expectedValue;
  }

  message += ", got " + receivedType + " "; // check if we need to specify received value

  if (isExplicable(receivedType)) {
    message += "with value " + receivedValue + ".";
  }

  return message;
}

function styleValue(value, type) {
  if (type === 'String') {
    return "\"" + value + "\"";
  } else if (type === 'Number') {
    return "" + Number(value);
  } else {
    return "" + value;
  }
}

function isExplicable(value) {
  var explicitTypes = ['string', 'number', 'boolean'];
  return explicitTypes.some(function (elem) {
    return value.toLowerCase() === elem;
  });
}

function isBoolean() {
  var args = [],
      len = arguments.length;

  while (len--) args[len] = arguments[len];

  return args.some(function (elem) {
    return elem.toLowerCase() === 'boolean';
  });
}
/*  */


function handleError(err, vm, info) {
  // Deactivate deps tracking while processing error handler to avoid possible infinite rendering.
  // See: https://github.com/vuejs/vuex/issues/1505
  pushTarget();

  try {
    if (vm) {
      var cur = vm;

      while (cur = cur.$parent) {
        var hooks = cur.$options.errorCaptured;

        if (hooks) {
          for (var i = 0; i < hooks.length; i++) {
            try {
              var capture = hooks[i].call(cur, err, vm, info) === false;

              if (capture) {
                return;
              }
            } catch (e) {
              globalHandleError(e, cur, 'errorCaptured hook');
            }
          }
        }
      }
    }

    globalHandleError(err, vm, info);
  } finally {
    popTarget();
  }
}

function invokeWithErrorHandling(handler, context, args, vm, info) {
  var res;

  try {
    res = args ? handler.apply(context, args) : handler.call(context);

    if (res && !res._isVue && isPromise(res) && !res._handled) {
      res.catch(function (e) {
        return handleError(e, vm, info + " (Promise/async)");
      }); // issue #9511
      // avoid catch triggering multiple times when nested calls

      res._handled = true;
    }
  } catch (e) {
    handleError(e, vm, info);
  }

  return res;
}

function globalHandleError(err, vm, info) {
  if (config.errorHandler) {
    try {
      return config.errorHandler.call(null, err, vm, info);
    } catch (e) {
      // if the user intentionally throws the original error in the handler,
      // do not log it twice
      if (e !== err) {
        logError(e, null, 'config.errorHandler');
      }
    }
  }

  logError(err, vm, info);
}

function logError(err, vm, info) {
  if (true) {
    warn("Error in " + info + ": \"" + err.toString() + "\"", vm);
  }
  /* istanbul ignore else */


  if ((inBrowser || inWeex) && typeof console !== 'undefined') {
    console.error(err);
  } else {
    throw err;
  }
}
/*  */


var callbacks = [];
var pending = false;

function flushCallbacks() {
  pending = false;
  var copies = callbacks.slice(0);
  callbacks.length = 0;

  for (var i = 0; i < copies.length; i++) {
    copies[i]();
  }
} // Here we have async deferring wrappers using microtasks.
// In 2.5 we used (macro) tasks (in combination with microtasks).
// However, it has subtle problems when state is changed right before repaint
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// A major drawback of this tradeoff is that there are some scenarios
// where microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).


var timerFunc; // The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// completely stops working after triggering a few times... so, if native
// Promise is available, we will use it:

/* istanbul ignore next, $flow-disable-line */

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  var p = Promise.resolve();

  timerFunc = function () {
    p.then(flushCallbacks); // In problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.

    if (isIOS) {
      setTimeout(noop);
    }
  };
} else if (!isIE && typeof MutationObserver !== 'undefined' && (isNative(MutationObserver) || // PhantomJS and iOS 7.x
MutationObserver.toString() === '[object MutationObserverConstructor]')) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // (#6466 MutationObserver is unreliable in IE11)
  var counter = 1;
  var observer = new MutationObserver(flushCallbacks);
  var textNode = document.createTextNode(String(counter));
  observer.observe(textNode, {
    characterData: true
  });

  timerFunc = function () {
    counter = (counter + 1) % 2;
    textNode.data = String(counter);
  };
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // Fallback to setImmediate.
  // Technically it leverages the (macro) task queue,
  // but it is still a better choice than setTimeout.
  timerFunc = function () {
    setImmediate(flushCallbacks);
  };
} else {
  // Fallback to setTimeout.
  timerFunc = function () {
    setTimeout(flushCallbacks, 0);
  };
}

function nextTick(cb, ctx) {
  var _resolve;

  callbacks.push(function () {
    if (cb) {
      try {
        cb.call(ctx);
      } catch (e) {
        handleError(e, ctx, 'nextTick');
      }
    } else if (_resolve) {
      _resolve(ctx);
    }
  });

  if (!pending) {
    pending = true;
    timerFunc();
  } // $flow-disable-line


  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(function (resolve) {
      _resolve = resolve;
    });
  }
}
/*  */


var ref = {
  create: function create(_, vnode) {
    registerRef(vnode);
  },
  update: function update(oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true);
      registerRef(vnode);
    }
  },
  destroy: function destroy(vnode) {
    registerRef(vnode, true);
  }
};

function registerRef(vnode, isRemoval) {
  var key = vnode.data.ref;

  if (!isDef(key)) {
    return;
  }

  var vm = vnode.context;
  var ref = vnode.componentInstance || vnode.elm;
  var refs = vm.$refs;

  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref);
    } else if (refs[key] === ref) {
      refs[key] = undefined;
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref];
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref);
      }
    } else {
      refs[key] = ref;
    }
  }
}
/*  */


var seenObjects = new _Set();
/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 */

function traverse(val) {
  _traverse(val, seenObjects);

  seenObjects.clear();
}

function _traverse(val, seen) {
  var i, keys;
  var isA = Array.isArray(val);

  if (!isA && !isObject(val) || Object.isFrozen(val) || val instanceof VNode) {
    return;
  }

  if (val.__ob__) {
    var depId = val.__ob__.dep.id;

    if (seen.has(depId)) {
      return;
    }

    seen.add(depId);
  }

  if (isA) {
    i = val.length;

    while (i--) {
      _traverse(val[i], seen);
    }
  } else {
    keys = Object.keys(val);
    i = keys.length;

    while (i--) {
      _traverse(val[keys[i]], seen);
    }
  }
}
/*  */


var MAX_UPDATE_COUNT = 100;
var queue = [];
var activatedChildren = [];
var has = {};
var circular = {};
var waiting = false;
var flushing = false;
var index = 0;
/**
 * Reset the scheduler's state.
 */

function resetSchedulerState() {
  index = queue.length = activatedChildren.length = 0;
  has = {};

  if (true) {
    circular = {};
  }

  waiting = flushing = false;
} // Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.


var currentFlushTimestamp = 0; // Async edge case fix requires storing an event listener's attach timestamp.

var getNow = Date.now; // Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)

if (inBrowser && !isIE) {
  var performance = window.performance;

  if (performance && typeof performance.now === 'function' && getNow() > document.createEvent('Event').timeStamp) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = function () {
      return performance.now();
    };
  }
}
/**
 * Flush both queues and run the watchers.
 */


function flushSchedulerQueue() {
  currentFlushTimestamp = getNow();
  flushing = true;
  var watcher, id; // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.

  queue.sort(function (a, b) {
    return a.id - b.id;
  }); // do not cache length because more watchers might be pushed
  // as we run existing watchers

  for (index = 0; index < queue.length; index++) {
    watcher = queue[index];

    if (watcher.before) {
      watcher.before();
    }

    id = watcher.id;
    has[id] = null;
    watcher.run(); // in dev build, check and stop circular updates.

    if ( true && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1;

      if (circular[id] > MAX_UPDATE_COUNT) {
        warn('You may have an infinite update loop ' + (watcher.user ? "in watcher with expression \"" + watcher.expression + "\"" : "in a component render function."), watcher.vm);
        break;
      }
    }
  } // keep copies of post queues before resetting state


  var activatedQueue = activatedChildren.slice();
  var updatedQueue = queue.slice();
  resetSchedulerState(); // call component updated and activated hooks

  callActivatedHooks(activatedQueue);
  callUpdatedHooks(updatedQueue); // devtool hook

  /* istanbul ignore if */

  if (global.__VUE_DEVTOOLS_GLOBAL_HOOK__ && config.devtools) {
    global.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('flush');
  }
}

function callUpdatedHooks(queue) {
  var i = queue.length;

  while (i--) {
    var watcher = queue[i];
    var vm = watcher.vm;

    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated');
    }
  }
}
/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */


function queueActivatedComponent(vm) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false;
  activatedChildren.push(vm);
}

function callActivatedHooks(queue) {
  for (var i = 0; i < queue.length; i++) {
    queue[i]._inactive = true;
    activateChildComponent(queue[i], true
    /* true */
    );
  }
}
/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 */


function queueWatcher(watcher) {
  var id = watcher.id;

  if (has[id] == null) {
    has[id] = true;

    if (!flushing) {
      queue.push(watcher);
    } else {
      // if already flushing, splice the watcher based on its id
      // if already past its id, it will be run next immediately.
      var i = queue.length - 1;

      while (i > index && queue[i].id > watcher.id) {
        i--;
      }

      queue.splice(i + 1, 0, watcher);
    } // queue the flush


    if (!waiting) {
      waiting = true;

      if ( true && !config.async) {
        flushSchedulerQueue();
        return;
      }

      nextTick(flushSchedulerQueue);
    }
  }
}
/*  */


var uid$1 = 0;
/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */

var Watcher = function Watcher(vm, expOrFn, cb, options, isRenderWatcher) {
  this.vm = vm;

  if (isRenderWatcher) {
    vm._watcher = this;
  }

  vm._watchers.push(this); // options


  if (options) {
    this.deep = !!options.deep;
    this.user = !!options.user;
    this.lazy = !!options.lazy;
    this.sync = !!options.sync;
    this.before = options.before;
  } else {
    this.deep = this.user = this.lazy = this.sync = false;
  }

  this.cb = cb;
  this.id = ++uid$1; // uid for batching

  this.active = true;
  this.dirty = this.lazy; // for lazy watchers

  this.deps = [];
  this.newDeps = [];
  this.depIds = new _Set();
  this.newDepIds = new _Set();
  this.expression =  true ? expOrFn.toString() : undefined; // parse expression for getter

  if (typeof expOrFn === 'function') {
    this.getter = expOrFn;
  } else {
    this.getter = parsePath(expOrFn);

    if (!this.getter) {
      this.getter = noop;
       true && warn("Failed watching path: \"" + expOrFn + "\" " + 'Watcher only accepts simple dot-delimited paths. ' + 'For full control, use a function instead.', vm);
    }
  }

  this.value = this.lazy ? undefined : this.get();
};
/**
 * Evaluate the getter, and re-collect dependencies.
 */


Watcher.prototype.get = function get() {
  pushTarget(this);
  var value;
  var vm = this.vm;

  try {
    value = this.getter.call(vm, vm);
  } catch (e) {
    if (this.user) {
      handleError(e, vm, "getter for watcher \"" + this.expression + "\"");
    } else {
      throw e;
    }
  } finally {
    // "touch" every property so they are all tracked as
    // dependencies for deep watching
    if (this.deep) {
      traverse(value);
    }

    popTarget();
    this.cleanupDeps();
  }

  return value;
};
/**
 * Add a dependency to this directive.
 */


Watcher.prototype.addDep = function addDep(dep) {
  var id = dep.id;

  if (!this.newDepIds.has(id)) {
    this.newDepIds.add(id);
    this.newDeps.push(dep);

    if (!this.depIds.has(id)) {
      dep.addSub(this);
    }
  }
};
/**
 * Clean up for dependency collection.
 */


Watcher.prototype.cleanupDeps = function cleanupDeps() {
  var i = this.deps.length;

  while (i--) {
    var dep = this.deps[i];

    if (!this.newDepIds.has(dep.id)) {
      dep.removeSub(this);
    }
  }

  var tmp = this.depIds;
  this.depIds = this.newDepIds;
  this.newDepIds = tmp;
  this.newDepIds.clear();
  tmp = this.deps;
  this.deps = this.newDeps;
  this.newDeps = tmp;
  this.newDeps.length = 0;
};
/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */


Watcher.prototype.update = function update() {
  /* istanbul ignore else */
  if (this.lazy) {
    this.dirty = true;
  } else if (this.sync) {
    this.run();
  } else {
    queueWatcher(this);
  }
};
/**
 * Scheduler job interface.
 * Will be called by the scheduler.
 */


Watcher.prototype.run = function run() {
  if (this.active) {
    var value = this.get();

    if (value !== this.value || // Deep watchers and watchers on Object/Arrays should fire even
    // when the value is the same, because the value may
    // have mutated.
    isObject(value) || this.deep) {
      // set new value
      var oldValue = this.value;
      this.value = value;

      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue);
        } catch (e) {
          handleError(e, this.vm, "callback for watcher \"" + this.expression + "\"");
        }
      } else {
        this.cb.call(this.vm, value, oldValue);
      }
    }
  }
};
/**
 * Evaluate the value of the watcher.
 * This only gets called for lazy watchers.
 */


Watcher.prototype.evaluate = function evaluate() {
  this.value = this.get();
  this.dirty = false;
};
/**
 * Depend on all deps collected by this watcher.
 */


Watcher.prototype.depend = function depend() {
  var i = this.deps.length;

  while (i--) {
    this.deps[i].depend();
  }
};
/**
 * Remove self from all dependencies' subscriber list.
 */


Watcher.prototype.teardown = function teardown() {
  if (this.active) {
    // remove self from vm's watcher list
    // this is a somewhat expensive operation so we skip it
    // if the vm is being destroyed.
    if (!this.vm._isBeingDestroyed) {
      remove(this.vm._watchers, this);
    }

    var i = this.deps.length;

    while (i--) {
      this.deps[i].removeSub(this);
    }

    this.active = false;
  }
};

var mark;
var measure;

if (true) {
  var perf = inBrowser && window.performance;
  /* istanbul ignore if */

  if (perf && perf.mark && perf.measure && perf.clearMarks && perf.clearMeasures) {
    mark = function (tag) {
      return perf.mark(tag);
    };

    measure = function (name, startTag, endTag) {
      perf.measure(name, startTag, endTag);
      perf.clearMarks(startTag);
      perf.clearMarks(endTag); // perf.clearMeasures(name)
    };
  }
}
/*  */


var normalizeEvent = cached(function (name) {
  var passive = name.charAt(0) === '&';
  name = passive ? name.slice(1) : name;
  var once = name.charAt(0) === '~'; // Prefixed last, checked first

  name = once ? name.slice(1) : name;
  var capture = name.charAt(0) === '!';
  name = capture ? name.slice(1) : name;
  return {
    name: name,
    once: once,
    capture: capture,
    passive: passive
  };
});

function createFnInvoker(fns, vm) {
  function invoker() {
    var arguments$1 = arguments;
    var fns = invoker.fns;

    if (Array.isArray(fns)) {
      var cloned = fns.slice();

      for (var i = 0; i < cloned.length; i++) {
        invokeWithErrorHandling(cloned[i], null, arguments$1, vm, "v-on handler");
      }
    } else {
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, "v-on handler");
    }
  }

  invoker.fns = fns;
  return invoker;
}

function updateListeners(on, oldOn, add, remove, createOnceHandler, vm) {
  var name, def, cur, old, event;

  for (name in on) {
    def = cur = on[name];
    old = oldOn[name];
    event = normalizeEvent(name);

    if (isUndef(cur)) {
       true && warn("Invalid handler for event \"" + event.name + "\": got " + String(cur), vm);
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur, vm);
      }

      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture);
      }

      add(event.name, cur, event.capture, event.passive, event.params);
    } else if (cur !== old) {
      old.fns = cur;
      on[name] = old;
    }
  }

  for (name in oldOn) {
    if (isUndef(on[name])) {
      event = normalizeEvent(name);
      remove(event.name, oldOn[name], event.capture);
    }
  }
}
/*  */


function mergeVNodeHook(def, hookKey, hook) {
  if (def instanceof VNode) {
    def = def.data.hook || (def.data.hook = {});
  }

  var invoker;
  var oldHook = def[hookKey];

  function wrappedHook() {
    hook.apply(this, arguments); // important: remove merged hook to ensure it's called only once
    // and prevent memory leak

    remove(invoker.fns, wrappedHook);
  }

  if (isUndef(oldHook)) {
    // no existing hook
    invoker = createFnInvoker([wrappedHook]);
  } else {
    /* istanbul ignore if */
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      // already a merged invoker
      invoker = oldHook;
      invoker.fns.push(wrappedHook);
    } else {
      // existing plain hook
      invoker = createFnInvoker([oldHook, wrappedHook]);
    }
  }

  invoker.merged = true;
  def[hookKey] = invoker;
}
/*  */


function extractPropsFromVNodeData(data, Ctor, tag) {
  // we are only extracting raw values here.
  // validation and default values are handled in the child
  // component itself.
  var propOptions = Ctor.options.props;

  if (isUndef(propOptions)) {
    return;
  }

  var res = {};
  var attrs = data.attrs;
  var props = data.props;

  if (isDef(attrs) || isDef(props)) {
    for (var key in propOptions) {
      var altKey = hyphenate(key);

      if (true) {
        var keyInLowerCase = key.toLowerCase();

        if (key !== keyInLowerCase && attrs && hasOwn(attrs, keyInLowerCase)) {
          tip("Prop \"" + keyInLowerCase + "\" is passed to component " + formatComponentName(tag || Ctor) + ", but the declared prop name is" + " \"" + key + "\". " + "Note that HTML attributes are case-insensitive and camelCased " + "props need to use their kebab-case equivalents when using in-DOM " + "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\".");
        }
      }

      checkProp(res, props, key, altKey, true) || checkProp(res, attrs, key, altKey, false);
    }
  }

  return res;
}

function checkProp(res, hash, key, altKey, preserve) {
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key];

      if (!preserve) {
        delete hash[key];
      }

      return true;
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey];

      if (!preserve) {
        delete hash[altKey];
      }

      return true;
    }
  }

  return false;
}
/*  */
// The template compiler attempts to minimize the need for normalization by
// statically analyzing the template at compile time.
//
// For plain HTML markup, normalization can be completely skipped because the
// generated render function is guaranteed to return Array<VNode>. There are
// two cases where extra normalization is needed:
// 1. When the children contains components - because a functional component
// may return an Array instead of a single root. In this case, just a simple
// normalization is needed - if any child is an Array, we flatten the whole
// thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
// because functional components already normalize their own children.


function simpleNormalizeChildren(children) {
  for (var i = 0; i < children.length; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.apply([], children);
    }
  }

  return children;
} // 2. When the children contains constructs that always generated nested Arrays,
// e.g. <template>, <slot>, v-for, or when the children is provided by user
// with hand-written render functions / JSX. In such cases a full normalization
// is needed to cater to all possible types of children values.


function normalizeChildren(children) {
  return isPrimitive(children) ? [createTextVNode(children)] : Array.isArray(children) ? normalizeArrayChildren(children) : undefined;
}

function isTextNode(node) {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment);
}

function normalizeArrayChildren(children, nestedIndex) {
  var res = [];
  var i, c, lastIndex, last;

  for (i = 0; i < children.length; i++) {
    c = children[i];

    if (isUndef(c) || typeof c === 'boolean') {
      continue;
    }

    lastIndex = res.length - 1;
    last = res[lastIndex]; //  nested

    if (Array.isArray(c)) {
      if (c.length > 0) {
        c = normalizeArrayChildren(c, (nestedIndex || '') + "_" + i); // merge adjacent text nodes

        if (isTextNode(c[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + c[0].text);
          c.shift();
        }

        res.push.apply(res, c);
      }
    } else if (isPrimitive(c)) {
      if (isTextNode(last)) {
        // merge adjacent text nodes
        // this is necessary for SSR hydration because text nodes are
        // essentially merged when rendered to HTML strings
        res[lastIndex] = createTextVNode(last.text + c);
      } else if (c !== '') {
        // convert primitive to vnode
        res.push(createTextVNode(c));
      }
    } else {
      if (isTextNode(c) && isTextNode(last)) {
        // merge adjacent text nodes
        res[lastIndex] = createTextVNode(last.text + c.text);
      } else {
        // default key for nested array children (likely generated by v-for)
        if (isTrue(children._isVList) && isDef(c.tag) && isUndef(c.key) && isDef(nestedIndex)) {
          c.key = "__vlist" + nestedIndex + "_" + i + "__";
        }

        res.push(c);
      }
    }
  }

  return res;
}
/* not type checking this file because flow doesn't play well with Proxy */


var initProxy;

if (true) {
  var allowedGlobals = makeMap('Infinity,undefined,NaN,isFinite,isNaN,' + 'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' + 'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' + 'require' // for Webpack/Browserify
  );

  var warnNonPresent = function (target, key) {
    warn("Property or method \"" + key + "\" is not defined on the instance but " + 'referenced during render. Make sure that this property is reactive, ' + 'either in the data option, or for class-based components, by ' + 'initializing the property. ' + 'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.', target);
  };

  var warnReservedPrefix = function (target, key) {
    warn("Property \"" + key + "\" must be accessed with \"$data." + key + "\" because " + 'properties starting with "$" or "_" are not proxied in the Vue instance to ' + 'prevent conflicts with Vue internals. ' + 'See: https://vuejs.org/v2/api/#data', target);
  };

  var hasProxy = typeof Proxy !== 'undefined' && isNative(Proxy);

  if (hasProxy) {
    var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
    config.keyCodes = new Proxy(config.keyCodes, {
      set: function set(target, key, value) {
        if (isBuiltInModifier(key)) {
          warn("Avoid overwriting built-in modifier in config.keyCodes: ." + key);
          return false;
        } else {
          target[key] = value;
          return true;
        }
      }
    });
  }

  var hasHandler = {
    has: function has(target, key) {
      var has = (key in target);
      var isAllowed = allowedGlobals(key) || typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data);

      if (!has && !isAllowed) {
        if (key in target.$data) {
          warnReservedPrefix(target, key);
        } else {
          warnNonPresent(target, key);
        }
      }

      return has || !isAllowed;
    }
  };
  var getHandler = {
    get: function get(target, key) {
      if (typeof key === 'string' && !(key in target)) {
        if (key in target.$data) {
          warnReservedPrefix(target, key);
        } else {
          warnNonPresent(target, key);
        }
      }

      return target[key];
    }
  };

  initProxy = function initProxy(vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      var options = vm.$options;
      var handlers = options.render && options.render._withStripped ? getHandler : hasHandler;
      vm._renderProxy = new Proxy(vm, handlers);
    } else {
      vm._renderProxy = vm;
    }
  };
}
/*  */


var sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};

function proxy(target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter() {
    return this[sourceKey][key];
  };

  sharedPropertyDefinition.set = function proxySetter(val) {
    this[sourceKey][key] = val;
  };

  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function initState(vm) {
  vm._watchers = [];
  var opts = vm.$options;

  if (opts.props) {
    initProps(vm, opts.props);
  }

  if (opts.methods) {
    initMethods(vm, opts.methods);
  }

  if (opts.data) {
    initData(vm);
  } else {
    observe(vm._data = {}, true
    /* asRootData */
    );
  }

  if (opts.computed) {
    initComputed(vm, opts.computed);
  }

  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch);
  }
}

function initProps(vm, propsOptions) {
  var propsData = vm.$options.propsData || {};
  var props = vm._props = {}; // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.

  var keys = vm.$options._propKeys = [];
  var isRoot = !vm.$parent; // root instance props should be converted

  if (!isRoot) {
    toggleObserving(false);
  }

  var loop = function (key) {
    keys.push(key);
    var value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */

    if (true) {
      var hyphenatedKey = hyphenate(key);

      if (isReservedAttribute(hyphenatedKey) || config.isReservedAttr(hyphenatedKey)) {
        warn("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop.", vm);
      }

      defineReactive(props, key, value, function () {
        if (!isRoot && !isUpdatingChildComponent) {
          warn("Avoid mutating a prop directly since the value will be " + "overwritten whenever the parent component re-renders. " + "Instead, use a data or computed property based on the prop's " + "value. Prop being mutated: \"" + key + "\"", vm);
        }
      });
    } else {} // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.


    if (!(key in vm)) {
      proxy(vm, "_props", key);
    }
  };

  for (var key in propsOptions) loop(key);

  toggleObserving(true);
}

function initData(vm) {
  var data = vm.$options.data;
  data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {};

  if (!isPlainObject(data)) {
    data = {};
     true && warn('data functions should return an object:\n' + 'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function', vm);
  } // proxy data on instance


  var keys = Object.keys(data);
  var props = vm.$options.props;
  var methods = vm.$options.methods;
  var i = keys.length;

  while (i--) {
    var key = keys[i];

    if (true) {
      if (methods && hasOwn(methods, key)) {
        warn("Method \"" + key + "\" has already been defined as a data property.", vm);
      }
    }

    if (props && hasOwn(props, key)) {
       true && warn("The data property \"" + key + "\" is already declared as a prop. " + "Use prop default value instead.", vm);
    } else if (!isReserved(key)) {
      proxy(vm, "_data", key);
    }
  } // observe data


  observe(data, true
  /* asRootData */
  );
}

function getData(data, vm) {
  // #7573 disable dep collection when invoking data getters
  pushTarget();

  try {
    return data.call(vm, vm);
  } catch (e) {
    handleError(e, vm, "data()");
    return {};
  } finally {
    popTarget();
  }
}

var computedWatcherOptions = {
  lazy: true
};

function initComputed(vm, computed) {
  // $flow-disable-line
  var watchers = vm._computedWatchers = Object.create(null);

  for (var key in computed) {
    var userDef = computed[key];
    var getter = typeof userDef === 'function' ? userDef : userDef.get;

    if ( true && getter == null) {
      warn("Getter is missing for computed property \"" + key + "\".", vm);
    }

    {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions);
    } // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.

    if (!(key in vm)) {
      defineComputed(vm, key, userDef);
    } else if (true) {
      if (key in vm.$data) {
        warn("The computed property \"" + key + "\" is already defined in data.", vm);
      } else if (vm.$options.props && key in vm.$options.props) {
        warn("The computed property \"" + key + "\" is already defined as a prop.", vm);
      }
    }
  }
}

function defineComputed(target, key, userDef) {
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key);
    sharedPropertyDefinition.set = noop;
  } else {
    sharedPropertyDefinition.get = userDef.get ? userDef.cache !== false ? createComputedGetter(key) : createGetterInvoker(userDef.get) : noop;
    sharedPropertyDefinition.set = userDef.set || noop;
  }

  if ( true && sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn("Computed property \"" + key + "\" was assigned to but it has no setter.", this);
    };
  }

  Object.defineProperty(target, key, sharedPropertyDefinition);
}

function createComputedGetter(key) {
  return function computedGetter() {
    var watcher = this._computedWatchers && this._computedWatchers[key];

    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }

      if (Dep.target) {
        watcher.depend();
      }

      return watcher.value;
    }
  };
}

function createGetterInvoker(fn) {
  return function computedGetter() {
    return fn.call(this, this);
  };
}

function initMethods(vm, methods) {
  var props = vm.$options.props;

  for (var key in methods) {
    if (true) {
      if (typeof methods[key] !== 'function') {
        warn("Method \"" + key + "\" has type \"" + typeof methods[key] + "\" in the component definition. " + "Did you reference the function correctly?", vm);
      }

      if (props && hasOwn(props, key)) {
        warn("Method \"" + key + "\" has already been defined as a prop.", vm);
      }

      if (key in vm && isReserved(key)) {
        warn("Method \"" + key + "\" conflicts with an existing Vue instance method. " + "Avoid defining component methods that start with _ or $.");
      }
    }

    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
  }
}

function initWatch(vm, watch) {
  for (var key in watch) {
    var handler = watch[key];

    if (Array.isArray(handler)) {
      for (var i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i]);
      }
    } else {
      createWatcher(vm, key, handler);
    }
  }
}

function createWatcher(vm, expOrFn, handler, options) {
  if (isPlainObject(handler)) {
    options = handler;
    handler = handler.handler;
  }

  if (typeof handler === 'string') {
    handler = vm[handler];
  }

  return vm.$watch(expOrFn, handler, options);
}

function stateMixin(Vue) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  var dataDef = {};

  dataDef.get = function () {
    return this._data;
  };

  var propsDef = {};

  propsDef.get = function () {
    return this._props;
  };

  if (true) {
    dataDef.set = function () {
      warn('Avoid replacing instance root $data. ' + 'Use nested data properties instead.', this);
    };

    propsDef.set = function () {
      warn("$props is readonly.", this);
    };
  }

  Object.defineProperty(Vue.prototype, '$data', dataDef);
  Object.defineProperty(Vue.prototype, '$props', propsDef);
  Vue.prototype.$set = set;
  Vue.prototype.$delete = del;

  Vue.prototype.$watch = function (expOrFn, cb, options) {
    var vm = this;

    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options);
    }

    options = options || {};
    options.user = true;
    var watcher = new Watcher(vm, expOrFn, cb, options);

    if (options.immediate) {
      try {
        cb.call(vm, watcher.value);
      } catch (error) {
        handleError(error, vm, "callback for immediate watcher \"" + watcher.expression + "\"");
      }
    }

    return function unwatchFn() {
      watcher.teardown();
    };
  };
}
/*  */


function initProvide(vm) {
  var provide = vm.$options.provide;

  if (provide) {
    vm._provided = typeof provide === 'function' ? provide.call(vm) : provide;
  }
}

function initInjections(vm) {
  var result = resolveInject(vm.$options.inject, vm);

  if (result) {
    toggleObserving(false);
    Object.keys(result).forEach(function (key) {
      /* istanbul ignore else */
      if (true) {
        defineReactive(vm, key, result[key], function () {
          warn("Avoid mutating an injected value directly since the changes will be " + "overwritten whenever the provided component re-renders. " + "injection being mutated: \"" + key + "\"", vm);
        });
      } else {}
    });
    toggleObserving(true);
  }
}

function resolveInject(inject, vm) {
  if (inject) {
    // inject is :any because flow is not smart enough to figure out cached
    var result = Object.create(null);
    var keys = hasSymbol ? Reflect.ownKeys(inject) : Object.keys(inject);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i]; // #6574 in case the inject object is observed...

      if (key === '__ob__') {
        continue;
      }

      var provideKey = inject[key].from;
      var source = vm;

      while (source) {
        if (source._provided && hasOwn(source._provided, provideKey)) {
          result[key] = source._provided[provideKey];
          break;
        }

        source = source.$parent;
      }

      if (!source) {
        if ('default' in inject[key]) {
          var provideDefault = inject[key].default;
          result[key] = typeof provideDefault === 'function' ? provideDefault.call(vm) : provideDefault;
        } else if (true) {
          warn("Injection \"" + key + "\" not found", vm);
        }
      }
    }

    return result;
  }
}
/*  */


var uid$2 = 0;

function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    var vm = this; // a uid

    vm._uid = uid$2++;
    var startTag, endTag;
    /* istanbul ignore if */

    if ( true && config.performance && mark) {
      startTag = "vue-perf-start:" + vm._uid;
      endTag = "vue-perf-end:" + vm._uid;
      mark(startTag);
    } // a flag to avoid this being observed


    vm._isVue = true; // merge options

    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options);
    } else {
      vm.$options = mergeOptions(resolveConstructorOptions(vm.constructor), options || {}, vm);
    }
    /* istanbul ignore else */


    if (true) {
      initProxy(vm);
    } else {} // expose real self


    vm._self = vm;
    initLifecycle(vm);
    initEvents(vm);
    initRender(vm);
    callHook(vm, 'beforeCreate');
    initInjections(vm); // resolve injections before data/props

    initState(vm);
    initProvide(vm); // resolve provide after data/props

    callHook(vm, 'created');
    /* istanbul ignore if */

    if ( true && config.performance && mark) {
      vm._name = formatComponentName(vm, false);
      mark(endTag);
      measure("vue " + vm._name + " init", startTag, endTag);
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
  };
}

function initInternalComponent(vm, options) {
  var opts = vm.$options = Object.create(vm.constructor.options); // doing this because it's faster than dynamic enumeration.

  var parentVnode = options._parentVnode;
  opts.parent = options.parent;
  opts._parentVnode = parentVnode;
  var vnodeComponentOptions = parentVnode.componentOptions;
  opts.propsData = vnodeComponentOptions.propsData;
  opts._parentListeners = vnodeComponentOptions.listeners;
  opts._renderChildren = vnodeComponentOptions.children;
  opts._componentTag = vnodeComponentOptions.tag;

  if (options.render) {
    opts.render = options.render;
    opts.staticRenderFns = options.staticRenderFns;
  }
}

function resolveConstructorOptions(Ctor) {
  var options = Ctor.options;

  if (Ctor.super) {
    var superOptions = resolveConstructorOptions(Ctor.super);
    var cachedSuperOptions = Ctor.superOptions;

    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions; // check if there are any late-modified/attached options (#4976)

      var modifiedOptions = resolveModifiedOptions(Ctor); // update base extend options

      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions);
      }

      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);

      if (options.name) {
        options.components[options.name] = Ctor;
      }
    }
  }

  return options;
}

function resolveModifiedOptions(Ctor) {
  var modified;
  var latest = Ctor.options;
  var sealed = Ctor.sealedOptions;

  for (var key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) {
        modified = {};
      }

      modified[key] = latest[key];
    }
  }

  return modified;
}
/*  */

/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */


function resolveSlots(children, context) {
  if (!children || !children.length) {
    return {};
  }

  var slots = {};

  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i];
    var data = child.data; // remove slot attribute if the node is resolved as a Vue slot node

    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot;
    } // named slots should only be respected if the vnode was rendered in the
    // same context.


    if ((child.context === context || child.fnContext === context) && data && data.slot != null) {
      var name = data.slot;
      var slot = slots[name] || (slots[name] = []);

      if (child.tag === 'template') {
        slot.push.apply(slot, child.children || []);
      } else {
        slot.push(child);
      }
    } else {
      (slots.default || (slots.default = [])).push(child);
    }
  } // ignore slots that contains only whitespace


  for (var name$1 in slots) {
    if (slots[name$1].every(isWhitespace)) {
      delete slots[name$1];
    }
  }

  return slots;
}

function isWhitespace(node) {
  return node.isComment && !node.asyncFactory || node.text === ' ';
}
/*  */


function normalizeScopedSlots(slots, normalSlots, prevSlots) {
  var res;
  var hasNormalSlots = Object.keys(normalSlots).length > 0;
  var isStable = slots ? !!slots.$stable : !hasNormalSlots;
  var key = slots && slots.$key;

  if (!slots) {
    res = {};
  } else if (slots._normalized) {
    // fast path 1: child component re-render only, parent did not change
    return slots._normalized;
  } else if (isStable && prevSlots && prevSlots !== emptyObject && key === prevSlots.$key && !hasNormalSlots && !prevSlots.$hasNormal) {
    // fast path 2: stable scoped slots w/ no normal slots to proxy,
    // only need to normalize once
    return prevSlots;
  } else {
    res = {};

    for (var key$1 in slots) {
      if (slots[key$1] && key$1[0] !== '$') {
        res[key$1] = normalizeScopedSlot(normalSlots, key$1, slots[key$1]);
      }
    }
  } // expose normal slots on scopedSlots


  for (var key$2 in normalSlots) {
    if (!(key$2 in res)) {
      res[key$2] = proxyNormalSlot(normalSlots, key$2);
    }
  } // avoriaz seems to mock a non-extensible $scopedSlots object
  // and when that is passed down this would cause an error


  if (slots && Object.isExtensible(slots)) {
    slots._normalized = res;
  }

  def(res, '$stable', isStable);
  def(res, '$key', key);
  def(res, '$hasNormal', hasNormalSlots);
  return res;
}

function normalizeScopedSlot(normalSlots, key, fn) {
  var normalized = function () {
    var res = arguments.length ? fn.apply(null, arguments) : fn({});
    res = res && typeof res === 'object' && !Array.isArray(res) ? [res] // single vnode
    : normalizeChildren(res);
    return res && (res.length === 0 || res.length === 1 && res[0].isComment // #9658
    ) ? undefined : res;
  }; // this is a slot using the new v-slot syntax without scope. although it is
  // compiled as a scoped slot, render fn users would expect it to be present
  // on this.$slots because the usage is semantically a normal slot.


  if (fn.proxy) {
    Object.defineProperty(normalSlots, key, {
      get: normalized,
      enumerable: true,
      configurable: true
    });
  }

  return normalized;
}

function proxyNormalSlot(slots, key) {
  return function () {
    return slots[key];
  };
}
/*  */

/**
 * Runtime helper for rendering v-for lists.
 */


function renderList(val, render) {
  var ret, i, l, keys, key;

  if (Array.isArray(val) || typeof val === 'string') {
    ret = new Array(val.length);

    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i);
    }
  } else if (typeof val === 'number') {
    ret = new Array(val);

    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i);
    }
  } else if (isObject(val)) {
    if (hasSymbol && val[Symbol.iterator]) {
      ret = [];
      var iterator = val[Symbol.iterator]();
      var result = iterator.next();

      while (!result.done) {
        ret.push(render(result.value, ret.length));
        result = iterator.next();
      }
    } else {
      keys = Object.keys(val);
      ret = new Array(keys.length);

      for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];
        ret[i] = render(val[key], key, i);
      }
    }
  }

  if (!isDef(ret)) {
    ret = [];
  }

  ret._isVList = true;
  return ret;
}
/*  */

/**
 * Runtime helper for rendering <slot>
 */


function renderSlot(name, fallback, props, bindObject) {
  var scopedSlotFn = this.$scopedSlots[name];
  var nodes;

  if (scopedSlotFn) {
    // scoped slot
    props = props || {};

    if (bindObject) {
      if ( true && !isObject(bindObject)) {
        warn('slot v-bind without argument expects an Object', this);
      }

      props = extend(extend({}, bindObject), props);
    }

    nodes = scopedSlotFn(props) || fallback;
  } else {
    nodes = this.$slots[name] || fallback;
  }

  var target = props && props.slot;

  if (target) {
    return this.$createElement('template', {
      slot: target
    }, nodes);
  } else {
    return nodes;
  }
}
/*  */

/**
 * Runtime helper for resolving filters
 */


function resolveFilter(id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity;
}
/*  */


function isKeyNotMatch(expect, actual) {
  if (Array.isArray(expect)) {
    return expect.indexOf(actual) === -1;
  } else {
    return expect !== actual;
  }
}
/**
 * Runtime helper for checking keyCodes from config.
 * exposed as Vue.prototype._k
 * passing in eventKeyName as last argument separately for backwards compat
 */


function checkKeyCodes(eventKeyCode, key, builtInKeyCode, eventKeyName, builtInKeyName) {
  var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;

  if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
    return isKeyNotMatch(builtInKeyName, eventKeyName);
  } else if (mappedKeyCode) {
    return isKeyNotMatch(mappedKeyCode, eventKeyCode);
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key;
  }
}
/*  */

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */


function bindObjectProps(data, tag, value, asProp, isSync) {
  if (value) {
    if (!isObject(value)) {
       true && warn('v-bind without argument expects an Object or Array value', this);
    } else {
      if (Array.isArray(value)) {
        value = toObject(value);
      }

      var hash;

      var loop = function (key) {
        if (key === 'class' || key === 'style' || isReservedAttribute(key)) {
          hash = data;
        } else {
          var type = data.attrs && data.attrs.type;
          hash = asProp || config.mustUseProp(tag, type, key) ? data.domProps || (data.domProps = {}) : data.attrs || (data.attrs = {});
        }

        var camelizedKey = camelize(key);
        var hyphenatedKey = hyphenate(key);

        if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
          hash[key] = value[key];

          if (isSync) {
            var on = data.on || (data.on = {});

            on["update:" + key] = function ($event) {
              value[key] = $event;
            };
          }
        }
      };

      for (var key in value) loop(key);
    }
  }

  return data;
}
/*  */

/**
 * Runtime helper for rendering static trees.
 */


function renderStatic(index, isInFor) {
  var cached = this._staticTrees || (this._staticTrees = []);
  var tree = cached[index]; // if has already-rendered static tree and not inside v-for,
  // we can reuse the same tree.

  if (tree && !isInFor) {
    return tree;
  } // otherwise, render a fresh tree.


  tree = cached[index] = this.$options.staticRenderFns[index].call(this._renderProxy, null, this // for render fns generated for functional component templates
  );
  markStatic(tree, "__static__" + index, false);
  return tree;
}
/**
 * Runtime helper for v-once.
 * Effectively it means marking the node as static with a unique key.
 */


function markOnce(tree, index, key) {
  markStatic(tree, "__once__" + index + (key ? "_" + key : ""), true);
  return tree;
}

function markStatic(tree, key, isOnce) {
  if (Array.isArray(tree)) {
    for (var i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], key + "_" + i, isOnce);
      }
    }
  } else {
    markStaticNode(tree, key, isOnce);
  }
}

function markStaticNode(node, key, isOnce) {
  node.isStatic = true;
  node.key = key;
  node.isOnce = isOnce;
}
/*  */


function bindObjectListeners(data, value) {
  if (value) {
    if (!isPlainObject(value)) {
       true && warn('v-on without argument expects an Object value', this);
    } else {
      var on = data.on = data.on ? extend({}, data.on) : {};

      for (var key in value) {
        var existing = on[key];
        var ours = value[key];
        on[key] = existing ? [].concat(existing, ours) : ours;
      }
    }
  }

  return data;
}
/*  */


function resolveScopedSlots(fns, // see flow/vnode
res, // the following are added in 2.6
hasDynamicKeys, contentHashKey) {
  res = res || {
    $stable: !hasDynamicKeys
  };

  for (var i = 0; i < fns.length; i++) {
    var slot = fns[i];

    if (Array.isArray(slot)) {
      resolveScopedSlots(slot, res, hasDynamicKeys);
    } else if (slot) {
      // marker for reverse proxying v-slot without scope on this.$slots
      if (slot.proxy) {
        slot.fn.proxy = true;
      }

      res[slot.key] = slot.fn;
    }
  }

  if (contentHashKey) {
    res.$key = contentHashKey;
  }

  return res;
}
/*  */


function bindDynamicKeys(baseObj, values) {
  for (var i = 0; i < values.length; i += 2) {
    var key = values[i];

    if (typeof key === 'string' && key) {
      baseObj[values[i]] = values[i + 1];
    } else if ( true && key !== '' && key !== null) {
      // null is a special value for explicitly removing a binding
      warn("Invalid value for dynamic directive argument (expected string or null): " + key, this);
    }
  }

  return baseObj;
} // helper to dynamically append modifier runtime markers to event names.
// ensure only append when value is already string, otherwise it will be cast
// to string and cause the type check to miss.


function prependModifier(value, symbol) {
  return typeof value === 'string' ? symbol + value : value;
}
/*  */


function installRenderHelpers(target) {
  target._o = markOnce;
  target._n = toNumber;
  target._s = toString;
  target._l = renderList;
  target._t = renderSlot;
  target._q = looseEqual;
  target._i = looseIndexOf;
  target._m = renderStatic;
  target._f = resolveFilter;
  target._k = checkKeyCodes;
  target._b = bindObjectProps;
  target._v = createTextVNode;
  target._e = createEmptyVNode;
  target._u = resolveScopedSlots;
  target._g = bindObjectListeners;
  target._d = bindDynamicKeys;
  target._p = prependModifier;
}
/*  */


function FunctionalRenderContext(data, props, children, parent, Ctor) {
  var this$1 = this;
  var options = Ctor.options; // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check

  var contextVm;

  if (hasOwn(parent, '_uid')) {
    contextVm = Object.create(parent); // $flow-disable-line

    contextVm._original = parent;
  } else {
    // the context vm passed in is a functional context as well.
    // in this case we want to make sure we are able to get a hold to the
    // real context instance.
    contextVm = parent; // $flow-disable-line

    parent = parent._original;
  }

  var isCompiled = isTrue(options._compiled);
  var needNormalization = !isCompiled;
  this.data = data;
  this.props = props;
  this.children = children;
  this.parent = parent;
  this.listeners = data.on || emptyObject;
  this.injections = resolveInject(options.inject, parent);

  this.slots = function () {
    if (!this$1.$slots) {
      normalizeScopedSlots(data.scopedSlots, this$1.$slots = resolveSlots(children, parent));
    }

    return this$1.$slots;
  };

  Object.defineProperty(this, 'scopedSlots', {
    enumerable: true,
    get: function get() {
      return normalizeScopedSlots(data.scopedSlots, this.slots());
    }
  }); // support for compiled functional template

  if (isCompiled) {
    // exposing $options for renderStatic()
    this.$options = options; // pre-resolve slots for renderSlot()

    this.$slots = this.slots();
    this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
  }

  if (options._scopeId) {
    this._c = function (a, b, c, d) {
      var vnode = createElement(contextVm, a, b, c, d, needNormalization);

      if (vnode && !Array.isArray(vnode)) {
        vnode.fnScopeId = options._scopeId;
        vnode.fnContext = parent;
      }

      return vnode;
    };
  } else {
    this._c = function (a, b, c, d) {
      return createElement(contextVm, a, b, c, d, needNormalization);
    };
  }
}

installRenderHelpers(FunctionalRenderContext.prototype);

function createFunctionalComponent(Ctor, propsData, data, contextVm, children) {
  var options = Ctor.options;
  var props = {};
  var propOptions = options.props;

  if (isDef(propOptions)) {
    for (var key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject);
    }
  } else {
    if (isDef(data.attrs)) {
      mergeProps(props, data.attrs);
    }

    if (isDef(data.props)) {
      mergeProps(props, data.props);
    }
  }

  var renderContext = new FunctionalRenderContext(data, props, children, contextVm, Ctor);
  var vnode = options.render.call(null, renderContext._c, renderContext);

  if (vnode instanceof VNode) {
    return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext);
  } else if (Array.isArray(vnode)) {
    var vnodes = normalizeChildren(vnode) || [];
    var res = new Array(vnodes.length);

    for (var i = 0; i < vnodes.length; i++) {
      res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
    }

    return res;
  }
}

function cloneAndMarkFunctionalResult(vnode, data, contextVm, options, renderContext) {
  // #7817 clone node before setting fnContext, otherwise if the node is reused
  // (e.g. it was from a cached normal slot) the fnContext causes named slots
  // that should not be matched to match.
  var clone = cloneVNode(vnode);
  clone.fnContext = contextVm;
  clone.fnOptions = options;

  if (true) {
    (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
  }

  if (data.slot) {
    (clone.data || (clone.data = {})).slot = data.slot;
  }

  return clone;
}

function mergeProps(to, from) {
  for (var key in from) {
    to[camelize(key)] = from[key];
  }
}
/*  */
// inline hooks to be invoked on component VNodes during patch


var componentVNodeHooks = {
  init: function init(vnode, hydrating) {
    if (vnode.componentInstance && !vnode.componentInstance._isDestroyed && vnode.data.keepAlive) {
      // kept-alive components, treat as a patch
      var mountedNode = vnode; // work around flow

      componentVNodeHooks.prepatch(mountedNode, mountedNode);
    } else {
      var child = vnode.componentInstance = createComponentInstanceForVnode(vnode, activeInstance);
      child.$mount(hydrating ? vnode.elm : undefined, hydrating);
    }
  },
  prepatch: function prepatch(oldVnode, vnode) {
    var options = vnode.componentOptions;
    var child = vnode.componentInstance = oldVnode.componentInstance;
    updateChildComponent(child, options.propsData, // updated props
    options.listeners, // updated listeners
    vnode, // new parent vnode
    options.children // new children
    );
  },
  insert: function insert(vnode) {
    var context = vnode.context;
    var componentInstance = vnode.componentInstance;

    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true;
      callHook(componentInstance, 'mounted');
    }

    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance);
      } else {
        activateChildComponent(componentInstance, true
        /* direct */
        );
      }
    }
  },
  destroy: function destroy(vnode) {
    var componentInstance = vnode.componentInstance;

    if (!componentInstance._isDestroyed) {
      if (!vnode.data.keepAlive) {
        componentInstance.$destroy();
      } else {
        deactivateChildComponent(componentInstance, true
        /* direct */
        );
      }
    }
  }
};
var hooksToMerge = Object.keys(componentVNodeHooks);

function createComponent(Ctor, data, context, children, tag) {
  if (isUndef(Ctor)) {
    return;
  }

  var baseCtor = context.$options._base; // plain options object: turn it into a constructor

  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor);
  } // if at this stage it's not a constructor or an async component factory,
  // reject.


  if (typeof Ctor !== 'function') {
    if (true) {
      warn("Invalid Component definition: " + String(Ctor), context);
    }

    return;
  } // async component


  var asyncFactory;

  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor;
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor);

    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(asyncFactory, data, context, children, tag);
    }
  }

  data = data || {}; // resolve constructor options in case global mixins are applied after
  // component constructor creation

  resolveConstructorOptions(Ctor); // transform component v-model data into props & events

  if (isDef(data.model)) {
    transformModel(Ctor.options, data);
  } // extract props


  var propsData = extractPropsFromVNodeData(data, Ctor, tag); // functional component

  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children);
  } // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners


  var listeners = data.on; // replace with listeners with .native modifier
  // so it gets processed during parent component patch.

  data.on = data.nativeOn;

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot
    // work around flow
    var slot = data.slot;
    data = {};

    if (slot) {
      data.slot = slot;
    }
  } // install component management hooks onto the placeholder node


  installComponentHooks(data); // return a placeholder vnode

  var name = Ctor.options.name || tag;
  var vnode = new VNode("vue-component-" + Ctor.cid + (name ? "-" + name : ''), data, undefined, undefined, undefined, context, {
    Ctor: Ctor,
    propsData: propsData,
    listeners: listeners,
    tag: tag,
    children: children
  }, asyncFactory);
  return vnode;
}

function createComponentInstanceForVnode(vnode, // we know it's MountedComponentVNode but flow doesn't
parent // activeInstance in lifecycle state
) {
  var options = {
    _isComponent: true,
    _parentVnode: vnode,
    parent: parent
  }; // check inline-template render functions

  var inlineTemplate = vnode.data.inlineTemplate;

  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render;
    options.staticRenderFns = inlineTemplate.staticRenderFns;
  }

  return new vnode.componentOptions.Ctor(options);
}

function installComponentHooks(data) {
  var hooks = data.hook || (data.hook = {});

  for (var i = 0; i < hooksToMerge.length; i++) {
    var key = hooksToMerge[i];
    var existing = hooks[key];
    var toMerge = componentVNodeHooks[key];

    if (existing !== toMerge && !(existing && existing._merged)) {
      hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
    }
  }
}

function mergeHook$1(f1, f2) {
  var merged = function (a, b) {
    // flow complains about extra args which is why we use any
    f1(a, b);
    f2(a, b);
  };

  merged._merged = true;
  return merged;
} // transform component v-model info (value and callback) into
// prop and event handler respectively.


function transformModel(options, data) {
  var prop = options.model && options.model.prop || 'value';
  var event = options.model && options.model.event || 'input';
  (data.attrs || (data.attrs = {}))[prop] = data.model.value;
  var on = data.on || (data.on = {});
  var existing = on[event];
  var callback = data.model.callback;

  if (isDef(existing)) {
    if (Array.isArray(existing) ? existing.indexOf(callback) === -1 : existing !== callback) {
      on[event] = [callback].concat(existing);
    }
  } else {
    on[event] = callback;
  }
}
/*  */


var SIMPLE_NORMALIZE = 1;
var ALWAYS_NORMALIZE = 2; // wrapper function for providing a more flexible interface
// without getting yelled at by flow

function createElement(context, tag, data, children, normalizationType, alwaysNormalize) {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children;
    children = data;
    data = undefined;
  }

  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE;
  }

  return _createElement(context, tag, data, children, normalizationType);
}

function _createElement(context, tag, data, children, normalizationType) {
  if (isDef(data) && isDef(data.__ob__)) {
     true && warn("Avoid using observed data object as vnode data: " + JSON.stringify(data) + "\n" + 'Always create fresh vnode data objects in each render!', context);
    return createEmptyVNode();
  } // object syntax in v-bind


  if (isDef(data) && isDef(data.is)) {
    tag = data.is;
  }

  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode();
  } // warn against non-primitive key


  if ( true && isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
    {
      warn('Avoid using non-primitive value as key, ' + 'use string/number value instead.', context);
    }
  } // support single function children as default scoped slot


  if (Array.isArray(children) && typeof children[0] === 'function') {
    data = data || {};
    data.scopedSlots = {
      default: children[0]
    };
    children.length = 0;
  }

  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children);
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children);
  }

  var vnode, ns;

  if (typeof tag === 'string') {
    var Ctor;
    ns = context.$vnode && context.$vnode.ns || config.getTagNamespace(tag);

    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if ( true && isDef(data) && isDef(data.nativeOn)) {
        warn("The .native modifier for v-on is only valid on components but it was used on <" + tag + ">.", context);
      }

      vnode = new VNode(config.parsePlatformTagName(tag), data, children, undefined, undefined, context);
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag);
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(tag, data, children, undefined, undefined, context);
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children);
  }

  if (Array.isArray(vnode)) {
    return vnode;
  } else if (isDef(vnode)) {
    if (isDef(ns)) {
      applyNS(vnode, ns);
    }

    if (isDef(data)) {
      registerDeepBindings(data);
    }

    return vnode;
  } else {
    return createEmptyVNode();
  }
}

function applyNS(vnode, ns, force) {
  vnode.ns = ns;

  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined;
    force = true;
  }

  if (isDef(vnode.children)) {
    for (var i = 0, l = vnode.children.length; i < l; i++) {
      var child = vnode.children[i];

      if (isDef(child.tag) && (isUndef(child.ns) || isTrue(force) && child.tag !== 'svg')) {
        applyNS(child, ns, force);
      }
    }
  }
} // ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes


function registerDeepBindings(data) {
  if (isObject(data.style)) {
    traverse(data.style);
  }

  if (isObject(data.class)) {
    traverse(data.class);
  }
}
/*  */


function initRender(vm) {
  vm._vnode = null; // the root of the child tree

  vm._staticTrees = null; // v-once cached trees

  var options = vm.$options;
  var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree

  var renderContext = parentVnode && parentVnode.context;
  vm.$slots = resolveSlots(options._renderChildren, renderContext);
  vm.$scopedSlots = emptyObject; // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates

  vm._c = function (a, b, c, d) {
    return createElement(vm, a, b, c, d, false);
  }; // normalization is always applied for the public version, used in
  // user-written render functions.


  vm.$createElement = function (a, b, c, d) {
    return createElement(vm, a, b, c, d, true);
  }; // $attrs & $listeners are exposed for easier HOC creation.
  // they need to be reactive so that HOCs using them are always updated


  var parentData = parentVnode && parentVnode.data;
  /* istanbul ignore else */

  if (true) {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
      !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
    }, true);
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, function () {
      !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
    }, true);
  } else {}
}

var currentRenderingInstance = null;

function renderMixin(Vue) {
  // install runtime convenience helpers
  installRenderHelpers(Vue.prototype);

  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this);
  };

  Vue.prototype._render = function () {
    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var _parentVnode = ref._parentVnode;

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(_parentVnode.data.scopedSlots, vm.$slots, vm.$scopedSlots);
    } // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.


    vm.$vnode = _parentVnode; // render self

    var vnode;

    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm;
      vnode = render.call(vm._renderProxy, vm.$createElement);
    } catch (e) {
      handleError(e, vm, "render"); // return error render result,
      // or previous vnode to prevent render error causing blank component

      /* istanbul ignore else */

      if ( true && vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
        } catch (e$1) {
          handleError(e$1, vm, "renderError");
          vnode = vm._vnode;
        }
      } else {
        vnode = vm._vnode;
      }
    } finally {
      currentRenderingInstance = null;
    } // if the returned array contains only a single node, allow it


    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0];
    } // return empty vnode in case the render function errored out


    if (!(vnode instanceof VNode)) {
      if ( true && Array.isArray(vnode)) {
        warn('Multiple root nodes returned from render function. Render function ' + 'should return a single root node.', vm);
      }

      vnode = createEmptyVNode();
    } // set parent


    vnode.parent = _parentVnode;
    return vnode;
  };
}
/*  */


function ensureCtor(comp, base) {
  if (comp.__esModule || hasSymbol && comp[Symbol.toStringTag] === 'Module') {
    comp = comp.default;
  }

  return isObject(comp) ? base.extend(comp) : comp;
}

function createAsyncPlaceholder(factory, data, context, children, tag) {
  var node = createEmptyVNode();
  node.asyncFactory = factory;
  node.asyncMeta = {
    data: data,
    context: context,
    children: children,
    tag: tag
  };
  return node;
}

function resolveAsyncComponent(factory, baseCtor) {
  if (isTrue(factory.error) && isDef(factory.errorComp)) {
    return factory.errorComp;
  }

  if (isDef(factory.resolved)) {
    return factory.resolved;
  }

  var owner = currentRenderingInstance;

  if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
    // already pending
    factory.owners.push(owner);
  }

  if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
    return factory.loadingComp;
  }

  if (owner && !isDef(factory.owners)) {
    var owners = factory.owners = [owner];
    var sync = true;
    var timerLoading = null;
    var timerTimeout = null;
    owner.$on('hook:destroyed', function () {
      return remove(owners, owner);
    });

    var forceRender = function (renderCompleted) {
      for (var i = 0, l = owners.length; i < l; i++) {
        owners[i].$forceUpdate();
      }

      if (renderCompleted) {
        owners.length = 0;

        if (timerLoading !== null) {
          clearTimeout(timerLoading);
          timerLoading = null;
        }

        if (timerTimeout !== null) {
          clearTimeout(timerTimeout);
          timerTimeout = null;
        }
      }
    };

    var resolve = once(function (res) {
      // cache resolved
      factory.resolved = ensureCtor(res, baseCtor); // invoke callbacks only if this is not a synchronous resolve
      // (async resolves are shimmed as synchronous during SSR)

      if (!sync) {
        forceRender(true);
      } else {
        owners.length = 0;
      }
    });
    var reject = once(function (reason) {
       true && warn("Failed to resolve async component: " + String(factory) + (reason ? "\nReason: " + reason : ''));

      if (isDef(factory.errorComp)) {
        factory.error = true;
        forceRender(true);
      }
    });
    var res = factory(resolve, reject);

    if (isObject(res)) {
      if (isPromise(res)) {
        // () => Promise
        if (isUndef(factory.resolved)) {
          res.then(resolve, reject);
        }
      } else if (isPromise(res.component)) {
        res.component.then(resolve, reject);

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor);
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor);

          if (res.delay === 0) {
            factory.loading = true;
          } else {
            timerLoading = setTimeout(function () {
              timerLoading = null;

              if (isUndef(factory.resolved) && isUndef(factory.error)) {
                factory.loading = true;
                forceRender(false);
              }
            }, res.delay || 200);
          }
        }

        if (isDef(res.timeout)) {
          timerTimeout = setTimeout(function () {
            timerTimeout = null;

            if (isUndef(factory.resolved)) {
              reject( true ? "timeout (" + res.timeout + "ms)" : undefined);
            }
          }, res.timeout);
        }
      }
    }

    sync = false; // return in case resolved synchronously

    return factory.loading ? factory.loadingComp : factory.resolved;
  }
}
/*  */


function isAsyncPlaceholder(node) {
  return node.isComment && node.asyncFactory;
}
/*  */


function getFirstComponentChild(children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];

      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c;
      }
    }
  }
}
/*  */


function initEvents(vm) {
  vm._events = Object.create(null);
  vm._hasHookEvent = false; // init parent attached events

  var listeners = vm.$options._parentListeners;

  if (listeners) {
    updateComponentListeners(vm, listeners);
  }
}

var target;

function add(event, fn) {
  target.$on(event, fn);
}

function remove$1(event, fn) {
  target.$off(event, fn);
}

function createOnceHandler(event, fn) {
  var _target = target;
  return function onceHandler() {
    var res = fn.apply(null, arguments);

    if (res !== null) {
      _target.$off(event, onceHandler);
    }
  };
}

function updateComponentListeners(vm, listeners, oldListeners) {
  target = vm;
  updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
  target = undefined;
}

function eventsMixin(Vue) {
  var hookRE = /^hook:/;

  Vue.prototype.$on = function (event, fn) {
    var vm = this;

    if (Array.isArray(event)) {
      for (var i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn);
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn); // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup

      if (hookRE.test(event)) {
        vm._hasHookEvent = true;
      }
    }

    return vm;
  };

  Vue.prototype.$once = function (event, fn) {
    var vm = this;

    function on() {
      vm.$off(event, on);
      fn.apply(vm, arguments);
    }

    on.fn = fn;
    vm.$on(event, on);
    return vm;
  };

  Vue.prototype.$off = function (event, fn) {
    var vm = this; // all

    if (!arguments.length) {
      vm._events = Object.create(null);
      return vm;
    } // array of events


    if (Array.isArray(event)) {
      for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
        vm.$off(event[i$1], fn);
      }

      return vm;
    } // specific event


    var cbs = vm._events[event];

    if (!cbs) {
      return vm;
    }

    if (!fn) {
      vm._events[event] = null;
      return vm;
    } // specific handler


    var cb;
    var i = cbs.length;

    while (i--) {
      cb = cbs[i];

      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1);
        break;
      }
    }

    return vm;
  };

  Vue.prototype.$emit = function (event) {
    var vm = this;

    if (true) {
      var lowerCaseEvent = event.toLowerCase();

      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip("Event \"" + lowerCaseEvent + "\" is emitted in component " + formatComponentName(vm) + " but the handler is registered for \"" + event + "\". " + "Note that HTML attributes are case-insensitive and you cannot use " + "v-on to listen to camelCase events when using in-DOM templates. " + "You should probably use \"" + hyphenate(event) + "\" instead of \"" + event + "\".");
      }
    }

    var cbs = vm._events[event];

    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs;
      var args = toArray(arguments, 1);
      var info = "event handler for \"" + event + "\"";

      for (var i = 0, l = cbs.length; i < l; i++) {
        invokeWithErrorHandling(cbs[i], vm, args, vm, info);
      }
    }

    return vm;
  };
}
/*  */


var activeInstance = null;
var isUpdatingChildComponent = false;

function setActiveInstance(vm) {
  var prevActiveInstance = activeInstance;
  activeInstance = vm;
  return function () {
    activeInstance = prevActiveInstance;
  };
}

function initLifecycle(vm) {
  var options = vm.$options; // locate first non-abstract parent

  var parent = options.parent;

  if (parent && !options.abstract) {
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent;
    }

    parent.$children.push(vm);
  }

  vm.$parent = parent;
  vm.$root = parent ? parent.$root : vm;
  vm.$children = [];
  vm.$refs = {};
  vm._watcher = null;
  vm._inactive = null;
  vm._directInactive = false;
  vm._isMounted = false;
  vm._isDestroyed = false;
  vm._isBeingDestroyed = false;
}

function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode, hydrating) {
    var vm = this;
    var prevEl = vm.$el;
    var prevVnode = vm._vnode;
    var restoreActiveInstance = setActiveInstance(vm);
    vm._vnode = vnode; // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.

    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false
      /* removeOnly */
      );
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }

    restoreActiveInstance(); // update __vue__ reference

    if (prevEl) {
      prevEl.__vue__ = null;
    }

    if (vm.$el) {
      vm.$el.__vue__ = vm;
    } // if parent is an HOC, update its $el as well


    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el;
    } // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.

  };

  Vue.prototype.$forceUpdate = function () {
    var vm = this;

    if (vm._watcher) {
      vm._watcher.update();
    }
  };

  Vue.prototype.$destroy = function () {
    var vm = this;

    if (vm._isBeingDestroyed) {
      return;
    }

    callHook(vm, 'beforeDestroy');
    vm._isBeingDestroyed = true; // remove self from parent

    var parent = vm.$parent;

    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm);
    } // teardown watchers


    if (vm._watcher) {
      vm._watcher.teardown();
    }

    var i = vm._watchers.length;

    while (i--) {
      vm._watchers[i].teardown();
    } // remove reference from data ob
    // frozen object may not have observer.


    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--;
    } // call the last hook...


    vm._isDestroyed = true; // invoke destroy hooks on current rendered tree

    vm.__patch__(vm._vnode, null); // fire destroyed hook


    callHook(vm, 'destroyed'); // turn off all instance listeners.

    vm.$off(); // remove __vue__ reference

    if (vm.$el) {
      vm.$el.__vue__ = null;
    } // release circular reference (#6759)


    if (vm.$vnode) {
      vm.$vnode.parent = null;
    }
  };
}

function mountComponent(vm, el, hydrating) {
  vm.$el = el;

  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode;

    if (true) {
      /* istanbul ignore if */
      if (vm.$options.template && vm.$options.template.charAt(0) !== '#' || vm.$options.el || el) {
        warn('You are using the runtime-only build of Vue where the template ' + 'compiler is not available. Either pre-compile the templates into ' + 'render functions, or use the compiler-included build.', vm);
      } else {
        warn('Failed to mount component: template or render function not defined.', vm);
      }
    }
  }

  callHook(vm, 'beforeMount');
  var updateComponent;
  /* istanbul ignore if */

  if ( true && config.performance && mark) {
    updateComponent = function () {
      var name = vm._name;
      var id = vm._uid;
      var startTag = "vue-perf-start:" + id;
      var endTag = "vue-perf-end:" + id;
      mark(startTag);

      var vnode = vm._render();

      mark(endTag);
      measure("vue " + name + " render", startTag, endTag);
      mark(startTag);

      vm._update(vnode, hydrating);

      mark(endTag);
      measure("vue " + name + " patch", startTag, endTag);
    };
  } else {
    updateComponent = function () {
      vm._update(vm._render(), hydrating);
    };
  } // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined


  new Watcher(vm, updateComponent, noop, {
    before: function before() {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate');
      }
    }
  }, true
  /* isRenderWatcher */
  );
  hydrating = false; // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook

  if (vm.$vnode == null) {
    vm._isMounted = true;
    callHook(vm, 'mounted');
  }

  return vm;
}

function updateChildComponent(vm, propsData, listeners, parentVnode, renderChildren) {
  if (true) {
    isUpdatingChildComponent = true;
  } // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren.
  // check if there are dynamic scopedSlots (hand-written or compiled but with
  // dynamic slot names). Static scoped slots compiled from template has the
  // "$stable" marker.


  var newScopedSlots = parentVnode.data.scopedSlots;
  var oldScopedSlots = vm.$scopedSlots;
  var hasDynamicScopedSlot = !!(newScopedSlots && !newScopedSlots.$stable || oldScopedSlots !== emptyObject && !oldScopedSlots.$stable || newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key); // Any static slot children from the parent may have changed during parent's
  // update. Dynamic scoped slots may also have changed. In such cases, a forced
  // update is necessary to ensure correctness.

  var needsForceUpdate = !!(renderChildren || // has new static slots
  vm.$options._renderChildren || // has old static slots
  hasDynamicScopedSlot);
  vm.$options._parentVnode = parentVnode;
  vm.$vnode = parentVnode; // update vm's placeholder node without re-render

  if (vm._vnode) {
    // update child tree's parent
    vm._vnode.parent = parentVnode;
  }

  vm.$options._renderChildren = renderChildren; // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render

  vm.$attrs = parentVnode.data.attrs || emptyObject;
  vm.$listeners = listeners || emptyObject; // update props

  if (propsData && vm.$options.props) {
    toggleObserving(false);
    var props = vm._props;
    var propKeys = vm.$options._propKeys || [];

    for (var i = 0; i < propKeys.length; i++) {
      var key = propKeys[i];
      var propOptions = vm.$options.props; // wtf flow?

      props[key] = validateProp(key, propOptions, propsData, vm);
    }

    toggleObserving(true); // keep a copy of raw propsData

    vm.$options.propsData = propsData;
  } // update listeners


  listeners = listeners || emptyObject;
  var oldListeners = vm.$options._parentListeners;
  vm.$options._parentListeners = listeners;
  updateComponentListeners(vm, listeners, oldListeners); // resolve slots + force update if has children

  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context);
    vm.$forceUpdate();
  }

  if (true) {
    isUpdatingChildComponent = false;
  }
}

function isInInactiveTree(vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) {
      return true;
    }
  }

  return false;
}

function activateChildComponent(vm, direct) {
  if (direct) {
    vm._directInactive = false;

    if (isInInactiveTree(vm)) {
      return;
    }
  } else if (vm._directInactive) {
    return;
  }

  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false;

    for (var i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i]);
    }

    callHook(vm, 'activated');
  }
}

function deactivateChildComponent(vm, direct) {
  if (direct) {
    vm._directInactive = true;

    if (isInInactiveTree(vm)) {
      return;
    }
  }

  if (!vm._inactive) {
    vm._inactive = true;

    for (var i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i]);
    }

    callHook(vm, 'deactivated');
  }
}

function callHook(vm, hook) {
  // #7573 disable dep collection when invoking lifecycle hooks
  pushTarget();
  var handlers = vm.$options[hook];
  var info = hook + " hook";

  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info);
    }
  }

  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook);
  }

  popTarget();
}
/*  */


var isHTMLTag = makeMap('html,body,base,head,link,meta,style,title,' + 'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' + 'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' + 'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' + 's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' + 'embed,object,param,source,canvas,script,noscript,del,ins,' + 'caption,col,colgroup,table,thead,tbody,td,th,tr,' + 'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' + 'output,progress,select,textarea,' + 'details,dialog,menu,menuitem,summary,' + 'content,element,shadow,template,blockquote,iframe,tfoot'); // this map is intentionally selective, only covering SVG elements that may
// contain child elements.

var isSVG = makeMap('svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' + 'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' + 'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view', true);
var isTextInputType = makeMap('text,number,password,search,email,tel,url');
/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)
 *
 * Not type-checking this because this file is perf-critical and the cost
 * of making flow understand it is not worth it.
 */

var emptyNode = new VNode('', {}, []);
var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

function sameVnode(a, b) {
  return a.key === b.key && (a.tag === b.tag && a.isComment === b.isComment && isDef(a.data) === isDef(b.data) && sameInputType(a, b) || isTrue(a.isAsyncPlaceholder) && a.asyncFactory === b.asyncFactory && isUndef(b.asyncFactory.error));
}

function sameInputType(a, b) {
  if (a.tag !== 'input') {
    return true;
  }

  var i;
  var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
  var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
  return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB);
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i, key;
  var map = {};

  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;

    if (isDef(key)) {
      map[key] = i;
    }
  }

  return map;
}

function createPatchFunction(backend) {
  var i, j;
  var cbs = {};
  var modules = backend.modules;
  var nodeOps = backend.nodeOps;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];

    for (j = 0; j < modules.length; ++j) {
      if (isDef(modules[j][hooks[i]])) {
        cbs[hooks[i]].push(modules[j][hooks[i]]);
      }
    }
  }

  function emptyNodeAt(elm) {
    return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm);
  }

  function createRmCb(childElm, listeners) {
    function remove() {
      if (--remove.listeners === 0) {
        removeNode(childElm);
      }
    }

    remove.listeners = listeners;
    return remove;
  }

  function removeNode(el) {
    var parent = nodeOps.parentNode(el); // element may have already been removed due to v-html / v-text

    if (isDef(parent)) {
      nodeOps.removeChild(parent, el);
    }
  }

  function isUnknownElement(vnode, inVPre) {
    return !inVPre && !vnode.ns && !(config.ignoredElements.length && config.ignoredElements.some(function (ignore) {
      return isRegExp(ignore) ? ignore.test(vnode.tag) : ignore === vnode.tag;
    })) && config.isUnknownElement(vnode.tag);
  }

  var creatingElmInVPre = 0;

  function createElm(vnode, insertedVnodeQueue, parentElm, refElm, nested, ownerArray, index) {
    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // This vnode was used in a previous render!
      // now it's used as a new node, overwriting its elm would cause
      // potential patch errors down the road when it's used as an insertion
      // reference node. Instead, we clone the node on-demand before creating
      // associated DOM element for it.
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    vnode.isRootInsert = !nested; // for transition enter check

    if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
      return;
    }

    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;

    if (isDef(tag)) {
      if (true) {
        if (data && data.pre) {
          creatingElmInVPre++;
        }

        if (isUnknownElement(vnode, creatingElmInVPre)) {
          warn('Unknown custom element: <' + tag + '> - did you ' + 'register the component correctly? For recursive components, ' + 'make sure to provide the "name" option.', vnode.context);
        }
      }

      vnode.elm = vnode.ns ? nodeOps.createElementNS(vnode.ns, tag) : nodeOps.createElement(tag, vnode);
      setScope(vnode);
      /* istanbul ignore if */

      {
        createChildren(vnode, children, insertedVnodeQueue);

        if (isDef(data)) {
          invokeCreateHooks(vnode, insertedVnodeQueue);
        }

        insert(parentElm, vnode.elm, refElm);
      }

      if ( true && data && data.pre) {
        creatingElmInVPre--;
      }
    } else if (isTrue(vnode.isComment)) {
      vnode.elm = nodeOps.createComment(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    } else {
      vnode.elm = nodeOps.createTextNode(vnode.text);
      insert(parentElm, vnode.elm, refElm);
    }
  }

  function createComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
    var i = vnode.data;

    if (isDef(i)) {
      var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;

      if (isDef(i = i.hook) && isDef(i = i.init)) {
        i(vnode, false
        /* hydrating */
        );
      } // after calling the init hook, if the vnode is a child component
      // it should've created a child instance and mounted it. the child
      // component also has set the placeholder vnode's elm.
      // in that case we can just return the element and be done.


      if (isDef(vnode.componentInstance)) {
        initComponent(vnode, insertedVnodeQueue);
        insert(parentElm, vnode.elm, refElm);

        if (isTrue(isReactivated)) {
          reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
        }

        return true;
      }
    }
  }

  function initComponent(vnode, insertedVnodeQueue) {
    if (isDef(vnode.data.pendingInsert)) {
      insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
      vnode.data.pendingInsert = null;
    }

    vnode.elm = vnode.componentInstance.$el;

    if (isPatchable(vnode)) {
      invokeCreateHooks(vnode, insertedVnodeQueue);
      setScope(vnode);
    } else {
      // empty component root.
      // skip all element-related modules except for ref (#3455)
      registerRef(vnode); // make sure to invoke the insert hook

      insertedVnodeQueue.push(vnode);
    }
  }

  function reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm) {
    var i; // hack for #4339: a reactivated component with inner transition
    // does not trigger because the inner node's created hooks are not called
    // again. It's not ideal to involve module-specific logic in here but
    // there doesn't seem to be a better way to do it.

    var innerNode = vnode;

    while (innerNode.componentInstance) {
      innerNode = innerNode.componentInstance._vnode;

      if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
        for (i = 0; i < cbs.activate.length; ++i) {
          cbs.activate[i](emptyNode, innerNode);
        }

        insertedVnodeQueue.push(innerNode);
        break;
      }
    } // unlike a newly created component,
    // a reactivated keep-alive component doesn't insert itself


    insert(parentElm, vnode.elm, refElm);
  }

  function insert(parent, elm, ref) {
    if (isDef(parent)) {
      if (isDef(ref)) {
        if (nodeOps.parentNode(ref) === parent) {
          nodeOps.insertBefore(parent, elm, ref);
        }
      } else {
        nodeOps.appendChild(parent, elm);
      }
    }
  }

  function createChildren(vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      if (true) {
        checkDuplicateKeys(children);
      }

      for (var i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
      }
    } else if (isPrimitive(vnode.text)) {
      nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
    }
  }

  function isPatchable(vnode) {
    while (vnode.componentInstance) {
      vnode = vnode.componentInstance._vnode;
    }

    return isDef(vnode.tag);
  }

  function invokeCreateHooks(vnode, insertedVnodeQueue) {
    for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
      cbs.create[i$1](emptyNode, vnode);
    }

    i = vnode.data.hook; // Reuse variable

    if (isDef(i)) {
      if (isDef(i.create)) {
        i.create(emptyNode, vnode);
      }

      if (isDef(i.insert)) {
        insertedVnodeQueue.push(vnode);
      }
    }
  } // set scope id attribute for scoped CSS.
  // this is implemented as a special case to avoid the overhead
  // of going through the normal attribute patching process.


  function setScope(vnode) {
    var i;

    if (isDef(i = vnode.fnScopeId)) {
      nodeOps.setStyleScope(vnode.elm, i);
    } else {
      var ancestor = vnode;

      while (ancestor) {
        if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
          nodeOps.setStyleScope(vnode.elm, i);
        }

        ancestor = ancestor.parent;
      }
    } // for slot content they should also get the scopeId from the host instance.


    if (isDef(i = activeInstance) && i !== vnode.context && i !== vnode.fnContext && isDef(i = i.$options._scopeId)) {
      nodeOps.setStyleScope(vnode.elm, i);
    }
  }

  function addVnodes(parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
    }
  }

  function invokeDestroyHook(vnode) {
    var i, j;
    var data = vnode.data;

    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) {
        i(vnode);
      }

      for (i = 0; i < cbs.destroy.length; ++i) {
        cbs.destroy[i](vnode);
      }
    }

    if (isDef(i = vnode.children)) {
      for (j = 0; j < vnode.children.length; ++j) {
        invokeDestroyHook(vnode.children[j]);
      }
    }
  }

  function removeVnodes(vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var ch = vnodes[startIdx];

      if (isDef(ch)) {
        if (isDef(ch.tag)) {
          removeAndInvokeRemoveHook(ch);
          invokeDestroyHook(ch);
        } else {
          // Text node
          removeNode(ch.elm);
        }
      }
    }
  }

  function removeAndInvokeRemoveHook(vnode, rm) {
    if (isDef(rm) || isDef(vnode.data)) {
      var i;
      var listeners = cbs.remove.length + 1;

      if (isDef(rm)) {
        // we have a recursively passed down rm callback
        // increase the listeners count
        rm.listeners += listeners;
      } else {
        // directly removing
        rm = createRmCb(vnode.elm, listeners);
      } // recursively invoke hooks on child component root node


      if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
        removeAndInvokeRemoveHook(i, rm);
      }

      for (i = 0; i < cbs.remove.length; ++i) {
        cbs.remove[i](vnode, rm);
      }

      if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
        i(vnode, rm);
      } else {
        rm();
      }
    } else {
      removeNode(vnode.elm);
    }
  }

  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    var oldStartIdx = 0;
    var newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, vnodeToMove, refElm; // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions

    var canMove = !removeOnly;

    if (true) {
      checkDuplicateKeys(newCh);
    }

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        }

        idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);

        if (isUndef(idxInOld)) {
          // New element
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
        } else {
          vnodeToMove = oldCh[idxInOld];

          if (sameVnode(vnodeToMove, newStartVnode)) {
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
            oldCh[idxInOld] = undefined;
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          }
        }

        newStartVnode = newCh[++newStartIdx];
      }
    }

    if (oldStartIdx > oldEndIdx) {
      refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function checkDuplicateKeys(children) {
    var seenKeys = {};

    for (var i = 0; i < children.length; i++) {
      var vnode = children[i];
      var key = vnode.key;

      if (isDef(key)) {
        if (seenKeys[key]) {
          warn("Duplicate keys detected: '" + key + "'. This may cause an update error.", vnode.context);
        } else {
          seenKeys[key] = true;
        }
      }
    }
  }

  function findIdxInOld(node, oldCh, start, end) {
    for (var i = start; i < end; i++) {
      var c = oldCh[i];

      if (isDef(c) && sameVnode(node, c)) {
        return i;
      }
    }
  }

  function patchVnode(oldVnode, vnode, insertedVnodeQueue, ownerArray, index, removeOnly) {
    if (oldVnode === vnode) {
      return;
    }

    if (isDef(vnode.elm) && isDef(ownerArray)) {
      // clone reused vnode
      vnode = ownerArray[index] = cloneVNode(vnode);
    }

    var elm = vnode.elm = oldVnode.elm;

    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
      } else {
        vnode.isAsyncPlaceholder = true;
      }

      return;
    } // reuse element for static trees.
    // note we only do this if the vnode is cloned -
    // if the new node is not cloned it means the render functions have been
    // reset by the hot-reload-api and we need to do a proper re-render.


    if (isTrue(vnode.isStatic) && isTrue(oldVnode.isStatic) && vnode.key === oldVnode.key && (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))) {
      vnode.componentInstance = oldVnode.componentInstance;
      return;
    }

    var i;
    var data = vnode.data;

    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode);
    }

    var oldCh = oldVnode.children;
    var ch = vnode.children;

    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) {
        cbs.update[i](oldVnode, vnode);
      }

      if (isDef(i = data.hook) && isDef(i = i.update)) {
        i(oldVnode, vnode);
      }
    }

    if (isUndef(vnode.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) {
          updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly);
        }
      } else if (isDef(ch)) {
        if (true) {
          checkDuplicateKeys(ch);
        }

        if (isDef(oldVnode.text)) {
          nodeOps.setTextContent(elm, '');
        }

        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text);
    }

    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) {
        i(oldVnode, vnode);
      }
    }
  }

  function invokeInsertHook(vnode, queue, initial) {
    // delay insert hooks for component root nodes, invoke them after the
    // element is really inserted
    if (isTrue(initial) && isDef(vnode.parent)) {
      vnode.parent.data.pendingInsert = queue;
    } else {
      for (var i = 0; i < queue.length; ++i) {
        queue[i].data.hook.insert(queue[i]);
      }
    }
  }

  var hydrationBailed = false; // list of modules that can skip create hook during hydration because they
  // are already rendered on the client or has no need for initialization
  // Note: style is excluded because it relies on initial clone for future
  // deep updates (#7063).

  var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key'); // Note: this is a browser-only function so we can assume elms are DOM nodes.

  function hydrate(elm, vnode, insertedVnodeQueue, inVPre) {
    var i;
    var tag = vnode.tag;
    var data = vnode.data;
    var children = vnode.children;
    inVPre = inVPre || data && data.pre;
    vnode.elm = elm;

    if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
      vnode.isAsyncPlaceholder = true;
      return true;
    } // assert node match


    if (true) {
      if (!assertNodeMatch(elm, vnode, inVPre)) {
        return false;
      }
    }

    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) {
        i(vnode, true
        /* hydrating */
        );
      }

      if (isDef(i = vnode.componentInstance)) {
        // child component. it should have hydrated its own tree.
        initComponent(vnode, insertedVnodeQueue);
        return true;
      }
    }

    if (isDef(tag)) {
      if (isDef(children)) {
        // empty element, allow client to pick up and populate children
        if (!elm.hasChildNodes()) {
          createChildren(vnode, children, insertedVnodeQueue);
        } else {
          // v-html and domProps: innerHTML
          if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
            if (i !== elm.innerHTML) {
              /* istanbul ignore if */
              if ( true && typeof console !== 'undefined' && !hydrationBailed) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('server innerHTML: ', i);
                console.warn('client innerHTML: ', elm.innerHTML);
              }

              return false;
            }
          } else {
            // iterate and compare children lists
            var childrenMatch = true;
            var childNode = elm.firstChild;

            for (var i$1 = 0; i$1 < children.length; i$1++) {
              if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                childrenMatch = false;
                break;
              }

              childNode = childNode.nextSibling;
            } // if childNode is not null, it means the actual childNodes list is
            // longer than the virtual children list.


            if (!childrenMatch || childNode) {
              /* istanbul ignore if */
              if ( true && typeof console !== 'undefined' && !hydrationBailed) {
                hydrationBailed = true;
                console.warn('Parent: ', elm);
                console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
              }

              return false;
            }
          }
        }
      }

      if (isDef(data)) {
        var fullInvoke = false;

        for (var key in data) {
          if (!isRenderedModule(key)) {
            fullInvoke = true;
            invokeCreateHooks(vnode, insertedVnodeQueue);
            break;
          }
        }

        if (!fullInvoke && data['class']) {
          // ensure collecting deps for deep class bindings for future updates
          traverse(data['class']);
        }
      }
    } else if (elm.data !== vnode.text) {
      elm.data = vnode.text;
    }

    return true;
  }

  function assertNodeMatch(node, vnode, inVPre) {
    if (isDef(vnode.tag)) {
      return vnode.tag.indexOf('vue-component') === 0 || !isUnknownElement(vnode, inVPre) && vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase());
    } else {
      return node.nodeType === (vnode.isComment ? 8 : 3);
    }
  }

  return function patch(oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) {
      if (isDef(oldVnode)) {
        invokeDestroyHook(oldVnode);
      }

      return;
    }

    var isInitialPatch = false;
    var insertedVnodeQueue = [];

    if (isUndef(oldVnode)) {
      // empty mount (likely as component), create new root element
      isInitialPatch = true;
      createElm(vnode, insertedVnodeQueue);
    } else {
      var isRealElement = isDef(oldVnode.nodeType);

      if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // patch existing root node
        patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
      } else {
        if (isRealElement) {
          // mounting to a real element
          // check if this is server-rendered content and if we can perform
          // a successful hydration.
          if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
            oldVnode.removeAttribute(SSR_ATTR);
            hydrating = true;
          }

          if (isTrue(hydrating)) {
            if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
              invokeInsertHook(vnode, insertedVnodeQueue, true);
              return oldVnode;
            } else if (true) {
              warn('The client-side rendered virtual DOM tree is not matching ' + 'server-rendered content. This is likely caused by incorrect ' + 'HTML markup, for example nesting block-level elements inside ' + '<p>, or missing <tbody>. Bailing hydration and performing ' + 'full client-side render.');
            }
          } // either not server-rendered, or hydration failed.
          // create an empty node and replace it


          oldVnode = emptyNodeAt(oldVnode);
        } // replacing existing element


        var oldElm = oldVnode.elm;
        var parentElm = nodeOps.parentNode(oldElm); // create new node

        createElm(vnode, insertedVnodeQueue, // extremely rare edge case: do not insert if old element is in a
        // leaving transition. Only happens when combining transition +
        // keep-alive + HOCs. (#4590)
        oldElm._leaveCb ? null : parentElm, nodeOps.nextSibling(oldElm)); // update parent placeholder node element, recursively

        if (isDef(vnode.parent)) {
          var ancestor = vnode.parent;
          var patchable = isPatchable(vnode);

          while (ancestor) {
            for (var i = 0; i < cbs.destroy.length; ++i) {
              cbs.destroy[i](ancestor);
            }

            ancestor.elm = vnode.elm;

            if (patchable) {
              for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                cbs.create[i$1](emptyNode, ancestor);
              } // #6513
              // invoke insert hooks that may have been merged by create hooks.
              // e.g. for directives that uses the "inserted" hook.


              var insert = ancestor.data.hook.insert;

              if (insert.merged) {
                // start at index 1 to avoid re-invoking component mounted hook
                for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                  insert.fns[i$2]();
                }
              }
            } else {
              registerRef(ancestor);
            }

            ancestor = ancestor.parent;
          }
        } // destroy old node


        if (isDef(parentElm)) {
          removeVnodes([oldVnode], 0, 0);
        } else if (isDef(oldVnode.tag)) {
          invokeDestroyHook(oldVnode);
        }
      }
    }

    invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
    return vnode.elm;
  };
}
/*  */


var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: function unbindDirectives(vnode) {
    updateDirectives(vnode, emptyNode);
  }
};

function updateDirectives(oldVnode, vnode) {
  if (oldVnode.data.directives || vnode.data.directives) {
    _update(oldVnode, vnode);
  }
}

function _update(oldVnode, vnode) {
  var isCreate = oldVnode === emptyNode;
  var isDestroy = vnode === emptyNode;
  var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
  var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);
  var dirsWithInsert = [];
  var dirsWithPostpatch = [];
  var key, oldDir, dir;

  for (key in newDirs) {
    oldDir = oldDirs[key];
    dir = newDirs[key];

    if (!oldDir) {
      // new directive, bind
      callHook$1(dir, 'bind', vnode, oldVnode);

      if (dir.def && dir.def.inserted) {
        dirsWithInsert.push(dir);
      }
    } else {
      // existing directive, update
      dir.oldValue = oldDir.value;
      dir.oldArg = oldDir.arg;
      callHook$1(dir, 'update', vnode, oldVnode);

      if (dir.def && dir.def.componentUpdated) {
        dirsWithPostpatch.push(dir);
      }
    }
  }

  if (dirsWithInsert.length) {
    var callInsert = function () {
      for (var i = 0; i < dirsWithInsert.length; i++) {
        callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
      }
    };

    if (isCreate) {
      mergeVNodeHook(vnode, 'insert', callInsert);
    } else {
      callInsert();
    }
  }

  if (dirsWithPostpatch.length) {
    mergeVNodeHook(vnode, 'postpatch', function () {
      for (var i = 0; i < dirsWithPostpatch.length; i++) {
        callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
      }
    });
  }

  if (!isCreate) {
    for (key in oldDirs) {
      if (!newDirs[key]) {
        // no longer present, unbind
        callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
      }
    }
  }
}

var emptyModifiers = Object.create(null);

function normalizeDirectives$1(dirs, vm) {
  var res = Object.create(null);

  if (!dirs) {
    // $flow-disable-line
    return res;
  }

  var i, dir;

  for (i = 0; i < dirs.length; i++) {
    dir = dirs[i];

    if (!dir.modifiers) {
      // $flow-disable-line
      dir.modifiers = emptyModifiers;
    }

    res[getRawDirName(dir)] = dir;
    dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
  } // $flow-disable-line


  return res;
}

function getRawDirName(dir) {
  return dir.rawName || dir.name + "." + Object.keys(dir.modifiers || {}).join('.');
}

function callHook$1(dir, hook, vnode, oldVnode, isDestroy) {
  var fn = dir.def && dir.def[hook];

  if (fn) {
    try {
      fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
    } catch (e) {
      handleError(e, vnode.context, "directive " + dir.name + " " + hook + " hook");
    }
  }
}

var baseModules = [ref, directives];

function updateAttrs(oldVnode, vnode) {
  if (!oldVnode.data.attrs && !vnode.data.attrs) {
    return;
  }

  var key, cur, old;
  var elm = vnode.elm;
  var oldAttrs = oldVnode.data.attrs || {};
  var attrs = vnode.data.attrs || {}; // clone observed objects, as the user probably wants to mutate it

  if (attrs.__ob__) {
    attrs = vnode.data.attrs = extend({}, attrs);
  }

  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];

    if (old !== cur) {
      elm.setAttribute(key, cur);
    }
  }

  for (key in oldAttrs) {
    if (attrs[key] == null) {
      elm.setAttribute(key);
    }
  }
}

var attrs = {
  create: updateAttrs,
  update: updateAttrs
};
/*  */

function genClassForVnode(vnode) {
  var data = vnode.data;
  var parentNode = vnode;
  var childNode = vnode;

  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode;

    if (childNode && childNode.data) {
      data = mergeClassData(childNode.data, data);
    }
  }

  while (isDef(parentNode = parentNode.parent)) {
    if (parentNode && parentNode.data) {
      data = mergeClassData(data, parentNode.data);
    }
  }

  return renderClass(data.staticClass, data.class);
}

function mergeClassData(child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class) ? [child.class, parent.class] : parent.class
  };
}

function renderClass(staticClass, dynamicClass) {
  if (isDef(staticClass) || isDef(dynamicClass)) {
    return concat(staticClass, stringifyClass(dynamicClass));
  }
  /* istanbul ignore next */


  return '';
}

function concat(a, b) {
  return a ? b ? a + ' ' + b : a : b || '';
}

function stringifyClass(value) {
  if (Array.isArray(value)) {
    return stringifyArray(value);
  }

  if (isObject(value)) {
    return stringifyObject(value);
  }

  if (typeof value === 'string') {
    return value;
  }
  /* istanbul ignore next */


  return '';
}

function stringifyArray(value) {
  var res = '';
  var stringified;

  for (var i = 0, l = value.length; i < l; i++) {
    if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
      if (res) {
        res += ' ';
      }

      res += stringified;
    }
  }

  return res;
}

function stringifyObject(value) {
  var res = '';

  for (var key in value) {
    if (value[key]) {
      if (res) {
        res += ' ';
      }

      res += key;
    }
  }

  return res;
}

function updateClass(oldVnode, vnode) {
  var el = vnode.elm;
  var data = vnode.data;
  var oldData = oldVnode.data;

  if (!data.staticClass && !data.class && (!oldData || !oldData.staticClass && !oldData.class)) {
    return;
  }

  var cls = genClassForVnode(vnode); // handle transition classes

  var transitionClass = el._transitionClasses;

  if (transitionClass) {
    cls = concat(cls, stringifyClass(transitionClass));
  } // set the class


  if (cls !== el._prevClass) {
    el.setAttribute('class', cls);
    el._prevClass = cls;
  }
}

var class_ = {
  create: updateClass,
  update: updateClass
};
var target$1;

function createOnceHandler$1(event, handler, capture) {
  var _target = target$1; // save current target element in closure

  return function onceHandler() {
    var res = handler.apply(null, arguments);

    if (res !== null) {
      remove$2(event, onceHandler, capture, _target);
    }
  };
}

function add$1(event, handler, once, capture) {
  if (capture) {
    console.log('NativeScript-Vue do not support event in bubble phase.');
    return;
  }

  if (once) {
    var oldHandler = handler;

    handler = function () {
      var args = [],
          len = arguments.length;

      while (len--) args[len] = arguments[len];

      var res = oldHandler.call.apply(oldHandler, [null].concat(args));

      if (res !== null) {
        remove$2(event, null, null, target$1);
      }
    };
  }

  target$1.addEventListener(event, handler);
}

function remove$2(event, handler, capture, _target) {
  if (_target === void 0) _target = target$1;

  _target.removeEventListener(event);
}

function updateDOMListeners(oldVnode, vnode) {
  if (!oldVnode.data.on && !vnode.data.on) {
    return;
  }

  var on = vnode.data.on || {};
  var oldOn = oldVnode.data.on || {};
  target$1 = vnode.elm;
  updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
  target$1 = undefined;
}

var events = {
  create: updateDOMListeners,
  update: updateDOMListeners
};
var normalize = cached(camelize);

function createStyle(oldVnode, vnode) {
  // console.log(`\t\t ===> createStyle(${oldVnode}, ${vnode})`)
  if (!vnode.data.staticStyle) {
    updateStyle(oldVnode, vnode);
    return;
  }

  var elm = vnode.elm;
  var staticStyle = vnode.data.staticStyle;

  for (var name in staticStyle) {
    if (staticStyle[name]) {
      elm.setStyle(normalize(name), staticStyle[name]);
    }
  }

  updateStyle(oldVnode, vnode);
}

function updateStyle(oldVnode, vnode) {
  if (!oldVnode.data.style && !vnode.data.style) {
    return;
  }

  var cur, name;
  var elm = vnode.elm;
  var oldStyle = oldVnode.data.style || {};
  var style = vnode.data.style || {};
  var needClone = style.__ob__; // handle array syntax

  if (Array.isArray(style)) {
    style = vnode.data.style = toObject$1(style);
  } // clone the style for future updates,
  // in case the user mutates the style object in-place.


  if (needClone) {
    style = vnode.data.style = extend({}, style);
  }

  for (name in oldStyle) {
    if (!style[name]) {
      elm.setStyle(normalize(name), '');
    }
  }

  for (name in style) {
    cur = style[name];
    elm.setStyle(normalize(name), cur);
  }
}

function toObject$1(arr) {
  var res = {};

  for (var i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i]);
    }
  }

  return res;
}

var style = {
  create: createStyle,
  update: updateStyle
};
/*  */

var whitespaceRE = /\s+/;
/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */

function addClass(el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return;
  }
  /* istanbul ignore else */


  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) {
        return el.classList.add(c);
      });
    } else {
      el.classList.add(cls);
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";

    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim());
    }
  }
}
/**
 * Remove class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */


function removeClass(el, cls) {
  /* istanbul ignore if */
  if (!cls || !(cls = cls.trim())) {
    return;
  }
  /* istanbul ignore else */


  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(whitespaceRE).forEach(function (c) {
        return el.classList.remove(c);
      });
    } else {
      el.classList.remove(cls);
    }

    if (!el.classList.length) {
      el.removeAttribute('class');
    }
  } else {
    var cur = " " + (el.getAttribute('class') || '') + " ";
    var tar = ' ' + cls + ' ';

    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ');
    }

    cur = cur.trim();

    if (cur) {
      el.setAttribute('class', cur);
    } else {
      el.removeAttribute('class');
    }
  }
}
/*  */


function resolveTransition(def) {
  if (!def) {
    return;
  }
  /* istanbul ignore else */


  if (typeof def === 'object') {
    var res = {};

    if (def.css !== false) {
      extend(res, autoCssTransition(def.name || 'v'));
    }

    extend(res, def);
    return res;
  } else if (typeof def === 'string') {
    return autoCssTransition(def);
  }
}

var autoCssTransition = cached(function (name) {
  return {
    enterClass: name + "-enter",
    enterToClass: name + "-enter-to",
    enterActiveClass: name + "-enter-active",
    leaveClass: name + "-leave",
    leaveToClass: name + "-leave-to",
    leaveActiveClass: name + "-leave-active"
  };
}); // binding to window is necessary to make hot reload work in IE in strict mode

var raf = inBrowser ? window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout :
/* istanbul ignore next */
function (fn) {
  return fn();
};

function nextFrame(fn) {
  raf(function () {
    raf(fn);
  });
}

function addTransitionClass(el, cls) {
  var transitionClasses = el._transitionClasses || (el._transitionClasses = []);

  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls);
    addClass(el, cls);
  }
}

function removeTransitionClass(el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls);
  }

  removeClass(el, cls);
}

function enter(vnode, toggleDisplay) {
  var el = vnode.elm; // call leave callback now

  if (isDef(el._leaveCb)) {
    el._leaveCb.cancelled = true;

    el._leaveCb();
  }

  var data = resolveTransition(vnode.data.transition);

  if (isUndef(data)) {
    return;
  }
  /* istanbul ignore if */


  if (isDef(el._enterCb) || el.nodeType !== 1) {
    return;
  }

  var css = data.css;
  var type = data.type;
  var enterClass = data.enterClass;
  var enterToClass = data.enterToClass;
  var enterActiveClass = data.enterActiveClass;
  var appearClass = data.appearClass;
  var appearToClass = data.appearToClass;
  var appearActiveClass = data.appearActiveClass;
  var beforeEnter = data.beforeEnter;
  var enter = data.enter;
  var afterEnter = data.afterEnter;
  var enterCancelled = data.enterCancelled;
  var beforeAppear = data.beforeAppear;
  var appear = data.appear;
  var afterAppear = data.afterAppear;
  var appearCancelled = data.appearCancelled;
  var duration = data.duration; // activeInstance will always be the <transition> component managing this
  // transition. One edge case to check is when the <transition> is placed
  // as the root node of a child component. In that case we need to check
  // <transition>'s parent for appear check.

  var context = activeInstance;
  var transitionNode = activeInstance.$vnode;

  while (transitionNode && transitionNode.parent) {
    transitionNode = transitionNode.parent;
    context = transitionNode.context;
  }

  var isAppear = !context._isMounted || !vnode.isRootInsert;

  if (isAppear && !appear && appear !== '') {
    return;
  }

  var startClass = isAppear && appearClass ? appearClass : enterClass;
  var activeClass = isAppear && appearActiveClass ? appearActiveClass : enterActiveClass;
  var toClass = isAppear && appearToClass ? appearToClass : enterToClass;
  var beforeEnterHook = isAppear ? beforeAppear || beforeEnter : beforeEnter;
  var enterHook = isAppear ? typeof appear === 'function' ? appear : enter : enter;
  var afterEnterHook = isAppear ? afterAppear || afterEnter : afterEnter;
  var enterCancelledHook = isAppear ? appearCancelled || enterCancelled : enterCancelled;
  var explicitEnterDuration = toNumber(isObject(duration) ? duration.enter : duration);

  if ( true && explicitEnterDuration != null) {
    checkDuration(explicitEnterDuration, 'enter', vnode);
  }

  var expectsCSS = css !== false;
  var userWantsControl = getHookArgumentsLength(enterHook);
  var cb = el._enterCb = once(function () {
    if (expectsCSS) {
      removeTransitionClass(el, toClass);
      removeTransitionClass(el, activeClass);
    }

    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, startClass);
      }

      enterCancelledHook && enterCancelledHook(el);
    } else {
      afterEnterHook && afterEnterHook(el);
    }

    el._enterCb = null;
  });

  if (!vnode.data.show) {
    // remove pending leave element on enter by injecting an insert hook
    mergeVNodeHook(vnode, 'insert', function () {
      var parent = el.parentNode;
      var pendingNode = parent && parent._pending && parent._pending[vnode.key];

      if (pendingNode && pendingNode.tag === vnode.tag && pendingNode.elm._leaveCb) {
        pendingNode.elm._leaveCb();
      }

      enterHook && enterHook(el, cb);
    });
  } // start enter transition


  beforeEnterHook && beforeEnterHook(el);

  if (expectsCSS) {
    addTransitionClass(el, startClass);
    addTransitionClass(el, activeClass);
    nextFrame(function () {
      removeTransitionClass(el, startClass);

      if (!cb.cancelled) {
        addTransitionClass(el, toClass);

        if (!userWantsControl) {
          if (isValidDuration(explicitEnterDuration)) {
            setTimeout(cb, explicitEnterDuration);
          }
        }
      }
    });
  }

  if (vnode.data.show) {
    toggleDisplay && toggleDisplay();
    enterHook && enterHook(el, cb);
  }

  if (!expectsCSS && !userWantsControl) {
    cb();
  }
}

function leave(vnode, rm) {
  var el = vnode.elm; // call enter callback now

  if (isDef(el._enterCb)) {
    el._enterCb.cancelled = true;

    el._enterCb();
  }

  var data = resolveTransition(vnode.data.transition);

  if (isUndef(data) || el.nodeType !== 1) {
    return rm();
  }
  /* istanbul ignore if */


  if (isDef(el._leaveCb)) {
    return;
  }

  var css = data.css;
  var type = data.type;
  var leaveClass = data.leaveClass;
  var leaveToClass = data.leaveToClass;
  var leaveActiveClass = data.leaveActiveClass;
  var beforeLeave = data.beforeLeave;
  var leave = data.leave;
  var afterLeave = data.afterLeave;
  var leaveCancelled = data.leaveCancelled;
  var delayLeave = data.delayLeave;
  var duration = data.duration;
  var expectsCSS = css !== false;
  var userWantsControl = getHookArgumentsLength(leave);
  var explicitLeaveDuration = toNumber(isObject(duration) ? duration.leave : duration);

  if ( true && isDef(explicitLeaveDuration)) {
    checkDuration(explicitLeaveDuration, 'leave', vnode);
  }

  var cb = el._leaveCb = once(function () {
    if (el.parentNode && el.parentNode._pending) {
      el.parentNode._pending[vnode.key] = null;
    }

    if (expectsCSS) {
      removeTransitionClass(el, leaveToClass);
      removeTransitionClass(el, leaveActiveClass);
    }

    if (cb.cancelled) {
      if (expectsCSS) {
        removeTransitionClass(el, leaveClass);
      }

      leaveCancelled && leaveCancelled(el);
    } else {
      rm();
      afterLeave && afterLeave(el);
    }

    el._leaveCb = null;
  });

  if (delayLeave) {
    delayLeave(performLeave);
  } else {
    performLeave();
  }

  function performLeave() {
    // the delayed leave may have already been cancelled
    if (cb.cancelled) {
      return;
    } // record leaving element


    if (!vnode.data.show) {
      (el.parentNode._pending || (el.parentNode._pending = {}))[vnode.key] = vnode;
    }

    beforeLeave && beforeLeave(el);

    if (expectsCSS) {
      addTransitionClass(el, leaveClass);
      addTransitionClass(el, leaveActiveClass);
      nextFrame(function () {
        removeTransitionClass(el, leaveClass);

        if (!cb.cancelled) {
          addTransitionClass(el, leaveToClass);

          if (!userWantsControl) {
            if (isValidDuration(explicitLeaveDuration)) {
              setTimeout(cb, explicitLeaveDuration);
            }
          }
        }
      });
    }

    leave && leave(el, cb);

    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }
} // only used in dev mode


function checkDuration(val, name, vnode) {
  if (typeof val !== 'number') {
    warn("<transition> explicit " + name + " duration is not a valid number - " + "got " + JSON.stringify(val) + ".", vnode.context);
  } else if (isNaN(val)) {
    warn("<transition> explicit " + name + " duration is NaN - " + 'the duration expression might be incorrect.', vnode.context);
  }
}

function isValidDuration(val) {
  return typeof val === 'number' && !isNaN(val);
}
/**
 * Normalize a transition hook's argument length. The hook may be:
 * - a merged hook (invoker) with the original in .fns
 * - a wrapped component method (check ._length)
 * - a plain function (.length)
 */


function getHookArgumentsLength(fn) {
  if (isUndef(fn)) {
    return false;
  }

  var invokerFns = fn.fns;

  if (isDef(invokerFns)) {
    // invoker
    return getHookArgumentsLength(Array.isArray(invokerFns) ? invokerFns[0] : invokerFns);
  } else {
    return (fn._length || fn.length) > 1;
  }
}

function _enter(_, vnode) {
  if (vnode.data.show !== true) {
    enter(vnode);
  }
}

var transition = {
  create: _enter,
  activate: _enter,
  remove: function remove(vnode, rm) {
    /* istanbul ignore else */
    if (vnode.data.show !== true) {
      leave(vnode, rm);
    } else {
      rm();
    }
  }
};
var platformModules = [class_, events, attrs, style, transition];
var actionBar = {
  template: "\n    <NativeActionBar ~actionBar v-bind=\"$attrs\" v-on=\"$listeners\">\n      <slot />\n    </NativeActionBar>\n  "
};
var android = {
  functional: true,
  render: function render(h, ref) {
    var children = ref.children;

    if (false) {}
  }
};
var frames = new Map();

function setFrame(id, frame) {
  return frames.set(id, frame);
}

function getFrame(id) {
  return frames.get(id);
}

function deleteFrame(id) {
  return frames.delete(id);
}

var frame = {
  props: {
    id: {
      default: 'default'
    },
    transition: {
      type: [String, Object],
      required: false,
      default: null
    },
    'ios:transition': {
      type: [String, Object],
      required: false,
      default: null
    },
    'android:transition': {
      type: [String, Object],
      required: false,
      default: null
    },
    clearHistory: {
      type: Boolean,
      required: false,
      default: false
    },
    backstackVisible: {
      type: Boolean,
      required: false,
      default: true
    },
    // injected by the template compiler
    hasRouterView: {
      default: false
    }
  },
  data: function data() {
    return {
      properties: {}
    };
  },
  created: function created() {
    this.properties = Object.assign({}, this.$attrs, this.$props);
    setFrame(this.properties.id, this);
  },
  destroyed: function destroyed() {
    deleteFrame(this.properties.id);
  },
  render: function render(h) {
    var vnode = null; // Render slot to ensure default page is displayed

    if (this.$slots.default) {
      if ( true && this.$slots.default.length > 1) {
        warn("The <Frame> element can only have a single child element, that is the defaultPage.");
      }

      vnode = this.$slots.default[0];
      vnode.key = 'default';
    }

    return h('NativeFrame', {
      attrs: this.properties,
      on: this.$listeners
    }, [vnode]);
  },
  methods: {
    _getFrame: function _getFrame() {
      return this.$el.nativeView;
    },
    _ensureTransitionObject: function _ensureTransitionObject(transition) {
      if (typeof transition === 'string') {
        return {
          name: transition
        };
      }

      return transition;
    },
    _composeTransition: function _composeTransition(entry) {
      var isAndroid = false;
      var platformEntryProp = "transition" + (isAndroid ? 'Android' : 'iOS');
      var entryProp = entry[platformEntryProp] ? platformEntryProp : 'transition';
      var platformProp = (isAndroid ? 'android' : 'ios') + ":transition";
      var prop = this[platformProp] ? platformProp : 'transition';

      if (entry[entryProp]) {
        entry[entryProp] = this._ensureTransitionObject(entry[entryProp]);
      } else if (this[prop]) {
        entry[entryProp] = this._ensureTransitionObject(this[prop]);
      }

      return entry;
    },
    notifyFirstPageMounted: function notifyFirstPageMounted(pageVm) {
      var options = {
        backstackVisible: this.backstackVisible,
        clearHistory: this.clearHistory,
        create: function () {
          return pageVm.$el.nativeView;
        }
      };
      this.navigate(options);
    },
    navigate: function navigate(entry, back) {
      var this$1 = this;
      if (back === void 0) back = false;

      var frame = this._getFrame();

      if (back) {
        return frame.goBack(entry);
      } // resolve the page from the entry and attach a navigatedTo listener
      // to fire the frame events


      var page = entry.create();
      page.once('navigatedTo', function () {
        this$1.$emit('navigated', entry);
      });

      var handler = function (args) {
        if (args.isBackNavigation) {
          page.off('navigatedFrom', handler);
          this$1.$emit('navigatedBack', entry);
        }
      };

      page.on('navigatedFrom', handler);

      entry.create = function () {
        return page;
      };

      this._composeTransition(entry);

      frame.navigate(entry);
    },
    back: function back(backstackEntry) {
      if (backstackEntry === void 0) backstackEntry = null;
      this.navigate(backstackEntry, true);
    }
  }
};
var ios = {
  functional: true,
  render: function render(h, ref) {
    var children = ref.children;

    if (true) {
      return children;
    }
  }
};
var VUE_VIEW = '__vueVNodeRef__';
var tid = 0;
var vTemplate = {
  props: {
    name: {
      type: String
    },
    if: {
      type: String
    }
  },
  mounted: function mounted() {
    if (!this.$scopedSlots.default) {
      return;
    }

    this.$templates = this.$el.parentNode.$templates = this.$parent.$templates = this.$parent.$templates || new TemplateBag();
    this.$templates.registerTemplate(this.$props.name || (this.$props.if ? "v-template-" + tid++ : 'default'), this.$props.if, this.$scopedSlots.default);
  },
  render: function render(h) {}
};

var TemplateBag = function TemplateBag() {
  this._templateMap = new Map();
};

var prototypeAccessors$1 = {
  selectorFn: {
    configurable: true
  }
};

TemplateBag.prototype.registerTemplate = function registerTemplate(name, condition, scopedFn) {
  this._templateMap.set(name, {
    scopedFn: scopedFn,
    conditionFn: this.getConditionFn(condition),
    keyedTemplate: new VueKeyedTemplate(name, scopedFn)
  });
};

prototypeAccessors$1.selectorFn.get = function () {
  var self = this;
  return function templateSelectorFn(item) {
    var iterator = self._templateMap.entries();

    var curr;

    while (curr = iterator.next().value) {
      var name = curr[0];
      var conditionFn = curr[1].conditionFn;

      try {
        if (conditionFn(item)) {
          return name;
        }
      } catch (err) {}
    }

    return 'default';
  };
};

TemplateBag.prototype.getConditionFn = function getConditionFn(condition) {
  return new Function('ctx', "with(ctx) { return !!(" + condition + ") }");
};

TemplateBag.prototype.getKeyedTemplate = function getKeyedTemplate(name) {
  return this._templateMap.get(name).keyedTemplate;
};

TemplateBag.prototype.patchTemplate = function patchTemplate(name, context, oldVnode) {
  var vnode = this._templateMap.get(name).scopedFn(context); // in 2.6 scopedFn returns an array!


  if (Array.isArray(vnode)) {
    vnode = vnode[0];
  }

  var nativeView = patch(oldVnode, vnode).nativeView;
  nativeView[VUE_VIEW] = vnode; // force flush Vue callbacks so all changes are applied immediately
  // rather than on next tick

  flushCallbacks();
  return nativeView;
};

TemplateBag.prototype.getAvailable = function getAvailable() {
  return Array.from(this._templateMap.keys());
};

TemplateBag.prototype.getKeyedTemplates = function getKeyedTemplates() {
  return Array.from(this._templateMap.values()).map(function (ref) {
    var keyedTemplate = ref.keyedTemplate;
    return keyedTemplate;
  });
};

Object.defineProperties(TemplateBag.prototype, prototypeAccessors$1);

var VueKeyedTemplate = function VueKeyedTemplate(key, scopedFn) {
  this._key = key;
  this._scopedFn = scopedFn;
};

var prototypeAccessors$1$1 = {
  key: {
    configurable: true
  }
};

prototypeAccessors$1$1.key.get = function () {
  return this._key;
};

VueKeyedTemplate.prototype.createView = function createView() {
  // we are returning null because we don't have the data here
  // the view will be created in the `patchTemplate` method above.
  // see https://github.com/nativescript-vue/nativescript-vue/issues/229#issuecomment-390330474
  return null;
};

Object.defineProperties(VueKeyedTemplate.prototype, prototypeAccessors$1$1);
var listView = {
  props: {
    items: {
      type: [Array, Object],
      validator: function (val) {
        var ObservableArray = __webpack_require__("@nativescript/core").ObservableArray;

        return Array.isArray(val) || val instanceof ObservableArray;
      },
      required: true
    },
    '+alias': {
      type: String,
      default: 'item'
    },
    '+index': {
      type: String
    }
  },
  template: "\n    <NativeListView\n      ref=\"listView\"\n      :items=\"items\"\n      v-bind=\"$attrs\"\n      v-on=\"listeners\"\n      @itemTap=\"onItemTap\"\n      @itemLoading=\"onItemLoading\"\n    >\n      <slot />\n    </NativeListView>\n  ",
  watch: {
    items: {
      handler: function handler(newVal) {
        this.$refs.listView.setAttribute('items', newVal);
        this.refresh();
      },
      deep: true
    }
  },
  created: function created() {
    // we need to remove the itemTap handler from a clone of the $listeners
    // object because we are emitting the event ourselves with added data.
    var listeners = extend({}, this.$listeners);
    delete listeners.itemTap;
    this.listeners = listeners;
    this.getItemContext = getItemContext.bind(this);
  },
  mounted: function mounted() {
    var this$1 = this;

    if (!this.$templates) {
      return;
    }

    this.$refs.listView.setAttribute('itemTemplates', this.$templates.getKeyedTemplates());
    this.$refs.listView.setAttribute('itemTemplateSelector', function (item, index) {
      return this$1.$templates.selectorFn(this$1.getItemContext(item, index));
    });
  },
  methods: {
    onItemTap: function onItemTap(args) {
      this.$emit('itemTap', extend({
        item: this.getItem(args.index)
      }, args));
    },
    onItemLoading: function onItemLoading(args) {
      if (!this.$templates) {
        return;
      }

      var index = args.index;
      var items = args.object.items;
      var currentItem = this.getItem(index);

      var name = args.object._itemTemplateSelector(currentItem, index, items);

      var context = this.getItemContext(currentItem, index);
      var oldVnode = args.view && args.view[VUE_VIEW];
      args.view = this.$templates.patchTemplate(name, context, oldVnode);
    },
    refresh: function refresh() {
      this.$refs.listView.nativeView.refresh();
    },
    getItem: function getItem(idx) {
      return typeof this.items.getItem === 'function' ? this.items.getItem(idx) : this.items[idx];
    }
  }
};

function getItemContext(item, index, alias, index_alias) {
  var obj;
  if (alias === void 0) alias = this.$props['+alias'];
  if (index_alias === void 0) index_alias = this.$props['+index'];
  return obj = {}, obj[alias] = item, obj[index_alias || '$index'] = index, obj.$even = index % 2 === 0, obj.$odd = index % 2 !== 0, obj;
}

var isReservedTag = makeMap('template', true);

var _Vue;

function setVue(Vue) {
  _Vue = Vue;
}

var canBeLeftOpenTag = function (el) {
  return getViewMeta(el).canBeLeftOpenTag;
};

var isUnaryTag = function (el) {
  return getViewMeta(el).isUnaryTag;
};

function mustUseProp() {// console.log('mustUseProp')
}

function getTagNamespace(el) {
  return getViewMeta(el).tagNamespace;
}

function isUnknownElement(el) {
  return !isKnownView(el);
}

var VUE_VERSION = global.process.env.VUE_VERSION || '2.6.12';
var NS_VUE_VERSION = global.process.env.NS_VUE_VERSION || '2.8.3';
var infoTrace = once(function () {
  console.log("NativeScript-Vue has \"Vue.config.silent\" set to true, to see output logs set it to false.");
});

function trace(message) {
  if (_Vue && _Vue.config.silent) {
    return infoTrace();
  }

  if (_Vue && !_Vue.config.suppressRenderLogs) {
    console.log("{NSVue (Vue: " + VUE_VERSION + " | NSVue: " + NS_VUE_VERSION + ")} -> " + message);
  }
}

function updateDevtools() {
  if (global.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    try {
      global.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('flush');
    } catch (err) {//
    }
  }
}

var PAGE_REF = '__vuePageRef__';
var page = {
  render: function render(h) {
    return h('NativePage', {
      attrs: this.$attrs,
      on: this.$listeners
    }, this.$slots.default);
  },
  mounted: function mounted() {
    var this$1 = this;
    this.$el.nativeView[PAGE_REF] = this;

    var frame = this._findParentFrame(); // we only need call this for the "defaultPage" of the frame
    // which is equivalent to testing if any page is "current" in the frame


    if (frame && !frame.firstPageMounted && !frame.$el.nativeView.currentPage) {
      frame.firstPageMounted = true;
      frame.notifyFirstPageMounted(this);
    }

    var handler = function (e) {
      if (e.isBackNavigation) {
        this$1.$el.nativeView.off('navigatedFrom', handler);
        this$1.$parent.$destroy();
      }
    };

    this.$el.nativeView.on('navigatedFrom', handler); // ensure that the parent vue instance is destroyed when the
    // page is disposed (clearHistory: true for example)

    var dispose = this.$el.nativeView.disposeNativeView;

    this.$el.nativeView.disposeNativeView = function () {
      var args = [],
          len = arguments.length;

      while (len--) args[len] = arguments[len];

      this$1.$parent.$destroy();
      dispose.call(this$1.$el.nativeView, args);
      updateDevtools();
    };
  },
  methods: {
    _findParentFrame: function _findParentFrame() {
      var frame = this.$parent;

      while (frame && frame.$options.name !== 'Frame') {
        frame = frame.$parent;
      }

      return frame;
    }
  }
};
var tabView = {
  model: {
    prop: 'selectedIndex',
    event: 'selectedIndexChange'
  },
  render: function render(h) {
    return h('NativeTabView', {
      on: this.$listeners,
      attrs: this.$attrs
    }, this.$slots.default);
  },
  methods: {
    registerTab: function registerTab(tabView) {
      var items = this.$el.nativeView.items || [];
      this.$el.setAttribute('items', items.concat([tabView]));
    }
  }
};
var tabViewItem = {
  template: "<NativeTabViewItem><slot /></NativeTabViewItem>",
  mounted: function mounted() {
    if (this.$el.childNodes.length > 1) {
      warn('TabViewItem should contain only 1 root element', this);
    }

    var _nativeView = this.$el.nativeView;
    _nativeView.view = this.$el.childNodes[0].nativeView;
    this.$parent.registerTab(_nativeView);
  }
};
var bottomNavigation = {
  model: {
    prop: 'selectedIndex',
    event: 'selectedIndexChange'
  },
  render: function render(h) {
    return h('NativeBottomNavigation', {
      on: this.$listeners,
      attrs: this.$attrs
    }, this.$slots.default);
  },
  methods: {
    registerTabStrip: function registerTabStrip(tabStrip) {
      this.$el.setAttribute('tabStrip', tabStrip);
    },
    registerTabContentItem: function registerTabContentItem(tabContentItem) {
      var items = this.$el.nativeView.items || [];
      this.$el.setAttribute('items', items.concat([tabContentItem]));
    }
  }
};
var tabs = {
  model: {
    prop: 'selectedIndex',
    event: 'selectedIndexChange'
  },
  render: function render(h) {
    return h('NativeTabs', {
      on: this.$listeners,
      attrs: this.$attrs
    }, this.$slots.default);
  },
  methods: {
    registerTabStrip: function registerTabStrip(tabStrip) {
      this.$el.setAttribute('tabStrip', tabStrip);
    },
    registerTabContentItem: function registerTabContentItem(tabContentItem) {
      var items = this.$el.nativeView.items || [];
      this.$el.setAttribute('items', items.concat([tabContentItem]));
    }
  }
};
var tabStrip = {
  render: function render(h) {
    return h('NativeTabStrip', {
      on: this.$listeners,
      attrs: this.$attrs
    }, this.$slots.default);
  },
  mounted: function mounted() {
    var _nativeView = this.$el.nativeView;
    this.$parent.registerTabStrip(_nativeView);
  },
  methods: {
    registerTabStripItem: function registerTabStripItem(tabStripItem) {
      var items = this.$el.nativeView.items || [];
      this.$el.setAttribute('items', items.concat([tabStripItem]));
    }
  }
};
var tabStripItem = {
  render: function render(h) {
    return h('NativeTabStripItem', {
      on: this.$listeners,
      attrs: this.$attrs
    }, this.$slots.default);
  },
  mounted: function mounted() {
    var _nativeView = this.$el.nativeView;
    this.$parent.registerTabStripItem(_nativeView);
  }
};
var tabContentItem = {
  template: "<NativeTabContentItem><slot /></NativeTabContentItem>",
  mounted: function mounted() {
    if (this.$el.childNodes.length > 1) {
      warn('TabContentItem should contain only 1 root element', this);
    }

    var _nativeView = this.$el.nativeView;
    _nativeView.view = this.$el.childNodes[0].nativeView;
    this.$parent.registerTabContentItem(_nativeView);
  }
};
/*  */

var transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
}; // in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered

function getRealChild(vnode) {
  var compOptions = vnode && vnode.componentOptions;

  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children));
  } else {
    return vnode;
  }
}

function extractTransitionData(comp) {
  var data = {};
  var options = comp.$options; // props

  for (var key in options.propsData) {
    data[key] = comp[key];
  } // events.
  // extract listeners and pass them directly to the transition methods


  var listeners = options._parentListeners;

  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1];
  }

  return data;
}

function placeholder(h, rawChild) {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    });
  }
}

function hasParentTransition(vnode) {
  while (vnode = vnode.parent) {
    if (vnode.data.transition) {
      return true;
    }
  }
}

function isSameChild(child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag;
}

var isNotTextNode = function (c) {
  return c.tag || isAsyncPlaceholder(c);
};

var isVShowDirective = function (d) {
  return d.name === 'show';
};

var Transition = {
  name: 'transition',
  props: transitionProps,
  abstract: true,
  render: function render(h) {
    var this$1 = this;
    var children = this.$slots.default;

    if (!children) {
      return;
    } // filter out text nodes (possible whitespaces)


    children = children.filter(isNotTextNode);
    /* istanbul ignore if */

    if (!children.length) {
      return;
    } // warn multiple elements


    if ( true && children.length > 1) {
      warn('<transition> can only be used on a single element. Use ' + '<transition-group> for lists.', this.$parent);
    }

    var mode = this.mode; // warn invalid mode

    if ( true && mode && mode !== 'in-out' && mode !== 'out-in') {
      warn('invalid <transition> mode: ' + mode, this.$parent);
    }

    var rawChild = children[0]; // if this is a component root node and the component's
    // parent container node also has transition, skip.

    if (hasParentTransition(this.$vnode)) {
      return rawChild;
    } // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive


    var child = getRealChild(rawChild);
    /* istanbul ignore if */

    if (!child) {
      return rawChild;
    }

    if (this._leaving) {
      return placeholder(h, rawChild);
    } // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.


    var id = "__transition-" + this._uid + "-";
    child.key = child.key == null ? child.isComment ? id + 'comment' : id + child.tag : isPrimitive(child.key) ? String(child.key).indexOf(id) === 0 ? child.key : id + child.key : child.key;
    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild); // mark v-show
    // so that the transition module can hand over the control to the directive

    if (child.data.directives && child.data.directives.some(isVShowDirective)) {
      child.data.show = true;
    }

    if (oldChild && oldChild.data && !isSameChild(child, oldChild) && !isAsyncPlaceholder(oldChild) && // #6687 component root is a comment node
    !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      var oldData = oldChild.data.transition = extend({}, data); // handle transition mode

      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true;
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this$1._leaving = false;
          this$1.$forceUpdate();
        });
        return placeholder(h, rawChild);
      } else if (mode === 'in-out') {
        if (isAsyncPlaceholder(child)) {
          return oldRawChild;
        }

        var delayedLeave;

        var performLeave = function () {
          delayedLeave();
        };

        mergeVNodeHook(data, 'afterEnter', performLeave);
        mergeVNodeHook(data, 'enterCancelled', performLeave);
        mergeVNodeHook(oldData, 'delayLeave', function (leave) {
          delayedLeave = leave;
        });
      }
    }

    return rawChild;
  }
};
var elementMap = {};
var nativeRegExp = /Native/gi;
var dashRegExp = /-/g;
var defaultViewMeta = {
  skipAddToDom: false,
  isUnaryTag: false,
  tagNamespace: '',
  canBeLeftOpenTag: false,
  model: null,
  component: null
};

function normalizeElementName(elementName) {
  return "native" + elementName.replace(nativeRegExp, '').replace(dashRegExp, '').toLowerCase();
}

function registerElement(elementName, resolver, meta) {
  var normalizedName = normalizeElementName(elementName);
  meta = Object.assign({}, defaultViewMeta, meta); // allow override of elements classes (N ones especially)
  // this is very practical in case you want to test new component
  // or simply override the global Button for example

  if (elementMap[normalizedName]) {
    trace("Element for " + elementName + " already registered.");
  }

  if (!meta.component) {
    // if no Vue component is passed, wrap the simpler vue component
    // which bind the events and attributes to the NS one
    meta.component = {
      functional: true,
      model: meta.model,
      render: function (h, ref) {
        var data = ref.data;
        var children = ref.children;
        return h(normalizedName, data, children);
      }
    };
  }

  meta.component.name = elementName;
  elementMap[normalizedName] = {
    resolver: resolver,
    meta: meta
  };
}

function getElementMap() {
  return elementMap;
}

function getViewClass(elementName) {
  var normalizedName = normalizeElementName(elementName);
  var entry = elementMap[normalizedName];

  if (!entry) {
    throw new TypeError("No known component for element " + elementName + ".");
  }

  try {
    return entry.resolver();
  } catch (e) {
    throw new TypeError("Could not load view for: " + elementName + ". " + e + " " + e.stack);
  }
}

function getViewMeta(elementName) {
  var normalizedName = normalizeElementName(elementName);
  var meta = defaultViewMeta;
  var entry = elementMap[normalizedName];

  if (entry && entry.meta) {
    meta = entry.meta;
  }

  return meta;
}

function isKnownView(elementName) {
  return elementMap[normalizeElementName(elementName)];
}

registerElement('ActionBar', function () {
  return __webpack_require__("@nativescript/core").ActionBar;
}, {
  removeChild: function removeChild(parent, child) {
    try {
      parent.nativeView._removeView(child.nativeView);
    } catch (e) {// ignore exception - child is likely already removed/replaced
      // fixes #76
    }
  },
  component: actionBar
});
registerElement('ActionItem', function () {
  return __webpack_require__("@nativescript/core").ActionItem;
});
registerElement('android', null, {
  component: android
});
registerElement('ios', null, {
  component: ios
});
registerElement('ListView', function () {
  return __webpack_require__("@nativescript/core").ListView;
}, {
  component: listView
});
registerElement('NavigationButton', function () {
  return __webpack_require__("@nativescript/core").NavigationButton;
});
registerElement('TabView', function () {
  return __webpack_require__("@nativescript/core").TabView;
}, {
  model: {
    prop: 'selectedIndex',
    event: 'selectedIndexChange'
  },
  component: tabView
});
registerElement('TabViewItem', function () {
  return __webpack_require__("@nativescript/core").TabViewItem;
}, {
  skipAddToDom: true,
  component: tabViewItem
});
registerElement('BottomNavigation', function () {
  return __webpack_require__("@nativescript/core").BottomNavigation;
}, {
  model: {
    prop: 'selectedIndex',
    event: 'selectedIndexChange'
  },
  component: bottomNavigation
});
registerElement('Tabs', function () {
  return __webpack_require__("@nativescript/core").Tabs;
}, {
  model: {
    prop: 'selectedIndex',
    event: 'selectedIndexChange'
  },
  component: tabs
});
registerElement('TabStrip', function () {
  return __webpack_require__("@nativescript/core").TabStrip;
}, {
  skipAddToDom: true,
  component: tabStrip
});
registerElement('TabStripItem', function () {
  return __webpack_require__("@nativescript/core").TabStripItem;
}, {
  skipAddToDom: true,
  component: tabStripItem
});
registerElement('TabContentItem', function () {
  return __webpack_require__("@nativescript/core").TabContentItem;
}, {
  skipAddToDom: true,
  component: tabContentItem
});
registerElement('transition', null, {
  component: Transition
});
registerElement('v-template', null, {
  component: vTemplate
}); // NS components which uses the automatic registerElement Vue wrapper
// as they do not need any special logic

registerElement('Label', function () {
  return __webpack_require__("@nativescript/core").Label;
}, {
  model: {
    prop: 'text',
    event: 'textChange'
  }
});
registerElement('DatePicker', function () {
  return __webpack_require__("@nativescript/core").DatePicker;
}, {
  model: {
    prop: 'date',
    event: 'dateChange'
  }
});
registerElement('AbsoluteLayout', function () {
  return __webpack_require__("@nativescript/core").AbsoluteLayout;
});
registerElement('ActivityIndicator', function () {
  return __webpack_require__("@nativescript/core").ActivityIndicator;
});
registerElement('Button', function () {
  return __webpack_require__("@nativescript/core").Button;
});
registerElement('ContentView', function () {
  return __webpack_require__("@nativescript/core").ContentView;
});
registerElement('DockLayout', function () {
  return __webpack_require__("@nativescript/core").DockLayout;
});
registerElement('GridLayout', function () {
  return __webpack_require__("@nativescript/core").GridLayout;
});
registerElement('HtmlView', function () {
  return __webpack_require__("@nativescript/core").HtmlView;
});
registerElement('Image', function () {
  return __webpack_require__("@nativescript/core").Image;
});
registerElement('img', function () {
  return __webpack_require__("@nativescript/core").Image;
});
registerElement('ListPicker', function () {
  return __webpack_require__("@nativescript/core").ListPicker;
}, {
  model: {
    prop: 'selectedIndex',
    event: 'selectedIndexChange'
  }
});
registerElement('Page', function () {
  return __webpack_require__("@nativescript/core").Page;
}, {
  skipAddToDom: true,
  component: page
});
registerElement('Placeholder', function () {
  return __webpack_require__("@nativescript/core").Placeholder;
});
registerElement('Progress', function () {
  return __webpack_require__("@nativescript/core").Progress;
}, {
  model: {
    prop: 'value',
    event: 'valueChange'
  }
});
registerElement('ProxyViewContainer', function () {
  return __webpack_require__("@nativescript/core").ProxyViewContainer;
}); // registerElement(
//   'Repeater',
//   () => require('@nativescript/core').Repeater
// )

registerElement('ScrollView', function () {
  return __webpack_require__("@nativescript/core").ScrollView;
});
registerElement('SearchBar', function () {
  return __webpack_require__("@nativescript/core").SearchBar;
}, {
  model: {
    prop: 'text',
    event: 'textChange'
  }
});
registerElement('SegmentedBar', function () {
  return __webpack_require__("@nativescript/core").SegmentedBar;
}, {
  model: {
    prop: 'selectedIndex',
    event: 'selectedIndexChange'
  }
});
registerElement('SegmentedBarItem', function () {
  return __webpack_require__("@nativescript/core").SegmentedBarItem;
});
registerElement('Slider', function () {
  return __webpack_require__("@nativescript/core").Slider;
}, {
  model: {
    prop: 'value',
    event: 'valueChange'
  }
});
registerElement('StackLayout', function () {
  return __webpack_require__("@nativescript/core").StackLayout;
});
registerElement('FlexboxLayout', function () {
  return __webpack_require__("@nativescript/core").FlexboxLayout;
});
registerElement('Switch', function () {
  return __webpack_require__("@nativescript/core").Switch;
}, {
  model: {
    prop: 'checked',
    event: 'checkedChange'
  }
});
registerElement('TextField', function () {
  return __webpack_require__("@nativescript/core").TextField;
}, {
  model: {
    prop: 'text',
    event: 'textChange'
  }
});
registerElement('TextView', function () {
  return __webpack_require__("@nativescript/core").TextView;
}, {
  model: {
    prop: 'text',
    event: 'textChange'
  }
});
registerElement('TimePicker', function () {
  return __webpack_require__("@nativescript/core").TimePicker;
}, {
  model: {
    prop: 'time',
    event: 'timeChange'
  }
});
registerElement('WebView', function () {
  return __webpack_require__("@nativescript/core").WebView;
});
registerElement('WrapLayout', function () {
  return __webpack_require__("@nativescript/core").WrapLayout;
});
registerElement('FormattedString', function () {
  return __webpack_require__("@nativescript/core").FormattedString;
}, {
  insertChild: function insertChild(parentNode, childNode, atIndex) {
    if (atIndex > -1) {
      parentNode.nativeView.spans.splice(atIndex, 0, childNode.nativeView);
      return;
    }

    parentNode.nativeView.spans.push(childNode.nativeView);
  },
  removeChild: function removeChild(parentNode, childNode) {
    var index = parentNode.nativeView.spans.indexOf(childNode.nativeView);

    if (index > -1) {
      parentNode.nativeView.spans.splice(index, 1);
    }
  }
});
registerElement('Span', function () {
  return __webpack_require__("@nativescript/core").Span;
});
registerElement('DetachedContainer', function () {
  return __webpack_require__("@nativescript/core").ProxyViewContainer;
}, {
  skipAddToDom: true
});
registerElement('DetachedText', function () {
  return __webpack_require__("@nativescript/core").Placeholder;
}, {
  skipAddToDom: true
});
registerElement('Comment', function () {
  return __webpack_require__("@nativescript/core").Placeholder;
});
registerElement('Document', function () {
  return __webpack_require__("@nativescript/core").ProxyViewContainer;
}, {
  skipAddToDom: true
});
registerElement('Frame', function () {
  return __webpack_require__("@nativescript/core").Frame;
}, {
  insertChild: function insertChild(parentNode, childNode, atIndex) {// if (normalizeElementName(childNode.tagName) === 'nativepage') {
    // parentNode.nativeView.navigate({ create: () => childNode.nativeView })
    // }
  },
  component: frame
});
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var isobject = function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

function isObjectObject(o) {
  return isobject(o) === true && Object.prototype.toString.call(o) === '[object Object]';
}

var isPlainObject$1 = function isPlainObject(o) {
  var ctor, prot;

  if (isObjectObject(o) === false) {
    return false;
  } // If has modified constructor


  ctor = o.constructor;

  if (typeof ctor !== 'function') {
    return false;
  } // If has modified prototype


  prot = ctor.prototype;

  if (isObjectObject(prot) === false) {
    return false;
  } // If constructor does not have an Object-specific method


  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  } // Most likely a plain Object


  return true;
};

function set$1(target, path, value, options) {
  if (!isObject$1(target)) {
    return target;
  }

  var opts = options || {};
  var isArray = Array.isArray(path);

  if (!isArray && typeof path !== 'string') {
    return target;
  }

  var merge = opts.merge;

  if (merge && typeof merge !== 'function') {
    merge = Object.assign;
  }

  var keys = (isArray ? path : split(path, opts)).filter(isValidKey);
  var len = keys.length;
  var orig = target;

  if (!options && keys.length === 1) {
    result(target, keys[0], value, merge);
    return target;
  }

  for (var i = 0; i < len; i++) {
    var prop = keys[i];

    if (!isObject$1(target[prop])) {
      target[prop] = {};
    }

    if (i === len - 1) {
      result(target, prop, value, merge);
      break;
    }

    target = target[prop];
  }

  return orig;
}

function result(target, path, value, merge) {
  if (merge && isPlainObject$1(target[path]) && isPlainObject$1(value)) {
    target[path] = merge({}, target[path], value);
  } else {
    target[path] = value;
  }
}

function split(path, options) {
  var id = createKey(path, options);

  if (set$1.memo[id]) {
    return set$1.memo[id];
  }

  var char = options && options.separator ? options.separator : '.';
  var keys = [];
  var res = [];

  if (options && typeof options.split === 'function') {
    keys = options.split(path);
  } else {
    keys = path.split(char);
  }

  for (var i = 0; i < keys.length; i++) {
    var prop = keys[i];

    while (prop && prop.slice(-1) === '\\' && keys[i + 1] != null) {
      prop = prop.slice(0, -1) + char + keys[++i];
    }

    res.push(prop);
  }

  set$1.memo[id] = res;
  return res;
}

function createKey(pattern, options) {
  var id = pattern;

  if (typeof options === 'undefined') {
    return id + '';
  }

  var keys = Object.keys(options);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    id += ';' + key + '=' + String(options[key]);
  }

  return id;
}

function isValidKey(key) {
  return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

function isObject$1(val) {
  return val !== null && (typeof val === 'object' || typeof val === 'function');
}

set$1.memo = {};
var setValue = set$1;
var View;

function isView(view) {
  if (!View) {
    View = __webpack_require__("@nativescript/core").View;
  }

  return view instanceof View;
}

var LayoutBase;

function isLayout(view) {
  if (!LayoutBase) {
    LayoutBase = __webpack_require__("@nativescript/core").LayoutBase;
  }

  return view instanceof LayoutBase;
}

var ContentView;

function isContentView(view) {
  if (!ContentView) {
    ContentView = __webpack_require__("@nativescript/core").ContentView;
  }

  return view instanceof ContentView;
}

function insertChild(parentNode, childNode, atIndex) {
  if (atIndex === void 0) atIndex = -1;

  if (!parentNode) {
    return;
  }

  if (parentNode.meta && typeof parentNode.meta.insertChild === 'function') {
    return parentNode.meta.insertChild(parentNode, childNode, atIndex);
  }

  if (childNode.meta.skipAddToDom) {
    return;
  }

  var parentView = parentNode.nativeView;
  var childView = childNode.nativeView;

  if (isLayout(parentView)) {
    if (childView.parent === parentView) {
      var index = parentView.getChildIndex(childView);

      if (index !== -1) {
        parentView.removeChild(childView);
      }
    }

    if (atIndex !== -1) {
      parentView.insertChild(childView, atIndex);
    } else {
      parentView.addChild(childView);
    }
  } else if (isContentView(parentView)) {
    if (childNode.nodeType === 8) {
      parentView._addView(childView, atIndex);
    } else {
      parentView.content = childView;
    }
  } else if (parentView && parentView._addChildFromBuilder) {
    parentView._addChildFromBuilder(childNode._nativeView.constructor.name, childView);
  } else ;
}

function removeChild(parentNode, childNode) {
  if (!parentNode) {
    return;
  }

  if (parentNode.meta && typeof parentNode.meta.removeChild === 'function') {
    return parentNode.meta.removeChild(parentNode, childNode);
  }

  if (childNode.meta.skipAddToDom) {
    return;
  }

  var parentView = parentNode.nativeView;
  var childView = childNode.nativeView;

  if (isLayout(parentView)) {
    parentView.removeChild(childView);
  } else if (isContentView(parentView)) {
    if (parentView.content === childView) {
      parentView.content = null;
    }

    if (childNode.nodeType === 8) {
      parentView._removeView(childView);
    }
  } else if (isView(parentView)) {
    parentView._removeView(childView);
  } else ;
}

var XML_ATTRIBUTES = Object.freeze(['style', 'rows', 'columns', 'fontAttributes']);

var ViewNode = function ViewNode() {
  this.nodeType = null;
  this._tagName = null;
  this.parentNode = null;
  this.childNodes = [];
  this.prevSibling = null;
  this.nextSibling = null;
  this._ownerDocument = null;
  this._nativeView = null;
  this._meta = null;
  /* istanbul ignore next
   * make vue happy :)
   */

  this.hasAttribute = this.removeAttribute = function () {
    return false;
  };
};

var prototypeAccessors$2 = {
  tagName: {
    configurable: true
  },
  firstChild: {
    configurable: true
  },
  lastChild: {
    configurable: true
  },
  nativeView: {
    configurable: true
  },
  meta: {
    configurable: true
  },
  ownerDocument: {
    configurable: true
  }
};
/* istanbul ignore next */

ViewNode.prototype.toString = function toString() {
  return this.constructor.name + "(" + this.tagName + ")";
};

prototypeAccessors$2.tagName.set = function (name) {
  this._tagName = normalizeElementName(name);
};

prototypeAccessors$2.tagName.get = function () {
  return this._tagName;
};

prototypeAccessors$2.firstChild.get = function () {
  return this.childNodes.length ? this.childNodes[0] : null;
};

prototypeAccessors$2.lastChild.get = function () {
  return this.childNodes.length ? this.childNodes[this.childNodes.length - 1] : null;
};

prototypeAccessors$2.nativeView.get = function () {
  return this._nativeView;
};

prototypeAccessors$2.nativeView.set = function (view) {
  if (this._nativeView) {
    throw new Error("Can't override native view.");
  }

  this._nativeView = view;
};

prototypeAccessors$2.meta.get = function () {
  if (this._meta) {
    return this._meta;
  }

  return this._meta = getViewMeta(this.tagName);
};
/* istanbul ignore next */


prototypeAccessors$2.ownerDocument.get = function () {
  if (this._ownerDocument) {
    return this._ownerDocument;
  }

  var el = this;

  while ((el = el.parentNode).nodeType !== 9) {// do nothing
  }

  return this._ownerDocument = el;
};

ViewNode.prototype.getAttribute = function getAttribute(key) {
  return this.nativeView[key];
};
/* istanbul ignore next */


ViewNode.prototype.setAttribute = function setAttribute(key, value) {
  var isAndroid = false;
  var isIOS = true;
  var nv = this.nativeView;

  try {
    if (XML_ATTRIBUTES.indexOf(key) !== -1) {
      nv[key] = value;
    } else {
      // detect expandable attrs for boolean values
      // See https://vuejs.org/v2/guide/components-props.html#Passing-a-Boolean
      if (__webpack_require__("@nativescript/core").Utils.isBoolean(nv[key]) && value === '') {
        value = true;
      }

      if (isAndroid && key.startsWith('android:')) {
        setValue(nv, key.substr(8), value);
      } else if (isIOS && key.startsWith('ios:')) {
        setValue(nv, key.substr(4), value);
      } else if (key.endsWith('.decode')) {
        setValue(nv, key.slice(0, -7), __webpack_require__("@nativescript/core").XmlParser._dereferenceEntities(value));
      } else {
        setValue(nv, key, value);
      }
    }
  } catch (e) {// ignore
  }
};
/* istanbul ignore next */


ViewNode.prototype.setStyle = function setStyle(property, value) {
  if (!value || !(value = value.trim()).length) {
    return;
  }

  if (property.endsWith('Align')) {
    // NativeScript uses Alignment instead of Align, this ensures that text-align works
    property += 'ment';
  }

  this.nativeView.style[property] = value;
};
/* istanbul ignore next */


ViewNode.prototype.setText = function setText(text) {
  if (this.nodeType === 3) {
    this.parentNode.setText(text);
  } else {
    this.setAttribute('text', text);
  }
};
/* istanbul ignore next */


ViewNode.prototype.addEventListener = function addEventListener(event, handler) {
  this.nativeView.on(event, handler);
};
/* istanbul ignore next */


ViewNode.prototype.removeEventListener = function removeEventListener(event) {
  this.nativeView.off(event);
};

ViewNode.prototype.insertBefore = function insertBefore(childNode, referenceNode) {
  if (!childNode) {
    throw new Error("Can't insert child.");
  } // in some rare cases insertBefore is called with a null referenceNode
  // this makes sure that it get's appended as the last child


  if (!referenceNode) {
    return this.appendChild(childNode);
  }

  if (referenceNode.parentNode && referenceNode.parentNode !== this) {
    throw new Error("Can't insert child, because the reference node has a different parent.");
  }

  if (childNode.parentNode && childNode.parentNode !== this) {
    throw new Error("Can't insert child, because it already has a different parent.");
  }

  if (childNode.parentNode === this) {
    // in case the childNode is already a child node of this view
    // we need to first remove it to clean up childNodes, parentNode, prev/next siblings
    // we are adding back the child right after - this is often the case when the order
    // of children has to change (including comment nodes created by vue)
    // fixes #608
    this.removeChild(childNode); // we don't need to throw an error here, because it is a valid case
    // for example when switching the order of elements in the tree
    // fixes #127 - see for more details
    // fixes #240
    // throw new Error(`Can't insert child, because it is already a child.`)
  }

  var index = this.childNodes.indexOf(referenceNode);
  childNode.parentNode = this;
  childNode.nextSibling = referenceNode;
  childNode.prevSibling = this.childNodes[index - 1];
  referenceNode.prevSibling = childNode;
  this.childNodes.splice(index, 0, childNode);
  insertChild(this, childNode, index);
};

ViewNode.prototype.appendChild = function appendChild(childNode) {
  if (!childNode) {
    throw new Error("Can't append child.");
  }

  if (childNode.parentNode && childNode.parentNode !== this) {
    throw new Error("Can't append child, because it already has a different parent.");
  }

  if (childNode.parentNode === this) ;
  childNode.parentNode = this;

  if (this.lastChild) {
    childNode.prevSibling = this.lastChild;
    this.lastChild.nextSibling = childNode;
  }

  this.childNodes.push(childNode);
  insertChild(this, childNode);
};

ViewNode.prototype.removeChild = function removeChild$1(childNode) {
  if (!childNode) {
    throw new Error("Can't remove child.");
  }

  if (!childNode.parentNode) {
    throw new Error("Can't remove child, because it has no parent.");
  }

  if (childNode.parentNode !== this) {
    throw new Error("Can't remove child, because it has a different parent.");
  }

  childNode.parentNode = null;

  if (childNode.prevSibling) {
    childNode.prevSibling.nextSibling = childNode.nextSibling;
  }

  if (childNode.nextSibling) {
    childNode.nextSibling.prevSibling = childNode.prevSibling;
  } // reset the prevSibling and nextSibling. If not, a keep-alived component will
  // still have a filled nextSibling attribute so vue will not
  // insert the node again to the parent. See #220


  childNode.prevSibling = null;
  childNode.nextSibling = null;
  this.childNodes = this.childNodes.filter(function (node) {
    return node !== childNode;
  });
  removeChild(this, childNode);
};

Object.defineProperties(ViewNode.prototype, prototypeAccessors$2);
var VUE_ELEMENT_REF = '__vue_element_ref__';

var ElementNode = /*@__PURE__*/function (ViewNode) {
  function ElementNode(tagName) {
    ViewNode.call(this);
    this.nodeType = 1;
    this.tagName = tagName;
    var viewClass = getViewClass(tagName);

    if (!viewClass) {
      throw new TypeError("No native component for element tag name " + tagName + ".");
    }

    this._nativeView = new viewClass();
    this._nativeView[VUE_ELEMENT_REF] = this;
  }

  if (ViewNode) ElementNode.__proto__ = ViewNode;
  ElementNode.prototype = Object.create(ViewNode && ViewNode.prototype);
  ElementNode.prototype.constructor = ElementNode;

  ElementNode.prototype.toString = function toString() {
    return this.nativeView.toString();
  };

  ElementNode.prototype.appendChild = function appendChild(childNode) {
    ViewNode.prototype.appendChild.call(this, childNode);

    if (childNode.nodeType === 3) {
      this.setText(childNode.text);
    }
  };

  ElementNode.prototype.insertBefore = function insertBefore(childNode, referenceNode) {
    ViewNode.prototype.insertBefore.call(this, childNode, referenceNode);

    if (childNode.nodeType === 3) {
      this.setText(childNode.text);
    }
  };

  ElementNode.prototype.removeChild = function removeChild(childNode) {
    ViewNode.prototype.removeChild.call(this, childNode);

    if (childNode.nodeType === 3) {
      this.setText('');
    }
  };

  return ElementNode;
}(ViewNode);

var CommentNode = /*@__PURE__*/function (ElementNode) {
  function CommentNode(text) {
    ElementNode.call(this, 'comment');
    this.nodeType = 8;
    this.text = text;
  }

  if (ElementNode) CommentNode.__proto__ = ElementNode;
  CommentNode.prototype = Object.create(ElementNode && ElementNode.prototype);
  CommentNode.prototype.constructor = CommentNode;
  return CommentNode;
}(ElementNode);

var TextNode = /*@__PURE__*/function (ViewNode) {
  function TextNode(text) {
    ViewNode.call(this);
    this.nodeType = 3;
    this.text = text;
    this._meta = {
      skipAddToDom: true
    };
  }

  if (ViewNode) TextNode.__proto__ = ViewNode;
  TextNode.prototype = Object.create(ViewNode && ViewNode.prototype);
  TextNode.prototype.constructor = TextNode;

  TextNode.prototype.setText = function setText(text) {
    this.text = text;
    this.parentNode.setText(text);
  };

  return TextNode;
}(ViewNode);

var DocumentNode = /*@__PURE__*/function (ViewNode) {
  function DocumentNode() {
    ViewNode.call(this);
    this.nodeType = 9;
    this.documentElement = new ElementNode('document'); // make static methods accessible via this

    this.createComment = this.constructor.createComment;
    this.createElement = this.constructor.createElement;
    this.createElementNS = this.constructor.createElementNS;
    this.createTextNode = this.constructor.createTextNode;
  }

  if (ViewNode) DocumentNode.__proto__ = ViewNode;
  DocumentNode.prototype = Object.create(ViewNode && ViewNode.prototype);
  DocumentNode.prototype.constructor = DocumentNode;

  DocumentNode.createComment = function createComment(text) {
    try {
      return new CommentNode(text);
    } catch (err) {
      console.log(err);
    }
  };

  DocumentNode.createElement = function createElement(tagName) {
    try {
      return new ElementNode(tagName);
    } catch (err) {
      console.log(err);
    }
  };

  DocumentNode.createElementNS = function createElementNS(namespace, tagName) {
    try {
      return new ElementNode(namespace + ':' + tagName);
    } catch (err) {
      console.log(err);
    }
  };

  DocumentNode.createTextNode = function createTextNode(text) {
    try {
      return new TextNode(text);
    } catch (err) {
      console.log(err);
    }
  };

  return DocumentNode;
}(ViewNode);

var namespaceMap = {};

function createElement$1(tagName, vnode) {
  trace("CreateElement(" + tagName.replace(/^native/i, '') + ")");
  return DocumentNode.createElement(tagName);
}

function createElementNS(namespace, tagName) {
  trace("CreateElementNS(" + namespace + "#" + tagName + ")");
  return DocumentNode.createElementNS(namespace, tagName);
}

function createTextNode(text) {
  trace("CreateTextNode(" + text + ")");
  return DocumentNode.createTextNode(text);
}

function createComment(text) {
  trace("CreateComment(" + text + ")");
  return DocumentNode.createComment(text);
}

function insertBefore(parentNode, newNode, referenceNode) {
  trace("InsertBefore(" + parentNode + ", " + newNode + ", " + referenceNode + ")");
  return parentNode.insertBefore(newNode, referenceNode);
}

function removeChild$1(node, child) {
  trace("RemoveChild(" + node + ", " + child + ")");
  return node.removeChild(child);
}

function appendChild(node, child) {
  trace("AppendChild(" + node + ", " + child + ")");
  return node.appendChild(child);
}

function parentNode(node) {
  trace("ParentNode(" + node + ") -> " + node.parentNode);
  return node.parentNode;
}

function nextSibling(node) {
  trace("NextSibling(" + node + ") -> " + node.nextSibling);
  return node.nextSibling;
}

function tagName(elementNode) {
  trace("TagName(" + elementNode + ") -> " + elementNode.tagName);
  return elementNode.tagName;
}

function setTextContent(node, text) {
  trace("SetTextContent(" + node + ", " + text + ")");
  node.setText(text);
}

function setAttribute(node, key, val) {
  trace("SetAttribute(" + node + ", " + key + ", " + val + ")");
  node.setAttribute(key, val);
}

function setStyleScope(node, scopeId) {
  node.setAttribute(scopeId, '');
}

var nodeOps = /*#__PURE__*/Object.freeze({
  __proto__: null,
  namespaceMap: namespaceMap,
  createElement: createElement$1,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  createComment: createComment,
  insertBefore: insertBefore,
  removeChild: removeChild$1,
  appendChild: appendChild,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent,
  setAttribute: setAttribute,
  setStyleScope: setStyleScope
});
var modules = platformModules.concat(baseModules);
var patch = createPatchFunction({
  nodeOps: nodeOps,
  modules: modules
});
var he = {
  decode: decode
};

function decode(html) {
  // todo?
  return html;
}
/*  */


var isUnaryTag$1 = makeMap('area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' + 'link,meta,param,source,track,wbr'); // Elements that you can, intentionally, leave open
// (and which close themselves)

var canBeLeftOpenTag$1 = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'); // HTML5 tags https://html.spec.whatwg.org/multipage/indices.html#elements-3
// Phrasing Content https://html.spec.whatwg.org/multipage/dom.html#phrasing-content

var isNonPhrasingTag = makeMap('address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' + 'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' + 'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' + 'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' + 'title,tr,track');
/**
 * Not type-checking this file because it's mostly vendor code.
 */
// Regular Expressions for parsing tags and attributes

var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
var dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + unicodeRegExp.source + "]*";
var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
var startTagOpen = new RegExp("^<" + qnameCapture);
var startTagClose = /^\s*(\/?)>/;
var endTag = new RegExp("^<\\/" + qnameCapture + "[^>]*>");
var doctype = /^<!DOCTYPE [^>]+>/i; // #7298: escape - to avoid being passed as HTML comment when inlined in page

var comment = /^<!\--/;
var conditionalComment = /^<!\[/; // Special Elements (can contain anything)

var isPlainTextElement = makeMap('script,style,textarea', true);
var reCache = {};
var decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n',
  '&#9;': '\t',
  '&#39;': "'"
};
var encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g; // #5992

var isIgnoreNewlineTag = makeMap('pre,textarea', true);

var shouldIgnoreFirstNewline = function (tag, html) {
  return tag && isIgnoreNewlineTag(tag) && html[0] === '\n';
};

function decodeAttr(value, shouldDecodeNewlines) {
  var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
  return value.replace(re, function (match) {
    return decodingMap[match];
  });
}

function parseHTML(html, options) {
  var stack = [];
  var expectHTML = options.expectHTML;
  var isUnaryTag = options.isUnaryTag || no;
  var canBeLeftOpenTag = options.canBeLeftOpenTag || no;
  var index = 0;
  var last, lastTag;

  while (html) {
    last = html; // Make sure we're not in a plaintext content element like script/style

    if (!lastTag || !isPlainTextElement(lastTag)) {
      var textEnd = html.indexOf('<');

      if (textEnd === 0) {
        // Comment:
        if (comment.test(html)) {
          var commentEnd = html.indexOf('-->');

          if (commentEnd >= 0) {
            if (options.shouldKeepComment) {
              options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
            }

            advance(commentEnd + 3);
            continue;
          }
        } // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment


        if (conditionalComment.test(html)) {
          var conditionalEnd = html.indexOf(']>');

          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2);
            continue;
          }
        } // Doctype:


        var doctypeMatch = html.match(doctype);

        if (doctypeMatch) {
          advance(doctypeMatch[0].length);
          continue;
        } // End tag:


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          var curIndex = index;
          advance(endTagMatch[0].length);
          parseEndTag(endTagMatch[1], curIndex, index);
          continue;
        } // Start tag:


        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          handleStartTag(startTagMatch);

          if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
            advance(1);
          }

          continue;
        }
      }

      var text = void 0,
          rest = void 0,
          next = void 0;

      if (textEnd >= 0) {
        rest = html.slice(textEnd);

        while (!endTag.test(rest) && !startTagOpen.test(rest) && !comment.test(rest) && !conditionalComment.test(rest)) {
          // < in plain text, be forgiving and treat it as text
          next = rest.indexOf('<', 1);

          if (next < 0) {
            break;
          }

          textEnd += next;
          rest = html.slice(textEnd);
        }

        text = html.substring(0, textEnd);
      }

      if (textEnd < 0) {
        text = html;
      }

      if (text) {
        advance(text.length);
      }

      if (options.chars && text) {
        options.chars(text, index - text.length, index);
      }
    } else {
      var endTagLength = 0;
      var stackedTag = lastTag.toLowerCase();
      var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));
      var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length;

        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text.replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
          .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
        }

        if (shouldIgnoreFirstNewline(stackedTag, text)) {
          text = text.slice(1);
        }

        if (options.chars) {
          options.chars(text);
        }

        return '';
      });
      index += html.length - rest$1.length;
      html = rest$1;
      parseEndTag(stackedTag, index - endTagLength, index);
    }

    if (html === last) {
      options.chars && options.chars(html);

      if ( true && !stack.length && options.warn) {
        options.warn("Mal-formatted tag at end of template: \"" + html + "\"", {
          start: index + html.length
        });
      }

      break;
    }
  } // Clean up any remaining tags


  parseEndTag();

  function advance(n) {
    index += n;
    html = html.substring(n);
  }

  function parseStartTag() {
    var start = html.match(startTagOpen);

    if (start) {
      var match = {
        tagName: start[1],
        attrs: [],
        start: index
      };
      advance(start[0].length);
      var end, attr;

      while (!(end = html.match(startTagClose)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
        attr.start = index;
        advance(attr[0].length);
        attr.end = index;
        match.attrs.push(attr);
      }

      if (end) {
        match.unarySlash = end[1];
        advance(end[0].length);
        match.end = index;
        return match;
      }
    }
  }

  function handleStartTag(match) {
    var tagName = match.tagName;
    var unarySlash = match.unarySlash;

    if (expectHTML) {
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        parseEndTag(lastTag);
      }

      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        parseEndTag(tagName);
      }
    }

    var unary = isUnaryTag(tagName) || !!unarySlash;
    var l = match.attrs.length;
    var attrs = new Array(l);

    for (var i = 0; i < l; i++) {
      var args = match.attrs[i];
      var value = args[3] || args[4] || args[5] || '';
      var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href' ? options.shouldDecodeNewlinesForHref : options.shouldDecodeNewlines;
      attrs[i] = {
        name: args[1],
        value: decodeAttr(value, shouldDecodeNewlines)
      };

      if ( true && options.outputSourceRange) {
        attrs[i].start = args.start + args[0].match(/^\s*/).length;
        attrs[i].end = args.end;
      }
    }

    if (!unary) {
      stack.push({
        tag: tagName,
        lowerCasedTag: tagName.toLowerCase(),
        attrs: attrs,
        start: match.start,
        end: match.end
      });
      lastTag = tagName;
    }

    if (options.start) {
      options.start(tagName, attrs, unary, match.start, match.end);
    }
  }

  function parseEndTag(tagName, start, end) {
    var pos, lowerCasedTagName;

    if (start == null) {
      start = index;
    }

    if (end == null) {
      end = index;
    } // Find the closest opened tag of the same type


    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase();

      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break;
        }
      }
    } else {
      // If no tag name is provided, clean shop
      pos = 0;
    }

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (var i = stack.length - 1; i >= pos; i--) {
        if ( true && (i > pos || !tagName) && options.warn) {
          options.warn("tag <" + stack[i].tag + "> has no matching end tag.", {
            start: stack[i].start,
            end: stack[i].end
          });
        }

        if (options.end) {
          options.end(stack[i].tag, start, end);
        }
      } // Remove the open elements from the stack


      stack.length = pos;
      lastTag = pos && stack[pos - 1].tag;
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end);
      }
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end);
      }

      if (options.end) {
        options.end(tagName, start, end);
      }
    }
  }
}
/*  */


var validDivisionCharRE = /[\w).+\-_$\]]/;

function parseFilters(exp) {
  var inSingle = false;
  var inDouble = false;
  var inTemplateString = false;
  var inRegex = false;
  var curly = 0;
  var square = 0;
  var paren = 0;
  var lastFilterIndex = 0;
  var c, prev, i, expression, filters;

  for (i = 0; i < exp.length; i++) {
    prev = c;
    c = exp.charCodeAt(i);

    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) {
        inSingle = false;
      }
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) {
        inDouble = false;
      }
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) {
        inTemplateString = false;
      }
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) {
        inRegex = false;
      }
    } else if (c === 0x7C && // pipe
    exp.charCodeAt(i + 1) !== 0x7C && exp.charCodeAt(i - 1) !== 0x7C && !curly && !square && !paren) {
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1;
        expression = exp.slice(0, i).trim();
      } else {
        pushFilter();
      }
    } else {
      switch (c) {
        case 0x22:
          inDouble = true;
          break;
        // "

        case 0x27:
          inSingle = true;
          break;
        // '

        case 0x60:
          inTemplateString = true;
          break;
        // `

        case 0x28:
          paren++;
          break;
        // (

        case 0x29:
          paren--;
          break;
        // )

        case 0x5B:
          square++;
          break;
        // [

        case 0x5D:
          square--;
          break;
        // ]

        case 0x7B:
          curly++;
          break;
        // {

        case 0x7D:
          curly--;
          break;
        // }
      }

      if (c === 0x2f) {
        // /
        var j = i - 1;
        var p = void 0; // find first non-whitespace prev char

        for (; j >= 0; j--) {
          p = exp.charAt(j);

          if (p !== ' ') {
            break;
          }
        }

        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true;
        }
      }
    }
  }

  if (expression === undefined) {
    expression = exp.slice(0, i).trim();
  } else if (lastFilterIndex !== 0) {
    pushFilter();
  }

  function pushFilter() {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
    lastFilterIndex = i + 1;
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i]);
    }
  }

  return expression;
}

function wrapFilter(exp, filter) {
  var i = filter.indexOf('(');

  if (i < 0) {
    // _f: resolveFilter
    return "_f(\"" + filter + "\")(" + exp + ")";
  } else {
    var name = filter.slice(0, i);
    var args = filter.slice(i + 1);
    return "_f(\"" + name + "\")(" + exp + (args !== ')' ? ',' + args : args);
  }
}
/*  */


var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;
var buildRegex = cached(function (delimiters) {
  var open = delimiters[0].replace(regexEscapeRE, '\\$&');
  var close = delimiters[1].replace(regexEscapeRE, '\\$&');
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g');
});

function parseText(text, delimiters) {
  var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;

  if (!tagRE.test(text)) {
    return;
  }

  var tokens = [];
  var rawTokens = [];
  var lastIndex = tagRE.lastIndex = 0;
  var match, index, tokenValue;

  while (match = tagRE.exec(text)) {
    index = match.index; // push text token

    if (index > lastIndex) {
      rawTokens.push(tokenValue = text.slice(lastIndex, index));
      tokens.push(JSON.stringify(tokenValue));
    } // tag token


    var exp = parseFilters(match[1].trim());
    tokens.push("_s(" + exp + ")");
    rawTokens.push({
      '@binding': exp
    });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    rawTokens.push(tokenValue = text.slice(lastIndex));
    tokens.push(JSON.stringify(tokenValue));
  }

  return {
    expression: tokens.join('+'),
    tokens: rawTokens
  };
}
/*  */

/**
 * Cross-platform code generation for component v-model
 */


function genComponentModel(el, value, modifiers) {
  var ref = modifiers || {};
  var number = ref.number;
  var trim = ref.trim;
  var baseValueExpression = '$$v';
  var valueExpression = baseValueExpression;

  if (trim) {
    valueExpression = "(typeof " + baseValueExpression + " === 'string'" + "? " + baseValueExpression + ".trim()" + ": " + baseValueExpression + ")";
  }

  if (number) {
    valueExpression = "_n(" + valueExpression + ")";
  }

  var assignment = genAssignmentCode(value, valueExpression);
  el.model = {
    value: "(" + value + ")",
    expression: JSON.stringify(value),
    callback: "function (" + baseValueExpression + ") {" + assignment + "}"
  };
}
/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */


function genAssignmentCode(value, assignment) {
  var res = parseModel(value);

  if (res.key === null) {
    return value + "=" + assignment;
  } else {
    return "$set(" + res.exp + ", " + res.key + ", " + assignment + ")";
  }
}
/**
 * Parse a v-model expression into a base path and a final key segment.
 * Handles both dot-path and possible square brackets.
 *
 * Possible cases:
 *
 * - test
 * - test[key]
 * - test[test1[key]]
 * - test["a"][key]
 * - xxx.test[a[a].test1[key]]
 * - test.xxx.a["asa"][test1[key]]
 *
 */


var len, str, chr, index$1, expressionPos, expressionEndPos;

function parseModel(val) {
  // Fix https://github.com/vuejs/vue/pull/7730
  // allow v-model="obj.val " (trailing whitespace)
  val = val.trim();
  len = val.length;

  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
    index$1 = val.lastIndexOf('.');

    if (index$1 > -1) {
      return {
        exp: val.slice(0, index$1),
        key: '"' + val.slice(index$1 + 1) + '"'
      };
    } else {
      return {
        exp: val,
        key: null
      };
    }
  }

  str = val;
  index$1 = expressionPos = expressionEndPos = 0;

  while (!eof()) {
    chr = next();
    /* istanbul ignore if */

    if (isStringStart(chr)) {
      parseString(chr);
    } else if (chr === 0x5B) {
      parseBracket(chr);
    }
  }

  return {
    exp: val.slice(0, expressionPos),
    key: val.slice(expressionPos + 1, expressionEndPos)
  };
}

function next() {
  return str.charCodeAt(++index$1);
}

function eof() {
  return index$1 >= len;
}

function isStringStart(chr) {
  return chr === 0x22 || chr === 0x27;
}

function parseBracket(chr) {
  var inBracket = 1;
  expressionPos = index$1;

  while (!eof()) {
    chr = next();

    if (isStringStart(chr)) {
      parseString(chr);
      continue;
    }

    if (chr === 0x5B) {
      inBracket++;
    }

    if (chr === 0x5D) {
      inBracket--;
    }

    if (inBracket === 0) {
      expressionEndPos = index$1;
      break;
    }
  }
}

function parseString(chr) {
  var stringQuote = chr;

  while (!eof()) {
    chr = next();

    if (chr === stringQuote) {
      break;
    }
  }
}
/*  */

/* eslint-disable no-unused-vars */


function baseWarn(msg, range) {
  console.error("[Vue compiler]: " + msg);
}
/* eslint-enable no-unused-vars */


function pluckModuleFunction(modules, key) {
  return modules ? modules.map(function (m) {
    return m[key];
  }).filter(function (_) {
    return _;
  }) : [];
}

function addProp(el, name, value, range, dynamic) {
  (el.props || (el.props = [])).push(rangeSetItem({
    name: name,
    value: value,
    dynamic: dynamic
  }, range));
  el.plain = false;
}

function addAttr(el, name, value, range, dynamic) {
  var attrs = dynamic ? el.dynamicAttrs || (el.dynamicAttrs = []) : el.attrs || (el.attrs = []);
  attrs.push(rangeSetItem({
    name: name,
    value: value,
    dynamic: dynamic
  }, range));
  el.plain = false;
} // add a raw attr (use this in preTransforms)


function addRawAttr(el, name, value, range) {
  el.attrsMap[name] = value;
  el.attrsList.push(rangeSetItem({
    name: name,
    value: value
  }, range));
}

function addDirective(el, name, rawName, value, arg, isDynamicArg, modifiers, range) {
  (el.directives || (el.directives = [])).push(rangeSetItem({
    name: name,
    rawName: rawName,
    value: value,
    arg: arg,
    isDynamicArg: isDynamicArg,
    modifiers: modifiers
  }, range));
  el.plain = false;
}

function prependModifierMarker(symbol, name, dynamic) {
  return dynamic ? "_p(" + name + ",\"" + symbol + "\")" : symbol + name; // mark the event as captured
}

function addHandler(el, name, value, modifiers, important, warn, range, dynamic) {
  modifiers = modifiers || emptyObject; // warn prevent and passive modifier

  /* istanbul ignore if */

  if ( true && warn && modifiers.prevent && modifiers.passive) {
    warn('passive and prevent can\'t be used together. ' + 'Passive handler can\'t prevent default event.', range);
  } // normalize click.right and click.middle since they don't actually fire
  // this is technically browser-specific, but at least for now browsers are
  // the only target envs that have right/middle clicks.


  if (modifiers.right) {
    if (dynamic) {
      name = "(" + name + ")==='click'?'contextmenu':(" + name + ")";
    } else if (name === 'click') {
      name = 'contextmenu';
      delete modifiers.right;
    }
  } else if (modifiers.middle) {
    if (dynamic) {
      name = "(" + name + ")==='click'?'mouseup':(" + name + ")";
    } else if (name === 'click') {
      name = 'mouseup';
    }
  } // check capture modifier


  if (modifiers.capture) {
    delete modifiers.capture;
    name = prependModifierMarker('!', name, dynamic);
  }

  if (modifiers.once) {
    delete modifiers.once;
    name = prependModifierMarker('~', name, dynamic);
  }
  /* istanbul ignore if */


  if (modifiers.passive) {
    delete modifiers.passive;
    name = prependModifierMarker('&', name, dynamic);
  }

  var events;

  if (modifiers.native) {
    delete modifiers.native;
    events = el.nativeEvents || (el.nativeEvents = {});
  } else {
    events = el.events || (el.events = {});
  }

  var newHandler = rangeSetItem({
    value: value.trim(),
    dynamic: dynamic
  }, range);

  if (modifiers !== emptyObject) {
    newHandler.modifiers = modifiers;
  }

  var handlers = events[name];
  /* istanbul ignore if */

  if (Array.isArray(handlers)) {
    important ? handlers.unshift(newHandler) : handlers.push(newHandler);
  } else if (handlers) {
    events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
  } else {
    events[name] = newHandler;
  }

  el.plain = false;
}

function getRawBindingAttr(el, name) {
  return el.rawAttrsMap[':' + name] || el.rawAttrsMap['v-bind:' + name] || el.rawAttrsMap[name];
}

function getBindingAttr(el, name, getStatic) {
  var dynamicValue = getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name);

  if (dynamicValue != null) {
    return parseFilters(dynamicValue);
  } else if (getStatic !== false) {
    var staticValue = getAndRemoveAttr(el, name);

    if (staticValue != null) {
      return JSON.stringify(staticValue);
    }
  }
} // note: this only removes the attr from the Array (attrsList) so that it
// doesn't get processed by processAttrs.
// By default it does NOT remove it from the map (attrsMap) because the map is
// needed during codegen.


function getAndRemoveAttr(el, name, removeFromMap) {
  var val;

  if ((val = el.attrsMap[name]) != null) {
    var list = el.attrsList;

    for (var i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1);
        break;
      }
    }
  }

  if (removeFromMap) {
    delete el.attrsMap[name];
  }

  return val;
}

function getAndRemoveAttrByRegex(el, name) {
  var list = el.attrsList;

  for (var i = 0, l = list.length; i < l; i++) {
    var attr = list[i];

    if (name.test(attr.name)) {
      list.splice(i, 1);
      return attr;
    }
  }
}

function rangeSetItem(item, range) {
  if (range) {
    if (range.start != null) {
      item.start = range.start;
    }

    if (range.end != null) {
      item.end = range.end;
    }
  }

  return item;
}
/*  */


var onRE = /^@|^v-on:/;
var dirRE = /^v-|^@|^:|^#/;
var forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
var forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
var stripParensRE = /^\(|\)$/g;
var dynamicArgRE = /^\[.*\]$/;
var argRE = /:(.*)$/;
var bindRE = /^:|^\.|^v-bind:/;
var modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;
var slotRE = /^v-slot(:|$)|^#/;
var lineBreakRE = /[\r\n]/;
var whitespaceRE$1 = /\s+/g;
var invalidAttributeRE = /[\s"'<>\/=]/;
var decodeHTMLCached = cached(he.decode);
var emptySlotScopeToken = "_empty_"; // configurable state

var warn$1;
var delimiters;
var transforms;
var preTransforms;
var postTransforms;
var platformIsPreTag;
var platformMustUseProp;
var platformGetTagNamespace;
var maybeComponent;

function createASTElement(tag, attrs, parent) {
  return {
    type: 1,
    tag: tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    rawAttrsMap: {},
    parent: parent,
    children: []
  };
}
/**
 * Convert HTML string to AST.
 */


function parse(template, options) {
  warn$1 = options.warn || baseWarn;
  platformIsPreTag = options.isPreTag || no;
  platformMustUseProp = options.mustUseProp || no;
  platformGetTagNamespace = options.getTagNamespace || no;
  var isReservedTag = options.isReservedTag || no;

  maybeComponent = function (el) {
    return !!el.component || !isReservedTag(el.tag);
  };

  transforms = pluckModuleFunction(options.modules, 'transformNode');
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');
  delimiters = options.delimiters;
  var stack = [];
  var preserveWhitespace = options.preserveWhitespace !== false;
  var whitespaceOption = options.whitespace;
  var root;
  var currentParent;
  var inVPre = false;
  var inPre = false;
  var warned = false;

  function warnOnce(msg, range) {
    if (!warned) {
      warned = true;
      warn$1(msg, range);
    }
  }

  function closeElement(element) {
    trimEndingWhitespace(element);

    if (!inVPre && !element.processed) {
      element = processElement(element, options);
    } // tree management


    if (!stack.length && element !== root) {
      // allow root elements with v-if, v-else-if and v-else
      if (root.if && (element.elseif || element.else)) {
        if (true) {
          checkRootConstraints(element);
        }

        addIfCondition(root, {
          exp: element.elseif,
          block: element
        });
      } else if (true) {
        warnOnce("Component template should contain exactly one root element. " + "If you are using v-if on multiple elements, " + "use v-else-if to chain them instead.", {
          start: element.start
        });
      }
    }

    if (currentParent && !element.forbidden) {
      if (element.elseif || element.else) {
        processIfConditions(element, currentParent);
      } else {
        if (element.slotScope) {
          // scoped slot
          // keep it in the children list so that v-else(-if) conditions can
          // find it as the prev node.
          var name = element.slotTarget || '"default"';
          (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
        }

        currentParent.children.push(element);
        element.parent = currentParent;
      }
    } // final children cleanup
    // filter out scoped slots


    element.children = element.children.filter(function (c) {
      return !c.slotScope;
    }); // remove trailing whitespace node again

    trimEndingWhitespace(element); // check pre state

    if (element.pre) {
      inVPre = false;
    }

    if (platformIsPreTag(element.tag)) {
      inPre = false;
    } // apply post-transforms


    for (var i = 0; i < postTransforms.length; i++) {
      postTransforms[i](element, options);
    }
  }

  function trimEndingWhitespace(el) {
    // remove trailing whitespace node
    if (!inPre) {
      var lastNode;

      while ((lastNode = el.children[el.children.length - 1]) && lastNode.type === 3 && lastNode.text === ' ') {
        el.children.pop();
      }
    }
  }

  function checkRootConstraints(el) {
    if (el.tag === 'slot' || el.tag === 'template') {
      warnOnce("Cannot use <" + el.tag + "> as component root element because it may " + 'contain multiple nodes.', {
        start: el.start
      });
    }

    if (el.attrsMap.hasOwnProperty('v-for')) {
      warnOnce('Cannot use v-for on stateful component root element because ' + 'it renders multiple elements.', el.rawAttrsMap['v-for']);
    }
  }

  parseHTML(template, {
    warn: warn$1,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
    shouldKeepComment: options.comments,
    outputSourceRange: options.outputSourceRange,
    start: function start(tag, attrs, unary, start$1, end) {
      // check namespace.
      // inherit parent ns if there is one
      var ns = currentParent && currentParent.ns || platformGetTagNamespace(tag); // handle IE svg bug

      /* istanbul ignore if */

      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs);
      }

      var element = createASTElement(tag, attrs, currentParent);

      if (ns) {
        element.ns = ns;
      }

      if (true) {
        if (options.outputSourceRange) {
          element.start = start$1;
          element.end = end;
          element.rawAttrsMap = element.attrsList.reduce(function (cumulated, attr) {
            cumulated[attr.name] = attr;
            return cumulated;
          }, {});
        }

        attrs.forEach(function (attr) {
          if (invalidAttributeRE.test(attr.name)) {
            warn$1("Invalid dynamic argument expression: attribute names cannot contain " + "spaces, quotes, <, >, / or =.", {
              start: attr.start + attr.name.indexOf("["),
              end: attr.start + attr.name.length
            });
          }
        });
      }

      if (isForbiddenTag(element) && !isServerRendering()) {
        element.forbidden = true;
         true && warn$1('Templates should only be responsible for mapping the state to the ' + 'UI. Avoid placing tags with side-effects in your templates, such as ' + "<" + tag + ">" + ', as they will not be parsed.', {
          start: element.start
        });
      } // apply pre-transforms


      for (var i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element;
      }

      if (!inVPre) {
        processPre(element);

        if (element.pre) {
          inVPre = true;
        }
      }

      if (platformIsPreTag(element.tag)) {
        inPre = true;
      }

      if (inVPre) {
        processRawAttrs(element);
      } else if (!element.processed) {
        // structural directives
        processFor(element);
        processIf(element);
        processOnce(element);
      }

      if (!root) {
        root = element;

        if (true) {
          checkRootConstraints(root);
        }
      }

      if (!unary) {
        currentParent = element;
        stack.push(element);
      } else {
        closeElement(element);
      }
    },
    end: function end(tag, start, end$1) {
      var element = stack[stack.length - 1]; // pop stack

      stack.length -= 1;
      currentParent = stack[stack.length - 1];

      if ( true && options.outputSourceRange) {
        element.end = end$1;
      }

      closeElement(element);
    },
    chars: function chars(text, start, end) {
      if (!currentParent) {
        if (true) {
          if (text === template) {
            warnOnce('Component template requires a root element, rather than just text.', {
              start: start
            });
          } else if (text = text.trim()) {
            warnOnce("text \"" + text + "\" outside root element will be ignored.", {
              start: start
            });
          }
        }

        return;
      } // IE textarea placeholder bug

      /* istanbul ignore if */


      if (isIE && currentParent.tag === 'textarea' && currentParent.attrsMap.placeholder === text) {
        return;
      }

      var children = currentParent.children;

      if (inPre || text.trim()) {
        text = isTextTag(currentParent) ? text : decodeHTMLCached(text);
      } else if (!children.length) {
        // remove the whitespace-only node right after an opening tag
        text = '';
      } else if (whitespaceOption) {
        if (whitespaceOption === 'condense') {
          // in condense mode, remove the whitespace node if it contains
          // line break, otherwise condense to a single space
          text = lineBreakRE.test(text) ? '' : ' ';
        } else {
          text = ' ';
        }
      } else {
        text = preserveWhitespace ? ' ' : '';
      }

      if (text) {
        if (!inPre && whitespaceOption === 'condense') {
          // condense consecutive whitespaces into single space
          text = text.replace(whitespaceRE$1, ' ');
        }

        var res;
        var child;

        if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
          child = {
            type: 2,
            expression: res.expression,
            tokens: res.tokens,
            text: text
          };
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          child = {
            type: 3,
            text: text
          };
        }

        if (child) {
          if ( true && options.outputSourceRange) {
            child.start = start;
            child.end = end;
          }

          children.push(child);
        }
      }
    },
    comment: function comment(text, start, end) {
      // adding anything as a sibling to the root node is forbidden
      // comments should still be allowed, but ignored
      if (currentParent) {
        var child = {
          type: 3,
          text: text,
          isComment: true
        };

        if ( true && options.outputSourceRange) {
          child.start = start;
          child.end = end;
        }

        currentParent.children.push(child);
      }
    }
  });
  return root;
}

function processPre(el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true;
  }
}

function processRawAttrs(el) {
  var list = el.attrsList;
  var len = list.length;

  if (len) {
    var attrs = el.attrs = new Array(len);

    for (var i = 0; i < len; i++) {
      attrs[i] = {
        name: list[i].name,
        value: JSON.stringify(list[i].value)
      };

      if (list[i].start != null) {
        attrs[i].start = list[i].start;
        attrs[i].end = list[i].end;
      }
    }
  } else if (!el.pre) {
    // non root node in pre blocks with no attributes
    el.plain = true;
  }
}

function processElement(element, options) {
  processKey(element); // determine whether this is a plain element after
  // removing structural attributes

  element.plain = !element.key && !element.scopedSlots && !element.attrsList.length;
  processRef(element);
  processSlotContent(element);
  processSlotOutlet(element);
  processComponent(element);

  for (var i = 0; i < transforms.length; i++) {
    element = transforms[i](element, options) || element;
  }

  processAttrs(element);
  return element;
}

function processKey(el) {
  var exp = getBindingAttr(el, 'key');

  if (exp) {
    if (true) {
      if (el.tag === 'template') {
        warn$1("<template> cannot be keyed. Place the key on real elements instead.", getRawBindingAttr(el, 'key'));
      }

      if (el.for) {
        var iterator = el.iterator2 || el.iterator1;
        var parent = el.parent;

        if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
          warn$1("Do not use v-for index as key on <transition-group> children, " + "this is the same as not using keys.", getRawBindingAttr(el, 'key'), true
          /* tip */
          );
        }
      }
    }

    el.key = exp;
  }
}

function processRef(el) {
  var ref = getBindingAttr(el, 'ref');

  if (ref) {
    el.ref = ref;
    el.refInFor = checkInFor(el);
  }
}

function processFor(el) {
  var exp;

  if (exp = getAndRemoveAttr(el, 'v-for')) {
    var res = parseFor(exp);

    if (res) {
      extend(el, res);
    } else if (true) {
      warn$1("Invalid v-for expression: " + exp, el.rawAttrsMap['v-for']);
    }
  }
}

function parseFor(exp) {
  var inMatch = exp.match(forAliasRE);

  if (!inMatch) {
    return;
  }

  var res = {};
  res.for = inMatch[2].trim();
  var alias = inMatch[1].trim().replace(stripParensRE, '');
  var iteratorMatch = alias.match(forIteratorRE);

  if (iteratorMatch) {
    res.alias = alias.replace(forIteratorRE, '').trim();
    res.iterator1 = iteratorMatch[1].trim();

    if (iteratorMatch[2]) {
      res.iterator2 = iteratorMatch[2].trim();
    }
  } else {
    res.alias = alias;
  }

  return res;
}

function processIf(el) {
  var exp = getAndRemoveAttr(el, 'v-if');

  if (exp) {
    el.if = exp;
    addIfCondition(el, {
      exp: exp,
      block: el
    });
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true;
    }

    var elseif = getAndRemoveAttr(el, 'v-else-if');

    if (elseif) {
      el.elseif = elseif;
    }
  }
}

function processIfConditions(el, parent) {
  var prev = findPrevElement(parent.children);

  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    });
  } else if (true) {
    warn$1("v-" + (el.elseif ? 'else-if="' + el.elseif + '"' : 'else') + " " + "used on element <" + el.tag + "> without corresponding v-if.", el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else']);
  }
}

function findPrevElement(children) {
  var i = children.length;

  while (i--) {
    if (children[i].type === 1) {
      return children[i];
    } else {
      if ( true && children[i].text !== ' ') {
        warn$1("text \"" + children[i].text.trim() + "\" between v-if and v-else(-if) " + "will be ignored.", children[i]);
      }

      children.pop();
    }
  }
}

function addIfCondition(el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = [];
  }

  el.ifConditions.push(condition);
}

function processOnce(el) {
  var once = getAndRemoveAttr(el, 'v-once');

  if (once != null) {
    el.once = true;
  }
} // handle content being passed to a component as slot,
// e.g. <template slot="xxx">, <div slot-scope="xxx">


function processSlotContent(el) {
  var slotScope;

  if (el.tag === 'template') {
    slotScope = getAndRemoveAttr(el, 'scope');
    /* istanbul ignore if */

    if ( true && slotScope) {
      warn$1("the \"scope\" attribute for scoped slots have been deprecated and " + "replaced by \"slot-scope\" since 2.5. The new \"slot-scope\" attribute " + "can also be used on plain elements in addition to <template> to " + "denote scoped slots.", el.rawAttrsMap['scope'], true);
    }

    el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope');
  } else if (slotScope = getAndRemoveAttr(el, 'slot-scope')) {
    /* istanbul ignore if */
    if ( true && el.attrsMap['v-for']) {
      warn$1("Ambiguous combined usage of slot-scope and v-for on <" + el.tag + "> " + "(v-for takes higher priority). Use a wrapper <template> for the " + "scoped slot to make it clearer.", el.rawAttrsMap['slot-scope'], true);
    }

    el.slotScope = slotScope;
  } // slot="xxx"


  var slotTarget = getBindingAttr(el, 'slot');

  if (slotTarget) {
    el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
    el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot']); // preserve slot as an attribute for native shadow DOM compat
    // only for non-scoped slots.

    if (el.tag !== 'template' && !el.slotScope) {
      addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'));
    }
  } // 2.6 v-slot syntax


  {
    if (el.tag === 'template') {
      // v-slot on <template>
      var slotBinding = getAndRemoveAttrByRegex(el, slotRE);

      if (slotBinding) {
        if (true) {
          if (el.slotTarget || el.slotScope) {
            warn$1("Unexpected mixed usage of different slot syntaxes.", el);
          }

          if (el.parent && !maybeComponent(el.parent)) {
            warn$1("<template v-slot> can only appear at the root level inside " + "the receiving component", el);
          }
        }

        var ref = getSlotName(slotBinding);
        var name = ref.name;
        var dynamic = ref.dynamic;
        el.slotTarget = name;
        el.slotTargetDynamic = dynamic;
        el.slotScope = slotBinding.value || emptySlotScopeToken; // force it into a scoped slot for perf
      }
    } else {
      // v-slot on component, denotes default slot
      var slotBinding$1 = getAndRemoveAttrByRegex(el, slotRE);

      if (slotBinding$1) {
        if (true) {
          if (!maybeComponent(el)) {
            warn$1("v-slot can only be used on components or <template>.", slotBinding$1);
          }

          if (el.slotScope || el.slotTarget) {
            warn$1("Unexpected mixed usage of different slot syntaxes.", el);
          }

          if (el.scopedSlots) {
            warn$1("To avoid scope ambiguity, the default slot should also use " + "<template> syntax when there are other named slots.", slotBinding$1);
          }
        } // add the component's children to its default slot


        var slots = el.scopedSlots || (el.scopedSlots = {});
        var ref$1 = getSlotName(slotBinding$1);
        var name$1 = ref$1.name;
        var dynamic$1 = ref$1.dynamic;
        var slotContainer = slots[name$1] = createASTElement('template', [], el);
        slotContainer.slotTarget = name$1;
        slotContainer.slotTargetDynamic = dynamic$1;
        slotContainer.children = el.children.filter(function (c) {
          if (!c.slotScope) {
            c.parent = slotContainer;
            return true;
          }
        });
        slotContainer.slotScope = slotBinding$1.value || emptySlotScopeToken; // remove children as they are returned from scopedSlots now

        el.children = []; // mark el non-plain so data gets generated

        el.plain = false;
      }
    }
  }
}

function getSlotName(binding) {
  var name = binding.name.replace(slotRE, '');

  if (!name) {
    if (binding.name[0] !== '#') {
      name = 'default';
    } else if (true) {
      warn$1("v-slot shorthand syntax requires a slot name.", binding);
    }
  }

  return dynamicArgRE.test(name) // dynamic [name]
  ? {
    name: name.slice(1, -1),
    dynamic: true
  } // static name
  : {
    name: "\"" + name + "\"",
    dynamic: false
  };
} // handle <slot/> outlets


function processSlotOutlet(el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name');

    if ( true && el.key) {
      warn$1("`key` does not work on <slot> because slots are abstract outlets " + "and can possibly expand into multiple elements. " + "Use the key on a wrapping element instead.", getRawBindingAttr(el, 'key'));
    }
  }
}

function processComponent(el) {
  var binding;

  if (binding = getBindingAttr(el, 'is')) {
    el.component = binding;
  }

  if (getAndRemoveAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true;
  }
}

function processAttrs(el) {
  var list = el.attrsList;
  var i, l, name, rawName, value, modifiers, syncGen, isDynamic;

  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name;
    value = list[i].value;

    if (dirRE.test(name)) {
      // mark element as dynamic
      el.hasBindings = true; // modifiers

      modifiers = parseModifiers(name.replace(dirRE, '')); // support .foo shorthand syntax for the .prop modifier

      if (modifiers) {
        name = name.replace(modifierRE, '');
      }

      if (bindRE.test(name)) {
        // v-bind
        name = name.replace(bindRE, '');
        value = parseFilters(value);
        isDynamic = dynamicArgRE.test(name);

        if (isDynamic) {
          name = name.slice(1, -1);
        }

        if ( true && value.trim().length === 0) {
          warn$1("The value for a v-bind expression cannot be empty. Found in \"v-bind:" + name + "\"");
        }

        if (modifiers) {
          if (modifiers.prop && !isDynamic) {
            name = camelize(name);

            if (name === 'innerHtml') {
              name = 'innerHTML';
            }
          }

          if (modifiers.camel && !isDynamic) {
            name = camelize(name);
          }

          if (modifiers.sync) {
            syncGen = genAssignmentCode(value, "$event");

            if (!isDynamic) {
              addHandler(el, "update:" + camelize(name), syncGen, null, false, warn$1, list[i]);

              if (hyphenate(name) !== camelize(name)) {
                addHandler(el, "update:" + hyphenate(name), syncGen, null, false, warn$1, list[i]);
              }
            } else {
              // handler w/ dynamic event name
              addHandler(el, "\"update:\"+(" + name + ")", syncGen, null, false, warn$1, list[i], true // dynamic
              );
            }
          }
        }

        if (modifiers && modifiers.prop || !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)) {
          addProp(el, name, value, list[i], isDynamic);
        } else {
          addAttr(el, name, value, list[i], isDynamic);
        }
      } else if (onRE.test(name)) {
        // v-on
        name = name.replace(onRE, '');
        isDynamic = dynamicArgRE.test(name);

        if (isDynamic) {
          name = name.slice(1, -1);
        }

        addHandler(el, name, value, modifiers, false, warn$1, list[i], isDynamic);
      } else {
        // normal directives
        name = name.replace(dirRE, ''); // parse arg

        var argMatch = name.match(argRE);
        var arg = argMatch && argMatch[1];
        isDynamic = false;

        if (arg) {
          name = name.slice(0, -(arg.length + 1));

          if (dynamicArgRE.test(arg)) {
            arg = arg.slice(1, -1);
            isDynamic = true;
          }
        }

        addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]);

        if ( true && name === 'model') {
          checkForAliasModel(el, value);
        }
      }
    } else {
      // literal attribute
      if (true) {
        var res = parseText(value, delimiters);

        if (res) {
          warn$1(name + "=\"" + value + "\": " + 'Interpolation inside attributes has been removed. ' + 'Use v-bind or the colon shorthand instead. For example, ' + 'instead of <div id="{{ val }}">, use <div :id="val">.', list[i]);
        }
      }

      addAttr(el, name, JSON.stringify(value), list[i]); // #6887 firefox doesn't update muted state if set via attribute
      // even immediately after element creation

      if (!el.component && name === 'muted' && platformMustUseProp(el.tag, el.attrsMap.type, name)) {
        addProp(el, name, 'true', list[i]);
      }
    }
  }
}

function checkInFor(el) {
  var parent = el;

  while (parent) {
    if (parent.for !== undefined) {
      return true;
    }

    parent = parent.parent;
  }

  return false;
}

function parseModifiers(name) {
  var match = name.match(modifierRE);

  if (match) {
    var ret = {};
    match.forEach(function (m) {
      ret[m.slice(1)] = true;
    });
    return ret;
  }
}

function makeAttrsMap(attrs) {
  var map = {};

  for (var i = 0, l = attrs.length; i < l; i++) {
    if ( true && map[attrs[i].name] && !isIE && !isEdge) {
      warn$1('duplicate attribute: ' + attrs[i].name, attrs[i]);
    }

    map[attrs[i].name] = attrs[i].value;
  }

  return map;
} // for script (e.g. type="x/template") or style, do not decode content


function isTextTag(el) {
  return el.tag === 'script' || el.tag === 'style';
}

function isForbiddenTag(el) {
  return el.tag === 'style' || el.tag === 'script' && (!el.attrsMap.type || el.attrsMap.type === 'text/javascript');
}

var ieNSBug = /^xmlns:NS\d+/;
var ieNSPrefix = /^NS\d+:/;
/* istanbul ignore next */

function guardIESVGBug(attrs) {
  var res = [];

  for (var i = 0; i < attrs.length; i++) {
    var attr = attrs[i];

    if (!ieNSBug.test(attr.name)) {
      attr.name = attr.name.replace(ieNSPrefix, '');
      res.push(attr);
    }
  }

  return res;
}

function checkForAliasModel(el, value) {
  var _el = el;

  while (_el) {
    if (_el.for && _el.alias === value) {
      warn$1("<" + el.tag + " v-model=\"" + value + "\">: " + "You are binding v-model directly to a v-for iteration alias. " + "This will not be able to modify the v-for source array because " + "writing to the alias is like modifying a function local variable. " + "Consider using an array of objects and use v-model on an object property instead.", el.rawAttrsMap['v-model']);
    }

    _el = _el.parent;
  }
}
/*  */


var isStaticKey;
var isPlatformReservedTag;
var genStaticKeysCached = cached(genStaticKeys$1);
/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */

function optimize(root, options) {
  if (!root) {
    return;
  }

  isStaticKey = genStaticKeysCached(options.staticKeys || '');
  isPlatformReservedTag = options.isReservedTag || no; // first pass: mark all non-static nodes.

  markStatic$1(root); // second pass: mark static roots.

  markStaticRoots(root, false);
}

function genStaticKeys$1(keys) {
  return makeMap('type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' + (keys ? ',' + keys : ''));
}

function markStatic$1(node) {
  node.static = isStatic(node);

  if (node.type === 1) {
    // do not make component slot content static. this avoids
    // 1. components not able to mutate slot nodes
    // 2. static slot content fails for hot-reloading
    if (!isPlatformReservedTag(node.tag) && node.tag !== 'slot' && node.attrsMap['inline-template'] == null) {
      return;
    }

    for (var i = 0, l = node.children.length; i < l; i++) {
      var child = node.children[i];
      markStatic$1(child);

      if (!child.static) {
        node.static = false;
      }
    }

    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        var block = node.ifConditions[i$1].block;
        markStatic$1(block);

        if (!block.static) {
          node.static = false;
        }
      }
    }
  }
}

function markStaticRoots(node, isInFor) {
  if (node.type === 1) {
    if (node.static || node.once) {
      node.staticInFor = isInFor;
    } // For a node to qualify as a static root, it should have children that
    // are not just static text. Otherwise the cost of hoisting out will
    // outweigh the benefits and it's better off to just always render it fresh.


    if (node.static && node.children.length && !(node.children.length === 1 && node.children[0].type === 3)) {
      node.staticRoot = true;
      return;
    } else {
      node.staticRoot = false;
    }

    if (node.children) {
      for (var i = 0, l = node.children.length; i < l; i++) {
        markStaticRoots(node.children[i], isInFor || !!node.for);
      }
    }

    if (node.ifConditions) {
      for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
        markStaticRoots(node.ifConditions[i$1].block, isInFor);
      }
    }
  }
}

function isStatic(node) {
  if (node.type === 2) {
    // expression
    return false;
  }

  if (node.type === 3) {
    // text
    return true;
  }

  return !!(node.pre || !node.hasBindings && // no dynamic bindings
  !node.if && !node.for && // not v-if or v-for or v-else
  !isBuiltInTag(node.tag) && // not a built-in
  isPlatformReservedTag(node.tag) && // not a component
  !isDirectChildOfTemplateFor(node) && Object.keys(node).every(isStaticKey));
}

function isDirectChildOfTemplateFor(node) {
  while (node.parent) {
    node = node.parent;

    if (node.tag !== 'template') {
      return false;
    }

    if (node.for) {
      return true;
    }
  }

  return false;
}
/*  */


var fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function(?:\s+[\w$]+)?\s*\(/;
var fnInvokeRE = /\([^)]*?\);*$/;
var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/; // KeyboardEvent.keyCode aliases

var keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  'delete': [8, 46]
}; // KeyboardEvent.key aliases

var keyNames = {
  // #7880: IE11 and Edge use `Esc` for Escape key name.
  esc: ['Esc', 'Escape'],
  tab: 'Tab',
  enter: 'Enter',
  // #9112: IE11 uses `Spacebar` for Space key name.
  space: [' ', 'Spacebar'],
  // #7806: IE11 uses key names without `Arrow` prefix for arrow keys.
  up: ['Up', 'ArrowUp'],
  left: ['Left', 'ArrowLeft'],
  right: ['Right', 'ArrowRight'],
  down: ['Down', 'ArrowDown'],
  // #9112: IE11 uses `Del` for Delete key name.
  'delete': ['Backspace', 'Delete', 'Del']
}; // #4868: modifiers that prevent the execution of the listener
// need to explicitly return null so that we can determine whether to remove
// the listener for .once

var genGuard = function (condition) {
  return "if(" + condition + ")return null;";
};

var modifierCode = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: genGuard("$event.target !== $event.currentTarget"),
  ctrl: genGuard("!$event.ctrlKey"),
  shift: genGuard("!$event.shiftKey"),
  alt: genGuard("!$event.altKey"),
  meta: genGuard("!$event.metaKey"),
  left: genGuard("'button' in $event && $event.button !== 0"),
  middle: genGuard("'button' in $event && $event.button !== 1"),
  right: genGuard("'button' in $event && $event.button !== 2")
};

function genHandlers(events, isNative) {
  var prefix = isNative ? 'nativeOn:' : 'on:';
  var staticHandlers = "";
  var dynamicHandlers = "";

  for (var name in events) {
    var handlerCode = genHandler(events[name]);

    if (events[name] && events[name].dynamic) {
      dynamicHandlers += name + "," + handlerCode + ",";
    } else {
      staticHandlers += "\"" + name + "\":" + handlerCode + ",";
    }
  }

  staticHandlers = "{" + staticHandlers.slice(0, -1) + "}";

  if (dynamicHandlers) {
    return prefix + "_d(" + staticHandlers + ",[" + dynamicHandlers.slice(0, -1) + "])";
  } else {
    return prefix + staticHandlers;
  }
}

function genHandler(handler) {
  if (!handler) {
    return 'function(){}';
  }

  if (Array.isArray(handler)) {
    return "[" + handler.map(function (handler) {
      return genHandler(handler);
    }).join(',') + "]";
  }

  var isMethodPath = simplePathRE.test(handler.value);
  var isFunctionExpression = fnExpRE.test(handler.value);
  var isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''));

  if (!handler.modifiers) {
    if (isMethodPath || isFunctionExpression) {
      return handler.value;
    }

    return "function($event){" + (isFunctionInvocation ? "return " + handler.value : handler.value) + "}"; // inline statement
  } else {
    var code = '';
    var genModifierCode = '';
    var keys = [];

    for (var key in handler.modifiers) {
      if (modifierCode[key]) {
        genModifierCode += modifierCode[key]; // left/right

        if (keyCodes[key]) {
          keys.push(key);
        }
      } else if (key === 'exact') {
        var modifiers = handler.modifiers;
        genModifierCode += genGuard(['ctrl', 'shift', 'alt', 'meta'].filter(function (keyModifier) {
          return !modifiers[keyModifier];
        }).map(function (keyModifier) {
          return "$event." + keyModifier + "Key";
        }).join('||'));
      } else {
        keys.push(key);
      }
    }

    if (keys.length) {
      code += genKeyFilter(keys);
    } // Make sure modifiers like prevent and stop get executed after key filtering


    if (genModifierCode) {
      code += genModifierCode;
    }

    var handlerCode = isMethodPath ? "return " + handler.value + "($event)" : isFunctionExpression ? "return (" + handler.value + ")($event)" : isFunctionInvocation ? "return " + handler.value : handler.value;
    return "function($event){" + code + handlerCode + "}";
  }
}

function genKeyFilter(keys) {
  return (// make sure the key filters only apply to KeyboardEvents
    // #9441: can't use 'keyCode' in $event because Chrome autofill fires fake
    // key events that do not have keyCode property...
    "if(!$event.type.indexOf('key')&&" + keys.map(genFilterCode).join('&&') + ")return null;"
  );
}

function genFilterCode(key) {
  var keyVal = parseInt(key, 10);

  if (keyVal) {
    return "$event.keyCode!==" + keyVal;
  }

  var keyCode = keyCodes[key];
  var keyName = keyNames[key];
  return "_k($event.keyCode," + JSON.stringify(key) + "," + JSON.stringify(keyCode) + "," + "$event.key," + "" + JSON.stringify(keyName) + ")";
}
/*  */


function on(el, dir) {
  if ( true && dir.modifiers) {
    warn("v-on without argument does not support modifiers.");
  }

  el.wrapListeners = function (code) {
    return "_g(" + code + "," + dir.value + ")";
  };
}
/*  */


function bind$1(el, dir) {
  el.wrapData = function (code) {
    return "_b(" + code + ",'" + el.tag + "'," + dir.value + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")";
  };
}
/*  */


var baseDirectives = {
  on: on,
  bind: bind$1,
  cloak: noop
};
/*  */

var CodegenState = function CodegenState(options) {
  this.options = options;
  this.warn = options.warn || baseWarn;
  this.transforms = pluckModuleFunction(options.modules, 'transformCode');
  this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
  this.directives = extend(extend({}, baseDirectives), options.directives);
  var isReservedTag = options.isReservedTag || no;

  this.maybeComponent = function (el) {
    return !!el.component || !isReservedTag(el.tag);
  };

  this.onceId = 0;
  this.staticRenderFns = [];
  this.pre = false;
};

function generate(ast, options) {
  var state = new CodegenState(options);
  var code = ast ? genElement(ast, state) : '_c("NativeContentView")';
  return {
    render: "with(this){return " + code + "}",
    staticRenderFns: state.staticRenderFns
  };
}

function genElement(el, state) {
  if (el.parent) {
    el.pre = el.pre || el.parent.pre;
  }

  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state);
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state);
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state);
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state);
  } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
    return genChildren(el, state) || 'void 0';
  } else if (el.tag === 'slot') {
    return genSlot(el, state);
  } else {
    // component or element
    var code;

    if (el.component) {
      code = genComponent(el.component, el, state);
    } else {
      var data;

      if (!el.plain || el.pre && state.maybeComponent(el)) {
        data = genData(el, state);
      }

      var children = el.inlineTemplate ? null : genChildren(el, state, true);
      code = "_c('" + el.tag + "'" + (data ? "," + data : '') + (children ? "," + children : '') + ")";
    } // module transforms


    for (var i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code);
    }

    return code;
  }
} // hoist static sub-trees out


function genStatic(el, state) {
  el.staticProcessed = true; // Some elements (templates) need to behave differently inside of a v-pre
  // node.  All pre nodes are static roots, so we can use this as a location to
  // wrap a state change and reset it upon exiting the pre node.

  var originalPreState = state.pre;

  if (el.pre) {
    state.pre = el.pre;
  }

  state.staticRenderFns.push("with(this){return " + genElement(el, state) + "}");
  state.pre = originalPreState;
  return "_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")";
} // v-once


function genOnce(el, state) {
  el.onceProcessed = true;

  if (el.if && !el.ifProcessed) {
    return genIf(el, state);
  } else if (el.staticInFor) {
    var key = '';
    var parent = el.parent;

    while (parent) {
      if (parent.for) {
        key = parent.key;
        break;
      }

      parent = parent.parent;
    }

    if (!key) {
       true && state.warn("v-once can only be used inside v-for that is keyed. ", el.rawAttrsMap['v-once']);
      return genElement(el, state);
    }

    return "_o(" + genElement(el, state) + "," + state.onceId++ + "," + key + ")";
  } else {
    return genStatic(el, state);
  }
}

function genIf(el, state, altGen, altEmpty) {
  el.ifProcessed = true; // avoid recursion

  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty);
}

function genIfConditions(conditions, state, altGen, altEmpty) {
  if (!conditions.length) {
    return altEmpty || '_e()';
  }

  var condition = conditions.shift();

  if (condition.exp) {
    return "(" + condition.exp + ")?" + genTernaryExp(condition.block) + ":" + genIfConditions(conditions, state, altGen, altEmpty);
  } else {
    return "" + genTernaryExp(condition.block);
  } // v-if with v-once should generate code like (a)?_m(0):_m(1)


  function genTernaryExp(el) {
    return altGen ? altGen(el, state) : el.once ? genOnce(el, state) : genElement(el, state);
  }
}

function genFor(el, state, altGen, altHelper) {
  var exp = el.for;
  var alias = el.alias;
  var iterator1 = el.iterator1 ? "," + el.iterator1 : '';
  var iterator2 = el.iterator2 ? "," + el.iterator2 : '';

  if ( true && state.maybeComponent(el) && el.tag !== 'slot' && el.tag !== 'template' && !el.key) {
    state.warn("<" + el.tag + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " + "v-for should have explicit keys. " + "See https://vuejs.org/guide/list.html#key for more info.", el.rawAttrsMap['v-for'], true
    /* tip */
    );
  }

  el.forProcessed = true; // avoid recursion

  return (altHelper || '_l') + "((" + exp + ")," + "function(" + alias + iterator1 + iterator2 + "){" + "return " + (altGen || genElement)(el, state) + '})';
}

function genData(el, state) {
  var data = '{'; // directives first.
  // directives may mutate the el's other properties before they are generated.

  var dirs = genDirectives(el, state);

  if (dirs) {
    data += dirs + ',';
  } // key


  if (el.key) {
    data += "key:" + el.key + ",";
  } // ref


  if (el.ref) {
    data += "ref:" + el.ref + ",";
  }

  if (el.refInFor) {
    data += "refInFor:true,";
  } // pre


  if (el.pre) {
    data += "pre:true,";
  } // record original tag name for components using "is" attribute


  if (el.component) {
    data += "tag:\"" + el.tag + "\",";
  } // module data generation functions


  for (var i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el);
  } // attributes


  if (el.attrs) {
    data += "attrs:" + genProps(el.attrs) + ",";
  } // DOM props


  if (el.props) {
    data += "domProps:" + genProps(el.props) + ",";
  } // event handlers


  if (el.events) {
    data += genHandlers(el.events, false) + ",";
  }

  if (el.nativeEvents) {
    data += genHandlers(el.nativeEvents, true) + ",";
  } // slot target
  // only for non-scoped slots


  if (el.slotTarget && !el.slotScope) {
    data += "slot:" + el.slotTarget + ",";
  } // scoped slots


  if (el.scopedSlots) {
    data += genScopedSlots(el, el.scopedSlots, state) + ",";
  } // component v-model


  if (el.model) {
    data += "model:{value:" + el.model.value + ",callback:" + el.model.callback + ",expression:" + el.model.expression + "},";
  } // inline-template


  if (el.inlineTemplate) {
    var inlineTemplate = genInlineTemplate(el, state);

    if (inlineTemplate) {
      data += inlineTemplate + ",";
    }
  }

  data = data.replace(/,$/, '') + '}'; // v-bind dynamic argument wrap
  // v-bind with dynamic arguments must be applied using the same v-bind object
  // merge helper so that class/style/mustUseProp attrs are handled correctly.

  if (el.dynamicAttrs) {
    data = "_b(" + data + ",\"" + el.tag + "\"," + genProps(el.dynamicAttrs) + ")";
  } // v-bind data wrap


  if (el.wrapData) {
    data = el.wrapData(data);
  } // v-on data wrap


  if (el.wrapListeners) {
    data = el.wrapListeners(data);
  }

  return data;
}

function genDirectives(el, state) {
  var dirs = el.directives;

  if (!dirs) {
    return;
  }

  var res = 'directives:[';
  var hasRuntime = false;
  var i, l, dir, needRuntime;

  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i];
    needRuntime = true;
    var gen = state.directives[dir.name];

    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, state.warn);
    }

    if (needRuntime) {
      hasRuntime = true;
      res += "{name:\"" + dir.name + "\",rawName:\"" + dir.rawName + "\"" + (dir.value ? ",value:(" + dir.value + "),expression:" + JSON.stringify(dir.value) : '') + (dir.arg ? ",arg:" + (dir.isDynamicArg ? dir.arg : "\"" + dir.arg + "\"") : '') + (dir.modifiers ? ",modifiers:" + JSON.stringify(dir.modifiers) : '') + "},";
    }
  }

  if (hasRuntime) {
    return res.slice(0, -1) + ']';
  }
}

function genInlineTemplate(el, state) {
  var ast = el.children[0];

  if ( true && (el.children.length !== 1 || ast.type !== 1)) {
    state.warn('Inline-template components must have exactly one child element.', {
      start: el.start
    });
  }

  if (ast && ast.type === 1) {
    var inlineRenderFns = generate(ast, state.options);
    return "inlineTemplate:{render:function(){" + inlineRenderFns.render + "},staticRenderFns:[" + inlineRenderFns.staticRenderFns.map(function (code) {
      return "function(){" + code + "}";
    }).join(',') + "]}";
  }
}

function genScopedSlots(el, slots, state) {
  // by default scoped slots are considered "stable", this allows child
  // components with only scoped slots to skip forced updates from parent.
  // but in some cases we have to bail-out of this optimization
  // for example if the slot contains dynamic names, has v-if or v-for on them...
  var needsForceUpdate = el.for || Object.keys(slots).some(function (key) {
    var slot = slots[key];
    return slot.slotTargetDynamic || slot.if || slot.for || containsSlotChild(slot) // is passing down slot from parent which may be dynamic
    ;
  }); // #9534: if a component with scoped slots is inside a conditional branch,
  // it's possible for the same component to be reused but with different
  // compiled slot content. To avoid that, we generate a unique key based on
  // the generated code of all the slot contents.

  var needsKey = !!el.if; // OR when it is inside another scoped slot or v-for (the reactivity may be
  // disconnected due to the intermediate scope variable)
  // #9438, #9506
  // TODO: this can be further optimized by properly analyzing in-scope bindings
  // and skip force updating ones that do not actually use scope variables.

  if (!needsForceUpdate) {
    var parent = el.parent;

    while (parent) {
      if (parent.slotScope && parent.slotScope !== emptySlotScopeToken || parent.for) {
        needsForceUpdate = true;
        break;
      }

      if (parent.if) {
        needsKey = true;
      }

      parent = parent.parent;
    }
  }

  var generatedSlots = Object.keys(slots).map(function (key) {
    return genScopedSlot(slots[key], state);
  }).join(',');
  return "scopedSlots:_u([" + generatedSlots + "]" + (needsForceUpdate ? ",null,true" : "") + (!needsForceUpdate && needsKey ? ",null,false," + hash(generatedSlots) : "") + ")";
}

function hash(str) {
  var hash = 5381;
  var i = str.length;

  while (i) {
    hash = hash * 33 ^ str.charCodeAt(--i);
  }

  return hash >>> 0;
}

function containsSlotChild(el) {
  if (el.type === 1) {
    if (el.tag === 'slot') {
      return true;
    }

    return el.children.some(containsSlotChild);
  }

  return false;
}

function genScopedSlot(el, state) {
  var isLegacySyntax = el.attrsMap['slot-scope'];

  if (el.if && !el.ifProcessed && !isLegacySyntax) {
    return genIf(el, state, genScopedSlot, "null");
  }

  if (el.for && !el.forProcessed) {
    return genFor(el, state, genScopedSlot);
  }

  var slotScope = el.slotScope === emptySlotScopeToken ? "" : String(el.slotScope);
  var fn = "function(" + slotScope + "){" + "return " + (el.tag === 'template' ? el.if && isLegacySyntax ? "(" + el.if + ")?" + (genChildren(el, state) || 'undefined') + ":undefined" : genChildren(el, state) || 'undefined' : genElement(el, state)) + "}"; // reverse proxy v-slot without scope on this.$slots

  var reverseProxy = slotScope ? "" : ",proxy:true";
  return "{key:" + (el.slotTarget || "\"default\"") + ",fn:" + fn + reverseProxy + "}";
}

function genChildren(el, state, checkSkip, altGenElement, altGenNode) {
  var children = el.children;

  if (children.length) {
    var el$1 = children[0]; // optimize single v-for

    if (children.length === 1 && el$1.for && el$1.tag !== 'template' && el$1.tag !== 'slot') {
      var normalizationType = checkSkip ? state.maybeComponent(el$1) ? ",1" : ",0" : "";
      return "" + (altGenElement || genElement)(el$1, state) + normalizationType;
    }

    var normalizationType$1 = checkSkip ? getNormalizationType(children, state.maybeComponent) : 0;
    var gen = altGenNode || genNode;
    return "[" + children.map(function (c) {
      return gen(c, state);
    }).join(',') + "]" + (normalizationType$1 ? "," + normalizationType$1 : '');
  }
} // determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed


function getNormalizationType(children, maybeComponent) {
  var res = 0;

  for (var i = 0; i < children.length; i++) {
    var el = children[i];

    if (el.type !== 1) {
      continue;
    }

    if (needsNormalization(el) || el.ifConditions && el.ifConditions.some(function (c) {
      return needsNormalization(c.block);
    })) {
      res = 2;
      break;
    }

    if (maybeComponent(el) || el.ifConditions && el.ifConditions.some(function (c) {
      return maybeComponent(c.block);
    })) {
      res = 1;
    }
  }

  return res;
}

function needsNormalization(el) {
  return el.for !== undefined || el.tag === 'template' || el.tag === 'slot';
}

function genNode(node, state) {
  if (node.type === 1) {
    return genElement(node, state);
  } else if (node.type === 3 && node.isComment) {
    return genComment(node);
  } else {
    return genText(node);
  }
}

function genText(text) {
  return "_v(" + (text.type === 2 ? text.expression // no need for () because already wrapped in _s()
  : transformSpecialNewlines(JSON.stringify(text.text))) + ")";
}

function genComment(comment) {
  return "_e(" + JSON.stringify(comment.text) + ")";
}

function genSlot(el, state) {
  var slotName = el.slotName || '"default"';
  var children = genChildren(el, state);
  var res = "_t(" + slotName + (children ? "," + children : '');
  var attrs = el.attrs || el.dynamicAttrs ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(function (attr) {
    return {
      // slot props are camelized
      name: camelize(attr.name),
      value: attr.value,
      dynamic: attr.dynamic
    };
  })) : null;
  var bind = el.attrsMap['v-bind'];

  if ((attrs || bind) && !children) {
    res += ",null";
  }

  if (attrs) {
    res += "," + attrs;
  }

  if (bind) {
    res += (attrs ? '' : ',null') + "," + bind;
  }

  return res + ')';
} // componentName is el.component, take it as argument to shun flow's pessimistic refinement


function genComponent(componentName, el, state) {
  var children = el.inlineTemplate ? null : genChildren(el, state, true);
  return "_c(" + componentName + "," + genData(el, state) + (children ? "," + children : '') + ")";
}

function genProps(props) {
  var staticProps = "";
  var dynamicProps = "";

  for (var i = 0; i < props.length; i++) {
    var prop = props[i];
    var value = transformSpecialNewlines(prop.value);

    if (prop.dynamic) {
      dynamicProps += prop.name + "," + value + ",";
    } else {
      staticProps += "\"" + prop.name + "\":" + value + ",";
    }
  }

  staticProps = "{" + staticProps.slice(0, -1) + "}";

  if (dynamicProps) {
    return "_d(" + staticProps + ",[" + dynamicProps.slice(0, -1) + "])";
  } else {
    return staticProps;
  }
} // #3895, #4268


function transformSpecialNewlines(text) {
  return text.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
/*  */
// these keywords should not appear inside expressions, but operators like
// typeof, instanceof and in are allowed


var prohibitedKeywordRE = new RegExp('\\b' + ('do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' + 'super,throw,while,yield,delete,export,import,return,switch,default,' + 'extends,finally,continue,debugger,function,arguments').split(',').join('\\b|\\b') + '\\b'); // these unary operators should not be used as property/method names

var unaryOperatorsRE = new RegExp('\\b' + 'delete,typeof,void'.split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)'); // strip strings in expressions

var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g; // detect problematic expressions in a template

function detectErrors(ast, warn) {
  if (ast) {
    checkNode(ast, warn);
  }
}

function checkNode(node, warn) {
  if (node.type === 1) {
    for (var name in node.attrsMap) {
      if (dirRE.test(name)) {
        var value = node.attrsMap[name];

        if (value) {
          var range = node.rawAttrsMap[name];

          if (name === 'v-for') {
            checkFor(node, "v-for=\"" + value + "\"", warn, range);
          } else if (name === 'v-slot' || name[0] === '#') {
            checkFunctionParameterExpression(value, name + "=\"" + value + "\"", warn, range);
          } else if (onRE.test(name)) {
            checkEvent(value, name + "=\"" + value + "\"", warn, range);
          } else {
            checkExpression(value, name + "=\"" + value + "\"", warn, range);
          }
        }
      }
    }

    if (node.children) {
      for (var i = 0; i < node.children.length; i++) {
        checkNode(node.children[i], warn);
      }
    }
  } else if (node.type === 2) {
    checkExpression(node.expression, node.text, warn, node);
  }
}

function checkEvent(exp, text, warn, range) {
  var stripped = exp.replace(stripStringRE, '');
  var keywordMatch = stripped.match(unaryOperatorsRE);

  if (keywordMatch && stripped.charAt(keywordMatch.index - 1) !== '$') {
    warn("avoid using JavaScript unary operator as property name: " + "\"" + keywordMatch[0] + "\" in expression " + text.trim(), range);
  }

  checkExpression(exp, text, warn, range);
}

function checkFor(node, text, warn, range) {
  checkExpression(node.for || '', text, warn, range);
  checkIdentifier(node.alias, 'v-for alias', text, warn, range);
  checkIdentifier(node.iterator1, 'v-for iterator', text, warn, range);
  checkIdentifier(node.iterator2, 'v-for iterator', text, warn, range);
}

function checkIdentifier(ident, type, text, warn, range) {
  if (typeof ident === 'string') {
    try {
      new Function("var " + ident + "=_");
    } catch (e) {
      warn("invalid " + type + " \"" + ident + "\" in expression: " + text.trim(), range);
    }
  }
}

function checkExpression(exp, text, warn, range) {
  try {
    new Function("return " + exp);
  } catch (e) {
    var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);

    if (keywordMatch) {
      warn("avoid using JavaScript keyword as property name: " + "\"" + keywordMatch[0] + "\"\n  Raw expression: " + text.trim(), range);
    } else {
      warn("invalid expression: " + e.message + " in\n\n" + "    " + exp + "\n\n" + "  Raw expression: " + text.trim() + "\n", range);
    }
  }
}

function checkFunctionParameterExpression(exp, text, warn, range) {
  try {
    new Function(exp, '');
  } catch (e) {
    warn("invalid function parameter expression: " + e.message + " in\n\n" + "    " + exp + "\n\n" + "  Raw expression: " + text.trim() + "\n", range);
  }
}
/*  */


var range = 2;

function generateCodeFrame(source, start, end) {
  if (start === void 0) start = 0;
  if (end === void 0) end = source.length;
  var lines = source.split(/\r?\n/);
  var count = 0;
  var res = [];

  for (var i = 0; i < lines.length; i++) {
    count += lines[i].length + 1;

    if (count >= start) {
      for (var j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) {
          continue;
        }

        res.push("" + (j + 1) + repeat$1(" ", 3 - String(j + 1).length) + "|  " + lines[j]);
        var lineLength = lines[j].length;

        if (j === i) {
          // push underline
          var pad = start - (count - lineLength) + 1;
          var length = end > count ? lineLength - pad : end - start;
          res.push("   |  " + repeat$1(" ", pad) + repeat$1("^", length));
        } else if (j > i) {
          if (end > count) {
            var length$1 = Math.min(end - count, lineLength);
            res.push("   |  " + repeat$1("^", length$1));
          }

          count += lineLength + 1;
        }
      }

      break;
    }
  }

  return res.join('\n');
}

function repeat$1(str, n) {
  var result = '';

  if (n > 0) {
    while (true) {
      // eslint-disable-line
      if (n & 1) {
        result += str;
      }

      n >>>= 1;

      if (n <= 0) {
        break;
      }

      str += str;
    }
  }

  return result;
}
/*  */


function createFunction(code, errors) {
  try {
    return new Function(code);
  } catch (err) {
    errors.push({
      err: err,
      code: code
    });
    return noop;
  }
}

function createCompileToFunctionFn(compile) {
  var cache = Object.create(null);
  return function compileToFunctions(template, options, vm) {
    options = extend({}, options);
    var warn$1 = options.warn || warn;
    delete options.warn;
    /* istanbul ignore if */

    if (true) {
      // detect possible CSP restriction
      try {
        new Function('return 1');
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn$1('It seems you are using the standalone build of Vue.js in an ' + 'environment with Content Security Policy that prohibits unsafe-eval. ' + 'The template compiler cannot work in this environment. Consider ' + 'relaxing the policy to allow unsafe-eval or pre-compiling your ' + 'templates into render functions.');
        }
      }
    } // check cache


    var key = options.delimiters ? String(options.delimiters) + template : template;

    if (cache[key]) {
      return cache[key];
    } // compile


    var compiled = compile(template, options); // check compilation errors/tips

    if (true) {
      if (compiled.errors && compiled.errors.length) {
        if (options.outputSourceRange) {
          compiled.errors.forEach(function (e) {
            warn$1("Error compiling template:\n\n" + e.msg + "\n\n" + generateCodeFrame(template, e.start, e.end), vm);
          });
        } else {
          warn$1("Error compiling template:\n\n" + template + "\n\n" + compiled.errors.map(function (e) {
            return "- " + e;
          }).join('\n') + '\n', vm);
        }
      }

      if (compiled.tips && compiled.tips.length) {
        if (options.outputSourceRange) {
          compiled.tips.forEach(function (e) {
            return tip(e.msg, vm);
          });
        } else {
          compiled.tips.forEach(function (msg) {
            return tip(msg, vm);
          });
        }
      }
    } // turn code into functions


    var res = {};
    var fnGenErrors = [];
    res.render = createFunction(compiled.render, fnGenErrors);
    res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
      return createFunction(code, fnGenErrors);
    }); // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use

    /* istanbul ignore if */

    if (true) {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn$1("Failed to generate render function:\n\n" + fnGenErrors.map(function (ref) {
          var err = ref.err;
          var code = ref.code;
          return err.toString() + " in\n\n" + code + "\n";
        }).join('\n'), vm);
      }
    }

    return cache[key] = res;
  };
}
/*  */


function createCompilerCreator(baseCompile) {
  return function createCompiler(baseOptions) {
    function compile(template, options) {
      var finalOptions = Object.create(baseOptions);
      var errors = [];
      var tips = [];

      var warn = function (msg, range, tip) {
        (tip ? tips : errors).push(msg);
      };

      if (options) {
        if ( true && options.outputSourceRange) {
          // $flow-disable-line
          var leadingSpaceLength = template.match(/^\s*/)[0].length;

          warn = function (msg, range, tip) {
            var data = {
              msg: msg
            };

            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength;
              }

              if (range.end != null) {
                data.end = range.end + leadingSpaceLength;
              }
            }

            (tip ? tips : errors).push(data);
          };
        } // merge custom modules


        if (options.modules) {
          finalOptions.modules = (baseOptions.modules || []).concat(options.modules);
        } // merge custom directives


        if (options.directives) {
          finalOptions.directives = extend(Object.create(baseOptions.directives || null), options.directives);
        } // copy other options


        for (var key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key];
          }
        }
      }

      finalOptions.warn = warn;
      var compiled = baseCompile(template.trim(), finalOptions);

      if (true) {
        detectErrors(compiled.ast, warn);
      }

      compiled.errors = errors;
      compiled.tips = tips;
      return compiled;
    }

    return {
      compile: compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    };
  };
}
/*  */
// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.


var createCompiler = createCompilerCreator(function baseCompile(template, options) {
  var ast = parse(template.trim(), options);

  if (options.optimize !== false) {
    optimize(ast, options);
  }

  var code = generate(ast, options);
  return {
    ast: ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  };
});

function transformNode(el, options) {
  var warn = options.warn || baseWarn;
  var staticClass = getAndRemoveAttr(el, 'class');

  if ( true && staticClass) {
    var expression = parseText(staticClass, options.delimiters);

    if (expression) {
      warn("class=\"" + staticClass + "\": " + 'Interpolation inside attributes has been removed. ' + 'Use v-bind or the colon shorthand instead. For example, ' + 'instead of <div class="{{ val }}">, use <div :class="val">.');
    }
  }

  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass);
  }

  var classBinding = getBindingAttr(el, 'class', false
  /* getStatic */
  );

  if (classBinding) {
    el.classBinding = classBinding;
  }
}

function genData$1(el) {
  var data = '';

  if (el.staticClass) {
    data += "staticClass:" + el.staticClass + ",";
  }

  if (el.classBinding) {
    data += "class:" + el.classBinding + ",";
  }

  return data;
}

var class_$1 = {
  staticKeys: ['staticClass'],
  transformNode: transformNode,
  genData: genData$1
};
var normalize$1 = cached(camelize);

function transformNode$1(el, options) {
  var warn = options.warn || baseWarn;
  var staticStyle = getAndRemoveAttr(el, 'style');
  var ref = parseStaticStyle(staticStyle, options);
  var dynamic = ref.dynamic;
  var styleResult = ref.styleResult;

  if ( true && dynamic) {
    warn("style=\"" + String(staticStyle) + "\": " + 'Interpolation inside attributes has been deprecated. ' + 'Use v-bind or the colon shorthand instead.');
  }

  if (!dynamic && styleResult) {
    el.staticStyle = styleResult;
  }

  var styleBinding = getBindingAttr(el, 'style', false
  /* getStatic */
  );

  if (styleBinding) {
    el.styleBinding = styleBinding;
  } else if (dynamic) {
    el.styleBinding = styleResult;
  }
}

function genData$2(el) {
  var data = '';

  if (el.staticStyle) {
    data += "staticStyle:" + el.staticStyle + ",";
  }

  if (el.styleBinding) {
    data += "style:" + el.styleBinding + ",";
  }

  return data;
}

function parseStaticStyle(staticStyle, options) {
  // "width: 200px; height: 200px;" -> {width: 200, height: 200}
  // "width: 200px; height: {{y}}" -> {width: 200, height: y}
  var dynamic = false;
  var styleResult = '';

  if (staticStyle) {
    var styleList = staticStyle.trim().split(';').map(function (style) {
      var result = style.trim().split(':');

      if (result.length !== 2) {
        return;
      }

      var key = normalize$1(result[0].trim());
      var value = result[1].trim();
      var dynamicValue = parseText(value, options.delimiters);

      if (dynamicValue) {
        dynamic = true;
        return key + ':' + dynamicValue;
      }

      return key + ':' + JSON.stringify(value);
    }).filter(function (result) {
      return result;
    });

    if (styleList.length) {
      styleResult = '{' + styleList.join(',') + '}';
    }
  }

  return {
    dynamic: dynamic,
    styleResult: styleResult
  };
}

var style$1 = {
  staticKeys: ['staticStyle'],
  transformNode: transformNode$1,
  genData: genData$2
};

function preTransformNode(el) {
  var vfor;

  if (normalizeElementName(el.tag) === 'nativelistview') {
    vfor = getAndRemoveAttr(el, 'v-for');
    delete el.attrsMap['v-for'];

    if ( true && vfor) {
      warn("The v-for directive is not supported on a " + el.tag + ", " + 'Use the "for" attribute instead. For example, instead of ' + "<" + el.tag + " v-for=\"" + vfor + "\"> use <" + el.tag + " for=\"" + vfor + "\">.");
    }
  }

  var exp = getAndRemoveAttr(el, 'for') || vfor;

  if (!exp) {
    return;
  }

  var res = parseFor(exp);

  if (!res) {
    if (true) {
      warn("Invalid for expression: " + exp);
    }

    return;
  }

  addRawAttr(el, ':items', res.for);
  addRawAttr(el, '+alias', res.alias);

  if (res.iterator1) {
    addRawAttr(el, '+index', res.iterator1);
  }
}

var for_ = {
  preTransformNode: preTransformNode
};

function preTransformNode$1(el) {
  if (el.tag !== 'router-view') {
    return;
  }

  if (el.parent && el.parent.tag && normalizeElementName(el.parent.tag) === 'nativeframe') {
    addAttr(el.parent, 'hasRouterView', 'true');
  }
}

var router = {
  preTransformNode: preTransformNode$1
};

function preTransformNode$2(el) {
  if (el.parent && el.parent.tag === 'v-template') {
    var alias = el.parent.parent.attrsMap['+alias'] || 'item';
    var index = el.parent.parent.attrsMap['+index'] || '$index';
    el.slotScope = buildScopeString(alias, index);
  }
}

var vTemplate$1 = {
  preTransformNode: preTransformNode$2
};

function buildScopeString(alias, index) {
  return "{ " + alias + ", " + index + ", $even, $odd }";
} // transforms ~test -> v-view:test


function transformNode$2(el) {
  var attr = Object.keys(el.attrsMap).find(function (attr) {
    return attr.startsWith('~');
  });

  if (attr) {
    var attrName = attr.substr(1);
    var ref = attrName.split('.');
    var arg = ref[0];
    var modifiers = ref.slice(1);
    modifiers = modifiers.reduce(function (mods, mod) {
      mods[mod] = true;
      return mods;
    }, {});
    getAndRemoveAttr(el, attr, true);
    addDirective(el, 'view', "v-view:" + attrName, '', arg, false, modifiers);
  }
}

var view = {
  transformNode: transformNode$2
};
var modules$1 = [class_$1, style$1, vTemplate$1, for_, router, view];

function model(el, dir) {
  if (el.type === 1 && isKnownView(el.tag)) {
    genViewComponentModel(el, dir.value, dir.modifiers);
  } else {
    genComponentModel(el, dir.value, dir.modifiers);
  }
}

function genViewComponentModel(el, value, modifiers) {
  var ref = modifiers || {};
  var number = ref.number;
  var trim = ref.trim;
  var ref$1 = getViewMeta(el.tag).model;
  var prop = ref$1.prop;
  var baseValueExpression = '$event';
  var valueExpression = baseValueExpression + ".object[" + JSON.stringify(prop) + "]";

  if (trim) {
    valueExpression = "(typeof " + valueExpression + " === 'string'" + "? " + valueExpression + ".trim()" + ": " + valueExpression + ")";
  }

  if (number) {
    valueExpression = "_n(" + valueExpression + ")";
  }

  var assignment = genAssignmentCode(value, valueExpression);
  el.model = {
    value: "(" + value + ")",
    expression: JSON.stringify(value),
    callback: "function (" + baseValueExpression + ") {" + assignment + "}"
  };
}

var directives$1 = {
  model: model
};
var baseOptions = {
  modules: modules$1,
  directives: directives$1,
  isUnaryTag: isUnaryTag,
  mustUseProp: mustUseProp,
  canBeLeftOpenTag: canBeLeftOpenTag,
  isReservedTag: isReservedTag,
  getTagNamespace: getTagNamespace,
  preserveWhitespace: false,
  staticKeys: genStaticKeys(modules$1)
};
var ref$1 = createCompiler(baseOptions);
var compileToFunctions = ref$1.compileToFunctions;

function Vue(options) {
  if ( true && !(this instanceof Vue)) {
    warn('Vue is a constructor and should be called with the `new` keyword');
  }

  this._init(options);
}

initMixin(Vue);
stateMixin(Vue);
eventsMixin(Vue);
lifecycleMixin(Vue);
renderMixin(Vue);
/*  */

function initUse(Vue) {
  Vue.use = function (plugin) {
    var installedPlugins = this._installedPlugins || (this._installedPlugins = []);

    if (installedPlugins.indexOf(plugin) > -1) {
      return this;
    } // additional parameters


    var args = toArray(arguments, 1);
    args.unshift(this);

    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args);
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args);
    }

    installedPlugins.push(plugin);
    return this;
  };
}
/*  */


function initMixin$1(Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
    return this;
  };
}
/*  */


function initExtend(Vue) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0;
  var cid = 1;
  /**
   * Class inheritance
   */

  Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {};
    var Super = this;
    var SuperId = Super.cid;
    var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});

    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId];
    }

    var name = extendOptions.name || Super.options.name;

    if ( true && name) {
      validateComponentName(name);
    }

    var Sub = function VueComponent(options) {
      this._init(options);
    };

    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.cid = cid++;
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub['super'] = Super; // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.

    if (Sub.options.props) {
      initProps$1(Sub);
    }

    if (Sub.options.computed) {
      initComputed$1(Sub);
    } // allow further extension/mixin/plugin usage


    Sub.extend = Super.extend;
    Sub.mixin = Super.mixin;
    Sub.use = Super.use; // create asset registers, so extended classes
    // can have their private assets too.

    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type];
    }); // enable recursive self-lookup

    if (name) {
      Sub.options.components[name] = Sub;
    } // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.


    Sub.superOptions = Super.options;
    Sub.extendOptions = extendOptions;
    Sub.sealedOptions = extend({}, Sub.options); // cache constructor

    cachedCtors[SuperId] = Sub;
    return Sub;
  };
}

function initProps$1(Comp) {
  var props = Comp.options.props;

  for (var key in props) {
    proxy(Comp.prototype, "_props", key);
  }
}

function initComputed$1(Comp) {
  var computed = Comp.options.computed;

  for (var key in computed) {
    defineComputed(Comp.prototype, key, computed[key]);
  }
}
/*  */


function initAssetRegisters(Vue) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(function (type) {
    Vue[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id];
      } else {
        /* istanbul ignore if */
        if ( true && type === 'component') {
          validateComponentName(id);
        }

        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id;
          definition = this.options._base.extend(definition);
        }

        if (type === 'directive' && typeof definition === 'function') {
          definition = {
            bind: definition,
            update: definition
          };
        }

        this.options[type + 's'][id] = definition;
        return definition;
      }
    };
  });
}
/*  */


function getComponentName(opts) {
  return opts && (opts.Ctor.options.name || opts.tag);
}

function matches(pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.indexOf(name) > -1;
  } else if (typeof pattern === 'string') {
    return pattern.split(',').indexOf(name) > -1;
  } else if (isRegExp(pattern)) {
    return pattern.test(name);
  }
  /* istanbul ignore next */


  return false;
}

function pruneCache(keepAliveInstance, filter) {
  var cache = keepAliveInstance.cache;
  var keys = keepAliveInstance.keys;
  var _vnode = keepAliveInstance._vnode;

  for (var key in cache) {
    var cachedNode = cache[key];

    if (cachedNode) {
      var name = getComponentName(cachedNode.componentOptions);

      if (name && !filter(name)) {
        pruneCacheEntry(cache, key, keys, _vnode);
      }
    }
  }
}

function pruneCacheEntry(cache, key, keys, current) {
  var cached = cache[key];

  if (cached && (!current || cached.tag !== current.tag)) {
    cached.componentInstance.$destroy();
  }

  cache[key] = null;
  remove(keys, key);
}

var patternTypes = [String, RegExp, Array];
var KeepAlive = {
  name: 'keep-alive',
  abstract: true,
  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },
  created: function created() {
    this.cache = Object.create(null);
    this.keys = [];
  },
  destroyed: function destroyed() {
    for (var key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys);
    }
  },
  mounted: function mounted() {
    var this$1 = this;
    this.$watch('include', function (val) {
      pruneCache(this$1, function (name) {
        return matches(val, name);
      });
    });
    this.$watch('exclude', function (val) {
      pruneCache(this$1, function (name) {
        return !matches(val, name);
      });
    });
  },
  render: function render() {
    var slot = this.$slots.default;
    var vnode = getFirstComponentChild(slot);
    var componentOptions = vnode && vnode.componentOptions;

    if (componentOptions) {
      // check pattern
      var name = getComponentName(componentOptions);
      var ref = this;
      var include = ref.include;
      var exclude = ref.exclude;

      if ( // not included
      include && (!name || !matches(include, name)) || // excluded
      exclude && name && matches(exclude, name)) {
        return vnode;
      }

      var ref$1 = this;
      var cache = ref$1.cache;
      var keys = ref$1.keys;
      var key = vnode.key == null // same constructor may get registered as different local components
      // so cid alone is not enough (#3269)
      ? componentOptions.Ctor.cid + (componentOptions.tag ? "::" + componentOptions.tag : '') : vnode.key;

      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance; // make current key freshest

        remove(keys, key);
        keys.push(key);
      } else {
        cache[key] = vnode;
        keys.push(key); // prune oldest entry

        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode);
        }
      }

      vnode.data.keepAlive = true;
    }

    return vnode || slot && slot[0];
  }
};
var builtInComponents = {
  KeepAlive: KeepAlive
};
/*  */

function initGlobalAPI(Vue) {
  // config
  var configDef = {};

  configDef.get = function () {
    return config;
  };

  if (true) {
    configDef.set = function () {
      warn('Do not replace the Vue.config object, set individual fields instead.');
    };
  }

  Object.defineProperty(Vue, 'config', configDef); // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.

  Vue.util = {
    warn: warn,
    extend: extend,
    mergeOptions: mergeOptions,
    defineReactive: defineReactive
  };
  Vue.set = set;
  Vue.delete = del;
  Vue.nextTick = nextTick; // 2.6 explicit observable API

  Vue.observable = function (obj) {
    observe(obj);
    return obj;
  };

  Vue.options = Object.create(null);
  ASSET_TYPES.forEach(function (type) {
    Vue.options[type + 's'] = Object.create(null);
  }); // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.

  Vue.options._base = Vue;
  extend(Vue.options.components, builtInComponents);
  initUse(Vue);
  initMixin$1(Vue);
  initExtend(Vue);
  initAssetRegisters(Vue);
}

initGlobalAPI(Vue);
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
});
Object.defineProperty(Vue.prototype, '$ssrContext', {
  get: function get() {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext;
  }
}); // expose FunctionalRenderContext for ssr runtime helper installation

Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
});
Vue.version = '2.6.12'; // recursively search for possible transition defined inside the component root

function locateNode(vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transition) ? locateNode(vnode.componentInstance._vnode) : vnode;
}

var show = {
  bind: function bind(el, ref, vnode) {
    var value = ref.value;
    vnode = locateNode(vnode);
    var transition = vnode.data && vnode.data.transition;
    var originalVisibility = el.__vOriginalVisibility = el.getAttribute('visibility') === 'none' ? '' : el.getAttribute('visibility');

    if (value && transition) {
      vnode.data.show = true;
      enter(vnode, function () {
        el.setAttribute('visibility', originalVisibility);
      });
    } else {
      el.setAttribute('visibility', value ? originalVisibility : 'collapsed');
    }
  },
  update: function update(el, ref, vnode) {
    var value = ref.value;
    var oldValue = ref.oldValue;
    /* istanbul ignore if */

    if (!value === !oldValue) {
      return;
    }

    vnode = locateNode(vnode);
    var transition = vnode.data && vnode.data.transition;

    if (transition) {
      vnode.data.show = true;

      if (value) {
        enter(vnode, function () {
          el.setAttribute('visibility', el.__vOriginalVisibility);
        });
      } else {
        leave(vnode, function () {
          el.setAttribute('visibility', 'collapsed');
        });
      }
    } else {
      el.setAttribute('visibility', value ? el.__vOriginalVisibility : 'collapsed');
    }
  },
  unbind: function unbind(el, binding, vnode, oldVnode, isDestroy) {
    if (!isDestroy) {
      el.setAttribute('visibility', el.__vOriginalVisibility);
    }
  }
};
var view$1 = {
  inserted: function inserted(el, ref) {
    var arg = ref.arg;
    var modifiers = ref.modifiers;
    var parent = el.parentNode.nativeView;

    if (parent) {
      if (modifiers.array) {
        parent[arg] = (parent[arg] || []).push(el.nativeView);
      } else {
        parent[arg] = el.nativeView;
      }
    }
  }
};
var platformDirectives = {
  show: show,
  view: view$1
};
Vue.config.mustUseProp = mustUseProp;
Vue.config.isReservedTag = isReservedTag;
Vue.config.isUnknownElement = isUnknownElement;
Vue.$document = Vue.prototype.$document = new DocumentNode(); // Exposed for advanced uses only, not public API

Vue.__flushCallbacks__ = flushCallbacks;
Vue.compile = compileToFunctions;
Vue.registerElement = registerElement;
Object.assign(Vue.options.directives, platformDirectives);
Vue.prototype.__patch__ = patch;

Vue.prototype.$mount = function (el, hydrating) {
  var options = this.$options; // resolve template/el and convert to render function

  if (!options.render) {
    var template = options.template;

    if (template && typeof template !== 'string') {
      warn('invalid template option: ' + template, this);
      return this;
    }

    if (template) {
      var ref = compileToFunctions(template, {
        delimiters: options.delimiters,
        comments: options.comments
      }, this);
      var render = ref.render;
      var staticRenderFns = ref.staticRenderFns;
      options.render = render;
      options.staticRenderFns = staticRenderFns;
    }
  }

  return mountComponent(this, el, hydrating);
};

Vue.prototype.$start = function () {
  var self = this;
  var AppConstructor = Vue.extend(this.$options); // register NS components into Vue

  Object.values(getElementMap()).forEach(function (entry) {
    Vue.component(entry.meta.component.name, entry.meta.component);
  });
  core.Application.run({
    create: function create() {
      if (self.$el) {
        self.$destroy();
        self = new AppConstructor();
      }

      self.$mount();
      return self.$el.nativeView;
    }
  });
}; // Define a `nativeView` getter in every NS vue instance


Object.defineProperty(Vue.prototype, 'nativeView', {
  get: function get() {
    return this.$el ? this.$el.nativeView : undefined;
  }
});
var sequentialCounter = 0;

function serializeModalOptions(options) {
  if (false) {}

  var allowed = ['fullscreen'];
  return Object.keys(options).filter(function (key) {
    return allowed.includes(key);
  }).map(function (key) {
    return key + ": " + options[key];
  }).concat("uid: " + ++sequentialCounter).join(', ');
}

function getTargetView(target) {
  if (isObject(target) && isDef(target.$el)) {
    return target.$el.nativeView;
  } else if (isDef(target.nativeView)) {
    return target.nativeView;
  } else if (target[VUE_ELEMENT_REF]) {
    return target;
  }
}

function _findParentModalEntry(vm) {
  if (!vm) {
    return false;
  }

  var entry = vm.$parent;

  while (entry && entry.$options.name !== 'ModalEntry') {
    entry = entry.$parent;
  }

  return entry;
}

var ModalPlugin = {
  install: function install(Vue) {
    Vue.mixin({
      created: function created() {
        var self = this;
        this.$modal = {
          close: function close(data) {
            var entry = _findParentModalEntry(self);

            if (entry) {
              entry.closeCb(data);
            }
          }
        };
      }
    });

    Vue.prototype.$showModal = function (component, options) {
      var this$1 = this;
      return new Promise(function (resolve) {
        var resolved = false;

        var closeCb = function (data) {
          if (resolved) {
            return;
          }

          resolved = true;
          resolve(data);
          modalPage.closeModal(); // emitted to show up in devtools
          // for debugging purposes

          navEntryInstance.$emit('modal:close', data);
          navEntryInstance.$destroy();
        }; // build options object with defaults


        options = Object.assign({
          target: this$1.$root
        }, options, {
          context: null,
          closeCallback: closeCb
        });
        var navEntryInstance = new Vue({
          name: 'ModalEntry',
          parent: options.target,
          methods: {
            closeCb: closeCb
          },
          render: function (h) {
            return h(component, {
              props: options.props,
              key: serializeModalOptions(options)
            });
          }
        });
        var modalPage = navEntryInstance.$mount().$el.nativeView;
        updateDevtools();
        getTargetView(options.target).showModal(modalPage, options);
      });
    };
  }
};
var sequentialCounter$1 = 0;

function serializeNavigationOptions(options) {
  if (false) {}

  var allowed = ['backstackVisible', 'clearHistory'];
  return Object.keys(options).filter(function (key) {
    return allowed.includes(key);
  }).map(function (key) {
    return key + ": " + options[key];
  }).concat("uid: " + ++sequentialCounter$1).join(', ');
}

function getFrameInstance(frame) {
  // get the frame that we need to navigate
  // this can be a frame id (String)
  // a Vue ref to a frame
  // a Frame ViewNode
  // or a Frame instance
  if (isObject(frame) && isDef(frame.$el)) {
    frame = frame.$el.nativeView;
  } else if (isPrimitive(frame)) {
    frame = __webpack_require__("@nativescript/core").Frame.getFrameById(frame);
  } else if (isDef(frame.nativeView)) {
    frame = frame.nativeView;
  } // finally get the component instance for this frame


  return getFrame(frame.id);
}

function findParentFrame(vm) {
  if (!vm) {
    return false;
  }

  var entry = vm.$parent;

  while (entry && entry.$options.name !== 'Frame') {
    entry = entry.$parent;
  }

  return entry;
}

var NavigatorPlugin = {
  install: function install(Vue) {
    Vue.navigateBack = Vue.prototype.$navigateBack = function (options, backstackEntry) {
      if (backstackEntry === void 0) backstackEntry = null;
      var parentFrame = findParentFrame(this);
      var defaultOptions = {
        frame: parentFrame ? parentFrame : 'default'
      };
      options = Object.assign({}, defaultOptions, options);
      var frame = getFrameInstance(options.frame);
      frame.back(backstackEntry);
    };

    Vue.navigateTo = Vue.prototype.$navigateTo = function (component, options) {
      var defaultOptions = {
        frame: 'default'
      }; // build options object with defaults

      options = Object.assign({}, defaultOptions, options);
      return new Promise(function (resolve) {
        var frame = getFrameInstance(options.frame);
        var navEntryInstance = new Vue({
          abstract: true,
          functional: true,
          name: 'NavigationEntry',
          parent: frame,
          frame: frame,
          render: function (h) {
            return h(component, {
              props: options.props,
              key: serializeNavigationOptions(options)
            });
          }
        });
        var page = navEntryInstance.$mount().$el.nativeView;
        updateDevtools();
        var resolveOnEvent = options.resolveOnEvent; // ensure we dont resolve twice event though this should never happen!

        var resolved = false;

        var handler = function (args) {
          if (args.isBackNavigation) {
            page.off('navigatedFrom', handler);
            navEntryInstance.$destroy();
          }
        };

        page.on('navigatedFrom', handler);

        if (resolveOnEvent) {
          var resolveHandler = function (args) {
            if (!resolved) {
              resolved = true;
              resolve(page);
            }

            page.off(resolveOnEvent, resolveHandler);
          };

          page.on(resolveOnEvent, resolveHandler);
        } // ensure that the navEntryInstance vue instance is destroyed when the
        // page is disposed (clearHistory: true for example)


        var dispose = page.disposeNativeView;

        page.disposeNativeView = function () {
          var args = [],
              len = arguments.length;

          while (len--) args[len] = arguments[len];

          navEntryInstance.$destroy();
          dispose.call(page, args);
        };

        frame.navigate(Object.assign({}, options, {
          create: function () {
            return page;
          }
        }));

        if (!resolveOnEvent) {
          resolved = true;
          resolve(page);
        }
      });
    };
  }
};
Vue.config.silent = true;
Vue.config.suppressRenderLogs = false;
setVue(Vue);
Vue.use(ModalPlugin);
Vue.use(NavigatorPlugin);

global.__onLiveSyncCore = function () {
  var frame = __webpack_require__("@nativescript/core").Frame.topmost();

  if (frame) {
    if (frame.currentPage && frame.currentPage.modal) {
      frame.currentPage.modal.closeModal();
    }

    if (frame.currentPage) {
      frame.currentPage.addCssFile(__webpack_require__("@nativescript/core").Application.getCssFileName());
    }
  }
};

module.exports = Vue;
/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__("../node_modules/webpack/buildin/global.js")))

/***/ }),

/***/ "../node_modules/postcss-value-parser/lib/index.js":
/***/ (function(module, exports, __webpack_require__) {

var parse = __webpack_require__("../node_modules/postcss-value-parser/lib/parse.js");

var walk = __webpack_require__("../node_modules/postcss-value-parser/lib/walk.js");

var stringify = __webpack_require__("../node_modules/postcss-value-parser/lib/stringify.js");

function ValueParser(value) {
  if (this instanceof ValueParser) {
    this.nodes = parse(value);
    return this;
  }

  return new ValueParser(value);
}

ValueParser.prototype.toString = function () {
  return Array.isArray(this.nodes) ? stringify(this.nodes) : "";
};

ValueParser.prototype.walk = function (cb, bubble) {
  walk(this.nodes, cb, bubble);
  return this;
};

ValueParser.unit = __webpack_require__("../node_modules/postcss-value-parser/lib/unit.js");
ValueParser.walk = walk;
ValueParser.stringify = stringify;
module.exports = ValueParser;

/***/ }),

/***/ "../node_modules/postcss-value-parser/lib/parse.js":
/***/ (function(module, exports) {

var openParentheses = "(".charCodeAt(0);
var closeParentheses = ")".charCodeAt(0);
var singleQuote = "'".charCodeAt(0);
var doubleQuote = '"'.charCodeAt(0);
var backslash = "\\".charCodeAt(0);
var slash = "/".charCodeAt(0);
var comma = ",".charCodeAt(0);
var colon = ":".charCodeAt(0);
var star = "*".charCodeAt(0);

module.exports = function (input) {
  var tokens = [];
  var value = input;
  var next, quote, prev, token, escape, escapePos, whitespacePos;
  var pos = 0;
  var code = value.charCodeAt(pos);
  var max = value.length;
  var stack = [{
    nodes: tokens
  }];
  var balanced = 0;
  var parent;
  var name = "";
  var before = "";
  var after = "";

  while (pos < max) {
    // Whitespaces
    if (code <= 32) {
      next = pos;

      do {
        next += 1;
        code = value.charCodeAt(next);
      } while (code <= 32);

      token = value.slice(pos, next);
      prev = tokens[tokens.length - 1];

      if (code === closeParentheses && balanced) {
        after = token;
      } else if (prev && prev.type === "div") {
        prev.after = token;
      } else if (code === comma || code === colon || code === slash && value.charCodeAt(next + 1) !== star) {
        before = token;
      } else {
        tokens.push({
          type: "space",
          sourceIndex: pos,
          value: token
        });
      }

      pos = next; // Quotes
    } else if (code === singleQuote || code === doubleQuote) {
      next = pos;
      quote = code === singleQuote ? "'" : '"';
      token = {
        type: "string",
        sourceIndex: pos,
        quote: quote
      };

      do {
        escape = false;
        next = value.indexOf(quote, next + 1);

        if (~next) {
          escapePos = next;

          while (value.charCodeAt(escapePos - 1) === backslash) {
            escapePos -= 1;
            escape = !escape;
          }
        } else {
          value += quote;
          next = value.length - 1;
          token.unclosed = true;
        }
      } while (escape);

      token.value = value.slice(pos + 1, next);
      tokens.push(token);
      pos = next + 1;
      code = value.charCodeAt(pos); // Comments
    } else if (code === slash && value.charCodeAt(pos + 1) === star) {
      token = {
        type: "comment",
        sourceIndex: pos
      };
      next = value.indexOf("*/", pos);

      if (next === -1) {
        token.unclosed = true;
        next = value.length;
      }

      token.value = value.slice(pos + 2, next);
      tokens.push(token);
      pos = next + 2;
      code = value.charCodeAt(pos); // Dividers
    } else if (code === slash || code === comma || code === colon) {
      token = value[pos];
      tokens.push({
        type: "div",
        sourceIndex: pos - before.length,
        value: token,
        before: before,
        after: ""
      });
      before = "";
      pos += 1;
      code = value.charCodeAt(pos); // Open parentheses
    } else if (openParentheses === code) {
      // Whitespaces after open parentheses
      next = pos;

      do {
        next += 1;
        code = value.charCodeAt(next);
      } while (code <= 32);

      token = {
        type: "function",
        sourceIndex: pos - name.length,
        value: name,
        before: value.slice(pos + 1, next)
      };
      pos = next;

      if (name === "url" && code !== singleQuote && code !== doubleQuote) {
        next -= 1;

        do {
          escape = false;
          next = value.indexOf(")", next + 1);

          if (~next) {
            escapePos = next;

            while (value.charCodeAt(escapePos - 1) === backslash) {
              escapePos -= 1;
              escape = !escape;
            }
          } else {
            value += ")";
            next = value.length - 1;
            token.unclosed = true;
          }
        } while (escape); // Whitespaces before closed


        whitespacePos = next;

        do {
          whitespacePos -= 1;
          code = value.charCodeAt(whitespacePos);
        } while (code <= 32);

        if (pos !== whitespacePos + 1) {
          token.nodes = [{
            type: "word",
            sourceIndex: pos,
            value: value.slice(pos, whitespacePos + 1)
          }];
        } else {
          token.nodes = [];
        }

        if (token.unclosed && whitespacePos + 1 !== next) {
          token.after = "";
          token.nodes.push({
            type: "space",
            sourceIndex: whitespacePos + 1,
            value: value.slice(whitespacePos + 1, next)
          });
        } else {
          token.after = value.slice(whitespacePos + 1, next);
        }

        pos = next + 1;
        code = value.charCodeAt(pos);
        tokens.push(token);
      } else {
        balanced += 1;
        token.after = "";
        tokens.push(token);
        stack.push(token);
        tokens = token.nodes = [];
        parent = token;
      }

      name = ""; // Close parentheses
    } else if (closeParentheses === code && balanced) {
      pos += 1;
      code = value.charCodeAt(pos);
      parent.after = after;
      after = "";
      balanced -= 1;
      stack.pop();
      parent = stack[balanced];
      tokens = parent.nodes; // Words
    } else {
      next = pos;

      do {
        if (code === backslash) {
          next += 1;
        }

        next += 1;
        code = value.charCodeAt(next);
      } while (next < max && !(code <= 32 || code === singleQuote || code === doubleQuote || code === comma || code === colon || code === slash || code === openParentheses || code === closeParentheses && balanced));

      token = value.slice(pos, next);

      if (openParentheses === code) {
        name = token;
      } else {
        tokens.push({
          type: "word",
          sourceIndex: pos,
          value: token
        });
      }

      pos = next;
    }
  }

  for (pos = stack.length - 1; pos; pos -= 1) {
    stack[pos].unclosed = true;
  }

  return stack[0].nodes;
};

/***/ }),

/***/ "../node_modules/postcss-value-parser/lib/stringify.js":
/***/ (function(module, exports) {

function stringifyNode(node, custom) {
  var type = node.type;
  var value = node.value;
  var buf;
  var customResult;

  if (custom && (customResult = custom(node)) !== undefined) {
    return customResult;
  } else if (type === "word" || type === "space") {
    return value;
  } else if (type === "string") {
    buf = node.quote || "";
    return buf + value + (node.unclosed ? "" : buf);
  } else if (type === "comment") {
    return "/*" + value + (node.unclosed ? "" : "*/");
  } else if (type === "div") {
    return (node.before || "") + value + (node.after || "");
  } else if (Array.isArray(node.nodes)) {
    buf = stringify(node.nodes);

    if (type !== "function") {
      return buf;
    }

    return value + "(" + (node.before || "") + buf + (node.after || "") + (node.unclosed ? "" : ")");
  }

  return value;
}

function stringify(nodes, custom) {
  var result, i;

  if (Array.isArray(nodes)) {
    result = "";

    for (i = nodes.length - 1; ~i; i -= 1) {
      result = stringifyNode(nodes[i], custom) + result;
    }

    return result;
  }

  return stringifyNode(nodes, custom);
}

module.exports = stringify;

/***/ }),

/***/ "../node_modules/postcss-value-parser/lib/unit.js":
/***/ (function(module, exports) {

var minus = "-".charCodeAt(0);
var plus = "+".charCodeAt(0);
var dot = ".".charCodeAt(0);
var exp = "e".charCodeAt(0);
var EXP = "E".charCodeAt(0);

module.exports = function (value) {
  var pos = 0;
  var length = value.length;
  var dotted = false;
  var sciPos = -1;
  var containsNumber = false;
  var code;

  while (pos < length) {
    code = value.charCodeAt(pos);

    if (code >= 48 && code <= 57) {
      containsNumber = true;
    } else if (code === exp || code === EXP) {
      if (sciPos > -1) {
        break;
      }

      sciPos = pos;
    } else if (code === dot) {
      if (dotted) {
        break;
      }

      dotted = true;
    } else if (code === plus || code === minus) {
      if (pos !== 0) {
        break;
      }
    } else {
      break;
    }

    pos += 1;
  }

  if (sciPos + 1 === pos) pos--;
  return containsNumber ? {
    number: value.slice(0, pos),
    unit: value.slice(pos)
  } : false;
};

/***/ }),

/***/ "../node_modules/postcss-value-parser/lib/walk.js":
/***/ (function(module, exports) {

module.exports = function walk(nodes, cb, bubble) {
  var i, max, node, result;

  for (i = 0, max = nodes.length; i < max; i += 1) {
    node = nodes[i];

    if (!bubble) {
      result = cb(node, i, nodes);
    }

    if (result !== false && node.type === "function" && Array.isArray(node.nodes)) {
      walk(node.nodes, cb, bubble);
    }

    if (bubble) {
      cb(node, i, nodes);
    }
  }
};

/***/ }),

/***/ "../node_modules/reduce-css-calc/dist/index.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcssValueParser = __webpack_require__("../node_modules/postcss-value-parser/lib/index.js");

var _postcssValueParser2 = _interopRequireDefault(_postcssValueParser);

var _parser = __webpack_require__("../node_modules/reduce-css-calc/dist/parser.js");

var _reducer = __webpack_require__("../node_modules/reduce-css-calc/dist/lib/reducer.js");

var _reducer2 = _interopRequireDefault(_reducer);

var _stringifier = __webpack_require__("../node_modules/reduce-css-calc/dist/lib/stringifier.js");

var _stringifier2 = _interopRequireDefault(_stringifier);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
} // eslint-disable-line


var MATCH_CALC = /((?:\-[a-z]+\-)?calc)/;

exports.default = function (value) {
  var precision = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
  return (0, _postcssValueParser2.default)(value).walk(function (node) {
    // skip anything which isn't a calc() function
    if (node.type !== 'function' || !MATCH_CALC.test(node.value)) return; // stringify calc expression and produce an AST

    var contents = _postcssValueParser2.default.stringify(node.nodes); // skip constant() and env()


    if (contents.indexOf('constant') >= 0 || contents.indexOf('env') >= 0) return;

    var ast = _parser.parser.parse(contents); // reduce AST to its simplest form, that is, either to a single value
    // or a simplified calc expression


    var reducedAst = (0, _reducer2.default)(ast, precision); // stringify AST and write it back

    node.type = 'word';
    node.value = (0, _stringifier2.default)(node.value, reducedAst, precision);
  }, true).toString();
};

module.exports = exports['default'];

/***/ }),

/***/ "../node_modules/reduce-css-calc/dist/lib/convert.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cssUnitConverter = __webpack_require__("../node_modules/css-unit-converter/index.js");

var _cssUnitConverter2 = _interopRequireDefault(_cssUnitConverter);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

function convertNodes(left, right, precision) {
  switch (left.type) {
    case 'LengthValue':
    case 'AngleValue':
    case 'TimeValue':
    case 'FrequencyValue':
    case 'ResolutionValue':
      return convertAbsoluteLength(left, right, precision);

    default:
      return {
        left: left,
        right: right
      };
  }
}

function convertAbsoluteLength(left, right, precision) {
  if (right.type === left.type) {
    right = {
      type: left.type,
      value: (0, _cssUnitConverter2.default)(right.value, right.unit, left.unit, precision),
      unit: left.unit
    };
  }

  return {
    left: left,
    right: right
  };
}

exports.default = convertNodes;
module.exports = exports['default'];

/***/ }),

/***/ "../node_modules/reduce-css-calc/dist/lib/reducer.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flip = flip;

var _convert = __webpack_require__("../node_modules/reduce-css-calc/dist/lib/convert.js");

var _convert2 = _interopRequireDefault(_convert);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

function reduce(node, precision) {
  if (node.type === "MathExpression") return reduceMathExpression(node, precision);
  return node;
}

function isEqual(left, right) {
  return left.type === right.type && left.value === right.value;
}

function isValueType(type) {
  switch (type) {
    case 'LengthValue':
    case 'AngleValue':
    case 'TimeValue':
    case 'FrequencyValue':
    case 'ResolutionValue':
    case 'EmValue':
    case 'ExValue':
    case 'ChValue':
    case 'RemValue':
    case 'VhValue':
    case 'VwValue':
    case 'VminValue':
    case 'VmaxValue':
    case 'PercentageValue':
    case 'Value':
      return true;
  }

  return false;
}

function convertMathExpression(node, precision) {
  var nodes = (0, _convert2.default)(node.left, node.right, precision);
  var left = reduce(nodes.left, precision);
  var right = reduce(nodes.right, precision);

  if (left.type === "MathExpression" && right.type === "MathExpression") {
    if (left.operator === '/' && right.operator === '*' || left.operator === '-' && right.operator === '+' || left.operator === '*' && right.operator === '/' || left.operator === '+' && right.operator === '-') {
      if (isEqual(left.right, right.right)) nodes = (0, _convert2.default)(left.left, right.left, precision);else if (isEqual(left.right, right.left)) nodes = (0, _convert2.default)(left.left, right.right, precision);
      left = reduce(nodes.left, precision);
      right = reduce(nodes.right, precision);
    }
  }

  node.left = left;
  node.right = right;
  return node;
}

function flip(operator) {
  return operator === '+' ? '-' : '+';
}

function flipValue(node) {
  if (isValueType(node.type)) node.value = -node.value;else if (node.type == 'MathExpression') {
    node.left = flipValue(node.left);
    node.right = flipValue(node.right);
  }
  return node;
}

function reduceAddSubExpression(node, precision) {
  var _node = node,
      left = _node.left,
      right = _node.right,
      op = _node.operator;
  if (left.type === 'CssVariable' || right.type === 'CssVariable') return node; // something + 0 => something
  // something - 0 => something

  if (right.value === 0) return left; // 0 + something => something

  if (left.value === 0 && op === "+") return right; // 0 - something => -something

  if (left.value === 0 && op === "-") return flipValue(right); // value + value
  // value - value

  if (left.type === right.type && isValueType(left.type)) {
    node = Object.assign({}, left);
    if (op === "+") node.value = left.value + right.value;else node.value = left.value - right.value;
  } // value <op> (expr)


  if (isValueType(left.type) && (right.operator === '+' || right.operator === '-') && right.type === 'MathExpression') {
    // value + (value + something) => (value + value) + something
    // value + (value - something) => (value + value) - something
    // value - (value + something) => (value - value) - something
    // value - (value - something) => (value - value) + something
    if (left.type === right.left.type) {
      node = Object.assign({}, node);
      node.left = reduce({
        type: 'MathExpression',
        operator: op,
        left: left,
        right: right.left
      }, precision);
      node.right = right.right;
      node.operator = op === '-' ? flip(right.operator) : right.operator;
      return reduce(node, precision);
    } // value + (something + value) => (value + value) + something
    // value + (something - value) => (value - value) + something
    // value - (something + value) => (value - value) - something
    // value - (something - value) => (value + value) - something
    else if (left.type === right.right.type) {
        node = Object.assign({}, node);
        node.left = reduce({
          type: 'MathExpression',
          operator: op === '-' ? flip(right.operator) : right.operator,
          left: left,
          right: right.right
        }, precision);
        node.right = right.left;
        return reduce(node, precision);
      }
  } // (expr) <op> value


  if (left.type === 'MathExpression' && (left.operator === '+' || left.operator === '-') && isValueType(right.type)) {
    // (value + something) + value => (value + value) + something
    // (value - something) + value => (value + value) - something
    // (value + something) - value => (value - value) + something
    // (value - something) - value => (value - value) - something
    if (right.type === left.left.type) {
      node = Object.assign({}, left);
      node.left = reduce({
        type: 'MathExpression',
        operator: op,
        left: left.left,
        right: right
      }, precision);
      return reduce(node, precision);
    } // (something + value) + value => something + (value + value)
    // (something - value1) + value2 => something - (value2 - value1)
    // (something + value) - value => something + (value - value)
    // (something - value) - value => something - (value + value)
    else if (right.type === left.right.type) {
        node = Object.assign({}, left);

        if (left.operator === '-') {
          node.right = reduce({
            type: 'MathExpression',
            operator: op === '-' ? '+' : '-',
            left: right,
            right: left.right
          }, precision);
          node.operator = op === '-' ? '-' : '+';
        } else {
          node.right = reduce({
            type: 'MathExpression',
            operator: op,
            left: left.right,
            right: right
          }, precision);
        }

        if (node.right.value < 0) {
          node.right.value *= -1;
          node.operator = node.operator === '-' ? '+' : '-';
        }

        return reduce(node, precision);
      }
  }

  return node;
}

function reduceDivisionExpression(node, precision) {
  if (!isValueType(node.right.type)) return node;
  if (node.right.type !== 'Value') throw new Error('Cannot divide by "' + node.right.unit + '", number expected');
  if (node.right.value === 0) throw new Error('Cannot divide by zero'); // (expr) / value

  if (node.left.type === 'MathExpression') {
    if (isValueType(node.left.left.type) && isValueType(node.left.right.type)) {
      node.left.left.value /= node.right.value;
      node.left.right.value /= node.right.value;
      return reduce(node.left, precision);
    }

    return node;
  } // something / value
  else if (isValueType(node.left.type)) {
      node.left.value /= node.right.value;
      return node.left;
    }

  return node;
}

function reduceMultiplicationExpression(node) {
  // (expr) * value
  if (node.left.type === 'MathExpression' && node.right.type === 'Value') {
    if (isValueType(node.left.left.type) && isValueType(node.left.right.type)) {
      node.left.left.value *= node.right.value;
      node.left.right.value *= node.right.value;
      return node.left;
    }
  } // something * value
  else if (isValueType(node.left.type) && node.right.type === 'Value') {
      node.left.value *= node.right.value;
      return node.left;
    } // value * (expr)
    else if (node.left.type === 'Value' && node.right.type === 'MathExpression') {
        if (isValueType(node.right.left.type) && isValueType(node.right.right.type)) {
          node.right.left.value *= node.left.value;
          node.right.right.value *= node.left.value;
          return node.right;
        }
      } // value * something
      else if (node.left.type === 'Value' && isValueType(node.right.type)) {
          node.right.value *= node.left.value;
          return node.right;
        }

  return node;
}

function reduceMathExpression(node, precision) {
  node = convertMathExpression(node, precision);

  switch (node.operator) {
    case "+":
    case "-":
      return reduceAddSubExpression(node, precision);

    case "/":
      return reduceDivisionExpression(node, precision);

    case "*":
      return reduceMultiplicationExpression(node);
  }

  return node;
}

exports.default = reduce;

/***/ }),

/***/ "../node_modules/reduce-css-calc/dist/lib/stringifier.js":
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (calc, node, precision) {
  var str = stringify(node, precision);

  if (node.type === "MathExpression") {
    // if calc expression couldn't be resolved to a single value, re-wrap it as
    // a calc()
    str = calc + "(" + str + ")";
  }

  return str;
};

var _reducer = __webpack_require__("../node_modules/reduce-css-calc/dist/lib/reducer.js");

var order = {
  "*": 0,
  "/": 0,
  "+": 1,
  "-": 1
};

function round(value, prec) {
  if (prec !== false) {
    var precision = Math.pow(10, prec);
    return Math.round(value * precision) / precision;
  }

  return value;
}

function stringify(node, prec) {
  switch (node.type) {
    case "MathExpression":
      {
        var left = node.left,
            right = node.right,
            op = node.operator;
        var str = "";
        if (left.type === 'MathExpression' && order[op] < order[left.operator]) str += "(" + stringify(left, prec) + ")";else str += stringify(left, prec);
        str += " " + node.operator + " ";
        if (right.type === 'MathExpression' && order[op] < order[right.operator]) str += "(" + stringify(right, prec) + ")";else if (right.type === 'MathExpression' && op === "-" && ["+", "-"].includes(right.operator)) {
          // fix #52 : a-(b+c) = a-b-c
          right.operator = (0, _reducer.flip)(right.operator);
          str += stringify(right, prec);
        } else str += stringify(right, prec);
        return str;
      }

    case "Value":
      return round(node.value, prec);

    case 'CssVariable':
      return node.value;

    default:
      return round(node.value, prec) + node.unit;
  }
}

module.exports = exports["default"];

/***/ }),

/***/ "../node_modules/reduce-css-calc/dist/parser.js":
/***/ (function(module, exports, __webpack_require__) {

/* parser generated by jison 0.6.1-215 */

/*
 * Returns a Parser object of the following structure:
 *
 *  Parser: {
 *    yy: {}     The so-called "shared state" or rather the *source* of it;
 *               the real "shared state" `yy` passed around to
 *               the rule actions, etc. is a derivative/copy of this one,
 *               not a direct reference!
 *  }
 *
 *  Parser.prototype: {
 *    yy: {},
 *    EOF: 1,
 *    TERROR: 2,
 *
 *    trace: function(errorMessage, ...),
 *
 *    JisonParserError: function(msg, hash),
 *
 *    quoteName: function(name),
 *               Helper function which can be overridden by user code later on: put suitable
 *               quotes around literal IDs in a description string.
 *
 *    originalQuoteName: function(name),
 *               The basic quoteName handler provided by JISON.
 *               `cleanupAfterParse()` will clean up and reset `quoteName()` to reference this function
 *               at the end of the `parse()`.
 *
 *    describeSymbol: function(symbol),
 *               Return a more-or-less human-readable description of the given symbol, when
 *               available, or the symbol itself, serving as its own 'description' for lack
 *               of something better to serve up.
 *
 *               Return NULL when the symbol is unknown to the parser.
 *
 *    symbols_: {associative list: name ==> number},
 *    terminals_: {associative list: number ==> name},
 *    nonterminals: {associative list: rule-name ==> {associative list: number ==> rule-alt}},
 *    terminal_descriptions_: (if there are any) {associative list: number ==> description},
 *    productions_: [...],
 *
 *    performAction: function parser__performAction(yytext, yyleng, yylineno, yyloc, yystate, yysp, yyvstack, yylstack, yystack, yysstack),
 *
 *               The function parameters and `this` have the following value/meaning:
 *               - `this`    : reference to the `yyval` internal object, which has members (`$` and `_$`)
 *                             to store/reference the rule value `$$` and location info `@$`.
 *
 *                 One important thing to note about `this` a.k.a. `yyval`: every *reduce* action gets
 *                 to see the same object via the `this` reference, i.e. if you wish to carry custom
 *                 data from one reduce action through to the next within a single parse run, then you
 *                 may get nasty and use `yyval` a.k.a. `this` for storing you own semi-permanent data.
 *
 *                 `this.yy` is a direct reference to the `yy` shared state object.
 *
 *                 `%parse-param`-specified additional `parse()` arguments have been added to this `yy`
 *                 object at `parse()` start and are therefore available to the action code via the
 *                 same named `yy.xxxx` attributes (where `xxxx` represents a identifier name from
 *                 the %parse-param` list.
 *
 *               - `yytext`  : reference to the lexer value which belongs to the last lexer token used
 *                             to match this rule. This is *not* the look-ahead token, but the last token
 *                             that's actually part of this rule.
 *
 *                 Formulated another way, `yytext` is the value of the token immediately preceeding
 *                 the current look-ahead token.
 *                 Caveats apply for rules which don't require look-ahead, such as epsilon rules.
 *
 *               - `yyleng`  : ditto as `yytext`, only now for the lexer.yyleng value.
 *
 *               - `yylineno`: ditto as `yytext`, only now for the lexer.yylineno value.
 *
 *               - `yyloc`   : ditto as `yytext`, only now for the lexer.yylloc lexer token location info.
 *
 *                               WARNING: since jison 0.4.18-186 this entry may be NULL/UNDEFINED instead
 *                               of an empty object when no suitable location info can be provided.
 *
 *               - `yystate` : the current parser state number, used internally for dispatching and
 *                               executing the action code chunk matching the rule currently being reduced.
 *
 *               - `yysp`    : the current state stack position (a.k.a. 'stack pointer')
 *
 *                 This one comes in handy when you are going to do advanced things to the parser
 *                 stacks, all of which are accessible from your action code (see the next entries below).
 *
 *                 Also note that you can access this and other stack index values using the new double-hash
 *                 syntax, i.e. `##$ === ##0 === yysp`, while `##1` is the stack index for all things
 *                 related to the first rule term, just like you have `$1`, `@1` and `#1`.
 *                 This is made available to write very advanced grammar action rules, e.g. when you want
 *                 to investigate the parse state stack in your action code, which would, for example,
 *                 be relevant when you wish to implement error diagnostics and reporting schemes similar
 *                 to the work described here:
 *
 *                 + Pottier, F., 2016. Reachability and error diagnosis in LR(1) automata.
 *                   In Journées Francophones des Languages Applicatifs.
 *
 *                 + Jeffery, C.L., 2003. Generating LR syntax error messages from examples.
 *                   ACM Transactions on Programming Languages and Systems (TOPLAS), 25(5), pp.631–640.
 *
 *               - `yyrulelength`: the current rule's term count, i.e. the number of entries occupied on the stack.
 *
 *                 This one comes in handy when you are going to do advanced things to the parser
 *                 stacks, all of which are accessible from your action code (see the next entries below).
 *
 *               - `yyvstack`: reference to the parser value stack. Also accessed via the `$1` etc.
 *                             constructs.
 *
 *               - `yylstack`: reference to the parser token location stack. Also accessed via
 *                             the `@1` etc. constructs.
 *
 *                             WARNING: since jison 0.4.18-186 this array MAY contain slots which are
 *                             UNDEFINED rather than an empty (location) object, when the lexer/parser
 *                             action code did not provide a suitable location info object when such a
 *                             slot was filled!
 *
 *               - `yystack` : reference to the parser token id stack. Also accessed via the
 *                             `#1` etc. constructs.
 *
 *                 Note: this is a bit of a **white lie** as we can statically decode any `#n` reference to
 *                 its numeric token id value, hence that code wouldn't need the `yystack` but *you* might
 *                 want access this array for your own purposes, such as error analysis as mentioned above!
 *
 *                 Note that this stack stores the current stack of *tokens*, that is the sequence of
 *                 already parsed=reduced *nonterminals* (tokens representing rules) and *terminals*
 *                 (lexer tokens *shifted* onto the stack until the rule they belong to is found and
 *                 *reduced*.
 *
 *               - `yysstack`: reference to the parser state stack. This one carries the internal parser
 *                             *states* such as the one in `yystate`, which are used to represent
 *                             the parser state machine in the *parse table*. *Very* *internal* stuff,
 *                             what can I say? If you access this one, you're clearly doing wicked things
 *
 *               - `...`     : the extra arguments you specified in the `%parse-param` statement in your
 *                             grammar definition file.
 *
 *    table: [...],
 *               State transition table
 *               ----------------------
 *
 *               index levels are:
 *               - `state`  --> hash table
 *               - `symbol` --> action (number or array)
 *
 *                 If the `action` is an array, these are the elements' meaning:
 *                 - index [0]: 1 = shift, 2 = reduce, 3 = accept
 *                 - index [1]: GOTO `state`
 *
 *                 If the `action` is a number, it is the GOTO `state`
 *
 *    defaultActions: {...},
 *
 *    parseError: function(str, hash, ExceptionClass),
 *    yyError: function(str, ...),
 *    yyRecovering: function(),
 *    yyErrOk: function(),
 *    yyClearIn: function(),
 *
 *    constructParseErrorInfo: function(error_message, exception_object, expected_token_set, is_recoverable),
 *               Helper function **which will be set up during the first invocation of the `parse()` method**.
 *               Produces a new errorInfo 'hash object' which can be passed into `parseError()`.
 *               See it's use in this parser kernel in many places; example usage:
 *
 *                   var infoObj = parser.constructParseErrorInfo('fail!', null,
 *                                     parser.collect_expected_token_set(state), true);
 *                   var retVal = parser.parseError(infoObj.errStr, infoObj, parser.JisonParserError);
 *
 *    originalParseError: function(str, hash, ExceptionClass),
 *               The basic `parseError` handler provided by JISON.
 *               `cleanupAfterParse()` will clean up and reset `parseError()` to reference this function
 *               at the end of the `parse()`.
 *
 *    options: { ... parser %options ... },
 *
 *    parse: function(input[, args...]),
 *               Parse the given `input` and return the parsed value (or `true` when none was provided by
 *               the root action, in which case the parser is acting as a *matcher*).
 *               You MAY use the additional `args...` parameters as per `%parse-param` spec of this grammar:
 *               these extra `args...` are added verbatim to the `yy` object reference as member variables.
 *
 *               WARNING:
 *               Parser's additional `args...` parameters (via `%parse-param`) MAY conflict with
 *               any attributes already added to `yy` by the jison run-time;
 *               when such a collision is detected an exception is thrown to prevent the generated run-time
 *               from silently accepting this confusing and potentially hazardous situation!
 *
 *               The lexer MAY add its own set of additional parameters (via the `%parse-param` line in
 *               the lexer section of the grammar spec): these will be inserted in the `yy` shared state
 *               object and any collision with those will be reported by the lexer via a thrown exception.
 *
 *    cleanupAfterParse: function(resultValue, invoke_post_methods, do_not_nuke_errorinfos),
 *               Helper function **which will be set up during the first invocation of the `parse()` method**.
 *               This helper API is invoked at the end of the `parse()` call, unless an exception was thrown
 *               and `%options no-try-catch` has been defined for this grammar: in that case this helper MAY
 *               be invoked by calling user code to ensure the `post_parse` callbacks are invoked and
 *               the internal parser gets properly garbage collected under these particular circumstances.
 *
 *    yyMergeLocationInfo: function(first_index, last_index, first_yylloc, last_yylloc, dont_look_back),
 *               Helper function **which will be set up during the first invocation of the `parse()` method**.
 *               This helper API can be invoked to calculate a spanning `yylloc` location info object.
 *
 *               Note: %epsilon rules MAY specify no `first_index` and `first_yylloc`, in which case
 *               this function will attempt to obtain a suitable location marker by inspecting the location stack
 *               backwards.
 *
 *               For more info see the documentation comment further below, immediately above this function's
 *               implementation.
 *
 *    lexer: {
 *        yy: {...},           A reference to the so-called "shared state" `yy` once
 *                             received via a call to the `.setInput(input, yy)` lexer API.
 *        EOF: 1,
 *        ERROR: 2,
 *        JisonLexerError: function(msg, hash),
 *        parseError: function(str, hash, ExceptionClass),
 *        setInput: function(input, [yy]),
 *        input: function(),
 *        unput: function(str),
 *        more: function(),
 *        reject: function(),
 *        less: function(n),
 *        pastInput: function(n),
 *        upcomingInput: function(n),
 *        showPosition: function(),
 *        test_match: function(regex_match_array, rule_index, ...),
 *        next: function(...),
 *        lex: function(...),
 *        begin: function(condition),
 *        pushState: function(condition),
 *        popState: function(),
 *        topState: function(),
 *        _currentRules: function(),
 *        stateStackSize: function(),
 *        cleanupAfterLex: function()
 *
 *        options: { ... lexer %options ... },
 *
 *        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START, ...),
 *        rules: [...],
 *        conditions: {associative list: name ==> set},
 *    }
 *  }
 *
 *
 *  token location info (@$, _$, etc.): {
 *    first_line: n,
 *    last_line: n,
 *    first_column: n,
 *    last_column: n,
 *    range: [start_number, end_number]
 *               (where the numbers are indexes into the input string, zero-based)
 *  }
 *
 * ---
 *
 * The `parseError` function receives a 'hash' object with these members for lexer and
 * parser errors:
 *
 *  {
 *    text:        (matched text)
 *    token:       (the produced terminal token, if any)
 *    token_id:    (the produced terminal token numeric ID, if any)
 *    line:        (yylineno)
 *    loc:         (yylloc)
 *  }
 *
 * parser (grammar) errors will also provide these additional members:
 *
 *  {
 *    expected:    (array describing the set of expected tokens;
 *                  may be UNDEFINED when we cannot easily produce such a set)
 *    state:       (integer (or array when the table includes grammar collisions);
 *                  represents the current internal state of the parser kernel.
 *                  can, for example, be used to pass to the `collect_expected_token_set()`
 *                  API to obtain the expected token set)
 *    action:      (integer; represents the current internal action which will be executed)
 *    new_state:   (integer; represents the next/planned internal state, once the current
 *                  action has executed)
 *    recoverable: (boolean: TRUE when the parser MAY have an error recovery rule
 *                  available for this particular error)
 *    state_stack: (array: the current parser LALR/LR internal state stack; this can be used,
 *                  for instance, for advanced error analysis and reporting)
 *    value_stack: (array: the current parser LALR/LR internal `$$` value stack; this can be used,
 *                  for instance, for advanced error analysis and reporting)
 *    location_stack: (array: the current parser LALR/LR internal location stack; this can be used,
 *                  for instance, for advanced error analysis and reporting)
 *    yy:          (object: the current parser internal "shared state" `yy`
 *                  as is also available in the rule actions; this can be used,
 *                  for instance, for advanced error analysis and reporting)
 *    lexer:       (reference to the current lexer instance used by the parser)
 *    parser:      (reference to the current parser instance)
 *  }
 *
 * while `this` will reference the current parser instance.
 *
 * When `parseError` is invoked by the lexer, `this` will still reference the related *parser*
 * instance, while these additional `hash` fields will also be provided:
 *
 *  {
 *    lexer:       (reference to the current lexer instance which reported the error)
 *  }
 *
 * When `parseError` is invoked by the parser due to a **JavaScript exception** being fired
 * from either the parser or lexer, `this` will still reference the related *parser*
 * instance, while these additional `hash` fields will also be provided:
 *
 *  {
 *    exception:   (reference to the exception thrown)
 *  }
 *
 * Please do note that in the latter situation, the `expected` field will be omitted as
 * this type of failure is assumed not to be due to *parse errors* but rather due to user
 * action code in either parser or lexer failing unexpectedly.
 *
 * ---
 *
 * You can specify parser options by setting / modifying the `.yy` object of your Parser instance.
 * These options are available:
 *
 * ### options which are global for all parser instances
 *
 *  Parser.pre_parse: function(yy)
 *                 optional: you can specify a pre_parse() function in the chunk following
 *                 the grammar, i.e. after the last `%%`.
 *  Parser.post_parse: function(yy, retval, parseInfo) { return retval; }
 *                 optional: you can specify a post_parse() function in the chunk following
 *                 the grammar, i.e. after the last `%%`. When it does not return any value,
 *                 the parser will return the original `retval`.
 *
 * ### options which can be set up per parser instance
 *
 *  yy: {
 *      pre_parse:  function(yy)
 *                 optional: is invoked before the parse cycle starts (and before the first
 *                 invocation of `lex()`) but immediately after the invocation of
 *                 `parser.pre_parse()`).
 *      post_parse: function(yy, retval, parseInfo) { return retval; }
 *                 optional: is invoked when the parse terminates due to success ('accept')
 *                 or failure (even when exceptions are thrown).
 *                 `retval` contains the return value to be produced by `Parser.parse()`;
 *                 this function can override the return value by returning another.
 *                 When it does not return any value, the parser will return the original
 *                 `retval`.
 *                 This function is invoked immediately before `parser.post_parse()`.
 *
 *      parseError: function(str, hash, ExceptionClass)
 *                 optional: overrides the default `parseError` function.
 *      quoteName: function(name),
 *                 optional: overrides the default `quoteName` function.
 *  }
 *
 *  parser.lexer.options: {
 *      pre_lex:  function()
 *                 optional: is invoked before the lexer is invoked to produce another token.
 *                 `this` refers to the Lexer object.
 *      post_lex: function(token) { return token; }
 *                 optional: is invoked when the lexer has produced a token `token`;
 *                 this function can override the returned token value by returning another.
 *                 When it does not return any (truthy) value, the lexer will return
 *                 the original `token`.
 *                 `this` refers to the Lexer object.
 *
 *      ranges: boolean
 *                 optional: `true` ==> token location info will include a .range[] member.
 *      flex: boolean
 *                 optional: `true` ==> flex-like lexing behaviour where the rules are tested
 *                 exhaustively to find the longest match.
 *      backtrack_lexer: boolean
 *                 optional: `true` ==> lexer regexes are tested in order and for invoked;
 *                 the lexer terminates the scan when a token is returned by the action code.
 *      xregexp: boolean
 *                 optional: `true` ==> lexer rule regexes are "extended regex format" requiring the
 *                 `XRegExp` library. When this `%option` has not been specified at compile time, all lexer
 *                 rule regexes have been written as standard JavaScript RegExp expressions.
 *  }
 */
var parser = function () {
  // See also:
  // http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript/#35881508
  // but we keep the prototype.constructor and prototype.name assignment lines too for compatibility
  // with userland code which might access the derived class in a 'classic' way.
  function JisonParserError(msg, hash) {
    Object.defineProperty(this, 'name', {
      enumerable: false,
      writable: false,
      value: 'JisonParserError'
    });
    if (msg == null) msg = '???';
    Object.defineProperty(this, 'message', {
      enumerable: false,
      writable: true,
      value: msg
    });
    this.hash = hash;
    var stacktrace;

    if (hash && hash.exception instanceof Error) {
      var ex2 = hash.exception;
      this.message = ex2.message || msg;
      stacktrace = ex2.stack;
    }

    if (!stacktrace) {
      if (Error.hasOwnProperty('captureStackTrace')) {
        // V8/Chrome engine
        Error.captureStackTrace(this, this.constructor);
      } else {
        stacktrace = new Error(msg).stack;
      }
    }

    if (stacktrace) {
      Object.defineProperty(this, 'stack', {
        enumerable: false,
        writable: false,
        value: stacktrace
      });
    }
  }

  if (typeof Object.setPrototypeOf === 'function') {
    Object.setPrototypeOf(JisonParserError.prototype, Error.prototype);
  } else {
    JisonParserError.prototype = Object.create(Error.prototype);
  }

  JisonParserError.prototype.constructor = JisonParserError;
  JisonParserError.prototype.name = 'JisonParserError'; // helper: reconstruct the productions[] table

  function bp(s) {
    var rv = [];
    var p = s.pop;
    var r = s.rule;

    for (var i = 0, l = p.length; i < l; i++) {
      rv.push([p[i], r[i]]);
    }

    return rv;
  } // helper: reconstruct the defaultActions[] table


  function bda(s) {
    var rv = {};
    var d = s.idx;
    var g = s.goto;

    for (var i = 0, l = d.length; i < l; i++) {
      var j = d[i];
      rv[j] = g[i];
    }

    return rv;
  } // helper: reconstruct the 'goto' table


  function bt(s) {
    var rv = [];
    var d = s.len;
    var y = s.symbol;
    var t = s.type;
    var a = s.state;
    var m = s.mode;
    var g = s.goto;

    for (var i = 0, l = d.length; i < l; i++) {
      var n = d[i];
      var q = {};

      for (var j = 0; j < n; j++) {
        var z = y.shift();

        switch (t.shift()) {
          case 2:
            q[z] = [m.shift(), g.shift()];
            break;

          case 0:
            q[z] = a.shift();
            break;

          default:
            // type === 1: accept
            q[z] = [3];
        }
      }

      rv.push(q);
    }

    return rv;
  } // helper: runlength encoding with increment step: code, length: step (default step = 0)
  // `this` references an array


  function s(c, l, a) {
    a = a || 0;

    for (var i = 0; i < l; i++) {
      this.push(c);
      c += a;
    }
  } // helper: duplicate sequence from *relative* offset and length.
  // `this` references an array


  function c(i, l) {
    i = this.length - i;

    for (l += i; i < l; i++) {
      this.push(this[i]);
    }
  } // helper: unpack an array using helpers and data, all passed in an array argument 'a'.


  function u(a) {
    var rv = [];

    for (var i = 0, l = a.length; i < l; i++) {
      var e = a[i]; // Is this entry a helper function?

      if (typeof e === 'function') {
        i++;
        e.apply(rv, a[i]);
      } else {
        rv.push(e);
      }
    }

    return rv;
  }

  var parser = {
    // Code Generator Information Report
    // ---------------------------------
    //
    // Options:
    //
    //   default action mode: ............. ["classic","merge"]
    //   test-compile action mode: ........ "parser:*,lexer:*"
    //   try..catch: ...................... true
    //   default resolve on conflict: ..... true
    //   on-demand look-ahead: ............ false
    //   error recovery token skip maximum: 3
    //   yyerror in parse actions is: ..... NOT recoverable,
    //   yyerror in lexer actions and other non-fatal lexer are:
    //   .................................. NOT recoverable,
    //   debug grammar/output: ............ false
    //   has partial LR conflict upgrade:   true
    //   rudimentary token-stack support:   false
    //   parser table compression mode: ... 2
    //   export debug tables: ............. false
    //   export *all* tables: ............. false
    //   module type: ..................... commonjs
    //   parser engine type: .............. lalr
    //   output main() in the module: ..... true
    //   has user-specified main(): ....... false
    //   has user-specified require()/import modules for main():
    //   .................................. false
    //   number of expected conflicts: .... 0
    //
    //
    // Parser Analysis flags:
    //
    //   no significant actions (parser is a language matcher only):
    //   .................................. false
    //   uses yyleng: ..................... false
    //   uses yylineno: ................... false
    //   uses yytext: ..................... false
    //   uses yylloc: ..................... false
    //   uses ParseError API: ............. false
    //   uses YYERROR: .................... false
    //   uses YYRECOVERING: ............... false
    //   uses YYERROK: .................... false
    //   uses YYCLEARIN: .................. false
    //   tracks rule values: .............. true
    //   assigns rule values: ............. true
    //   uses location tracking: .......... false
    //   assigns location: ................ false
    //   uses yystack: .................... false
    //   uses yysstack: ................... false
    //   uses yysp: ....................... true
    //   uses yyrulelength: ............... false
    //   uses yyMergeLocationInfo API: .... false
    //   has error recovery: .............. false
    //   has error reporting: ............. false
    //
    // --------- END OF REPORT -----------
    trace: function no_op_trace() {},
    JisonParserError: JisonParserError,
    yy: {},
    options: {
      type: "lalr",
      hasPartialLrUpgradeOnConflict: true,
      errorRecoveryTokenDiscardCount: 3
    },
    symbols_: {
      "$accept": 0,
      "$end": 1,
      "ADD": 3,
      "ANGLE": 14,
      "CHS": 20,
      "CSS_VAR": 12,
      "DIV": 6,
      "EMS": 18,
      "EOF": 1,
      "EXS": 19,
      "FREQ": 16,
      "LENGTH": 13,
      "LPAREN": 7,
      "MUL": 5,
      "NESTED_CALC": 9,
      "NUMBER": 11,
      "PERCENTAGE": 26,
      "PREFIX": 10,
      "REMS": 21,
      "RES": 17,
      "RPAREN": 8,
      "SUB": 4,
      "TIME": 15,
      "VHS": 22,
      "VMAXS": 25,
      "VMINS": 24,
      "VWS": 23,
      "css_value": 31,
      "css_variable": 30,
      "error": 2,
      "expression": 27,
      "math_expression": 28,
      "value": 29
    },
    terminals_: {
      1: "EOF",
      2: "error",
      3: "ADD",
      4: "SUB",
      5: "MUL",
      6: "DIV",
      7: "LPAREN",
      8: "RPAREN",
      9: "NESTED_CALC",
      10: "PREFIX",
      11: "NUMBER",
      12: "CSS_VAR",
      13: "LENGTH",
      14: "ANGLE",
      15: "TIME",
      16: "FREQ",
      17: "RES",
      18: "EMS",
      19: "EXS",
      20: "CHS",
      21: "REMS",
      22: "VHS",
      23: "VWS",
      24: "VMINS",
      25: "VMAXS",
      26: "PERCENTAGE"
    },
    TERROR: 2,
    EOF: 1,
    // internals: defined here so the object *structure* doesn't get modified by parse() et al,
    // thus helping JIT compilers like Chrome V8.
    originalQuoteName: null,
    originalParseError: null,
    cleanupAfterParse: null,
    constructParseErrorInfo: null,
    yyMergeLocationInfo: null,
    __reentrant_call_depth: 0,
    // INTERNAL USE ONLY
    __error_infos: [],
    // INTERNAL USE ONLY: the set of parseErrorInfo objects created since the last cleanup
    __error_recovery_infos: [],
    // INTERNAL USE ONLY: the set of parseErrorInfo objects created since the last cleanup
    // APIs which will be set up depending on user action code analysis:
    //yyRecovering: 0,
    //yyErrOk: 0,
    //yyClearIn: 0,
    // Helper APIs
    // -----------
    // Helper function which can be overridden by user code later on: put suitable quotes around
    // literal IDs in a description string.
    quoteName: function parser_quoteName(id_str) {
      return '"' + id_str + '"';
    },
    // Return the name of the given symbol (terminal or non-terminal) as a string, when available.
    //
    // Return NULL when the symbol is unknown to the parser.
    getSymbolName: function parser_getSymbolName(symbol) {
      if (this.terminals_[symbol]) {
        return this.terminals_[symbol];
      } // Otherwise... this might refer to a RULE token i.e. a non-terminal: see if we can dig that one up.
      //
      // An example of this may be where a rule's action code contains a call like this:
      //
      //      parser.getSymbolName(#$)
      //
      // to obtain a human-readable name of the current grammar rule.


      var s = this.symbols_;

      for (var key in s) {
        if (s[key] === symbol) {
          return key;
        }
      }

      return null;
    },
    // Return a more-or-less human-readable description of the given symbol, when available,
    // or the symbol itself, serving as its own 'description' for lack of something better to serve up.
    //
    // Return NULL when the symbol is unknown to the parser.
    describeSymbol: function parser_describeSymbol(symbol) {
      if (symbol !== this.EOF && this.terminal_descriptions_ && this.terminal_descriptions_[symbol]) {
        return this.terminal_descriptions_[symbol];
      } else if (symbol === this.EOF) {
        return 'end of input';
      }

      var id = this.getSymbolName(symbol);

      if (id) {
        return this.quoteName(id);
      }

      return null;
    },
    // Produce a (more or less) human-readable list of expected tokens at the point of failure.
    //
    // The produced list may contain token or token set descriptions instead of the tokens
    // themselves to help turning this output into something that easier to read by humans
    // unless `do_not_describe` parameter is set, in which case a list of the raw, *numeric*,
    // expected terminals and nonterminals is produced.
    //
    // The returned list (array) will not contain any duplicate entries.
    collect_expected_token_set: function parser_collect_expected_token_set(state, do_not_describe) {
      var TERROR = this.TERROR;
      var tokenset = [];
      var check = {}; // Has this (error?) state been outfitted with a custom expectations description text for human consumption?
      // If so, use that one instead of the less palatable token set.

      if (!do_not_describe && this.state_descriptions_ && this.state_descriptions_[state]) {
        return [this.state_descriptions_[state]];
      }

      for (var p in this.table[state]) {
        p = +p;

        if (p !== TERROR) {
          var d = do_not_describe ? p : this.describeSymbol(p);

          if (d && !check[d]) {
            tokenset.push(d);
            check[d] = true; // Mark this token description as already mentioned to prevent outputting duplicate entries.
          }
        }
      }

      return tokenset;
    },
    productions_: bp({
      pop: u([27, s, [28, 10], 29, 29, 30, s, [31, 15]]),
      rule: u([2, s, [3, 5], 4, 7, s, [1, 4], 2, s, [1, 15], 2])
    }),
    performAction: function parser__PerformAction(yystate
    /* action[1] */
    , yysp, yyvstack) {
      /* this == yyval */
      // the JS engine itself can go and remove these statements when `yy` turns out to be unused in any action code!
      var yy = this.yy;
      var yyparser = yy.parser;
      var yylexer = yy.lexer;

      switch (yystate) {
        case 0:
          /*! Production::    $accept : expression $end */
          // default action (generated by JISON mode classic/merge :: 1,VT,VA,-,-,-,-,-,-):
          this.$ = yyvstack[yysp - 1]; // END of default action (generated by JISON mode classic/merge :: 1,VT,VA,-,-,-,-,-,-)

          break;

        case 1:
          /*! Production::    expression : math_expression EOF */
          // default action (generated by JISON mode classic/merge :: 2,VT,VA,-,-,-,-,-,-):
          this.$ = yyvstack[yysp - 1]; // END of default action (generated by JISON mode classic/merge :: 2,VT,VA,-,-,-,-,-,-)

          return yyvstack[yysp - 1];
          break;

        case 2:
        /*! Production::    math_expression : math_expression ADD math_expression */

        case 3:
        /*! Production::    math_expression : math_expression SUB math_expression */

        case 4:
        /*! Production::    math_expression : math_expression MUL math_expression */

        case 5:
          /*! Production::    math_expression : math_expression DIV math_expression */
          this.$ = {
            type: 'MathExpression',
            operator: yyvstack[yysp - 1],
            left: yyvstack[yysp - 2],
            right: yyvstack[yysp]
          };
          break;

        case 6:
        /*! Production::    math_expression : LPAREN math_expression RPAREN */

        case 7:
        /*! Production::    math_expression : NESTED_CALC LPAREN math_expression RPAREN */

        case 8:
          /*! Production::    math_expression : SUB PREFIX SUB NESTED_CALC LPAREN math_expression RPAREN */
          this.$ = yyvstack[yysp - 1];
          break;

        case 9:
        /*! Production::    math_expression : css_variable */

        case 10:
        /*! Production::    math_expression : css_value */

        case 11:
          /*! Production::    math_expression : value */
          this.$ = yyvstack[yysp];
          break;

        case 12:
          /*! Production::    value : NUMBER */
          this.$ = {
            type: 'Value',
            value: parseFloat(yyvstack[yysp])
          };
          break;

        case 13:
          /*! Production::    value : SUB NUMBER */
          this.$ = {
            type: 'Value',
            value: parseFloat(yyvstack[yysp]) * -1
          };
          break;

        case 14:
          /*! Production::    css_variable : CSS_VAR */
          this.$ = {
            type: 'CssVariable',
            value: yyvstack[yysp]
          };
          break;

        case 15:
          /*! Production::    css_value : LENGTH */
          this.$ = {
            type: 'LengthValue',
            value: parseFloat(yyvstack[yysp]),
            unit: /[a-z]+/.exec(yyvstack[yysp])[0]
          };
          break;

        case 16:
          /*! Production::    css_value : ANGLE */
          this.$ = {
            type: 'AngleValue',
            value: parseFloat(yyvstack[yysp]),
            unit: /[a-z]+/.exec(yyvstack[yysp])[0]
          };
          break;

        case 17:
          /*! Production::    css_value : TIME */
          this.$ = {
            type: 'TimeValue',
            value: parseFloat(yyvstack[yysp]),
            unit: /[a-z]+/.exec(yyvstack[yysp])[0]
          };
          break;

        case 18:
          /*! Production::    css_value : FREQ */
          this.$ = {
            type: 'FrequencyValue',
            value: parseFloat(yyvstack[yysp]),
            unit: /[a-z]+/.exec(yyvstack[yysp])[0]
          };
          break;

        case 19:
          /*! Production::    css_value : RES */
          this.$ = {
            type: 'ResolutionValue',
            value: parseFloat(yyvstack[yysp]),
            unit: /[a-z]+/.exec(yyvstack[yysp])[0]
          };
          break;

        case 20:
          /*! Production::    css_value : EMS */
          this.$ = {
            type: 'EmValue',
            value: parseFloat(yyvstack[yysp]),
            unit: 'em'
          };
          break;

        case 21:
          /*! Production::    css_value : EXS */
          this.$ = {
            type: 'ExValue',
            value: parseFloat(yyvstack[yysp]),
            unit: 'ex'
          };
          break;

        case 22:
          /*! Production::    css_value : CHS */
          this.$ = {
            type: 'ChValue',
            value: parseFloat(yyvstack[yysp]),
            unit: 'ch'
          };
          break;

        case 23:
          /*! Production::    css_value : REMS */
          this.$ = {
            type: 'RemValue',
            value: parseFloat(yyvstack[yysp]),
            unit: 'rem'
          };
          break;

        case 24:
          /*! Production::    css_value : VHS */
          this.$ = {
            type: 'VhValue',
            value: parseFloat(yyvstack[yysp]),
            unit: 'vh'
          };
          break;

        case 25:
          /*! Production::    css_value : VWS */
          this.$ = {
            type: 'VwValue',
            value: parseFloat(yyvstack[yysp]),
            unit: 'vw'
          };
          break;

        case 26:
          /*! Production::    css_value : VMINS */
          this.$ = {
            type: 'VminValue',
            value: parseFloat(yyvstack[yysp]),
            unit: 'vmin'
          };
          break;

        case 27:
          /*! Production::    css_value : VMAXS */
          this.$ = {
            type: 'VmaxValue',
            value: parseFloat(yyvstack[yysp]),
            unit: 'vmax'
          };
          break;

        case 28:
          /*! Production::    css_value : PERCENTAGE */
          this.$ = {
            type: 'PercentageValue',
            value: parseFloat(yyvstack[yysp]),
            unit: '%'
          };
          break;

        case 29:
          /*! Production::    css_value : SUB css_value */
          var prev = yyvstack[yysp];
          prev.value *= -1;
          this.$ = prev;
          break;
      }
    },
    table: bt({
      len: u([24, 1, 5, 23, 1, 18, s, [0, 20], s, [23, 4], c, [28, 3], 0, 0, 16, 6, 6, s, [0, 3], 5, 1, 0, 1, 23, 5, 0]),
      symbol: u([4, 7, 9, s, [11, 21, 1], 1, 1, s, [3, 4, 1], c, [30, 19], c, [29, 4], 7, 4, 10, 11, c, [22, 14], 31, c, [42, 23], c, [23, 69], c, [138, 4], 8, c, [51, 24], 4, c, [137, 15], c, [184, 5], 8, c, [6, 6], c, [5, 5], 9, 7, c, [87, 28]]),
      type: u([s, [2, 19], s, [0, 5], 1, s, [2, 24], s, [0, 4], c, [22, 19], c, [42, 41], c, [23, 70], c, [28, 25], c, [45, 25], c, [59, 23]]),
      state: u([1, 2, 8, 6, 7, 30, c, [4, 3], 33, 36, c, [5, 3], 37, c, [4, 3], 38, c, [4, 3], 39, c, [4, 3], 41, c, [21, 4], 46, c, [5, 3]]),
      mode: u([s, [1, 177], s, [2, 3], c, [5, 5], c, [6, 4], s, [1, 31]]),
      goto: u([5, 3, 4, 24, s, [9, 15, 1], s, [25, 5, 1], c, [24, 19], 31, 35, 32, 34, c, [18, 14], c, [37, 19], c, [19, 57], c, [117, 4], 40, c, [24, 19], 42, 35, c, [16, 14], s, [2, 3], 28, 29, 2, s, [3, 3], 28, 29, 3, c, [52, 4], 43, 44, 45, c, [78, 23], 47])
    }),
    defaultActions: bda({
      idx: u([s, [6, 20, 1], 33, 34, 38, 39, 40, 43, 47]),
      goto: u([9, 10, 11, s, [14, 15, 1], 12, 1, 29, 13, s, [4, 5, 1]])
    }),
    parseError: function parseError(str, hash, ExceptionClass) {
      if (hash.recoverable) {
        if (typeof this.trace === 'function') {
          this.trace(str);
        }

        hash.destroy(); // destroy... well, *almost*!
      } else {
        if (typeof this.trace === 'function') {
          this.trace(str);
        }

        if (!ExceptionClass) {
          ExceptionClass = this.JisonParserError;
        }

        throw new ExceptionClass(str, hash);
      }
    },
    parse: function parse(input) {
      var self = this;
      var stack = new Array(128); // token stack: stores token which leads to state at the same index (column storage)

      var sstack = new Array(128); // state stack: stores states (column storage)

      var vstack = new Array(128); // semantic value stack

      var table = this.table;
      var sp = 0; // 'stack pointer': index into the stacks

      var symbol = 0;
      var TERROR = this.TERROR;
      var EOF = this.EOF;
      var ERROR_RECOVERY_TOKEN_DISCARD_COUNT = this.options.errorRecoveryTokenDiscardCount | 0 || 3;
      var NO_ACTION = [0, 48
      /* === table.length :: ensures that anyone using this new state will fail dramatically! */
      ];
      var lexer;

      if (this.__lexer__) {
        lexer = this.__lexer__;
      } else {
        lexer = this.__lexer__ = Object.create(this.lexer);
      }

      var sharedState_yy = {
        parseError: undefined,
        quoteName: undefined,
        lexer: undefined,
        parser: undefined,
        pre_parse: undefined,
        post_parse: undefined,
        pre_lex: undefined,
        post_lex: undefined // WARNING: must be written this way for the code expanders to work correctly in both ES5 and ES6 modes!

      };
      var ASSERT;

      if (typeof assert !== 'function') {
        ASSERT = function JisonAssert(cond, msg) {
          if (!cond) {
            throw new Error('assertion failed: ' + (msg || '***'));
          }
        };
      } else {
        ASSERT = assert;
      }

      this.yyGetSharedState = function yyGetSharedState() {
        return sharedState_yy;
      };

      function shallow_copy_noclobber(dst, src) {
        for (var k in src) {
          if (typeof dst[k] === 'undefined' && Object.prototype.hasOwnProperty.call(src, k)) {
            dst[k] = src[k];
          }
        }
      } // copy state


      shallow_copy_noclobber(sharedState_yy, this.yy);
      sharedState_yy.lexer = lexer;
      sharedState_yy.parser = this; // Does the shared state override the default `parseError` that already comes with this instance?

      if (typeof sharedState_yy.parseError === 'function') {
        this.parseError = function parseErrorAlt(str, hash, ExceptionClass) {
          if (!ExceptionClass) {
            ExceptionClass = this.JisonParserError;
          }

          return sharedState_yy.parseError.call(this, str, hash, ExceptionClass);
        };
      } else {
        this.parseError = this.originalParseError;
      } // Does the shared state override the default `quoteName` that already comes with this instance?


      if (typeof sharedState_yy.quoteName === 'function') {
        this.quoteName = function quoteNameAlt(id_str) {
          return sharedState_yy.quoteName.call(this, id_str);
        };
      } else {
        this.quoteName = this.originalQuoteName;
      } // set up the cleanup function; make it an API so that external code can re-use this one in case of
      // calamities or when the `%options no-try-catch` option has been specified for the grammar, in which
      // case this parse() API method doesn't come with a `finally { ... }` block any more!
      //
      // NOTE: as this API uses parse() as a closure, it MUST be set again on every parse() invocation,
      //       or else your `sharedState`, etc. references will be *wrong*!


      this.cleanupAfterParse = function parser_cleanupAfterParse(resultValue, invoke_post_methods, do_not_nuke_errorinfos) {
        var rv;

        if (invoke_post_methods) {
          var hash;

          if (sharedState_yy.post_parse || this.post_parse) {
            // create an error hash info instance: we re-use this API in a **non-error situation**
            // as this one delivers all parser internals ready for access by userland code.
            hash = this.constructParseErrorInfo(null
            /* no error! */
            , null
            /* no exception! */
            , null, false);
          }

          if (sharedState_yy.post_parse) {
            rv = sharedState_yy.post_parse.call(this, sharedState_yy, resultValue, hash);
            if (typeof rv !== 'undefined') resultValue = rv;
          }

          if (this.post_parse) {
            rv = this.post_parse.call(this, sharedState_yy, resultValue, hash);
            if (typeof rv !== 'undefined') resultValue = rv;
          } // cleanup:


          if (hash && hash.destroy) {
            hash.destroy();
          }
        }

        if (this.__reentrant_call_depth > 1) return resultValue; // do not (yet) kill the sharedState when this is a reentrant run.
        // clean up the lingering lexer structures as well:

        if (lexer.cleanupAfterLex) {
          lexer.cleanupAfterLex(do_not_nuke_errorinfos);
        } // prevent lingering circular references from causing memory leaks:


        if (sharedState_yy) {
          sharedState_yy.lexer = undefined;
          sharedState_yy.parser = undefined;

          if (lexer.yy === sharedState_yy) {
            lexer.yy = undefined;
          }
        }

        sharedState_yy = undefined;
        this.parseError = this.originalParseError;
        this.quoteName = this.originalQuoteName; // nuke the vstack[] array at least as that one will still reference obsoleted user values.
        // To be safe, we nuke the other internal stack columns as well...

        stack.length = 0; // fastest way to nuke an array without overly bothering the GC

        sstack.length = 0;
        vstack.length = 0;
        sp = 0; // nuke the error hash info instances created during this run.
        // Userland code must COPY any data/references
        // in the error hash instance(s) it is more permanently interested in.

        if (!do_not_nuke_errorinfos) {
          for (var i = this.__error_infos.length - 1; i >= 0; i--) {
            var el = this.__error_infos[i];

            if (el && typeof el.destroy === 'function') {
              el.destroy();
            }
          }

          this.__error_infos.length = 0;
        }

        return resultValue;
      }; // NOTE: as this API uses parse() as a closure, it MUST be set again on every parse() invocation,
      //       or else your `lexer`, `sharedState`, etc. references will be *wrong*!


      this.constructParseErrorInfo = function parser_constructParseErrorInfo(msg, ex, expected, recoverable) {
        var pei = {
          errStr: msg,
          exception: ex,
          text: lexer.match,
          value: lexer.yytext,
          token: this.describeSymbol(symbol) || symbol,
          token_id: symbol,
          line: lexer.yylineno,
          expected: expected,
          recoverable: recoverable,
          state: state,
          action: action,
          new_state: newState,
          symbol_stack: stack,
          state_stack: sstack,
          value_stack: vstack,
          stack_pointer: sp,
          yy: sharedState_yy,
          lexer: lexer,
          parser: this,
          // and make sure the error info doesn't stay due to potential
          // ref cycle via userland code manipulations.
          // These would otherwise all be memory leak opportunities!
          //
          // Note that only array and object references are nuked as those
          // constitute the set of elements which can produce a cyclic ref.
          // The rest of the members is kept intact as they are harmless.
          destroy: function destructParseErrorInfo() {
            // remove cyclic references added to error info:
            // info.yy = null;
            // info.lexer = null;
            // info.value = null;
            // info.value_stack = null;
            // ...
            var rec = !!this.recoverable;

            for (var key in this) {
              if (this.hasOwnProperty(key) && typeof key === 'object') {
                this[key] = undefined;
              }
            }

            this.recoverable = rec;
          }
        }; // track this instance so we can `destroy()` it once we deem it superfluous and ready for garbage collection!

        this.__error_infos.push(pei);

        return pei;
      };

      function getNonTerminalFromCode(symbol) {
        var tokenName = self.getSymbolName(symbol);

        if (!tokenName) {
          tokenName = symbol;
        }

        return tokenName;
      }

      function stdLex() {
        var token = lexer.lex(); // if token isn't its numeric value, convert

        if (typeof token !== 'number') {
          token = self.symbols_[token] || token;
        }

        return token || EOF;
      }

      function fastLex() {
        var token = lexer.fastLex(); // if token isn't its numeric value, convert

        if (typeof token !== 'number') {
          token = self.symbols_[token] || token;
        }

        return token || EOF;
      }

      var lex = stdLex;
      var state, action, r, t;
      var yyval = {
        $: true,
        _$: undefined,
        yy: sharedState_yy
      };
      var p;
      var yyrulelen;
      var this_production;
      var newState;
      var retval = false;

      try {
        this.__reentrant_call_depth++;
        lexer.setInput(input, sharedState_yy); // NOTE: we *assume* no lexer pre/post handlers are set up *after* 
        // this initial `setInput()` call: hence we can now check and decide
        // whether we'll go with the standard, slower, lex() API or the
        // `fast_lex()` one:

        if (typeof lexer.canIUse === 'function') {
          var lexerInfo = lexer.canIUse();

          if (lexerInfo.fastLex && typeof fastLex === 'function') {
            lex = fastLex;
          }
        }

        vstack[sp] = null;
        sstack[sp] = 0;
        stack[sp] = 0;
        ++sp;

        if (this.pre_parse) {
          this.pre_parse.call(this, sharedState_yy);
        }

        if (sharedState_yy.pre_parse) {
          sharedState_yy.pre_parse.call(this, sharedState_yy);
        }

        newState = sstack[sp - 1];

        for (;;) {
          // retrieve state number from top of stack
          state = newState; // sstack[sp - 1];
          // use default actions if available

          if (this.defaultActions[state]) {
            action = 2;
            newState = this.defaultActions[state];
          } else {
            // The single `==` condition below covers both these `===` comparisons in a single
            // operation:
            //
            //     if (symbol === null || typeof symbol === 'undefined') ...
            if (!symbol) {
              symbol = lex();
            } // read action for current state and first input


            t = table[state] && table[state][symbol] || NO_ACTION;
            newState = t[1];
            action = t[0]; // handle parse error

            if (!action) {
              var errStr;
              var errSymbolDescr = this.describeSymbol(symbol) || symbol;
              var expected = this.collect_expected_token_set(state); // Report error

              if (typeof lexer.yylineno === 'number') {
                errStr = 'Parse error on line ' + (lexer.yylineno + 1) + ': ';
              } else {
                errStr = 'Parse error: ';
              }

              if (typeof lexer.showPosition === 'function') {
                errStr += '\n' + lexer.showPosition(79 - 10, 10) + '\n';
              }

              if (expected.length) {
                errStr += 'Expecting ' + expected.join(', ') + ', got unexpected ' + errSymbolDescr;
              } else {
                errStr += 'Unexpected ' + errSymbolDescr;
              } // we cannot recover from the error!


              p = this.constructParseErrorInfo(errStr, null, expected, false);
              r = this.parseError(p.errStr, p, this.JisonParserError);

              if (typeof r !== 'undefined') {
                retval = r;
              }

              break;
            }
          }

          switch (action) {
            // catch misc. parse failures:
            default:
              // this shouldn't happen, unless resolve defaults are off
              if (action instanceof Array) {
                p = this.constructParseErrorInfo('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol, null, null, false);
                r = this.parseError(p.errStr, p, this.JisonParserError);

                if (typeof r !== 'undefined') {
                  retval = r;
                }

                break;
              } // Another case of better safe than sorry: in case state transitions come out of another error recovery process
              // or a buggy LUT (LookUp Table):


              p = this.constructParseErrorInfo('Parsing halted. No viable error recovery approach available due to internal system failure.', null, null, false);
              r = this.parseError(p.errStr, p, this.JisonParserError);

              if (typeof r !== 'undefined') {
                retval = r;
              }

              break;
            // shift:

            case 1:
              stack[sp] = symbol;
              vstack[sp] = lexer.yytext;
              sstack[sp] = newState; // push state

              ++sp;
              symbol = 0; // Pick up the lexer details for the current symbol as that one is not 'look-ahead' any more:

              continue;
            // reduce:

            case 2:
              this_production = this.productions_[newState - 1]; // `this.productions_[]` is zero-based indexed while states start from 1 upwards...

              yyrulelen = this_production[1];
              r = this.performAction.call(yyval, newState, sp - 1, vstack);

              if (typeof r !== 'undefined') {
                retval = r;
                break;
              } // pop off stack


              sp -= yyrulelen; // don't overwrite the `symbol` variable: use a local var to speed things up:

              var ntsymbol = this_production[0]; // push nonterminal (reduce)

              stack[sp] = ntsymbol;
              vstack[sp] = yyval.$; // goto new state = table[STATE][NONTERMINAL]

              newState = table[sstack[sp - 1]][ntsymbol];
              sstack[sp] = newState;
              ++sp;
              continue;
            // accept:

            case 3:
              if (sp !== -2) {
                retval = true; // Return the `$accept` rule's `$$` result, if available.
                //
                // Also note that JISON always adds this top-most `$accept` rule (with implicit,
                // default, action):
                //
                //     $accept: <startSymbol> $end
                //                  %{ $$ = $1; @$ = @1; %}
                //
                // which, combined with the parse kernel's `$accept` state behaviour coded below,
                // will produce the `$$` value output of the <startSymbol> rule as the parse result,
                // IFF that result is *not* `undefined`. (See also the parser kernel code.)
                //
                // In code:
                //
                //                  %{
                //                      @$ = @1;            // if location tracking support is included
                //                      if (typeof $1 !== 'undefined')
                //                          return $1;
                //                      else
                //                          return true;           // the default parse result if the rule actions don't produce anything
                //                  %}

                sp--;

                if (typeof vstack[sp] !== 'undefined') {
                  retval = vstack[sp];
                }
              }

              break;
          } // break out of loop: we accept or fail with error


          break;
        }
      } catch (ex) {
        // report exceptions through the parseError callback too, but keep the exception intact
        // if it is a known parser or lexer error which has been thrown by parseError() already:
        if (ex instanceof this.JisonParserError) {
          throw ex;
        } else if (lexer && typeof lexer.JisonLexerError === 'function' && ex instanceof lexer.JisonLexerError) {
          throw ex;
        }

        p = this.constructParseErrorInfo('Parsing aborted due to exception.', ex, null, false);
        retval = false;
        r = this.parseError(p.errStr, p, this.JisonParserError);

        if (typeof r !== 'undefined') {
          retval = r;
        }
      } finally {
        retval = this.cleanupAfterParse(retval, true, true);
        this.__reentrant_call_depth--;
      } // /finally


      return retval;
    }
  };
  parser.originalParseError = parser.parseError;
  parser.originalQuoteName = parser.quoteName;
  /* lexer generated by jison-lex 0.6.1-215 */

  /*
   * Returns a Lexer object of the following structure:
   *
   *  Lexer: {
   *    yy: {}     The so-called "shared state" or rather the *source* of it;
   *               the real "shared state" `yy` passed around to
   *               the rule actions, etc. is a direct reference!
   *
   *               This "shared context" object was passed to the lexer by way of 
   *               the `lexer.setInput(str, yy)` API before you may use it.
   *
   *               This "shared context" object is passed to the lexer action code in `performAction()`
   *               so userland code in the lexer actions may communicate with the outside world 
   *               and/or other lexer rules' actions in more or less complex ways.
   *
   *  }
   *
   *  Lexer.prototype: {
   *    EOF: 1,
   *    ERROR: 2,
   *
   *    yy:        The overall "shared context" object reference.
   *
   *    JisonLexerError: function(msg, hash),
   *
   *    performAction: function lexer__performAction(yy, yyrulenumber, YY_START),
   *
   *               The function parameters and `this` have the following value/meaning:
   *               - `this`    : reference to the `lexer` instance. 
   *                               `yy_` is an alias for `this` lexer instance reference used internally.
   *
   *               - `yy`      : a reference to the `yy` "shared state" object which was passed to the lexer
   *                             by way of the `lexer.setInput(str, yy)` API before.
   *
   *                             Note:
   *                             The extra arguments you specified in the `%parse-param` statement in your
   *                             **parser** grammar definition file are passed to the lexer via this object
   *                             reference as member variables.
   *
   *               - `yyrulenumber`   : index of the matched lexer rule (regex), used internally.
   *
   *               - `YY_START`: the current lexer "start condition" state.
   *
   *    parseError: function(str, hash, ExceptionClass),
   *
   *    constructLexErrorInfo: function(error_message, is_recoverable),
   *               Helper function.
   *               Produces a new errorInfo 'hash object' which can be passed into `parseError()`.
   *               See it's use in this lexer kernel in many places; example usage:
   *
   *                   var infoObj = lexer.constructParseErrorInfo('fail!', true);
   *                   var retVal = lexer.parseError(infoObj.errStr, infoObj, lexer.JisonLexerError);
   *
   *    options: { ... lexer %options ... },
   *
   *    lex: function(),
   *               Produce one token of lexed input, which was passed in earlier via the `lexer.setInput()` API.
   *               You MAY use the additional `args...` parameters as per `%parse-param` spec of the **lexer** grammar:
   *               these extra `args...` are added verbatim to the `yy` object reference as member variables.
   *
   *               WARNING:
   *               Lexer's additional `args...` parameters (via lexer's `%parse-param`) MAY conflict with
   *               any attributes already added to `yy` by the **parser** or the jison run-time; 
   *               when such a collision is detected an exception is thrown to prevent the generated run-time 
   *               from silently accepting this confusing and potentially hazardous situation! 
   *
   *    cleanupAfterLex: function(do_not_nuke_errorinfos),
   *               Helper function.
   *
   *               This helper API is invoked when the **parse process** has completed: it is the responsibility
   *               of the **parser** (or the calling userland code) to invoke this method once cleanup is desired. 
   *
   *               This helper may be invoked by user code to ensure the internal lexer gets properly garbage collected.
   *
   *    setInput: function(input, [yy]),
   *
   *
   *    input: function(),
   *
   *
   *    unput: function(str),
   *
   *
   *    more: function(),
   *
   *
   *    reject: function(),
   *
   *
   *    less: function(n),
   *
   *
   *    pastInput: function(n),
   *
   *
   *    upcomingInput: function(n),
   *
   *
   *    showPosition: function(),
   *
   *
   *    test_match: function(regex_match_array, rule_index),
   *
   *
   *    next: function(),
   *
   *
   *    begin: function(condition),
   *
   *
   *    pushState: function(condition),
   *
   *
   *    popState: function(),
   *
   *
   *    topState: function(),
   *
   *
   *    _currentRules: function(),
   *
   *
   *    stateStackSize: function(),
   *
   *
   *    performAction: function(yy, yy_, yyrulenumber, YY_START),
   *
   *
   *    rules: [...],
   *
   *
   *    conditions: {associative list: name ==> set},
   *  }
   *
   *
   *  token location info (`yylloc`): {
   *    first_line: n,
   *    last_line: n,
   *    first_column: n,
   *    last_column: n,
   *    range: [start_number, end_number]
   *               (where the numbers are indexes into the input string, zero-based)
   *  }
   *
   * ---
   *
   * The `parseError` function receives a 'hash' object with these members for lexer errors:
   *
   *  {
   *    text:        (matched text)
   *    token:       (the produced terminal token, if any)
   *    token_id:    (the produced terminal token numeric ID, if any)
   *    line:        (yylineno)
   *    loc:         (yylloc)
   *    recoverable: (boolean: TRUE when the parser MAY have an error recovery rule
   *                  available for this particular error)
   *    yy:          (object: the current parser internal "shared state" `yy`
   *                  as is also available in the rule actions; this can be used,
   *                  for instance, for advanced error analysis and reporting)
   *    lexer:       (reference to the current lexer instance used by the parser)
   *  }
   *
   * while `this` will reference the current lexer instance.
   *
   * When `parseError` is invoked by the lexer, the default implementation will
   * attempt to invoke `yy.parser.parseError()`; when this callback is not provided
   * it will try to invoke `yy.parseError()` instead. When that callback is also not
   * provided, a `JisonLexerError` exception will be thrown containing the error
   * message and `hash`, as constructed by the `constructLexErrorInfo()` API.
   *
   * Note that the lexer's `JisonLexerError` error class is passed via the
   * `ExceptionClass` argument, which is invoked to construct the exception
   * instance to be thrown, so technically `parseError` will throw the object
   * produced by the `new ExceptionClass(str, hash)` JavaScript expression.
   *
   * ---
   *
   * You can specify lexer options by setting / modifying the `.options` object of your Lexer instance.
   * These options are available:
   *
   * (Options are permanent.)
   *  
   *  yy: {
   *      parseError: function(str, hash, ExceptionClass)
   *                 optional: overrides the default `parseError` function.
   *  }
   *
   *  lexer.options: {
   *      pre_lex:  function()
   *                 optional: is invoked before the lexer is invoked to produce another token.
   *                 `this` refers to the Lexer object.
   *      post_lex: function(token) { return token; }
   *                 optional: is invoked when the lexer has produced a token `token`;
   *                 this function can override the returned token value by returning another.
   *                 When it does not return any (truthy) value, the lexer will return
   *                 the original `token`.
   *                 `this` refers to the Lexer object.
   *
   * WARNING: the next set of options are not meant to be changed. They echo the abilities of
   * the lexer as per when it was compiled!
   *
   *      ranges: boolean
   *                 optional: `true` ==> token location info will include a .range[] member.
   *      flex: boolean
   *                 optional: `true` ==> flex-like lexing behaviour where the rules are tested
   *                 exhaustively to find the longest match.
   *      backtrack_lexer: boolean
   *                 optional: `true` ==> lexer regexes are tested in order and for invoked;
   *                 the lexer terminates the scan when a token is returned by the action code.
   *      xregexp: boolean
   *                 optional: `true` ==> lexer rule regexes are "extended regex format" requiring the
   *                 `XRegExp` library. When this %option has not been specified at compile time, all lexer
   *                 rule regexes have been written as standard JavaScript RegExp expressions.
   *  }
   */

  var lexer = function () {
    /**
     * See also:
     * http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript/#35881508
     * but we keep the prototype.constructor and prototype.name assignment lines too for compatibility
     * with userland code which might access the derived class in a 'classic' way.
     *
     * @public
     * @constructor
     * @nocollapse
     */
    function JisonLexerError(msg, hash) {
      Object.defineProperty(this, 'name', {
        enumerable: false,
        writable: false,
        value: 'JisonLexerError'
      });
      if (msg == null) msg = '???';
      Object.defineProperty(this, 'message', {
        enumerable: false,
        writable: true,
        value: msg
      });
      this.hash = hash;
      var stacktrace;

      if (hash && hash.exception instanceof Error) {
        var ex2 = hash.exception;
        this.message = ex2.message || msg;
        stacktrace = ex2.stack;
      }

      if (!stacktrace) {
        if (Error.hasOwnProperty('captureStackTrace')) {
          // V8
          Error.captureStackTrace(this, this.constructor);
        } else {
          stacktrace = new Error(msg).stack;
        }
      }

      if (stacktrace) {
        Object.defineProperty(this, 'stack', {
          enumerable: false,
          writable: false,
          value: stacktrace
        });
      }
    }

    if (typeof Object.setPrototypeOf === 'function') {
      Object.setPrototypeOf(JisonLexerError.prototype, Error.prototype);
    } else {
      JisonLexerError.prototype = Object.create(Error.prototype);
    }

    JisonLexerError.prototype.constructor = JisonLexerError;
    JisonLexerError.prototype.name = 'JisonLexerError';
    var lexer = {
      // Code Generator Information Report
      // ---------------------------------
      //
      // Options:
      //
      //   backtracking: .................... false
      //   location.ranges: ................. false
      //   location line+column tracking: ... true
      //
      //
      // Forwarded Parser Analysis flags:
      //
      //   uses yyleng: ..................... false
      //   uses yylineno: ................... false
      //   uses yytext: ..................... false
      //   uses yylloc: ..................... false
      //   uses lexer values: ............... true / true
      //   location tracking: ............... false
      //   location assignment: ............. false
      //
      //
      // Lexer Analysis flags:
      //
      //   uses yyleng: ..................... ???
      //   uses yylineno: ................... ???
      //   uses yytext: ..................... ???
      //   uses yylloc: ..................... ???
      //   uses ParseError API: ............. ???
      //   uses yyerror: .................... ???
      //   uses location tracking & editing:  ???
      //   uses more() API: ................. ???
      //   uses unput() API: ................ ???
      //   uses reject() API: ............... ???
      //   uses less() API: ................. ???
      //   uses display APIs pastInput(), upcomingInput(), showPosition():
      //        ............................. ???
      //   uses describeYYLLOC() API: ....... ???
      //
      // --------- END OF REPORT -----------
      EOF: 1,
      ERROR: 2,
      // JisonLexerError: JisonLexerError,        /// <-- injected by the code generator
      // options: {},                             /// <-- injected by the code generator
      // yy: ...,                                 /// <-- injected by setInput()
      __currentRuleSet__: null,
      /// INTERNAL USE ONLY: internal rule set cache for the current lexer state  
      __error_infos: [],
      /// INTERNAL USE ONLY: the set of lexErrorInfo objects created since the last cleanup  
      __decompressed: false,
      /// INTERNAL USE ONLY: mark whether the lexer instance has been 'unfolded' completely and is now ready for use  
      done: false,
      /// INTERNAL USE ONLY  
      _backtrack: false,
      /// INTERNAL USE ONLY  
      _input: '',
      /// INTERNAL USE ONLY  
      _more: false,
      /// INTERNAL USE ONLY  
      _signaled_error_token: false,
      /// INTERNAL USE ONLY  
      conditionStack: [],
      /// INTERNAL USE ONLY; managed via `pushState()`, `popState()`, `topState()` and `stateStackSize()`  
      match: '',
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: tracks input which has been matched so far for the lexer token under construction. `match` is identical to `yytext` except that this one still contains the matched input string after `lexer.performAction()` has been invoked, where userland code MAY have changed/replaced the `yytext` value entirely!  
      matched: '',
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: tracks entire input which has been matched so far  
      matches: false,
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: tracks RE match result for last (successful) match attempt  
      yytext: '',
      /// ADVANCED USE ONLY: tracks input which has been matched so far for the lexer token under construction; this value is transferred to the parser as the 'token value' when the parser consumes the lexer token produced through a call to the `lex()` API.  
      offset: 0,
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: tracks the 'cursor position' in the input string, i.e. the number of characters matched so far  
      yyleng: 0,
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: length of matched input for the token under construction (`yytext`)  
      yylineno: 0,
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: 'line number' at which the token under construction is located  
      yylloc: null,
      /// READ-ONLY EXTERNAL ACCESS - ADVANCED USE ONLY: tracks location info (lines + columns) for the token under construction  

      /**
       * INTERNAL USE: construct a suitable error info hash object instance for `parseError`.
       * 
       * @public
       * @this {RegExpLexer}
       */
      constructLexErrorInfo: function lexer_constructLexErrorInfo(msg, recoverable, show_input_position) {
        msg = '' + msg; // heuristic to determine if the error message already contains a (partial) source code dump
        // as produced by either `showPosition()` or `prettyPrintRange()`:

        if (show_input_position == undefined) {
          show_input_position = !(msg.indexOf('\n') > 0 && msg.indexOf('^') > 0);
        }

        if (this.yylloc && show_input_position) {
          if (typeof this.prettyPrintRange === 'function') {
            var pretty_src = this.prettyPrintRange(this.yylloc);

            if (!/\n\s*$/.test(msg)) {
              msg += '\n';
            }

            msg += '\n  Erroneous area:\n' + this.prettyPrintRange(this.yylloc);
          } else if (typeof this.showPosition === 'function') {
            var pos_str = this.showPosition();

            if (pos_str) {
              if (msg.length && msg[msg.length - 1] !== '\n' && pos_str[0] !== '\n') {
                msg += '\n' + pos_str;
              } else {
                msg += pos_str;
              }
            }
          }
        }
        /** @constructor */


        var pei = {
          errStr: msg,
          recoverable: !!recoverable,
          text: this.match,
          // This one MAY be empty; userland code should use the `upcomingInput` API to obtain more text which follows the 'lexer cursor position'...  
          token: null,
          line: this.yylineno,
          loc: this.yylloc,
          yy: this.yy,
          lexer: this,

          /**
           * and make sure the error info doesn't stay due to potential
           * ref cycle via userland code manipulations.
           * These would otherwise all be memory leak opportunities!
           * 
           * Note that only array and object references are nuked as those
           * constitute the set of elements which can produce a cyclic ref.
           * The rest of the members is kept intact as they are harmless.
           * 
           * @public
           * @this {LexErrorInfo}
           */
          destroy: function destructLexErrorInfo() {
            // remove cyclic references added to error info:
            // info.yy = null;
            // info.lexer = null;
            // ...
            var rec = !!this.recoverable;

            for (var key in this) {
              if (this.hasOwnProperty(key) && typeof key === 'object') {
                this[key] = undefined;
              }
            }

            this.recoverable = rec;
          }
        }; // track this instance so we can `destroy()` it once we deem it superfluous and ready for garbage collection!

        this.__error_infos.push(pei);

        return pei;
      },

      /**
       * handler which is invoked when a lexer error occurs.
       * 
       * @public
       * @this {RegExpLexer}
       */
      parseError: function lexer_parseError(str, hash, ExceptionClass) {
        if (!ExceptionClass) {
          ExceptionClass = this.JisonLexerError;
        }

        if (this.yy) {
          if (this.yy.parser && typeof this.yy.parser.parseError === 'function') {
            return this.yy.parser.parseError.call(this, str, hash, ExceptionClass) || this.ERROR;
          } else if (typeof this.yy.parseError === 'function') {
            return this.yy.parseError.call(this, str, hash, ExceptionClass) || this.ERROR;
          }
        }

        throw new ExceptionClass(str, hash);
      },

      /**
       * method which implements `yyerror(str, ...args)` functionality for use inside lexer actions.
       * 
       * @public
       * @this {RegExpLexer}
       */
      yyerror: function yyError(str
      /*, ...args */
      ) {
        var lineno_msg = '';

        if (this.yylloc) {
          lineno_msg = ' on line ' + (this.yylineno + 1);
        }

        var p = this.constructLexErrorInfo('Lexical error' + lineno_msg + ': ' + str, this.options.lexerErrorsAreRecoverable); // Add any extra args to the hash under the name `extra_error_attributes`:

        var args = Array.prototype.slice.call(arguments, 1);

        if (args.length) {
          p.extra_error_attributes = args;
        }

        return this.parseError(p.errStr, p, this.JisonLexerError) || this.ERROR;
      },

      /**
       * final cleanup function for when we have completed lexing the input;
       * make it an API so that external code can use this one once userland
       * code has decided it's time to destroy any lingering lexer error
       * hash object instances and the like: this function helps to clean
       * up these constructs, which *may* carry cyclic references which would
       * otherwise prevent the instances from being properly and timely
       * garbage-collected, i.e. this function helps prevent memory leaks!
       * 
       * @public
       * @this {RegExpLexer}
       */
      cleanupAfterLex: function lexer_cleanupAfterLex(do_not_nuke_errorinfos) {
        // prevent lingering circular references from causing memory leaks:
        this.setInput('', {}); // nuke the error hash info instances created during this run.
        // Userland code must COPY any data/references
        // in the error hash instance(s) it is more permanently interested in.

        if (!do_not_nuke_errorinfos) {
          for (var i = this.__error_infos.length - 1; i >= 0; i--) {
            var el = this.__error_infos[i];

            if (el && typeof el.destroy === 'function') {
              el.destroy();
            }
          }

          this.__error_infos.length = 0;
        }

        return this;
      },

      /**
       * clear the lexer token context; intended for internal use only
       * 
       * @public
       * @this {RegExpLexer}
       */
      clear: function lexer_clear() {
        this.yytext = '';
        this.yyleng = 0;
        this.match = ''; // - DO NOT reset `this.matched`

        this.matches = false;
        this._more = false;
        this._backtrack = false;
        var col = this.yylloc ? this.yylloc.last_column : 0;
        this.yylloc = {
          first_line: this.yylineno + 1,
          first_column: col,
          last_line: this.yylineno + 1,
          last_column: col,
          range: [this.offset, this.offset]
        };
      },

      /**
       * resets the lexer, sets new input
       * 
       * @public
       * @this {RegExpLexer}
       */
      setInput: function lexer_setInput(input, yy) {
        this.yy = yy || this.yy || {}; // also check if we've fully initialized the lexer instance,
        // including expansion work to be done to go from a loaded
        // lexer to a usable lexer:

        if (!this.__decompressed) {
          // step 1: decompress the regex list:
          var rules = this.rules;

          for (var i = 0, len = rules.length; i < len; i++) {
            var rule_re = rules[i]; // compression: is the RE an xref to another RE slot in the rules[] table?

            if (typeof rule_re === 'number') {
              rules[i] = rules[rule_re];
            }
          } // step 2: unfold the conditions[] set to make these ready for use:


          var conditions = this.conditions;

          for (var k in conditions) {
            var spec = conditions[k];
            var rule_ids = spec.rules;
            var len = rule_ids.length;
            var rule_regexes = new Array(len + 1); // slot 0 is unused; we use a 1-based index approach here to keep the hottest code in `lexer_next()` fast and simple! 

            var rule_new_ids = new Array(len + 1);

            for (var i = 0; i < len; i++) {
              var idx = rule_ids[i];
              var rule_re = rules[idx];
              rule_regexes[i + 1] = rule_re;
              rule_new_ids[i + 1] = idx;
            }

            spec.rules = rule_new_ids;
            spec.__rule_regexes = rule_regexes;
            spec.__rule_count = len;
          }

          this.__decompressed = true;
        }

        this._input = input || '';
        this.clear();
        this._signaled_error_token = false;
        this.done = false;
        this.yylineno = 0;
        this.matched = '';
        this.conditionStack = ['INITIAL'];
        this.__currentRuleSet__ = null;
        this.yylloc = {
          first_line: 1,
          first_column: 0,
          last_line: 1,
          last_column: 0,
          range: [0, 0]
        };
        this.offset = 0;
        return this;
      },

      /**
       * edit the remaining input via user-specified callback.
       * This can be used to forward-adjust the input-to-parse, 
       * e.g. inserting macro expansions and alike in the
       * input which has yet to be lexed.
       * The behaviour of this API contrasts the `unput()` et al
       * APIs as those act on the *consumed* input, while this
       * one allows one to manipulate the future, without impacting
       * the current `yyloc` cursor location or any history. 
       * 
       * Use this API to help implement C-preprocessor-like
       * `#include` statements, etc.
       * 
       * The provided callback must be synchronous and is
       * expected to return the edited input (string).
       *
       * The `cpsArg` argument value is passed to the callback
       * as-is.
       *
       * `callback` interface: 
       * `function callback(input, cpsArg)`
       * 
       * - `input` will carry the remaining-input-to-lex string
       *   from the lexer.
       * - `cpsArg` is `cpsArg` passed into this API.
       * 
       * The `this` reference for the callback will be set to
       * reference this lexer instance so that userland code
       * in the callback can easily and quickly access any lexer
       * API. 
       *
       * When the callback returns a non-string-type falsey value,
       * we assume the callback did not edit the input and we
       * will using the input as-is.
       *
       * When the callback returns a non-string-type value, it
       * is converted to a string for lexing via the `"" + retval`
       * operation. (See also why: http://2ality.com/2012/03/converting-to-string.html 
       * -- that way any returned object's `toValue()` and `toString()`
       * methods will be invoked in a proper/desirable order.)
       * 
       * @public
       * @this {RegExpLexer}
       */
      editRemainingInput: function lexer_editRemainingInput(callback, cpsArg) {
        var rv = callback.call(this, this._input, cpsArg);

        if (typeof rv !== 'string') {
          if (rv) {
            this._input = '' + rv;
          } // else: keep `this._input` as is.  

        } else {
          this._input = rv;
        }

        return this;
      },

      /**
       * consumes and returns one char from the input
       * 
       * @public
       * @this {RegExpLexer}
       */
      input: function lexer_input() {
        if (!this._input) {
          //this.done = true;    -- don't set `done` as we want the lex()/next() API to be able to produce one custom EOF token match after this anyhow. (lexer can match special <<EOF>> tokens and perform user action code for a <<EOF>> match, but only does so *once*)
          return null;
        }

        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch; // Count the linenumber up when we hit the LF (or a stand-alone CR).
        // On CRLF, the linenumber is incremented when you fetch the CR or the CRLF combo
        // and we advance immediately past the LF as well, returning both together as if
        // it was all a single 'character' only.

        var slice_len = 1;
        var lines = false;

        if (ch === '\n') {
          lines = true;
        } else if (ch === '\r') {
          lines = true;
          var ch2 = this._input[1];

          if (ch2 === '\n') {
            slice_len++;
            ch += ch2;
            this.yytext += ch2;
            this.yyleng++;
            this.offset++;
            this.match += ch2;
            this.matched += ch2;
            this.yylloc.range[1]++;
          }
        }

        if (lines) {
          this.yylineno++;
          this.yylloc.last_line++;
          this.yylloc.last_column = 0;
        } else {
          this.yylloc.last_column++;
        }

        this.yylloc.range[1]++;
        this._input = this._input.slice(slice_len);
        return ch;
      },

      /**
       * unshifts one char (or an entire string) into the input
       * 
       * @public
       * @this {RegExpLexer}
       */
      unput: function lexer_unput(ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);
        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        this.yyleng = this.yytext.length;
        this.offset -= len;
        this.match = this.match.substr(0, this.match.length - len);
        this.matched = this.matched.substr(0, this.matched.length - len);

        if (lines.length > 1) {
          this.yylineno -= lines.length - 1;
          this.yylloc.last_line = this.yylineno + 1; // Get last entirely matched line into the `pre_lines[]` array's
          // last index slot; we don't mind when other previously 
          // matched lines end up in the array too. 

          var pre = this.match;
          var pre_lines = pre.split(/(?:\r\n?|\n)/g);

          if (pre_lines.length === 1) {
            pre = this.matched;
            pre_lines = pre.split(/(?:\r\n?|\n)/g);
          }

          this.yylloc.last_column = pre_lines[pre_lines.length - 1].length;
        } else {
          this.yylloc.last_column -= len;
        }

        this.yylloc.range[1] = this.yylloc.range[0] + this.yyleng;
        this.done = false;
        return this;
      },

      /**
       * cache matched text and append it on next action
       * 
       * @public
       * @this {RegExpLexer}
       */
      more: function lexer_more() {
        this._more = true;
        return this;
      },

      /**
       * signal the lexer that this rule fails to match the input, so the
       * next matching rule (regex) should be tested instead.
       * 
       * @public
       * @this {RegExpLexer}
       */
      reject: function lexer_reject() {
        if (this.options.backtrack_lexer) {
          this._backtrack = true;
        } else {
          // when the `parseError()` call returns, we MUST ensure that the error is registered.
          // We accomplish this by signaling an 'error' token to be produced for the current
          // `.lex()` run.
          var lineno_msg = '';

          if (this.yylloc) {
            lineno_msg = ' on line ' + (this.yylineno + 1);
          }

          var p = this.constructLexErrorInfo('Lexical error' + lineno_msg + ': You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).', false);
          this._signaled_error_token = this.parseError(p.errStr, p, this.JisonLexerError) || this.ERROR;
        }

        return this;
      },

      /**
       * retain first n characters of the match
       * 
       * @public
       * @this {RegExpLexer}
       */
      less: function lexer_less(n) {
        return this.unput(this.match.slice(n));
      },

      /**
       * return (part of the) already matched input, i.e. for error
       * messages.
       * 
       * Limit the returned string length to `maxSize` (default: 20).
       * 
       * Limit the returned string to the `maxLines` number of lines of
       * input (default: 1).
       * 
       * Negative limit values equal *unlimited*.
       * 
       * @public
       * @this {RegExpLexer}
       */
      pastInput: function lexer_pastInput(maxSize, maxLines) {
        var past = this.matched.substring(0, this.matched.length - this.match.length);
        if (maxSize < 0) maxSize = past.length;else if (!maxSize) maxSize = 20;
        if (maxLines < 0) maxLines = past.length; // can't ever have more input lines than this! 
        else if (!maxLines) maxLines = 1; // `substr` anticipation: treat \r\n as a single character and take a little
        // more than necessary so that we can still properly check against maxSize
        // after we've transformed and limited the newLines in here:

        past = past.substr(-maxSize * 2 - 2); // now that we have a significantly reduced string to process, transform the newlines
        // and chop them, then limit them:

        var a = past.replace(/\r\n|\r/g, '\n').split('\n');
        a = a.slice(-maxLines);
        past = a.join('\n'); // When, after limiting to maxLines, we still have too much to return,
        // do add an ellipsis prefix...

        if (past.length > maxSize) {
          past = '...' + past.substr(-maxSize);
        }

        return past;
      },

      /**
       * return (part of the) upcoming input, i.e. for error messages.
       * 
       * Limit the returned string length to `maxSize` (default: 20).
       * 
       * Limit the returned string to the `maxLines` number of lines of input (default: 1).
       * 
       * Negative limit values equal *unlimited*.
       *
       * > ### NOTE ###
       * >
       * > *"upcoming input"* is defined as the whole of the both
       * > the *currently lexed* input, together with any remaining input
       * > following that. *"currently lexed"* input is the input 
       * > already recognized by the lexer but not yet returned with
       * > the lexer token. This happens when you are invoking this API
       * > from inside any lexer rule action code block. 
       * >
       * 
       * @public
       * @this {RegExpLexer}
       */
      upcomingInput: function lexer_upcomingInput(maxSize, maxLines) {
        var next = this.match;
        if (maxSize < 0) maxSize = next.length + this._input.length;else if (!maxSize) maxSize = 20;
        if (maxLines < 0) maxLines = maxSize; // can't ever have more input lines than this! 
        else if (!maxLines) maxLines = 1; // `substring` anticipation: treat \r\n as a single character and take a little
        // more than necessary so that we can still properly check against maxSize
        // after we've transformed and limited the newLines in here:

        if (next.length < maxSize * 2 + 2) {
          next += this._input.substring(0, maxSize * 2 + 2); // substring is faster on Chrome/V8 
        } // now that we have a significantly reduced string to process, transform the newlines
        // and chop them, then limit them:


        var a = next.replace(/\r\n|\r/g, '\n').split('\n');
        a = a.slice(0, maxLines);
        next = a.join('\n'); // When, after limiting to maxLines, we still have too much to return,
        // do add an ellipsis postfix...

        if (next.length > maxSize) {
          next = next.substring(0, maxSize) + '...';
        }

        return next;
      },

      /**
       * return a string which displays the character position where the
       * lexing error occurred, i.e. for error messages
       * 
       * @public
       * @this {RegExpLexer}
       */
      showPosition: function lexer_showPosition(maxPrefix, maxPostfix) {
        var pre = this.pastInput(maxPrefix).replace(/\s/g, ' ');
        var c = new Array(pre.length + 1).join('-');
        return pre + this.upcomingInput(maxPostfix).replace(/\s/g, ' ') + '\n' + c + '^';
      },

      /**
       * return an YYLLOC info object derived off the given context (actual, preceding, following, current).
       * Use this method when the given `actual` location is not guaranteed to exist (i.e. when
       * it MAY be NULL) and you MUST have a valid location info object anyway:
       * then we take the given context of the `preceding` and `following` locations, IFF those are available,
       * and reconstruct the `actual` location info from those.
       * If this fails, the heuristic is to take the `current` location, IFF available.
       * If this fails as well, we assume the sought location is at/around the current lexer position
       * and then produce that one as a response. DO NOTE that these heuristic/derived location info
       * values MAY be inaccurate!
       *
       * NOTE: `deriveLocationInfo()` ALWAYS produces a location info object *copy* of `actual`, not just
       * a *reference* hence all input location objects can be assumed to be 'constant' (function has no side-effects).
       * 
       * @public
       * @this {RegExpLexer}
       */
      deriveLocationInfo: function lexer_deriveYYLLOC(actual, preceding, following, current) {
        var loc = {
          first_line: 1,
          first_column: 0,
          last_line: 1,
          last_column: 0,
          range: [0, 0]
        };

        if (actual) {
          loc.first_line = actual.first_line | 0;
          loc.last_line = actual.last_line | 0;
          loc.first_column = actual.first_column | 0;
          loc.last_column = actual.last_column | 0;

          if (actual.range) {
            loc.range[0] = actual.range[0] | 0;
            loc.range[1] = actual.range[1] | 0;
          }
        }

        if (loc.first_line <= 0 || loc.last_line < loc.first_line) {
          // plan B: heuristic using preceding and following:
          if (loc.first_line <= 0 && preceding) {
            loc.first_line = preceding.last_line | 0;
            loc.first_column = preceding.last_column | 0;

            if (preceding.range) {
              loc.range[0] = actual.range[1] | 0;
            }
          }

          if ((loc.last_line <= 0 || loc.last_line < loc.first_line) && following) {
            loc.last_line = following.first_line | 0;
            loc.last_column = following.first_column | 0;

            if (following.range) {
              loc.range[1] = actual.range[0] | 0;
            }
          } // plan C?: see if the 'current' location is useful/sane too:


          if (loc.first_line <= 0 && current && (loc.last_line <= 0 || current.last_line <= loc.last_line)) {
            loc.first_line = current.first_line | 0;
            loc.first_column = current.first_column | 0;

            if (current.range) {
              loc.range[0] = current.range[0] | 0;
            }
          }

          if (loc.last_line <= 0 && current && (loc.first_line <= 0 || current.first_line >= loc.first_line)) {
            loc.last_line = current.last_line | 0;
            loc.last_column = current.last_column | 0;

            if (current.range) {
              loc.range[1] = current.range[1] | 0;
            }
          }
        } // sanitize: fix last_line BEFORE we fix first_line as we use the 'raw' value of the latter
        // or plan D heuristics to produce a 'sensible' last_line value:


        if (loc.last_line <= 0) {
          if (loc.first_line <= 0) {
            loc.first_line = this.yylloc.first_line;
            loc.last_line = this.yylloc.last_line;
            loc.first_column = this.yylloc.first_column;
            loc.last_column = this.yylloc.last_column;
            loc.range[0] = this.yylloc.range[0];
            loc.range[1] = this.yylloc.range[1];
          } else {
            loc.last_line = this.yylloc.last_line;
            loc.last_column = this.yylloc.last_column;
            loc.range[1] = this.yylloc.range[1];
          }
        }

        if (loc.first_line <= 0) {
          loc.first_line = loc.last_line;
          loc.first_column = 0; // loc.last_column; 

          loc.range[1] = loc.range[0];
        }

        if (loc.first_column < 0) {
          loc.first_column = 0;
        }

        if (loc.last_column < 0) {
          loc.last_column = loc.first_column > 0 ? loc.first_column : 80;
        }

        return loc;
      },

      /**
       * return a string which displays the lines & columns of input which are referenced 
       * by the given location info range, plus a few lines of context.
       * 
       * This function pretty-prints the indicated section of the input, with line numbers 
       * and everything!
       * 
       * This function is very useful to provide highly readable error reports, while
       * the location range may be specified in various flexible ways:
       * 
       * - `loc` is the location info object which references the area which should be
       *   displayed and 'marked up': these lines & columns of text are marked up by `^`
       *   characters below each character in the entire input range.
       * 
       * - `context_loc` is the *optional* location info object which instructs this
       *   pretty-printer how much *leading* context should be displayed alongside
       *   the area referenced by `loc`. This can help provide context for the displayed
       *   error, etc.
       * 
       *   When this location info is not provided, a default context of 3 lines is
       *   used.
       * 
       * - `context_loc2` is another *optional* location info object, which serves
       *   a similar purpose to `context_loc`: it specifies the amount of *trailing*
       *   context lines to display in the pretty-print output.
       * 
       *   When this location info is not provided, a default context of 1 line only is
       *   used.
       * 
       * Special Notes:
       * 
       * - when the `loc`-indicated range is very large (about 5 lines or more), then
       *   only the first and last few lines of this block are printed while a
       *   `...continued...` message will be printed between them.
       * 
       *   This serves the purpose of not printing a huge amount of text when the `loc`
       *   range happens to be huge: this way a manageable & readable output results
       *   for arbitrary large ranges.
       * 
       * - this function can display lines of input which whave not yet been lexed.
       *   `prettyPrintRange()` can access the entire input!
       * 
       * @public
       * @this {RegExpLexer}
       */
      prettyPrintRange: function lexer_prettyPrintRange(loc, context_loc, context_loc2) {
        loc = this.deriveLocationInfo(loc, context_loc, context_loc2);
        const CONTEXT = 3;
        const CONTEXT_TAIL = 1;
        const MINIMUM_VISIBLE_NONEMPTY_LINE_COUNT = 2;
        var input = this.matched + this._input;
        var lines = input.split('\n');
        var l0 = Math.max(1, context_loc ? context_loc.first_line : loc.first_line - CONTEXT);
        var l1 = Math.max(1, context_loc2 ? context_loc2.last_line : loc.last_line + CONTEXT_TAIL);
        var lineno_display_width = 1 + Math.log10(l1 | 1) | 0;
        var ws_prefix = new Array(lineno_display_width).join(' ');
        var nonempty_line_indexes = [];
        var rv = lines.slice(l0 - 1, l1 + 1).map(function injectLineNumber(line, index) {
          var lno = index + l0;
          var lno_pfx = (ws_prefix + lno).substr(-lineno_display_width);
          var rv = lno_pfx + ': ' + line;
          var errpfx = new Array(lineno_display_width + 1).join('^');
          var offset = 2 + 1;
          var len = 0;

          if (lno === loc.first_line) {
            offset += loc.first_column;
            len = Math.max(2, (lno === loc.last_line ? loc.last_column : line.length) - loc.first_column + 1);
          } else if (lno === loc.last_line) {
            len = Math.max(2, loc.last_column + 1);
          } else if (lno > loc.first_line && lno < loc.last_line) {
            len = Math.max(2, line.length + 1);
          }

          if (len) {
            var lead = new Array(offset).join('.');
            var mark = new Array(len).join('^');
            rv += '\n' + errpfx + lead + mark;

            if (line.trim().length > 0) {
              nonempty_line_indexes.push(index);
            }
          }

          rv = rv.replace(/\t/g, ' ');
          return rv;
        }); // now make sure we don't print an overly large amount of error area: limit it 
        // to the top and bottom line count:

        if (nonempty_line_indexes.length > 2 * MINIMUM_VISIBLE_NONEMPTY_LINE_COUNT) {
          var clip_start = nonempty_line_indexes[MINIMUM_VISIBLE_NONEMPTY_LINE_COUNT - 1] + 1;
          var clip_end = nonempty_line_indexes[nonempty_line_indexes.length - MINIMUM_VISIBLE_NONEMPTY_LINE_COUNT] - 1;
          var intermediate_line = new Array(lineno_display_width + 1).join(' ') + '  (...continued...)';
          intermediate_line += '\n' + new Array(lineno_display_width + 1).join('-') + '  (---------------)';
          rv.splice(clip_start, clip_end - clip_start + 1, intermediate_line);
        }

        return rv.join('\n');
      },

      /**
       * helper function, used to produce a human readable description as a string, given
       * the input `yylloc` location object.
       * 
       * Set `display_range_too` to TRUE to include the string character index position(s)
       * in the description if the `yylloc.range` is available.
       * 
       * @public
       * @this {RegExpLexer}
       */
      describeYYLLOC: function lexer_describe_yylloc(yylloc, display_range_too) {
        var l1 = yylloc.first_line;
        var l2 = yylloc.last_line;
        var c1 = yylloc.first_column;
        var c2 = yylloc.last_column;
        var dl = l2 - l1;
        var dc = c2 - c1;
        var rv;

        if (dl === 0) {
          rv = 'line ' + l1 + ', ';

          if (dc <= 1) {
            rv += 'column ' + c1;
          } else {
            rv += 'columns ' + c1 + ' .. ' + c2;
          }
        } else {
          rv = 'lines ' + l1 + '(column ' + c1 + ') .. ' + l2 + '(column ' + c2 + ')';
        }

        if (yylloc.range && display_range_too) {
          var r1 = yylloc.range[0];
          var r2 = yylloc.range[1] - 1;

          if (r2 <= r1) {
            rv += ' {String Offset: ' + r1 + '}';
          } else {
            rv += ' {String Offset range: ' + r1 + ' .. ' + r2 + '}';
          }
        }

        return rv;
      },

      /**
       * test the lexed token: return FALSE when not a match, otherwise return token.
       * 
       * `match` is supposed to be an array coming out of a regex match, i.e. `match[0]`
       * contains the actually matched text string.
       * 
       * Also move the input cursor forward and update the match collectors:
       * 
       * - `yytext`
       * - `yyleng`
       * - `match`
       * - `matches`
       * - `yylloc`
       * - `offset`
       * 
       * @public
       * @this {RegExpLexer}
       */
      test_match: function lexer_test_match(match, indexed_rule) {
        var token, lines, backup, match_str, match_str_len;

        if (this.options.backtrack_lexer) {
          // save context
          backup = {
            yylineno: this.yylineno,
            yylloc: {
              first_line: this.yylloc.first_line,
              last_line: this.yylloc.last_line,
              first_column: this.yylloc.first_column,
              last_column: this.yylloc.last_column,
              range: this.yylloc.range.slice(0)
            },
            yytext: this.yytext,
            match: this.match,
            matches: this.matches,
            matched: this.matched,
            yyleng: this.yyleng,
            offset: this.offset,
            _more: this._more,
            _input: this._input,
            //_signaled_error_token: this._signaled_error_token,
            yy: this.yy,
            conditionStack: this.conditionStack.slice(0),
            done: this.done
          };
        }

        match_str = match[0];
        match_str_len = match_str.length; // if (match_str.indexOf('\n') !== -1 || match_str.indexOf('\r') !== -1) {

        lines = match_str.split(/(?:\r\n?|\n)/g);

        if (lines.length > 1) {
          this.yylineno += lines.length - 1;
          this.yylloc.last_line = this.yylineno + 1;
          this.yylloc.last_column = lines[lines.length - 1].length;
        } else {
          this.yylloc.last_column += match_str_len;
        } // }


        this.yytext += match_str;
        this.match += match_str;
        this.matched += match_str;
        this.matches = match;
        this.yyleng = this.yytext.length;
        this.yylloc.range[1] += match_str_len; // previous lex rules MAY have invoked the `more()` API rather than producing a token:
        // those rules will already have moved this `offset` forward matching their match lengths,
        // hence we must only add our own match length now:

        this.offset += match_str_len;
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match_str_len); // calling this method:
        //
        //   function lexer__performAction(yy, yyrulenumber, YY_START) {...}

        token = this.performAction.call(this, this.yy, indexed_rule, this.conditionStack[this.conditionStack.length - 1]
        /* = YY_START */
        ); // otherwise, when the action codes are all simple return token statements:
        //token = this.simpleCaseActionClusters[indexed_rule];

        if (this.done && this._input) {
          this.done = false;
        }

        if (token) {
          return token;
        } else if (this._backtrack) {
          // recover context
          for (var k in backup) {
            this[k] = backup[k];
          }

          this.__currentRuleSet__ = null;
          return false; // rule action called reject() implying the next rule should be tested instead. 
        } else if (this._signaled_error_token) {
          // produce one 'error' token as `.parseError()` in `reject()`
          // did not guarantee a failure signal by throwing an exception!
          token = this._signaled_error_token;
          this._signaled_error_token = false;
          return token;
        }

        return false;
      },

      /**
       * return next match in input
       * 
       * @public
       * @this {RegExpLexer}
       */
      next: function lexer_next() {
        if (this.done) {
          this.clear();
          return this.EOF;
        }

        if (!this._input) {
          this.done = true;
        }

        var token, match, tempMatch, index;

        if (!this._more) {
          this.clear();
        }

        var spec = this.__currentRuleSet__;

        if (!spec) {
          // Update the ruleset cache as we apparently encountered a state change or just started lexing.
          // The cache is set up for fast lookup -- we assume a lexer will switch states much less often than it will
          // invoke the `lex()` token-producing API and related APIs, hence caching the set for direct access helps
          // speed up those activities a tiny bit.
          spec = this.__currentRuleSet__ = this._currentRules(); // Check whether a *sane* condition has been pushed before: this makes the lexer robust against
          // user-programmer bugs such as https://github.com/zaach/jison-lex/issues/19

          if (!spec || !spec.rules) {
            var lineno_msg = '';

            if (this.options.trackPosition) {
              lineno_msg = ' on line ' + (this.yylineno + 1);
            }

            var p = this.constructLexErrorInfo('Internal lexer engine error' + lineno_msg + ': The lex grammar programmer pushed a non-existing condition name "' + this.topState() + '"; this is a fatal error and should be reported to the application programmer team!', false); // produce one 'error' token until this situation has been resolved, most probably by parse termination!

            return this.parseError(p.errStr, p, this.JisonLexerError) || this.ERROR;
          }
        }

        var rule_ids = spec.rules;
        var regexes = spec.__rule_regexes;
        var len = spec.__rule_count; // Note: the arrays are 1-based, while `len` itself is a valid index,
        // hence the non-standard less-or-equal check in the next loop condition!

        for (var i = 1; i <= len; i++) {
          tempMatch = this._input.match(regexes[i]);

          if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
            match = tempMatch;
            index = i;

            if (this.options.backtrack_lexer) {
              token = this.test_match(tempMatch, rule_ids[i]);

              if (token !== false) {
                return token;
              } else if (this._backtrack) {
                match = undefined;
                continue; // rule action called reject() implying a rule MISmatch. 
              } else {
                // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }

        if (match) {
          token = this.test_match(match, rule_ids[index]);

          if (token !== false) {
            return token;
          } // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)


          return false;
        }

        if (!this._input) {
          this.done = true;
          this.clear();
          return this.EOF;
        } else {
          var lineno_msg = '';

          if (this.options.trackPosition) {
            lineno_msg = ' on line ' + (this.yylineno + 1);
          }

          var p = this.constructLexErrorInfo('Lexical error' + lineno_msg + ': Unrecognized text.', this.options.lexerErrorsAreRecoverable);
          var pendingInput = this._input;
          var activeCondition = this.topState();
          var conditionStackDepth = this.conditionStack.length;
          token = this.parseError(p.errStr, p, this.JisonLexerError) || this.ERROR;

          if (token === this.ERROR) {
            // we can try to recover from a lexer error that `parseError()` did not 'recover' for us
            // by moving forward at least one character at a time IFF the (user-specified?) `parseError()`
            // has not consumed/modified any pending input or changed state in the error handler:
            if (!this.matches && // and make sure the input has been modified/consumed ...
            pendingInput === this._input && // ...or the lexer state has been modified significantly enough
            // to merit a non-consuming error handling action right now.
            activeCondition === this.topState() && conditionStackDepth === this.conditionStack.length) {
              this.input();
            }
          }

          return token;
        }
      },

      /**
       * return next match that has a token
       * 
       * @public
       * @this {RegExpLexer}
       */
      lex: function lexer_lex() {
        var r; // allow the PRE/POST handlers set/modify the return token for maximum flexibility of the generated lexer:

        if (typeof this.pre_lex === 'function') {
          r = this.pre_lex.call(this, 0);
        }

        if (typeof this.options.pre_lex === 'function') {
          // (also account for a userdef function which does not return any value: keep the token as is)
          r = this.options.pre_lex.call(this, r) || r;
        }

        if (this.yy && typeof this.yy.pre_lex === 'function') {
          // (also account for a userdef function which does not return any value: keep the token as is)
          r = this.yy.pre_lex.call(this, r) || r;
        }

        while (!r) {
          r = this.next();
        }

        if (this.yy && typeof this.yy.post_lex === 'function') {
          // (also account for a userdef function which does not return any value: keep the token as is)
          r = this.yy.post_lex.call(this, r) || r;
        }

        if (typeof this.options.post_lex === 'function') {
          // (also account for a userdef function which does not return any value: keep the token as is)
          r = this.options.post_lex.call(this, r) || r;
        }

        if (typeof this.post_lex === 'function') {
          // (also account for a userdef function which does not return any value: keep the token as is)
          r = this.post_lex.call(this, r) || r;
        }

        return r;
      },

      /**
       * return next match that has a token. Identical to the `lex()` API but does not invoke any of the 
       * `pre_lex()` nor any of the `post_lex()` callbacks.
       * 
       * @public
       * @this {RegExpLexer}
       */
      fastLex: function lexer_fastLex() {
        var r;

        while (!r) {
          r = this.next();
        }

        return r;
      },

      /**
       * return info about the lexer state that can help a parser or other lexer API user to use the
       * most efficient means available. This API is provided to aid run-time performance for larger
       * systems which employ this lexer.
       * 
       * @public
       * @this {RegExpLexer}
       */
      canIUse: function lexer_canIUse() {
        var rv = {
          fastLex: !(typeof this.pre_lex === 'function' || typeof this.options.pre_lex === 'function' || this.yy && typeof this.yy.pre_lex === 'function' || this.yy && typeof this.yy.post_lex === 'function' || typeof this.options.post_lex === 'function' || typeof this.post_lex === 'function') && typeof this.fastLex === 'function'
        };
        return rv;
      },

      /**
       * backwards compatible alias for `pushState()`;
       * the latter is symmetrical with `popState()` and we advise to use
       * those APIs in any modern lexer code, rather than `begin()`.
       * 
       * @public
       * @this {RegExpLexer}
       */
      begin: function lexer_begin(condition) {
        return this.pushState(condition);
      },

      /**
       * activates a new lexer condition state (pushes the new lexer
       * condition state onto the condition stack)
       * 
       * @public
       * @this {RegExpLexer}
       */
      pushState: function lexer_pushState(condition) {
        this.conditionStack.push(condition);
        this.__currentRuleSet__ = null;
        return this;
      },

      /**
       * pop the previously active lexer condition state off the condition
       * stack
       * 
       * @public
       * @this {RegExpLexer}
       */
      popState: function lexer_popState() {
        var n = this.conditionStack.length - 1;

        if (n > 0) {
          this.__currentRuleSet__ = null;
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      },

      /**
       * return the currently active lexer condition state; when an index
       * argument is provided it produces the N-th previous condition state,
       * if available
       * 
       * @public
       * @this {RegExpLexer}
       */
      topState: function lexer_topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);

        if (n >= 0) {
          return this.conditionStack[n];
        } else {
          return 'INITIAL';
        }
      },

      /**
       * (internal) determine the lexer rule set which is active for the
       * currently active lexer condition state
       * 
       * @public
       * @this {RegExpLexer}
       */
      _currentRules: function lexer__currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]];
        } else {
          return this.conditions['INITIAL'];
        }
      },

      /**
       * return the number of states currently on the stack
       * 
       * @public
       * @this {RegExpLexer}
       */
      stateStackSize: function lexer_stateStackSize() {
        return this.conditionStack.length;
      },
      options: {
        trackPosition: true
      },
      JisonLexerError: JisonLexerError,
      performAction: function lexer__performAction(yy, yyrulenumber, YY_START) {
        var yy_ = this;
        var YYSTATE = YY_START;

        switch (yyrulenumber) {
          case 0:
            /*! Conditions:: INITIAL */

            /*! Rule::       \s+ */

            /* skip whitespace */
            break;

          default:
            return this.simpleCaseActionClusters[yyrulenumber];
        }
      },
      simpleCaseActionClusters: {
        /*! Conditions:: INITIAL */

        /*! Rule::       \* */
        1: 5,

        /*! Conditions:: INITIAL */

        /*! Rule::       \/ */
        2: 6,

        /*! Conditions:: INITIAL */

        /*! Rule::       \+ */
        3: 3,

        /*! Conditions:: INITIAL */

        /*! Rule::       - */
        4: 4,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)px\b */
        5: 13,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)cm\b */
        6: 13,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)mm\b */
        7: 13,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)in\b */
        8: 13,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)pt\b */
        9: 13,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)pc\b */
        10: 13,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)deg\b */
        11: 14,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)grad\b */
        12: 14,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)rad\b */
        13: 14,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)turn\b */
        14: 14,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)s\b */
        15: 15,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)ms\b */
        16: 15,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)Hz\b */
        17: 16,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)kHz\b */
        18: 16,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)dpi\b */
        19: 17,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)dpcm\b */
        20: 17,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)dppx\b */
        21: 17,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)em\b */
        22: 18,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)ex\b */
        23: 19,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)ch\b */
        24: 20,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)rem\b */
        25: 21,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)vw\b */
        26: 23,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)vh\b */
        27: 22,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)vmin\b */
        28: 24,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)vmax\b */
        29: 25,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)% */
        30: 26,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([0-9]+(\.[0-9]*)?|\.[0-9]+)\b */
        31: 11,

        /*! Conditions:: INITIAL */

        /*! Rule::       (calc) */
        32: 9,

        /*! Conditions:: INITIAL */

        /*! Rule::       (var\([^\)]*\)) */
        33: 12,

        /*! Conditions:: INITIAL */

        /*! Rule::       ([a-z]+) */
        34: 10,

        /*! Conditions:: INITIAL */

        /*! Rule::       \( */
        35: 7,

        /*! Conditions:: INITIAL */

        /*! Rule::       \) */
        36: 8,

        /*! Conditions:: INITIAL */

        /*! Rule::       $ */
        37: 1
      },
      rules: [
      /*  0: */
      /^(?:\s+)/,
      /*  1: */
      /^(?:\*)/,
      /*  2: */
      /^(?:\/)/,
      /*  3: */
      /^(?:\+)/,
      /*  4: */
      /^(?:-)/,
      /*  5: */
      /^(?:(\d+(\.\d*)?|\.\d+)px\b)/,
      /*  6: */
      /^(?:(\d+(\.\d*)?|\.\d+)cm\b)/,
      /*  7: */
      /^(?:(\d+(\.\d*)?|\.\d+)mm\b)/,
      /*  8: */
      /^(?:(\d+(\.\d*)?|\.\d+)in\b)/,
      /*  9: */
      /^(?:(\d+(\.\d*)?|\.\d+)pt\b)/,
      /* 10: */
      /^(?:(\d+(\.\d*)?|\.\d+)pc\b)/,
      /* 11: */
      /^(?:(\d+(\.\d*)?|\.\d+)deg\b)/,
      /* 12: */
      /^(?:(\d+(\.\d*)?|\.\d+)grad\b)/,
      /* 13: */
      /^(?:(\d+(\.\d*)?|\.\d+)rad\b)/,
      /* 14: */
      /^(?:(\d+(\.\d*)?|\.\d+)turn\b)/,
      /* 15: */
      /^(?:(\d+(\.\d*)?|\.\d+)s\b)/,
      /* 16: */
      /^(?:(\d+(\.\d*)?|\.\d+)ms\b)/,
      /* 17: */
      /^(?:(\d+(\.\d*)?|\.\d+)Hz\b)/,
      /* 18: */
      /^(?:(\d+(\.\d*)?|\.\d+)kHz\b)/,
      /* 19: */
      /^(?:(\d+(\.\d*)?|\.\d+)dpi\b)/,
      /* 20: */
      /^(?:(\d+(\.\d*)?|\.\d+)dpcm\b)/,
      /* 21: */
      /^(?:(\d+(\.\d*)?|\.\d+)dppx\b)/,
      /* 22: */
      /^(?:(\d+(\.\d*)?|\.\d+)em\b)/,
      /* 23: */
      /^(?:(\d+(\.\d*)?|\.\d+)ex\b)/,
      /* 24: */
      /^(?:(\d+(\.\d*)?|\.\d+)ch\b)/,
      /* 25: */
      /^(?:(\d+(\.\d*)?|\.\d+)rem\b)/,
      /* 26: */
      /^(?:(\d+(\.\d*)?|\.\d+)vw\b)/,
      /* 27: */
      /^(?:(\d+(\.\d*)?|\.\d+)vh\b)/,
      /* 28: */
      /^(?:(\d+(\.\d*)?|\.\d+)vmin\b)/,
      /* 29: */
      /^(?:(\d+(\.\d*)?|\.\d+)vmax\b)/,
      /* 30: */
      /^(?:(\d+(\.\d*)?|\.\d+)%)/,
      /* 31: */
      /^(?:(\d+(\.\d*)?|\.\d+)\b)/,
      /* 32: */
      /^(?:(calc))/,
      /* 33: */
      /^(?:(var\([^)]*\)))/,
      /* 34: */
      /^(?:([a-z]+))/,
      /* 35: */
      /^(?:\()/,
      /* 36: */
      /^(?:\))/,
      /* 37: */
      /^(?:$)/],
      conditions: {
        'INITIAL': {
          rules: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
          inclusive: true
        }
      }
    };
    return lexer;
  }();

  parser.lexer = lexer;

  function Parser() {
    this.yy = {};
  }

  Parser.prototype = parser;
  parser.Parser = Parser;
  return new Parser();
}();

if (true) {
  exports.parser = parser;
  exports.Parser = parser.Parser;

  exports.parse = function () {
    return parser.parse.apply(parser, arguments);
  };
}

/***/ }),

/***/ "../node_modules/vue-hot-reload-api/dist/index.js":
/***/ (function(module, exports) {

var Vue; // late bind

var version;
var map = Object.create(null);

if (typeof window !== 'undefined') {
  window.__VUE_HOT_MAP__ = map;
}

var installed = false;
var isBrowserify = false;
var initHookName = 'beforeCreate';

exports.install = function (vue, browserify) {
  if (installed) {
    return;
  }

  installed = true;
  Vue = vue.__esModule ? vue.default : vue;
  version = Vue.version.split('.').map(Number);
  isBrowserify = browserify; // compat with < 2.0.0-alpha.7

  if (Vue.config._lifecycleHooks.indexOf('init') > -1) {
    initHookName = 'init';
  }

  exports.compatible = version[0] >= 2;

  if (!exports.compatible) {
    console.warn('[HMR] You are using a version of vue-hot-reload-api that is ' + 'only compatible with Vue.js core ^2.0.0.');
    return;
  }
};
/**
 * Create a record for a hot module, which keeps track of its constructor
 * and instances
 *
 * @param {String} id
 * @param {Object} options
 */


exports.createRecord = function (id, options) {
  if (map[id]) {
    return;
  }

  var Ctor = null;

  if (typeof options === 'function') {
    Ctor = options;
    options = Ctor.options;
  }

  makeOptionsHot(id, options);
  map[id] = {
    Ctor: Ctor,
    options: options,
    instances: []
  };
};
/**
 * Check if module is recorded
 *
 * @param {String} id
 */


exports.isRecorded = function (id) {
  return typeof map[id] !== 'undefined';
};
/**
 * Make a Component options object hot.
 *
 * @param {String} id
 * @param {Object} options
 */


function makeOptionsHot(id, options) {
  if (options.functional) {
    var render = options.render;

    options.render = function (h, ctx) {
      var instances = map[id].instances;

      if (ctx && instances.indexOf(ctx.parent) < 0) {
        instances.push(ctx.parent);
      }

      return render(h, ctx);
    };
  } else {
    injectHook(options, initHookName, function () {
      var record = map[id];

      if (!record.Ctor) {
        record.Ctor = this.constructor;
      }

      record.instances.push(this);
    });
    injectHook(options, 'beforeDestroy', function () {
      var instances = map[id].instances;
      instances.splice(instances.indexOf(this), 1);
    });
  }
}
/**
 * Inject a hook to a hot reloadable component so that
 * we can keep track of it.
 *
 * @param {Object} options
 * @param {String} name
 * @param {Function} hook
 */


function injectHook(options, name, hook) {
  var existing = options[name];
  options[name] = existing ? Array.isArray(existing) ? existing.concat(hook) : [existing, hook] : [hook];
}

function tryWrap(fn) {
  return function (id, arg) {
    try {
      fn(id, arg);
    } catch (e) {
      console.error(e);
      console.warn('Something went wrong during Vue component hot-reload. Full reload required.');
    }
  };
}

function updateOptions(oldOptions, newOptions) {
  for (var key in oldOptions) {
    if (!(key in newOptions)) {
      delete oldOptions[key];
    }
  }

  for (var key$1 in newOptions) {
    oldOptions[key$1] = newOptions[key$1];
  }
}

exports.rerender = tryWrap(function (id, options) {
  var record = map[id];

  if (!options) {
    record.instances.slice().forEach(function (instance) {
      instance.$forceUpdate();
    });
    return;
  }

  if (typeof options === 'function') {
    options = options.options;
  }

  if (record.Ctor) {
    record.Ctor.options.render = options.render;
    record.Ctor.options.staticRenderFns = options.staticRenderFns;
    record.instances.slice().forEach(function (instance) {
      instance.$options.render = options.render;
      instance.$options.staticRenderFns = options.staticRenderFns; // reset static trees
      // pre 2.5, all static trees are cached together on the instance

      if (instance._staticTrees) {
        instance._staticTrees = [];
      } // 2.5.0


      if (Array.isArray(record.Ctor.options.cached)) {
        record.Ctor.options.cached = [];
      } // 2.5.3


      if (Array.isArray(instance.$options.cached)) {
        instance.$options.cached = [];
      } // post 2.5.4: v-once trees are cached on instance._staticTrees.
      // Pure static trees are cached on the staticRenderFns array
      // (both already reset above)
      // 2.6: temporarily mark rendered scoped slots as unstable so that
      // child components can be forced to update


      var restore = patchScopedSlots(instance);
      instance.$forceUpdate();
      instance.$nextTick(restore);
    });
  } else {
    // functional or no instance created yet
    record.options.render = options.render;
    record.options.staticRenderFns = options.staticRenderFns; // handle functional component re-render

    if (record.options.functional) {
      // rerender with full options
      if (Object.keys(options).length > 2) {
        updateOptions(record.options, options);
      } else {
        // template-only rerender.
        // need to inject the style injection code for CSS modules
        // to work properly.
        var injectStyles = record.options._injectStyles;

        if (injectStyles) {
          var render = options.render;

          record.options.render = function (h, ctx) {
            injectStyles.call(ctx);
            return render(h, ctx);
          };
        }
      }

      record.options._Ctor = null; // 2.5.3

      if (Array.isArray(record.options.cached)) {
        record.options.cached = [];
      }

      record.instances.slice().forEach(function (instance) {
        instance.$forceUpdate();
      });
    }
  }
});
exports.reload = tryWrap(function (id, options) {
  var record = map[id];

  if (options) {
    if (typeof options === 'function') {
      options = options.options;
    }

    makeOptionsHot(id, options);

    if (record.Ctor) {
      if (version[1] < 2) {
        // preserve pre 2.2 behavior for global mixin handling
        record.Ctor.extendOptions = options;
      }

      var newCtor = record.Ctor.super.extend(options); // prevent record.options._Ctor from being overwritten accidentally

      newCtor.options._Ctor = record.options._Ctor;
      record.Ctor.options = newCtor.options;
      record.Ctor.cid = newCtor.cid;
      record.Ctor.prototype = newCtor.prototype;

      if (newCtor.release) {
        // temporary global mixin strategy used in < 2.0.0-alpha.6
        newCtor.release();
      }
    } else {
      updateOptions(record.options, options);
    }
  }

  record.instances.slice().forEach(function (instance) {
    if (instance.$vnode && instance.$vnode.context) {
      instance.$vnode.context.$forceUpdate();
    } else {
      console.warn('Root or manually mounted instance modified. Full reload required.');
    }
  });
}); // 2.6 optimizes template-compiled scoped slots and skips updates if child
// only uses scoped slots. We need to patch the scoped slots resolving helper
// to temporarily mark all scoped slots as unstable in order to force child
// updates.

function patchScopedSlots(instance) {
  if (!instance._u) {
    return;
  } // https://github.com/vuejs/vue/blob/dev/src/core/instance/render-helpers/resolve-scoped-slots.js


  var original = instance._u;

  instance._u = function (slots) {
    try {
      // 2.6.4 ~ 2.6.6
      return original(slots, true);
    } catch (e) {
      // 2.5 / >= 2.6.7
      return original(slots, null, true);
    }
  };

  return function () {
    instance._u = original;
  };
}

/***/ }),

/***/ "../node_modules/vue-loader/lib/runtime/componentNormalizer.js":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return normalizeComponent; });
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent (
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier, /* server only */
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
        injectStyles.call(
          this,
          (options.functional ? this.parent : this).$root.$options.shadowRoot
        )
      }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}


/***/ }),

/***/ "../node_modules/webpack/buildin/global.js":
/***/ (function(module, exports) {

var g; // This works in non-strict mode

g = function () {
  return this;
}();

try {
  // This works if eval is allowed (see CSP)
  g = g || new Function("return this")();
} catch (e) {
  // This works if the window reference is available
  if (typeof window === "object") g = window;
} // g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}


module.exports = g;

/***/ })

}]);
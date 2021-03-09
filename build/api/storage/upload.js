"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _momentTimezone = _interopRequireDefault(require("moment-timezone"));

var _shortid = _interopRequireDefault(require("shortid"));

var _fs = _interopRequireDefault(require("fs"));

var _firebase = _interopRequireDefault(require("../../assets/firebase"));

var _response = _interopRequireDefault(require("../../assets/response"));

var _textPack = _interopRequireDefault(require("../../assets/textPack.json"));

var _performance = _interopRequireDefault(require("../../assets/tests/performance"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var router = (0, _express.Router)();

var bucket = _firebase["default"].storage().bucket();

var database = _firebase["default"].firestore().collection("storageLog");

(0, _momentTimezone["default"])().locale("pt-br");
(0, _momentTimezone["default"])().tz("America/Maceio");

function verifyUserLimits(ip) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return database.doc(ip).get().then(function (doc) {
                if (doc.exists) {
                  var data = doc.data();

                  if (data.uploads.quantity >= 7) {
                    return reject(_textPack["default"].storage.upload.limitReached);
                  } else {
                    return resolve();
                  }
                } else {
                  return resolve();
                }
              })["catch"](function (err) {
                console.error(err);
                return reject(_textPack["default"].storage.upload.limitError);
              });

            case 2:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
  return promise;
}

function logUserAction(ip, filename) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve, reject) {
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return database.doc(ip).get().then( /*#__PURE__*/function () {
                var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(doc) {
                  var data;
                  return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          if (!doc.exists) {
                            _context2.next = 6;
                            break;
                          }

                          data = doc.data();
                          _context2.next = 4;
                          return database.doc(ip).update({
                            uploads: {
                              quantity: data.uploads.quantity + 1,
                              files: [].concat(_toConsumableArray(data.uploads.files), [filename])
                            }
                          }).then(function () {
                            return resolve();
                          })["catch"](function (err) {
                            console.error(err);
                            return reject(_textPack["default"].standards.responseError);
                          });

                        case 4:
                          _context2.next = 8;
                          break;

                        case 6:
                          _context2.next = 8;
                          return database.doc(ip).set({
                            uploader: ip,
                            uploads: {
                              quantity: 1,
                              files: [filename]
                            }
                          }).then(function () {
                            return resolve();
                          })["catch"](function (err) {
                            console.error(err);
                            return reject(_textPack["default"].standards.responseError);
                          });

                        case 8:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  }, _callee2);
                }));

                return function (_x5) {
                  return _ref3.apply(this, arguments);
                };
              }());

            case 2:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());
  return promise;
}

function deleteCloudFile(filename) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(resolve, reject) {
      var file;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              file = bucket.file(filename);
              _context4.next = 3;
              return file["delete"]().then(function () {
                return resolve(_textPack["default"].storage.upload.uploadCanceled);
              })["catch"](function (err) {
                console.error(err);
                return reject(_textPack["default"].storage.upload.uploadCanceledError);
              });

            case 3:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    }));

    return function (_x6, _x7) {
      return _ref4.apply(this, arguments);
    };
  }());
  return promise;
}

function deleteLocalFile(path) {
  try {
    _fs["default"].unlinkSync(path);

    return {
      error: false
    };
  } catch (err) {
    console.error(err);
    return {
      error: true,
      message: _textPack["default"].standards.responseError
    };
  }
}

function moveFile(file, filename) {
  var promise = new Promise(function (resolve, reject) {
    var path = "".concat(process.cwd(), "/temp/").concat(filename);
    file.mv(path, function (err) {
      if (err) {
        console.error(err);
        return reject(_textPack["default"].standards.responseError);
      }

      return resolve(path);
    });
  });
  return promise;
}

function uploadFile(path, checksum) {
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(resolve, reject) {
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return bucket.upload(path, {
                gzip: true,
                validation: checksum
              }).then(function () {
                return resolve();
              })["catch"](function (err) {
                console.error(err);
                return reject(_textPack["default"].standards.responseError);
              });

            case 2:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    }));

    return function (_x8, _x9) {
      return _ref5.apply(this, arguments);
    };
  }());
  return promise;
}

router.post("/", /*#__PURE__*/function () {
  var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(req, res) {
    var performanceLog, ip, file, mimeTypes, promisesResults;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            performanceLog = new _performance["default"](req.baseUrl);

            if (req.files) {
              _context11.next = 4;
              break;
            }

            performanceLog.finish();
            return _context11.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].standards.nullField)));

          case 4:
            ip = req.headers["x-ip"];
            file = req.files.file;
            mimeTypes = ["text", "image", "audio", "video"];

            if (!(file.size > 5242880)) {
              _context11.next = 10;
              break;
            }

            performanceLog.finish();
            return _context11.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].storage.upload.fileLimit)));

          case 10:
            if (mimeTypes.includes(file.mimetype.split("/")[0])) {
              _context11.next = 13;
              break;
            }

            performanceLog.finish();
            return _context11.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].storage.upload.fileType)));

          case 13:
            promisesResults = [];
            Promise.resolve(promisesResults).then( /*#__PURE__*/function () {
              var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(all) {
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                  while (1) {
                    switch (_context6.prev = _context6.next) {
                      case 0:
                        _context6.next = 2;
                        return verifyUserLimits(ip).then(function () {
                          return all;
                        })["catch"](function (err) {
                          throw new Error(err);
                        });

                      case 2:
                        return _context6.abrupt("return", _context6.sent);

                      case 3:
                      case "end":
                        return _context6.stop();
                    }
                  }
                }, _callee6);
              }));

              return function (_x12) {
                return _ref7.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(all) {
                var filename;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        filename = (0, _momentTimezone["default"])().format("DD-MM-YYYY_hh-mm-ssa_[".concat(_shortid["default"].generate(), ".").concat(file.mimetype.split("/")[1], "]"));
                        all.push(filename);
                        _context7.next = 4;
                        return moveFile(file, filename).then(function (path) {
                          all.push(path);
                          return all;
                        })["catch"](function (err) {
                          throw new Error(err);
                        });

                      case 4:
                        return _context7.abrupt("return", _context7.sent);

                      case 5:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7);
              }));

              return function (_x13) {
                return _ref8.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(all) {
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        _context8.next = 2;
                        return uploadFile(all[1], file.md5).then(function () {
                          all.push("uploaded");
                          return all;
                        })["catch"](function (err) {
                          throw new Error(err);
                        });

                      case 2:
                        return _context8.abrupt("return", _context8.sent);

                      case 3:
                      case "end":
                        return _context8.stop();
                    }
                  }
                }, _callee8);
              }));

              return function (_x14) {
                return _ref9.apply(this, arguments);
              };
            }()).then(function (all) {
              var fileDeletion = deleteLocalFile(all[1]);

              if (fileDeletion.error) {
                throw new Error(fileDeletion.message);
              }

              return all;
            }).then( /*#__PURE__*/function () {
              var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(all) {
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        _context9.next = 2;
                        return logUserAction(ip, all[0]).then(function () {
                          performanceLog.finish();
                          return res.json((0, _response["default"])(false, _textPack["default"].standards.responseOK, {
                            filename: all[0]
                          }));
                        })["catch"](function (err) {
                          throw new Error(err);
                        });

                      case 2:
                        return _context9.abrupt("return", _context9.sent);

                      case 3:
                      case "end":
                        return _context9.stop();
                    }
                  }
                }, _callee9);
              }));

              return function (_x15) {
                return _ref10.apply(this, arguments);
              };
            }())["catch"]( /*#__PURE__*/function () {
              var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(err) {
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                  while (1) {
                    switch (_context10.prev = _context10.next) {
                      case 0:
                        console.error(err);

                        if (!(promisesResults[2] === "uploaded")) {
                          _context10.next = 6;
                          break;
                        }

                        _context10.next = 4;
                        return deleteCloudFile(promisesResults[0]).then(function (msg) {
                          performanceLog.finish();
                          return res.status(500).json((0, _response["default"])(true, msg));
                        })["catch"](function (error) {
                          performanceLog.finish();
                          return res.status(500).json((0, _response["default"])(true, error.message));
                        });

                      case 4:
                        _context10.next = 8;
                        break;

                      case 6:
                        performanceLog.finish();
                        return _context10.abrupt("return", res.status(500).json((0, _response["default"])(true, err.message)));

                      case 8:
                      case "end":
                        return _context10.stop();
                    }
                  }
                }, _callee10);
              }));

              return function (_x16) {
                return _ref11.apply(this, arguments);
              };
            }());

          case 15:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));

  return function (_x10, _x11) {
    return _ref6.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;
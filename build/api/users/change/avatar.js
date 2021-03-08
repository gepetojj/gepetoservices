"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _express = require("express");

var _fs = _interopRequireDefault(require("fs"));

var _jimp = _interopRequireDefault(require("jimp"));

var _shortid = _interopRequireDefault(require("shortid"));

var _crypto = _interopRequireDefault(require("crypto"));

var _authorize = _interopRequireDefault(require("../../../assets/middlewares/authorize"));

var _response = _interopRequireDefault(require("../../../assets/response"));

var _textPack = _interopRequireDefault(require("../../../assets/textPack.json"));

var _User = _interopRequireDefault(require("../../../assets/models/User"));

var _firebase = _interopRequireDefault(require("../../../assets/firebase"));

var _performance = _interopRequireDefault(require("../../../assets/tests/performance"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require("dotenv").config();

var router = (0, _express.Router)();

var bucket = _firebase["default"].storage().bucket();

function checkUserAvatar(_x) {
  return _checkUserAvatar.apply(this, arguments);
}

function _checkUserAvatar() {
  _checkUserAvatar = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(uid) {
    var promise;
    return regeneratorRuntime.wrap(function _callee8$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            promise = new Promise( /*#__PURE__*/function () {
              var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(resolve, reject) {
                var avatar, avatarExists;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                  while (1) {
                    switch (_context7.prev = _context7.next) {
                      case 0:
                        _context7.prev = 0;
                        avatar = bucket.file("".concat(uid, ".jpg"));
                        _context7.next = 4;
                        return avatar.exists();

                      case 4:
                        avatarExists = _context7.sent;
                        resolve(avatarExists[0]);
                        _context7.next = 12;
                        break;

                      case 8:
                        _context7.prev = 8;
                        _context7.t0 = _context7["catch"](0);
                        console.error(_context7.t0);
                        reject(_context7.t0);

                      case 12:
                      case "end":
                        return _context7.stop();
                    }
                  }
                }, _callee7, null, [[0, 8]]);
              }));

              return function (_x16, _x17) {
                return _ref8.apply(this, arguments);
              };
            }());
            return _context8.abrupt("return", promise);

          case 2:
          case "end":
            return _context8.stop();
        }
      }
    }, _callee8);
  }));
  return _checkUserAvatar.apply(this, arguments);
}

function deleteOldAvatar(_x2) {
  return _deleteOldAvatar.apply(this, arguments);
}

function _deleteOldAvatar() {
  _deleteOldAvatar = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(uid) {
    var promise;
    return regeneratorRuntime.wrap(function _callee10$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            promise = new Promise( /*#__PURE__*/function () {
              var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(resolve, reject) {
                var avatar;
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                  while (1) {
                    switch (_context9.prev = _context9.next) {
                      case 0:
                        _context9.prev = 0;
                        avatar = bucket.file("".concat(uid, ".jpg"));
                        _context9.next = 4;
                        return avatar["delete"]();

                      case 4:
                        resolve();
                        _context9.next = 11;
                        break;

                      case 7:
                        _context9.prev = 7;
                        _context9.t0 = _context9["catch"](0);
                        console.error(_context9.t0);
                        reject(_context9.t0);

                      case 11:
                      case "end":
                        return _context9.stop();
                    }
                  }
                }, _callee9, null, [[0, 7]]);
              }));

              return function (_x18, _x19) {
                return _ref9.apply(this, arguments);
              };
            }());
            return _context10.abrupt("return", promise);

          case 2:
          case "end":
            return _context10.stop();
        }
      }
    }, _callee10);
  }));
  return _deleteOldAvatar.apply(this, arguments);
}

function moveFile(_x3) {
  return _moveFile.apply(this, arguments);
}

function _moveFile() {
  _moveFile = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(file) {
    var promise;
    return regeneratorRuntime.wrap(function _callee11$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            promise = new Promise(function (resolve, reject) {
              var path = "".concat(process.cwd(), "/temp/").concat(_shortid["default"].generate(), ".").concat(file.mimetype.split("/")[1]);
              file.mv(path, function (err) {
                if (err) {
                  console.error(err);
                  reject(err);
                }

                resolve(path);
              });
            });
            return _context11.abrupt("return", promise);

          case 2:
          case "end":
            return _context11.stop();
        }
      }
    }, _callee11);
  }));
  return _moveFile.apply(this, arguments);
}

function resizeImage(_x4, _x5) {
  return _resizeImage.apply(this, arguments);
}

function _resizeImage() {
  _resizeImage = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(uid, path) {
    var promise;
    return regeneratorRuntime.wrap(function _callee12$(_context12) {
      while (1) {
        switch (_context12.prev = _context12.next) {
          case 0:
            promise = new Promise(function (resolve, reject) {
              _jimp["default"].read(path).then(function (image) {
                var newPath = "".concat(process.cwd(), "/temp/").concat(uid, ".jpg");
                image.resize(128, 128).quality(95).write(newPath, function (err) {
                  if (err) {
                    console.error(err);
                    reject(err);
                  }

                  _fs["default"].readFile(newPath, function (err, data) {
                    if (err) {
                      console.error(err);
                      reject(err);
                    }

                    var checksum = _crypto["default"].createHash("md5").update(data, "utf8").digest("hex");

                    resolve({
                      newPath: newPath,
                      checksum: checksum
                    });
                  });
                });
              })["catch"](function (err) {
                console.error(err);
                reject(err);
              });
            });
            return _context12.abrupt("return", promise);

          case 2:
          case "end":
            return _context12.stop();
        }
      }
    }, _callee12);
  }));
  return _resizeImage.apply(this, arguments);
}

function deleteImage(path) {
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

function uploadAvatar(_x6, _x7) {
  return _uploadAvatar.apply(this, arguments);
}

function _uploadAvatar() {
  _uploadAvatar = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee14(path, checksum) {
    var promise;
    return regeneratorRuntime.wrap(function _callee14$(_context14) {
      while (1) {
        switch (_context14.prev = _context14.next) {
          case 0:
            promise = new Promise( /*#__PURE__*/function () {
              var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(resolve, reject) {
                return regeneratorRuntime.wrap(function _callee13$(_context13) {
                  while (1) {
                    switch (_context13.prev = _context13.next) {
                      case 0:
                        _context13.next = 2;
                        return bucket.upload(path, {
                          gzip: true,
                          validation: checksum
                        }).then(resolve())["catch"](function (err) {
                          console.error(err.message);
                          reject(err);
                        });

                      case 2:
                      case "end":
                        return _context13.stop();
                    }
                  }
                }, _callee13);
              }));

              return function (_x20, _x21) {
                return _ref10.apply(this, arguments);
              };
            }());
            return _context14.abrupt("return", promise);

          case 2:
          case "end":
            return _context14.stop();
        }
      }
    }, _callee14);
  }));
  return _uploadAvatar.apply(this, arguments);
}

function updateUserAvatar(_x8) {
  return _updateUserAvatar.apply(this, arguments);
}

function _updateUserAvatar() {
  _updateUserAvatar = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee18(uid) {
    var promise;
    return regeneratorRuntime.wrap(function _callee18$(_context18) {
      while (1) {
        switch (_context18.prev = _context18.next) {
          case 0:
            promise = new Promise( /*#__PURE__*/function () {
              var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee17(resolve, reject) {
                var avatar;
                return regeneratorRuntime.wrap(function _callee17$(_context17) {
                  while (1) {
                    switch (_context17.prev = _context17.next) {
                      case 0:
                        avatar = bucket.file("".concat(uid, ".jpg"));
                        setTimeout( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee16() {
                          return regeneratorRuntime.wrap(function _callee16$(_context16) {
                            while (1) {
                              switch (_context16.prev = _context16.next) {
                                case 0:
                                  _context16.next = 2;
                                  return avatar.makePublic().then( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee15() {
                                    var publicUrl;
                                    return regeneratorRuntime.wrap(function _callee15$(_context15) {
                                      while (1) {
                                        switch (_context15.prev = _context15.next) {
                                          case 0:
                                            publicUrl = avatar.publicUrl();
                                            _context15.next = 3;
                                            return _User["default"].updateOne({
                                              _id: uid
                                            }, {
                                              avatar: publicUrl
                                            });

                                          case 3:
                                            resolve(publicUrl);

                                          case 4:
                                          case "end":
                                            return _context15.stop();
                                        }
                                      }
                                    }, _callee15);
                                  })))["catch"](function (err) {
                                    console.error(err.message);
                                    reject(err);
                                  });

                                case 2:
                                case "end":
                                  return _context16.stop();
                              }
                            }
                          }, _callee16);
                        })), 300);

                      case 2:
                      case "end":
                        return _context17.stop();
                    }
                  }
                }, _callee17);
              }));

              return function (_x22, _x23) {
                return _ref11.apply(this, arguments);
              };
            }());
            return _context18.abrupt("return", promise);

          case 2:
          case "end":
            return _context18.stop();
        }
      }
    }, _callee18);
  }));
  return _updateUserAvatar.apply(this, arguments);
}

router.put("/", (0, _authorize["default"])({
  level: 0
}), /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(req, res) {
    var performanceLog, uid, file, mimetype, promisesResults;
    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            performanceLog = new _performance["default"](req.baseUrl);
            uid = req.user.id;

            if (req.files) {
              _context6.next = 5;
              break;
            }

            performanceLog.finish();
            return _context6.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].standards.nullField)));

          case 5:
            file = req.files.file;
            mimetype = file.mimetype.split("/");

            if (!(file.size > 3145728)) {
              _context6.next = 10;
              break;
            }

            performanceLog.finish();
            return _context6.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].users.change.avatar.fileLimit)));

          case 10:
            if (!(mimetype[0] !== "image" || !["png", "jpeg"].includes(mimetype[1]))) {
              _context6.next = 13;
              break;
            }

            performanceLog.finish();
            return _context6.abrupt("return", res.status(400).json((0, _response["default"])(true, _textPack["default"].users.change.avatar.fileType)));

          case 13:
            promisesResults = [];
            Promise.resolve(promisesResults).then( /*#__PURE__*/function () {
              var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(all) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return checkUserAvatar(uid).then(function (avatarExists) {
                          if (avatarExists) {
                            deleteOldAvatar(uid)["catch"](function () {
                              throw new Error("500:".concat(_textPack["default"].users.change.avatar.couldntDeleteOldAvatar));
                            }).then(function () {
                              return all;
                            });
                          }

                          return all;
                        })["catch"](function () {
                          throw new Error("500:".concat(_textPack["default"].users.change.avatar.couldntDeleteOldAvatar));
                        });

                      case 2:
                        return _context.abrupt("return", _context.sent);

                      case 3:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              return function (_x11) {
                return _ref2.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(all) {
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return moveFile(file).then(function (path) {
                          all.push(path);
                          return all;
                        })["catch"](function () {
                          throw new Error("500:".concat(_textPack["default"].standards.responseError));
                        });

                      case 2:
                        return _context2.abrupt("return", _context2.sent);

                      case 3:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              return function (_x12) {
                return _ref3.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(all) {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                  while (1) {
                    switch (_context3.prev = _context3.next) {
                      case 0:
                        _context3.next = 2;
                        return resizeImage(uid, all[0]).then(function (_ref5) {
                          var newPath = _ref5.newPath,
                              checksum = _ref5.checksum;
                          all.push(newPath);
                          all.push(checksum);
                          return all;
                        })["catch"](function () {
                          throw new Error("500:".concat(_textPack["default"].users.change.avatar.avatarNotUploaded));
                        });

                      case 2:
                        return _context3.abrupt("return", _context3.sent);

                      case 3:
                      case "end":
                        return _context3.stop();
                    }
                  }
                }, _callee3);
              }));

              return function (_x13) {
                return _ref4.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(all) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.next = 2;
                        return uploadAvatar(all[1], all[2]).then(function () {
                          return all;
                        })["catch"](function () {
                          throw new Error("500:".concat(_textPack["default"].users.change.avatar.avatarNotUploaded));
                        });

                      case 2:
                        return _context4.abrupt("return", _context4.sent);

                      case 3:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4);
              }));

              return function (_x14) {
                return _ref6.apply(this, arguments);
              };
            }()).then( /*#__PURE__*/function () {
              var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(all) {
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        _context5.next = 2;
                        return updateUserAvatar(uid).then(function (avatarLink) {
                          var originalImageDeletion = deleteImage(all[0]);
                          var resizedImageDeletion = deleteImage(all[1]);

                          if (originalImageDeletion.error || resizedImageDeletion.error) {
                            throw new Error("500:".concat(_textPack["default"].standards.responseError));
                          }

                          performanceLog.finish();
                          return res.json((0, _response["default"])(false, _textPack["default"].users.change.avatar.avatarUploaded, {
                            link: avatarLink
                          }));
                        })["catch"](function () {
                          var originalImageDeletion = deleteImage(originalFilePath);
                          var resizedImageDeletion = deleteImage(resizedImagePath);

                          if (originalImageDeletion.error || resizedImageDeletion.error) {
                            throw new Error("500:".concat(_textPack["default"].standards.responseError));
                          }
                        });

                      case 2:
                        return _context5.abrupt("return", _context5.sent);

                      case 3:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee5);
              }));

              return function (_x15) {
                return _ref7.apply(this, arguments);
              };
            }())["catch"](function (err) {
              performanceLog.finish();
              var error = err.message.split(":");
              return res.status(error[0]).json((0, _response["default"])(true, error[1]));
            });

          case 15:
          case "end":
            return _context6.stop();
        }
      }
    }, _callee6);
  }));

  return function (_x9, _x10) {
    return _ref.apply(this, arguments);
  };
}());
var _default = router;
exports["default"] = _default;
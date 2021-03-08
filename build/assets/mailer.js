"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _nodemailer = require("nodemailer");

var _ejs = _interopRequireDefault(require("ejs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require("dotenv").config();

/**
 * Envia um email.
 * @param {String} template Nome do template a ser enviado no email.
 * @param {Object} templateParams Parâmetros do template.
 * @param {String} target Email do receptor.
 * @param {String} subject Assunto do email.
 * @returns {Promise} Retorna undefined caso o email seja enviado com
 * sucesso.
 */
function mailer(_ref) {
  var template = _ref.template,
      templateParams = _ref.templateParams,
      target = _ref.target,
      subject = _ref.subject;
  var promise = new Promise( /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
      var transporter, renderedHtml, _yield$transporter$se, err;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              transporter = (0, _nodemailer.createTransport)({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                  user: process.env.MAIL_USER,
                  pass: process.env.MAIL_PASS
                }
              });

              _ejs["default"].renderFile("".concat(process.cwd(), "/assets/templates/").concat(template, ".ejs"), templateParams, function (err, html) {
                if (err) {
                  console.error(err);
                  reject(err);
                }

                renderedHtml = html;
              });

              _context.next = 5;
              return transporter.sendMail({
                from: "GepetoServices <".concat(process.env.MAIL_USER, ">"),
                to: target,
                subject: subject,
                html: renderedHtml
              });

            case 5:
              _yield$transporter$se = _context.sent;
              err = _yield$transporter$se.err;

              if (err) {
                console.error(err);
                reject(err);
              }

              resolve();
              _context.next = 15;
              break;

            case 11:
              _context.prev = 11;
              _context.t0 = _context["catch"](0);
              console.error(_context.t0);
              reject(_context.t0);

            case 15:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 11]]);
    }));

    return function (_x, _x2) {
      return _ref2.apply(this, arguments);
    };
  }());
  return promise;
}

var _default = mailer;
exports["default"] = _default;
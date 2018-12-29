"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _electron = require("electron");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require("electron-titlebar");

var capitalizeWord = function capitalizeWord(word) {
  return word.charAt(0).toUpperCase() + word.substr(1, word.length);
};
var capitalizeEachWord = function capitalizeEachWord(sentence) {
  return sentence.split(" ").map(function (word) {
    return capitalizeWord(word);
  }).join(" ");
};

var $vm = new Vue({
  el: "#app",
  data: {
    query: null,
    loading: {
      error: false,
      message: "Loading awesome icons...",
      isLoading: true,
      detail: false
    },
    icons: {
      remote: [],
      filtered: [],
      local: []
    }
  },
  mounted: function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _electron.ipcRenderer.send("update-theme");

              this.presentLoading("Loading awesome icons...");

              _context.prev = 2;
              _context.next = 5;
              return this.fetchIcons();

            case 5:
              this.dismissLoading();
              _context.next = 11;
              break;

            case 8:
              _context.prev = 8;
              _context.t0 = _context["catch"](2);

              this.showError(_context.t0);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[2, 8]]);
    }));

    function mounted() {
      return _ref.apply(this, arguments);
    }

    return mounted;
  }(),
  methods: {
    setIcon: function setIcon(url) {
      if (url) _electron.ipcRenderer.send("selected", url);
    },
    showError: function showError(error) {
      this.loading.error = true;
      this.loading.isLoading = false;
      this.loading.message = error.message;

      console.log(error.message);
    },
    search: function search() {
      var _this = this;

      this.icons.filtered = this.icons.remote.filter(function (item) {
        var re = new RegExp("" + _this.query.toLowerCase(), "g");
        return re.test(item.title.toLowerCase());
      });
    },
    fetchIcons: function fetchIcons() {
      var _this2 = this;

      return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
        var response, data;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return fetch("https://api.github.com/repositories/110824329/contents/linux");

              case 2:
                response = _context2.sent;
                _context2.next = 5;
                return response.json();

              case 5:
                data = _context2.sent;

                if (!(!data || !data.length || data.message)) {
                  _context2.next = 9;
                  break;
                }

                _this2.loading.detail = data.message;
                throw new Error("[" + response.status + "] - Unable to fetch API");

              case 9:

                _this2.icons.remote = data.map(function (icon, index) {
                  var filename = encodeURIComponent(icon.download_url.split("/").pop().replace(".png", ".icns"));
                  var url = icon.download_url.split("/");

                  url.splice(url.length - 2, 2);

                  url = url.join("/");

                  url += "/macOS/" + filename;

                  return {
                    name: icon.name,
                    title: capitalizeEachWord(icon.name.split(".")[0].replace(/-|_/g, " ")),
                    image: icon.download_url,
                    download: url
                  };
                });

                _this2.icons.filtered = _this2.icons.remote;

                _this2.dismissLoading();

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, _this2);
      }))();
    },
    tryAgain: function tryAgain() {
      var _this3 = this;

      return (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _this3.presentLoading("Loading...");
                _this3.fetchIcons();

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, _this3);
      }))();
    },
    presentLoading: function presentLoading(message) {
      this.loading.isLoading = true;
      this.loading.detail = false;

      if (message) this.loading.message = message;

      var overlay = this.$refs.loadingContainer;

      overlay.style.opacity = 1;
      setTimeout(function () {
        return overlay.style.zIndex = 9999;
      }, 200);
    },
    dismissLoading: function dismissLoading() {
      this.loading.detail = false;
      this.loading.isLoading = false;
      this.loading.message = "Loading awesome icons...";

      var overlay = this.$refs.loadingContainer;

      overlay.style.opacity = 0;
      setTimeout(function () {
        return overlay.style.zIndex = -1;
      }, 200);
    },
    notify: function notify(title, body, onClick) {
      var notification = new Notification(title, {
        body: body
      });
      notification.onclick = onClick;
    }
  }
});

// IPC
_electron.ipcRenderer.on("notification", function () {
  $vm.notify("Icon updated!", "Your VSCode icons has been updated!", function () {
    return _electron.ipcRenderer.send("keep-focus");
  });
});

_electron.ipcRenderer.on("dismiss-loading", $vm.dismissLoading);

_electron.ipcRenderer.on("present-loading", function () {
  $vm.presentLoading("Loading...");
});

_electron.ipcRenderer.on("theme changed", function (e, data) {
  console.log(e, data);

  if (data.dark == true) {
    document.querySelectorAll(".theme-light").forEach(function (el) {
      el.classList.toggle("theme-light");
      el.classList.toggle("theme-dark");
    });

    return;
  }

  document.querySelectorAll(".theme-dark").forEach(function (el) {
    el.classList.toggle("theme-light");
    el.classList.toggle("theme-dark");
  });
});
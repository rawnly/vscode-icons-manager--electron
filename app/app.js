'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _electron = require('electron');

var _electronDl = require('electron-dl');

var _electronStore = require('electron-store');

var _electronStore2 = _interopRequireDefault(_electronStore);

var _utils = require('./libs/utils');

var _electronTimber = require('electron-timber');

var _electronTimber2 = _interopRequireDefault(_electronTimber);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var settings = new _electronStore2.default(); /**
                                               * Copyright Federico Vitale © 2018
                                               * 
                                               * Code review is appreciated :)
                                               * 
                                               */

var w = void 0;

_electron.app.setName('VSCode Icons Manager');

/**
 * 
 * @name makeWindow
 * 
 * @param {String} path Page (html) path
 * 
 * @returns {Object} BrowserWindow object
 * 
 */
function makeWindow(path) {
	var windowName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'main';

	var win = new _electron.BrowserWindow({
		width: 800,
		height: 800,
		center: true,
		show: false,
		resizable: false,
		fullscreenable: false,
		minimizable: true,
		maximizable: false,
		title: windowName,
		titleBarStyle: 'hiddenInset',
		icon: (0, _path.join)(__dirname, '..', 'assets', 'icon', '64x64.png')
	});

	win.loadURL('file://' + __dirname + '/' + path);

	win.once('ready-to-show', function () {
		return win.show();
	});
	win.on('closed', function () {
		return win = null;
	});

	require('./libs/Menu');

	return win;
}

// Renderer files folder
var renderer = 'render/index.html';

var updateTheme = function updateTheme() {
	_electronTimber2.default.log('Changing theme to', _electron.systemPreferences.isDarkMode() ? 'dark' : 'bright');
	if (w) w.webContents.send('theme changed', {
		dark: _electron.systemPreferences.isDarkMode()
	});
};

_electron.systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', updateTheme);

// Once app is ready
_electron.app.once('ready', function () {
	w = makeWindow(renderer);
	updateTheme();

	if (process.platform != 'darwin') {
		_electron.dialog.showErrorBox('Unsupported platform!', 'We are sorry but right now that application runs only on macOS systems.');
		return _electron.app.quit();
	}

	// Check for vscode installation
	if (!settings.has('icon-folder')) settings.set('icon-folder', '/Applications/Visual Studio Code.app/Contents/Resources/');
	if (!settings.has('app-location')) settings.set('app-location', '/Applications/Visual Studio Code.app');

	// If the app does not exists in /Applications: manually locate it. 
	if (_fs2.default.existsSync(settings.get('app-location')) == false) {
		_electron.dialog.showMessageBox(w, {
			title: 'Warning!',
			message: '"Visual Studio Code" not found in your "/Applications" folder.',
			buttons: ['Locate']
		}, function () {
			_electron.dialog.showOpenDialog(w, {
				title: 'Open App',
				message: 'Show me where is located your VSCode App',
				properties: ['openFile'],
				buttonLabel: 'That\'s it!',
				defaultPath: '/Applications',
				filters: [{
					name: 'All Files',
					extensions: ['*']
				}]
			}, function (newPath) {

				if (!newPath || !newPath.length) {
					return _electron.app.quit();
				}

				var iconFolder = _path2.default.join(newPath[0], 'Contents', 'Resources');

				// Do something with settings
				settings.set('app-location', newPath[0]);
				settings.set('icon-folder', iconFolder);
			});
		});
	}
});

// If all windows are closed then close the app if not on macOS
_electron.app.on('window-all-closed', function () {
	w = null;
	if (process.platform !== 'darwin') return _electron.app.quit();
});

// on macOS create a new window on app click (only if no windows are avaialble)
_electron.app.on('activate', function () {
	if (process.platform == 'darwin') {
		if (!w || w == null || _electron.BrowserWindow.getAllWindows().length === 0) {
			w = makeWindow(renderer);
		}
	}
});

// Focus the main window
_electron.ipcMain.on('keep-focus', function () {
	return w.focus();
});

// On icon click change the icon.
_electron.ipcMain.on('selected', function (ev, source) {
	var filename = source.split('/').pop();

	(0, _utils.presentLoading)(ev.sender);

	// If the icon exists prevent download
	if (_fs2.default.existsSync(_path2.default.join(__dirname, '..', 'icons', filename)) === true) {
		_electronTimber2.default.log('Icon exists!');
		return (0, _utils.setIcon)(_path2.default.join(__dirname, '..', 'icons', filename), ev.sender);
	}

	_electronTimber2.default.log('Starting download');

	// Download the icon from git repo
	(0, _electronDl.download)(_electron.BrowserWindow.getFocusedWindow(), source, {
		directory: _path2.default.join(__dirname, '..', 'icons')
	}).then(function (dl) {
		var p = dl.getSavePath();
		(0, _utils.setIcon)(p, ev.sender);
	}).catch(function (error) {
		_electronTimber2.default.error(error);

		(0, _utils.dismissLoading)(ev.sender);
	});
});

_electron.ipcMain.on('update-theme', function () {
	_electronTimber2.default.log('Theme asked');

	updateTheme();
});
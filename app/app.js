/**
 * Copyright Federico Vitale © 2018
 * 
 * Code review is appreciated :)
 * 
 */

const path = require('path');
const fs = require('fs');

const {
	join
} = path;
const {
	app,
	BrowserWindow,
	ipcMain,
	dialog,
	systemPreferences
} = require('electron');
const {
	download
} = require('electron-dl');

const Storage = require('electron-store');
const settings = new Storage();

const {
	setIcon,
	presentLoading,
	dismissLoading
} = require('./libs/utils');

const logger = require('electron-timber');

let w;


app.setName('VSCode Icons Manager');

/**
 * 
 * @name makeWindow
 * 
 * @param {String} path Page (html) path
 * 
 * @returns {Object} BrowserWindow object
 * 
 */
function makeWindow(path, windowName = 'main') {
	let win = new BrowserWindow({
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
		icon: join(__dirname, '..', 'assets', 'icon', '64x64.png')
	});

	win.loadURL('file://' + __dirname + '/' + path);

	win.once('ready-to-show', () => win.show());
	win.on('closed', () => win = null);


	require('./libs/Menu');

	return win;
}


// Renderer files folder
let renderer = 'render/index.html';

const updateTheme = () => {
	logger.log('Changing theme to', systemPreferences.isDarkMode() ? 'dark' : 'bright');
	if (w) w.webContents.send('theme changed', {
		dark: systemPreferences.isDarkMode()
	});
};

systemPreferences.subscribeNotification('AppleInterfaceThemeChangedNotification', updateTheme);

// Once app is ready
app.once('ready', () => {
	w = makeWindow(renderer);
	updateTheme();

	if (process.platform != 'darwin') {
		dialog.showErrorBox('Unsupported platform!', 'We are sorry but right now that application runs only on macOS systems.');
		return app.quit();
	}

	// Check for vscode installation
	if (!settings.has('icon-folder')) settings.set('icon-folder', '/Applications/Visual Studio Code.app/Contents/Resources/');
	if (!settings.has('app-location')) settings.set('app-location', '/Applications/Visual Studio Code.app');

	// If the app does not exists in /Applications: manually locate it. 
	if (fs.existsSync(settings.get('app-location')) == false) {
		dialog.showMessageBox(w, {
			title: 'Warning!',
			message: '"Visual Studio Code" not found in your "/Applications" folder.',
			buttons: ['Locate']
		}, () => {
			dialog.showOpenDialog(w, {
				title: 'Open App',
				message: 'Show me where is located your VSCode App',
				properties: ['openFile'],
				buttonLabel: 'That\'s it!',
				defaultPath: '/Applications',
				filters: [{
					name: 'All Files',
					extensions: ['*']
				}]
			}, newPath => {

				if (!newPath || !newPath.length) {
					return app.quit();
				}

				let iconFolder = path.join(newPath[0], 'Contents', 'Resources');

				// Do something with settings
				settings.set('app-location', newPath[0]);
				settings.set('icon-folder', iconFolder);
			});
		});
	}

});

// If all windows are closed then close the app if not on macOS
app.on('window-all-closed', () => {
	w = null;
	if (process.platform !== 'darwin') return app.quit();
});

// on macOS create a new window on app click (only if no windows are avaialble)
app.on('activate', () => {
	if (process.platform == 'darwin') {
		if (!w || w == null || BrowserWindow.getAllWindows().length === 0) {
			w = makeWindow(renderer);
		}
	}
});


// Focus the main window
ipcMain.on('keep-focus', () => w.focus());

// On icon click change the icon.
ipcMain.on('selected', (ev, source) => {
	let filename = source.split('/').pop();

	presentLoading(ev.sender);

	// If the icon exists prevent download
	if (fs.existsSync(path.join(__dirname, '..', 'icons', filename)) === true) {
		logger.log('Icon exists!');
		return setIcon(path.join(__dirname, '..', 'icons', filename), ev.sender);
	}

	logger.log('Starting download');

	// Download the icon from git repo
	download(BrowserWindow.getFocusedWindow(), source, {
		directory: path.join(__dirname, '..', 'icons')
	}).then(dl => {
		let p = dl.getSavePath();
		setIcon(p, ev.sender);
	}).catch((error) => {
		logger.error(error);

		dismissLoading(ev.sender);
	});
});

ipcMain.on('update-theme', () => {
	logger.log('Theme asked');

	updateTheme();
});
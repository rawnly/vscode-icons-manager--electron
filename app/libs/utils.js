'use strict';

var fs = require('fs');

var touch = require('touch');
var Store = require('electron-store');

var settings = new Store();

var logger = require('electron-timber');
var electron = require('electron');

function presentLoading(window) {
	if (window) window.webContents.send('present-loading');
}

function dismissLoading(window) {
	if (window) window.webContents.send('dismiss-loading');
}

module.exports.setIcon = function setIcon(iconPath, window) {
	var iconFolder = settings.get('icon-folder');
	var appLocation = settings.get('app-location');

	// Remove the current icon
	fs.unlink(iconFolder + 'Code.icns', function (error) {
		// eslint-disable-next-line
		if (error) logger.error(error);

		// Copy the new icon
		fs.copyFile(iconPath, iconFolder + 'Code.icns', function (error) {
			// eslint-disable-next-line
			if (error) return logger.error(error);

			fs.unlink(iconPath, function (error) {
				// eslint-disable-next-line
				if (error) return logger.error(error);

				// Update the finder
				// eslint-disable-next-line
				touch(appLocation, function (err) {
					if (err) logger.error(err);
				});

				window.webContents.send('notification');

				dismissLoading(window);
			});
		});
	});
};

module.exports.getIconsFrom = function getIconsFrom(pth) {
	return fs.readdirSync(pth).filter(function (item) {
		return item.includes('.icns');
	});
};

module.exports.presentLoading = presentLoading;
module.exports.dismissLoading = dismissLoading;
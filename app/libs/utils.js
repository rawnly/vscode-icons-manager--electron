const fs = require('fs');

const touch = require('touch');
const Store = require('electron-store');

const settings = new Store();

const logger = require('electron-timber');
const electron = require('electron');


function presentLoading(window) {
	if (window)
		window.webContents.send('present-loading');
}

function dismissLoading(window) {
	if (window)
		window.webContents.send('dismiss-loading');
}

module.exports.setIcon = function setIcon(iconPath, window) {
	let iconFolder = settings.get('icon-folder');
	let appLocation = settings.get('app-location');
	

	// Remove the current icon
	fs.unlink(iconFolder + 'Code.icns', error => {
		// eslint-disable-next-line
		if (error) logger.error(error);

		// Copy the new icon
		fs.copyFile(iconPath, iconFolder + 'Code.icns', error => {
			// eslint-disable-next-line
			if (error) return logger.error(error);
			
			fs.unlink(iconPath, error => {
				// eslint-disable-next-line
				if (error) return logger.error(error);

				
				// Update the finder
				// eslint-disable-next-line
				touch(appLocation, err => {
					if (err) logger.error(err);
				});

				window.webContents.send('notification');

				dismissLoading(window);
			});
		});
	});
};

module.exports.getIconsFrom = function getIconsFrom(pth) {
	return fs.readdirSync(pth).filter(item => item.includes('.icns'));
};

module.exports.presentLoading = presentLoading;
module.exports.dismissLoading = dismissLoading;

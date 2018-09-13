/* eslint-disable */

require('electron-titlebar');

const { ipcRenderer } = require('electron');

const ipc = ipcRenderer;

const overlayTitle = document.querySelector('.container.overlay h2');
const overlayLoader = document.querySelector('.container.overlay svg');
const overlay = document.querySelector('.container.overlay');

const capitalizeWord = word => word.charAt(0).toUpperCase() + word.substr(1, word.length);
const capitalizeEachWord = sentence => sentence.split(' ').map(word => capitalizeWord(word)).join(' ');

function presentLoading(message = 'Loading...')
{
	if (document.querySelector('.overlay button')) {
		document.querySelector('.overlay button').remove();
	}
    
	overlayTitle.innerHTML = message;
	overlayLoader.style.display = 'block';
	overlay.style.zIndex = 1;
    
	setTimeout(() => overlay.style.opacity = 1, 200);
}

function dismissLoading()
{
	overlay.style.opacity = 0;

	setTimeout(() => {
		overlay.style.zIndex = -1;
	}, 200);
}

function fetchIcons() {
	if (document.querySelector('.overlay button')) {
		document.querySelector('.overlay button').remove();
		overlayTitle.innerHTML = 'Loading awesome icons...';
		overlayLoader.style.display = 'block';
	}

	fetch('https://api.github.com/repositories/110824329/contents/linux')
		.then(res => res.json())
		.then(data => {
			window.customData = data;
			return data.map((icon, index) => {
				let item = document.createElement('img');
				let filename = encodeURIComponent(icon.download_url.split('/').pop().replace('.png', '.icns'));
				let url = icon.download_url.split('/');

				url.splice(url.length - 2, 2);

				url = url.join('/');

				url += `/macOS/${filename}`;

				item.setAttribute('src', icon.download_url);
				item.setAttribute('name', icon.name);
				item.setAttribute('title', capitalizeEachWord(icon.name.split('.')[0].replace(/-|_/g, ' ')));
				item.setAttribute('data-src', url);

				item.addEventListener('click', function () {
					ipc.send('selected', item.getAttribute('data-src'));
				});

				document.querySelector('.flex-container.container').appendChild(item);

				item.style.transition = 'all 200ms ease-in-out';
			});
		})
		.then(() => {
			overlay.style.opacity = 0;

			setTimeout(() => {
				overlay.style.zIndex = -1;
			}, 200);
		})
		.catch(error => {
			console.error(error);

			overlayLoader.style.display = 'none';
			overlayTitle.innerHTML = error.message;

			let b = document.createElement('button');

			b.innerHTML = 'Try Again';

			b.addEventListener('click', () => fetchIcons());

			overlay.appendChild(b);
		});
}



ipc.on('notification', () => {
	const notification = new Notification('Icon updated!', {
		body: 'VSCode icon changed successfully'
	});

	notification.onclick = function () {
		ipc.send('keep-focus');
	};
});

ipc.on('dismiss-loading', dismissLoading);
ipc.on('present-loading', () => {
	presentLoading('Loading...');
});



fetchIcons();

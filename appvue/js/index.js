/* eslint-disable */

require('electron-titlebar');

const { ipcRenderer : ipc } = require('electron');
// const ipc = ipcRenderer;


const capitalizeWord = word => word.charAt(0).toUpperCase() + word.substr(1, word.length);
const capitalizeEachWord = sentence => sentence.split(' ').map(word => capitalizeWord(word)).join(' ');

const $vm = new Vue({
    el: '#app',
    data: {
        query: null,
        loading: {
            error: false,
            message: 'Loading awesome icons...',
            isLoading: true
        },
        icons: {
            remote: [],
            filtered: [],
            local: []
        }
    },
    mounted: async function() {
        this.presentLoading('Loading awesome icons...');

        try {
            await this.fetchIcons();
            this.dismissLoading();
        } catch (error) {
            this.showError(error);
        }
    },
    methods: {
        setIcon(url) {
            if ( url )
                ipc.send('selected', url)
        },
        showError(error) {
            this.loading.error = true;
            this.loading.isLoading = false;
            this.loading.message = error.message;

            console.log(error.message)
        },
        search() {
            this.icons.filtered = this.icons.remote.filter(item => {
                const re = new RegExp(`${this.query.toLowerCase()}`, 'g')
                return re.test(item.title.toLowerCase())
            })
        },
        async fetchIcons() {
            const response = await fetch('https://api.github.com/repositories/110824329/contents/linux')
            const data = await response.json();

            this.icons.remote = data.map((icon, index) => {
                let filename = encodeURIComponent(icon.download_url.split('/').pop().replace('.png', '.icns'));
                let url = icon.download_url.split('/');

                url.splice(url.length - 2, 2);

                url = url.join('/');

                url += `/macOS/${filename}`;

                return {
                    name: icon.name,
                    title: capitalizeEachWord(icon.name.split('.')[0].replace(/-|_/g, ' ')),
                    image: icon.download_url,
                    download: url
                }
            });

            this.icons.filtered = this.icons.remote;

            this.dismissLoading();
        },
        presentLoading(message) {
            this.isLoading = true;

            if (message) this.loading.message = message;

            let overlay = this.$refs.loadingContainer

            overlay.style.opacity = 1;
            setTimeout(() => overlay.style.zIndex = 9999, 200);
        },
        dismissLoading() {
            this.isLoading = false;
            this.loading.message = 'Loading awesome icons...';

            let overlay = this.$refs.loadingContainer

            overlay.style.opacity = 0;
            setTimeout(() => overlay.style.zIndex = -1, 200);
        },
        notify(title, body, onClick) {
            const notification = new Notification(title, { body });
            notification.onclick = onClick;
        }
    }
})


// IPC
ipc.on('notification', () => {
    $vm.notify('Icon updated!', 'Your VSCode icons has been updated!', () => ipc.send('keep-focus'));
});

ipc.on('dismiss-loading', $vm.dismissLoading);

ipc.on('present-loading', () => {
    $vm.presentLoading('Loading...');
});
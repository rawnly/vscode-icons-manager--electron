# VSCode Icons - Desktop App
> Currently Work in Progress

<p align="center">
    <img src="https://user-images.githubusercontent.com/16429579/45490907-9fc88300-b768-11e8-9a4c-96c2e6576c83.png" alt="cover">
</p>

This project has born from the necessity of a desktop app that helps you manage **[@dhanishgajjar][dhanish]** custom [vscode icons][icons].

# Run
As we don't actually have a build phase you need to run this app via electron.

- Clone this repo 
- Install all dependencies via "npm" or "yarn"
- Run via "npm start" or "yarn start"

# Known issues
- After download you need to `cmd + click` on the dock icon to update it.
- If the icon has been downloaded in the past the loading screen and the notification doesn't appear on screen. (NOTE: This has been temporally fixed by deleting it after download.)

# Contribute
Contributors are always welcome! To ensure that your PR will be merged please follow the code-style

## TODO before release 
- [ ] App icon
- [ ] Implement hiddenInset titlebar style
- [ ] Impelment tests

- [ ] Better UI / UX
- [ ] Make it universal, right now it works only on macOS systems.

- [ ] Add local icons
- [ ] Add settings
- [ ] Add an "history panel" or something similar
- [ ] Help menu items that refers to [vscode-icons repo][icons] and this repo
- [ ] Custom "About" panel with credits

- [ ] Implement build
- [ ] Automatization of icon update... Right now after the app changes the file you need to "cmd+click" on the dock icon or restart to update the icon in the dock.

# Related

- [vscode-icons][icons] is a project by **[@dhanishgajjar][dhanish]**


<p align="center">
  <a href="https://paypal.me/rawnly/1">
      <img src="https://img.shields.io/badge/donate-paypal-blue.svg?longCache=true&style=for-the-badge&colorA=34495e&colorB=1abc9c" alt="Donate"/>
    </a>
</p>


[dhanish]: https://github.com/dhanishgajjar/
[icons]: https://github.com/dhanishgajjar/vscode-icons
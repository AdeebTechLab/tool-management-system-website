# Orbit

Orbit is a lightweight, responsive project board built with plain HTML, CSS, and JavaScript. It uses the native HTML5 drag-and-drop API and stores boards, lists, cards, and card details in your browser's LocalStorage.

## Run it

Install Node.js, then run `npm install` and `npm run dev` in this folder and open the URL printed in the terminal. The server uses port 3000 by default and automatically tries the next available port (up to 3100) if 3000 is already in use. Set `PORT` to choose a specific port. You can also run `npm start`. The app uses Vite to bundle its JavaScript for production deployment.

## Demo data

On first launch, Orbit loads three example boards: Website Redesign, Mobile App Launch, and Exam Preparation. Each includes three lists and six sample cards. After the first save, the app uses your LocalStorage data instead of resetting to the demo set. Use the board menu to export or import a board as JSON.

Some demo cards include photo covers. Open any card and paste an HTTP or HTTPS image URL under **Card picture** to add or change its cover; remove it from the same section. Remote images need an internet connection to load.

Data stays in the current browser profile. Clearing site data removes it.

DSC Web Client (React)
-----------------------

This is a minimal React/Vite scaffold to begin porting the legacy Java front-end.

Commands:

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`

Status: I created initial page stubs and copied a trimmed `main.css` and a placeholder `calendar.js` into `public/assets/`.

Note: `npm` was not available in the automation environment (zsh: command not found). Run the install locally:

```bash
cd src/DSC.WebClient
npm install
npm run dev
```

Next steps:
- Copy full static assets from the legacy `WebContent` into `src/DSC.WebClient/public` (css, js, html includes, images).
- Implement client API services to call `DSC.Api` endpoints and replace server-side JSP logic with React + API.


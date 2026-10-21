# ShravChat

A Vercel-ready messaging UI with text, GIF, sticker and image messages.

## Important deployment note

The included `api/store.js` uses an in-process fallback store. Vercel serverless instances are not a persistent shared database, so this fallback is for development only.

For a real multi-user deployment, connect `api/store.js` to a persistent database/KV service.

## Run

```bash
npm install
npm run dev
```

Or deploy the repository to Vercel.

## IP addresses

ShravChat records the public source IP seen by the server when a user registers. The IP is used for discovery and is not shown to the other user.

Do not treat an IP address as a secure identity. A production version should use an authenticated account/device identity and use IP only as optional discovery.

## Features

- Add chats by IP
- Rename chats locally
- Text
- GIF URL messages
- Sticker messages
- Image messages
- Responsive UI
- Vercel API routes

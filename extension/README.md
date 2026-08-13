# SendTheSong browser extension

This Manifest V3 extension is the lightweight entry point for SendTheSong. It stores an unfinished local draft only when the user opts in, then sends a one-time temporary draft to `https://sendthesong.io` and opens the website to continue creating a song.

## Development

```bash
cd extension
pnpm exec tsc -p tsconfig.json
```

Load `extension/` as an unpacked extension during development. For a distributable package, run `pnpm build` from this directory; it emits `extension/dist/`.

## Store packages

- Chrome and Opera: zip the contents of `dist/`.
- Firefox: zip the contents of `dist/`, preserving `browser_specific_settings.gecko` from `manifest.json`.

The extension deliberately requests only `storage` and host access to the official SendTheSong domain. It has no content scripts, browsing-history access, password collection, payment flow, or automated posting behavior.

## Production configuration

Before publishing, set `EXTENSION_ALLOWED_ORIGINS` on the website to a comma-separated allowlist containing the final Chrome and Opera extension origins (for example `chrome-extension://<store-id>`). Firefox assigns its `moz-extension://` origin at install time, so that scheme is accepted by this public, rate-limited draft-creation endpoint. The draft API otherwise accepts requests only from the SendTheSong website itself.

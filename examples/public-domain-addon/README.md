# OpenBooks — Public-Domain Reference Add-on

This **local, dependency-free Node.js example** demonstrates the proposed `resource` add-on contract without hosting any books.

The connector returns a Project Gutenberg EPUB listing for **Pride and Prejudice** by **Jane Austen** (English only). Project Gutenberg identifies the title as public domain **in the United States**. Determine applicability of local laws before accessing/downloading in other jurisdictions.

Source page: https://www.gutenberg.org/ebooks/1342

## Run locally

Requires a current supported Node.js version.

```sh
node examples/public-domain-addon/server.mjs
```

Endpoints (local development only):
- `GET http://127.0.0.1:8787/manifest.json`
- `POST http://127.0.0.1:8787/resource`

Try:

```sh
curl -X POST http://127.0.0.1:8787/resource \
  -H 'Content-Type: application/json' \
  -d '{"work":{"title":"Pride and Prejudice","authors":["Jane Austen"]},"edition":{"language":"en"},"preferredFormats":["epub"]}'
```

For other titles, authors, languages or unsupported formats, it returns `{"resources":[]}`.

## Scope and caveats

- This is **not a crawler, search engine, torrent index, hosted add-on or a running OpenBooks integration**.
- Source and EPUB URL are supplied by the Project Gutenberg website. This example does not mirror its files.
- It deliberately does **not** claim to identify a specific edition or translation.
- The test server binds to loopback and uses plain HTTP. The OpenBooks production client is designed for HTTPS and will not automatically permit loopback addresses; use an explicitly controlled development/test mode for local integration.
- This minimal example limits request size; it does not itself provide production authentication, rate limiting, TLS, or complete security controls.
- Protocol details remain provisional until POC conformance tests.

See [Add-on Protocol](../../docs/ADDON_PROTOCOL.md).

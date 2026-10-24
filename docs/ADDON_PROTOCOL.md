# OpenBooks — Add-on Protocol

**Version:** 1.0 (draft contract for POC)  
**Status:** Product direction approved; wire schema remains provisional pending conformance testing  
**Companion documents:** [PRD](./PRD.md) · [Technical Architecture](./ARCHITECTURE.md)

## 1. Purpose and boundaries

OpenBooks ships with a **native book catalog**, metadata and edition details, and a native commercial discovery layer for purchasing, subscriptions and lending availability **when supported by reliable providers**. Users do not need an add-on to search for books, read imported files or manage their library.

Community **reading-source add-ons** are optional. An add-on receives the selected book's bibliographic identity and returns possible reading resources. It must not be required to deliver the core catalog, bibliographic metadata or store/subscription discovery.

This protocol is inspired by the extensibility of Stremio/Nuvio but **is not Stremio-compatible**.

## 2. MVP capability

The initial add-on capability is `resource` only.

The host:
1. Fetches and validates a manifest from a user-supplied HTTPS URL.
2. Shows declared identity, origin, resource support and destinations for user approval.
3. Uses the Rust Addon Engine to send a bounded request for the selected work/edition.
4. Validates and normalizes responses.
5. Presents results with source attribution and edition/language distinctions.
6. Offers compatible reading/import actions only for resources the user is authorized to access.

Do **not** execute arbitrary downloaded JavaScript, Rust or platform code.

## 3. Manifest

Recommended address: `https://source.example/manifest.json`.

```json
{
  "id": "org.example.books",
  "name": "Example Book Source",
  "version": "1.0.0",
  "protocolVersion": "1.0",
  "description": "Example authorized reading source",
  "resources": ["resource"],
  "formats": ["epub", "pdf"],
  "endpoints": {
    "resource": "/resource"
  }
}
```

| Field | MVP expectation |
| --- | --- |
| `id` | Required, stable, unique reverse-domain-style identifier |
| `name` | Required display name |
| `version` | Required add-on SemVer |
| `protocolVersion` | Required protocol major.minor version |
| `description` | Optional human-readable description |
| `resources` | Required array containing `resource` |
| `formats` | Optional declared file formats |
| `endpoints.resource` | Required path; resolved against validated manifest origin |

An add-on must not acquire privileged device permissions simply by declaring them. Future manifest versions may specify domains or authentication capabilities subject to user consent and host policy.

## 4. Reading-source request

**Method:** `POST`  
**URL:** the manifest's validated `endpoints.resource` path  
**Headers:** `Content-Type: application/json`, `Accept: application/json`.

```json
{
  "work": {
    "title": "Pride and Prejudice",
    "authors": ["Jane Austen"],
    "identifiers": {
      "openLibrary": "OL66554W"
    }
  },
  "edition": {
    "language": "en",
    "isbn13": null
  },
  "preferredFormats": ["epub", "pdf"]
}
```

`work.title` is required. Other fields may be omitted or null where unknown; `edition` is optional. Identifiers must be namespaced to prevent collisions. Metadata is descriptive, **not** conclusive evidence that two editions match. The host must not include user reading history, notes or credentials by default.

The reference implementation does not rely on an Open Library ID; it matches the demonstrated work's title and author and marks its edition match as unverified.

## 5. Reading-source response

```json
{
  "resources": [
    {
      "id": "gutenberg-1342-epub",
      "name": "Project Gutenberg — EPUB3",
      "format": "epub",
      "language": "en",
      "delivery": "direct",
      "url": "https://www.gutenberg.org/ebooks/1342.epub3.images",
      "rights": {
        "status": "public_domain",
        "territory": "US",
        "note": "Provider identifies the work as public domain in the USA."
      },
      "match": {
        "scope": "work",
        "editionVerified": false
      }
    }
  ]
}
```

Required per resource: `id`, `name`, `delivery`, `url`; `format` is required for direct downloadable files. `language`, `rights`, and `match` should be provided when known. Empty results use `{"resources":[]}`.

Initial delivery values:

- `direct`: direct access to an authorized, compatible file for reading or import.
- `external`: open the authorized provider page in a safe external browser.
- `import`: an explicitly authorized file import flow; its distinction from `direct` will be refined in the POC.

The rights object is **source-declared and not legal verification**. A territorial statement is not worldwide authorization. The host must validate the destination, resource type, content size, and access conditions independently before opening or importing.

`match.scope` can be `work` or `edition`. `editionVerified: false` must not be displayed as a confirmed edition match.

## 6. Native services, not add-ons

- **Catalog Engine:** native query and cache adapters for authorized bibliographic providers, with work/edition matching.
- **Commercial Discovery Engine:** native provider adapters for retailer, subscription or lending information.
- **Reader:** EPUB/PDF rendering, offline use and local progress.
- **Library:** imported files, reading state, lists and annotations.

Commercial availability must use evidence specific to the **edition and region**, including provider and freshness where possible. A generic provider search link is labeled **Search this service**, not **Available here**. No Kindle Unlimited or Skeelo availability should be invented or inferred merely from brand presence.

## 7. Safety and privacy

The Rust Addon Engine must enforce HTTPS by default, TLS validation, bounded time and payload size, redirect controls, JSON schema validation, concurrency limits, and origin/domain policy. Resolve and check remote destinations to mitigate SSRF, private/loopback access and DNS rebinding, including redirect targets.

Do not blindly pass source URLs to privileged commands or an in-app WebView. Credentials are opt-in per authorized service and never automatically forwarded to an unrelated add-on. Connector failure must never interrupt local reading or delete library data.

An externally hosted add-on does not automatically remove legal obligations involving copyright, platform policies and third-party terms. App Store compatibility requires validation of the actual application behavior and content accessible through it.

## 8. Failure behavior and compatibility

- `200`: valid JSON response (including empty `resources`).
- `400`: malformed request.
- `405`: unsupported method.
- `413`: oversized request.
- `429`: provider rate limit, if applicable.
- `5xx`: provider unavailable.

The client should time out unresponsive sources, report per-add-on errors, and preserve results from other sources. Version add-ons separately from the protocol; incompatible protocol major versions must fail clearly. Retry, cache lifetime, pagination, authentication, media types and strict JSON Schema will be finalized through the POC and automated conformance tests.

## 9. POC acceptance criteria

- [ ] Install a valid manifest by URL.
- [ ] Identify and validate source and protocol version.
- [ ] Send a `resource` request based on native catalog metadata.
- [ ] Parse one response with known language/format and unverified edition match.
- [ ] Open or import a legally accessible public-domain EPUB.
- [ ] Continue reading offline after import and add-on removal.
- [ ] Reject malformed JSON, unexpected URLs, disallowed network destinations and excess payload sizes.
- [ ] Verify timeouts and per-add-on failure isolation.
- [ ] Validate behavior on desktop and mobile, particularly iOS.

See [the public-domain reference add-on](../examples/public-domain-addon/README.md). The example is a **test fixture**, not a hosted service or production-ready content index.

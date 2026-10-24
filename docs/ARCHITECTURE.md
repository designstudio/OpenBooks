# OpenBooks — Technical Architecture

**Version:** 1.0 (approved architecture direction)  
**Status:** Approved for technical proof of concept; implementation details subject to validation  
**Project:** Design Studio / OpenBooks  
**Related document:** [Product Requirements Document](./PRD.md)  
**Target platforms:** Windows, macOS, Linux, iOS, Android  
**Date:** October 2026

> This document records an architectural direction, not a claim that the application has already been implemented or validated on all platforms.

## 1. Overview and principles

OpenBooks is a free, open-source, local-first digital reading platform with a community add-on ecosystem, inspired by Stremio and Nuvio.

The selected direction is **Rust + Tauri 2 + React + TypeScript**. The goal is one shared native core and a consistent user interface across five platforms, without a mandatory central backend.

Guiding principles:

1. Share a Rust core across target platforms.
2. Maintain full basic reading and library functionality offline.
3. Connect to external add-ons using declarative HTTP/JSON contracts, rather than executing downloaded arbitrary code.
4. Keep users' library and reading state independent from add-on availability.
5. Isolate replaceable components, particularly the EPUB renderer and storage adapters.

## 2. High-level architecture

```text
                  OpenBooks UI
             React + TypeScript + Vite
                        |
               Typed Tauri commands
                 and async events
                        |
                  Rust Core
       +----------------+----------------+
       | Library  | Catalog  | Add-on     |
       | Files    | Storage  | Sync*      |
       +----------------+----------------+
                  Tauri 2
       Windows | macOS | Linux | iOS | Android
                        |
        Local SQLite + private book files
                        |
      Optional remote add-ons and integrations

* Sync is planned for a later phase.
```

**Platform validation:** Tauri 2 targets desktop and mobile, but functionality and plugin support must be tested in real iOS and Android builds. A Mac with Xcode is required for native iOS builds.

## 3. Technology responsibilities

| Layer | Initial technology | Responsibility |
| --- | --- | --- |
| Native domain and services | Rust | Library logic, file import, caching, metadata, add-on requests and security |
| Application shell | Tauri 2 | Packaging, permissions, native integrations and Rust/frontend bridge |
| User interface | React + TypeScript | Navigation, components and reader UI |
| Frontend tooling | Vite | Bundling and development workflow |
| Persistence | SQLite | Works, editions, library entries, reading state and annotations |
| EPUB rendering | EPUB.js (candidate) | Pagination, navigation and text presentation |
| PDF rendering | PDF.js (candidate) | Fixed-layout PDF viewing |
| Add-on protocol | HTTP + JSON | External declarative source integrations |

Rust will **not** replace the book-rendering engine: text layout, selection, and page appearance belong to the appropriate reader component. Technology choices marked as candidates require proof-of-concept verification.

## 4. Proposed repository structure

Use a monorepo with **Cargo workspaces** for Rust and **pnpm workspaces** for TypeScript.

```text
OpenBooks/
├── apps/
│   ├── desktop/              # Desktop Tauri entry/config
│   └── mobile/               # Mobile-specific integration/config
├── packages/
│   ├── ui/                   # React components and design system
│   ├── reader/               # EPUB/PDF renderer adapters
│   └── types/                # Shared/generated TypeScript types
├── crates/
│   ├── openbooks-core/       # Domain types and rules
│   ├── openbooks-library/    # Personal library and progress
│   ├── openbooks-addons/     # Manifest and remote connectors
│   ├── openbooks-catalog/    # Metadata and search
│   ├── openbooks-storage/    # SQLite and migrations
│   └── openbooks-files/      # Import and local files
├── docs/
│   ├── PRD.md
│   └── ARCHITECTURE.md
└── examples/                 # Example add-ons
```

This is a **target layout**, not a mandate to create every module immediately. Begin with the application, core, add-ons and storage; extract other modules as interfaces stabilize. Desktop/mobile entry points may be consolidated according to Tauri's actual project layout to avoid duplicated configuration.

## 5. React-to-Rust communication

Frontend components will not directly access SQLite or arbitrary local filesystem paths. They will call deliberately exposed, typed Tauri commands.

Illustrative TypeScript:

```ts
import { invoke } from "@tauri-apps/api/core";

interface Book {
  id: string;
  title: string;
  authors: string[];
}

export async function getLibrary(): Promise<Book[]> {
  return invoke<Book[]>("library_list");
}
```

The Rust handler delegates to the library service and returns serialized data. Long operations (imports, multi-source queries) should be asynchronous and report progress through events, with cancellation where appropriate.

Generate TypeScript contracts from Rust definitions where feasible to prevent drift. Commands and Tauri capabilities must be minimized and explicitly scoped by platform.

## 6. Domain and data model

**A literary work is not an edition, and an edition is not a file.**

For example, the same novel may have several translations, printings, ISBNs, and EPUB files.

Initial entities:

| Entity | Purpose |
| --- | --- |
| `works` | Literary works |
| `editions` | Publications, translations and editions |
| `authors` | Authors and contributors |
| `identifiers` | ISBN and provider identifiers |
| `library_entries` | Books saved by the user |
| `book_files` | Imported local resources |
| `reading_sessions` | Reading activity history |
| `reading_positions` | Current location associated with a file/edition |
| `annotations` | Highlights, notes and bookmarks |
| `collections` | Custom shelves/lists |
| `addons` | Installed connectors |
| `source_records` | References to external provider records |

Use versioned SQLite migrations, foreign keys, transactions, and tests for schema upgrades and rollback behavior.

Book files belong in application-managed private file storage, not as SQLite blobs by default. Imported files receive internal identifiers and cryptographic hashes for duplicate detection. Cache images separately.

Where supported, EPUB reading positions should use a stable locator such as EPUB CFI and remain associated with the specific rendition/file. Never assume locations can be mapped losslessly between different editions. Local library records must survive removal or downtime of any connector.

## 7. Add-on engine and protocol boundary

The Rust **Addon Engine** mediates third-party communication. Add-ons provide data through remote HTTP/JSON services and do not inject arbitrary code into the application.

Proposed flow:

1. User provides a manifest URL.
2. Rust validates the URL, response, protocol version and declared capabilities.
3. UI displays the add-on's stated developer, capabilities, contacted domains and relevant permissions.
4. User authorizes installation.
5. Rust performs bounded external requests.
6. Responses are schema-validated and normalized before reaching the UI.

Proposed initial resources:

- **`catalog`:** Lists and search results.
- **`meta`:** Works, editions and bibliographic details.
- **`availability`:** External access options and authorized readable resources, including format and language where available.

The exact manifest schema, endpoint layout, identifiers, pagination, optional authentication and error contracts belong in a separate `ADDON_PROTOCOL.md` specification.

### Security invariants

- HTTPS by default; verify TLS certificates.
- Explicitly constrain allowed URL schemes and redirects.
- Apply request timeouts, payload limits, concurrency limits, and response validation.
- Prevent requests to loopback, private, link-local, and other sensitive endpoints, including checks after DNS resolution and redirects; consider DNS rebinding and SSRF threats.
- Never blindly pass add-on URLs to privileged native commands, system openers or filesystem operations.
- Keep service credentials isolated and avoid automatically forwarding them to third parties.
- Show remote domain access and allow add-ons to be removed or disabled.
- Isolate connector errors so a failed remote source cannot interrupt local reading.
- Restrict Tauri command access through explicitly configured capabilities.
- Do not silently download and execute arbitrary plug-in code.

An open add-on ecosystem does not automatically eliminate copyright, third-party service-terms or app-store responsibilities. Distribution and complaint-handling policies need independent review before release.

## 8. Reader subsystem

Implement a **reader adapter interface** separate from core storage so the rendering engine can change without rewriting the library.

Proposed operations:

| Operation | Purpose |
| --- | --- |
| `openBook` | Open supported local resource |
| `goToLocation` | Navigate to a saved locator |
| `getPosition` | Read current progress |
| `setAppearance` | Update theme, typography and layout |
| `getTableOfContents` | Navigate chapters |
| `searchText` | Search book text where supported |
| `addHighlight` | Create a text highlight |
| `addBookmark` | Save a location |

Start the prototype with EPUB.js and compare alternatives only if tests reveal shortcomings in pagination, annotations, performance or accessibility. PDF.js is the initial candidate for fixed-layout PDFs.

Saving a locally imported, authorized resource should not make subsequent offline reading depend on the original add-on.

## 9. Offline operation and future synchronization

Offline capabilities must include:

- Reading already imported compatible files.
- Opening the personal library and collections.
- Viewing and editing locally stored reading progress and annotations.

Synchronization is optional and deferred beyond MVP. Candidate providers include Google Drive, iCloud and WebDAV.

Use versioned changes and explicit conflict resolution. Do not assume the furthest reading position wins: readers may deliberately return to earlier chapters. Syncing metadata and progress should be separable from syncing EPUB/PDF bytes.

## 10. Native platform adapters

Expose a stable interface to the UI while implementing platform-specific operations as needed.

| Capability | Proposed implementation |
| --- | --- |
| File import | Native file picker |
| EPUB/PDF sharing | Native system share sheet / equivalent |
| External links | Safe external opener |
| Book storage | App-private directories |
| Credentials | Platform-secure storage |
| Updates | Distribution-channel-appropriate mechanism |
| Notifications | Optional native integration |

Tauri plugins may differ in availability and behavior between desktop and mobile. Validate supported APIs for each target during the POC.

**Kindle:** Initially pass a compatible local file to a supported native sharing/Send to Kindle flow. File transfer does not imply two-way Amazon library integration or Kindle progress synchronization.

## 11. Engineering standards

| Area | Proposed tools |
| --- | --- |
| Rust formatting and linting | rustfmt + Clippy |
| TypeScript quality | ESLint + Prettier |
| Rust unit tests | cargo test |
| UI tests | Vitest + Testing Library |
| Integration tests | Real Tauri workflows |
| Type contracts | Generated types plus runtime input validation |
| Versioning | SemVer for app and add-on protocol |
| CI | GitHub Actions |
| Dependencies | Security and license checks |

Prioritize migration tests, malformed or huge EPUBs, failed network calls, add-on isolation, and durable reading positions.

Never write book text, notes, tokens or other sensitive data into diagnostic logs.

## 12. Performance validation

Do not promise unmeasured performance targets. Establish platform-specific baselines for:

- Application startup time and memory use.
- Time to open EPUB and navigate pages.
- Library search latency.
- Large-library responsiveness.
- Behavior under slow or failing add-ons.

Use synthetic collections of approximately **1,000, 5,000 and 10,000 books**, plus unusually large and malformed resources. Measure on representative desktop and mobile hardware.

## 13. Proof of concept (POC 01)

The first build is deliberately small and focused on architecture rather than visual polish.

- [ ] Bootstrap Rust + Tauri 2 + React.
- [ ] Create SQLite database with an initial migration.
- [ ] Import an EPUB, open it and persist its reading position.
- [ ] Install and query one authorized example add-on by URL.
- [ ] Confirm reading works offline after restarting.
- [ ] Share a compatible EPUB through a native platform flow.
- [ ] Validate relevant flows in real iOS and Android builds.

**Exit condition:** Demonstrate end-to-end operation and record any platform differences. Native iOS testing requires macOS/Xcode even if most development happens on Windows.

## 14. Decisions and open questions

| Decision | Status |
| --- | --- |
| Rust for shared core | Approved |
| Tauri 2 targeting five platforms | Approved direction; POC required |
| React + TypeScript | Approved |
| No mandatory backend | Approved |
| Local-first architecture | Approved |
| Declarative HTTP/JSON add-ons | Approved direction; protocol TBD |
| SQLite | Recommended; test in POC |
| EPUB.js | Candidate; test in POC |
| PDF.js | Candidate; test in POC |
| Optional synchronization | Planned; provider/format TBD |
| Open-source license | Open |
| Final repository layout | Open until bootstrap |
| App Store distribution | Requires policy and implementation review |
| Platform update mechanisms | Open |

## 15. Implementation sequence

1. Bootstrap a minimal Tauri app and typed Rust/React communication.
2. Add local SQLite storage and file import.
3. Integrate the EPUB reader and durable reading position.
4. Define the initial add-on protocol and build an authorized example connector.
5. Validate native desktop and mobile behavior before expanding the feature set.

**Conclusion:** OpenBooks will use a shared Rust core, a modern React interface and a constrained, independent add-on ecosystem. Early risk reduction should focus on cross-platform EPUB reading, local persistence, mobile integration and safe remote connector behavior, rather than prematurely polishing the UI.

# OpenBooks — Product Requirements Document (PRD)

**Version:** 1.0 (initial approved baseline)  
**Status:** Approved for initial planning; technical decisions remain open  
**Project:** Design Studio / OpenBooks  
**Repository:** https://github.com/designstudio/OpenBooks  
**Target platforms:** Windows, macOS, Linux, iOS, and Android

> This document is a product baseline, not a final technical specification. Features, integrations, legal requirements, and release plans will be validated during implementation.

---

## 1. Product overview

**OpenBooks** is a free, cross-platform, open-source application for discovering, organizing, and reading digital books.

Inspired by Stremio and Nuvio, OpenBooks aims to combine a comprehensive e-book reader with a community-developed add-on ecosystem in one unified experience.

OpenBooks is **not a book distributor**. Its purpose is to provide infrastructure to query catalogs, connect external libraries and services, manage personal collections, and access resources from independent sources, subject to applicable rights and permissions.

**Core proposition:** One application to discover, organize, and read books, with the freedom to choose your own sources and services.

## 2. Goals

### 2.1 Primary goal

Build an open digital-reading platform that reduces fragmentation across e-book applications, digital libraries, review services, and reading devices.

### 2.2 Specific goals

- Deliver a modern book discovery and reading experience.
- Support add-ons developed by independent community contributors.
- Provide integrated EPUB and PDF reading.
- Centralize books, lists, favorites, and reading history.
- Offer authorized integrations with external catalog and review services.
- Make it easier to send compatible files to Kindle.
- Work without requiring an account or subscription.
- Prioritize local storage, privacy, and offline reading.
- Share most product functionality across five operating systems.
- Encourage independent contributions through open documentation.

## 3. Target audience

- **Casual readers:** People looking for books and a straightforward reading experience.
- **Frequent readers:** People tracking multiple books, authors, series, reviews, and goals.
- **E-reader owners:** Users of Kindle and other devices who want to manage their files and libraries.
- **Digital-library users:** People with personal collections, Calibre servers, or access to external catalogs.
- **Developers:** Contributors who want to build add-ons, connect services, or improve the application.

## 4. Product principles

### 4.1 Open source

Source code will be publicly available and open to community contributions. The project license must be chosen before source-code distribution, considering dependency licenses and the intended contribution model.

### 4.2 Add-on first

Extensibility is a foundational architectural requirement, not an afterthought. The core application must work without add-ons while allowing sources and services to be added through the protocol.

### 4.3 Local first

Imported files, annotations, and reading progress must remain accessible locally. Synchronization is optional.

### 4.4 Privacy first

OpenBooks must not require registration or collect unnecessary personal information.

### 4.5 Cross-platform

Provide a consistent experience across desktop and mobile while respecting platform-specific capabilities.

### 4.6 Content neutrality

OpenBooks will not host or distribute its own catalog of copyrighted commercial books. It may connect to external services and open authorized files while respecting licenses, permissions, and applicable terms.

## 5. Core features

### 5.1 Book discovery — Essential

Users can search by title, author, and available identifiers such as ISBN.

Requirements:
- Universal search with typeahead suggestions.
- Covers, titles, authors, and descriptions.
- Series identification and ordering.
- Language, genre, and format filters.
- Identification of editions and translations.
- Related-book discovery.
- Aggregated results from catalogs and installed add-ons.

Discovery must work without third-party community add-ons through authorized metadata providers.

### 5.2 Book details — Essential

A unified book detail page contains, when available:
- Cover; localized and original titles.
- Author(s) and synopsis.
- Genres, language, and publication date.
- Publisher, edition, and ISBN or other identifiers.
- Series and series position.
- Reviews and ratings.
- Reading sources and connected services.
- Save-to-library and start-reading actions.

**Data-model requirement:** Distinguish a literary **work** from its **editions**, translations, and individual files.

### 5.3 Add-on system — Essential; key differentiator

Users can install independently developed connectors through an open protocol.

**Planned add-on capabilities:**
- **Catalog:** Lists, collections, and searchable book indexes.
- **Metadata:** Bibliographic information, covers, and descriptions.
- **Reading availability:** External, authorized access options and resources.
- **Libraries:** OPDS, Calibre, and comparable services.
- **Social:** Reviews, reading lists, and progress where supported.
- **Services:** Additional integrations, exports, and discovery features.

**Installation:** Users may add an add-on via a manifest URL. Before activation, show its name, description, declared developer, version, features, permissions, and contacted domains.

**Management:** Install, remove, enable, disable, inspect, and refresh add-ons. Explain failures clearly; a broken connector must never crash the app or make the local library unavailable.

**Protocol:** Prefer documented HTTP/JSON requests and responses, with public examples and developer documentation. Arbitrary execution of downloaded remote code is **not** an initial requirement, particularly on iOS.

The add-on architecture does not exempt the platform from copyright, service-terms, privacy, or app-store requirements.

### 5.4 Integrated e-book reader — Essential

Initial focus: compatible DRM-free EPUB, with PDF support.

Requirements:
- Open compatible EPUB and PDF files.
- Offline reading.
- Light, dark, and sepia themes.
- Font, font size, margins, and line spacing controls (where the format permits).
- Chapter navigation and navigable table of contents.
- Reading progress and last-position recovery.
- Bookmarks, highlights, and notes.
- In-book search where supported.
- Distraction-free/full-screen reading.

**Later candidates:** Text-to-speech, dictionaries and translation, additional formats, reading-time statistics, and advanced accessibility controls.

Reader state must remain available without a network connection.

### 5.5 Personal library — Essential

Books can be saved to the library even if no readable file is currently available.

**Reading states:** Want to Read; Reading; Read; Did Not Finish.

Requirements:
- Add/remove books and import local files.
- Custom collections and favorites.
- Filtering, sorting, and reading history.
- Start and finish dates; progress tracking.
- Personal ratings.
- Offline-availability indicators.
- Preservation of library data after add-on removal.

Library records are modeled around works and editions, rather than only file paths.

### 5.6 Book-platform integrations — Phase 2

Candidate services: Open Library, Google Books, Goodreads, Skoob, StoryGraph, and Hardcover.

Potential functionality:
- Fetch bibliographic data and public ratings.
- Import lists where supported.
- Export reading history.
- Sync statuses and ratings with user authorization.

Each integration depends on a verified, authorized interface such as a supported official API or permitted data-import/export mechanism. **No integration is committed until feasibility is verified.**

### 5.7 Kindle integration — File sending essential; other capabilities later

Initial flow:
1. Select a locally accessible, compatible EPUB or PDF.
2. Invoke the platform's native sharing workflow.
3. Hand off to Kindle or an official supported Send to Kindle workflow.
4. Explain compatibility requirements and any limitations.

Constraints:
- Sending a file is not two-way synchronization.
- DRM-protected books may not be transferable.
- Direct Kindle Unlimited library access is not assumed.
- Kindle reading progress is not synchronized without a verified supported integration.

### 5.8 Subscription and lending services — Future research

Potential services include Kindle Unlimited, Skeelo, and other subscription or library-lending platforms.

Potential integration, when authorized: Show availability, open the book in its original service, send users to a borrowing or reading flow, or import library data where supported.

A subscription does not automatically grant permission to export or open protected content in OpenBooks.

### 5.9 Optional synchronization — Phase 2

Candidate synchronization targets: Google Drive, iCloud, WebDAV, and other storage providers.

Potential synchronized data:
- Library and reading states.
- Reading progress and collections.
- Favorites, annotations, and preferences.
- Add-on configuration where appropriate.

Principles:
- No account required for offline use.
- Explicit conflict handling to prevent data loss.
- Book-file synchronization can be separate from metadata and reading-state synchronization.
- Users retain control over where data is stored.

## 6. Platforms and distribution

| Platform | Planned experience |
| --- | --- |
| Windows | Desktop application |
| macOS | Desktop application |
| Linux | Desktop application |
| iOS | Mobile application |
| Android | Mobile application |

A web app or installable PWA may be provided as well.

Shared components and business logic should be prioritized, with platform-specific adapters for storage, filesystem access, sharing, and distribution.

A simultaneous first release on all five platforms is **not** required. Platform feasibility, particularly iOS, should be validated early.

## 7. User experience

### 7.1 Main navigation

- **Home:** Continue reading, recent activity, discoveries.
- **Explore:** Search, catalogs, genres, recommendations.
- **Library:** Saved books and personal collections.
- **Add-ons:** Install and manage connectors.
- **Settings:** Reader options, synchronization, privacy, preferences.

### 7.2 Design guidelines

- Clean, modern interface with book covers at the center.
- Streaming-platform-inspired discovery, adapted to books.
- Minimal steps between finding a book and reading it.
- Responsive layouts, light/dark modes, touch/mouse/keyboard navigation.
- Accessibility and actionable error feedback.
- Internationalization from the outset, starting with Brazilian Portuguese and English.

### 7.3 Primary user journey

1. Open OpenBooks and search for a title.
2. Review its details and editions.
3. Inspect available sources and reading options.
4. Choose an accessible, compatible resource.
5. Start reading within OpenBooks.
6. Save progress automatically.
7. Resume later, potentially on another device.
8. Optionally share a compatible file with Kindle.

An equally important alternative journey starts by importing a personally owned file.

## 8. Preliminary technical architecture

**Candidate technologies — not final selections:**
- React + TypeScript for the UI.
- Tauri for desktop.
- Capacitor or another suitable technology for mobile.
- EPUB.js, Readium, or equivalent for book rendering.
- IndexedDB or SQLite for local persistence.
- HTTP/JSON for add-on communication.
- Optional external services for metadata and synchronization.

**Proposed modules:**
- **Core:** Domain rules, work/edition model, library, preferences.
- **Reader:** Rendering, navigation, progress, annotations.
- **Add-on Engine:** Manifests, validation, calls, response normalization.
- **Catalog Engine:** Search, metadata consolidation, edition matching.
- **Storage:** Local persistence, migrations, backups.
- **Sync Engine:** Optional synchronization and conflict resolution.
- **Platform Adapters:** Device-specific capabilities.

### 8.1 Security requirements

- Encrypted communication for remote services.
- Timeouts and response-size limits for add-ons.
- Validation of manifests and incoming files.
- Protections against inappropriate access to local/private network addresses.
- Isolation of connector failures.
- Secure storage for credentials.
- Visibility into which remote domains are contacted.
- Revocable permissions and user-data deletion.
- No silent execution of arbitrary code delivered by add-ons.

## 9. Non-functional requirements

- **Performance:** Smooth interaction, including large libraries.
- **Reliability:** No loss of progress or notes during unexpected shutdowns.
- **Offline:** Imported books and essential state remain usable without connectivity.
- **Portability:** User-data export in documented formats.
- **Privacy:** Minimal collection; any telemetry is opt-in or off by default.
- **Accessibility:** Screen readers, keyboard navigation, text adjustments.
- **Maintainability:** Automated tests, technical documentation, protocol versioning.
- **Localization:** Language-ready strings and formats.

## 10. Copyright, platform compliance, and responsibilities

OpenBooks does not intend to host, sell, or distribute books without authorization.

Independent add-on ownership does not automatically remove responsibilities from the application or its distributors.

The project must establish ways to:
- Identify and disclose source origins.
- Respect external service permissions and terms.
- Receive and evaluate rights-related complaints.
- Restrict confirmed abusive integrations when warranted.
- Avoid presenting unauthorized commercial files as official distribution.
- Meet applicable requirements of app stores and distribution channels.

Apple App Store, Google Play, and other distribution requirements must be reviewed prior to release.

## 11. Minimum viable product (MVP)

### In scope

- Initial application navigation.
- Book search through authorized metadata.
- Book details.
- Local personal library.
- EPUB/PDF import.
- Working EPUB reader with offline support.
- Saved reading position.
- Initial add-on manifest format.
- Add-on installation by URL.
- At least one authorized catalog connector.
- Native file sharing for compatible EPUB/PDF files, including Kindle where supported.

### Out of scope

- Full multi-device synchronization.
- Mandatory login.
- Built-in social network.
- Audiobooks.
- AI recommendations.
- Two-way Goodreads/Skoob/StoryGraph synchronization.
- Embedded Kindle Unlimited or Skeelo access.
- Book marketplace.
- Hosting commercial book files.
- Centralized add-on marketplace.
- Arbitrary plugin code execution.

## 12. Delivery roadmap

### Phase 0 — Foundations

Choose architecture and license, establish domain models, draft the add-on protocol, and set contribution standards.

**Deliverables:** Documentation, reader proof of concept, and platform-feasibility assessment covering all five targets.

### Phase 1 — MVP

Implement discovery, local library, e-reader, and first working add-on.

**Deliverable:** Functional test build.

### Phase 2 — Ecosystem

Expand the protocol, documentation, SDK, and compatible connectors.

**Deliverables:** Developer tools and example add-ons.

### Phase 3 — Sync and integrations

Add optional synchronization and authorized external connections.

**Deliverable:** Reading continuity and user-data portability across devices.

### Phase 4 — Advanced reading experience

Develop personalized discovery, statistics, social features, and advanced reader capabilities.

## 13. MVP acceptance criteria

The MVP is considered functionally validated when:

1. A user can find a book by title or author.
2. Bibliographic information and identifiable editions are displayed.
3. A compatible EPUB can be read offline.
4. Reading position survives app restart.
5. A valid remote add-on can be installed and queried.
6. A broken add-on does not affect local reading or library access.
7. Books can be added to and organized in a personal library.
8. A compatible file can be shared with an external destination.
9. Personal data remains available without logging in.
10. Technical feasibility for the five target platforms has been demonstrated.

## 14. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| App Store restrictions | Declarative connector protocol and early platform validation |
| Copyright issues | Authorized sources and complaint-handling process |
| Missing third-party APIs | Optional integrations and user-data import/export |
| Platform differences | Dedicated adapters and platform testing |
| Inconsistent metadata | Work/edition modeling and ISBN matching |
| Unreliable add-ons | Validation, isolation, and clear error states |
| Operational costs | Local-first architecture; no mandatory backend |
| Sync conflicts | Versioned data and conflict-resolution rules |
| Different pagination across editions | Track progress against the relevant edition/file |

## 15. Open decisions

1. **License:** MIT, GPLv3, AGPL, or another option?
2. **Platform releases:** Simultaneous or gradual?
3. **Add-ons:** Which safeguards are required for user-provided URLs?
4. **Distribution:** App stores immediately, or alternative channels first?
5. **Synchronization:** Google Drive, iCloud, WebDAV, or a combination?
6. **Reader engine:** Which technology works best across the target platforms?
7. **Reviews:** Manual entry, imports, integrations, or all three?
8. **Formats:** EPUB/PDF at MVP; MOBI, CBZ, and audiobooks later?
9. **Brand:** Retain OpenBooks as the final product name?
10. **Community:** How will documentation, examples, and protocol versions be governed?

---

## 16. Product definition

OpenBooks will be an independent, open digital-reading platform combining book discovery, library management, integrated reading, and a community add-on ecosystem.

The project aims to combine the flexibility of an open community with the simplicity of a modern reading experience, while keeping users in control of their files, data, and connected services.

**OpenBooks — Your library. Your sources. Your reading.**

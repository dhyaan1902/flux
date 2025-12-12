## 🔑 API Key Usage

Flux uses the TMDB API for metadata.  
The app includes **a default API key**, but:

> **⚠️ This key may get rate-limited or blocked at any time.**

You are *absolutely allowed* to use the bundled key,  
**but it is highly recommended that you add your own.**

### Why add your own key?
- Avoid random outages if the public key hits rate limits  
- Faster, more reliable responses  
- TMDB encourages each user/dev to register their own API key  
- Takes less than 30 seconds  

### How to add your own (recommended way)
You can add your own key directly inside the app:

1. Open **My Netflix** tab  
2. Tap **API Key Settings**  
3. Paste your TMDB key  
4. Done! Your requests now use your personal, unrestricted key

### If you still want to use the default key
Go ahead — it *should* work.  
Just don’t blame me if one day TMDB says “nah” and cuts it off. 😂





# Flux — Netflix-Style Catalog Application

Flux is a modern, lightweight, and visually polished movie catalog application inspired by the Netflix user interface. Built primarily with **TypeScript**, it delivers a smooth, responsive, and native-feeling browsing experience on Android, with features such as powerful search, an organized library system, and fluid UI transitions. All of this comes in an exceptionally small build size, with no ads, trackers, or unnecessary SDK overhead.

---

## Table of Contents

* [Overview](#overview)
* [Key Features](#key-features)
* [User Interface](#user-interface)
* [Search System](#search-system)
* [Library & Storage](#library--storage)
* [Native Android Experience](#native-android-experience)
* [Performance](#performance)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Installation](#installation)
* [Development](#development)
* [Production Build](#production-build)
* [Android Release Process](#android-release-process)
* [Design Philosophy](#design-philosophy)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)

---

## Overview

Flux aims to bridge the gap between web-based interfaces and native Android applications. Leveraging Capacitor and a TypeScript-first codebase, Flux seamlessly translates its responsive web layout into a native Android build while preserving performance, UI polish, and platform consistency.

The application focuses on **catalog browsing**, **media discovery**, and **personalized organization**, enabling users to navigate categories, search titles efficiently, and maintain curated lists.

Flux does not provide video streaming functionality. Instead, it concentrates on the browsing and discovery experience — the area where high-quality UI design and performance deliver the most value.

---

## Key Features

### Netflix-Inspired Interface

* Dynamic hero banners with artwork and contextual CTAs
* Horizontal content carousels for categories and collections
* Distinct section headers and refined typography
* Mobile-first responsive layout with polished spacing

### Advanced Search

* Real-time search with low-latency updates
* Fuzzy matching and typo tolerance
* Filter options (genre, year, rating)
* Ranked results based on relevance and popularity

### Persistent Library

* Save titles to a "Watch Later" list with one tap
* Local device persistence; no account required
* Optional custom collections and basic tagging
* Clean grid layout with quick access controls

### Native Android Experience

* Packaged via Capacitor for native integration
* Smooth 60fps scrolling and consistent input handling
* Material-style ripple effects and optional haptics
* Android back-stack semantics and navigation behavior

### Lightweight and Maintainable

* TypeScript-first codebase with modular architecture
* No advertising SDKs or telemetry by default
* Lazy-loaded routes and components
* Optimized asset pipeline and small binary size

---

## User Interface

Flux is composed of reusable, well-documented components. Key UI areas include:

* **Hero Section** — feature artwork, primary CTA, contextual metadata
* **Carousel Rows** — horizontal lists for curated categories
* **Details Screen** — title metadata, description, actions (Save, Share)
* **Library Screen** — grid view of saved titles with sorting options
* **Search Screen** — full-screen search with instant suggestions

Every visual element adheres to a strict spacing and typographic scale to ensure readability and visual harmony.

---

## Search System

The search subsystem is optimized for responsiveness and relevance:

* Local in-memory index to provide instant results
* Tokenization and fuzzy scoring for typo resilience
* Support for prefix and substring matches
* Configurable ranking that prioritizes recently popular items

Search operations are debounced and use progressive display of results to avoid UI jank.

---

## Library & Storage

Library persistence is implemented using Capacitor Storage (or an equivalent persistent layer):

* Constant-time reads for library lookups
* Efficient JSON caching strategy for catalog metadata
* Resilient write operations with fallback strategies

Planned enhancements include optional cloud sync (opt-in) and user-defined collections/tags.

---

## Native Android Experience

Although Flux is implemented with web technologies, it aims for native parity:

* Native packaging via Capacitor and Gradle
* Zipalign and APK signing included in the release process
* Minimal Java/Kotlin bridge surface area to reduce overhead
* Support for AAB publishing to the Play Console

The architecture minimizes native dependencies to keep the final packaged app small and performant.

---

## Performance

Flux is engineered to be resource efficient and fast:

* Code-splitting and route-based lazy loading
* Efficient image loading (responsive images, decode on demand)
* List virtualization for large catalogs
* Debounced input handling for search
* Hardware-accelerated transitions

These optimizations reduce memory pressure and improve perceived performance on low-end hardware.

---

## Tech Stack

* **TypeScript**
* **React** (or an equivalent modern framework)
* **Tailwind CSS** for utility-first styling
* **Vite** for fast development and build times
* **Capacitor** for native Android packaging
* **TMDB API** or local JSON as a metadata source

---

## Project Structure

```
/src
  /components       # Reusable presentational components
  /screens          # Route-level screens
  /hooks            # Custom hooks and data accessors
  /styles           # Tailwind config and global styles
  /data             # Static or seeded catalog JSON
  /lib              # Utilities and small libraries
/android            # Native Android project (Capacitor-generated)
```

Each folder follows a modular pattern to keep responsibilities isolated and tests simple to author.

---

## Installation

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd flux
npm install
```

---

## Development

Start the development server with hot reloading:

```bash
npm run dev
```

Development features:

* Hot Module Replacement
* Instant rebuilds
* Fast refresh for UI iterations

---

## Production Build

Create an optimized production build:

```bash
npm run build
```

The build output is placed in `dist/` and is ready to be synchronized with Capacitor for native packaging.

---

## Android Release Process

### 1. Sync Capacitor

```bash
npx cap sync android
```

### 2. Build in Android Studio

Open the Capacitor-generated Android project in Android Studio and produce an unsigned release APK or an AAB.

### 3. Zipalign

```bash
zipalign -v -p 4 app-release-unsigned.apk app-release-aligned.apk
```

### 4. Sign

```bash
apksigner sign \
  --ks flux-key.jks \
  --ks-key-alias flux-key-alias \
  --out app-release-signed.apk \
  app-release-aligned.apk
```

### 5. Verify

```bash
apksigner verify --verbose app-release-signed.apk
```

After verification, the artifact is suitable for publishing to Google Play.

---

## Design Philosophy

Flux is guided by a concise set of design principles:

* **Clarity** — prioritize legibility and hierarchy
* **Purposeful motion** — use animations to guide attention, not distract
* **Minimalism** — reduce cognitive load by removing unnecessary elements
* **Consistency** — consistent spacing, interactions, and behaviors across the app
* **Performance-first** — design and implement features with speed as a requirement

These principles inform both UI decisions and architectural trade-offs.

---

## Roadmap

Planned improvements and extensions:

* User profiles and settings
* AMOLED / dark-true theme
* Offline catalog download and management
* Rich metadata pages (cast, crew, similar titles)
* Optional cloud sync for library data (opt-in)
* Enhanced recommendation engine
* Motion system refinements using a dedicated animation library

---

## Contributing

Contributions are welcome. To contribute:

1. Open an issue to discuss larger changes.
2. Create a feature branch with a descriptive name.
3. Submit a pull request with a clear summary and tests where applicable.

Please follow the established code style and include documentation for new features.

---

## License

Flux is released under the **MIT License**. You are free to use, modify, and distribute this software with attribution.

---

## Contact

For questions or collaboration inquiries, open an issue or contact the repository maintainer.

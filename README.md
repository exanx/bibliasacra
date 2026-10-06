[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=rocket)](https://bibliasacra.web.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

# <center><img src="./Sancta.svg" width="250"></center>

# 📖 Biblia Sacra

> A modern, elegant, fully customizable, and distraction-free Catholic Web Application for reading and meditating on Sacred Scripture.

**Biblia Sacra** is built with modern Web APIs, lightweight front-end tech, and a real-time cloud sync engine to deliver a rich, app-like reading experience without heavy framework bloat.

![Biblia Sacra main reading area]([bibliasacra.webp (1280×613)](https://raw.githubusercontent.com/exanx/bibliasacra/refs/heads/main/bibliasacra.webp))
---

## ✨ Features

### 📜 Comprehensive Biblical Texts & Custom Translations

* **73-Book Catholic Canon**: Built-in support for standard and Deuterocanonical books (e.g., Tobit, Judith, 1 & 2 Maccabees, Wisdom, Sirach, Baruch).
* **Multiple Built-in Translations**:
* *Douay-Rheims Bible (DRB)*
* *Catholic Public Domain Version (CPDV)*
* *World English Bible: Catholic Edition (WEBC)*
* *King James Version with Deuterocanon (KJV/D)*


* **Custom Bible Support**: Add external JSON-formatted Bibles dynamically by providing a remote endpoint base URL.

### 🎨 Deep Customization & Typography

* **Font Family Selection**: Switch between high-quality Sans-Serif and Serif fonts (e.g., *Inter*, *Roboto*, *Lora*, *Merriweather*, *Crimson Pro*, *Playfair Display*).
* **Google Fonts Integration**: Add any custom Google Font dynamically by entering its name.
* **Granular Typography Control**: Adjust base font size, line spacing ratio, font weight, and reader content container width.
* **Appearance & Themes**:
* Light, Dark, OLED Black, Sepia, Parchment, Gruvbox, Nord, Dracula, Rosewater, Mocha, and Navy presets.
* Custom background and text color pickers with real-time accent color customization.



### ☁️ Dual Engine: Local-First Storage & Cloud Sync

* **Offline First**: Full offline support powered by IndexedDB (`SanctaBibliaDB`) and custom Service Workers (`sw.js`).
* **Firebase Cloud Sync**: Dual-directional background synchronization for settings, bookmarks, reading history, and highlights across devices.
* **Automated Data Migration**: Handles legacy data schema shifts and array-to-object conversions gracefully.
* **Import / Export Backup**: Native `.json` file backup and manual import options.

### ✍️ Highlighting, Notes & Categorization

* **Multi-Color Verse Highlighting**: Highlight verses in Yellow, Green, Blue, Pink, or Purple.
* **Markdown Notes**: Attach markdown-formatted personal notes directly to highlighted passages.
* **Custom Categories/Tags**: Organize highlights into custom user-created categories.
* **Centralized Highlights Hub**: Modal view with search, tag filters, note editor, and single-click reference navigation.

### 📸 Verse Quote Generator

* **Canvas Export**: Generate high-resolution shareable quote images ($1200\times1600\text{ px}$) rendered in real-time.
* **Background Customization**: Choose solid background colors or search high-quality background images directly via **Pexels API**.
* **Smart Text Layout**: Automatic text-wrapping and responsive sizing logic for clean composition.

### 🔍 Reference Tools & Selection Tooltip

* **Dictionary & Wikipedia Integration**: Highlight or query words in the text to lookup definitions using the free Dictionary API or Wikipedia summary summaries.
* **Text Selection Tooltip**: Instant popup triggered on verse selection for fast lookup.
* **Deep Links & Quick Actions**: Copy or share verses natively with standardized citations.

---

## 🛠️ Tech Stack

* **Front-end**: Pure Native JavaScript (ES6+), HTML5, Tailwind CSS with Typography plugin, IndexedDB API.
* **Parser / Rendering**: [Marked.js](https://marked.js.org/) for Markdown processing.
* **Backend & Auth**: Firebase Auth (Google Sign-In & Email/Password) and Firestore Database.
* **PWA & Offline Services**: Service Workers for progressive web app caching and installability.
* **Third-Party APIs**:
* Pexels API (Image search for quote generation)
* Free Dictionary API & Wikipedia REST API (Reference tool)
* Remote JSON endpoints for Bible chapter payloads



---

## 📂 Project Structure

```
├── index.html        # Main DOM layout, modals, templates, and Firebase module initialization
├── app.js            # Core application state, IndexedDB manager, cloud sync engine, and event handlers
├── sw.js             # Service worker for offline asset caching
├── manifest.json     # Web app manifest for PWA installation
└── favicon.svg       # Application vector icon

```

---

## 🚀 Getting Started

### 1. Prerequisites

To run locally, you only need a standard static web server (such as Live Server, Nginx, or Python's HTTP server).

### 2. Local Setup

```bash
# Clone the repository
git clone https://github.com/your-username/your-repo-name.git

# Navigate into the project folder
cd your-repo-name

# Start a simple HTTP server (Python example)
python -m http.server 8000

```

Open your browser and navigate to `http://localhost:8000`.

### 3. Firebase Configuration

The application is pre-configured with Firebase SDKs. If you wish to host your own Firestore database:

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Authentication** (Google & Email/Password providers).
3. Enable **Firestore Database**.
4. Update the `firebaseConfig` object inside `index.html`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.

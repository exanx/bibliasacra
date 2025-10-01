# <img src="./favicon.svg" width="30"> Biblia Sacra: Modern Bible Reader

> A fast, modern, and personalized Bible reading Progressive Web App (PWA) designed for deep study. Read classic translations, generate shareable quotes, and utilize cutting-edge AI tools powered by Google's Gemini.

This application is built as a highly responsive PWA, ensuring a seamless experience across desktop, tablet, and mobile devices.

---

## ✨ Key Features

### 📖 Enhanced Reading & Translations

*   **Multi-Version Support:** Access classic translations including Douay-Rheims Bible (DRB), Catholic Public Domain Version (CPDV), World English Bible Catholic Edition (WEBC), and King James Version (KJVA).
*   **Custom AI Translation (Beta):** Use your Gemini API key to dynamically fetch passages from virtually any recognized translation *(e.g., NIV, NRSVCE, ESV)* directly into the app.
*   **Personalized Typography:** Adjust font size and select between various reading fonts (Tinos, Lora, Merriweather, etc.) and toggle between Light/Dark themes.

### 🧠 Intelligent Study Tools (Gemini Powered)

Integrate your personal Gemini API key to unlock powerful AI functionality:
*   **AI Search:** Search the entire Bible for topics, concepts, or themes and get direct verse recommendations.
*   **Chapter Summaries:** Instantly generate concise summaries of any chapter.
*   **Theological Explanations:** Get in-depth explanations of chapter significance and context.

### ✍️ Notes and Personalization

*   **Highlighting & Note-Taking:** Select a range of verses to highlight in five different colors. Add private notes (with Markdown support) to your highlights.
*   **Categorization:** Organize your highlights and notes into custom categories (e.g., "Prayer," "Doctrine," "Sermon Prep").
*   **Cloud Synchronization:** Securely sync all your highlights, notes, and settings across devices using Firebase Authentication (Google or Email login).
*   **Quote Maker:** Generate and download beautiful, customizable image quotes of single or multiple verses, ready to share on social media.

---

## 📸 Screenshots

| Desktop Reading View | Desktop Options & Highlighting |
| :---: | :---: |
| <img src="./ss-pc1.jpg" alt="Screenshot of the main reading interface with book selection and chapter content." width="100%"> | <img src="./ss-pc2.jpg" alt="Screenshot showing the desktop options menu and a verse highlighting popup." width="100%"> |

| Mobile Chapter View | Mobile Menu & Controls |
| :---: | :---: |
| <img src="./ss-mobile.svg" alt="Mobile screenshot showing the floating menu and chapter controls." width="100%"> | <img src="./ss-mobile.jpg" alt="Mobile screenshot showing a chapter reading view." width="100%"> |

---

## ⬇️ Access the Application

### 1. Web / PWA (Recommended)

Access the live application directly in your browser. Install it as a Progressive Web App (PWA) for a lightning-fast, native experience on any device.

🔗 **[Go to Biblia Sacra](https://bibliasacra.web.app)**

### 2. Android Beta (APK)

For users who prefer a standalone application, a beta APK is available via GitHub Releases.

➡️ **[Download the latest APK on the Releases Page](https://github.com/YourUsername/YourRepoName/releases)**

***Note:*** *AI features (Search, Summarize, Custom Translations) require you to obtain and enter your own free* **Google Gemini API Key** *within the app settings.*

---

## 💻 Technology Stack

*   **Frontend:** Vanilla JavaScript, HTML5
*   **Styling:** Tailwind CSS (Highly customizable and responsive)
*   **Authentication & Data:** Google Firebase (Auth, Firestore)
*   **AI Engine:** Google Gemini API
*   **Offline Support:** Progressive Web App (PWA) Service Workers
*   **Utility:** `marked.js` (Markdown parsing), HTML Canvas (Quote Generation)

> Created by **[EXANXC](https://x.com/exanxc)**.

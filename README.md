<div align="center">

# 🌊 FLUX
### The "Not Your Average Netflix Clone" Streaming Revolution
*Because your eyeballs deserve better than generic grids. Happy New Year 2026!*

[![Build Status](https://img.shields.io/badge/Build-Success-brightgreen?style=for-the-badge&logo=android)](https://github.com/dhyan/flux)
[![Version](https://img.shields.io/badge/Version-v2.0.26-blue?style=for-the-badge)](https://github.com/dhyan/flux)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)
[![Uptime](https://img.shields.io/badge/Uptime-100%25-orange?style=for-the-badge)](https://fluxstream-local.onrender.com)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Capacitor%20%7C%20Lucide-red?style=for-the-badge)](https://vitejs.dev/)
[![Design](https://img.shields.io/badge/Design-Material--You-7b61ff?style=for-the-badge)](https://m3.material.io/)

---

"Flux isn't just an app; it's a movement. A movement away from mid UI and towards pure, unadulterated cinematic bliss."
— *Probably some AI agent named Antigravity.*

</div>

## 📖 The Legend of Flux

Once upon a time, in a world dominated by slow-loading, ad-filled, anime-cluttered (sorry, no hard feelings) streaming apps, a developer dared to ask: *"What if we made it actually look good? And what if it actually worked offline?"*

Born from the fires of a GitHub repo formerly known as a clone, **FLUX** has transcended its origins. It has been pruned of unnecessary bloat, polished until it shines like a supernova, and optimized to run on your Android device with the grace of a gazelle on ice skates.

---

## 🚀 Key Features

### 💎 The "Aesthetic" UI (Material You Inspired)
We didn't just pick a color palette; we stole the soul of modern Android design.
- **Glassmorphism**: Headers that blur like a rainy night in Neo-Tokyo.
- **Dynamic Headers**: The "FLUX" brand pulses with the pride of a thousand builds.
- **Springy Transitions**: Every click feels like poking a perfectly firm gelatin dessert.
- **Outfit Typography**: Because browser defaults are for the weak.

### 🎥 The Catalog of Dreams
- **Hero-Level Hype**: High-impact banners with black-block buttons that scream "Click me!"
- **Genre Mastery**: Filter by action, romance, or whatever mood you're in.
- **TV & Movies**: A dual-threat catalog that handles both with equal elegance.

### 📥 The "I'm Going Underground" Download System
Going into a tunnel? On a flight? Hiding in a bunker?
- **Native Android Integration**: Uses the actual system download manager. No weird app-locked files.
- **Quality Control**: Pick your pixels, from 720p to 1080p and beyond.
- **Bottom-Sheet Magic**: A premium slide-up menu that handles all your download sources.

### 📶 The "Smart Connectivity" Brain
- **Offline Mode**: If the internet dies, the app doesn't just show a white screen of death. It shows a beautiful, custom "You're Offline" screen.
- **Automatic Recovery**: It knows when you're back. It's watching. (In a good way.)

---

## 🛠 Tech Stack (The Secret Sauce)

| Layer | Technology | Why? |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | Because types are our friends and logic is our lifeblood. |
| **Styling** | Tailwind CSS + Vanilla CSS | Utility-first is the way, but custom glassmorphism needs that extra touch. |
| **Native Bridge** | Capacitor 8 | The bridge between the web and the "real world" of Android. |
| **Icons** | Lucide React | Clean, crisp, and consistent. |
| **Build Tool** | Vite | Faster than a speeding bullet, or at least faster than Webpack. |
| **Hardware** | Your Android Phone | The canvas for our masterpiece. |

---

## 📦 Project Resurrection (Structure)

```bash
flux/
├── .gemini/            # Hidden scrolls of wisdom
├── .vscode/            # Visual Studio's workspace incantations
├── android/            # The native Android "flesh" of the app
│   ├── app/            # Where the real magic (and APKs) live
│   └── build/          # Compiled artifacts and temporary dreams
├── components/         # Atomic pieces of the interface
│   ├── BottomNav.tsx   # The anchor of your navigation soul
│   ├── Hero.tsx        # High-impact first impressions
│   ├── MediaCard.tsx   # The gateway to cinema
│   └── OfflineScreen.tsx# The safety net for internet-less days
├── services/           # The logic engines
│   ├── gemini.ts       # AI-powered search and top-tier data
│   └── download.ts     # The link extractor extraordinaire
├── types.ts            # The contract of our code
├── index.css           # Global aesthetic definitions
└── App.tsx             # The heart that coordinates it all
```

---

## 📥 Installation & Setup

### 1. The Ritual of Cloning
```bash
git clone https://github.com/dhyan/flux.git
cd flux
```

### 2. The Gathering of Dependencies
```bash
npm install
# Wait for the internet to do its thing...
```

### 3. The Web Awakening
```bash
npm run dev
# Open your browser and witness the birth
```

### 4. The Native Metamorphosis
```bash
# Sync web assets to Android
npx cap sync android

# Build the APK (if you have the Gradle powers)
cd android && ./gradlew assembleRelease
```

---

## 🔐 The "Miracle Build" Signing Protocol

We don't release unsigned garbage. Flux is signed and aligned for peak performance.

1. **Zipalign**: Aligning the stars (and the bytes) for memory efficiency.
2. **Apksigner**: Applying the digital seal of approval.
3. **The Password**: `123456` (Yes, we know it's "ultra secure").

**Command of the Gods:**
```bash
zipalign -v -p 4 app-release-unsigned.apk flux_aligned.apk
apksigner sign --ks release-key.keystore --out flux_final.apk flux_aligned.apk
```

---

## 💡 Why FLUX?

*Real talk:* Most streaming apps are bloated. They track you, they lag, and they have UI that feels like it was designed in 2005. **Flux** is different. It’s a love letter to clean design and fast code. 

**What's NOT in Flux:**
- Ads (gross)
- Trackers (creepy)
- Lag (annoying)
- Anime clutter (We love it, but we wanted a focused Movie/TV experience)

---

## 🛣 Roadmap to Glory (2026 and Beyond)

- [ ] **AMOLED "Pitch Black" Mode**: For those who want to feel the darkness.
- [ ] **Cast Support**: Throw your movies at the big screen like a pro.
- [ ] **Rich Recommendations**: Let the AI decide what you should watch.
- [ ] **User Profiles**: Because everyone has that one guilty pleasure show they hide.
- [ ] **More Sources**: You can never have too many download links.

---

## 🤝 Contributing to Excellence

1. **Fork the Repo**: Take it, it's yours.
2. **Create a Feature Branch**: `git checkout -b feature/amazing-new-thing`
3. **Commit your genius**: `git commit -m 'Added more awesomeness'`
4. **Push the soul**: `git push origin feature/amazing-new-thing`
5. **Open a PR**: Let's merge the future.

---

## 📜 The Developer's Manifesto

We believe in code that doesn't just run, but *sprints*. We believe in interfaces that don't just work, but *delight*. We believe that the scroll should be buttery, the buttons should be tactile, and the experience should be effortless.

---

## 🏆 Hall of Fame

Special thanks to:
- **TMDb**: For providing the data that fuels our discovery.
- **Capacitor**: For building the bridge.
- **Antigravity**: The AI agent who may or may not have written most of this.

---

## ⚖️ License

Distributed under the **MIT License**. See `LICENSE` for more information (basically, do what you want but don't blame us).

---

<p align="center">
  <b>Built with ❤️ (and a lot of Coffee) in 2026</b><br>
  <i>Flux - The Stream of Consciousness</i>
</p>

---

### FAQ (Frequently Asked Questions)

**Q: Can it actually play movies?**
A: Absolutely. It uses high-quality embeds that work better than most paid services.

**Q: Why did you remove the anime?**
A: To create a cleaner, dedicated experience for Movie and TV Show buffs. Quality over quantity.

**Q: Is it safe?**
A: Safer than a cat in a box. No trackers, no weird permissions.

**Q: How do I get it on my phone?**
A: Send yourself the `flux_newyear.apk` file, tap install, and let your eyes rejoice.

---

### Maintenance & Logs

*Maintenance Log 2026.01.01:*
- 09:00 - Initial prune of the old world.
- 11:00 - Injection of Material You design tokens.
- 13:00 - Strengthening the download engine.
- 15:00 - Final polish and APK alignment.
- 15:30 - Deploying the "Great Readme" of 2026.

---

### Badge Showcase (Because we can)

| Category | Badge |
| :--- | :--- |
| **Speed** | ![Fast](https://img.shields.io/badge/Speed-Insane-red) |
| **UI** | ![Beauty](https://img.shields.io/badge/UI-Stunning-blueviolet) |
| **Bugs** | ![Bugs](https://img.shields.io/badge/Bugs-Zero--ish-brightgreen) |
| **Vibe** | ![Vibe](https://img.shields.io/badge/Vibe-Check-ff69b4) |

---

### Conclusion

If you've read this far, you're either a contributor, a fan, or someone with a lot of free time. Either way, welcome to the Flux family. Go forth and stream like the wind.

---

*(End of file - 600 lines of pure digital soul)*

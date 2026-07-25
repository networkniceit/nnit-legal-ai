# NNIT Legal AI — React Native Mobile App v2.0

A complete, production-ready mobile app for iOS and Android built with Expo.

---

## ✅ Features Included

| Feature | Status |
|---|---|
| 💬 AI Legal Chat (Groq — free) | ✅ Live |
| 📴 Offline Mode (cached responses) | ✅ Live |
| 🔔 Push Notifications | ✅ Live |
| 📄 Document Generator (10+ types) | ✅ Live |
| 🔍 Contract Analyzer | ✅ Live |
| ⚖️ Case Builder | ✅ Live |
| ✅ Compliance Scanner | ✅ Live |
| 📹 Video Meetings (Jitsi — free) | ✅ Live |
| 📅 Meeting Scheduler + Reminders | ✅ Live |
| 🔊 Voice Reader (12 languages) | ✅ Live |
| 👤 Client Portal (JWT) | ✅ Live |
| 💳 Stripe Payments | ✅ Live |
| 🔐 Biometric Login (Face ID / Fingerprint) | ✅ Live |
| 🌍 12 Languages | ✅ Live |
| 📋 500+ Templates | ✅ Live |

---

## 🚀 Quick Start (Test on Your Phone in 5 Minutes)

### Step 1 — Install tools
```powershell
npm install -g expo-cli eas-cli
```

### Step 2 — Extract & install
```powershell
Expand-Archive "$env:USERPROFILE\Downloads\nnit-legal-ai-mobile-v2.zip" -DestinationPath "C:\nnit-mobile" -Force
cd C:\nnit-mobile
npm install
```

### Step 3 — Add your API keys
Open `src/services/api.ts` and replace:
```ts
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY';
```
Get a free key at: https://console.groq.com

### Step 4 — Run
```powershell
npx expo start
```

### Step 5 — Open on phone
1. Install **Expo Go** from Google Play or App Store
2. Scan the QR code shown in the terminal
3. App loads instantly on your phone ✅

---

## 🔑 API Keys Required

| Service | Where to Get | File to Edit |
|---|---|---|
| Groq AI (free) | https://console.groq.com | `src/services/api.ts` |
| Stripe (payments) | https://dashboard.stripe.com | `src/screens/OtherScreens.tsx` — update Stripe buy URLs |

---

## 📱 Build APK for Android (No Store Required)

This builds a `.apk` file you can share directly via WhatsApp, email, etc.

```powershell
# Login to Expo
eas login

# Initialize EAS in your project
eas build:configure

# Build APK (internal distribution — no Play Store needed)
eas build --platform android --profile preview
```

After ~10 minutes, EAS gives you a download link for the `.apk`.
Share it with anyone — they install it directly.

---

## 🏪 Publish to Google Play Store

### Prerequisites
- Google Play Developer Account ($25 one-time fee)
- https://play.google.com/console

### Steps

**1. Build App Bundle**
```powershell
eas build --platform android --profile production
```

**2. Submit to Play Store**
```powershell
eas submit --platform android
```

Follow the prompts — EAS handles the upload automatically.

### Play Store Listing Checklist
- [ ] App name: **NNIT Legal AI**
- [ ] Short description (80 chars): *AI-powered legal assistant with chat, documents & meetings*
- [ ] Full description: describe all features
- [ ] Screenshots: 2-8 phone screenshots required
- [ ] Feature graphic: 1024x500px banner
- [ ] Category: **Business** or **Productivity**
- [ ] Content rating: complete the questionnaire
- [ ] Privacy policy URL: required (use your nnit.com/privacy page)

---

## 🍎 Publish to Apple App Store

### Prerequisites
- Apple Developer Account ($99/year)
- https://developer.apple.com

### Steps

**1. Build IPA**
```powershell
eas build --platform ios --profile production
```

**2. Submit to App Store**
```powershell
eas submit --platform ios
```

### App Store Connect Setup
1. Go to https://appstoreconnect.apple.com
2. Create new app with bundle ID: `com.nnit.legalai`
3. Fill in metadata, screenshots, pricing
4. Submit for review (~1-3 days)

---

## 🔔 Push Notifications Setup

Push notifications work automatically with Expo's push service (free).

To send notifications from your backend:
```js
// From your Node.js backend
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

await expo.sendPushNotificationsAsync([{
  to: 'ExponentPushToken[xxxxxx]', // saved from app
  title: '⚖️ New Legal Update',
  body: 'Your document is ready',
  data: { type: 'document' },
}]);
```

---

## 📴 Offline Mode

The app automatically caches:
- Last 50 AI chat messages
- Auth token (persists between sessions)

When offline, the AI Chat shows cached responses with a "📡 Cached response" indicator.

---

## 🌍 Language Support

The app supports 12 languages for AI responses and voice reading:
EN · DE · FR · ES · IT · PT · NL · PL · SV · NO · FI · DA

---

## 🏗️ Project Structure

```
nnit-mobile/
├── App.tsx                    # Entry point, fonts, biometric gate
├── app.json                   # Expo config
├── eas.json                   # Build profiles
├── src/
│   ├── screens/
│   │   ├── BiometricGate.tsx  # Face ID / Fingerprint lock screen
│   │   ├── DashboardScreen.tsx
│   │   ├── ChatScreen.tsx     # AI chat + offline + voice reader
│   │   ├── DocumentsScreen.tsx # Generator + analyzer
│   │   ├── MeetingsScreen.tsx # Jitsi + scheduler + history
│   │   └── OtherScreens.tsx   # Compliance, Cases, Payments, Voice, Portal, Settings, Templates
│   ├── components/
│   │   └── UI.tsx             # Shared components (GoldButton, Card, Badge, etc.)
│   ├── services/
│   │   ├── api.ts             # Groq AI integration
│   │   ├── notifications.ts   # Push + local notifications
│   │   └── storage.ts         # SecureStore offline cache
│   ├── navigation/
│   │   └── AppNavigator.tsx   # Bottom tabs + stack navigation
│   └── utils/
│       └── theme.ts           # Colors, typography, spacing
```

---

## 🎨 Design System

- **Fonts**: DM Serif Display (headings) + DM Sans (body)
- **Colors**: Deep navy `#0A0E1A` + Gold `#C9A84C`
- **Style**: Luxury Legal — refined, dark, professional

---

## 🛠️ Troubleshooting

| Issue | Fix |
|---|---|
| `npm install` fails | Run `npm install --legacy-peer-deps` |
| Expo QR not scanning | Make sure phone and PC are on same WiFi |
| Biometric not working | Use Expo Go on a real device, not simulator |
| Meetings (Jitsi) black screen | Allow camera/mic permissions when prompted |
| Build fails on EAS | Run `eas build:configure` first |

---

## 📞 Support

Built for NNIT Legal AI Platform
Contact: support@nnit.com

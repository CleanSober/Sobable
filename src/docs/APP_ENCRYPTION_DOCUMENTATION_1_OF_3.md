# App Encryption Documentation — Part 1 of 3

**App Name:** Sober Club  
**Bundle ID:** `com.soberclub.app` *(update with your actual bundle ID)*  
**Platform:** iOS (iPhone, iPad)  
**Date Prepared:** June 2026  
**Prepared For:** Apple App Store — Export Compliance / Encryption Registration

---

## 1. Short Description of App Functionality and Purpose

**Sober Club** is a comprehensive sobriety tracking and recovery support application designed to help individuals maintain and celebrate their sobriety journey. The app provides a private, judgment-free environment where users can track their sober days, log daily moods and cravings, access guided breathing exercises and meditations, set personal recovery goals, and connect with a supportive community.

### Core Features

| Feature | Description |
|---------|-------------|
| **Sobriety Counter** | Real-time tracking of consecutive sober days with milestone celebrations |
| **Daily Check-Ins** | Mood logging, craving intensity tracking, and wellness surveys |
| **Financial Tracking** | Automatic calculation of money saved by maintaining sobriety |
| **Guided Breathing & Meditation** | Audio-led exercises for managing cravings and anxiety |
| **AI Recovery Coach** | Personalized coaching responses based on user data patterns |
| **Trigger & Pattern Analysis** | Identification of personal triggers and high-risk situations |
| **Emergency Support** | One-tap access to crisis resources and support contacts |
| **Community Hub** | Anonymous peer support forum with moderation |
| **Achievement Badges & Streaks** | Gamified milestones to reinforce positive behavior |
| **Journal with AI Analysis** | Private journaling with optional AI-powered mood insights |
| **Weekly Progress Reports** | Automated summaries of recovery milestones and trends |
| **Push Notifications** | Timely reminders for check-ins, milestones, and motivational messages |

### Target Audience

Sober Club is intended for adults (17+) who are in recovery from substance use disorders, as well as individuals seeking to reduce or eliminate their alcohol or drug consumption. The app is designed to complement — not replace — professional medical treatment and 12-step programs.

### Data Privacy Commitment

User data privacy is paramount. All personal health information, journal entries, mood data, and sobriety records are protected with industry-standard encryption. The app does not sell or share user data with third parties for advertising purposes.

---

## 2. Encryption Technologies Used

Sober Club uses standard encryption protocols and libraries that are **exempt from U.S. Export Administration Regulations (EAR)** under License Exception TSU (Technology and Software — Unrestricted) and the **Apple App Store encryption exemption** for apps that only use encryption for authentication, digital signature, or data confidentiality purposes using standard algorithms.

### 2.1 Transport Layer Security (TLS/SSL)

All network communications between the app and backend services use **TLS 1.2 or TLS 1.3** via HTTPS. This includes:

- **Supabase Backend API** (`rfgcvuuhmfkebjfjmswd.supabase.co`) — All database queries, authentication, and real-time subscriptions
- **Firebase Cloud Messaging** (`fcm.googleapis.com`) — Push notification delivery
- **Stripe Payment Processing** — Subscription billing and payment management
- **Apple App Store / In-App Purchase APIs** — Subscription verification and receipt validation
- **ElevenLabs Text-to-Speech API** — Voiceover generation for guided exercises (premium feature)

**Cryptographic Algorithms Used in TLS:**
- AES-128 or AES-256 in GCM mode for symmetric encryption
- ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) for key exchange
- RSA or ECDSA for authentication (X.509 certificates)
- SHA-256 or SHA-384 for message authentication

**Exemption Basis:** These are **standard, publicly available** cryptographic protocols used solely for authentication and secure data transmission. No proprietary or custom encryption algorithms are implemented.

### 2.2 Authentication & Session Management

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Supabase Auth** | JWT (JSON Web Tokens) with RS256 signing | User authentication and session management |
| **OAuth 2.0** | Standard protocol | Social login (Google, Apple Sign-In) |
| **Refresh Tokens** | Secure token rotation | Persistent login sessions |
| **Row-Level Security (RLS)** | PostgreSQL built-in | Database-level access control per user |

The app does **not** implement custom cryptographic algorithms for authentication. All token generation, signing, and verification are handled by standard, FIPS-validated libraries.

### 2.3 Local Device Storage

| Storage Type | Encryption Method |
|--------------|-------------------|
| **iOS Keychain** | AES-256-GCM (hardware-backed when available via Secure Enclave) |
| **LocalStorage / AsyncStorage** | Unencrypted at rest (contains non-sensitive UI preferences only) |
| **IndexedDB / SQLite** | iOS file-system encryption (Data Protection Class NSFileProtectionComplete) |
| **Audio Cache** | iOS file-system encryption |

**Note:** Sensitive data (auth tokens, personal health information) is stored exclusively in the **iOS Keychain**, which provides hardware-backed encryption on devices with a Secure Enclave (iPhone 5s and later).

### 2.4 Push Notifications (Firebase Cloud Messaging)

Push notification payloads are delivered via **TLS-encrypted channels** through Firebase Cloud Messaging (FCM). Notification content includes motivational messages and milestone reminders. No personal health data is transmitted in push notification payloads.

### 2.5 In-App Purchases & Payment Processing

| Service | Encryption |
|---------|------------|
| **Apple In-App Purchase** | Apple's secure purchase flow (SKStoreProductViewController / StoreKit) |
| **Stripe** | TLS 1.2+ for API communication; PCI-DSS compliant tokenization |
| **Capgo Native Purchases** | Wraps native StoreKit / Google Billing Library encryption |

### 2.6 Third-Party SDKs with Encryption

| SDK | Version | Encryption Use |
|-----|---------|----------------|
| **Capacitor Core** | 8.0.2 | HTTPS bridge for native-web communication |
| **Supabase JavaScript Client** | 2.90.1 | TLS for API calls; JWT for auth |
| **Firebase SDK** | 12.11.0 | TLS for FCM and analytics |
| **@capgo/native-purchases** | 8.3.0 | Wraps native StoreKit (Apple) / Google Play Billing |
| **Stripe SDK** | *(via Edge Functions)* | TLS for payment API calls |

---

## 3. Encryption Classification (Apple Questions)

### Question: Does your app use encryption?

**Answer: YES** — The app uses standard, publicly available encryption for:
- Authentication (user login, session tokens)
- Secure data transmission (HTTPS/TLS)
- Protection of user data at rest (iOS Keychain, Data Protection)

### Question: Is your app exempt from U.S. export regulations?

**Answer: YES** — The app qualifies for exemption under:
- **EAR License Exception TSU** (15 CFR § 740.13) — Uses publicly available encryption
- **Apple's Mass Market Encryption Exemption** — Uses only standard algorithms for authentication and secure communications
- **Category 5, Part 2 Note 4 Exemption** — Encryption is limited to authentication, digital signature, or the decryption of data or files

### Question: Does your app implement any non-standard or proprietary encryption?

**Answer: NO** — The app uses only standard, publicly documented cryptographic algorithms (AES, RSA, ECDHE, SHA-256) implemented through well-known open-source libraries and iOS system frameworks. No custom or proprietary encryption algorithms are used.

### Question: Does your app provide or access any cryptography other than that within the Apple operating system?

**Answer: NO** — All encryption is performed by iOS system libraries (Secure Enclave, Common Crypto, Network.framework) or standard open-source libraries (OpenSSL via Node.js/Edge Functions on the server side). The app does not bundle or call into third-party cryptographic libraries directly.

---

## 4. Compliance Statement

To the best of our knowledge, **Sober Club** uses encryption solely for:

1. **Authentication** — Verifying user identity through JWT tokens and OAuth 2.0
2. **Secure Communications** — Protecting data in transit via TLS/HTTPS
3. **Data Protection** — Storing sensitive tokens in the iOS Keychain
4. **Digital Signature** — JWT signing for session validation

The app does **not**:
- Implement custom or proprietary encryption algorithms
- Provide end-to-end encrypted messaging between users
- Use encryption for purposes beyond authentication, secure communications, or data protection
- Export encryption technology to embargoed countries (Cuba, Iran, North Korea, Sudan, Syria)

---

## 5. Contact Information

| Role | Contact |
|------|---------|
| **Developer / Technical Contact** | *(Insert your name/email)* |
| **Legal / Compliance Contact** | *(Insert your name/email)* |
| **Support URL** | https://soberclub.app/support |

---

## Appendix A: Technical References

| Standard | Reference |
|----------|-----------|
| **TLS 1.3** | RFC 8446 |
| **TLS 1.2** | RFC 5246 |
| **JWT (JSON Web Tokens)** | RFC 7519 |
| **OAuth 2.0** | RFC 6749 |
| **AES (Advanced Encryption Standard)** | FIPS PUB 197 |
| **SHA-256** | FIPS PUB 180-4 |
| **EAR License Exception TSU** | 15 CFR § 740.13 |
| **Apple Export Compliance** | https://developer.apple.com/documentation/security/complying_with_encryption_export_regulations |

---

## Appendix B: Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | June 2026 | Initial documentation for App Store submission |

---

*This document is prepared in accordance with Apple's App Store Connect encryption documentation requirements and U.S. Export Administration Regulations (EAR).*

# ID-SHIELD AI — AI Document Screening & Verification System

AI-powered document screening, tampering detection, and identity verification system.

---

## 🚀 GitHub Se Deploy Aur Host Karne Ke Tarike (Deployment Guide)

Aap is project ko do tarike se GitHub ke through host kar sakte hain:

---

### Option 1: Full-Stack Free Cloud Hosting (Recommended for 100% AI Functions)
Kyuki Gemini API key aur image processing backend Express server (`server.ts`) par run hoti hai, full-stack host karne se AI 100% automatically work karega:

#### A. Render Par Host Karna (1-Click Free):
1. Apne code ko GitHub repository me push karein.
2. [Render.com](https://render.com) par login karein aur **"New +" -> "Web Service"** select karein.
3. Apni GitHub repository select karein.
4. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. **Environment Variables** me add karein:
   - `GEMINI_API_KEY`: Aapki Google Gemini API key
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**. Aapki website live ho jayegi aur AI seamlessly work karega!

#### B. Vercel Par Host Karna (1-Click Free):
1. Apne code ko GitHub par push karein.
2. [Vercel.com](https://vercel.com) par jayein aur **"Add New" -> "Project"** select karein.
3. GitHub repository import karein (`vercel.json` already configured hai).
4. Environment Variables me `GEMINI_API_KEY` set karein aur **Deploy** click karein.

---

### Option 2: GitHub Pages Par Host Karna (Static Frontend)
Aapke repository me **GitHub Actions Workflow** (`.github/workflows/static.yml`) configure kar diya gaya hai.

#### Steps:
1. Apne GitHub repository me jayein.
2. **Settings** tab -> **Pages** (left menu) me jayein.
3. **Build and deployment** -> **Source** ko **"GitHub Actions"** par set karein.
4. (Optional for Live AI Backend): Agar aapne backend Render/Vercel par deploy kiya hai, to **Settings -> Secrets and variables -> Actions** me jayein aur `VITE_API_BASE_URL` secret add karein (jaise `https://your-backend.onrender.com`).
5. Jab bhi aap `main` ya `master` branch par push karenge, GitHub Actions automatic project build karega (`npm run build`) aur site ko deploy kar dega!

---

## 🛠️ Local Development (Apne Computer Par Run Karna)

```bash
# 1. Dependencies install karein
npm install

# 2. .env file create karein aur Gemini API key daalein
cp .env.example .env
# .env me GEMINI_API_KEY="your_api_key_here" add karein

# 3. Development server start karein
npm run dev

# 4. Production build test karein
npm run build
npm start
```

---

## ⚙️ Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini AI API key (Backend / AI analysis ke liye) |
| `VITE_API_BASE_URL` | (Optional) External backend URL agar frontend GitHub Pages par ho |
| `NODE_ENV` | `production` ya `development` |

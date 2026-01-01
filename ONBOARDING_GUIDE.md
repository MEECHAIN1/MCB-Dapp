# 🧑‍💻 Onboarding Guide — MeeChain MeeBot DApp

## 🔧 Requirements
- **Node.js**: v22.x (Required for stability and dependency compatibility)  
- **npm**: ≥10.5.1  
- **Git**: For cloning and version control  
- **Vercel CLI** or **Netlify CLI**: For deployment workflows

---

## 📦 Setup Local Environment

1. **Clone the repository**
   ```bash
   git clone https://github.com/meechain1/meechain-meebot-dapp.git
   cd meechain-meebot-dapp
   ```

2. **Install dependencies**
   ```bash
   # Clean start to prevent dependency ghosts
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root based on the following template:
   ```env
   VITE_RPC_URL=https://rpc.meebot.xyz
   VITE_CHAIN_ID=1337
   VITE_NFT_ADDRESS=0x...
   VITE_STAKING_ADDRESS=0x...
   VITE_TOKEN_ADDRESS=0x...
   VITE_MARKETPLACE_ADDRESS=0x...
   VITE_API_KEY=your-gemini-api-key
   ```

---

## 🧪 Development Workflow

- **Start Dev Server**
  ```bash
  npm run dev
  ```
  → Accessible at `http://localhost:5173/` (or assigned port)

- **Execute Unit Tests**
  Ensure contract services remain type-safe and functional:
  ```bash
  npm run test
  ```

- **Build Production Bundle**
  ```bash
  npm run build
  ```

- **Preview Local Build**
  Test the production build locally before deployment:
  ```bash
  npm run preview
  ```

---

## 🚀 Deployment Ritual

### Vercel
```bash
npx vercel link
npx vercel --prod
```

### Netlify
```bash
netlify deploy --dir=dist --prod
```

---

## 🎯 Contributor Rituals
- **Node Precision**: Always use Node.js 22 to match the project's performance profile.
- **Dependency Integrity**: Use `npm install --legacy-peer-deps` to handle strict peer dependency requirements.
- **Security Check**: Never commit your `.env` file or raw API keys.
- **Verification**: Always run `npm run preview` to verify SPA routing and asset paths before pushing to production.

---
*MeeChain MeeBot DApp — Forged in the Nexus, Committed to the Chain.*
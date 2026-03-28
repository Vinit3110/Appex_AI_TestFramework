# 🧠 AI-Powered Cross-Platform Test Automation Platform

> A unified testing platform for Web + Mobile apps with AI-generated tests and failure analysis.

---

## 🗺️ Build Progress

| Step | Feature                          | Status   |
|------|----------------------------------|----------|
| 1    | Playwright Web Tests (Foundation)| ✅ Done   |
| 2    | Gemini AI — Test Generator       | 🔜 Next   |
| 3    | Node.js Backend + REST API       | 🔜        |
| 4    | React Frontend Dashboard         | 🔜        |
| 5    | Firebase Integration             | 🔜        |
| 6    | CI/CD + Appium Mobile            | 🔜        |

---

## ⚡ Quick Start (Step 1)

### 1. Install dependencies
```bash
npm install
npx playwright install
```

### 2. Set up environment
```bash
cp .env.example .env
# .env is pre-filled for SauceDemo — no changes needed for Step 1
```

### 3. Run tests
```bash
# Headless (default — faster)
npm test

# Headed (watch the browser)
npm run test:headed

# Debug mode (step through each action)
npm run test:debug
```

### 4. View the HTML report
```bash
npm run test:report
```

---

## 🧪 Test Cases (Step 1)

| ID     | Scenario                          | Expected Result                  |
|--------|-----------------------------------|----------------------------------|
| TC-01  | Valid credentials                 | Redirects to `/inventory`        |
| TC-02  | Wrong password                    | Error: credentials don't match   |
| TC-03  | Empty username                    | Error: Username is required      |
| TC-04  | Empty password                    | Error: Password is required      |
| TC-05  | Both fields empty                 | Error banner appears             |
| TC-06  | Locked-out user                   | Error: user has been locked out  |
| TC-07  | Login → Logout → Re-login         | Second login also succeeds       |

---

## 📁 Project Structure

```
/project
  /backend
    /test-engine
      /web
        /pages          ← Page Object Models
          LoginPage.js
          InventoryPage.js
        /tests
          login.spec.js
    /reports            ← Auto-generated after test run
      test-results.json
      /artifacts        ← Screenshots of failures
  /playwright-report    ← Visual HTML report
  playwright.config.js
  package.json
  .env.example
```

---

## 🧩 Tech Stack

| Layer        | Technology              |
|--------------|-------------------------|
| Web Testing  | Playwright              |
| Language     | Node.js / JavaScript    |
| Test Target  | saucedemo.com           |
| AI (Step 2)  | Gemini API              |
| Backend (3)  | Express.js              |
| Frontend (4) | React                   |
| Storage (5)  | Firebase Firestore      |
| CI/CD (6)    | GitHub Actions          |

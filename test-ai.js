// test-ai.js
require('dotenv').config();
const { analyzeFailure } = require('./backend/ai/failureAnalyzer');

const fakeError = `
  TimeoutError: page.click: Timeout 30000ms exceeded.
  Locator: getByRole('button', { name: 'Login' })
  at LoginPage.clickLogin (LoginPage.js:25)
`;

analyzeFailure(fakeError)
  .then(result => {
    console.log('✅ AI Analysis Result:');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(err => console.error('❌ Error:', err.message));
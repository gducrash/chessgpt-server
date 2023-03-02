const fs = require('fs');
const path = require('path');

const REPLACE_START = `(function () { return __awaiter`;
const REPLACE_END = `; })()`;
const REPLACE_WITH = `import('chatgpt').then(function (chatpgt) {
    var ChatGPTAPI = chatpgt.ChatGPTAPI;
    api = new ChatGPTAPI({
        apiKey: process.env.OPENAI_API_KEY,
        systemMessage: constants_js_1.SYSTEM_PROMPT,
    });
    console.log('🤖 ChatGPT API initialized');
})`;

const file = fs.readFileSync(path.join(__dirname, 'dist', 'api.js'), 'utf8');
const newFile = file.split(REPLACE_START)[0] + REPLACE_WITH + file.split(REPLACE_END)[1] ?? '';

fs.writeFileSync(path.join(__dirname, 'dist', 'api.js'), newFile);
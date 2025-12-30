const express = require('express');
const app = express();

app.use((req, res, next) => {
    console.log(`\n🔔 HIT! Request received: ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Server is working!');
});

app.listen(4000, '0.0.0.0', () => {
    console.log('🚀 Test Server running on http://127.0.0.1:4000');
});
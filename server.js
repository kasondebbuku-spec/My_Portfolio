const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public')); // serves index.html, cv.pdf, etc.

// Serve the main HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// CV download endpoint
app.get('/cv.pdf', (req, res) => {
  const cvPath = path.join(__dirname, 'public', 'Kasonde_Bbuku_CV.pdf');
  if (fs.existsSync(cvPath)) {
    res.download(cvPath, 'Kasonde_Bbuku_CV.pdf');
  } else {
    res.status(404).send('CV file not found. Please place your PDF as public/Kasonde_Bbuku_CV.pdf');
  }
});

// Contact form endpoint – stores messages in messages.json
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const newMessage = {
    id: Date.now(),
    name,
    email,
    message,
    date: new Date().toISOString()
  };

  const dataFile = path.join(__dirname, 'messages.json');
  let messages = [];
  if (fs.existsSync(dataFile)) {
    try {
      messages = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (e) { messages = []; }
  }
  messages.push(newMessage);
  fs.writeFileSync(dataFile, JSON.stringify(messages, null, 2));

  console.log(`📩 New message from ${name} (${email})`); // also visible in terminal
  res.json({ message: 'Thank you! I will get back to you soon.' });
});

app.listen(PORT, () => {
  console.log(`✅ Portfolio running at http://localhost:${PORT}`);
  console.log(`📁 Messages will be saved in messages.json`);
});
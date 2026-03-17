require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const appointmentRoutes = require('./routes/appointments');
const aiAgentRoutes = require('./routes/aiAgent');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/voice-ai-appointments';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai-agent', aiAgentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


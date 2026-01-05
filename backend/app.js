const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectToDatabase } = require('./db');
const errorHandlerMiddleware = require('./middlewares/errorHandlerMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const dolgozoRoutes = require('./routes/dolgozoRoutes');
const ruhaRoutes = require('./routes/ruhaRoutes');
const ruhakibeRoutes = require('./routes/ruhakibeRoutes');
const rendelesRoutes = require('./routes/rendelesRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportsRoutes = require('./routes/reportsRoutes');

// Express app létrehozása
const app = express();

// Middleware-ek
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Munyire Backend API' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dolgozok', dolgozoRoutes);
app.use('/api/ruhak', ruhaRoutes);
app.use('/api/ruhakibe', ruhakibeRoutes);
app.use('/api/rendelesek', rendelesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Végpont nem található' });
});

// Error handler (legutolsó middleware)
app.use(errorHandlerMiddleware);

// Szerver indítása
const PORT = process.env.PORT || 3001;

async function initializeApp() {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`A szerver fut a http://localhost:${PORT} címen.`);
    });
  } catch (error) {
    console.error('Hiba az alkalmazás inicializálásakor:', error);
    process.exit(1);
  }
}

initializeApp();

module.exports = app;


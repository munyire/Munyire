const express = require('express');
const cors = require('cors');
const db = require('./database');
const dolgozokRouter = require('./routes/dolgozok');
const ruhakRouter = require('./routes/ruhak');
const ruhakibeRouter = require('./routes/ruhakibe');
const rendelesekRouter = require('./routes/rendelesek');
const authRouter = require('./routes/auth');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Munyire Backend API is running!');
});

// API routes
app.use('/api/auth', authRouter);
// Apply authentication middleware to all routes below this line
app.use(authMiddleware);
app.use('/api/dolgozok', dolgozokRouter);
app.use('/api/ruhak', ruhakRouter);
app.use('/api/ruhakibe', ruhakibeRouter);
app.use('/api/rendelesek', rendelesekRouter);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import routes from './routes/index.js'; // <-- Import all routes
import feedbackRoutes from './routes/feedback.js'; // 👈 Import feedback routes

dotenv.config();

const app = express();

// Allow frontend at Vite default port
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => res.send('API is running'));

// Mount all API routes
app.use('/api', routes);

// 👇 Mount feedback routes
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

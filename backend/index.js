const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 15000;
const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/todos';

// Middleware
app.use(cors());
app.use(express.json());

// Mongoose Schema & Model
const Task = mongoose.model('Task', new mongoose.Schema({
    text: String,
    completed: Boolean
}));

// Routes
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Connect to MongoDB and start server
const connectWithRetry = () => {
    console.log('Trying to connect to MongoDB...');
    mongoose.connect(mongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => {
            console.log('MongoDB connected');
            app.listen(PORT, () => {
                console.log(`Backend running on port ${PORT}`);
            });
        })
        .catch(err => {
            console.error('MongoDB connection error. Retrying in 5s...', err.message);
            setTimeout(connectWithRetry, 5000);
        });
};

connectWithRetry();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://mongo:27017/mernapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// Define a simple message route
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from the server!' });
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

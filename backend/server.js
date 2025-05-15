const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 4000;
const JWT_SECRET = 'your_jwt_secret_here_change_this'; // Change this to a secure string in production

// Middleware
app.use(cors());
app.use(bodyParser.json());

// PostgreSQL connection setup
const pool = new Pool({
  connectionString: 'postgresql://postgres:1234567890@localhost:5432/storeratingsdb'
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer token

  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome to Store Ratings App Backend!');
});

// User signup
app.post('/api/users/signup', async (req, res) => {
  try {
    const { email, password, name, address } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email=$1', [
      email.toLowerCase(),
    ]);
    if (existingUser.rowCount > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role',
      [name, email.toLowerCase(), hashedPassword, address || '', 'normal']
    );

    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Signup error: ', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    const userRes = await pool.query('SELECT * FROM users WHERE email=$1', [email.toLowerCase()]);

    if (userRes.rowCount === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = userRes.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login error: ', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List stores with average ratings
app.get('/api/stores', async (req, res) => { // Removed authenticateToken
  try {
    const result = await pool.query(`
      SELECT stores.id, stores.name, stores.address,
        COALESCE(AVG(ratings.rating),0)::numeric(2,1) AS average_rating
      FROM stores
      LEFT JOIN ratings ON stores.id = ratings.store_id
      GROUP BY stores.id
      ORDER BY stores.name ASC
    `);

    res.json({ stores: result.rows });
  } catch (err) {
    console.error('Error fetching stores: ', err);
    res.status(500).json({ error: 'Failed to fetch stores' });
  }
});


// Submit or update rating for a store
app.post('/api/stores/:id/rate', authenticateToken, async (req, res) => {
  try {
    const storeId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const existingRating = await pool.query(
      'SELECT id FROM ratings WHERE user_id=$1 AND store_id=$2',
      [userId, storeId]
    );

    if (existingRating.rowCount > 0) {
      await pool.query(
        'UPDATE ratings SET rating=$1 WHERE user_id=$2 AND store_id=$3',
        [rating, userId, storeId]
      );
      res.json({ message: 'Rating updated' });
    } else {
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
        [userId, storeId, rating]
      );
      res.status(201).json({ message: 'Rating submitted' });
    }
  } catch (err) {
    console.error('Error submitting rating: ', err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

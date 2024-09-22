const express = require('express');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const databasePath = path.join(__dirname, 'userdatabase.DB');
const app = express();
app.use(express.json());

// Enable CORS only for a specific frontend domain
app.use(cors({
  origin: 'http://localhost:3001', // Replace with your frontend domain
}));

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(process.env.PORT ||3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

// new user registration
const validatePassword = (password) => {
  return password.length > 4;
};

app.post('/register', async (request, response) => {
    const { username, email, password} = request.body;
    console.log('Received data:', { username, email, password});

    // Check if the password meets the length requirement
    if (!validatePassword(password)) {
      return response.status(400).send({ error: 'Password is too short' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const selectUserQuery = `SELECT * FROM userinfo WHERE username = ?`;
    const databaseUser = await database.get(selectUserQuery, [username]);
  
    if (databaseUser === undefined) {
      const createUserQuery = `
        INSERT INTO userinfo (username, email, password)
        VALUES (?, ?, ?);`; // Fixed the SQL query
  
      if (validatePassword(password)) {
        await database.run(createUserQuery, [username, email, hashedPassword]);
        response.status(200).send({ message: 'User created successfully' });
      } else {
        response.status(400);
        response.send('Password is too short');
      }
    } else {
      response.status(400);
      response.send('User already exists');
    }
  });

// user login
app.post('/login', async (request, response) => {
    const { username, password } = request.body;
    const selectUserQuery = `SELECT * FROM userinfo WHERE username = ?`;
    const dbUser = await database.get(selectUserQuery, [username]);
    
    if (dbUser === undefined) {
      response.status(400);
      response.send('Invalid User');
    } else {
      const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
      if (isPasswordMatched) {
        response.send('Login Success!');
      } else {
        response.status(400);
        response.send('Invalid Password');
      }
    }
  });

// generating jwt token
app.post('/login_token', async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `SELECT * FROM userinfo WHERE username = ?`;
  const dbUser = await database.get(selectUserQuery, [username]);
  
  if (dbUser === undefined) {
    response.status(400).send({ error_msg: 'Invalid User' });
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched) {
      const payload = { username };
      const jwtToken = jwt.sign(payload, 'MY_SECRET_TOKEN');
      response.send({ jwt_token: jwtToken });
    } else {
      response.status(400).send({ error_msg: 'Invalid Password' });
    }
  }
});

// Middleware to authenticate token
const authenticateToken = (request, response, next) => {
  const authHeader = request.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    // Return 400 error if the token is not provided
    return response.status(400).send({ error: 'Token not provided' });
  }

  jwt.verify(token, 'MY_SECRET_TOKEN', (err, user) => {
    if (err) return response.status(403).send('Invalid Token');
    request.user = user;
    next();
  });
};



// Helper function to build the WHERE clause based on query parameters
const buildWhereClause = (activeCategoryId, titleSearch, rating) => {
  const conditions = [];
  
  if (activeCategoryId) {
    conditions.push(`category_id = ?`);
  }

  if (titleSearch) {
    conditions.push(`title LIKE ?`);
  }

  if (rating) {
    conditions.push(`rating >= ?`);
  }

  return conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
};

// GET Products with filtering and sorting
app.get('/products', authenticateToken, async (request, response) => {
  try {
    console.log('Received query parameters:', request.query);
    const { sort_by, activeCategoryId, title_search, rating } = request.query;

    // Determine the sort order
    let sortOrder = 'ASC';
    if (sort_by === 'PRICE_HIGH') {
      sortOrder = 'DESC';
    } else if (sort_by === 'PRICE_LOW') {
      sortOrder = 'ASC';
    }

    const whereClause = buildWhereClause(activeCategoryId, title_search, rating);

    let getProductsQuery = `
      SELECT * FROM products 
      ${whereClause}
      ORDER BY price ${sortOrder};`;

    const params = [];
    if (activeCategoryId) {
      params.push(Number(activeCategoryId)); // Convert to number if necessary
    }
    if (title_search) {
      params.push(`%${title_search}%`);
    }
    if (rating) {
      params.push(rating);
    }

    const products = await database.all(getProductsQuery, params);
    console.log('Fetched products:', products);

    if (products.length === 0) {
      return response.json({ products: [], message: 'No products found' });
    }

    response.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    response.status(500).send('Error fetching products');
  }
});



// READ prime-Products
app.get('/prime_deals', authenticateToken, async (request, response) => {
  try {
    const { sort_by = 'price', limit = 10, offset = 0 } = request.query;
    const getProductsQuery = `
      SELECT * FROM prime_deals 
      ORDER BY ${sort_by} 
      LIMIT ? OFFSET ?;
    `;
    const products = await database.all(getProductsQuery, [limit, offset]);
    response.json({ prime_deals: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    response.status(500).send({ error: 'Error fetching products' });
  }
});

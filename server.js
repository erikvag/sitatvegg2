const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const session = require('express-session');

const app = express();
const PORT = 3000;
const ADMIN_PASSWORD = 'n4fabruker'; // Change this to your secure password

// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Session setup
app.use(session({
    secret: 'sitatveggen_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set secure: true when using HTTPS
}));

const quotesFile = path.join(__dirname, 'data/quotes.json');
let quotes = [];

// Load quotes from the JSON file
try {
    quotes = JSON.parse(fs.readFileSync(quotesFile));
} catch (error) {
    console.error("Failed to load quotes:", error);
}

// Helper function to generate a unique ID
function generateId() {
    return crypto.randomUUID();
}

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Route: Login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Route: Handle login
app.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/admin');
    } else {
        res.status(403).send('Invalid Password');
    }
});

// Route: Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Route: Home page
app.get('/', (req, res) => {
    res.render('index', { quotes });
});

// Route: Fetch quotes (API endpoint)
app.get('/quotes', (req, res) => {
    res.json(quotes);
});

// Route: Admin page (requires authentication)
app.get('/admin', isAuthenticated, (req, res) => {
    res.render('admin', { quotes });
});

// Route: Add a new quote
app.post('/add-quote', (req, res) => {
    const { text, author } = req.body;
    if (text) {
        const newQuote = { id: generateId(), text, author: author || "Unknown", upvotes: 0 };
        quotes.push(newQuote);
        fs.writeFileSync(quotesFile, JSON.stringify(quotes, null, 2));
        res.redirect('/');
    } else {
        res.status(400).send("Invalid input");
    }
});

// Route: Upvote a quote
app.post('/upvote', (req, res) => {
    const { id } = req.body;
    const quote = quotes.find(q => q.id === id);
    if (quote) {
        quote.upvotes += 1;
        fs.writeFileSync(quotesFile, JSON.stringify(quotes, null, 2));
        res.json({ upvotes: quote.upvotes });
    } else {
        res.status(400).send("Quote not found");
    }
});

// Route: Delete a quote (requires authentication)
app.post('/delete-quote', isAuthenticated, (req, res) => {
    const { id } = req.body;
    const index = quotes.findIndex(q => q.id === id);
    if (index !== -1) {
        quotes.splice(index, 1);
        fs.writeFileSync(quotesFile, JSON.stringify(quotes, null, 2));
        res.json({ success: true });
    } else {
        res.status(400).send("Quote not found");
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

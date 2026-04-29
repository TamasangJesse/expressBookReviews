const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Username and password required" });
  if (isValid(username)) return res.status(400).json({ message: "Username already exists" });
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

// Get all books using async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/books-internal');
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(200).json(books);
  }
});

// Get book by ISBN using Promise with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/isbn-internal/${isbn}`)
    .then(response => res.status(200).json(response.data))
    .catch(() => {
      const book = books[isbn];
      if (book) return res.status(200).json(book);
      return res.status(404).json({ message: "Book not found" });
    });
});

// Get books by author using async/await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const result = await new Promise((resolve, reject) => {
      const matched = Object.entries(books)
        .filter(([, b]) => b.author.toLowerCase() === author.toLowerCase())
        .map(([isbn, b]) => ({ isbn, ...b }));
      if (matched.length > 0) resolve(matched);
      else reject("No books found for this author");
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

// Get books by title using async/await
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const result = await new Promise((resolve, reject) => {
      const matched = Object.entries(books)
        .filter(([, b]) => b.title.toLowerCase().includes(title.toLowerCase()))
        .map(([isbn, b]) => ({ isbn, ...b }));
      if (matched.length > 0) resolve(matched);
      else reject("No books found for this title");
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) return res.status(200).json(book.reviews);
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;

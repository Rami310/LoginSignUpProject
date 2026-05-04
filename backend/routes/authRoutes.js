const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");
const { validateSignup, validateLogin } = require("../middlewares/validateAuth");
const upload = require("../middlewares/upload");

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// SIGN UP
router.post("/signup", validateSignup, async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1. Check if user already exists
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length > 0) {
          return res.status(400).json({ error: "User already exists" });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert user into DB
        db.query(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          [username, email, hashedPassword],
          (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({ message: "User created successfully" });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post("/login", validateLogin, (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0) {
          return res.status(400).json({ error: "User not found" });
        }

        const user = result[0];

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res.status(400).json({ error: "Invalid credentials" });
        }

        // 3. Success
        const token = jwt.sign(
            { id: user.id, email: user.email },
            SECRET,
            { expiresIn: "1h" }
            );

        res.status(200).json({
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/upload-profile", authMiddleware, upload.single("image"), (req, res) => {
  const imageUrl = req.file.path;

  db.query(
    "UPDATE users SET profile_image = ? WHERE id = ?",
    [imageUrl, req.user.id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({ message: "Image uploaded", imageUrl });
    }
  );
});

router.get("/profile", authMiddleware, (req, res) => {
  db.query(
    "SELECT id, username, email, created_at FROM users WHERE id = ?",
    [req.user.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        message: "Profile data",
        user: result[0]
      });
    }
  );
});

module.exports = router;
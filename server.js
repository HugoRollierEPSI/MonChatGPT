require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('questions.db');
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Crée la BDD
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT)");
});

// Insert les questions
app.post('/api/questions', (req, res) => {
  const { question } = req.body;
  const stmt = db.prepare("INSERT INTO questions (question) VALUES (?)");
  stmt.run(question, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, question });
  });
});

// Recupère les questions pour l'affichage
app.get('/api/questions', (req, res) => {
  db.all("SELECT * FROM questions ORDER BY id DESC LIMIT 10", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Envoie la question
async function queryModelWithFetch(inputText) {
  const MODEL_NAME = "mistralai/Mistral-Nemo-Instruct-2407";

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: inputText,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Réponse de l'IA
app.post('/api/query-model', async (req, res) => {
  try {
    const { question } = req.body;
    const response = await queryModelWithFetch(question);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

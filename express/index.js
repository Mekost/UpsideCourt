require("dotenv").config();

const path = require("path");
const express = require("express");
const multer = require("multer");
const { OpenAI } = require("openai");
const fs = require("fs");
const cors = require("cors");
const mammoth = require("mammoth");

const app = express();
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PORT = 3000;

app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `# ROLE
You are an Educational Data Architect. Transform unstructured notes into a structured JSON knowledge base.

# TASK
Analyze the [TEXT] and extract key educational topics. 
Return a JSON object containing a key "knowledge_base" which is an array of objects.

# OUTPUT SCHEMA (JSON)
{
  "knowledge_base": [
    {
      "id": number, // Sequential starting from 0
      "topic": "string", // A concise title for the concept/paragraph
      "citations": ["string"], // Array of all exact, direct quotes from the text supporting this topic. Contains long quotes if necessary.
      "keywords": ["string"], // 3-5 essential terminology words
      "base_facts": ["string"] // Exactly 2-3 objective, factual sentences summarizing the core information about the topic
    }
  ]
}

# CONSTRAINTS
- **Accuracy:** Only include facts present in the text.
- **Strict JSON:** Output ONLY valid JSON. No conversational filler, no markdown code blocks, and no preamble.
- **Granularity:** Break the text down by logical concept shifts. If a paragraph covers two distinct ideas, create two objects.
- **Language:** Maintain the language of the source text.`;

async function callOpenAIWithRetry(content, maxRetries = 3) {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Process these notes into the specified JSON format:\n\n${content}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.15,
      });

      const rawContent = completion.choices[0].message.content;
      return JSON.parse(rawContent);
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts} failed:`, error.message);
      if (attempts >= maxRetries) throw error;
    }
  }
}

app.post("/process-notes", upload.array("notes"), async (req, res) => {
  const quizName = req.body.quizName;
  if (!quizName) return res.status(400).json({ error: "Missing quizName" });
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: "No files uploaded" });

  const notesDir = path.join(__dirname, "notes", quizName);
  const jsonDir = path.join(__dirname, "json", quizName);
  fs.mkdirSync(notesDir, { recursive: true });
  fs.mkdirSync(jsonDir, { recursive: true });

  let combinedText = "";

  try {
    // Process each file in the array
    for (const file of req.files) {
      const extension = path.extname(file.originalname).toLowerCase();
      const permanentPath = path.join(notesDir, file.originalname);

      // Move file to permanent storage
      fs.renameSync(file.path, permanentPath);

      // Extract Text based on file type
      if (extension === ".docx") {
        const result = await mammoth.extractRawText({ path: permanentPath });
        combinedText += `\n--- Source: ${file.originalname} ---\n${result.value}`;
      } else if (extension === ".txt") {
        const text = fs.readFileSync(permanentPath, "utf-8");
        combinedText += `\n--- Source: ${file.originalname} ---\n${text}`;
      }
    }

    // AI Processing of the combined content
    const result = await callOpenAIWithRetry(combinedText);

    // Save output
    const outputFilePath = path.join(jsonDir, "knowledge.json");
    fs.writeFileSync(outputFilePath, JSON.stringify(result, null, 2));

    res.json(result);
  } catch (error) {
    console.error("Processing Error:", error);
    res.status(500).json({ error: "Failed to process documents." });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

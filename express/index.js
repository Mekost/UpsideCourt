require("dotenv").config();

const path = require("path");
const express = require("express");
const multer = require("multer");
const { OpenAI } = require("openai");
const fs = require("fs");
const cors = require("cors");
const mammoth = require("mammoth");
const pdf = require("pdf-extraction");
const Tesseract = require("tesseract.js");

const app = express();
const upload = multer({ dest: "uploads/" });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const PORT = 3000;

app.use(cors());
app.use(express.json());

let lastGeneratedQuestion = null;

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
  if (!quizName || !req.files)
    return res.status(400).json({ error: "Data missing" });

  const notesDir = path.join(__dirname, "notes", quizName);
  const jsonDir = path.join(__dirname, "json", quizName);
  fs.mkdirSync(notesDir, { recursive: true });
  fs.mkdirSync(jsonDir, { recursive: true });

  let combinedText = "";

  try {
    for (const file of req.files) {
      const extension = path.extname(file.originalname).toLowerCase();
      const permanentPath = path.join(notesDir, file.originalname);
      fs.renameSync(file.path, permanentPath);

      console.log(`--- Processing: ${file.originalname} ---`);

      if (extension === ".docx") {
        const result = await mammoth.extractRawText({ path: permanentPath });
        combinedText += `\n[DOCX: ${file.originalname}]\n${result.value}`;
      } else if (extension === ".txt") {
        combinedText += `\n[TXT: ${file.originalname}]\n${fs.readFileSync(
          permanentPath,
          "utf-8"
        )}`;
      } else if (extension === ".pdf") {
        const dataBuffer = fs.readFileSync(permanentPath);
        const data = await pdf(dataBuffer);
        combinedText += `\n[PDF: ${file.originalname}]\n${data.text}`;
      } else if ([".png", ".jpg", ".jpeg"].includes(extension)) {
        console.log(`Starting OCR for ${file.originalname}...`);
        const result = await Tesseract.recognize(permanentPath, "eng", {
          logger: (m) =>
            console.log(
              `OCR Progress: ${m.status} (${Math.round(m.progress * 100)}%)`
            ),
        });
        combinedText += `\n[IMAGE OCR: ${file.originalname}]\n${result.data.text}`;
      }
    }

    if (!combinedText.trim()) {
      throw new Error("No text could be extracted from any files.");
    }

    console.log("Extraction complete. Sending to AI...");
    const result = await callOpenAIWithRetry(combinedText);

    fs.writeFileSync(
      path.join(jsonDir, "knowledge.json"),
      JSON.stringify(result, null, 2)
    );
    res.json(result);
  } catch (error) {
    console.error("Final Processing Error:", error);
    res.status(500).json({ error: "Failed to process notes." });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
});
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

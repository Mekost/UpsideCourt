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

app.get("/get-cases", async (req, res) => {
  try {
    const notesDir = path.join(__dirname, "notes");
    // Ensure cases directory exists
    if (!fs.existsSync(notesDir)) {
      return res.json([]);
    }

    const entries = fs.readdirSync(notesDir, { withFileTypes: true });

    const cases = entries
      .filter((entry) => entry.isDirectory())
      .map((dir, index) => {
        return {
          id: index + 1,
          name: dir.name,
        };
      });

    res.json(cases);
  } catch (err) {
    console.error("Failed to read cases:", err);
    res.status(500).json({ error: "Failed to load cases" });
  }
});

const QUESTION_SYSTEM_PROMPT = `# ROLE
You are an Examiner. Your task is to create an educational question based strictly on provided text.

# TASK
Generate ONE question that tests the understanding of the [SOURCE TEXT].

# OUTPUT SCHEMA (JSON)
{
  "question": "string" // The generated question
}

# CONSTRAINTS
- Base the question ONLY AND EXCLUSIVELY on the provided topic and source text.
- Do not use outside knowledge.
- Output ONLY valid JSON.`;

async function generateQuestionWithRetry(topic, cited, maxRetries = 3) {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: QUESTION_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Topic: ${topic}\nSource text: "${cited}"`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const rawContent = completion.choices[0].message.content;
      return JSON.parse(rawContent);
    } catch (error) {
      attempts++;
      console.error(`Generate Question Attempt ${attempts} failed:`, error.message);
      if (attempts >= maxRetries) throw error;
    }
  }
}

app.post("/generate-question", async (req, res) => {
  try {
    const { quizName, id } = req.body;

    if (!quizName || id === undefined) {
      return res.status(400).json({ error: "Missing 'quizName' or 'id' fields." });
    }

    const jsonFilePath = path.join(__dirname, "json", quizName, "knowledge.json");
    if (!fs.existsSync(jsonFilePath)) {
      return res.status(404).json({ error: `Quiz '${quizName}' not found. Did you run /process-notes first?` });
    }

    const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
    const data = JSON.parse(fileContent);

    const item = data.knowledge_base.find((q) => q.id === parseInt(id));

    if (!item) {
      return res.status(404).json({ error: `Question with ID ${id} not found in quiz '${quizName}'.` });
    }

    const topic = item.topic;
    const cited = item.citations.join(" "); 

    const result = await generateQuestionWithRetry(topic, cited);

    lastGeneratedQuestion = result.question;

    res.json({
      id: item.id,
      topic: item.topic,
      question: result.question
    });

  } catch (error) {
    console.error("Generate Question Error:", error);
    res.status(500).json({ error: "Failed to generate question from file" });
  }
});

const VALIDATION_SYSTEM_PROMPT = `# ROLE
You are a strict Teacher/Grader. Evaluate the student's answer based on the provided Source Text and the SPECIFIC QUESTION asked.

# INPUT DATA
- Source Text: The absolute truth.
- Question: The specific question asked to the student.
- Student Answer: The user's response.

# LOGIC
1. **Relevance:** Does the answer address the **Question**? (If the question is "What is X?" and student answers "Y is great", it is WRONG, even if Y is in the notes).
2. **Accuracy:** Is the answer factually consistent with the **Source Text**?

# OUTPUT SCHEMA (JSON)
{
  "is_correct": boolean,
  "feedback": "string" // Explain if the answer is correct regarding the QUESTION. If wrong, explain why based on Source Text.
}
`;

async function validateAnswerWithRetry(contextItem, userAnswer, questionText, maxRetries = 3) {
  const citedText = contextItem.citations.join(" ");
  const keywordsStr = contextItem.keywords.join(", ");
  const factsStr = contextItem.base_facts.join(". ");

  const userPrompt = `
  Source Text: "${citedText}"
  Required Keywords/Context: ${keywordsStr}, ${factsStr}
  
  ---
  Question Asked: "${questionText}"
  Student Answer: "${userAnswer}"
  ---
  `;

  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          { role: "system", content: VALIDATION_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      attempts++;
      console.error(`Validation Attempt ${attempts} failed:`, error.message);
      if (attempts >= maxRetries) throw error;
    }
  }
}


app.post("/validate-answer", async (req, res) => {
  try {
    const { quizName, id, userAnswer } = req.body;

    if (!quizName || id === undefined || !userAnswer) {
      return res.status(400).json({ error: "Missing fields. Required: quizName, id, userAnswer" });
    }

    if (!lastGeneratedQuestion) {
      return res.status(400).json({ error: "No question generated yet! Call /generate-question first." });
    }

    console.log("Validating against cached question:", lastGeneratedQuestion);

    const jsonFilePath = path.join(__dirname, "json", quizName, "knowledge.json");
    if (!fs.existsSync(jsonFilePath)) {
      return res.status(404).json({ error: `Quiz '${quizName}' not found.` });
    }

    const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
    const data = JSON.parse(fileContent);
    const item = data.knowledge_base.find((q) => q.id === parseInt(id));

    if (!item) {
      return res.status(404).json({ error: `Topic with ID ${id} not found.` });
    }
    const result = await validateAnswerWithRetry(item, userAnswer, lastGeneratedQuestion);

    res.json(result);

  } catch (error) {
    console.error("Validate Answer Error:", error);
    res.status(500).json({ error: "Failed to validate answer" });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

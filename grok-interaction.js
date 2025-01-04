require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { interactWithGrok } = require("./core/ai-service");
const mammoth = require("mammoth");
const XLSX = require("xlsx");

const app = express();
app.use(express.json());
app.use(cors());

// Increase the body size limit:
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// Set up multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit for file uploads
  },
});

// Endpoint to handle chat requests with file upload
app.post("/chat", upload.single("file"), async (req, res) => {
  let prompt = req.body.prompt;

  if (!prompt && (!req.file || !req.file.buffer)) {
    return res.status(400).json({ error: "No prompt or file provided." });
  }

  try {
    let processedContent = prompt || "";

    if (req.file) {
      switch (req.file.mimetype) {
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          const result = await mammoth.convertToHtml({
            buffer: req.file.buffer,
          });
          processedContent = result.value;
          break;
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          processedContent = XLSX.utils
            .sheet_to_json(worksheet, { header: 1 })
            .map((row) => row.join(", "))
            .join("\n");
          break;
        default:
          // If you want to handle other file types or just return the file buffer as string
          processedContent = req.file.buffer.toString("utf-8"); // This is a placeholder for additional file types
      }
    }

    const response = await interactWithGrok(processedContent);
    res.json({ response });
  } catch (error) {
    console.error("Error in /chat:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

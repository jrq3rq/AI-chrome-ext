const axios = require("axios");

// Function to interact with the Grok API
async function interactWithGrok(prompt) {
  const apiKey = process.env.SECOND_GROK_API_KEY;
  const apiUrl = process.env.GROK_API_URL;

  try {
    const response = await axios.post(
      apiUrl,
      {
        messages: [
          { role: "system", content: "You are Grok, an AI assistant." },
          { role: "user", content: prompt },
        ],
        model: "grok-beta",
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "Error with Grok API:",
      error.response?.data || error.message
    );
    return "Sorry, something went wrong.";
  }
}

module.exports = { interactWithGrok };

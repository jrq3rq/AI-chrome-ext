async function interactWithGrok(prompt) {
  console.log("Sending prompt to GROK:", prompt);
  // Make your GROK API call here, using GROK_API_URL and GROK_API_KEY

  // For example:
  const response = await fetch(process.env.GROK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
    },
    body: JSON.stringify({ prompt }),
  });

  // Check the response
  const text = await response.text();
  console.log("GROK raw response:", text);

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error("GROK response is not valid JSON:", e.message);
    throw new Error("GROK API returned invalid JSON");
  }

  // Assuming GROK API returns an object with a 'response' field
  return json.response;
}

// clientMetadata.js

const clientMetadata = {
  firmName: "Global Legal Partners",
  tagline: "Excellence in Corporate Law",
  personInCharge: {
    name: "Elizabeth Carter",
    title: "Managing Partner",
    contact: "elizabeth.carter@globallegalpartners.com",
    phone: "+1 (555) 123-4567",
  },
  locations: [
    {
      office: "Headquarters",
      address: "123 Corporate Drive, Suite 400, New York, NY 10001",
      phone: "+1 (555) 987-6543",
      email: "hq@globallegalpartners.com",
    },
    {
      office: "West Coast Office",
      address: "456 Silicon Blvd, San Francisco, CA 94107",
      phone: "+1 (555) 222-3344",
      email: "sf@globallegalpartners.com",
    },
  ],
  specialties: [
    "Corporate Law",
    "Mergers and Acquisitions",
    "Intellectual Property",
    "Tax Law",
    "Compliance and Risk Management",
  ],
  codeOfConduct: {
    summary:
      "We uphold integrity, confidentiality, and professionalism in all our legal practices. Every team member is expected to adhere to these principles.",
    link: "https://globallegalpartners.com/code-of-conduct",
  },
  confidentialityNotice:
    "This communication, including any attachments, is confidential and intended solely for the individual or entity to whom it is addressed. Unauthorized use is strictly prohibited.",
  legalDisclaimer:
    "The content provided is for informational purposes only and should not be considered legal advice. Consult a qualified attorney for specific legal guidance.",
  responseTemplates: {
    chat: 'You are speaking with Global Legal Partners AI. Please provide details so we can assist you effectively: "{userInput}"',
    summarize:
      "Please summarize the following legal content concisely, ensuring no important details are omitted:\n\n{userInput}",
    generateBulletPoints:
      "Convert the following information into a clear and concise set of bullet points:\n\n{userInput}",
    draftSummary:
      "Create a detailed legal summary for the provided content:\n\n{userInput}",
  },
  branding: {
    logoUrl: "https://globallegalpartners.com/assets/logo.png",
    primaryColor: "#003366",
    secondaryColor: "#6699CC",
    fontFamily: "Roboto, sans-serif",
  },
  hoursOfOperation: {
    weekdays: "9:00 AM - 6:00 PM",
    weekends: "Closed",
    timezone: "Eastern Standard Time (EST)",
  },
};

export default clientMetadata;

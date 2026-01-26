import { google } from "googleapis";

export const config = {
  api: {
    bodyParser: true
  }
};

export default async function handler(req, res) {
  // CORS headers for all responses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { folderName } = req.body;

  if (!folderName) {
    return res.status(400).json({ error: "Missing folderName" });
  }

  try {
    const auth = new google.auth.JWT({
      email: process.env.SERVICE_ACCOUNT_EMAIL,
      key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive"]
    });

    const drive = google.drive({ version: "v3", auth });

    const folder = await drive.files.create({
      resource: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder"
      },
      fields: "id"
    });

    return res.status(200).json({ folderId: folder.data.id });
  } catch (err) {
    console.error("Folder creation error:", err);
    return res.status(500).json({ error: "Failed to create folder" });
  }
}

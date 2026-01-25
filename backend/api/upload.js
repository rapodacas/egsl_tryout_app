import { google } from "googleapis";
import Busboy from "busboy";

export const config = {
  api: {
    bodyParser: false
  }
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const fields = {};
    let fileBuffer = null;
    let fileInfo = null;

    busboy.on("file", (name, file, info) => {
      fileInfo = info;
      const chunks = [];
      file.on("data", chunk => chunks.push(chunk));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    busboy.on("finish", () => {
      resolve({ fields, fileBuffer, fileInfo });
    });

    req.pipe(busboy);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fields, fileBuffer, fileInfo } = await parseForm(req);

    const auth = new google.auth.JWT(
      process.env.SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/drive.file"]
    );

    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.create({
      requestBody: {
        name: fields.filename,
        parents: [fields.folderId]
      },
      media: {
        mimeType: fileInfo.mimeType,
        body: fileBuffer
      },
      fields: "id"
    });

    const driveFileId = response.data.id;
    const driveUrl = `https://drive.google.com/uc?id=${driveFileId}`;

    res.status(200).json({ driveFileId, driveUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
}

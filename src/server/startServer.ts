// *ChatGPT made the inline documentation*
import express, { Request, Response } from "express";
import sharp from "sharp";
import QRCode from "qrcode";
import uniqid from "uniqid";
import validUrl from "valid-url";

// Create an instance of the Express app and set the port
const app = express();
const port = 5000;

// Map to store shortened URLs
const urlMap = new Map<string, string>();

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Default endpoint to test server connection
app.get("/", (req: Request, res: Response) => {
  return res.json({ hey: "hello world" });
});

// Endpoint to shorten URLs
app.post("/urlshorten", (req: Request, res: Response) => {
  const { url } = req.body;

  // Validate that the input URL is valid
  if (!validUrl.isUri(url))
    return res.status(400).json({ error: "Invalid URL" });

  // Generate a unique ID for the URL
  const id = uniqid();

  // Map the URL to the generated ID
  urlMap.set(id, url);

  // Return the shortened URL
  return res.json({ url: `http://localhost:${port}/${id}` });
});

// Endpoint to redirect shortened URLs to their original source
app.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  // Look up the original URL from the map using the shortened ID
  const url = urlMap.get(id);

  // If the URL exists, redirect to its original source
  if (url) {
    return res.redirect(url);
  }

  // If the URL does not exist, return a 404 error
  return res.status(404).json({ error: "Not found" });
});

// Endpoint to generate QR codes from text
app.post("/qrcode", async (req: Request, res: Response) => {
  const { text } = req.body;

  // Generate a QR code as a data URL from the input text
  const qrCode = await QRCode.toDataURL(text);

  // Convert the data URL to a PNG image buffer using Sharp
  const imageBuffer = await sharp(
    Buffer.from(qrCode.replace(/^data:image\/\w+;base64,/, ""), "base64")
  )
    .png()
    .toBuffer();

  // Return the PNG image buffer as the response
  res.writeHead(200, { "Content-Type": "image/png" });
  res.end(imageBuffer);
});

// Endpoint to generate QR codes for shortened URLs
app.post("/qrurlshorten", async (req: Request, res: Response) => {
  const { url } = req.body;

  // Validate that the input URL is valid
  if (!validUrl.isUri(url))
    return res.status(400).json({ error: "Invalid URL" });

  // Generate a unique ID for the URL
  const id = uniqid();

  // Map the URL to the generated ID
  urlMap.set(id, url);

  // Generate a QR code for the shortened URL as a data URL
  const qrCode = await QRCode.toDataURL(`http://localhost:${port}/${id}`);

  // Convert the data URL to a PNG image buffer using Sharp
  const imageBuffer = await sharp(
    Buffer.from(qrCode.replace(/^data:image\/\w+;base64,/, ""), "base64")
  )
    .png()
    .toBuffer();

  // Return the PNG image buffer as the response
  res.writeHead(200, { "Content-Type": "image/png" });
  res.end(imageBuffer);
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

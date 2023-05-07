import express, { Request, Response } from "express";
import sharp from "sharp";
import QRCode from "qrcode";
import uniqid from "uniqid";
import validUrl from "valid-url";

const app = express();
const port = 5000;

const urlMap = new Map<string, string>();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.json({ hey: "hello world" });
});

app.post("/urlshorten", (req: Request, res: Response) => {
  const { url } = req.body;

  if (!validUrl.isUri(url))
    return res.status(400).json({ error: "Invalid URL" });

  const id = uniqid();

  urlMap.set(id, url);

  return res.json({ url: `http://localhost:${port}/${id}` });
});

app.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const url = urlMap.get(id);

  if (url) {
    res.redirect(url);
  }

  return res.status(404).json({ error: "Not found" });
});

app.post("/qrcode", async (req: Request, res: Response) => {
  const { text } = req.body;

  const qrCode = await QRCode.toDataURL(text);

  console.log("qrCode:", qrCode);
  const imageBuffer = await sharp(
    Buffer.from(qrCode.replace(/^data:image\/\w+;base64,/, ""), "base64")
  )
    .png()
    .toBuffer();

  res.writeHead(200, { "Content-Type": "image/png" });
  res.end(imageBuffer);
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

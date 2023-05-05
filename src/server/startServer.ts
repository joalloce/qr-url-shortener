import express, { Request, Response } from "express";
import { nanoid } from "nanoid";
import validUrl from "valid-url";

const app = express();
const port = 3000;

const urlMap = new Map<string, string>();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.json({ hey: "hello world" });
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});

// OpenBooks add-on protocol POC: no dependencies, no content hosting.
// Run with: node server.mjs
import { createServer } from "node:http";

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 8787);
const MAX_BYTES = 16 * 1024;
const headers = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };

const manifest = {
  id: "org.openbooks.examples.public-domain",
  name: "Public Domain Example",
  version: "0.1.0",
  protocolVersion: "1.0",
  description: "Minimal OpenBooks resource connector for a verified Project Gutenberg listing.",
  resources: ["resource"],
  formats: ["epub"],
  endpoints: { resource: "/resource" }
};

function reply(res, status, body) {
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  if (req.url === "/manifest.json") {
    if (req.method !== "GET") return reply(res, 405, { error: "method_not_allowed" });
    return reply(res, 200, manifest);
  }
  if (req.url !== "/resource") return reply(res, 404, { error: "not_found" });
  if (req.method !== "POST") return reply(res, 405, { error: "method_not_allowed" });
  if (!String(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
    return reply(res, 415, { error: "unsupported_media_type" });
  }

  let raw = "";
  try {
    for await (const chunk of req) {
      raw += chunk.toString("utf8");
      if (Buffer.byteLength(raw, "utf8") > MAX_BYTES) {
        return reply(res, 413, { error: "request_too_large" });
      }
    }
    const query = JSON.parse(raw);
    if (!query || typeof query.work?.title !== "string" || !query.work.title.trim()) {
      return reply(res, 400, { error: "invalid_request" });
    }
    const normalize = s => s.normalize("NFKC").trim().toLocaleLowerCase("en");
    const titleMatch = normalize(query.work.title) === "pride and prejudice";
    const authors = Array.isArray(query.work.authors) ? query.work.authors : [];
    const authorMatch = authors.some(author => typeof author === "string" && normalize(author) === "jane austen");
    // Conservative demo: only matches this exact work and known author.
    // Do not claim that an arbitrary ISBN or Portuguese translation was verified.
    const language = query.edition?.language;
    const languageMatch = !language || language === "en";
    const formats = query.preferredFormats;
    const formatMatch = !Array.isArray(formats) || formats.includes("epub");
    if (!titleMatch || !authorMatch || !languageMatch || !formatMatch) {
      return reply(res, 200, { resources: [] });
    }
    return reply(res, 200, {
      resources: [{
        id: "gutenberg-1342-epub",
        name: "Project Gutenberg — Pride and Prejudice (EPUB3)",
        format: "epub",
        language: "en",
        delivery: "direct",
        url: "https://www.gutenberg.org/ebooks/1342.epub3.images",
        rights: {
          status: "public_domain",
          territory: "US",
          note: "Project Gutenberg describes the title as public domain in the USA; verify rules in your jurisdiction."
        },
        match: { scope: "work", editionVerified: false }
      }]
    });
  } catch {
    return reply(res, 400, { error: "invalid_json" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`OpenBooks example add-on at http://${HOST}:${PORT}/manifest.json`);
});

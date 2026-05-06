#!/usr/bin/env node
/**
 * Reconhece e renomeia imagens de clipart usando Claude Vision.
 * Uso: node scripts/rename-cliparts.mjs /caminho/da/pasta
 */

import fs from "fs";
import path from "path";
import https from "https";

const FOLDER = process.argv[2];
if (!FOLDER) {
  console.error("Uso: node scripts/rename-cliparts.mjs /caminho/da/pasta");
  process.exit(1);
}

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_KEY) {
  console.error("Defina ANTHROPIC_API_KEY no ambiente.");
  process.exit(1);
}

const EXTS = [".png", ".jpg", ".jpeg", ".webp"];

function callClaude(base64, mediaType) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 60,
      messages: [{
        role: "user",
        content: [{
          type: "image",
          source: { type: "base64", media_type: mediaType, data: base64 }
        }, {
          type: "text",
          text: "Describe this black and white line art clipart in 2-4 words in English, lowercase, suitable as a filename. Only the description, no punctuation. Examples: 'little bunny', 'space rocket', 'mushroom house', 'birthday cake'. Reply with ONLY the description."
        }]
      }]
    });

    const req = https.request({
      hostname: "api.anthropic.com",
      path: "/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Length": Buffer.byteLength(body),
      }
    }, (res) => {
      let data = "";
      res.on("data", d => data += d);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.content?.[0]?.text?.trim() ?? "");
        } catch { reject(new Error("JSON parse error")); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

async function main() {
  const files = fs.readdirSync(FOLDER)
    .filter(f => EXTS.includes(path.extname(f).toLowerCase()))
    .sort();

  console.log(`\n🎨 ${files.length} imagens encontradas em ${FOLDER}\n`);

  const used = new Set();
  const log = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(FOLDER, file);
    const ext = path.extname(file).toLowerCase();
    const mediaType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

    process.stdout.write(`[${i + 1}/${files.length}] ${file} → `);

    try {
      const buffer = fs.readFileSync(fullPath);
      const base64 = buffer.toString("base64");
      let desc = await callClaude(base64, mediaType);

      // Remove aspas se o modelo retornou
      desc = desc.replace(/['"]/g, "").trim();

      let slug = slugify(desc);
      if (!slug) slug = `clipart-${i + 1}`;

      // Evita duplicatas
      let finalSlug = slug;
      let counter = 2;
      while (used.has(finalSlug)) { finalSlug = `${slug}-${counter++}`; }
      used.add(finalSlug);

      const newName = `${finalSlug}${ext}`;
      const newPath = path.join(FOLDER, newName);

      if (file !== newName) {
        fs.renameSync(fullPath, newPath);
      }

      console.log(`✅ ${newName}`);
      log.push({ original: file, renamed: newName, description: desc });
    } catch (err) {
      console.log(`❌ ERRO: ${err.message}`);
      log.push({ original: file, renamed: file, error: err.message });
    }

    // Pausa para não ultrapassar rate limit (Haiku é rápido mas tem limite)
    if ((i + 1) % 10 === 0) await new Promise(r => setTimeout(r, 1000));
  }

  const logPath = path.join(FOLDER, "_rename-log.json");
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  console.log(`\n✅ Concluído! Log salvo em ${logPath}`);
  console.log(`   ${log.filter(l => !l.error).length} renomeadas · ${log.filter(l => l.error).length} erros`);
}

main().catch(console.error);

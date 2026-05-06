#!/usr/bin/env python3
import os, sys, json, base64, urllib.request, urllib.error, time

FOLDER = sys.argv[1] if len(sys.argv) > 1 else "."
API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
EXTS = {".png", ".jpg", ".jpeg", ".webp"}

def media_type(ext):
    return {"png":"image/png","webp":"image/webp","jpg":"image/jpeg","jpeg":"image/jpeg"}.get(ext,"image/png")

def ask_claude(b64, mtype):
    body = json.dumps({
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 60,
        "messages": [{
            "role": "user",
            "content": [
                {"type":"image","source":{"type":"base64","media_type":mtype,"data":b64}},
                {"type":"text","text":"Describe this black and white line art clipart in 2-4 words in English, lowercase, suitable as a filename. Only the description, no punctuation. Examples: 'little bunny', 'space rocket', 'mushroom house', 'birthday cake'. Reply with ONLY the description."}
            ]
        }]
    }).encode()
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=body,
        headers={
            "Content-Type":"application/json",
            "x-api-key": API_KEY,
            "anthropic-version":"2023-06-01"
        }
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())["content"][0]["text"].strip().strip('"').strip("'")

def slugify(text):
    import re
    return re.sub(r'\s+','-', re.sub(r'[^a-z0-9\s-]','', text.lower().strip()))[:50]

files = sorted([f for f in os.listdir(FOLDER) if os.path.splitext(f)[1].lower() in EXTS])
print(f"\n🎨 {len(files)} imagens encontradas em {FOLDER}\n")

used, log = set(), []

for i, file in enumerate(files):
    full = os.path.join(FOLDER, file)
    ext = os.path.splitext(file)[1].lower()
    mtype = media_type(ext[1:])
    print(f"[{i+1}/{len(files)}] {file} → ", end="", flush=True)
    try:
        with open(full,"rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        desc = ask_claude(b64, mtype)
        slug = slugify(desc) or f"clipart-{i+1}"
        final = slug
        c = 2
        while final in used:
            final = f"{slug}-{c}"; c += 1
        used.add(final)
        newname = f"{final}{ext}"
        newpath = os.path.join(FOLDER, newname)
        if file != newname:
            os.rename(full, newpath)
        print(f"✅ {newname}")
        log.append({"original":file,"renamed":newname,"description":desc})
    except Exception as e:
        print(f"❌ {e}")
        log.append({"original":file,"renamed":file,"error":str(e)})
    if (i+1) % 10 == 0:
        time.sleep(1)

with open(os.path.join(FOLDER,"_rename-log.json"),"w") as f:
    json.dump(log, f, indent=2, ensure_ascii=False)

ok = sum(1 for l in log if "error" not in l)
print(f"\n✅ Concluído! {ok} renomeadas · {len(log)-ok} erros")

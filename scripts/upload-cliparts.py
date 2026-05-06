#!/usr/bin/env python3
"""
Faz upload das imagens renomeadas para Supabase Storage
e registra no image_cache com estilo='colorir'.
"""
import os, sys, json, base64, urllib.request, urllib.error, time, re

FOLDER   = "/Users/user/Downloads/ClipArts"
SUPABASE = "https://cngirkbbmidwtzztrwpi.supabase.co"
KEY      = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuZ2lya2JibWlkd3R6enRyd3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjY0OTI4MCwiZXhwIjoyMDkyMjI1MjgwfQ.2szNNjPvmzldnMWFcVc_gkIxbAI2QRWRSSc7mzlerME"
BUCKET   = "cliparts"
EXTS     = {".png", ".jpg", ".jpeg", ".webp"}

HEADERS = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
}

def normalize(text):
    text = text.lower()
    text = re.sub(r'[àáâãä]','a', text)
    text = re.sub(r'[èéêë]','e', text)
    text = re.sub(r'[ìíîï]','i', text)
    text = re.sub(r'[òóôõö]','o', text)
    text = re.sub(r'[ùúûü]','u', text)
    text = re.sub(r'[^a-z0-9\s]',' ', text)
    return re.sub(r'\s+',' ', text).strip()

def upload_file(filepath, filename):
    dest = f"pack/{filename}"
    url  = f"{SUPABASE}/storage/v1/object/{BUCKET}/{dest}"
    ext  = os.path.splitext(filename)[1].lower()
    ctype = "image/png" if ext == ".png" else "image/webp" if ext == ".webp" else "image/jpeg"

    with open(filepath, "rb") as f:
        data = f.read()

    req = urllib.request.Request(url, data=data, method="POST",
        headers={**HEADERS, "Content-Type": ctype, "Cache-Control": "31536000"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read()).get("Key", dest)
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        if "already exists" in body or "Duplicate" in body:
            return dest  # já existe, ok
        raise

def public_url(path):
    return f"{SUPABASE}/storage/v1/object/public/{BUCKET}/{path}"

def upsert_cache(query, url):
    body = json.dumps({
        "query": query, "tema": "", "serie": "",
        "estilo": "colorir", "url": url, "thumbnail": url,
        "fonte": "pack", "uso_count": 0
    }).encode()
    req = urllib.request.Request(
        f"{SUPABASE}/rest/v1/image_cache",
        data=body, method="POST",
        headers={**HEADERS,
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=15): pass
        return True
    except urllib.error.HTTPError as e:
        print(f"    cache err: {e.read().decode()[:80]}")
        return False

files = sorted([
    f for f in os.listdir(FOLDER)
    if os.path.splitext(f)[1].lower() in EXTS and not f.startswith("_")
])

print(f"\n🚀 {len(files)} imagens para upload em {SUPABASE}\n")

ok = err = skip = 0

for i, filename in enumerate(files):
    filepath = os.path.join(FOLDER, filename)
    slug     = os.path.splitext(filename)[0]          # ex: cute-baby-dinosaur
    query    = normalize(slug.replace("-", " "))       # ex: cute baby dinosaur

    print(f"[{i+1}/{len(files)}] {filename} → ", end="", flush=True)
    try:
        path = upload_file(filepath, filename)
        pub  = public_url(path)
        upsert_cache(query, pub)
        print(f"✅  ({query})")
        ok += 1
    except Exception as e:
        print(f"❌  {e}")
        err += 1

    if (i + 1) % 20 == 0:
        time.sleep(1)

print(f"\n✅ Concluído — {ok} enviadas · {err} erros · {skip} puladas")

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { lookup } from 'mime-types';

// ─── Настройки ──────────────────────────────────────────────────────────────
const ACCESS_KEY_ID     = process.env.YC_KEY_ID;
const SECRET_ACCESS_KEY = process.env.YC_SECRET;
const BUCKET            = 'bi-report';
const PREFIX            = 'aCRM';          // путь внутри бакета
const DIST_DIR          = './dist';
// ────────────────────────────────────────────────────────────────────────────

if (!ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.error('Укажите переменные окружения YC_KEY_ID и YC_SECRET');
  process.exit(1);
}

const client = new S3Client({
  region: 'ru-central1',
  endpoint: 'https://storage.yandexcloud.net',
  credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
  forcePathStyle: false,
});

function getAllFiles(dir, base = dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...getAllFiles(full, base));
    } else {
      files.push(full);
    }
  }
  return files;
}

const files = getAllFiles(DIST_DIR);
console.log(`\nЗагружаю ${files.length} файлов в ${BUCKET}/${PREFIX}/\n`);

let ok = 0;
for (const file of files) {
  const rel  = relative(DIST_DIR, file);
  const key  = `${PREFIX}/${rel}`;
  const mime = lookup(file) || 'application/octet-stream';
  const body = readFileSync(file);

  try {
    await client.send(new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      Body:        body,
      ContentType: mime,
      CacheControl: rel === 'index.html' ? 'no-cache' : 'max-age=31536000',
    }));
    console.log(`  ✓  ${key}`);
    ok++;
  } catch (e) {
    console.error(`  ✗  ${key}  —  ${e.message}`);
  }
}

console.log(`\n✅  Готово: ${ok}/${files.length} файлов`);
console.log(`\n🔗  Ссылка:`);
console.log(`   https://storage.yandexcloud.net/${BUCKET}/${PREFIX}/index.html\n`);

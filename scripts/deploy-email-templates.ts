import { getAuthConfigPayload } from "../supabase/email-templates/templates";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

function loadLocalEnv() {
  const envPath = join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "mtqmjfhxovkosgugppva";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://portafolio-evidencias-six.vercel.app";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

async function main() {
  if (!TOKEN) {
    console.error("❌ Falta SUPABASE_ACCESS_TOKEN en .env.local o en el entorno.");
    console.error("   Genera uno en: https://supabase.com/dashboard/account/tokens");
    console.error("   Añade a .env.local: SUPABASE_ACCESS_TOKEN=tu_token");
    console.error("   Luego ejecuta: npm run email:templates:deploy");
    process.exit(1);
  }

  const payload = getAuthConfigPayload(SITE_URL);

  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("❌ Error:", res.status, err);
    process.exit(1);
  }

  console.log("✅ Plantillas de correo profesionales aplicadas");
  console.log(`   Proyecto: ${PROJECT_REF}`);
  console.log(`   Site URL: ${SITE_URL}`);
}

main();

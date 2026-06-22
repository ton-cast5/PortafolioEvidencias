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
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

async function patchAuth(payload: Record<string, unknown>) {
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
    throw new Error(`${res.status} ${err}`);
  }
}

async function main() {
  if (!TOKEN) {
    console.error("❌ Falta SUPABASE_ACCESS_TOKEN en .env.local");
    process.exit(1);
  }

  if (!RESEND_API_KEY) {
    console.error("❌ Falta RESEND_API_KEY en .env.local");
    console.error("");
    console.error("   En el plan gratuito de Supabase no se pueden personalizar correos");
    console.error("   sin un proveedor SMTP propio. Resend es gratis (100 correos/día):");
    console.error("   1. Crea cuenta en https://resend.com");
    console.error("   2. Copia tu API Key (re_...)");
    console.error("   3. Añade a .env.local: RESEND_API_KEY=re_...");
    console.error("   4. Ejecuta: npm run email:templates:deploy");
    process.exit(1);
  }

  console.log("📧 Configurando SMTP con Resend...");
  await patchAuth({
    external_email_enabled: true,
    smtp_admin_email: FROM_EMAIL,
    smtp_host: "smtp.resend.com",
    smtp_port: 465,
    smtp_user: "resend",
    smtp_pass: RESEND_API_KEY,
    smtp_sender_name: "Portafolio Académico",
  });

  console.log("🎨 Aplicando plantillas profesionales...");
  const payload = getAuthConfigPayload(SITE_URL);
  await patchAuth(payload);

  console.log("✅ Listo: SMTP Resend + plantillas aplicadas");
  console.log(`   Proyecto: ${PROJECT_REF}`);
  console.log(`   Site URL: ${SITE_URL}`);
  console.log(`   Remitente: ${FROM_EMAIL}`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});

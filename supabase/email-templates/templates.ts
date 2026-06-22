const SITE_NAME = "Portafolio Académico";
const BRAND = "#2563eb";
const BRAND_DARK = "#1e40af";
const TEXT = "#334155";
const MUTED = "#64748b";
const LIGHT_BG = "#f8fafc";
const BORDER = "#e2e8f0";

const bookIconSvg = `
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto;">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 7h8M8 11h6" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.9"/>
  </svg>
`;

function emailLayout(preheader: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#eef2f7;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
    ${preheader}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef2f7;padding:48px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(145deg,${BRAND} 0%,${BRAND_DARK} 100%);border-radius:20px 20px 0 0;padding:44px 48px 40px;text-align:center;box-shadow:0 4px 24px rgba(37,99,235,0.25);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="background:rgba(255,255,255,0.18);border:1px solid rgba(255,255,255,0.25);border-radius:16px;width:60px;height:60px;text-align:center;vertical-align:middle;">
                    ${bookIconSvg}
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 6px;color:rgba(255,255,255,0.7);font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Plataforma educativa</p>
              <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;line-height:1.2;">${SITE_NAME}</h1>
              <p style="margin:0;color:rgba(255,255,255,0.88);font-size:15px;line-height:1.5;">Organiza, visualiza y gestiona tus evidencias académicas</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:44px 48px 36px;border-left:1px solid ${BORDER};border-right:1px solid ${BORDER};">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:${LIGHT_BG};border-radius:0 0 20px 20px;padding:28px 48px 32px;border:1px solid ${BORDER};border-top:none;text-align:center;">
              <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;line-height:1.7;">
                © ${new Date().getFullYear()} ${SITE_NAME}
              </p>
              <p style="margin:0 0 14px;color:#cbd5e1;font-size:11px;line-height:1.6;">
                Este es un mensaje automático. Por favor no respondas a este correo.
              </p>
              <a href="{{ .SiteURL }}" style="color:${BRAND};font-size:12px;font-weight:600;text-decoration:none;">
                Ir a la plataforma →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:32px auto 24px;">
  <tr>
    <td style="border-radius:12px;background:linear-gradient(145deg,${BRAND} 0%,${BRAND_DARK} 100%);box-shadow:0 4px 14px rgba(37,99,235,0.4);">
      <a href="${href}" target="_blank" style="display:inline-block;padding:16px 44px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.3px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

function infoBox(content: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;background-color:${LIGHT_BG};border:1px solid ${BORDER};border-radius:12px;">
  <tr>
    <td style="padding:18px 22px;">${content}</td>
  </tr>
</table>`;
}

function stepsList(items: string[]): string {
  const rows = items
    .map(
      (item, i) => `
    <tr>
      <td style="padding:6px 0;vertical-align:top;width:28px;">
        <span style="display:inline-block;width:22px;height:22px;background-color:${BRAND};color:#fff;border-radius:50%;font-size:11px;font-weight:700;text-align:center;line-height:22px;">${i + 1}</span>
      </td>
      <td style="padding:6px 0 6px 8px;color:${MUTED};font-size:14px;line-height:1.5;">${item}</td>
    </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">${rows}</table>`;
}

function securityNote(text: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 0;border-left:4px solid ${BRAND};background-color:#eff6ff;border-radius:0 8px 8px 0;">
  <tr>
    <td style="padding:14px 18px;">
      <p style="margin:0;color:#1e40af;font-size:13px;line-height:1.6;">
        <strong>Seguridad:</strong> ${text}
      </p>
    </td>
  </tr>
</table>`;
}

function fallbackLink(href: string): string {
  return `<p style="margin:28px 0 0;padding-top:24px;border-top:1px solid ${BORDER};color:#94a3b8;font-size:12px;line-height:1.7;word-break:break-all;">
  ¿Problemas con el botón? Copia y pega este enlace en tu navegador:<br />
  <a href="${href}" style="color:${BRAND};text-decoration:underline;font-size:11px;">${href}</a>
</p>`;
}

export const emailSubjects = {
  confirmation: "Activa tu cuenta — Portafolio Académico",
  recovery: "Restablece tu contraseña — Portafolio Académico",
  magicLink: "Tu enlace de acceso — Portafolio Académico",
  invite: "Invitación a Portafolio Académico",
  emailChange: "Confirma tu nuevo correo — Portafolio Académico",
  reauthentication: "Código de verificación — Portafolio Académico",
};

export const emailTemplates = {
  confirmation: emailLayout(
    "Confirma tu correo para activar tu cuenta en Portafolio Académico y comenzar a organizar tus materias.",
    `
    <p style="margin:0 0 6px;color:${BRAND};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Verificación de cuenta</p>
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:24px;font-weight:700;letter-spacing:-0.4px;line-height:1.3;">¡Bienvenido a bordo!</h2>
    <p style="margin:0 0 12px;color:${TEXT};font-size:16px;line-height:1.75;">
      Gracias por registrarte en <strong>${SITE_NAME}</strong>. Estás a un paso de comenzar a organizar tus materias, unidades y evidencias en un solo lugar.
    </p>
    ${infoBox(`
      <p style="margin:0 0 4px;color:#94a3b8;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Cuenta registrada</p>
      <p style="margin:0;color:#0f172a;font-size:15px;font-weight:600;">{{ .Email }}</p>
    `)}
    <p style="margin:0 0 4px;color:${TEXT};font-size:15px;line-height:1.7;">
      Para activar tu cuenta, confirma tu dirección de correo electrónico:
    </p>
    ${ctaButton("{{ .ConfirmationURL }}", "Confirmar mi cuenta")}
    <p style="margin:0;text-align:center;color:#94a3b8;font-size:13px;line-height:1.6;">
      El enlace es válido por <strong style="color:${MUTED};">24 horas</strong> y solo puede usarse una vez.
    </p>
    <p style="margin:28px 0 8px;color:#0f172a;font-size:14px;font-weight:700;">¿Qué sigue después de confirmar?</p>
    ${stepsList([
      "Inicia sesión en la plataforma",
      "Crea tu primera materia o usa una plantilla",
      "Agrega unidades, temas y evidencias académicas",
    ])}
    ${securityNote("Si no creaste esta cuenta, puedes ignorar este correo. Nadie tendrá acceso sin confirmar el enlace.")}
    ${fallbackLink("{{ .ConfirmationURL }}")}
  `
  ),

  recovery: emailLayout(
    "Solicitud para restablecer la contraseña de tu cuenta en Portafolio Académico.",
    `
    <p style="margin:0 0 6px;color:${BRAND};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Recuperación de acceso</p>
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:24px;font-weight:700;letter-spacing:-0.4px;">Restablecer contraseña</h2>
    <p style="margin:0 0 12px;color:${TEXT};font-size:16px;line-height:1.75;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>${SITE_NAME}</strong>.
    </p>
    <p style="margin:0;color:${TEXT};font-size:15px;line-height:1.7;">
      Haz clic en el botón para elegir una nueva contraseña segura:
    </p>
    ${ctaButton("{{ .ConfirmationURL }}", "Restablecer contraseña")}
    ${securityNote("Si no solicitaste este cambio, ignora este correo. Tu contraseña actual permanecerá sin cambios.")}
    ${fallbackLink("{{ .ConfirmationURL }}")}
  `
  ),

  magicLink: emailLayout(
    "Tu enlace de acceso único a Portafolio Académico.",
    `
    <p style="margin:0 0 6px;color:${BRAND};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Acceso rápido</p>
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:24px;font-weight:700;">Inicia sesión</h2>
    <p style="margin:0;color:${TEXT};font-size:16px;line-height:1.75;">
      Usa el siguiente enlace para acceder a <strong>${SITE_NAME}</strong>. Es de un solo uso y expira en breve.
    </p>
    ${ctaButton("{{ .ConfirmationURL }}", "Iniciar sesión ahora")}
    ${securityNote("No compartas este enlace con nadie. Si no lo solicitaste, ignora este correo.")}
    ${fallbackLink("{{ .ConfirmationURL }}")}
  `
  ),

  invite: emailLayout(
    "Has sido invitado a unirte a Portafolio Académico.",
    `
    <p style="margin:0 0 6px;color:${BRAND};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Invitación</p>
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:24px;font-weight:700;">Te han invitado</h2>
    <p style="margin:0;color:${TEXT};font-size:16px;line-height:1.75;">
      Has recibido una invitación para unirte a <strong>${SITE_NAME}</strong>. Acepta para crear tu cuenta y comenzar a organizar tus evidencias académicas.
    </p>
    ${ctaButton("{{ .ConfirmationURL }}", "Aceptar invitación")}
    ${fallbackLink("{{ .ConfirmationURL }}")}
  `
  ),

  emailChange: emailLayout(
    "Confirma el cambio de correo en tu cuenta de Portafolio Académico.",
    `
    <p style="margin:0 0 6px;color:${BRAND};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Cambio de correo</p>
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:24px;font-weight:700;">Confirma tu nuevo correo</h2>
    <p style="margin:0;color:${TEXT};font-size:16px;line-height:1.75;">
      Solicitaste actualizar el correo de tu cuenta. Confirma la nueva dirección para completar el proceso:
    </p>
    ${ctaButton("{{ .ConfirmationURL }}", "Confirmar nuevo correo")}
    ${securityNote("Si no realizaste este cambio, contacta soporte de inmediato.")}
    ${fallbackLink("{{ .ConfirmationURL }}")}
  `
  ),

  reauthentication: emailLayout(
    "Tu código de verificación para Portafolio Académico.",
    `
    <p style="margin:0 0 6px;color:${BRAND};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Verificación</p>
    <h2 style="margin:0 0 16px;color:#0f172a;font-size:24px;font-weight:700;">Código de verificación</h2>
    <p style="margin:0 0 24px;color:${TEXT};font-size:16px;line-height:1.75;">
      Usa el siguiente código para verificar tu identidad en <strong>${SITE_NAME}</strong>:
    </p>
    <div style="text-align:center;margin:28px 0;">
      <span style="display:inline-block;padding:20px 40px;background:linear-gradient(145deg,#f1f5f9,#e2e8f0);border:2px solid ${BORDER};border-radius:16px;font-size:36px;font-weight:800;letter-spacing:10px;color:#0f172a;font-family:'Courier New',monospace;">
        {{ .Token }}
      </span>
    </div>
    <p style="margin:0;text-align:center;color:#94a3b8;font-size:13px;line-height:1.6;">
      Expira en pocos minutos. No lo compartas con nadie.
    </p>
  `
  ),
};

export function getAuthConfigPayload(siteUrl: string) {
  return {
    site_url: siteUrl,
    uri_allow_list: `${siteUrl}/auth/callback,http://localhost:3000/auth/callback`,
    mailer_subjects_confirmation: emailSubjects.confirmation,
    mailer_templates_confirmation_content: emailTemplates.confirmation,
    mailer_subjects_recovery: emailSubjects.recovery,
    mailer_templates_recovery_content: emailTemplates.recovery,
    mailer_subjects_magic_link: emailSubjects.magicLink,
    mailer_templates_magic_link_content: emailTemplates.magicLink,
    mailer_subjects_invite: emailSubjects.invite,
    mailer_templates_invite_content: emailTemplates.invite,
    mailer_subjects_email_change: emailSubjects.emailChange,
    mailer_templates_email_change_content: emailTemplates.emailChange,
    mailer_subjects_reauthentication: emailSubjects.reauthentication,
    mailer_templates_reauthentication_content: emailTemplates.reauthentication,
  };
}

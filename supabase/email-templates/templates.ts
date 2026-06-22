const SITE_NAME = "Portafolio Académico";
const BRAND_COLOR = "#2563eb";
const BRAND_DARK = "#1d4ed8";

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_COLOR} 0%,${BRAND_DARK} 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                <tr>
                  <td style="background-color:rgba(255,255,255,0.15);border-radius:14px;width:52px;height:52px;text-align:center;vertical-align:middle;">
                    <span style="font-size:26px;line-height:52px;">📚</span>
                  </td>
                </tr>
              </table>
              <h1 style="margin:18px 0 6px;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${SITE_NAME}</h1>
              <p style="margin:0;color:rgba(255,255,255,0.85);font-size:14px;">Organiza tus evidencias académicas</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;border-radius:0 0 16px 16px;padding:24px 40px 28px;border:1px solid #e2e8f0;border-top:none;text-align:center;">
              <p style="margin:0 0 8px;color:#94a3b8;font-size:12px;line-height:1.7;">
                © ${new Date().getFullYear()} ${SITE_NAME}. Todos los derechos reservados.
              </p>
              <p style="margin:0;color:#cbd5e1;font-size:11px;line-height:1.6;">
                Si no solicitaste este correo, puedes ignorarlo con seguridad.
              </p>
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
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:28px auto;">
  <tr>
    <td style="border-radius:10px;background:linear-gradient(135deg,${BRAND_COLOR} 0%,${BRAND_DARK} 100%);">
      <a href="${href}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;letter-spacing:0.2px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

function fallbackLink(href: string): string {
  return `<p style="margin:24px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;word-break:break-all;">
  Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
  <a href="${href}" style="color:${BRAND_COLOR};text-decoration:underline;">${href}</a>
</p>`;
}

export const emailSubjects = {
  confirmation: "Confirma tu cuenta — Portafolio Académico",
  recovery: "Restablece tu contraseña — Portafolio Académico",
  magicLink: "Tu enlace de acceso — Portafolio Académico",
  invite: "Te han invitado — Portafolio Académico",
  emailChange: "Confirma tu nuevo correo — Portafolio Académico",
  reauthentication: "Código de verificación — Portafolio Académico",
};

export const emailTemplates = {
  confirmation: emailLayout(`
    <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;font-weight:700;letter-spacing:-0.3px;">¡Bienvenido!</h2>
    <p style="margin:0 0 8px;color:#475569;font-size:15px;line-height:1.7;">
      Gracias por registrarte en <strong style="color:#334155;">${SITE_NAME}</strong>.
    </p>
    <p style="margin:0 0 4px;color:#475569;font-size:15px;line-height:1.7;">
      Para activar tu cuenta y comenzar a organizar tus materias, confirma tu correo electrónico:
    </p>
    <p style="margin:16px 0 0;padding:12px 16px;background-color:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;color:#64748b;font-size:14px;">
      <strong style="color:#334155;">Correo:</strong> {{ .Email }}
    </p>
    ${ctaButton("{{ .ConfirmationURL }}", "Confirmar mi cuenta")}
    <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;text-align:center;">
      Este enlace expira en 24 horas y solo puede usarse una vez.
    </p>
    ${fallbackLink("{{ .ConfirmationURL }}")}
  `),

  recovery: emailLayout(`
    <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;font-weight:700;">Restablecer contraseña</h2>
    <p style="margin:0 0 8px;color:#475569;font-size:15px;line-height:1.7;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>${SITE_NAME}</strong>.
    </p>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">
      Haz clic en el botón para elegir una nueva contraseña:
    </p>
    ${ctaButton("{{ .ConfirmationURL }}", "Restablecer contraseña")}
    <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;text-align:center;">
      Si no solicitaste este cambio, ignora este correo. Tu contraseña no será modificada.
    </p>
    ${fallbackLink("{{ .ConfirmationURL }}")}
  `),

  magicLink: emailLayout(`
    <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;font-weight:700;">Accede a tu cuenta</h2>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">
      Usa el siguiente enlace para iniciar sesión en <strong>${SITE_NAME}</strong>. El enlace es de un solo uso y expira pronto.
    </p>
    ${ctaButton("{{ .ConfirmationURL }}", "Iniciar sesión")}
    ${fallbackLink("{{ .ConfirmationURL }}")}
  `),

  invite: emailLayout(`
    <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;font-weight:700;">Has sido invitado</h2>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">
      Te han invitado a unirte a <strong>${SITE_NAME}</strong>. Acepta la invitación para crear tu cuenta:
    </p>
    ${ctaButton("{{ .ConfirmationURL }}", "Aceptar invitación")}
    ${fallbackLink("{{ .ConfirmationURL }}")}
  `),

  emailChange: emailLayout(`
    <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;font-weight:700;">Confirma tu nuevo correo</h2>
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">
      Solicitaste cambiar el correo de tu cuenta. Confirma la nueva dirección para completar el proceso:
    </p>
    ${ctaButton("{{ .ConfirmationURL }}", "Confirmar nuevo correo")}
    <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;text-align:center;">
      Si no realizaste este cambio, contacta soporte de inmediato.
    </p>
    ${fallbackLink("{{ .ConfirmationURL }}")}
  `),

  reauthentication: emailLayout(`
    <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;font-weight:700;">Código de verificación</h2>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">
      Usa el siguiente código para verificar tu identidad en <strong>${SITE_NAME}</strong>:
    </p>
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;padding:16px 32px;background-color:#f1f5f9;border:2px dashed #cbd5e1;border-radius:12px;font-size:32px;font-weight:700;letter-spacing:8px;color:#1e293b;">
        {{ .Token }}
      </span>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;text-align:center;">
      Este código expira en pocos minutos. No lo compartas con nadie.
    </p>
  `),
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

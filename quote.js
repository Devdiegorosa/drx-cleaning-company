const ALLOWED_ORIGIN = "https://www.drxcleaning.com";

const escapeHtml = (str = "") =>
  String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);

const CONSENT_TEXT_EXPECTED =
  "I agree to receive appointment reminders and service-related SMS " +
  "messages from DRX Cleaning Company. Message frequency varies. " +
  "Message and data rates may apply. Reply STOP to opt out and HELP for help.";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const {
      name,
      phone,
      email,
      service,
      message,
      page,
      recaptchaToken,
      smsConsent,
      smsConsentMethod,
      smsConsentSource,
      smsConsentTimestamp,
      consentTextVersion,
    } = req.body || {};

    // ── Validação de campos obrigatórios ──
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, error: "Missing required field: name" });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ success: false, error: "Missing required field: phone" });
    }

    if (!service || !String(service).trim()) {
      return res.status(400).json({ success: false, error: "Missing required field: service" });
    }

    const phoneDigits = String(phone).replace(/[^\d]/g, "");
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return res.status(400).json({ success: false, error: "Invalid phone number" });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ success: false, error: "Invalid email address" });
    }

    if (!recaptchaToken) {
      return res.status(400).json({ success: false, error: "Missing reCAPTCHA token" });
    }

    // ── Validação de consentimento SMS no servidor ──
    if (smsConsent !== true && smsConsent !== "true") {
      return res.status(400).json({
        success: false,
        error: "SMS consent is required to submit this form.",
      });
    }

    // ── Verificação do reCAPTCHA ──
    const recaptchaResponse = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: recaptchaToken,
        }),
      }
    );

    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      console.error("reCAPTCHA error:", recaptchaData);
      return res.status(400).json({ success: false, error: "reCAPTCHA verification failed" });
    }

    // ── IP do solicitante (best-effort) ──
    const smsConsentIpAddress =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "unknown";

    // ── Escape de todos os campos ──
    const safeName    = escapeHtml(name);
    const safePhone   = escapeHtml(phone);
    const safeEmail   = escapeHtml(email);
    const safeService = escapeHtml(service);
    const safeMessage = escapeHtml(message);
    const safePage    = escapeHtml(page);

    // ── E-mail com consentimento SMS incluído ──
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM,
        to: [process.env.LEAD_NOTIFY_TO],
        subject: `New quote request - ${safeService || "DRX Cleaning"}`,
        html: `
          <h2>New Quote Request</h2>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Email:</strong> ${safeEmail || ""}</p>
          <p><strong>Service:</strong> ${safeService}</p>
          <p><strong>Message:</strong> ${safeMessage || ""}</p>
          <p><strong>Page:</strong> ${safePage || ""}</p>
          <hr/>
          <h3>SMS Consent Record</h3>
          <p><strong>SMS Consent:</strong> ${smsConsent === true || smsConsent === "true" ? "✅ Yes" : "❌ No"}</p>
          <p><strong>Method:</strong> ${escapeHtml(smsConsentMethod || "web_form")}</p>
          <p><strong>Source:</strong> ${escapeHtml(smsConsentSource || "website")}</p>
          <p><strong>Timestamp:</strong> ${escapeHtml(smsConsentTimestamp || new Date().toISOString())}</p>
          <p><strong>IP Address:</strong> ${escapeHtml(smsConsentIpAddress)}</p>
          <p><strong>Consent Text Version:</strong><br/><em>${escapeHtml(consentTextVersion || CONSENT_TEXT_EXPECTED)}</em></p>
        `,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", resendData);
      return res.status(500).json({ success: false, error: "Failed to send notification email" });
    }

    return res.status(200).json({
      success: true,
      message: "Quote request sent successfully",
    });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again or call us directly.",
    });
  }
}

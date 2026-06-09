// Envia email ao dono da loja com os dados do formulário "Vender".
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const OWNER_EMAIL = "pedranovabr@gmail.com";

interface SellPayload {
  name: string;
  model: string;
  size: string;
  condition: string;
  price?: string;
  description?: string;
}

function html(p: SellPayload): string {
  const priceLine = p.price?.trim()
    ? `R$ ${p.price.trim()}`
    : "Em aberto — aceita oferta";
  const rows: [string, string][] = [
    ["Nome", p.name],
    ["Modelo", p.model],
    ["Tamanho EU", p.size],
    ["Condição", p.condition],
    ["Valor pedido", priceLine],
    ["Descrição", p.description?.trim() || "—"],
  ];
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;background:#fff;padding:24px;color:#0d0d0d">
      <h2 style="margin:0 0 16px">👢 Nova proposta de venda — Pedra Nova BR</h2>
      <table style="border-collapse:collapse;width:100%;max-width:560px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;font-size:13px;vertical-align:top">${k}</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;font-size:13px;white-space:pre-wrap">${v}</td></tr>`
          )
          .join("")}
      </table>
      <p style="margin-top:24px;color:#999;font-size:12px">Pedra Nova BR — formulário "Vender"</p>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = (await req.json()) as SellPayload;

    if (!payload?.name || !payload?.model || !payload?.size || !payload?.condition) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "Pedra Nova <onboarding@resend.dev>",
        to: [OWNER_EMAIL],
        subject: `👢 Nova proposta de venda — ${payload.model}`,
        html: html(payload),
      }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error("Resend error", data);
      return new Response(JSON.stringify({ error: "Failed to send", detail: data }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, id: data?.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Envia email para o dono da loja com os dados do pedido manual
// (Pix ou Crypto). Para Pix, anexa o comprovativo.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

interface ManualOrderPayload {
  type: "pix" | "crypto";
  ownerEmail: string;
  customerEmail: string;
  customerName: string;
  address: string;
  productName: string;
  productCode: string;
  size: number | null;
  totalBRL: number;
  subtotalBRL?: number;
  couponCode?: string;
  couponDiscountBRL?: number;
  // pix
  receipt?: { filename: string; base64: string; mime: string };
  // crypto
  cryptoSymbol?: string;
  cryptoAmount?: string;
  txid?: string;
}

function brl(n: number): string {
  return `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function html(payload: ManualOrderPayload): string {
  const rows: [string, string][] = [
    ["Cliente", payload.customerName],
    ["Email", payload.customerEmail],
    ["Endereço", payload.address],
    ["Produto", `${payload.productName} (${payload.productCode})`],
    ["Tamanho EU", String(payload.size ?? "—")],
  ];
  if (payload.couponCode && payload.couponDiscountBRL && payload.subtotalBRL != null) {
    rows.push(["Subtotal", brl(payload.subtotalBRL)]);
    rows.push([`Cupom (${payload.couponCode})`, `− ${brl(payload.couponDiscountBRL)}`]);
  }
  rows.push(["Total", brl(payload.totalBRL)]);
  if (payload.type === "crypto") {
    rows.push(["Moeda", payload.cryptoSymbol || "—"]);
    rows.push(["Quantia crypto", payload.cryptoAmount || "—"]);
    rows.push(["TXID", payload.txid || "—"]);
  }
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;background:#fff;padding:24px;color:#0d0d0d">
      <h2 style="margin:0 0 16px">Novo pedido — ${payload.type === "pix" ? "Pix" : "Crypto"}</h2>
      <table style="border-collapse:collapse;width:100%;max-width:560px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:8px;border-bottom:1px solid #eee;color:#666;font-size:13px">${k}</td><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600;font-size:13px">${v}</td></tr>`
          )
          .join("")}
      </table>
      ${payload.type === "pix" ? '<p style="margin-top:16px;color:#666;font-size:13px">Comprovativo Pix em anexo.</p>' : ""}
      <p style="margin-top:24px;color:#999;font-size:12px">Pedra Nova BR</p>
    </div>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const payload = (await req.json()) as ManualOrderPayload;

    if (!payload?.customerEmail || !payload?.ownerEmail || !payload?.type) {
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

    const subject =
      payload.type === "pix"
        ? "Novo pedido — Pix | Pedra Nova BR"
        : "Novo pedido — Crypto | Pedra Nova BR";

    const body: Record<string, unknown> = {
      from: "Pedra Nova <onboarding@resend.dev>",
      to: [payload.ownerEmail],
      reply_to: payload.customerEmail,
      subject,
      html: html(payload),
    };

    if (payload.type === "pix" && payload.receipt) {
      body.attachments = [
        {
          filename: payload.receipt.filename,
          content: payload.receipt.base64,
        },
      ];
    }

    const resp = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify(body),
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

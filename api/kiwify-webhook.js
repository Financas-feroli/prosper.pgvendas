/**
 * landing-page/api/kiwify-webhook.js
 * 
 * Endpoint Serverless na Vercel para receber Webhooks da Kiwify.
 * - Disparado automaticamente quando um pedido é aprovado (order_approved / paid).
 * - Gera uma licença Ed25519 matematicamente autêntica para o cliente.
 * - Dispara e-mail transacional instantâneo via API do Resend com a chave e instalador.
 */

import { generateLicenseForOrder, DOWNLOAD_URL, SUPPORT_WHATSAPP, SUPPORT_EMAIL } from './_lib/licenseHelper.js';
import { buildLicenseEmailHtml } from './_lib/emailTemplate.js';

export default async function handler(req, res) {
  // Configuração de CORS e métodos aceitos
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Healthcheck / ping via GET
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      service: 'PROSPER Kiwify Webhook Engine',
      version: '2.4.0'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (err) {
        // body permanece string se falhar parse
      }
    }

    if (!body || typeof body !== 'object') {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }

    // Validação opcional de token configurado na Kiwify
    const configuredToken = process.env.KIWIFY_WEBHOOK_TOKEN;
    if (configuredToken) {
      const receivedToken = req.query.token || body.token || req.headers['x-kiwify-token'];
      if (receivedToken !== configuredToken) {
        console.warn('[Kiwify Webhook] Token de webhook inválido:', receivedToken);
        return res.status(401).json({ error: 'Unauthorized token' });
      }
    }

    // Extração normalizada de dados do webhook Kiwify
    const orderId = body.order_id || body.orderId || (body.order && body.order.id) || (body.data && body.data.id);
    const status = String(body.order_status || body.status || body.event || '').toLowerCase();
    const customer = body.Customer || body.customer || (body.data && body.data.customer) || {};
    const customerEmail = customer.email || body.email;
    const customerName = customer.full_name || customer.name || body.name || 'Cliente PROSPER';

    // Teste de conexão da Kiwify (botão "Testar Webhook")
    const isTest = orderId === 'test' || status === 'test' || body.event === 'test' || (body.Product && body.Product.product_name === 'Teste');
    if (isTest) {
      return res.status(200).json({
        success: true,
        message: 'Teste de webhook Kiwify recebido com sucesso!',
        timestamp: new Date().toISOString()
      });
    }

    // Verificar se o pedido é aprovado/pago
    const approvedStatuses = ['paid', 'approved', 'order_approved', 'completed'];
    const isApproved = approvedStatuses.includes(status);

    if (!isApproved) {
      // Retorna 200 para que a Kiwify saiba que recebemos o evento (evita retentativas desnecessárias de boleto gerado, etc.)
      return res.status(200).json({
        success: true,
        message: `Status '${status}' ignorado. Apenas pedidos pagos recebem chave de ativação.`,
        orderId
      });
    }

    if (!customerEmail) {
      return res.status(400).json({ error: 'E-mail do cliente não encontrado no payload do pedido.' });
    }

    // 1. Gerar chave de licença Ed25519 oficial
    const licenseKey = generateLicenseForOrder(orderId || customerEmail);

    // 2. Disparar e-mail com a chave via Resend
    let emailSent = false;
    let emailError = null;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'PROSPER Gestão Financeira <contato@prospergestao.com.br>';
        const emailHtml = buildLicenseEmailHtml({
          customerName,
          licenseKey,
          downloadUrl: DOWNLOAD_URL,
          supportWhatsapp: SUPPORT_WHATSAPP,
          supportEmail: SUPPORT_EMAIL
        });

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [customerEmail],
            subject: 'Sua Chave de Ativação Vitalícia - PROSPER Gestão Financeira',
            html: emailHtml
          })
        });

        if (resendRes.ok) {
          emailSent = true;
        } else {
          const errData = await resendRes.json();
          emailError = errData;
          console.error('[Resend Error]', errData);
        }
      } catch (err) {
        emailError = err.message;
        console.error('[Resend Exception]', err.message);
      }
    } else {
      console.warn('[PROSPER API] RESEND_API_KEY não configurada. E-mail não enviado automaticamente.');
    }

    return res.status(200).json({
      success: true,
      orderId,
      customerEmail,
      licenseKey,
      emailSent,
      emailError: emailError ? String(emailError) : null
    });

  } catch (err) {
    console.error('[Kiwify Webhook Error]', err);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao processar webhook',
      message: err.message
    });
  }
}

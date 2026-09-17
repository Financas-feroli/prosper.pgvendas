/**
 * landing-page/api/get-license.js
 * 
 * Endpoint Serverless para consulta/obtenção dinâmica da chave de licença:
 * - Utilizado pela Página de Obrigado (/Obrigado) para exibir a chave imediatamente na tela
 *   quando o cliente é redirecionado pela Kiwify com ?order_id=... ou ?email=...
 * - Utiliza a mesma função determinística (RFC 8032) do webhook, garantindo 100% de paridade.
 */

import { generateLicenseForOrder, verifyLicense } from './_lib/licenseHelper.js';

export default async function handler(req, res) {
  // CORS universal para permitir chamadas do frontend
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    const query = req.query || {};
    const orderId = query.order_id || query.orderId || query.order || '';
    const email = query.email || '';
    const rawKey = query.key || query.licence || query.license || '';

    // Se já passou uma chave direta, apenas verifica se é matematicamente autêntica
    if (rawKey) {
      const isValid = verifyLicense(rawKey);
      return res.status(200).json({
        success: true,
        key: rawKey,
        valid: isValid
      });
    }

    // Se passou order_id ou e-mail da compra
    const seed = orderId.trim() || email.trim();
    if (!seed) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro order_id ou email é obrigatório para geração da licença.'
      });
    }

    const licenseKey = generateLicenseForOrder(seed);
    const isValid = verifyLicense(licenseKey);

    return res.status(200).json({
      success: true,
      key: licenseKey,
      valid: isValid,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('[get-license error]', err);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao processar licença',
      message: err.message
    });
  }
}

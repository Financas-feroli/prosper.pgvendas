/**
 * landing-page/api/_lib/licenseHelper.js
 * 
 * Módulo utilitário compartilhado para Serverless Functions na Vercel:
 * - Geração determinística de licenças Ed25519 para pedidos Kiwify
 * - Verificação criptográfica com a Chave Pública do PROSPER
 * - Carregamento seguro da Chave Privada mestre (Env Var ou Vault)
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Chave Pública Ed25519 Oficial do PROSPER (32 bytes raw em hexadecimal)
export const ED25519_PUBLIC_KEY_HEX = '33dd5d7807647fe2d5399819af4935fb9c010133d017453b39fa7b60542fe727';

// Configurações e links oficiais do produto
export const DOWNLOAD_URL = "https://github.com/Financas-feroli/prosper-desktop/releases/download/v2.4.0/PROSPER.Gestao.Financeira.Setup.2.4.0.exe";
export const SUPPORT_WHATSAPP = "5591987545861";
export const SUPPORT_EMAIL = "financas.feroli@gmail.com";
export const SITE_URL = "https://prospergestao.com.br";

let cachedPrivateKey = null;
let cachedPublicKey = null;

/**
 * Normaliza e formata uma chave privada PEM vinda de variável de ambiente ou arquivo
 */
export function normalizePrivateKeyPem(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let key = raw.trim();

  // Substitui literais \n por quebras de linha reais se configurado assim no painel da Vercel
  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
  }

  // Se o usuário colou apenas o payload Base64 sem os headers PEM
  if (!key.includes('BEGIN PRIVATE KEY')) {
    key = `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
  }

  return key;
}

/**
 * Carrega a chave privada mestre:
 * 1. Da variável de ambiente ED25519_PRIVATE_KEY (na Vercel / Produção)
 * 2. Do cofre local em ~/.prosper-vault/keys/ed25519_private.key (em desenvolvimento local)
 */
export function getPrivateKey() {
  if (cachedPrivateKey) return cachedPrivateKey;

  // 1. Variável de ambiente (Vercel)
  if (process.env.ED25519_PRIVATE_KEY) {
    try {
      const pem = normalizePrivateKeyPem(process.env.ED25519_PRIVATE_KEY);
      cachedPrivateKey = crypto.createPrivateKey(pem);
      return cachedPrivateKey;
    } catch (err) {
      console.error('[PROSPER API] Erro ao carregar ED25519_PRIVATE_KEY da variável de ambiente:', err.message);
    }
  }

  // 2. Fallback de desenvolvimento local (Cofre em ~/.prosper-vault)
  try {
    const vaultDir = process.env.PROSPER_VAULT_DIR || path.join(os.homedir(), '.prosper-vault');
    const privPath = path.join(vaultDir, 'keys', 'ed25519_private.key');
    if (fs.existsSync(privPath)) {
      const pem = fs.readFileSync(privPath, 'utf8');
      cachedPrivateKey = crypto.createPrivateKey(pem);
      return cachedPrivateKey;
    }
  } catch (err) {
    // Silencioso em ambiente serverless onde o arquivo local não existe
  }

  return null;
}

/**
 * Obtém a chave pública Ed25519 do PROSPER
 */
export function getPublicKey() {
  if (cachedPublicKey) return cachedPublicKey;

  try {
    const spkiPrefix = Buffer.from('302a300506032b6570032100', 'hex');
    const spkiDer = Buffer.concat([spkiPrefix, Buffer.from(ED25519_PUBLIC_KEY_HEX, 'hex')]);
    cachedPublicKey = crypto.createPublicKey({ key: spkiDer, format: 'der', type: 'spki' });
    return cachedPublicKey;
  } catch (err) {
    console.error('[PROSPER API] Erro ao criar Chave Pública Ed25519:', err.message);
    return null;
  }
}

/**
 * Gera uma chave de licença oficial assinada digitalmente com Ed25519.
 * Se seedOrOrderId for informado (ex: order_id da Kiwify), a geração é
 * 100% determinística (RFC 8032), garantindo que o webhook e a página de obrigado
 * entreguem exatamente a mesma chave para o mesmo pedido.
 * 
 * Formato: PROSPER-LIC-[PAYLOAD_BASE64URL].[SIGNATURE_BASE64URL]
 */
export function generateLicenseForOrder(seedOrOrderId) {
  const privateKey = getPrivateKey();
  if (!privateKey) {
    throw new Error('Chave privada mestre Ed25519 não configurada no servidor (ED25519_PRIVATE_KEY).');
  }

  const id = seedOrOrderId
    ? crypto.createHash('sha256').update(String(seedOrOrderId).trim().toLowerCase()).digest('hex').slice(0, 8).toUpperCase()
    : crypto.randomBytes(4).toString('hex').toUpperCase();

  const payload = `PROSPER-PRO-${id}`;
  const payloadBuf = Buffer.from(payload, 'utf8');
  const sig = crypto.sign(null, payloadBuf, privateKey);

  const token = `${payloadBuf.toString('base64url')}.${sig.toString('base64url')}`;
  return `PROSPER-LIC-${token}`;
}

/**
 * Valida se uma chave de licença foi legitimamente assinada pela chave mestre do PROSPER
 */
export function verifyLicense(licenseKey) {
  if (!licenseKey || typeof licenseKey !== 'string') return false;
  const cleaned = licenseKey.trim();
  if (!cleaned.startsWith('PROSPER-LIC-')) return false;

  const token = cleaned.slice('PROSPER-LIC-'.length);
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadB64, sigB64] = parts;
  try {
    const payloadBuf = Buffer.from(payloadB64, 'base64url');
    const sigBuf = Buffer.from(sigB64, 'base64url');
    if (sigBuf.length !== 64) return false;

    const pubKey = getPublicKey();
    if (!pubKey) return false;

    return crypto.verify(null, payloadBuf, pubKey, sigBuf);
  } catch {
    return false;
  }
}

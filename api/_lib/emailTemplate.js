/**
 * landing-page/api/_lib/emailTemplate.js
 * 
 * Template HTML responsivo de alta qualidade para entrega de licença PROSPER via Resend.
 */

export function buildLicenseEmailHtml({ customerName, licenseKey, downloadUrl, supportWhatsapp, supportEmail }) {
  const safeName = (customerName || 'Cliente').split(' ')[0].replace(/<[^>]*>/g, '');
  const waLink = `https://wa.me/${supportWhatsapp}?text=${encodeURIComponent('Olá! Acabei de adquirir o PROSPER e gostaria de auxílio com a instalação.')}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sua Chave de Ativação - PROSPER Gestão Financeira</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b1118;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 32px 16px;
    }
    .card {
      background-color: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(180deg, #10b981 0%, #059669 100%);
      padding: 32px 24px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 8px 0 0;
      color: #d1fae5;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .content {
      padding: 32px 28px;
    }
    .greeting {
      font-size: 20px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .intro {
      font-size: 15px;
      line-height: 1.6;
      color: #94a3b8;
      margin-bottom: 24px;
    }
    .key-box {
      background-color: #030712;
      border: 1px solid #10b981;
      border-radius: 14px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .key-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #34d399;
      margin-bottom: 10px;
    }
    .key-value {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      background-color: #1e293b;
      padding: 12px 14px;
      border-radius: 8px;
      word-break: break-all;
      user-select: all;
      border: 1px dashed #334155;
    }
    .key-badge {
      display: inline-block;
      margin-top: 10px;
      font-size: 11px;
      color: #64748b;
    }
    .btn-download {
      display: block;
      background-color: #10b981;
      color: #030712 !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 16px;
      text-align: center;
      padding: 16px 24px;
      border-radius: 12px;
      margin: 28px 0;
    }
    .steps-box {
      background-color: #131d2e;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .steps-title {
      font-size: 13px;
      font-weight: 700;
      color: #f1f5f9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 0;
      margin-bottom: 14px;
    }
    .step-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 10px;
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .step-num {
      background-color: #10b981;
      color: #04100c;
      font-weight: 800;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
      font-size: 11px;
      margin-right: 12px;
      flex-shrink: 0;
    }
    .support-box {
      border-top: 1px solid #1e293b;
      padding-top: 20px;
      margin-top: 24px;
      text-align: center;
    }
    .support-text {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 12px;
    }
    .support-btn {
      display: inline-block;
      background-color: #1e293b;
      color: #38bdf8 !important;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 8px;
      margin: 0 4px;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #64748b;
      margin-top: 24px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>PROSPER Gestão Financeira</h1>
        <p>✓ Pedido Confirmado • Acesso Imediato</p>
      </div>

      <div class="content">
        <h2 class="greeting">Olá, ${safeName}!</h2>
        <p class="intro">
          Seja muito bem-vindo ao PROSPER! Seu pagamento foi confirmado com sucesso.
          Abaixo estão sua chave de licença vitalícia e o link oficial para download do instalador no seu computador.
        </p>

        <!-- CHAVE DE ATIVAÇÃO -->
        <div class="key-box">
          <div class="key-label">Sua Chave de Ativação Vitalícia</div>
          <div class="key-value">${licenseKey}</div>
          <div class="key-badge">Copie e cole exatamente como exibido acima na tela de ativação.</div>
        </div>

        <!-- BOTÃO DE DOWNLOAD -->
        <a href="${downloadUrl}" class="btn-download" target="_blank">
          ↓ Baixar Instalador Oficial para Windows (.exe)
        </a>

        <!-- PASSO A PASSO -->
        <div class="steps-box">
          <div class="steps-title">Como Ativar em 3 Passos Simples:</div>
          <div class="step-item">
            <span class="step-num">1</span>
            <span>Clique no botão acima para baixar e instalar o PROSPER no seu Windows (10 ou 11).</span>
          </div>
          <div class="step-item">
            <span class="step-num">2</span>
            <span>Abra o PROSPER instalado e clique em <b>"Ativar Licença"</b> na tela inicial.</span>
          </div>
          <div class="step-item">
            <span class="step-num">3</span>
            <span>Cole sua chave de ativação vitalícia e comece a gerenciar suas finanças com total privacidade!</span>
          </div>
        </div>

        <!-- SUPORTE -->
        <div class="support-box">
          <div class="support-text">Precisa de alguma ajuda com a instalação?</div>
          <a href="${waLink}" class="support-btn" target="_blank">Chamar no WhatsApp</a>
          <a href="mailto:${supportEmail}" class="support-btn">Enviar E-mail</a>
        </div>
      </div>
    </div>

    <!-- RODAPÉ -->
    <div class="footer">
      <p>© 2026 PROSPER Soluções Empresariais • Rafael F. Oliveira • CNPJ sob registro</p>
      <p>Software Desktop Local • Dados salvos 100% no seu computador com SQLite.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Configuração Oficial de Distribuição do Instalador PROSPER Desktop
 * 
 * Centraliza o link de download e metadados de integridade.
 * O script scripts/syncReleaseMetadata.cjs mantém sha256, versão e tamanho
 * automaticamente sincronizados a cada build.
 */
window.PROSPER_DOWNLOAD = {
  // Link oficial direto via CDN mundial da Microsoft/GitHub Releases
  url: "https://github.com/Financas-feroli/prosper-desktop/releases/download/v2.4.0/PROSPER.Gestao.Financeira.Setup.2.4.0.exe",
  // Link direto de fallback Google Drive
  directDriveUrl: "https://drive.usercontent.google.com/download?id=1qRQZGGp8hLabMjIi2ccP8HxukYNsKQMC&export=download&confirm=t",
  version: "2.4.0",
  sizeFormatted: "109.9 MB",
  sha256: "68F0AC9B5275CB9A35DA543B060A592E37A2D19F3A3243F316D69A1D3D9B0769"
};
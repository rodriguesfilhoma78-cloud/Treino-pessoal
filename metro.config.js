// Configuração do Metro necessária para o expo-sqlite rodar na versão web:
// ele usa um worker WebAssembly (.wasm) e SharedArrayBuffer, que o navegador
// só libera com os cabeçalhos COOP/COEP. Não afeta Android/iOS.
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("wasm");

config.server.enhanceMiddleware = (middleware) => (req, res, next) => {
  res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  return middleware(req, res, next);
};

module.exports = config;

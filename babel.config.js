const path = require("path");

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          // caminho absoluto: o alias funciona mesmo se o Expo for iniciado de outro diretório
          alias: { "@": path.join(__dirname, "src") },
          extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
        },
      ],
    ],
  };
};

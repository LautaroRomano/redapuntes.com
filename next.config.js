module.exports = {
    webpack: (config, { isServer }) => {
      config.experiments = {
        asyncWebAssembly: true, // Para habilitar WebAssembly asíncrono
        layers: true, // Para habilitar "layers"
      };
  
      return config;
    },
  };
  
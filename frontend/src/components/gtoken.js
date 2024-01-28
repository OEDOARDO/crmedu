const axios = require("axios");

const getAccessToken = async () => {
  const accessToken = process.env.GOOGLE_ACCESS_TOKEN;

  // Verificar se o Access Token está definido
  if (!accessToken) {
    // O Access Token não está definido, obter um novo Access Token usando o Refresh Token
    const newAccessToken = await getNewAccessToken();
    return newAccessToken;
  }

  // O Access Token está definido, retorná-lo
  return accessToken;
};

const getNewAccessToken = async () => {
  const refresh_token = "1//0hhq81CpJWpCPCgYIARAAGBESNwF-L9IrRNfRl0vu9bhZ-2DKbW7WXl-vqHLmdbLC-iK1WtJ4VwNcfOUH0X4KcAns-rP64b3XnCQ";
  const clientId = "344439710939-jjmloqrdgimb415r17hcosuj0ccvoqib.apps.googleusercontent.com";
  const clientSecret = "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";

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('refresh_token', refresh_token);
  params.append('grant_type', 'refresh_token');

  try {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      params.toString()
    );

    const newAccessToken = response.data.access_token;
    return newAccessToken;
  } catch (error) {
    console.error("Erro ao obter o novo Access Token:", error);
    return null;
  }
};

module.exports = {
  getAccessToken,
};

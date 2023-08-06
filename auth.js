const axios = require('axios');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

const clientSecret = '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';
const clientId = '344439710939-jjmloqrdgimb415r17hcosuj0ccvoqib.apps.googleusercontent.com';
const redirectUri = 'http://localhost:3000/auth/callback';

const getRefreshToken = async (code) => {
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens.refresh_token;
};

const authorize = () => {
  const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Autorize o aplicativo visitando o seguinte URL:\n', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Insira o código de autorização aqui:', (code) => {
      rl.close();
      resolve(code);
    });
  });
};

const saveRefreshToken = async () => {
  try {
    const code = await authorize();
    const refreshToken = await getRefreshToken(code);

    console.log('Refresh Token:', refreshToken);

    // Salve o refresh token para uso posterior
    // Você pode escolher a forma de armazenamento adequada, como salvar em um arquivo ou no banco de dados
  } catch (error) {
    console.error('Ocorreu um erro:', error);
  }
};

saveRefreshToken();

import axios from "axios";

const authConfig = {
    headers: {
      Authorization: "Bearer ${YOUR_ACCESS_TOKEN}",
    },
  };

const createFolder = (idProcess, clientName, opponentName) => {
  const axiosConfig = {
    method: "POST",
    url: `https://www.googleapis.com/drive/v3/files`,
    data: {
      name: `${idProcess} (${clientName} / ${opponentName})`,
    },
  };

  return axios(axiosConfig).then((response) => {
    return response.data;
  });
};

const main = async () => {
  // Get the access token
  const accessToken = await axios.get("https://accounts.google.com/o/oauth2/token", {
    params: {
      code: `YOUR_CODE`,
      client_id: `YOUR_CLIENT_ID`,
      client_secret: `YOUR_CLIENT_SECRET`,
      redirect_uri: `YOUR_REDIRECT_URI`,
      grant_type: "authorization_code",
    },
  });

  // Make the request to create the folder
  const folder = await createFolder("151", "teste", "teste3");

  // Print the ID of the folder
  console.log(folder.id);
};

main();
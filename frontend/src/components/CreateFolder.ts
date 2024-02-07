import axios from "axios";
import mimeTypes from "mime-types"; 



// Função para fazer a requisição para obter o Access Token do backend
const getAccessToken = async () => {
  try {
    const response = await axios.get("http://127.0.0.1:3001/api/gtoken");
    const accessToken = response.data.accessToken;
    return accessToken;
  } catch (error) {
    console.error("Erro ao obter o Access Token do backend:", error);
    return null;
  }
};





const uploadFile = async (folderId, fileData, fileName) => {
  try {
    const accessToken = await getAccessToken();

    const boundary = "xxxxxxxxxx";

    const metadata = {
      name: fileName,
      parents: [folderId],
    };

    let mimeType;

    // Usar o módulo 'mime' para obter o tipo MIME diretamente
    mimeType = mimeTypes.lookup(fileName) || "application/octet-stream";

    let data = `--${boundary}\r\n`;
    data += 'Content-Disposition: form-data; name="metadata"\r\n';
    data += "Content-Type: application/json; charset=UTF-8\r\n\r\n";
    data += JSON.stringify(metadata) + "\r\n";
    data += `--${boundary}\r\n`;
    data += `Content-Disposition: form-data; name="file"\r\n`;
    data += `Content-Type: ${mimeType}\r\n\r\n`;

    const payload = Buffer.concat([
      Buffer.from(data, "utf8"),
      Buffer.from(fileData, "binary"),
      Buffer.from(`\r\n--${boundary}--\r\n`, "utf8"),
    ]);

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    };

    const axiosConfig = {
      method: "POST",
      url: "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      headers: headers,
      data: payload,
    };

    const response = await axios(axiosConfig);
    console.log(response.data);
    return response.data.id;
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo:", error);
    // Lógica para lidar com o erro
    return null;
  }
};














const CreateFolder = async (idProcess, clientName, opponentName) => {
  try {
    const accessToken = await getAccessToken();

    // Obter o ID da pasta "Ged Zeus Assessoria"
    const parentFolderId = "10C6gtoF7WhQH2ogbDx--m_h_EgtorSOK"; // Substitua pelo ID correto

    const axiosConfig = {
      method: "POST",
      url: `https://www.googleapis.com/drive/v3/files`, 
      data: {
        name: `${idProcess} (${clientName} X ${opponentName})`,
        mimeType: "application/vnd.google-apps.folder", // Define o tipo como uma pasta
        parents: [parentFolderId], // Define a pasta pai usando o ID
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios(axiosConfig);
    return response.data.id;
  } catch (error) {
    console.error('Ocorreu um erro ao criar a pasta:', error);
    // Lógica para lidar com o erro
  }
};

const listFilesInFolder = async (folderId) => {
  try {
    const response = await axios.get(`http://127.0.0.1:3001/api/file/${folderId}`);
    return response.data; // Retorna os detalhes dos arquivos obtidos através do proxy reverso
  } catch (error) {
    console.error('Ocorreu um erro ao listar os arquivos da pasta:', error);
    // Lógica para lidar com o erro
    return [];
  }
};


// Função para baixar um arquivo pelo seu ID
const downloadFile = async (fileId) => {
  try {
    const accessToken = await getAccessToken();

    const axiosConfig = {
      method: "GET",
      url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
      params: {
        alt: "media", // Indica que queremos baixar o conteúdo do arquivo
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: "arraybuffer" as const, // Corrigindo o tipo do responseType para "arraybuffer"
    };

    const response = await axios<Uint8Array>(axiosConfig); // Especificando o tipo de resposta esperada
    return response.data;
  } catch (error) {
    console.error('Ocorreu um erro ao baixar o arquivo:', error);
    // Lógica para lidar com o erro
    return null;
  }
};

const getFileContent = async (fileId) => {
  try {
    const accessToken = await getAccessToken();

    const axiosConfig = {
      method: "GET",
      url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
      params: {
        alt: "media", // Indica que queremos obter o conteúdo do arquivo em vez do link de visualização
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await axios(axiosConfig);
    return response.data;
  } catch (error) {
    console.error("Erro ao obter o conteúdo do arquivo:", error);
    // Lógica para lidar com o erro
    return null;
  }
};

export { CreateFolder, listFilesInFolder, downloadFile, getFileContent, uploadFile };

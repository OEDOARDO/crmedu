import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Card, Container, Row, Col } from "react-bootstrap";
import Header from "./Header";
import { listFilesInFolder, downloadFile, getFileContent } from "../components/CreateFolder";
import { Pagination } from "react-bootstrap";


interface File {
  id: string;
  name: string;
  webViewLink: string;
  mimeType: string;
}

const VisualizarDocumentos: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate(); // Importe o useNavigate  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10; // Número de itens por página

  const [accessToken, setAccessToken] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };


  useEffect(() => {
    fetchAccessToken();
  }, []);
  

  useEffect(() => {
    if (id && accessToken) {
      fetchFilesFromFolder();
    }
  }, [id, accessToken]);

  const fetchAccessToken = async () => {
    try {
      const response = await axios.get("http://18.225.117.159:3000/api/gtoken");
      const accessToken = response.data.accessToken;
      setAccessToken(accessToken);
    } catch (error) {
      console.error("Erro ao obter o token de acesso:", error);
    }
  };

  const fetchFilesFromFolder = async () => {
    try {
      const response = await axios.get(`http://18.225.117.159:3000/processos/${id}`);
      const folderId = response.data.googledrive;

      const filesResponse = await listFilesInFolder(folderId);

      const filesWithDirectLink = await Promise.all(
        filesResponse.map(async (file) => {
          if (file.mimeType.startsWith("image/")) {
            const directLinkResponse = await axios.get(
              `https://www.googleapis.com/drive/v3/files/${file.id}?fields=webContentLink`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            return { ...file, webViewLink: directLinkResponse.data.webContentLink };
          } else {
            return file;
          }
        })
      );

      setFiles(filesWithDirectLink);
    } catch (error) {
      console.error("Erro ao buscar arquivos do Google Drive:", error);
    }
  };

  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const displayedFiles = files.slice(startIdx, endIdx);

  const openFile = async (file: File) => {
    setSelectedFile(file);
    setFileContent(null);

    try {
      const content = await getFileContent(file.id);

      if (content === null) {
        console.error("Erro ao obter o conteúdo do arquivo.");
        return;
      }

      setFileContent(content);
    } catch (error) {
      console.error("Erro ao obter o conteúdo do arquivo:", error);
    }
  };

  const renderFileViewer = () => {
    if (selectedFile?.mimeType === "text/plain") {
      return <pre>{fileContent}</pre>;
    } else if (selectedFile?.mimeType === "application/pdf") {
      return (
        <object
          data={`https://drive.google.com/uc?id=${selectedFile.id}`}
          type="application/pdf"
          width="100%"
          height="600px"
        >
          <p>Seu navegador não suporta visualização de PDFs. Você pode baixar o arquivo <a href={`https://drive.google.com/uc?id=${selectedFile.id}`}>aqui</a>.</p>
        </object>
      );
    } else if (selectedFile?.mimeType.startsWith("image/")) {
      return (
        <div className="file-viewer-container">
          <img src={`https://drive.google.com/uc?id=${selectedFile.id}`} alt={selectedFile.name} style={{ maxWidth: "50%", maxHeight: "50%" }} />
        </div>        );
    } else {
      return <div>Tipo de arquivo não suportado.</div>;
    }
  };

  const handleDownloadFile = async (file: File) => {
    try {
      const content = await downloadFile(file.id);
      
      if (content === null) {
        console.error("Erro ao baixar o arquivo.");
        return;
      }
      
      const blob = new Blob([content], { type: file.mimeType });
      const url = URL.createObjectURL(blob);
  
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar o arquivo:", error);
    }
  };

  const handleBack = () => {
    navigate(-1); // Navegar para a página anterior
  };  

  return (
    <>
      <Header /> {/* Renderize o seu cabeçalho aqui */}
      <Container fluid>
        <Row>
          <Col md={4} lg={3} className="overflow-auto border">
            <h1>Documentos</h1>
            <Button variant="primary" onClick={handleBack}>
              Voltar à Página Anterior
            </Button>
            <></>
            {displayedFiles.map((file) => (
              <Card key={file.id} className="mb-3">
                <Card.Body>
                  <Card.Title>{file.name}</Card.Title>
                  <Button variant="primary" onClick={() => openFile(file)}>
                    Visualizar
                  </Button>
                  <Button variant="secondary" onClick={() => handleDownloadFile(file)}>
                    Baixar
                  </Button>
                </Card.Body>
              </Card>
            ))}

            <div className="pagination-container mt-3">
              <Pagination>
                {Array.from({ length: Math.ceil(files.length / itemsPerPage) }).map((_, index) => (
                  <Pagination.Item
                    key={index}
                    active={index + 1 === currentPage}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </Col>
          <Col md={8} lg={9} className="d-flex flex-column flex-grow-1">
            {selectedFile && (
              <div className="file-viewer-container text-center">
                {renderFileViewer()}
              </div>
            )}
          </Col>
        </Row>
        <Row>
          <Col className="text-center mt-3">

          </Col>
        </Row>
      </Container>
    </>
  );
};

export default VisualizarDocumentos;
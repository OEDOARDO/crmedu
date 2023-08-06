import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Form, ListGroup } from "react-bootstrap";
import Header from "./Header";
import { useNavigate, useParams } from "react-router-dom";
import { uploadFile } from "../components/CreateFolder";
import axios from "axios";

const UploadFiles: React.FC = () => {
  const navigate = useNavigate(); // Importe o useNavigate
  const { id } = useParams<{ id: string }>();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [folderId, setFolderId] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleBack = () => {
    navigate(-1); // Navegar para a página anterior
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const fileList = Array.from(event.target.files);
      setSelectedFiles(fileList);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0 && folderId) {
      try {
        const uploadedFileIds: string[] = [];
  
        for (const file of selectedFiles) {
          const fileName = file.name;
          const fileData = await readFileData(file); // Use a função para ler os dados do arquivo como um buffer
          const fileId = await uploadFile(folderId, fileData, fileName);
  
          if (fileId) {
            uploadedFileIds.push(fileId);
          } else {
            console.error("Erro ao enviar o arquivo:", fileName);
          }
        }
  
        if (uploadedFileIds.length > 0) {
          // Atualize a lista de arquivos enviados
          setUploadedFiles(uploadedFileIds);
        }
      } catch (error) {
        console.error("Erro ao fazer upload dos arquivos:", error);
      }
    }
  };




  useEffect(() => {
    const fetchFolderId = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/processos/${id}`);
        const folderId = response.data.googledrive;
        setFolderId(folderId);
      } catch (error) {
        console.error("Erro ao obter o ID da pasta:", error);
      }
    };
  
    fetchFolderId();
}, [id]); // 

  const readFileData = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          resolve(event.target.result as ArrayBuffer);
        } else {
          reject("Erro ao ler o arquivo.");
        }
      };
      reader.readAsArrayBuffer(file); // Use readAsArrayBuffer para obter os dados como um buffer
    });
  };

  return (
    <>
      <Header /> {/* Renderize o cabeçalho aqui */}
      <Container fluid>
        <Row>
          <Col md={4} lg={3} className="overflow-auto border">
            <h1>Upload de Arquivos</h1>
            <Button variant="primary" onClick={handleBack}>
              Voltar à Página Anterior
            </Button>
            <Form.Group controlId="fileUpload">
              <Form.Label className="d-block text-right">Escolha um ou mais arquivos:</Form.Label>
              <Form.Control type="file" multiple onChange={handleFileChange} />
            </Form.Group>
            <Button variant="success" onClick={handleUpload} disabled={selectedFiles.length === 0}>
              Enviar Arquivos
            </Button>
          </Col>
          <Col md={8} lg={9} className="d-flex flex-column flex-grow-1">
            <div className="file-viewer-container text-center">
              <h2>Arquivos Enviados</h2>
              <ListGroup>
                {uploadedFiles.map((fileId, index) => (
                  <ListGroup.Item key={index}>{fileId}</ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          </Col>
        </Row>
        <Row>
          <Col className="text-center mt-3">
            {/* Outros elementos, se necessário */}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default UploadFiles;
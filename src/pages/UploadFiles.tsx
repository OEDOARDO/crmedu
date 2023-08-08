import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import Header from "./Header";
import { useNavigate, useParams } from "react-router-dom";
import { uploadFile } from "../components/CreateFolder";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './drop.css';

const UploadFiles: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [folderId, setFolderId] = useState<string>("");
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false); // Adicionado o estado para controle do sucesso
  const [files, setFiles] = useState<Array<{ file: File; name: string }>>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        name: "",
      }));
      setFiles([...files, ...newFiles]);
      setSelectedFile(newFiles[0].file);
    },
  });

  const handleBack = () => {
    navigate(-1);
  };

  const handleUpload = async () => {
    if (selectedFile && folderId) {
      try {
        const fileData = await readFileData(selectedFile);
        const fileName = files[0].name; 
        const fileId = await uploadFile(
          folderId,
          fileData,
          fileName
        );

        console.log("Nome do arquivo enviado para a API:", fileName);

        if (fileId) {
          setUploadedFileId(fileId);
          setUploadSuccess(true); // Define o sucesso como verdadeiro
          setSelectedFile(null);
          setFiles(files.slice(1)); // Remove o arquivo carregado da lista
        } else {
          console.error("Erro ao enviar o arquivo:", selectedFile.name);
        }
      } catch (error) {
        console.error("Erro ao fazer upload do arquivo:", error);
      }
    }
  };

  const renderFilePreview = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="file-preview-img"
          style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto' }}
        />
      );
    } else if (file.type.startsWith('video/')) {
      return <video controls src={URL.createObjectURL(file)} className="file-preview-video" />;
    } else {
      return <p>Pré-visualização não disponível</p>;
    }
  };

  const handleFileNameChange = (index: number, newName: string) => {
    const updatedFiles = [...files];
    updatedFiles[index].name = newName;
    setFiles(updatedFiles);
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
  }, [id]);

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
      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <>
      <Header />
      <Container fluid>
        <Row className="justify-content-center align-items-center h-100">
          <Col md={8} lg={6} className="border p-4 rounded">
            <h1 className="text-center mb-4">Upload de Arquivos</h1>
            <div className="text-center mb-4">
            <div className="text-left mb-3">
              <Button
                variant="secondary"
                onClick={handleBack}
              >
                Voltar
              </Button>
            </div>
              <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
                <input {...getInputProps()} />
                <p>Arraste e solte o arquivo aqui ou clique para selecionar</p>
                <i className="bi bi-cloud-upload"></i>
              </div>
              {files.length > 0 && (
                <div className="uploaded-files">
                  <p>Arquivos carregados:</p>
                  <ul className="list-group">
                    {files.map((file, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div className="file-item d-flex align-items-center">
                          <i className="bi bi-paperclip mr-2"></i>
                          <div className="preview-container">
                            {renderFilePreview(file.file)}
                          </div>
                          <input
                            type="text"
                            className="form-control w-auto"
                            placeholder="Insira o nome do arquivo"
                            value={file.name}
                            onChange={(e) => handleFileNameChange(index, e.target.value)}
                          />
                        </div>
                        <div className="delete-item">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setFiles(files.filter((_, i) => i !== index))}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
                {uploadSuccess && ( // Exibe a mensagem de sucesso se o upload for bem-sucedido
                <Alert variant="success" className="mt-3">
                  Arquivo(s) enviado(s) com sucesso!
                </Alert>
                )}
            </div>
            
            <div className="text-center">
              <Button
                className="dropzone-button"
                variant="success"
                onClick={handleUpload}
                disabled={!selectedFile}
              >
                Enviar Arquivo
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default UploadFiles;

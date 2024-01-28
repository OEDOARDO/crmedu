import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pagination } from 'react-bootstrap';


// Defina o tipo das observações
type Observacao = {
  [x: string]: any;
  id: number;
  descricao: string;
  atividade_id: number;
  processo_id: number;
  data_registro: string;
  agendamento_id: number;
  usuario_id: number;
};

const MostrarAndamento = ({ processoId }) => {
  const [observacoes, setObservacoes] = useState<Observacao[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [nomesUsuarios, setNomesUsuarios] = useState<{ [key: number]: string }>({});
  const [nomesAtividades, setNomesAtividades] = useState<{ [key: number]: string }>({});
  const [nomesEquipes, setNomesEquipes] = useState<{ [key: number]: string }>({});
  const [equipeIds, setEquipeIds] = useState<{ [key: number]: number }>({});





  useEffect(() => {
    const carregarObservacoes = async () => {
      try {
        const response = await axios.get(`http://3.141.59.134:3000/processos/${processoId}/observacoes`);
        const observacoesData = response.data || [];
        setObservacoes(observacoesData);
        const usuarioIds = observacoesData.map((observacao) => observacao.id_usuario);
        const uniqueUsuarioIds = Array.from(new Set(usuarioIds));
        const atividadeIds = observacoesData.map((observacao) => observacao.atividade_id);
        const uniqueAtividadeIds = Array.from(new Set(atividadeIds));
        const nomesUsuariosTemp: { [key: number]: string } = {};
        const nomesAtividadesTemp: { [key: number]: string } = {};


        await Promise.all(
          (uniqueUsuarioIds as number[]).map(async (usuarioId) => {
            try {
              const response = await axios.get(`http://3.141.59.134:3000/usuarios/${usuarioId}`);
              const { nome } = response.data as { nome: string };
              nomesUsuariosTemp[usuarioId] = nome;
            } catch (error) {
              console.error(`Erro ao buscar nome do usuário ${usuarioId}:`, error);
            }
          })
        );


        await Promise.all(
          (uniqueAtividadeIds as number[]).map(async (atividadeId) => {
            try {
              const response = await axios.get(`http://3.141.59.134:3000/atividades/${atividadeId}`);
              const { nome, equipe_id } = response.data as { nome: string, equipe_id: number };
              nomesAtividadesTemp[atividadeId] = nome;
              equipeIds[atividadeId] = equipe_id;
            } catch (error) {
              console.error(`Erro ao buscar nome e equipe_id da atividade ${atividadeId}:`, error);
            }
          })
        );



        const uniqueEquipeIds = Array.from(new Set(Object.values(equipeIds)));


        await Promise.all(
          (uniqueEquipeIds as number[]).map(async (equipeId) => {
            try {
              const response = await axios.get(`http://3.141.59.134:3000/equipes/${equipeId}`);
              const { nome } = response.data as { nome: string };
              setNomesEquipes((prevState) => ({ ...prevState, [equipeId]: nome }));
            } catch (error) {
              console.error(`Erro ao buscar nome da equipe ${equipeId}:`, error);
            }
          })
        );

        setNomesUsuarios(nomesUsuariosTemp);
        setNomesAtividades(nomesAtividadesTemp);
        setEquipeIds((prevEquipeIds) => ({ ...prevEquipeIds }));


      } catch (error) {
        console.error(error);
      }
    };

    carregarObservacoes();
  }, [processoId]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const parseDate = (dateString: string): Date => {
    const [dayMonthYear, time] = dateString.split(' ');
    const [day, month, year] = dayMonthYear.split('-');
    const [hours, minutes] = time.split(':');
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);
  };

  const renderObservacoes = () => {
    if (!observacoes || observacoes.length === 0) {
      return <p className="text-center">Não há observações disponíveis.</p>;
    }
  
    const observacoesOrdenadas = observacoes.sort((a, b) => {
      const dateA = parseDate(a.data_registro);
      const dateB = parseDate(b.data_registro);
      return dateB.getTime() - dateA.getTime(); // Ordenar do mais recente para o mais antigo
    });
  
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const observacoesPaginadas = observacoesOrdenadas.slice(startIndex, endIndex);
  
    return (
      <div className="observacoes mt-n2">
        {observacoesPaginadas.map((observacao) => (
    <div key={observacao.id} className="card mb-3">
      <div className="observacoes-body">
        <div className="container-fluid observacao-superior bg-secondary d-flex border border-dark ps-0">
          <div className="col"> 
            <span className="observacao-titulo text-dark fw-bold">Atividade</span>
          </div>
          <div className="col">
            <span className="observacao-titulo text-dark fw-bold">Registrado por</span>
          </div>
          <div className="col">
            <span className="observacao-titulo text-dark fw-bold">Registrado em</span>
          </div>
        </div>
        <div className="observacao-descricao border border-dark ">
          <p className="observacoes-text bg-warning mb-0 text-justify w-100">{observacao.descricao}</p>
        </div>
        <div className="container-fluid observacao-superior d-flex border border-dark ps-0">
          <div className="col">
            <span className="observacao-valor">[{nomesEquipes[equipeIds[observacao.atividade_id]]}] {nomesAtividades[observacao.atividade_id]}</span>
          </div>
          <div className="col">
            <span className="observacao-valor">{observacao.data_registro}</span>
          </div>
          <div className="col">
            <span className="observacao-valor">{nomesUsuarios[observacao.id_usuario]}</span>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
    );
  };

  const getTotalPages = () => {
    if (!observacoes || observacoes.length === 0) {
      return 1;
    }

    return Math.ceil(observacoes.length / itemsPerPage);
  };

  const totalPages = getTotalPages();

  const renderPagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    return (
      <Pagination className="justify-content-center">
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          return (
            <Pagination.Item
              key={page}
              active={currentPage === page}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Pagination.Item>
          );
        })}
      </Pagination>
    );
  };

  return (
    <div>
      {renderObservacoes()}
      {renderPagination()}
    </div>
  );
};

export default MostrarAndamento;

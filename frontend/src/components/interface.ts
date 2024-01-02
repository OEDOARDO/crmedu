export interface Client {
    id: number;
    nome: string;
    cpf: string;
    endereco: {
      cep: string;
      rua: string;
      bairro: string;
      cidade: string;
      estado: string;
      numero: string;
    };
    email: string;
    observacoes: string;
    telefones: string[];
  }

export interface ParteContraria {
  id: number;
  nome: string;
  cpf: string | null;
  cnpj: string | null;
}

export interface TipoProcesso {
  id: number;
  tipo: string;
}

export  const estados = [
    { sigla: "AC", nome: "Acre" },
    { sigla: "AL", nome: "Alagoas" },
    { sigla: "AP", nome: "Amapá" },
    { sigla: "AM", nome: "Amazonas" },
    { sigla: "BA", nome: "Bahia" },
    { sigla: "CE", nome: "Ceará" },
    { sigla: "DF", nome: "Distrito Federal" },
    { sigla: "ES", nome: "Espírito Santo" },
    { sigla: "GO", nome: "Goiás" },
    { sigla: "MA", nome: "Maranhão" },
    { sigla: "MT", nome: "Mato Grosso" },
    { sigla: "MS", nome: "Mato Grosso do Sul" },
    { sigla: "MG", nome: "Minas Gerais" },
    { sigla: "PA", nome: "Pará" },
    { sigla: "PB", nome: "Paraíba" },
    { sigla: "PR", nome: "Paraná" },
    { sigla: "PE", nome: "Pernambuco" },
    { sigla: "PI", nome: "Piauí" },
    { sigla: "RJ", nome: "Rio de Janeiro" },
    { sigla: "RN", nome: "Rio Grande do Norte" },
    { sigla: "RS", nome: "Rio Grande do Sul" },
    { sigla: "RO", nome: "Rondônia" },
    { sigla: "RR", nome: "Roraima" },
    { sigla: "SC", nome: "Santa Catarina" },
    { sigla: "SP", nome: "São Paulo" },
    { sigla: "SE", nome: "Sergipe" },
    { sigla: "TO", nome: "Tocantins" },
  ];

export  interface Processo {
    id: number;
    id_cliente: string;
    parte_contraria: string;
    numero_processo?: string;
    cliente?: string;
    tipo_processo?: number;
    status?: number; // Atualizado para número
  }
  

export  interface ListarProcessosProps {
    data: Processo[];
    setSelected: (processo: Processo & { id: number }) => void;
  }
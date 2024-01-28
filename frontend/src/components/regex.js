export const telefoneRegex = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1)$2")
      .replace(/(\d)(\d{4})$/, "$1-$2");
  };
  
  export const cpfRegex = (value) => {
    return value
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d{1,3})?(\d{1,3})?(\d{1,2})?/, (match, p1, p2, p3, p4) => {
          let result = "";
          if (p1) result += p1;
          if (p2) result += `.${p2}`;
          if (p3) result += `.${p3}`;
          if (p4) result += `-${p4}`;
          return result;
        });
  };
  
  export const cepRegex = (value) => {  
    return value.replace(/^(\d{5})-?(\d{3})??$/, "$1-$2");
  };
  
  export const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i

// Reglas simples de pluralización en español
export function pluralize(word: string, customPlurals?: { nombre: string; plural: string }[]): string {
  if (!word) return '';
  
  // 1. Buscar en lista personalizada primero
  if (customPlurals) {
    const custom = customPlurals.find(u => u.nombre === word);
    if (custom) return custom.plural;
  }
  
  // 2. Reglas generales
  const lastChar = word.slice(-1).toLowerCase();
  const vowels = ['a', 'e', 'i', 'o', 'u', 'á', 'é', 'í', 'ó', 'ú'];
  
  if (vowels.includes(lastChar)) {
    return word + 's';
  } else if (lastChar === 'z') {
    return word.slice(0, -1) + 'ces';
  } else {
    return word + 'es';
  }
}

export function renderTemplate(template: string, variables: Record<string, string>): string {
  if (!template) return '';
  
  // 1. Procesar bloques condicionales [[ ... ]]
  let result = template.replace(/\[\[(.*?)\]\]/g, (match, blockContent) => {
    // Buscar todos los marcadores {var} dentro del bloque
    const placeholders = Array.from(blockContent.matchAll(/\{([^}]+)\}/g)).map((m: any) => m[1]);
    
    // Si no hay marcadores dentro, lo dejamos tal cual (quitando los corchetes)
    if (placeholders.length === 0) return blockContent;
    
    // Comprobar si TODOS los marcadores tienen un valor no vacío en variables
    const allValid = placeholders.every(p => {
      const val = variables[p];
      return val !== undefined && val !== null && val !== '';
    });
    
    // Si hay alguno vacío, el bloque entero desaparece
    if (!allValid) return '';
    
    // Si todos son válidos, reemplazar los marcadores dentro del bloque y devolver el contenido
    return blockContent.replace(/\{([^}]+)\}/g, (m: any, p: string) => variables[p] || '');
  });
  
  // 2. Procesar marcadores normales {var} que queden
  result = result.replace(/\{([^}]+)\}/g, (match, p) => {
    return variables[p] !== undefined ? variables[p] : '';
  });
  
  return result;
}

import { createHash } from 'crypto';

/**
 * Convierte un string arbitrario en un UUID v4-like determinista mediante MD5.
 * Si el string ya es un UUID válido, lo devuelve tal cual.
 */
export function stringToUuid(str: string): string {
  if (!str) return str;
  
  // Expresión regular para validar si ya es un UUID válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) {
    return str.toLowerCase();
  }

  // Generamos un hash MD5 y lo formateamos como UUID
  const hash = createHash('md5').update(str).digest('hex');
  return [
    hash.substring(0, 8),
    hash.substring(8, 12),
    // Usamos el formato 8-4-4-4-12 requerido por Postgres
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32)
  ].join('-');
}

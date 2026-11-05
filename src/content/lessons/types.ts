/** Contenido de una lección. Admite **negritas** y `código` dentro del texto. */
export type LessonContent = {
  id: string;            // "11.5"
  body: string[];        // párrafos de explicación
  keys: string[];        // puntos clave para repasar
  example?: string;      // analogía o ejemplo de la vida real
};

export const L = (id: string, body: string[], keys: string[], example?: string): LessonContent => ({ id, body, keys, example });

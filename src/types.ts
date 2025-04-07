// src/types.ts
export type FiltrosCampos = 
  | 'empresa' 
  | 'sede' 
  | 'fecha' 
  | 'matricula' 
  | 'curso' 
  | 'tipoDocumento' 
  | 'nroDocumento' 
  | 'contratante';

export interface RegistroCurso {
  empresa: string;
  sede: string;
  fecha: string;
  matricula: string;
  curso: string;
  tipoDocumento: string;
  nroDocumento: string;
  contratante: string;
  costoCurso: number;
  comision: number;
  pendiente: number;
  pagado: number;
}
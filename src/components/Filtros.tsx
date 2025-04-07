import React from 'react';
import { Search } from 'lucide-react';

// types.ts
export type FiltrosCampos = 'Empresa' | 'Sede' | 'Fecha Matricula' | 'Curso' | 
  'Tipo Documento' | 'Nro. Documento' | 'Contratante' | 'Costo Curso' | 
  'Comision' | 'Pendiente' | 'Pagado';

interface FiltrosProps {
  onFiltroChange: (campo: FiltrosCampos, valor: string) => void;
  onLimpiarFiltros: () => void;
  contratantes: string[];
  filtroContratante: string;
  onFiltroContratanteChange: (valor: string) => void;
}

export const Filtros: React.FC<FiltrosProps> = ({ 
  onFiltroChange, 
  onLimpiarFiltros,
  contratantes,
  filtroContratante,
  onFiltroContratanteChange
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Filtros Avanzados</h2>
        <button
          onClick={onLimpiarFiltros}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Limpiar Todos los Filtros
        </button>
      </div>
              {/* Filtro por Empresa */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3 mb-4">
          <Search className="absolute left-2 top-4 h-6 w-2 text-gray-400" />
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Promotor</label>
          <input
            type="text"
            placeholder="Filtrar por Contratante"
            onChange={(e) => onFiltroChange('Contratante', e.target.value)}
            className="pl-4 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Filtro por Contratante (select) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contratante</label>
          <select
            value={filtroContratante}
            onChange={(e) => onFiltroContratanteChange(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos los contratantes</option>
            {contratantes.map((contratante, index) => (
              <option key={index} value={contratante}>
                {contratante}
              </option>
            ))}
          </select>
        </div>
        
        {/* Filtro por Empresa */}
        <div className="relative">
          <Search className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
          <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
          <input
            type="text"
            placeholder="Filtrar por empresa"
            onChange={(e) => onFiltroChange('Empresa', e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Filtro por Curso */}
        <div className="relative">
          <Search className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
          <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
          <input
            type="text"
            placeholder="Filtrar por curso"
            onChange={(e) => onFiltroChange('Curso', e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Filtro por Sede */}
        <div className="relative">
          <Search className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
          <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
          <input
            type="text"
            placeholder="Filtrar por sede"
            onChange={(e) => onFiltroChange('Sede', e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
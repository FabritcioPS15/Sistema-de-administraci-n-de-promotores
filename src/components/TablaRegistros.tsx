import React from 'react';
import { ArrowUpDown, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

export interface RegistroCurso {
  'Fecha Matricula': string;
  nroDocumento: string;
  tipoDocumento: string;
  Empresa: string;
  costoCurso?: number;
  Comision?: number;
  Sede: string;
  contratante: string;
  Curso: string;
  Pendiente?: number;
  Pagado?: number;
}

interface TablaRegistrosProps {
  registros: RegistroCurso[];
}

type SortableColumn = keyof Omit<RegistroCurso, 'tipoDocumento' | 'nroDocumento'>;
type SortDirection = 'asc' | 'desc';

export const TablaRegistros: React.FC<TablaRegistrosProps> = ({ registros }) => {
  const [sortConfig, setSortConfig] = React.useState<{
    key: SortableColumn;
    direction: SortDirection;
  } | null>(null);

  const [expandedRows, setExpandedRows] = React.useState<Record<number, boolean>>({});
  
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  
  const toggleRowExpand = (index: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const requestSort = (key: SortableColumn) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRegistros = React.useMemo(() => {
    if (!sortConfig) return registros;

    return [...registros].sort((a, b) => {
      // Handle numeric fields
      const numericFields = ['costoCurso', 'Comision', 'Pendiente', 'Pagado'];
      if (numericFields.includes(sortConfig.key)) {
        const valueA = a[sortConfig.key] as number || 0;
        const valueB = b[sortConfig.key] as number || 0;
        return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      // Handle text fields
      const valueA = String(a[sortConfig.key]).toLowerCase();
      const valueB = String(b[sortConfig.key]).toLowerCase();
      
      if (valueA < valueB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [registros, sortConfig]);
  
  // Get current items for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRegistros.slice(indexOfFirstItem, indexOfLastItem);
  
  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  const nextPage = () => {
    if (currentPage < Math.ceil(sortedRegistros.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  if (sortedRegistros.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg shadow-sm">
        No se encontraron registros
      </div>
    );
  }

  const getSortIcon = (columnName: SortableColumn) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1 inline" /> : 
      <ChevronDown className="h-4 w-4 ml-1 inline" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider"></th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-orange-700"
                onClick={() => requestSort('Empresa')}
              >
                Empresa {getSortIcon('Empresa')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-orange-700"
                onClick={() => requestSort('Sede')}
              >
                Sede {getSortIcon('Sede')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-orange-700"
                onClick={() => requestSort('Fecha Matricula')}
              >
                Fecha Matrícula {getSortIcon('Fecha Matricula')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-orange-700"
                onClick={() => requestSort('Curso')}
              >
                Curso {getSortIcon('Curso')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Tipo Documento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Nro. Documento
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-orange-700"
                onClick={() => requestSort('contratante')}
              >
                Contratante {getSortIcon('contratante')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-orange-700"
                onClick={() => requestSort('costoCurso')}
              >
                Costo (S/) {getSortIcon('costoCurso')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-orange-700"
                onClick={() => requestSort('Comision')}
              >
                Comisión (S/) {getSortIcon('Comision')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-orange-700"
                onClick={() => requestSort('Pendiente')}
              >
                Pendiente (S/) {getSortIcon('Pendiente')}
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-orange-700"
                onClick={() => requestSort('Pagado')}
              >
                Pagado (S/) {getSortIcon('Pagado')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.map((registro, index) => {
              const actualIndex = indexOfFirstItem + index;
              return (
                <React.Fragment key={actualIndex}>
                  <tr className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} 
                      className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-2 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => toggleRowExpand(actualIndex)}
                        className="p-1 rounded hover:bg-blue-100 text-blue-600"
                      >
                        {expandedRows[actualIndex] ? 
                          <ChevronUp className="h-4 w-4" /> : 
                          <ChevronDown className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{registro.Empresa}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{registro.Sede}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{registro['Fecha Matricula']}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{registro.Curso}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{registro.tipoDocumento}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{registro.nroDocumento}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{registro.contratante}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {(registro.costoCurso || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {(registro.Comision || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className={`${registro.Pendiente ? 'text-red-600 font-medium' : ''}`}>
                        {(registro.Pendiente || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className={`${registro.Pagado ? 'text-green-600 font-medium' : ''}`}>
                        {(registro.Pagado || 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                      </span>
                    </td>
                  </tr>
                  {expandedRows[actualIndex] && (
                    <tr>
                      <td colSpan={12} className="px-6 py-4 bg-blue-50 border-t border-b border-blue-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded shadow-sm">
                            <h4 className="text-sm font-medium text-blue-600 mb-2">Detalles Adicionales</h4>
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-medium">Empresa:</span> {registro.Empresa}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Sede:</span> {registro.Sede}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded shadow-sm">
                            <h4 className="text-sm font-medium text-blue-600 mb-2">Información del Curso</h4>
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-medium">Curso:</span> {registro.Curso}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Fecha:</span> {registro['Fecha Matricula']}
                            </p>
                          </div>
                          <div className="bg-white p-4 rounded shadow-sm">
                            <h4 className="text-sm font-medium text-blue-600 mb-2">Estado de Pago</h4>
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-medium">Costo Total:</span> {(registro.costoCurso ?? 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Pagado:</span> 
                              <span className="text-green-600 ml-1">
                                {(registro.Pagado ?? 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                              </span>
                            </p>
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Pendiente:</span> 
                              <span className="text-red-600 ml-1">
                                {(registro.Pendiente ?? 0).toLocaleString('es-PE', { style: 'currency', currency: 'PEN' })}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Anterior
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage >= Math.ceil(sortedRegistros.length / itemsPerPage)}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage >= Math.ceil(sortedRegistros.length / itemsPerPage) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
              <span className="font-medium">
                {Math.min(indexOfLastItem, sortedRegistros.length)}
              </span>{' '}
              de <span className="font-medium">{sortedRegistros.length}</span> registros
            </p>
          </div>
          <div className="flex items-center">
            <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-700">Mostrar:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="mr-6 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* First page button */}
                {currentPage > 2 && (
                  <button
                    onClick={() => paginate(1)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    1
                  </button>
                )}
                
                {/* Ellipsis for skipped pages */}
                {currentPage > 3 && (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                )}
                
                {/* Previous page button (if not first page) */}
                {currentPage > 1 && (
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {currentPage - 1}
                  </button>
                )}
                
                {/* Current page button */}
                <button
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-600 text-sm font-medium text-white"
                >
                  {currentPage}
                </button>
                
                {/* Next page button (if not last page) */}
                {currentPage < Math.ceil(sortedRegistros.length / itemsPerPage) && (
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {currentPage + 1}
                  </button>
                )}
                
                {/* Ellipsis for skipped pages */}
                {currentPage < Math.ceil(sortedRegistros.length / itemsPerPage) - 2 && (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                )}
                
                {/* Last page button */}
                {currentPage < Math.ceil(sortedRegistros.length / itemsPerPage) - 1 && (
                  <button
                    onClick={() => paginate(Math.ceil(sortedRegistros.length / itemsPerPage))}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {Math.ceil(sortedRegistros.length / itemsPerPage)}
                  </button>
                )}
                
                <button
                  onClick={nextPage}
                  disabled={currentPage >= Math.ceil(sortedRegistros.length / itemsPerPage)}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage >= Math.ceil(sortedRegistros.length / itemsPerPage) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 
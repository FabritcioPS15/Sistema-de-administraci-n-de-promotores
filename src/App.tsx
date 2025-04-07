import React, { useState, useRef } from 'react';
import { TablaRegistros } from './components/TablaRegistros';
import { Filtros } from './components/Filtros';
import { DashboardContratantes } from './components/DashboardContratantes'; // Ensure this file exists in the specified path
import { FileUp, Download, AlertCircle, Filter, User } from 'lucide-react';
import * as XLSX from 'xlsx';

// Definición de tipos para coincidir con el Excel
type RegistroCurso = {
  Empresa: string;
  Sede: string;
  'Fecha Matricula': string;
  Curso: string;
  'Tipo Documento': string;
  'Nro. Documento': string;
  Contratante: string;
  'Costo Curso': number;
  Comision: number;
  Pendiente: number;
  Pagado: number;
  nroDocumento: string; // This should be a real property, not a comment
};

import { FiltrosCampos } from './types';

interface FiltrosProps {
  onFiltroChange: (campo: FiltrosCampos, valor: string) => void;
  onLimpiarFiltros: () => void;
  contratantes: string[];
  filtroContratante: string;
  onFiltroContratanteChange: (valor: string) => void;
}

// Datos de ejemplo con la nueva estructura
const datosIniciales: RegistroCurso[] = [
];

function App() {
  const [registros, setRegistros] = useState<RegistroCurso[]>(datosIniciales);
  const [filtros, setFiltros] = useState<Partial<Record<FiltrosCampos, string>>>({});
  const [filtroContratante, setFiltroContratante] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mostrarDashboard, setMostrarDashboard] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Obtener lista única de contratantes
  const contratantesUnicos = Array.from(new Set(registros.map(r => r.Contratante)));

  // Aplicar filtros a los registros
  const aplicarFiltros = (registros: RegistroCurso[]): RegistroCurso[] => {
    return registros.filter(registro => {
      // Aplicar filtros generales
      const pasaFiltrosGenerales = Object.entries(filtros).every(([campo, valor]) => {
        if (!valor) return true;
        const valorCampo = registro[campo as keyof RegistroCurso]?.toString().toLowerCase();
        return valorCampo?.includes(valor.toLowerCase());
      });

      // Aplicar filtro de contratante
      const pasaFiltroContratante = filtroContratante === '' || 
        registro.Contratante.toLowerCase().includes(filtroContratante.toLowerCase());

      return pasaFiltrosGenerales && pasaFiltroContratante;
    });
  };

  // Manejar cambio en los filtros generales
  const handleFiltroChange = (campo: FiltrosCampos, valor: string) => {
    setFiltros(prevFiltros => ({
      ...prevFiltros,
      [campo]: valor
    }));
  };

  // Manejar cambio en el filtro de contratante
  const handleFiltroContratanteChange = (valor: string) => {
    setFiltroContratante(valor);
  };

  // Limpiar todos los filtros
  const handleLimpiarFiltros = () => {
    setFiltros({});
    setFiltroContratante('');
    setSuccess('Filtros limpiados correctamente');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Importar datos desde Excel
  const handleImportExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño del archivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es demasiado grande (máximo 5MB)');
      return;
    }

    setError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('No se pudo leer el archivo');
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<RegistroCurso>(worksheet);

        // Validar estructura del archivo
        if (jsonData.length === 0) {
          throw new Error('El archivo no contiene datos');
        }

        const primerRegistro = jsonData[0];
        const camposRequeridos: (keyof RegistroCurso)[] = [
          'Empresa', 'Sede', 'Fecha Matricula', 'Curso', 
          'Tipo Documento', 'Nro. Documento', 'Contratante',
          'Costo Curso', 'Comision', 'Pendiente', 'Pagado'
        ];

        for (const campo of camposRequeridos) {
          if (!(campo in primerRegistro)) {
            throw new Error(`El archivo no tiene el campo requerido: ${campo}`);
          }
        }

        // Procesar datos numéricos
// In your handleImportExcel function in App.js, modify the datosProcesados mapping:
// In your App.js handleImportExcel function:
const datosProcesados = jsonData.map(item => {
  // Handle date format
  let fechaMatricula = item['Fecha Matricula'];
  if (fechaMatricula) {
    // Check if it's an Excel date serial number
    if (typeof fechaMatricula === 'number') {
      // Convert Excel date serial number to JS Date
      const date = new Date(Math.round((fechaMatricula - 25569) * 86400 * 1000));
      fechaMatricula = date.toLocaleDateString('es-PE');
    } else if (typeof fechaMatricula === 'string') {
      // Try to parse the date string if needed
      try {
        const date = new Date(fechaMatricula);
        if (!isNaN(date.getTime())) {
          fechaMatricula = date.toLocaleDateString('es-PE');
        }
      } catch (e) {
        // Keep original value if parsing fails
      }
    }
  }

  return {
    ...item,
    'Fecha Matricula': fechaMatricula || '',
    'Costo Curso': Number(item['Costo Curso']) || 0,
    Comision: Number(item.Comision) || 0,
    Pendiente: Number(item.Pendiente) || 0,
    Pagado: Number(item.Pagado) || 0,
    'Nro. Documento': item['Nro. Documento']?.toString() || '',
    
    // Map properties to match TablaRegistros component
    nroDocumento: item['Nro. Documento']?.toString() || '',
    tipoDocumento: item['Tipo Documento']?.toString() || '',
    contratante: item['Contratante']?.toString() || '',
    costoCurso: Number(item['Costo Curso']) || 0
  };
});

        setRegistros(datosProcesados);
        setSuccess(`Datos importados correctamente (${jsonData.length} registros)`);
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo');
    };

    reader.readAsBinaryString(file);
  };

  // Exportar datos a Excel
  const handleExportExcel = () => {
    try {
      const registrosFiltrados = aplicarFiltros(registros);
      if (registrosFiltrados.length === 0) {
        setError('No hay datos para exportar');
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Crear libro de Excel
      const workbook = XLSX.utils.book_new();
      
      // Hoja de datos
      const worksheet = XLSX.utils.json_to_sheet(registrosFiltrados);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');

      // Hoja de resumen
      const resumen = {
        'Total Registros': registrosFiltrados.length,
        'Total Costo Cursos': registrosFiltrados.reduce((sum, reg) => sum + reg['Costo Curso'], 0),
        'Total Comisiones': registrosFiltrados.reduce((sum, reg) => sum + reg.Comision, 0),
        'Total Pendiente': registrosFiltrados.reduce((sum, reg) => sum + reg.Pendiente, 0),
        'Total Pagado': registrosFiltrados.reduce((sum, reg) => sum + reg.Pagado, 0),
      };

      const resumenWorksheet = XLSX.utils.json_to_sheet([resumen]);
      XLSX.utils.book_append_sheet(workbook, resumenWorksheet, 'Resumen');

      // Generar nombre de archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `Registros_Cursos_${fecha}.xlsx`);

      setSuccess(`Datos exportados correctamente (${registrosFiltrados.length} registros)`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al exportar los datos');
      console.error(err);
    }
  };

  const registrosFiltrados = aplicarFiltros(registros);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Registro de Cursos
              </h1>
            </div>
            <button
              onClick={() => setMostrarDashboard(!mostrarDashboard)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {mostrarDashboard ? (
                <>
                  <Filter className="w-5 h-5 mr-2" />
                  Ocultar Dashboard
                </>
              ) : (
                <>
                  <User className="w-5 h-5 mr-2" />
                  Mostrar Dashboard
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Notificaciones */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Controles de importación/exportación */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FileUp className="w-5 h-5 mr-2" />
            Importar Excel
          </button>
          <button
            onClick={handleExportExcel}
            disabled={registros.length === 0}
            className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
              registros.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar Excel
          </button>
        </div>

        {/* Componente de filtros */}
        <Filtros 
          onFiltroChange={handleFiltroChange}
          onLimpiarFiltros={handleLimpiarFiltros}
          contratantes={contratantesUnicos}
          filtroContratante={filtroContratante}
          onFiltroContratanteChange={handleFiltroContratanteChange}
        />
        
        {/* Dashboard de Contratantes */}
        {mostrarDashboard && (
          <div className="mb-6">
            <DashboardContratantes 
              registros={registrosFiltrados} 
              onContratanteClick={handleFiltroContratanteChange}
              contratanteSeleccionado={filtroContratante}
            />
          </div>
        )}

        {/* Tabla de registros */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Registros {registrosFiltrados.length !== registros.length && 
                  `(Filtrados: ${registrosFiltrados.length} de ${registros.length})`}
              </h2>
              {registrosFiltrados.length === 0 && registros.length > 0 && (
                <span className="text-sm text-yellow-600">
                  No hay resultados con los filtros aplicados
                </span>
              )}
            </div>
            
            <TablaRegistros registros={registrosFiltrados} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
import React from 'react';
import { RegistroCurso } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

interface DashboardContratantesProps {
  registros: RegistroCurso[];
  onContratanteClick: (contratante: string) => void;
  contratanteSeleccionado: string;
}

export const DashboardContratantes: React.FC<DashboardContratantesProps> = ({ 
  registros, 
  onContratanteClick,
  contratanteSeleccionado
}) => {
  // Calcular estadísticas por contratante
  const statsPorContratante = registros.reduce((acc, registro) => {
    if (!acc[registro.contratante]) {
      acc[registro.contratante] = {
        cantidad: 0,
        totalCosto: 0,
        totalComision: 0,
        totalPagado: 0,
        cursos: new Set<string>()
      };
    }
    
    acc[registro.contratante].cantidad += 1;
    acc[registro.contratante].totalCosto += registro.costoCurso;
    acc[registro.contratante].totalComision += registro.comision;
    acc[registro.contratante].totalPagado += registro.pagado;
    acc[registro.contratante].cursos.add(registro.Curso || registro.curso);
    
    return acc;
  }, {} as Record<string, { 
    cantidad: number; 
    totalCosto: number; 
    totalComision: number; 
    totalPagado: number;
    cursos: Set<string>;
  }>);

  // Preparar datos para el gráfico y tabla
  const datosGrafico = Object.entries(statsPorContratante).map(([nombre, stats]) => ({
    nombre,
    cantidad: stats.cantidad,
    total: stats.totalCosto,
    comision: stats.totalComision,
    pagado: stats.totalPagado,
    cursos: Array.from(stats.cursos)
  }));

  // Ordenar por cantidad descendente
  datosGrafico.sort((a, b) => b.cantidad - a.cantidad);

  // Función mejorada para exportar a Excel
  const exportarContratantes = (limit: number) => {
    const validLimit = Math.max(1, Math.min(limit, datosGrafico.length));
    const dataToExport = datosGrafico.slice(0, validLimit);
    const today = new Date();
    const dateStr = today.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Preparar datos para Excel
    const excelData = dataToExport.map((item, index) => ({
      'N°': index + 1,
      'Contratante': item.nombre,
      'Cantidad de Cursos': item.cantidad,
      'Total Invertido (S/)': item.total,
      'Comisión Total (S/)': item.comision,
      'Total Pagado (S/)': item.pagado,
      'Cursos Contratados': item.cursos.join('\n')
    }));
    
    // Crear libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Ajustar anchos de columnas
    worksheet['!cols'] = [
      { wch: 5 },    // N°
      { wch: 30 },   // Contratante
      { wch: 15 },   // Cantidad
      { wch: 18 },   // Total
      { wch: 18 },   // Comisión
      { wch: 18 },   // Pagado
      { wch: 50 }    // Cursos
    ];
    
    // Añadir hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, "Contratantes");
    
    // Añadir título como primera fila
    const title = `Top ${validLimit} Contratantes - Generado el ${dateStr}`;
    XLSX.utils.sheet_add_aoa(worksheet, [[title]], { origin: -1 });
    
    // Combinar celdas para el título
    worksheet['!merges'] = [
      XLSX.utils.decode_range("A1:G1")
    ];
    
    // Generar archivo Excel
    XLSX.writeFile(workbook, `Top_${validLimit}_Contratantes_${new Date().toISOString().slice(0,10)}.xlsx`, {
      bookType: 'xlsx',
      type: 'array'
    });
  };

  // Datos para el gráfico (top 10)
  const datosTop10 = datosGrafico.slice(0, 10);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Dashboard de Contratantes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de barras */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Top 10 Contratantes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosTop10}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'cantidad') return [value, 'Cursos'];
                    if (name === 'total') return [`S/ ${Number(value).toFixed(2)}`, 'Total'];
                    return [value, name];
                  }}
                />
                <Bar 
                  dataKey="cantidad" 
                  fill="#ffa314" 
                  name="Cursos"
                  onClick={(data) => onContratanteClick(data.nombre)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de contratantes con opciones de exportación */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-medium text-gray-700">Estadísticas por Contratante</h3>
            <div className="flex gap-2 flex-wrap">
              {[5, 10, 15, 20].map(num => (
                <button
                  key={num}
                  onClick={() => exportarContratantes(num)}
                  className={`px-3 py-1 text-xs rounded text-white hover:opacity-90 transition-opacity ${
                    num === 5 ? 'bg-green-600' :
                    num === 10 ? 'bg-blue-600' :
                    num === 15 ? 'bg-purple-600' : 'bg-red-600'
                  }`}
                  title={`Exportar top ${num} contratantes`}
                >
                  Top {num}
                </button>
              ))}
              <button
                onClick={() => exportarContratantes(datosGrafico.length)}
                className="px-3 py-1 text-xs rounded bg-gray-600 text-white hover:opacity-90 transition-opacity"
                title="Exportar todos los contratantes"
              >
                Todos
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-64">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contratante</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cursos</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (S/)</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comisión</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datosGrafico.map((item, index) => (
                  <tr 
                    key={index} 
                    className={`hover:bg-blue-50 cursor-pointer ${
                      contratanteSeleccionado === item.nombre ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => onContratanteClick(item.nombre)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.nombre}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center">
                      {item.cantidad}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      S/ {item.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      S/ {item.comision.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
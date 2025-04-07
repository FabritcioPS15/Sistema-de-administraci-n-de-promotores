import React from 'react';
import { RegistroCurso } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
        totalPagado: 0
      };
    }
    
    acc[registro.contratante].cantidad += 1;
    acc[registro.contratante].totalCosto += registro.costoCurso;
    acc[registro.contratante].totalComision += registro.comision;
    acc[registro.contratante].totalPagado += registro.pagado;
    
    return acc;
  }, {} as Record<string, { cantidad: number; totalCosto: number; totalComision: number; totalPagado: number }>);

  // Preparar datos para el gráfico
  const datosGrafico = Object.entries(statsPorContratante).map(([nombre, stats]) => ({
    nombre,
    cantidad: stats.cantidad,
    total: stats.totalCosto
  }));

  // Ordenar por cantidad descendente
  datosGrafico.sort((a, b) => b.cantidad - a.cantidad);

  // Tomar solo los top 10 para el gráfico
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

        {/* Lista de contratantes */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Estadísticas por Contratante</h3>
          <div className="overflow-y-auto max-h-64">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contratante</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cursos</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (S/)</th>
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
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.nombre}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.cantidad}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{item.total.toFixed(2)}</td>
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
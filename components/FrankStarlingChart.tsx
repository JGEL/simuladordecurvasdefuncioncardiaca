import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';
import type { DataPoint } from '../types';

interface FrankStarlingChartProps {
  baselineCurveData: DataPoint[];
  baselineCurrentPoint: DataPoint;
  inotropyCurveData: DataPoint[] | null;
  inotropyCurrentPoint: DataPoint | null;
  inotropyCurveName: string;
  afterloadCurveData: DataPoint[] | null;
  afterloadCurrentPoint: DataPoint | null;
  afterloadCurveName: string;
}

const FrankStarlingChart: React.FC<FrankStarlingChartProps> = ({ 
  baselineCurveData, 
  baselineCurrentPoint,
  inotropyCurveData,
  inotropyCurrentPoint,
  inotropyCurveName,
  afterloadCurveData,
  afterloadCurrentPoint,
  afterloadCurveName
}) => {
  const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-sm text-gray-800 p-3 rounded shadow-lg border border-gray-200">
           <p className="font-semibold text-gray-600 mb-2">{`EDV: ${label} mL`}</p>
          {payload.map((pld: any) => (
            pld.value !== undefined && pld.value !== null &&
            <div key={pld.dataKey} style={{ color: pld.stroke }}>
              <p className="text-sm">{`${pld.name}:`}</p>
              <p className="text-sm font-bold ml-2">{`CO: ${pld.value.toFixed(2)} L/min`}</p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const allCoValues = [
    ...baselineCurveData.map(p => p.co),
    ...(inotropyCurveData?.map(p => p.co) ?? []),
    ...(afterloadCurveData?.map(p => p.co) ?? []),
    baselineCurrentPoint?.co ?? 0,
    inotropyCurrentPoint?.co ?? 0,
    afterloadCurrentPoint?.co ?? 0,
  ];
  const maxYDomain = Math.max(0, ...allCoValues.filter(v => v != null)) * 1.1;
  const minYDomain = 0;

  const combinedData = baselineCurveData.map((basePoint, index) => ({
    edv: basePoint.edv,
    coBaseline: basePoint.co,
    svBaseline: basePoint.sv,
    coInotropy: inotropyCurveData?.[index]?.co,
    svInotropy: inotropyCurveData?.[index]?.sv,
    coAfterload: afterloadCurveData?.[index]?.co,
    svAfterload: afterloadCurveData?.[index]?.sv,
  }));


  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={combinedData}
        margin={{
          top: 5,
          right: 20,
          left: 10,
          bottom: 25,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="edv" 
          type="number"
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          label={{ value: 'Volumen Fin de Diástole (EDV mL)', position: 'insideBottom', offset: -15, fill: '#6b7280', fontSize: 12 }}
          domain={['dataMin', 'dataMax']}
        />
        <YAxis 
          stroke="#6b7280"
          tick={{ fontSize: 12 }}
          label={{ value: 'Gasto Cardíaco (L/min)', angle: -90, position: 'insideLeft', offset: 0, fill: '#6b7280', fontSize: 12, dy: 40 }}
          domain={[minYDomain, parseFloat(maxYDomain.toFixed(1))]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#0ea5e9', strokeWidth: 1, strokeDasharray: '3 3' }} />
        <Legend verticalAlign="top" height={36} wrapperStyle={{color: '#374151'}} iconSize={10}/>
        
        <Line 
          type="monotone" 
          dataKey="coBaseline"
          name="Curva Basal" 
          stroke="#0ea5e9" // Sky blue
          strokeWidth={3} 
          dot={false} 
          activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff' }}
        />
        {baselineCurrentPoint && (
          <ReferenceDot 
            x={baselineCurrentPoint.edv} 
            y={baselineCurrentPoint.co} 
            r={6} 
            fill="#0ea5e9"
            stroke="#fff" 
            strokeWidth={2}
            ifOverflow="extendDomain"
            aria-label={`Punto actual basal: EDV ${baselineCurrentPoint.edv}, CO ${baselineCurrentPoint.co}`}
          />
        )}

        {inotropyCurveData && (
          <Line 
            type="monotone" 
            dataKey="coInotropy"
            name={inotropyCurveName} 
            stroke="#22c55e" // Green
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6, fill: '#22c55e', stroke: '#fff' }}
          />
        )}
        {inotropyCurrentPoint && (
          <ReferenceDot 
            x={inotropyCurrentPoint.edv} 
            y={inotropyCurrentPoint.co} 
            r={6} 
            fill="#22c55e"
            stroke="#fff" 
            strokeWidth={2}
            ifOverflow="extendDomain"
            aria-label={`Punto actual con inotropismo: EDV ${inotropyCurrentPoint.edv}, CO ${inotropyCurrentPoint.co}`}
          />
        )}

        {afterloadCurveData && (
          <Line 
            type="monotone" 
            dataKey="coAfterload"
            name={afterloadCurveName} 
            stroke="#ef4444" // Red
            strokeWidth={3} 
            dot={false} 
            activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff' }}
          />
        )}
        {afterloadCurrentPoint && (
          <ReferenceDot 
            x={afterloadCurrentPoint.edv} 
            y={afterloadCurrentPoint.co} 
            r={6} 
            fill="#ef4444" // Red
            stroke="#fff" 
            strokeWidth={2}
            ifOverflow="extendDomain"
            aria-label={`Punto actual con poscarga: EDV ${afterloadCurrentPoint.edv}, CO ${afterloadCurrentPoint.co}`}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FrankStarlingChart;
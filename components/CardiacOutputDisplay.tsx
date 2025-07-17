import React from 'react';

interface CardiacOutputDisplayProps {
  co: number;
  sv: number;
  hr: number;
  inotropy: number;
  inotropyCO: number;
  inotropySV: number;
  afterload: number;
  afterloadCO: number;
  afterloadSV: number;
}

const DataDisplayBlock: React.FC<{title: string, co: number, sv: number, colorClass: string, unit: string, svUnit: string}> = ({ title, co, sv, colorClass, unit, svUnit }) => (
  <div className="space-y-1">
    <h3 className="text-sm font-medium text-gray-500">{title}:</h3>
    <p className={`text-2xl font-bold ${colorClass}`}>
      {co.toFixed(2)} <span className="text-lg font-normal text-gray-500">{unit}</span>
    </p>
     <p className={`text-lg font-bold ${colorClass}`}>
        {sv.toFixed(1)} <span className="text-base font-normal text-gray-500">{svUnit}</span>
      </p>
  </div>
);


const CardiacOutputDisplay: React.FC<CardiacOutputDisplayProps> = ({ 
  co, sv, hr,
  inotropy, inotropyCO, inotropySV,
  afterload, afterloadCO, afterloadSV
}) => {
  return (
    <div className="space-y-3 p-4 bg-gray-100 rounded-lg">
      <div className="grid grid-cols-1 gap-4">
        <DataDisplayBlock title="Gasto Cardíaco (Basal)" co={co} sv={sv} colorClass="text-sky-600" unit="L/min" svUnit="mL/latido" />
        {inotropy !== 0 && (
          <div className="pt-2 border-t border-gray-200">
            <DataDisplayBlock title="Gasto Cardíaco (Inotropismo)" co={inotropyCO} sv={inotropySV} colorClass="text-green-600" unit="L/min" svUnit="mL/latido" />
          </div>
        )}
        {afterload !== 0 && (
          <div className="pt-2 border-t border-gray-200">
            <DataDisplayBlock title="Gasto Cardíaco (Poscarga)" co={afterloadCO} sv={afterloadSV} colorClass="text-red-600" unit="L/min" svUnit="mL/latido" />
          </div>
        )}
      </div>
      <div className="pt-3 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-600">Frecuencia Cardíaca (HR):</h3>
        <p className="text-lg font-bold text-sky-600">
          {hr.toFixed(0)} <span className="text-base font-normal text-gray-500">latidos/min</span>
        </p>
      </div>
    </div>
  );
};

export default CardiacOutputDisplay;
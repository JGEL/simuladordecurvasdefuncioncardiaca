import React, { useState, useMemo, useCallback, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  DEFAULT_CARDIAC_PARAMS, 
  POSITIVE_INOTROPY_CARDIAC_PARAMS,
  NEGATIVE_INOTROPY_CARDIAC_PARAMS,
  INCREASED_AFTERLOAD_CARDIAC_PARAMS,
  DECREASED_AFTERLOAD_CARDIAC_PARAMS,
  generateCurveData, 
  calculateCardiacOutput,
  calculateBidirectionalAdjustedParams
} from '../services/cardiacModel';
import type { DataPoint, CardiacParams } from '../types';
import EDVSlider from './EDVSlider';
import CardiacOutputDisplay from './CardiacOutputDisplay';
import FrankStarlingChart from './FrankStarlingChart';

const MIN_EDV_SLIDER = 50; // mL
const MAX_EDV_SLIDER = 280; // mL
const INITIAL_EDV = 120; // mL

const CardiacFunctionSimulator: React.FC = () => {
  const [edv, setEdv] = useState<number>(INITIAL_EDV);
  const [inotropy, setInotropy] = useState<number>(0); // -100 to 100%
  const [afterload, setAfterload] = useState<number>(0); // -100 to 100%
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const [baselineParams] = useState<CardiacParams>(DEFAULT_CARDIAC_PARAMS);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const inotropyAdjustedParams = useMemo(() => {
    return calculateBidirectionalAdjustedParams(
      baselineParams, 
      POSITIVE_INOTROPY_CARDIAC_PARAMS, 
      NEGATIVE_INOTROPY_CARDIAC_PARAMS, 
      inotropy / 100
    );
  }, [inotropy, baselineParams]);
  
  const afterloadAdjustedParams = useMemo(() => {
    return calculateBidirectionalAdjustedParams(
      baselineParams, 
      INCREASED_AFTERLOAD_CARDIAC_PARAMS, 
      DECREASED_AFTERLOAD_CARDIAC_PARAMS, 
      afterload / 100
    );
  }, [afterload, baselineParams]);


  const baselineCurveData = useMemo(() => {
    return generateCurveData(baselineParams, MIN_EDV_SLIDER, MAX_EDV_SLIDER, 100);
  }, [baselineParams]);

  const inotropyCurveData = useMemo(() => {
    if (inotropy === 0) return null;
    return generateCurveData(inotropyAdjustedParams, MIN_EDV_SLIDER, MAX_EDV_SLIDER, 100);
  }, [inotropy, inotropyAdjustedParams]);

  const afterloadCurveData = useMemo(() => {
    if (afterload === 0) return null;
    return generateCurveData(afterloadAdjustedParams, MIN_EDV_SLIDER, MAX_EDV_SLIDER, 100);
  }, [afterload, afterloadAdjustedParams]);

  const currentBaselineValues = useMemo(() => calculateCardiacOutput(edv, baselineParams), [edv, baselineParams]);
  const currentInotropyValues = useMemo(() => calculateCardiacOutput(edv, inotropyAdjustedParams), [edv, inotropyAdjustedParams]);
  const currentAfterloadValues = useMemo(() => calculateCardiacOutput(edv, afterloadAdjustedParams), [edv, afterloadAdjustedParams]);

  const createPointForChart = (edvValue: number, values: {co: number, sv: number}): DataPoint => ({
    edv: parseFloat(edvValue.toFixed(1)),
    co: parseFloat(values.co.toFixed(2)),
    sv: parseFloat(values.sv.toFixed(1)),
  });

  const currentBaselinePointForChart = useMemo(() => createPointForChart(edv, currentBaselineValues), [edv, currentBaselineValues]);
  const currentInotropyPointForChart = useMemo(() => inotropy !== 0 ? createPointForChart(edv, currentInotropyValues) : null, [edv, currentInotropyValues, inotropy]);
  const currentAfterloadPointForChart = useMemo(() => afterload !== 0 ? createPointForChart(edv, currentAfterloadValues) : null, [edv, currentAfterloadValues, afterload]);
  
  const inotropyCurveName = useMemo(() => {
    if (inotropy > 0) return "Inotropismo Positivo";
    if (inotropy < 0) return "Inotropismo Negativo";
    return "";
  }, [inotropy]);

  const afterloadCurveName = useMemo(() => {
    if (afterload > 0) return "Poscarga Aumentada";
    if (afterload < 0) return "Poscarga Disminuida";
    return "";
  }, [afterload]);


  const handleEdvChange = useCallback((newEdv: number) => setEdv(newEdv), []);
  const handleInotropyChange = useCallback((newIno: number) => setInotropy(newIno), []);
  const handleAfterloadChange = useCallback((newAft: number) => setAfterload(newAft), []);

  const handleGeneratePdf = async () => {
    if (!chartContainerRef.current) {
      console.error("El contenedor del gráfico no está disponible.");
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(chartContainerRef.current, {
        backgroundColor: '#f9fafb', // Match bg-gray-50
        scale: 2, // Improve resolution
      });
      const imgData = canvas.toDataURL('image/png');
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;

      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('Reporte de Simulación Cardíaca', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, pageWidth / 2, 28, { align: 'center' });

      let yPos = 45;

      // Parameters Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(3, 105, 161); // text-sky-700
      doc.text('Parámetros de Simulación', margin, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81); // text-gray-600
      const inotropyText = inotropy > 0 ? `+${inotropy.toFixed(0)}` : inotropy.toFixed(0);
      const afterloadText = afterload > 0 ? `+${afterload.toFixed(0)}` : afterload.toFixed(0);
      doc.text(`- Volumen Fin de Diástole (EDV): ${edv.toFixed(0)} mL`, margin + 5, yPos);
      yPos += 7;
      doc.text(`- Nivel de Inotropismo: ${inotropyText} %`, margin + 5, yPos);
      yPos += 7;
      doc.text(`- Nivel de Poscarga: ${afterloadText} %`, margin + 5, yPos);
      yPos += 15;

      // Results Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(3, 105, 161);
      doc.text('Resultados Calculados', margin, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.text(`- Condición Basal: GC de ${currentBaselineValues.co.toFixed(2)} L/min, VS de ${currentBaselineValues.sv.toFixed(1)} mL/latido.`, margin + 5, yPos);
      yPos += 7;

      if (inotropy !== 0) {
        doc.text(`- Con Inotropismo: GC de ${currentInotropyValues.co.toFixed(2)} L/min, VS de ${currentInotropyValues.sv.toFixed(1)} mL/latido.`, margin + 5, yPos);
        yPos += 7;
      }
      if (afterload !== 0) {
        doc.text(`- Con Poscarga: GC de ${currentAfterloadValues.co.toFixed(2)} L/min, VS de ${currentAfterloadValues.sv.toFixed(1)} mL/latido.`, margin + 5, yPos);
        yPos += 7;
      }

      doc.text(`- Frecuencia Cardíaca: ${baselineParams.heartRate} latidos/min.`, margin + 5, yPos);
      yPos += 15;

      // Chart Section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(3, 105, 161);
      doc.text('Gráfico de Frank-Starling', margin, yPos);
      yPos += 5;

      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (yPos + imgHeight > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
      }

      doc.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);

      doc.save('reporte-simulacion-cardiaca.pdf');
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el reporte. Por favor, inténtelo de nuevo.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-xl p-6 md:p-8 space-y-8 border border-gray-200/50">
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6 bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
          <h2 className="text-2xl font-semibold text-sky-600 border-b border-gray-200 pb-2">Controles de Simulación</h2>
          <EDVSlider
            label="Volumen Fin de Diástole (EDV)"
            unit="mL"
            min={MIN_EDV_SLIDER}
            max={MAX_EDV_SLIDER}
            step={1}
            value={edv}
            onChange={handleEdvChange}
          />
          <EDVSlider
            label="Inotropismo"
            unit="%"
            min={-100}
            max={100}
            step={1}
            value={inotropy}
            onChange={handleInotropyChange}
            colorClasses={{ text: 'text-green-600', accent: 'accent-green-500 hover:accent-green-600' }}
          />
          <EDVSlider
            label="Poscarga"
            unit="%"
            min={-100}
            max={100}
            step={1}
            value={afterload}
            onChange={handleAfterloadChange}
            colorClasses={{ text: 'text-red-600', accent: 'accent-red-500 hover:accent-red-600' }}
          />
          <CardiacOutputDisplay
            co={currentBaselineValues.co}
            sv={currentBaselineValues.sv}
            hr={baselineParams.heartRate}
            inotropy={inotropy}
            inotropyCO={currentInotropyValues.co}
            inotropySV={currentInotropyValues.sv}
            afterload={afterload}
            afterloadCO={currentAfterloadValues.co}
            afterloadSV={currentAfterloadValues.sv}
          />
        </div>
        <div ref={chartContainerRef} className="bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200 min-h-[300px]">
           <h2 className="text-2xl font-semibold text-sky-600 border-b border-gray-200 pb-2 mb-4">Curva de Frank-Starling</h2>
          <FrankStarlingChart
            baselineCurveData={baselineCurveData}
            baselineCurrentPoint={currentBaselinePointForChart}
            inotropyCurveData={inotropyCurveData}
            inotropyCurrentPoint={currentInotropyPointForChart}
            inotropyCurveName={inotropyCurveName}
            afterloadCurveData={afterloadCurveData}
            afterloadCurrentPoint={currentAfterloadPointForChart}
            afterloadCurveName={afterloadCurveName}
          />
        </div>
      </div>
       <div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-inner border border-gray-200">
        <h3 className="text-xl font-semibold text-sky-600 mb-2">Información</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Esta simulación ilustra la <strong>Ley de Frank-Starling</strong>. La curva azul representa la función cardíaca normal. Utiliza los sliders para ver los efectos de diferentes condiciones. Pueden moverse en ambas direcciones:
          <br />- <strong>Inotropismo:</strong> Aumenta (+) o disminuye (-) la contractilidad del corazón, desplazando la curva verde hacia arriba o abajo.
          <br />- <strong>Poscarga:</strong> Aumenta (+) o disminuye (-) la resistencia contra la que el corazón eyecta sangre, desplazando la curva roja hacia abajo o arriba.
        </p>
         <p className="text-gray-600 text-sm mt-2">Gasto Cardíaco (GC) = Volumen Sistólico (VS) × Frecuencia Cardíaca (FC)</p>
      </div>
       <div className="mt-8 flex justify-center">
        <button
          onClick={handleGeneratePdf}
          disabled={isGeneratingPdf}
          className="flex items-center justify-center bg-sky-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-live="polite"
        >
          {isGeneratingPdf ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando Reporte...
            </>
          ) : (
            'Generar Reporte en PDF'
          )}
        </button>
      </div>
    </div>
  );
};

export default CardiacFunctionSimulator;
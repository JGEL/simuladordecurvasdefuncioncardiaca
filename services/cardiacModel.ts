import { CardiacParams, DataPoint } from '../types';

export const DEFAULT_CARDIAC_PARAMS: CardiacParams = {
  minEDVForEjection: 50, // mL
  svMax: 180,            // mL, max possible stroke volume
  kmEffective: 90,       // mL, (EDV - minEDVForEjection) value for 50% svMax. Actual EDV = 90+50 = 140mL
  hillCoefficient: 2.8,  // Determines steepness
  heartRate: 72,         // beats per minute
};

export const POSITIVE_INOTROPY_CARDIAC_PARAMS: CardiacParams = {
  ...DEFAULT_CARDIAC_PARAMS,
  svMax: 220,            // Increased max stroke volume
  kmEffective: 70,       // Achieves 50% of new svMax at a lower effective EDV (70+50 = 120mL)
};

export const NEGATIVE_INOTROPY_CARDIAC_PARAMS: CardiacParams = {
  ...DEFAULT_CARDIAC_PARAMS,
  svMax: 150, // Decreased max stroke volume
  kmEffective: 110, // Higher EDV needed for 50% svMax
};


export const INCREASED_AFTERLOAD_CARDIAC_PARAMS: CardiacParams = {
  ...DEFAULT_CARDIAC_PARAMS,
  svMax: 150,             // Reduced max stroke volume due to increased resistance
  kmEffective: 100,       // Higher EDV needed to reach 50% of the new, lower svMax. (100+50 = 150mL)
};

export const DECREASED_AFTERLOAD_CARDIAC_PARAMS: CardiacParams = {
  ...DEFAULT_CARDIAC_PARAMS,
  svMax: 210, // Increased max stroke volume due to less resistance
  kmEffective: 80, // Lower EDV needed for 50% svMax
};


const lerp = (start: number, end: number, amount: number): number => {
  return start + (end - start) * amount;
};

export const calculateAdjustedParams = (
  baseParams: CardiacParams,
  targetParams: CardiacParams,
  intensity: number // A value from 0 to 1
): CardiacParams => {
  if (intensity <= 0) return baseParams;
  if (intensity >= 1) return targetParams;

  return {
    ...baseParams,
    svMax: lerp(baseParams.svMax, targetParams.svMax, intensity),
    kmEffective: lerp(baseParams.kmEffective, targetParams.kmEffective, intensity),
    hillCoefficient: lerp(baseParams.hillCoefficient, targetParams.hillCoefficient, intensity),
  };
};

export const calculateBidirectionalAdjustedParams = (
  baseParams: CardiacParams,
  positiveTargetParams: CardiacParams,
  negativeTargetParams: CardiacParams,
  intensity: number // A value from -1 to 1
): CardiacParams => {
  if (intensity === 0) {
    return baseParams;
  }
  
  if (intensity > 0) {
    // Interpolate towards the positive target, using intensity as the amount [0, 1]
    return calculateAdjustedParams(baseParams, positiveTargetParams, intensity);
  } else {
    // Interpolate towards the negative target, using the absolute value of intensity as the amount [0, 1]
    return calculateAdjustedParams(baseParams, negativeTargetParams, -intensity);
  }
};


export const calculateStrokeVolume = (edv: number, params: CardiacParams): number => {
  if (edv <= params.minEDVForEjection) {
    return 0;
  }
  const effectiveEDV = edv - params.minEDVForEjection;
  if (effectiveEDV <= 0) return 0; // Ensure effectiveEDV is positive

  const numerator = Math.pow(effectiveEDV, params.hillCoefficient);
  const denominator = Math.pow(params.kmEffective, params.hillCoefficient) + numerator;
  
  if (denominator === 0) return 0; 

  const sv = params.svMax * (numerator / denominator);
  return sv;
};

export const calculateCardiacOutput = (edv: number, params: CardiacParams): { co: number; sv: number } => {
  const sv = calculateStrokeVolume(edv, params);
  const coLitersPerMinute = (sv * params.heartRate) / 1000;
  return { co: coLitersPerMinute, sv };
};

export const generateCurveData = (
  params: CardiacParams,
  minEdvRange: number,
  maxEdvRange: number,
  steps: number
): DataPoint[] => {
  const data: DataPoint[] = [];
  const stepSize = (maxEdvRange - minEdvRange) / steps;

  for (let i = 0; i <= steps; i++) {
    const edv = minEdvRange + i * stepSize;
    const { co, sv } = calculateCardiacOutput(edv, params);
    data.push({ 
      edv: parseFloat(edv.toFixed(1)), 
      co: parseFloat(co.toFixed(2)),
      sv: parseFloat(sv.toFixed(1))
    });
  }
  return data;
};
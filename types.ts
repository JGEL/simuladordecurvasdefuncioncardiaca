
export interface CardiacParams {
  minEDVForEjection: number; // mL, minimum EDV for any stroke volume
  svMax: number; // mL, maximum stroke volume
  kmEffective: number; // mL, effective EDV (EDV - minEDVForEjection) at which SV is 50% of svMax
  hillCoefficient: number; // Dimensionless, steepness of the curve
  heartRate: number; // bpm
}

export interface DataPoint {
  edv: number; // End-Diastolic Volume in mL
  co: number;  // Cardiac Output in L/min
  sv?: number; // Optional: Stroke Volume in mL
}

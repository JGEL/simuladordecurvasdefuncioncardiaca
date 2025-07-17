import React from 'react';

interface EDVSliderProps {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  colorClasses?: {
    text: string;
    accent: string;
  }
}

const EDVSlider: React.FC<EDVSliderProps> = ({ 
  label, 
  unit, 
  min, 
  max, 
  step, 
  value, 
  onChange,
  colorClasses 
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(event.target.value));
  };
  
  const colors = colorClasses || {
    text: 'text-sky-600',
    accent: 'accent-sky-500 hover:accent-sky-600'
  };

  const displayValue = value > 0 ? `+${value.toFixed(0)}` : value.toFixed(0);
  const showCenterMark = min < 0 && max > 0;

  return (
    <div className="space-y-2">
      <label htmlFor={label} className="block text-sm font-medium text-gray-700">
        {label}: <span className={`font-bold ${colors.text}`}>{displayValue} {unit}</span>
      </label>
      <div className="relative pt-1">
        <input
          id={label}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className={`w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer ${colors.accent}`}
          aria-label={label}
        />
        {showCenterMark && (
            <div className="absolute w-px h-2 bg-gray-400 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-px"></div>
        )}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min}{unit}</span>
        {showCenterMark && <span>0{unit}</span>}
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

export default EDVSlider;
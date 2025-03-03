import React from "react";

interface NumericInputWithButtonsProps {
  value: number;
  onChange: (value: number) => void;
  increment: number;
  className?: string;
}

export const NumericInputWithButtons: React.FC<
  NumericInputWithButtonsProps
> = ({ value, onChange, increment, className }) => {
  const handleIncrement = () => {
    onChange(value + increment);
  };

  const handleDecrement = () => {
    onChange(value - increment);
  };

  return (
    <div className={`flex items-center px-2 ${className} w-fit`}>
      <button
        type="button"
        onClick={handleDecrement}
        className="rounded-l border border-gray-300 px-2 py-1"
      >
        -
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="max-w-24 border-b border-t border-gray-300 px-2 py-1 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        step={increment}
      />
      <button
        type="button"
        onClick={handleIncrement}
        className="rounded-r border border-gray-300 px-2 py-1"
      >
        +
      </button>
    </div>
  );
};

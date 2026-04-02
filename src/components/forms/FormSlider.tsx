import React from "react";

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  leftLabel?: string;
  rightLabel?: string;
  helper?: string;
}

const FormSlider: React.FC<Props> = ({
  label, value, onChange, min = 1, max = 10,
  leftLabel, rightLabel, helper,
}) => {
  const pct = ((value - min) / (max - min)) * 100;
  const sliderId = `slider-${label.replace(/\s/g, "-").toLowerCase()}`;

  return (
    <div style={{ marginBottom: 28 }}>
      <label htmlFor={sliderId} style={{ fontSize: 14, fontWeight: 500, color: "#0F0F0F", display: "block", marginBottom: 4 }}>
        {label}
      </label>
      {helper && <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>{helper}</div>}
      <div className="flex items-center gap-3" style={{ marginTop: helper ? 0 : 8 }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            id={sliderId}
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="gs-slider"
            style={{
              width: "100%",
              background: `linear-gradient(to right, #22C55E 0%, #22C55E ${pct}%, #E8E8E8 ${pct}%, #E8E8E8 100%)`,
            }}
          />
        </div>
        <span className="font-mono-data" style={{ fontSize: 18, fontWeight: 600, color: "#0F0F0F", width: 32, textAlign: "right" }}>
          {value}
        </span>
      </div>
      {(leftLabel || rightLabel) && (
        <div className="flex justify-between" style={{ marginTop: 4 }}>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{leftLabel}</span>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{rightLabel}</span>
        </div>
      )}
    </div>
  );
};

export default FormSlider;

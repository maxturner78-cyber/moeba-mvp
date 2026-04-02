import React from "react";

interface Props {
  title: string;
}

const PagePlaceholder: React.FC<Props> = ({ title }) => {
  return (
    <div>
      <h1
        className="font-heading"
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "#0F0F0F",
          letterSpacing: "-0.02em",
          marginBottom: 8,
        }}
      >
        {title}
      </h1>
      <p style={{ fontSize: 14, color: "#9CA3AF" }}>
        Content coming soon.
      </p>
    </div>
  );
};

export default PagePlaceholder;

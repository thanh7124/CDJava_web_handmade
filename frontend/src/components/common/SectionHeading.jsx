function SectionHeading({ label, title, align = "left" }) {
  return (
    <div className={`section-heading ${align === "center" ? "center" : ""}`}>
      {label ? <p>{label}</p> : null}
      <h2>{title}</h2>
    </div>
  );
}

export default SectionHeading;

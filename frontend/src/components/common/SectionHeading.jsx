function SectionHeading({ label, title, align = "left" }) {
  return (
    <div className={`section-heading ${align === "center" ? "center" : ""}`}>
      <p>{label}</p>
      <h2>{title}</h2>
    </div>
  );
}

export default SectionHeading;
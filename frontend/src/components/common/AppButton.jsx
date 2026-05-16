import { ArrowRight } from "lucide-react";

function AppButton({ href = "#", children, variant = "primary" }) {
  const className =
    variant === "primary" ? "primary-btn" : "secondary-btn";

  return (
    <a href={href} className={className}>
      {children}
      {variant === "primary" && <ArrowRight size={18} />}
    </a>
  );
}

export default AppButton;
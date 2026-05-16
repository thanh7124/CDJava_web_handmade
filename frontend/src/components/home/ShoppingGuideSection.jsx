import { Search, ShoppingBag, CreditCard, PackageCheck } from "lucide-react";
import SectionHeading from "../common/SectionHeading";

const steps = [
  {
    icon: Search,
    title: "Chọn sản phẩm",
    description: "Tìm món đồ handmade phù hợp với nhu cầu hoặc sở thích.",
  },
  {
    icon: ShoppingBag,
    title: "Thêm vào giỏ hàng",
    description: "Kiểm tra số lượng, màu sắc và thông tin sản phẩm.",
  },
  {
    icon: CreditCard,
    title: "Đặt hàng",
    description: "Nhập thông tin giao hàng và xác nhận đơn mua.",
  },
  {
    icon: PackageCheck,
    title: "Nhận sản phẩm",
    description: "Sản phẩm được đóng gói cẩn thận và giao tận nơi.",
  },
];

function ShoppingGuideSection() {
  return (
    <section className="shopping-guide-section">
      <SectionHeading
        label="Quy trình mua hàng"
        title="Mua đồ handmade dễ dàng chỉ với vài bước"
        align="center"
      />

      <div className="shopping-guide-list">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div className="shopping-guide-card" key={step.title}>
              <span className="step-number">0{index + 1}</span>
              <Icon size={30} />

              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ShoppingGuideSection;
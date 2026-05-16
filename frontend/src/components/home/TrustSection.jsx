import { Truck, ShieldCheck, RefreshCw } from "lucide-react";

const trustItems = [
  {
    icon: Truck,
    title: "Giao hàng nhanh",
    description: "Đóng gói cẩn thận, giao đến tận nơi.",
  },
  {
    icon: ShieldCheck,
    title: "Sản phẩm chất lượng",
    description: "Được chọn lọc từ các nghệ nhân thủ công.",
  },
  {
    icon: RefreshCw,
    title: "Hỗ trợ đổi trả",
    description: "Dễ dàng hỗ trợ khi sản phẩm có lỗi.",
  },
];

function TrustSection() {
  return (
    <section className="trust-section" id="about">
      {trustItems.map((item) => {
        const Icon = item.icon;

        return (
          <div className="trust-item" key={item.title}>
            <Icon size={28} />

            <div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

export default TrustSection;
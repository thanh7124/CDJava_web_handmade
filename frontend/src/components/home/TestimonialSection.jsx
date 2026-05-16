import { Star } from "lucide-react";
import SectionHeading from "../common/SectionHeading";

const testimonials = [
  {
    name: "Minh Anh",
    content:
      "Mình mua hoa len tặng bạn, đóng gói rất xinh và sản phẩm nhìn còn đẹp hơn ảnh.",
  },
  {
    name: "Gia Hân",
    content:
      "Vòng tay handmade rất tinh tế, shop tư vấn nhiệt tình và giao hàng nhanh.",
  },
  {
    name: "Hoàng Nam",
    content:
      "Móc khóa gỗ khắc tên rất hợp để làm quà tặng. Nhỏ nhưng có cảm giác rất riêng.",
  },
];

function TestimonialSection() {
  return (
    <section className="testimonial-section">
      <SectionHeading
        label="Khách hàng nói gì"
        title="Những phản hồi dễ thương từ người mua"
        align="center"
      />

      <div className="testimonial-list">
        {testimonials.map((item) => (
          <div className="testimonial-card" key={item.name}>
            <div className="testimonial-stars">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>

            <p>“{item.content}”</p>
            <h3>{item.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TestimonialSection;
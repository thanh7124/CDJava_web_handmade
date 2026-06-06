import React from "react";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import "./About.css";

export default function About() {
  return (
    <>
      <Header />

      <main className="about-page">
        <section className="about-hero">
          <div className="about-hero-content">
            <span>Về HandmadeShop</span>
            <h1>Chúng tôi tạo ra sản phẩm thủ công có hồn</h1>
            <p>
              HandmadeShop là không gian dành cho những sản phẩm thủ công tinh tế,
              được làm bằng tay với tâm huyết và sự tỉ mỉ. Mỗi món đồ đều kể một câu
              chuyện, giúp bạn kết nối sâu hơn với phong cách sống chậm và giá trị bền vững.
            </p>
          </div>
        </section>

        <section className="about-content">
          <article>
            <h2>Sứ mệnh của chúng tôi</h2>
            <p>
              Chúng tôi muốn mang đến cho khách hàng những món đồ thủ công độc đáo,
              chất lượng và thân thiện với môi trường. HandmadeShop hỗ trợ nghệ nhân địa
              phương bằng cách giới thiệu sản phẩm của họ đến người tiêu dùng yêu thích
              vẻ đẹp thủ công.
            </p>
          </article>

          <article>
            <h2>Giá trị cốt lõi</h2>
            <ul>
              <li>Chất lượng và sự tinh tế trong từng chi tiết.</li>
              <li>Minh bạch về nguồn gốc nguyên liệu và quy trình sản xuất.</li>
              <li>Cam kết hỗ trợ cộng đồng nghệ nhân và phát triển nghề thủ công.</li>
            </ul>
          </article>

          <article>
            <h2>Hành trình của chúng tôi</h2>
            <p>
              Bắt đầu từ một cửa hàng nhỏ, HandmadeShop đã phát triển dựa trên niềm tin của
              khách hàng và sự chân thành trong từng sản phẩm. Từ đồ gốm, đồ da đến đồ trang
              trí, chúng tôi luôn chọn lọc kỹ lưỡng và kết nối với những nghệ nhân yêu nghề.
            </p>
          </article>

          <article>
            <h2>Cam kết với khách hàng</h2>
            <p>
              Mỗi đơn hàng gửi đến khách hàng đều trải qua kiểm duyệt chất lượng, đóng gói cẩn thận
              và giao hàng nhanh chóng. Chúng tôi luôn lắng nghe phản hồi để ngày càng phục vụ tốt hơn.
            </p>
          </article>

          <article className="about-highlight">
            <h3>HandmadeShop - nơi gặp gỡ của sự sáng tạo và cảm xúc.</h3>
            <p>
              Nếu bạn muốn tìm một món quà có phong cách, một sản phẩm truyền cảm hứng hoặc đơn
              giản là muốn làm mới không gian sống, chúng tôi luôn sẵn sàng đồng hành cùng bạn.
            </p>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}

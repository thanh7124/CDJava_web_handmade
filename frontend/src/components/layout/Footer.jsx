function Footer() {
  return (
    <footer style={{ marginTop: "50px" }} className="footer">
      <div>
        <h2>
          Handmade<span>Shop</span>
        </h2>

        <p>
          Nơi kết nối những sản phẩm thủ công tinh tế với người yêu thích sự độc
          đáo, gần gũi và cá nhân hóa.
        </p>
      </div>

      <div>
        <h3>Liên kết</h3>
        <a href="/products">Sản phẩm</a>
        <a href="/categories">Danh mục</a>
        <a href="/about">Về chúng tôi</a>
      </div>

      <div>
        <h3>Hỗ trợ</h3>
        <a href="/">Chính sách giao hàng</a>
        <a href="/">Đổi trả</a>
        <a href="/">Liên hệ</a>
      </div>
    </footer>
  );
}

export default Footer;
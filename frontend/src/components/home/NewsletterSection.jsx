function NewsletterSection() {
  return (
    <section className="newsletter-section">
      <div>
        <p>Nhận ưu đãi mới</p>
        <h2>Đăng ký để không bỏ lỡ các mẫu handmade mới nhất</h2>
      </div>

      <form className="newsletter-form">
        <input type="email" placeholder="Nhập email của bạn" />
        <button type="button">Đăng ký</button>
      </form>
    </section>
  );
}

export default NewsletterSection;
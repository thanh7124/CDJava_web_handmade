import AppButton from "../common/AppButton";

function PromoBanner() {
  return (
    <section className="promo-banner">
      <div>
        <p>Ưu đãi trong tuần</p>
        <h2>Giảm đến 30% cho các sản phẩm quà tặng handmade</h2>
        <span>
          Lựa chọn món quà tinh tế, gần gũi và mang dấu ấn cá nhân.
        </span>
      </div>

      <AppButton href="#products">Khám phá ngay</AppButton>
    </section>
  );
}

export default PromoBanner;
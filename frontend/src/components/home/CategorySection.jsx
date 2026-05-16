import SectionHeading from "../common/SectionHeading";

const categories = [
  {
    name: "Phụ kiện",
    total: 24,
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Túi handmade",
    total: 18,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Trang trí",
    total: 32,
    image:
      "https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Quà tặng",
    total: 45,
    image:
      "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80",
  },
];

function CategorySection() {
  return (
    <section className="category-section" id="categories">
      <SectionHeading
        label="Danh mục"
        title="Mua sắm theo sở thích của bạn"
        align="center"
      />

      <div className="category-card-list">
        {categories.map((category) => (
          <a href="#products" className="category-card" key={category.name}>
            <img src={category.image} alt={category.name} />

            <div>
              <h3>{category.name}</h3>
              <p>{category.total} sản phẩm</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default CategorySection;
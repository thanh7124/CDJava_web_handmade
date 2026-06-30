package com.handmade.service;

import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import com.handmade.dto.PageResponse;
import com.handmade.dto.ProductRequest;
import com.handmade.dto.ProductResponse;
import com.handmade.entity.Category;
import com.handmade.entity.Product;
import com.handmade.repository.CategoryRepository;
import com.handmade.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public PageResponse<ProductResponse> getProducts(
            String search,
            Long categoryId,
            String sort,
            int page,
            int limit
    ) {
        int safePage = Math.max(page, 1);
        int safeLimit = Math.max(limit, 1);

        Pageable pageable = PageRequest.of(
                safePage - 1,
                safeLimit,
                buildSort(sort)
        );

        Specification<Product> specification = buildSpecification(search, categoryId);

        Page<Product> productPage = productRepository.findAll(specification, pageable);

        List<ProductResponse> data = productPage
                .getContent()
                .stream()
                .map(ProductResponse::from)
                .toList();

        return new PageResponse<>(
                data,
                safePage,
                safeLimit,
                productPage.getTotalPages(),
                productPage.getTotalElements()
        );
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        if (product.getActive() != null && !product.getActive()) {
            throw new RuntimeException("Sản phẩm hiện không còn được hiển thị");
        }

        return ProductResponse.from(product);
    }

    public ProductResponse createProduct(ProductRequest request) {
        validateProductRequest(request);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        Product product = new Product();

        applyProductData(product, request, category);

        Product savedProduct = productRepository.save(product);

        return ProductResponse.from(savedProduct);
    }

    public List<ProductResponse> createProducts(List<ProductRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new RuntimeException("Danh sách sản phẩm không được để trống");
        }

        return requests.stream()
                .map(this::createProduct)
                .toList();
    }

    public ProductResponse updateProduct(Long id, ProductRequest request) {
        validateProductRequest(request);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        applyProductData(product, request, category);

        Product updatedProduct = productRepository.save(product);

        return ProductResponse.from(updatedProduct);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy sản phẩm");
        }

        productRepository.deleteById(id);
    }

    public String uploadProductImage(MultipartFile file) {
    if (file == null || file.isEmpty()) {
        throw new RuntimeException("Vui lòng chọn ảnh sản phẩm");
    }

    String contentType = file.getContentType();

    if (contentType == null || !contentType.startsWith("image/")) {
        throw new RuntimeException("File tải lên phải là hình ảnh");
    }

    try {
        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "product" : file.getOriginalFilename()
        );

        String extension = "";

        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        String fileName = "product-" + UUID.randomUUID() + extension;

        Path uploadDir = Paths.get("uploads", "products")
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(uploadDir);

        Path targetPath = uploadDir.resolve(fileName);

        Files.copy(
                file.getInputStream(),
                targetPath,
                StandardCopyOption.REPLACE_EXISTING
        );

        return "http://localhost:8080/uploads/products/" + fileName;
        } 
        catch (IOException exception) {
        throw new RuntimeException("Không thể lưu ảnh sản phẩm");
        }
    }
    private void applyProductData(
            Product product,
            ProductRequest request,
            Category category
    ) {
        String name = request.getName().trim();

        String slug = request.getSlug();

        if (slug == null || slug.trim().isEmpty()) {
            slug = generateSlug(name);
        } else {
            slug = generateSlug(slug);
        }

        product.setName(name);
        product.setSlug(slug);
        product.setPrice(request.getPrice());
        product.setOldPrice(request.getOldPrice());
        product.setRating(request.getRating() != null ? request.getRating() : 0.0);
        product.setSold(request.getSold() != null ? request.getSold() : 0);
        product.setStock(request.getStock() != null ? request.getStock() : 0);
        product.setBadge(request.getBadge());
        product.setImage(request.getImage());
        product.setImages(buildProductImages(request));
        product.setDescription(request.getDescription());
        product.setCategory(category);
        product.setActive(request.getActive() != null ? request.getActive() : true);
    }

    private List<String> buildProductImages(ProductRequest request) {
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            return request.getImages();
        }

        List<String> images = new ArrayList<>();

        if (request.getImage() != null && !request.getImage().trim().isEmpty()) {
            images.add(request.getImage().trim());
        }

        return images;
    }

    private void validateProductRequest(ProductRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new RuntimeException("Tên sản phẩm không được để trống");
        }

        if (request.getPrice() == null) {
            throw new RuntimeException("Giá sản phẩm không được để trống");
        }

        if (request.getCategoryId() == null) {
            throw new RuntimeException("Danh mục sản phẩm không được để trống");
        }
    }

    private Specification<Product> buildSpecification(String search, Long categoryId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(criteriaBuilder.or(
                    criteriaBuilder.isNull(root.get("active")),
                    criteriaBuilder.isTrue(root.get("active"))
            ));

            if (search != null && !search.trim().isEmpty()) {
                String keyword = "%" + search.trim().toLowerCase() + "%";

                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        keyword
                ));
            }

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("category").get("id"),
                        categoryId
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Sort buildSort(String sort) {
        if (sort == null || sort.trim().isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "createdDate");
        }

        return switch (sort) {
            case "price-asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price-desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "best-seller" -> Sort.by(Sort.Direction.DESC, "sold");
            case "rating" -> Sort.by(Sort.Direction.DESC, "rating");
            case "newest" -> Sort.by(Sort.Direction.DESC, "createdDate");
            default -> Sort.by(Sort.Direction.DESC, "createdDate");
        };
    }

    private String generateSlug(String value) {
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        return normalized
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }
}
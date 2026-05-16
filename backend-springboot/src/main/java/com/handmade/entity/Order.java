package com.handmade.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Double totalPrice;

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'PENDING'")
    private String status;

    private String shippingAddress;

    private LocalDateTime createdDate;

    private LocalDateTime updatedDate;
}

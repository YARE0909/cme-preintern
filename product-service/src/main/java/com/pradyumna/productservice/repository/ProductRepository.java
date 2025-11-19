package com.pradyumna.productservice.repository;

import com.pradyumna.productservice.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    boolean existsBySku(String sku);  // ✅ This line fixes the issue
    Optional<Product> findBySku(String sku); // Optional helper if needed later
}

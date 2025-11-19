package com.pradyumna.productservice.service;

import com.pradyumna.productservice.dto.ProductUpdateRequest;
import com.pradyumna.productservice.exception.DuplicateProductException;
import com.pradyumna.productservice.exception.ProductNotFoundException;
import com.pradyumna.productservice.model.Product;
import com.pradyumna.productservice.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with ID: " + id));
    }

    public Product createProduct(Product product) {
        // Example uniqueness check
        if (product.getSku() != null && productRepository.existsBySku(product.getSku())) {
            throw new DuplicateProductException("Product with SKU '" + product.getSku() + "' already exists");
        }

        return productRepository.save(product);
    }

    public Product updateProduct(UUID id, ProductUpdateRequest req) {
        Product existingProduct = getProductById(id);

        if (req.getName() != null) {
            existingProduct.setName(req.getName());
        }
        if (req.getDescription() != null) {
            existingProduct.setDescription(req.getDescription());
        }
        if (req.getPrice() != null) {
            existingProduct.setPrice(BigDecimal.valueOf(req.getPrice()));
        }
        if (req.getStockQuantity() != null) {
            existingProduct.setStockQuantity(req.getStockQuantity());
        }
        if (req.getCategory() != null) {
            existingProduct.setCategory(req.getCategory());
        }
        if (req.getSku() != null) {
            existingProduct.setSku(req.getSku());
        }
        if (req.getImageUrl() != null) {
            existingProduct.setImageUrl(req.getImageUrl());
        }

        return productRepository.save(existingProduct);
    }

    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException("Product not found with ID: " + id);
        }
        productRepository.deleteById(id);
    }
}

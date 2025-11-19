package com.pradyumna.productservice.dto;

import lombok.Data;

@Data
public class ProductUpdateRequest {
    private String name;
    private String description;
    private Double price;
    private Integer stockQuantity;
    private String category;
    private String sku;
    private String imageUrl;
}

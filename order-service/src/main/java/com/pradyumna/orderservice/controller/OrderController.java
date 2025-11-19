package com.pradyumna.orderservice.controller;

import com.pradyumna.orderservice.dto.OrderRequest;
import com.pradyumna.orderservice.model.Order;
import com.pradyumna.orderservice.model.OrderStatus;
import com.pradyumna.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ---------- CREATE ORDER ----------
    /**
     * Create a new order.
     * Request payload must include userId and list of items (productId, quantity).
     * The service will fetch product details from ProductService automatically.
     */
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody OrderRequest request) {
        Order createdOrder = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }

    // ---------- GET ALL ORDERS ----------
    /**
     * Retrieve all orders.
     */
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // ---------- GET ORDER BY ID ----------
    /**
     * Retrieve a specific order by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable UUID id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // ---------- UPDATE ORDER STATUS ----------
    /**
     * Update the status of an existing order (e.g., PENDING → CONFIRMED → DELIVERED).
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable UUID id,
            @RequestParam OrderStatus status) {
        orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok().build();
    }
}

package com.pradyumna.orderservice.service;

import com.pradyumna.orderservice.client.ProductClient;
import com.pradyumna.orderservice.dto.OrderRequest;
import com.pradyumna.orderservice.exception.*;
import com.pradyumna.orderservice.model.*;
import com.pradyumna.orderservice.repository.OrderRepository;
import com.pradyumna.orderservice.rabbit.OrderEventProducer;   // ⬅️ IMPORTANT: new RabbitMQ producer
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final OrderEventProducer eventProducer;  // ⬅️ now RabbitMQ producer

    // ---------------------------------------------------
    // ✅ CREATE ORDER
    // ---------------------------------------------------
    @Transactional
    public Order createOrder(OrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new InvalidOrderStateException("Order must contain at least one product");
        }

        // Build order items by fetching data from Product Service
        List<OrderItem> orderItems = request.getItems().stream()
                .map(itemRequest -> {
                    UUID productId = itemRequest.getProductId();
                    Integer quantity = itemRequest.getQuantity();

                    if (quantity == null || quantity <= 0) {
                        throw new InvalidOrderStateException("Invalid quantity for product: " + productId);
                    }

                    Map<String, Object> productData = productClient.getProductById(productId);
                    if (productData == null || !productData.containsKey("price")) {
                        throw new InvalidOrderStateException("Product not found or missing price: " + productId);
                    }

                    BigDecimal price = new BigDecimal(productData.get("price").toString());
                    String productName = productData.getOrDefault("name", "Unknown Product").toString();

                    return OrderItem.builder()
                            .productId(productId)
                            .productName(productName)
                            .price(price)
                            .quantity(quantity)
                            .subtotal(price.multiply(BigDecimal.valueOf(quantity)))
                            .build();
                })
                .collect(Collectors.toList());

        // Calculate total
        BigDecimal total = orderItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Create Order
        Order order = Order.builder()
                .userId(request.getUserId())
                .totalAmount(total)
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .build();

        // Attach items
        orderItems.forEach(item -> item.setOrder(order));
        order.setItems(orderItems);

        // Save order
        Order savedOrder = orderRepository.save(order);

        // ----------- 🐇 RABBITMQ EVENT EMIT -----------
        try {
            eventProducer.publishOrderCreated(savedOrder);
        } catch (Exception e) {
            throw new InvalidOrderStateException(
                    "Failed to publish order_created event via RabbitMQ: " + e.getMessage()
            );
        }

        return savedOrder;
    }

    // ---------------------------------------------------
    // ✅ GET ALL ORDERS
    // ---------------------------------------------------
    public List<Order> getAllOrders() {
        try {
            List<Order> orders = orderRepository.findAll();
            if (orders.isEmpty()) {
                throw new OrderNotFoundException("No orders found in the system");
            }
            return orders;
        } catch (Exception e) {
            throw new InvalidOrderStateException("Failed to retrieve orders: " + e.getMessage());
        }
    }

    // ---------------------------------------------------
    // ✅ GET ORDER BY ID
    // ---------------------------------------------------
    public Optional<Order> getOrderById(UUID id) {
        return Optional.ofNullable(orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order with ID " + id + " not found")));
    }

    // ---------------------------------------------------
    // ✅ UPDATE ORDER STATUS
    // ---------------------------------------------------
    @Transactional
    public void updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order with ID " + orderId + " not found"));

        // Prevent illegal state transitions
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new InvalidOrderStateException("Cannot update status of a cancelled order");
        }
        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new InvalidOrderStateException("Order already delivered; cannot change status");
        }

        order.setStatus(newStatus);
        orderRepository.save(order);

        // ----------- 🐇 RABBITMQ EVENT EMIT -----------
        try {
            eventProducer.publishOrderStatusUpdated(order);
        } catch (Exception e) {
            throw new InvalidOrderStateException(
                    "Failed to publish order_status_updated event via RabbitMQ: " + e.getMessage()
            );
        }
    }

    // ---------------------------------------------------
    // ✅ UPDATE PAYMENT STATUS (for future Payment Service)
    // ---------------------------------------------------
    @Transactional
    public void updatePaymentStatus(UUID orderId, PaymentStatus paymentStatus, String referenceId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order with ID " + orderId + " not found"));

        if (order.getPaymentStatus() == PaymentStatus.SUCCESS && paymentStatus == PaymentStatus.SUCCESS) {
            throw new PaymentUpdateException("Payment already marked as successful for order " + orderId);
        }

        order.setPaymentStatus(paymentStatus);
        order.setPaymentReferenceId(referenceId);

        try {
            orderRepository.save(order);
        } catch (Exception e) {
            throw new PaymentUpdateException("Failed to update payment status: " + e.getMessage());
        }
    }
}

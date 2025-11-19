package com.pradyumna.orderservice.repository;

import com.pradyumna.orderservice.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {}

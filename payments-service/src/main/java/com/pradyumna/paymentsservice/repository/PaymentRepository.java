package com.pradyumna.paymentsservice.repository;

import com.pradyumna.paymentsservice.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByPaymentReferenceId(String paymentReferenceId);
    Optional<Payment> findByOrderId(UUID orderId);
    List<Payment> findAllByOrderId(UUID orderId);
}
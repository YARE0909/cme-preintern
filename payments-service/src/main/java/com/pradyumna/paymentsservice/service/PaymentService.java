package com.pradyumna.paymentsservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.pradyumna.paymentsservice.rabbit.PaymentEventProducer;
import com.pradyumna.paymentsservice.model.Payment;
import com.pradyumna.paymentsservice.model.PaymentStatus;
import com.pradyumna.paymentsservice.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventProducer eventProducer;

    /**
     * Called by Rabbit listener when order.created arrives.
     * Creates a PENDING payment row and returns the paymentReferenceId (for logging).
     */
    @Transactional
    public void initiatePayment(JsonNode orderEvent) {
        UUID orderId = UUID.fromString(orderEvent.get("id").asText());
        Long userId = orderEvent.get("userId").asLong();
        BigDecimal amount = new BigDecimal(orderEvent.get("totalAmount").asText());

        Payment payment = Payment.builder()
                .orderId(orderId)
                .userId(userId)
                .amount(amount)
                .status(PaymentStatus.PENDING)
                .paymentReferenceId(null)  // IMPORTANT
                .build();

        paymentRepository.save(payment);
    }


    /**
     * Simulate an actual payment (invoked by user hitting /pay endpoint).
     * Updates the payment status in DB and publishes payment.status event.
     */
    @Transactional
    public Payment simulatePayment(UUID orderId, PaymentStatus newStatus) {

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for order: " + orderId));

        payment.setStatus(newStatus);

        // generate reference ONLY after successful payment
        payment.setPaymentReferenceId(UUID.randomUUID().toString());

        Payment saved = paymentRepository.save(payment);

        // publish payment.status event
        eventProducer.publishPaymentStatus(saved);

        return saved;
    }

}

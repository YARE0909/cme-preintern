package com.pradyumna.paymentsservice.controller;

import com.pradyumna.paymentsservice.model.Payment;
import com.pradyumna.paymentsservice.model.PaymentStatus;
import com.pradyumna.paymentsservice.repository.PaymentRepository;
import com.pradyumna.paymentsservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable UUID id) {
        return paymentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ref/{paymentReferenceId}")
    public ResponseEntity<Payment> getByReference(@PathVariable String paymentReferenceId) {
        return paymentRepository.findByPaymentReferenceId(paymentReferenceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Simulate a user completing a payment. Body example:
     * {
     *   "status": "SUCCESS"   // or "FAILED"
     * }
     *
     * Example: POST /api/payments/{paymentReferenceId}/pay
     */
    @PostMapping("/pay")
    public ResponseEntity<Payment> simulatePayment(
            @RequestParam UUID orderId) {

        PaymentStatus status = PaymentStatus.SUCCESS;

        Payment updated = paymentService.simulatePayment(orderId, status);
        return ResponseEntity.ok(updated);
    }

}

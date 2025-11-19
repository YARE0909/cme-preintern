package com.pradyumna.orderservice.rabbit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pradyumna.orderservice.model.PaymentStatus;
import com.pradyumna.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

import static com.pradyumna.orderservice.config.RabbitConfig.PAYMENT_STATUS_QUEUE;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventConsumer {

    private final OrderService orderService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @RabbitListener(queues = PAYMENT_STATUS_QUEUE)
    public void consumePaymentEvent(String message) {
        try {
            JsonNode json = objectMapper.readTree(message);

            UUID orderId = UUID.fromString(json.get("orderId").asText());
            PaymentStatus status = PaymentStatus.valueOf(json.get("status").asText());
            String referenceId = json.get("paymentReferenceId").asText();

            log.info("🔥 ORDER SERVICE received payment update | orderId={} status={} ref={}",
                    orderId, status, referenceId);

            orderService.updatePaymentStatus(orderId, status, referenceId);

        } catch (Exception e) {
            log.error("❌ Failed to process payment.status event", e);
        }
    }
}

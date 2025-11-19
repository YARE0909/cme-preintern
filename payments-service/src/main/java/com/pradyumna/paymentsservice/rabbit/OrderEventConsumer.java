package com.pradyumna.paymentsservice.rabbit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pradyumna.paymentsservice.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import static com.pradyumna.paymentsservice.config.RabbitConfig.ORDER_CREATED_QUEUE;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final PaymentService paymentService;

    @RabbitListener(queues = ORDER_CREATED_QUEUE)
    public void consumeOrderCreated(String message) {
        try {
            JsonNode json = objectMapper.readTree(message);
            log.info("📥 Received order_created event: {}", message);

            paymentService.initiatePayment(json);
            log.info("➡️ Payment row created in PENDING state");

        } catch (Exception e) {
            log.error("❌ Failed to process order_created event", e);
        }
    }
}

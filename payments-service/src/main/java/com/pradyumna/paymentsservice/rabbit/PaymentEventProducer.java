package com.pradyumna.paymentsservice.rabbit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.pradyumna.paymentsservice.model.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import static com.pradyumna.paymentsservice.config.RabbitConfig.EXCHANGE;
import static com.pradyumna.paymentsservice.config.RabbitConfig.PAYMENT_STATUS_ROUTING_KEY;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventProducer {

    private final RabbitTemplate rabbitTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public void publishPaymentStatus(Payment payment) {
        try {
            String json = objectMapper.writeValueAsString(payment);

            rabbitTemplate.convertAndSend(
                    EXCHANGE,
                    PAYMENT_STATUS_ROUTING_KEY,
                    json
            );

            log.info("🐇 Published payment_status event | routingKey={} payload={}",
                    PAYMENT_STATUS_ROUTING_KEY, json);

        } catch (Exception e) {
            log.error("❌ Failed to publish payment_status event", e);
        }
    }
}

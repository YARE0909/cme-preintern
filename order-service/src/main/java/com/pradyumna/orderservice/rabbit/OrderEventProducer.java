package com.pradyumna.orderservice.rabbit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.pradyumna.orderservice.model.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import static com.pradyumna.orderservice.config.RabbitConfig.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventProducer {

    private final RabbitTemplate rabbitTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    public void publishOrderCreated(Order order) {
        send(ORDER_CREATED_ROUTING_KEY, order, "order_created");
    }

    public void publishOrderStatusUpdated(Order order) {
        send(ORDER_STATUS_ROUTING_KEY, order, "order_status_updated");
    }

    private void send(String routingKey, Object payload, String eventName) {
        try {
            String json = objectMapper.writeValueAsString(payload);

            rabbitTemplate.convertAndSend(
                    EXCHANGE,
                    routingKey,
                    json
            );

            log.info("🐇 Sent RabbitMQ event | type={} routingKey={} payload={}",
                    eventName, routingKey, json);

        } catch (Exception ex) {
            log.error("❌ RabbitMQ publish failed | routingKey={} cause={}",
                    routingKey, ex.getMessage(), ex);
            throw new RuntimeException(ex);
        }
    }
}

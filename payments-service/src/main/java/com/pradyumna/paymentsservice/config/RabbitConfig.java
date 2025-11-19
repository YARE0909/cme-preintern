package com.pradyumna.paymentsservice.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE = "order.events.exchange";

    public static final String ORDER_CREATED_QUEUE = "order.created.queue";
    public static final String PAYMENT_STATUS_QUEUE = "payment.status.queue";

    public static final String ORDER_CREATED_ROUTING_KEY = "order.created";
    public static final String PAYMENT_STATUS_ROUTING_KEY = "payment.status";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    // === Consumer Queue ===
    @Bean
    public Queue orderCreatedQueue() {
        return QueueBuilder.durable(ORDER_CREATED_QUEUE).build();
    }

    @Bean
    public Binding bindOrderCreated() {
        return BindingBuilder.bind(orderCreatedQueue())
                .to(exchange())
                .with(ORDER_CREATED_ROUTING_KEY);
    }

    // === Producer Queue (must still declare + bind!) ===
    @Bean
    public Queue paymentStatusQueue() {
        return QueueBuilder.durable(PAYMENT_STATUS_QUEUE).build();
    }

    @Bean
    public Binding bindPaymentStatus() {
        return BindingBuilder.bind(paymentStatusQueue())
                .to(exchange())
                .with(PAYMENT_STATUS_ROUTING_KEY);
    }
}

package com.pradyumna.orderservice.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE = "order.events.exchange";

    public static final String ORDER_CREATED_QUEUE = "order.created.queue";
    public static final String ORDER_STATUS_UPDATED_QUEUE = "order.status.queue";
    public static final String PAYMENT_STATUS_QUEUE = "payment.status.queue";

    public static final String ORDER_CREATED_ROUTING_KEY = "order.created";
    public static final String ORDER_STATUS_ROUTING_KEY = "order.status";
    public static final String PAYMENT_STATUS_ROUTING_KEY = "payment.status";

    // Exchange
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    // Queues
    @Bean
    public Queue orderCreatedQueue() {
        return QueueBuilder.durable(ORDER_CREATED_QUEUE).build();
    }

    @Bean
    public Queue orderStatusUpdatedQueue() {
        return QueueBuilder.durable(ORDER_STATUS_UPDATED_QUEUE).build();
    }

    @Bean
    public Queue paymentStatusQueue() {
        return QueueBuilder.durable(PAYMENT_STATUS_QUEUE).build();
    }

    // Bindings
    @Bean
    public Binding bindOrderCreated() {
        return BindingBuilder.bind(orderCreatedQueue())
                .to(orderExchange())
                .with(ORDER_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding bindOrderStatusUpdated() {
        return BindingBuilder.bind(orderStatusUpdatedQueue())
                .to(orderExchange())
                .with(ORDER_STATUS_ROUTING_KEY);
    }

    @Bean
    public Binding bindPaymentStatus() {
        return BindingBuilder.bind(paymentStatusQueue())
                .to(orderExchange())
                .with(PAYMENT_STATUS_ROUTING_KEY);
    }

}

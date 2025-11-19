package com.pradyumna.paymentsservice.exception;

public class KafkaPublishException extends RuntimeException {
    private final String topic;
    private final String key;

    public KafkaPublishException(String topic, String key, String message, Throwable cause) {
        super(message, cause);
        this.topic = topic;
        this.key = key;
    }

    public String getTopic() { return topic; }
    public String getKey() { return key; }
}

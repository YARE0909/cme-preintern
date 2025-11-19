package com.pradyumna.orderservice.exception;

public class InvalidOrderItemException extends RuntimeException {
    public InvalidOrderItemException(String message) {
        super(message);
    }
}

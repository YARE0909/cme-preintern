package com.pradyumna.orderservice.exception;

public class DuplicateOrderItemException extends RuntimeException {
    public DuplicateOrderItemException(String message) {
        super(message);
    }
}

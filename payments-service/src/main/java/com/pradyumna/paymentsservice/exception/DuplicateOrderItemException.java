package com.pradyumna.paymentsservice.exception;

public class DuplicateOrderItemException extends RuntimeException {
    public DuplicateOrderItemException(String message) {
        super(message);
    }
}

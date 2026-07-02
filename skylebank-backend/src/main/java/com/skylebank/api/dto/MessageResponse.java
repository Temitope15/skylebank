/**
 * File: MessageResponse.java
 *
 * Purpose:
 * Common response envelope returning string messages.
 *
 * Responsibilities:
 * * Carry status/info messages
 *
 * Why this file exists:
 * To provide clean unified message structures back to callers.
 *
 * Usage Flow:
 * Controller -> MessageResponse -> HTTP response body
 *
 * Design Decisions:
 * * Data Transfer Object (DTO) pattern
 */
package com.skylebank.api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * Common payload returned for generic message success or notification warnings.
 */
@Getter
@Setter
@AllArgsConstructor
public class MessageResponse {
    private String message;
}

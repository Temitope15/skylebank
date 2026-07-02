/**
 * File: UserRegisteredEvent.java
 *
 * Purpose:
 * Application event representing a completed user registration.
 *
 * Responsibilities:
 * * Carry the registered User payload details
 *
 * Why this file exists:
 * To enable decoupled event publication so other domain modules can trigger actions when new users register.
 *
 * Usage Flow:
 * AuthService -> publishes UserRegisteredEvent -> Event Listener (e.g. Wallet Creation)
 *
 * Important Notes:
 * * Extends org.springframework.context.ApplicationEvent
 *
 * Design Decisions:
 * * Event Driven Architecture pattern
 */
package com.skylebank.api.events;

import com.skylebank.api.models.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event triggered when a new user registers successfully.
 */
@Getter
public class UserRegisteredEvent extends ApplicationEvent {
    private final User user;

    public UserRegisteredEvent(Object source, User user) {
        super(source);
        this.user = user;
    }
}

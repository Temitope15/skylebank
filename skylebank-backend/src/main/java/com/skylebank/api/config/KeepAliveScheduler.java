/**
 * File: KeepAliveScheduler.java
 *
 * Purpose:
 * Periodically sends a GET request to the application's health endpoint to prevent Render free-tier container dormancy.
 *
 * Responsibilities:
 * * Read the APP_PING_URL environment variable.
 * * Ping the healthcheck endpoint at APP_PING_URL/api/v1/health every 10 minutes.
 */
package com.skylebank.api.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class KeepAliveScheduler {

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Executes every 10 minutes (600,000 milliseconds).
     */
    @Scheduled(fixedRate = 600000)
    public void pingSelf() {
        String appPingUrl = System.getenv("APP_PING_URL");
        if (appPingUrl == null || appPingUrl.isBlank()) {
            log.debug("Keep-Alive Scheduler: APP_PING_URL environment variable is not defined. Skipping self-ping.");
            return;
        }

        try {
            String targetUrl = appPingUrl.trim();
            if (targetUrl.endsWith("/")) {
                targetUrl = targetUrl.substring(0, targetUrl.length() - 1);
            }
            targetUrl = targetUrl + "/api/v1/health";

            log.info("Keep-Alive Scheduler: Sending self-ping to {}", targetUrl);
            String response = restTemplate.getForObject(targetUrl, String.class);
            log.info("Keep-Alive Scheduler: Received status response: {}", response);
        } catch (Exception e) {
            log.warn("Keep-Alive Scheduler: Failed to ping health check endpoint: {}", e.getMessage());
        }
    }
}

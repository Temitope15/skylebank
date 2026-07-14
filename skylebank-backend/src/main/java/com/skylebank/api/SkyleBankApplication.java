package com.skylebank.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Core entry point for the SkyleBank Digital Banking API.
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
public class SkyleBankApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkyleBankApplication.class, args);
    }
}

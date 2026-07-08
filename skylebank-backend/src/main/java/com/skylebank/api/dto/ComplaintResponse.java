package com.skylebank.api.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * Data Transfer Object representing detailed response for user complaints.
 */
@Getter
@Builder
public class ComplaintResponse {
    private Long id;
    private String userEmail;
    private String userFullName;
    private String title;
    private String description;
    private String category;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

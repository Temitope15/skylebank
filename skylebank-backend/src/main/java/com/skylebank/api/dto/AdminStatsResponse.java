package com.skylebank.api.dto;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

/**
 * Data Transfer Object representing system statistics and health metrics for Admin dashboard.
 */
@Getter
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalActiveWallets;
    private BigDecimal totalSystemBalance;
    private long totalTransactions;
    private BigDecimal totalTransactionVolume;
    private long unresolvedComplaints;
    
    // System Health indicators
    private String dbStatus;
    private String cacheStatus;
    private long systemFreeMemoryBytes;
    private long systemUptimeSeconds;
}

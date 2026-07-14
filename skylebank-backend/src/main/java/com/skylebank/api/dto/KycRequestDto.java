package com.skylebank.api.dto;

import com.skylebank.api.models.KycLevel;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KycRequestDto {
    @NotNull(message = "Target tier level is required")
    private KycLevel targetTier;

    private String bvn;
    private String nin;
    private String documentUrl;
}

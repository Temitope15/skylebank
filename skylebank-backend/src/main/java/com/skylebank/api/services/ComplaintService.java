package com.skylebank.api.services;

import com.skylebank.api.dto.ComplaintRequest;
import com.skylebank.api.dto.ComplaintResponse;
import com.skylebank.api.models.Complaint;
import com.skylebank.api.models.ComplaintCategory;
import com.skylebank.api.models.ComplaintStatus;
import com.skylebank.api.models.User;
import com.skylebank.api.repositories.ComplaintRepository;
import com.skylebank.api.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service managing user-facing support complaints.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    /**
     * Files a new complaint for the logged-in user.
     */
    @Transactional
    public ComplaintResponse createComplaint(String email, ComplaintRequest request) {
        log.info("Filing complaint for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        ComplaintCategory category;
        try {
            category = ComplaintCategory.valueOf(request.getCategory().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid category: " + request.getCategory() + ". Must be TRANSACTION, ACCOUNT, SECURITY, or OTHER.");
        }

        Complaint complaint = Complaint.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(category)
                .status(ComplaintStatus.PENDING)
                .build();

        Complaint saved = complaintRepository.save(complaint);
        return mapToResponse(saved);
    }

    /**
     * Lists all complaints filed by the user.
     */
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getUserComplaints(String email) {
        log.info("Fetching complaints for user: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        return complaintRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ComplaintResponse mapToResponse(Complaint complaint) {
        return ComplaintResponse.builder()
                .id(complaint.getId())
                .userEmail(complaint.getUser().getEmail())
                .userFullName(complaint.getUser().getFirstName() + " " + complaint.getUser().getLastName())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory().name())
                .status(complaint.getStatus().name())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt())
                .build();
    }
}

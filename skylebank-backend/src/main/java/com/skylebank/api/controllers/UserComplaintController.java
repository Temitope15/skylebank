package com.skylebank.api.controllers;

import com.skylebank.api.dto.ComplaintRequest;
import com.skylebank.api.dto.ComplaintResponse;
import com.skylebank.api.services.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * Controller exposing endpoints for customers to file and track support complaints.
 */
@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
@Slf4j
public class UserComplaintController {

    private final ComplaintService complaintService;

    /**
     * Submit a new support ticket/complaint.
     */
    @PostMapping
    public ResponseEntity<ComplaintResponse> fileComplaint(
            Principal principal,
            @Valid @RequestBody ComplaintRequest request) {
        String email = principal.getName();
        log.info("REST request to file a complaint for user: {}", email);
        return ResponseEntity.ok(complaintService.createComplaint(email, request));
    }

    /**
     * List all complaints filed by the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getUserComplaints(Principal principal) {
        String email = principal.getName();
        log.info("REST request to fetch complaints for user: {}", email);
        return ResponseEntity.ok(complaintService.getUserComplaints(email));
    }
}

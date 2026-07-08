/**
 * File: UserDetailsImpl.java
 *
 * Purpose:
 * Implements Spring Security's UserDetails to bridge User entities to security principals.
 *
 * Responsibilities:
 * * Store user credentials and permission authorities
 * * Verify account lock/suspension status
 *
 * Why this file exists:
 * Spring Security authorization requires checking credentials and roles against a standard interface.
 *
 * Usage Flow:
 * UserDetailsServiceImpl -> UserDetailsImpl -> AuthenticationManager
 *
 * Important Notes:
 * * Ignores password during serialization (@JsonIgnore)
 *
 * Design Decisions:
 * * Adapter Pattern mapping User to UserDetails
 */
package com.skylebank.api.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.skylebank.api.models.User;
import com.skylebank.api.models.UserStatus;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

/**
 * Custom UserDetails implementation to hold active user principal data.
 */
@Getter
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class UserDetailsImpl implements UserDetails {

    private final UUID id;
    private final String firstName;
    private final String lastName;
    private final String email;
    private final String phoneNumber;

    @JsonIgnore
    private final String password;

    private final UserStatus accountStatus;
    private final Collection<? extends GrantedAuthority> authorities;

    public static UserDetailsImpl build(User user) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
        
        return new UserDetailsImpl(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getPassword(),
                user.getAccountStatus(),
                Collections.singletonList(authority)
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return accountStatus != UserStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return accountStatus == UserStatus.ACTIVE;
    }
}

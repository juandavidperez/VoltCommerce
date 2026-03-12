package com.voltcommerce.service;

import com.voltcommerce.dto.AuthResponse;
import com.voltcommerce.dto.LoginRequest;
import com.voltcommerce.dto.RegisterRequest;
import com.voltcommerce.entity.Role;
import com.voltcommerce.entity.User;
import com.voltcommerce.exception.BadRequestException;
import com.voltcommerce.repository.UserRepository;
import com.voltcommerce.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .name("John Doe")
                .email("john@example.com")
                .password("encoded_password")
                .role(Role.CUSTOMER)
                .build();
    }

    @Test
    void register_withDuplicateEmail_throwsException() {
        RegisterRequest request = RegisterRequest.builder()
                .name("John Doe")
                .email("john@example.com")
                .password("password123")
                .build();

        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Email already registered");
    }

    @Test
    void register_withValidData_returnsAuthResponse() {
        RegisterRequest request = RegisterRequest.builder()
                .name("John Doe")
                .email("john@example.com")
                .password("password123")
                .build();

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access_token");
        when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh_token");

        AuthResponse response = authService.register(request);

        assertThat(response.getAccessToken()).isEqualTo("access_token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh_token");
        assertThat(response.getEmail()).isEqualTo("john@example.com");
        assertThat(response.getRole()).isEqualTo("CUSTOMER");
    }

    @Test
    void login_withInvalidEmail_throwsException() {
        LoginRequest request = LoginRequest.builder()
                .email("unknown@example.com")
                .password("password123")
                .build();

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void login_withWrongPassword_throwsException() {
        LoginRequest request = LoginRequest.builder()
                .email("john@example.com")
                .password("wrong_password")
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrong_password", "encoded_password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void login_withValidCredentials_returnsAuthResponse() {
        LoginRequest request = LoginRequest.builder()
                .email("john@example.com")
                .password("password123")
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encoded_password")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any(User.class))).thenReturn("access_token");
        when(jwtTokenProvider.generateRefreshToken(any(User.class))).thenReturn("refresh_token");

        AuthResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("access_token");
        assertThat(response.getEmail()).isEqualTo("john@example.com");
        assertThat(response.getName()).isEqualTo("John Doe");
    }
}

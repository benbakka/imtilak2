package com.constructmanager.security;

import com.constructmanager.service.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    // List of paths that should be excluded from JWT authentication
    private static final List<String> EXCLUDE_PATHS = Arrays.asList(
            "/auth/",
            "/health",
            "/error",
            "/v3/api-docs/",
            "/swagger-ui/",
            "/swagger-ui.html"
    );

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Autowired
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        
        // Verbose logging of all request details
        logger.info("===== JWT FILTER REQUEST INFO =====");
        logger.info("URI: {}", requestURI);
        logger.info("Method: {}", method);
        logger.info("QueryString: {}", request.getQueryString());
        logger.info("Has Auth Header: {}", request.getHeader("Authorization") != null);
        
        // Always skip OPTIONS requests (for CORS)
        if (method.equals("OPTIONS")) {
            logger.info("Skipping JWT filter for OPTIONS request");
            return true;
        }
        
        // Check for auth endpoints with comprehensive matching
        if (requestURI.contains("/auth/") || 
            requestURI.equals("/auth") || 
            requestURI.contains("/api/v1/auth/") || 
            requestURI.equals("/api/v1/auth")) {
            
            logger.info("Skipping JWT filter for auth endpoint: {}", requestURI);
            return true;
        }
        
        // Check against excluded paths
        boolean shouldExclude = EXCLUDE_PATHS.stream()
                .anyMatch(path -> requestURI.startsWith(path) || requestURI.equals(path));
        
        logger.info("Should exclude from filtering: {}", shouldExclude);
        return shouldExclude;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        // Skip JWT processing for preflight requests and options requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            logger.debug("Processing OPTIONS request");
            response.setStatus(HttpServletResponse.SC_OK);
            response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"));
            response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
            response.setHeader("Access-Control-Allow-Headers", "authorization, content-type, x-requested-with, x-xsrf-token, Cache-Control, Pragma, Origin, Authorization, X-Requested-With, Content-Type, Accept");
            response.setHeader("Access-Control-Allow-Credentials", "true");
            response.setHeader("Access-Control-Max-Age", "3600");
            response.setHeader("Access-Control-Expose-Headers", "*");
            return;
        }

        // Extract JWT token
        final String authHeader = request.getHeader("Authorization");
        final String requestURI = request.getRequestURI();
        
        logger.info("Processing request in JWT filter: {}", requestURI);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            logger.info("No valid Authorization header, skipping JWT authentication for: {}", requestURI);
            // No token provided, continue without authentication
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token (remove "Bearer " prefix)
        final String jwt = authHeader.substring(7);
        logger.info("JWT token found for request: {}", requestURI);

        try {
            // Validate JWT and extract email - use extractUsername which is the likely correct method name
            String userEmail = jwtService.extractUsername(jwt);
            logger.info("Extracted email from token: {}", userEmail);

            // If we have valid token & no authentication is set, set up authentication
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
                logger.info("Loaded user details for: {}", userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    logger.info("Token is valid for user: {}", userEmail);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.info("Authentication set in SecurityContext for user: {}", userEmail);
                } else {
                    logger.warn("Token validation failed for user: {}", userEmail);
                }
            }
        } catch (Exception e) {
            logger.error("JWT token validation error: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
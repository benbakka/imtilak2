package com.constructmanager.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableCaching
public class CacheConfig {
    
    /**
     * Simple in-memory cache manager to replace Redis
     * This resolves the connection refused error by not requiring Redis
     */
    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        
        // Define all the caches used in the application
        List<ConcurrentMapCache> caches = Arrays.asList(
            // Project related caches
            new ConcurrentMapCache("projectSummaries"),
            new ConcurrentMapCache("projectSummariesByStatus"),
            new ConcurrentMapCache("projectDetails"),
            
            // Unit related caches
            new ConcurrentMapCache("unitSummaries"),
            
            // Category related caches
            new ConcurrentMapCache("categoryDetails"),
            
            // Team related caches
            new ConcurrentMapCache("teams"),
            
            // Dashboard related caches
            new ConcurrentMapCache("activeProjectsCount"),
            new ConcurrentMapCache("dashboardStats")
        );
        
        cacheManager.setCaches(caches);
        return cacheManager;
    }
}
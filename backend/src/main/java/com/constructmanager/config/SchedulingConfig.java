package com.constructmanager.config;

import com.constructmanager.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SchedulingConfig {
    
    @Autowired
    private PaymentService paymentService;
    
    /**
     * Update payment statuses daily at midnight
     * This will mark payments as overdue if their due date has passed
     */
    @Scheduled(cron = "0 0 0 * * ?") // Run at midnight every day
    public void updatePaymentStatuses() {
        paymentService.updatePaymentStatuses();
    }
}
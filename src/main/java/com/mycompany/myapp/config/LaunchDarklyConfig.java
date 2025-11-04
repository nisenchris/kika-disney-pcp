package com.mycompany.myapp.config;

import com.launchdarkly.sdk.server.LDClient;
import com.launchdarkly.sdk.server.LDConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LaunchDarklyConfig {

    private static final Logger log = LoggerFactory.getLogger(LaunchDarklyConfig.class);

    @Value("${launchdarkly.sdk-key:}")
    private String sdkKey;

    @Bean
    public LDClient ldClient() {
        if (sdkKey == null || sdkKey.isEmpty()) {
            log.warn("LaunchDarkly SDK key not configured. Feature flags will use default values.");
            log.warn("Please set 'launchdarkly.sdk-key' in application-dev.yml");
            return null;
        }

        try {
            LDConfig config = new LDConfig.Builder().build();

            LDClient client = new LDClient(sdkKey, config);
            
            if (client.isInitialized()) {
                log.info("LaunchDarkly client initialized successfully");
            } else {
                log.warn("LaunchDarkly client initialization pending");
            }
            
            return client;
        } catch (Exception e) {
            log.error("Failed to initialize LaunchDarkly client", e);
            return null;
        }
    }
}


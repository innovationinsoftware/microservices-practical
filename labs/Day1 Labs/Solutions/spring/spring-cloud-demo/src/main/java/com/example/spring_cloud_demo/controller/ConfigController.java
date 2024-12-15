package com.example.spring_cloud_demo.controller;

import org.springframework.beans.factory.annotation.Value;  
import org.springframework.web.bind.annotation.GetMapping;  
import org.springframework.web.bind.annotation.RestController;  

@RestController  
public class ConfigController {  

    @Value("${spring.datasource.url}")  
    private String datasourceUrl;  

    @GetMapping("/config")  
    public String getConfig() {  
        return "Datasource URL: " + datasourceUrl;  
    }  
} 
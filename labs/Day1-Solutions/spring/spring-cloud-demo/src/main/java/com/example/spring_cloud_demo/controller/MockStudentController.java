package com.example.spring_cloud_demo.controller;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.circuitbreaker.ReactiveCircuitBreakerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import com.example.spring_cloud_demo.service.MockStudentService;

@RestController
public class MockStudentController {

    Logger LOG = LoggerFactory.getLogger(MockStudentController.class);

    private ReactiveCircuitBreakerFactory circuitBreakerFactory;
    private MockStudentService mockStudentService;

    public MockStudentController(ReactiveCircuitBreakerFactory circuitBreakerFactory, MockStudentService mockStudentService) {
        this.circuitBreakerFactory = circuitBreakerFactory;
        this.mockStudentService = mockStudentService;
    }

    @GetMapping("/students")
    public Flux<Map<String, String>> getAllStudents() {
        return mockStudentService.getAllStudents();
    }

    @GetMapping("/students/{id}")
    public Mono<Map<String, String>> getStudentById(@PathVariable String id) {
        return circuitBreakerFactory.create("getStudentById").run(mockStudentService.getStudentById(id), t -> {
            LOG.warn("getStudentById call failed error", t);
            Map<String, String> fallback = new HashMap<>();
            fallback.put("id", id);
            fallback.put("name", "Unknown");
            fallback.put("course", "Unknown");
            return Mono.just(fallback);
        });
    }

    @GetMapping("/students/delay/{seconds}")
    public Flux<Map<String, String>> getAllStudentsWithDelay(@PathVariable int seconds) {
        return circuitBreakerFactory.create("getAllStudentsWithDelay").run(mockStudentService.getAllStudentsWithDelay(seconds), t -> {
            LOG.warn("getAllStudentsWithDelay call failed error", t);
            return Flux.just(new HashMap<String, String>() {{
                put("error", "Service unavailable");
            }});
        });
    }
}
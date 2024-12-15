package com.example.spring_cloud_demo.service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.function.Supplier;
import org.springframework.stereotype.Service;

@Service
public class MockStudentService {

    private List<Map<String, String>> students = Arrays.asList(
        Map.of("id", "1", "name", "John Doe", "course", "Computer Science"),
        Map.of("id", "2", "name", "Jane Smith", "course", "Mathematics"),
        Map.of("id", "3", "name", "Sam Brown", "course", "Physics")
    );

    public Flux<Map<String, String>> getAllStudents() {
        return Flux.fromIterable(students);
    }

    public Mono<Map<String, String>> getStudentById(String id) {
        return Mono.justOrEmpty(students.stream()
            .filter(student -> student.get("id").equals(id))
            .findFirst());
    }

    public Mono<Map<String, String>> getStudentByIdWithDelay(String id, int seconds) {
        return getStudentById(id).delayElement(Duration.ofSeconds(seconds));
    }

    public Supplier<Mono<Map<String, String>>> getStudentByIdSupplier(String id, int seconds) {
        return () -> this.getStudentByIdWithDelay(id, seconds);
    }

    public Flux<Map<String, String>> getAllStudentsWithDelay(int seconds) {
        return Flux.fromIterable(students).delayElements(Duration.ofSeconds(seconds));
    }
}
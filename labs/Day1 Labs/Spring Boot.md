\*### Exercise: Setting Up and Using Spring Cloud Tools in a Spring Boot Project

#### Prerequisites:

- Basic knowledge of Java and Spring Boot.
- Java Development Kit (JDK) installed (version 8 or higher).
- Integrated Development Environment (IDE) such as IntelliJ IDEA, Eclipse, or VS Code.
- Git installed for version control.  


#### Step 1: Set Up the Development Environment

1. **Install Java Development Kit (JDK):**
   - Download and install JDK from [Oracle's official website](https://www.oracle.com/java/technologies/javase-downloads.html) or [OpenJDK](https://openjdk.java.net/install/).
   - Verify the installation by running `java -version` in the terminal.
2. **Install an Integrated Development Environment (IDE):**
   - Download and install IntelliJ IDEA from [JetBrains](https://www.jetbrains.com/idea/download/), Eclipse from [Eclipse Foundation](https://www.eclipse.org/downloads/), or VS Code from [Microsoft](https://code.visualstudio.com/).
3. **Install Git:**
   - Download and install Git from [git-scm.com](https://git-scm.com/).
   - Verify the installation by running `git --version` in the terminal.

#### Step 2: Create a New Spring Boot Project

1. **Generate a Spring Boot Project:**
   - Go to [Spring Initializr](https://start.spring.io/). In VS Code you can add the Spring Initializr Java Support extensions and Press `Ctrl + Shift + P` to open command palette. Type `Spring Initializr` to start generating a Maven or Gradle project.
   - Select the following options:
     - **Project:** Maven Project
     - **Language:** Java
     - **Spring Boot:** 2.5.x or higher
     - **Project Metadata:**
       - **Group:** com.example
       - **Artifact:** spring-cloud-demo
       - **Name:** Spring Cloud Demo
       - **Package Name:** com.example.springclouddemo
       - **Packaging:** Jar
       - **Java:** 23 or higher
     - **Dependencies:**
       - Spring Web
       - Spring Boot Actuator
       - Spring Cloud Config Client
       - Spring Cloud Starter Netflix Eureka Client
       - Resilience4J
       - Spring Cloud Starter OpenFeign
       - Spring Cloud Starter Gateway
       - Spring Cloud Sleuth
       - Micrometer Prometheus
2. **Download the Project:**
   - Click on "Generate" to download the project as a ZIP file.
   - Extract the ZIP file to a directory of your choice.
3. **Open the Project in Your IDE:**
   - Open your IDE and select "Open" or "Import" to open the extracted project directory.

#### Step 3: Set Up Spring Cloud Config Server

1. **Create a New Spring Boot Project for Config Server:**
   - Repeat the steps above to generate a new Spring Boot project for the Config Server.
   - Enter `spring-config-server` for the Artifact Id
   - Add the following dependencies:
     - Spring Web
     - Spring Cloud Config Server
2. **Configure the Config Server:**
   - Open `src/main/resources/application.yml` and add the following configuration:
     ```yaml
     server:
       port: 8888
     spring:
       cloud:
         config:
           server:
             git:
               uri: https://github.com/your-repo/config-repo
               clone-on-start: true
     ```
3. **Enable Config Server:**

   - Open `src/main/java/com/example/configserver/ConfigServerApplication.java` and add the `@EnableConfigServer` annotation:

     ```java
     package com.example.configserver;

     import org.springframework.boot.SpringApplication;
     import org.springframework.boot.autoconfigure.SpringBootApplication;
     import org.springframework.cloud.config.server.EnableConfigServer;

     @SpringBootApplication
     @EnableConfigServer
     public class ConfigServerApplication {
         public static void main(String[] args) {
             SpringApplication.run(ConfigServerApplication.class, args);
         }
     }
     ```

4. **Create Configuration Repository:**

   - Create a new Git repository (e.g., `config-repo`) and add configuration files for different environments.
   - Example `https://github.com/your-repo/config-repo/application.yml`:

     ```yaml
     server:
       port: 8080

     spring:
       application:
         name: config-server
       cloud:
         config:
           server:
             git:
               uri: https://github.com/drimkoe/config-repo
               clone-on-start: true
     ```

   - https://github.com/your-repo/config-repo/application-dev.yml:

   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/devdb
       username: devuser
       password: devpass
   ```

   - https://github.com/your-repo/config-repo/application-prod.yml:

   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/proddb
       username: produser
       password: prodpass
   ```

#### Step 4: Configure Spring Cloud Config Client

1. **Add Config Client Dependency:**
   - Open `pom.xml` in the Spring Cloud Demo project and add the following dependency if it's not already added:
     ```xml
     <dependency>
         <groupId>org.springframework.cloud</groupId>
         <artifactId>spring-cloud-starter-config</artifactId>
     </dependency>
     ```
2. **Configure the Client Application:**
   - Open `src/main/resources/application.properties` and add the following configuration:
     ```yaml
     spring.application.name=spring-cloud-demo
     spring.config.import=configserver:http://localhost:8888
     ```
3. **Create a REST Controller to Fetch Configuration:**

   - Open `src/main/java/com/example/spring_cloud_demo/controller/ConfigController.java` and add the following code:

     ```java
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
     ```

#### Step 5: Set Up Spring Cloud Circuit Breaker

1. **Add Circuit Breaker Dependency:**
   - Open `spring-cloud-demo/pom.xml` and add the following dependency:
     ```xml
     	<dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-circuitbreaker-reactor-resilience4j</artifactId>
      </dependency>
     	<dependency>
     	<groupId>org.springframework.boot</groupId>
     	<artifactId>spring-boot-starter-webflux</artifactId>
     </dependency>
     ```
2. **Enable Circuit Breaker:**

   - Open `src/main/java/com/example/springclouddemo/SpringCloudDemoApplication.java` and define a `Customizer<ReactiveResilience4JCircuitBreakerFactory>` bean to customize the default configuration of the circuit breakers

     ```java
      package com.example.spring_cloud_demo;

      import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
      import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
      import io.github.resilience4j.timelimiter.TimeLimiterConfig;

      import java.time.Duration;
      import org.springframework.boot.SpringApplication;
      import org.springframework.boot.autoconfigure.SpringBootApplication;
      import org.springframework.cloud.circuitbreaker.resilience4j.ReactiveResilience4JCircuitBreakerFactory;
      import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JConfigBuilder;
      import org.springframework.cloud.client.circuitbreaker.Customizer;
      import org.springframework.context.annotation.Bean;
      import org.springframework.web.reactive.function.client.WebClient;

      @SpringBootApplication
      public class SpringCloudDemoApplication {

          public static void main(String[] args) {
              SpringApplication.run(SpringCloudDemoApplication.class, args);
          }

          @Bean
          public WebClient.Builder webClientBuilder() {
              return WebClient.builder();
          }

          @Bean
          public Customizer<ReactiveResilience4JCircuitBreakerFactory> defaultCustomizer() {
              return factory -> {
                  factory.configureDefault(id -> new Resilience4JConfigBuilder(id)
                          .circuitBreakerConfig(CircuitBreakerConfig.ofDefaults())
                          .timeLimiterConfig(TimeLimiterConfig.custom().timeoutDuration(Duration.ofSeconds(3)).build())
                          .circuitBreakerConfig(CircuitBreakerConfig.custom()
                                  .failureRateThreshold(10)
                                  .slowCallRateThreshold(5)
                                  .slowCallDurationThreshold(Duration.ofSeconds(2))
                                  .build())
                          .build());
              };
          }
      }
     ```

3. **Create a Service with Circuit Breaker:**

   - Open `src/main/java/com/example/springclouddemo/service/MockStudentService.java` and add the following code:

     ```java
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
     ```

4. **Create a REST Controller to Use the Service:**

   - Open `src/main/java/com/example/springclouddemo/controller/MockStudentController.java` and add the following code:

     ```java
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
     ```

#### Step 6: Set Up Spring Cloud Gateway

Create a new Spring Boot project for your gateway with artifactId: *spring-cloud-gateway*. You can use [Spring Initializr](https://start.spring.io/) or your IDE to generate the project.

#### **Add Dependencies**

Include the following dependencies in your 

pom.xml:

```xml
<dependencies>
    <!-- Spring Cloud Gateway -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>

    <!-- Spring Boot WebFlux for Reactive Support -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webflux</artifactId>
    </dependency>

    <!-- Spring Cloud Config Client (if needed) -->
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-config</artifactId>
    </dependency>

    <!-- Optional: Eureka Client (if using service discovery) -->
    <!--
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    -->

    <!-- Spring Boot Starter Test -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

Make sure to manage Spring Cloud dependencies by adding the Spring Cloud BOM:

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-dependencies</artifactId>
            <version>${spring-cloud.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<properties>
    <spring-cloud.version>Hoxton.SR12</spring-cloud.version>
    <!-- Use the Spring Cloud version compatible with your Spring Boot version -->
</properties>
```

---

### **Step 2: Configure the Gateway Application**

#### **`application.properties` or `application.yml`**

Set the server port and configure the routes to the `students_service` in the `spring-cloud-demo` client

**Using `application.yml`:**

```yaml


server:
  port: 8081

spring:
  application:
    name: gateway-service
  cloud:
    gateway:
      routes:
        - id: student_service
          uri: http://localhost:8080
          predicates:
            - Path=/students/**
```

This configuration sets up the gateway on port `8081` and routes any requests matching `/students/**` to your existing application on `http://localhost:8090`.

---

### **Step 3: Create the Gateway Application Class**

```java


package com.example.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
```

---

### **Additional Configuration (Optional)**

#### **Handling Circuit Breakers in the Gateway**

If you want to apply circuit breakers at the gateway level, you can configure them using Resilience4J.

**Add Dependency:**

```xml


<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-reactor-resilience4j</artifactId>
</dependency>
```

**Update `application.yml`:**

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: student_service
          uri: http://localhost:8080
          predicates:
            - Path=/students/**
          filters:
            - name: CircuitBreaker
              args:
                name: studentServiceCircuitBreaker
                fallbackUri: forward:/fallback
```

**Create a Fallback Controller:**

```java


package com.example.gateway;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class FallbackController {

    @GetMapping("/fallback")
    public Mono<String> fallback() {
        return Mono.just("Service is temporarily unavailable. Please try again later.");
    }
}
```

---

### **Notes**

- **Separate Applications:** By having the gateway as a separate application, you isolate the routing and filtering concerns, which is advantageous for scalability and maintainability in a microservices architecture.

- **Ports:** Ensure that each application runs on a different port to avoid conflicts.

- **Dependencies:** Since the gateway uses the reactive stack, make sure you do not include `spring-boot-starter-web` in the gateway's 

- **WebFlux vs. MVC:** The gateway requires WebFlux (reactive). Ensure your gateway application is set up accordingly.

---

#### Step 9: Run and Test the Applications

1. **Start the Config Server:**
   - Navigate to the Config Server project directory in the terminal.
   - Run the application using the command: `mvn spring-boot:run`.
2. **Start the Spring Cloud Demo Application:**
   - Navigate to the Spring Cloud Demo project directory in the terminal.
   - Run the application using the command: `mvn spring-boot:run`.
3. **Test the Configuration Endpoint:**
   - Open a web browser and navigate to `http://localhost:8080/config`.
   - Verify that the configuration properties are fetched from the Config Server.
4. **Test the Circuit Breaker:**
   - Open a web browser and navigate to `http://localhost:8080/students`.
   - Open a web browser and navigate to `http://localhost:8080/students/delay/5`
   - Verify that the fallback response is returned when the service is unavailable.
5. **Test the Gateway:**
   - Navigate to the Spring Cloud Gateway project directory in the terminal.
   - Run the application using the command: `mvn spring-boot:run`.

Now, you can access your existing application's endpoints through the gateway:

- **Get All Students**
  - **URL:** `http://localhost:8081/students`
  - **Method:** GET

- **Get Student by ID**
  - **URL:** `http://localhost:8081/students/{id}`
  - **Method:** GET
  - **Example:** `http://localhost:8081/students/1`

- **Get All Students with Delay**
  - **URL:** `http://localhost:8081/students/delay/{seconds}`
  - **Method:** GET
  - **Example:** `http://localhost:8081/students/delay/5`

---


# ConstructManager Backend

High-performance Spring Boot backend for construction project management with MySQL database.

## 🚀 Features

### ✅ Performance Optimizations
- **DTO Pattern**: All API responses use DTOs instead of exposing entities directly
- **Lazy Loading**: All relationships use `FetchType.LAZY` to avoid N+1 queries
- **Pagination**: All large collections return `Page<T>` instead of `List<T>`
- **JPQL Projections**: Custom queries return only required fields
- **Database Indexing**: Strategic indexes on frequently queried columns
- **Connection Pooling**: HikariCP with optimized settings
- **Caching**: Redis-based caching with different TTLs per data type

### 🏗️ Architecture
- **Layered Architecture**: Controller → Service → Repository → Entity
- **Security**: Company-based data isolation and role-based access
- **Validation**: Bean validation with custom constraints
- **Error Handling**: Comprehensive exception handling
- **Transaction Management**: Proper transaction boundaries

### 📊 Data Model
```
Companies → Users
         → Projects → Units → Categories → CategoryTeams → Tasks
         → Teams ────────────────────────┘
```

## 🛠️ Technology Stack

- **Framework**: Spring Boot 3.2.0
- **Database**: MySQL 8.0
- **Connection Pool**: HikariCP
- **Caching**: Redis
- **Security**: Spring Security + JWT
- **Validation**: Bean Validation
- **Mapping**: MapStruct
- **Build Tool**: Maven

## 📦 Installation

### Prerequisites
- Java 17+
- MySQL 8.0+
- Redis (optional, for caching)
- Maven 3.6+

### Database Setup
```sql
CREATE DATABASE construct_manager;
CREATE USER 'construct_user'@'localhost' IDENTIFIED BY 'construct_password';
GRANT ALL PRIVILEGES ON construct_manager.* TO 'construct_user'@'localhost';
FLUSH PRIVILEGES;
```

### Environment Variables
```bash
export DB_USERNAME=construct_user
export DB_PASSWORD=construct_password
export JWT_SECRET=your-secret-key
export REDIS_HOST=localhost
export REDIS_PORT=6379
```

### Run Application
```bash
mvn clean install
mvn spring-boot:run
```

## 🔧 Configuration

### Database Performance Settings
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 20000
      max-lifetime: 1200000
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 25
          fetch_size: 50
        order_inserts: true
        order_updates: true
```

### Cache Configuration
```yaml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 600000 # 10 minutes
```

## 📚 API Documentation

### Projects API
```http
GET /api/v1/projects?page=0&size=10&companyId=1
GET /api/v1/projects/{id}?companyId=1
POST /api/v1/projects
PUT /api/v1/projects/{id}
DELETE /api/v1/projects/{id}
```

### Units API
```http
GET /api/v1/projects/{projectId}/units?page=0&size=10
GET /api/v1/units/{id}
POST /api/v1/projects/{projectId}/units
PUT /api/v1/units/{id}
DELETE /api/v1/units/{id}
```

### Categories API
```http
GET /api/v1/units/{unitId}/categories?page=0&size=10
GET /api/v1/categories/{id}
POST /api/v1/units/{unitId}/categories
PUT /api/v1/categories/{id}
DELETE /api/v1/categories/{id}
```

### Teams API
```http
GET /api/v1/teams?page=0&size=10&companyId=1
GET /api/v1/teams/{id}
POST /api/v1/teams
PUT /api/v1/teams/{id}
DELETE /api/v1/teams/{id}
```

## 🎯 Performance Best Practices Implemented

### 1. DTO Usage
```java
// ❌ Don't expose entities directly
@GetMapping("/projects")
public List<Project> getProjects() { ... }

// ✅ Use DTOs for API responses
@GetMapping("/projects")
public Page<ProjectSummaryDTO> getProjects() { ... }
```

### 2. Lazy Loading
```java
// ✅ All relationships use lazy loading
@OneToMany(mappedBy = "project", fetch = FetchType.LAZY)
private List<Unit> units = new ArrayList<>();
```

### 3. Pagination
```java
// ✅ All large collections use pagination
@GetMapping("/projects")
public Page<ProjectSummaryDTO> getProjects(Pageable pageable) {
    return projectService.getProjectSummaries(companyId, pageable);
}
```

### 4. JPQL Projections
```java
// ✅ Return only required fields
@Query("SELECT new com.constructmanager.dto.ProjectSummaryDTO(" +
       "p.id, p.name, p.location, p.startDate, p.endDate, p.status, " +
       "p.progressPercentage, p.budget, COUNT(DISTINCT u.id)) " +
       "FROM Project p LEFT JOIN p.units u " +
       "WHERE p.company.id = :companyId " +
       "GROUP BY p.id")
Page<ProjectSummaryDTO> findProjectSummariesByCompanyId(@Param("companyId") Long companyId, Pageable pageable);
```

### 5. Database Indexing
```sql
-- Strategic indexes for performance
CREATE INDEX idx_project_company ON projects(company_id);
CREATE INDEX idx_project_status ON projects(status);
CREATE INDEX idx_project_dates ON projects(start_date, end_date);
CREATE INDEX idx_unit_project ON units(project_id);
CREATE INDEX idx_category_unit ON categories(unit_id);
```

### 6. Caching Strategy
```java
// ✅ Cache frequently accessed data
@Cacheable(value = "projectSummaries", key = "#companyId + '_' + #pageable.pageNumber")
public Page<ProjectSummaryDTO> getProjectSummaries(Long companyId, Pageable pageable) {
    return projectRepository.findProjectSummariesByCompanyId(companyId, pageable);
}
```

## 🔒 Security Features

- **Company Isolation**: All queries filtered by company ID
- **Role-Based Access**: Different permissions for Admin, Project Manager, Team Leader, Viewer
- **JWT Authentication**: Stateless authentication with JWT tokens
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection Prevention**: Parameterized queries and JPA

## 📈 Monitoring & Metrics

- **Health Checks**: Spring Boot Actuator endpoints
- **Metrics**: Prometheus-compatible metrics
- **Connection Pool Monitoring**: HikariCP metrics
- **Cache Metrics**: Redis cache hit/miss ratios
- **Query Performance**: Hibernate statistics

## 🚀 Deployment

### Docker Support
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

### Production Configuration
```yaml
spring:
  profiles:
    active: production
  datasource:
    hikari:
      maximum-pool-size: 50
      minimum-idle: 10
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate
```

This backend is designed to handle large-scale construction project data efficiently while maintaining excellent performance and scalability! 🏗️⚡
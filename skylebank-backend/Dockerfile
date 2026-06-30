# ==========================================
# Stage 1: Build stage
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
# Download dependencies to cache them locally in docker layer
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# ==========================================
# Stage 2: Runtime stage
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Add non-root system user for security purposes in production
RUN addgroup -S skylebank && adduser -S skylebank -G skylebank
USER skylebank
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-jar", "app.jar"]

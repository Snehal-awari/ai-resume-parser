# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/resume-parser-backend-0.0.1-SNAPSHOT.jar app.jar
RUN mkdir -p admin_data
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]

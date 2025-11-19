# ---- Build stage ----
FROM maven:3.9.0-eclipse-temurin-17 AS build
WORKDIR /workspace

# Copy pom first to cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn -B -DskipTests package

# ---- Run stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy built JAR
COPY --from=build /workspace/target/*.jar app.jar

EXPOSE 8080

# JVM tuning: G1GC + small heap, adjust as needed
ENTRYPOINT ["java","-Xms256m","-Xmx512m","-XX:+UseG1GC","-jar","/app/app.jar"]

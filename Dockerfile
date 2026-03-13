# Build stage
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app
# Copy the maven wrapper and pom file
COPY .mvn/ .mvn
COPY mvnw pom.xml ./
# Ensure the wrapper has execution permissions
RUN chmod +x mvnw
# Download dependencies (this layer is cached)
RUN ./mvnw dependency:go-offline

# Copy the source code and build
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Set some JVM options for efficiency in constrained environments
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# The port is set by Render via the PORT environment variable
# Our application.properties is configured to use server.port=${PORT:8080}
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

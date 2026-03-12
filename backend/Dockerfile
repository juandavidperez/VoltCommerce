FROM maven:3.9.6-eclipse-temurin-17

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src

EXPOSE 8080

ENTRYPOINT ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Dspring.devtools.restart.enabled=true"]

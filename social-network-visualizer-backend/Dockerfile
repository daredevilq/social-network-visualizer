FROM alpine/java:21-jdk

WORKDIR /app

COPY . .

RUN apk add --no-cache bash
RUN chmod +x mvnw

CMD ["./mvnw", "spring-boot:run"]

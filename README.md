# 🧠 Social Network Visualizer

A web application for visualizing user interactions from social media platforms using a graph-based approach. The system consists of a Spring Boot backend, a Next.js frontend, and a Neo4j graph database — all containerized with Docker.

---

## 🛠️ Requirements

- Docker and Docker Compose installed
- Docker Engine running in the background

---

## 🚀 Running the Application

Go to the project root directory:

```bash
cd social-network-visualizer
```

Update `.env` file by proving credentials for your databases:

```bash
# MongoDB
MONGO_HOST=mongodb
MONGO_PORT=27017
MONGO_DATABASE=socialdb
MONGO_USERNAME=root
MONGO_PASSWORD=
MONGO_AUTH_DB=admin

# Neo4j
NEO4J_URI=bolt://neo4j-database:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=
NEO4J_AUTH="neo4j/${NEO4J_PASSWORD}"
```

Then run all containers:

```bash
docker-compose up --build
```


Or, if the images are already built:

```bush
docker-compose up
```

## Accessing the Application
Backend: http://localhost:8080/

Frontend: http://localhost:3000


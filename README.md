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

**Note:** For **Neo4j** a password of **at least 8 characters is required**. For **MongoDB** it's not strictly required, but it’s **recommended** to also use a password that is at least **8 characters long**.

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

<p><strong><span style="color:red">IMPORTANT!</span></strong></p>

If the application was previously started with different database credentials, Docker volumes may still contain old database data (including users and passwords).

In such a case, MongoDB or Neo4j may ignore the updated values from the .env file, which can cause authentication failures in the backend.

To start from a clean state and ensure that the new credentials are properly applied, you need to remove all existing containers and volumes:

```bash
docker compose down -v --remove-orphans
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

**Main application:**
Frontend: http://localhost:3000

Backend: http://localhost:8080/


## 📦 Sample projects (upload)

Example projects files that can be uploaded into the application are located here:

```text
example-data/
```
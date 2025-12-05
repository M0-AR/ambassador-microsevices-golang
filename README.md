# Ambassador Microservices in Golang

## Introduction

This project is a microservices-based application built with Golang that models an ambassador program. It allows administrators to manage products and ambassadors, while ambassadors can generate unique links to share with their audience. The application tracks orders made through these links and provides analytics on their performance.

## For Business People

This platform empowers your business to build and manage a powerful affiliate marketing program. Ambassadors can promote your products through unique, trackable links, and you get real-time insights into their performance. This drives sales, increases brand reach, and allows you to reward your most effective advocates.

## For Technical People

This repository contains a set of microservices written in Golang, designed to be scalable, maintainable, and independently deployable. The architecture leverages Docker for containerization and Kubernetes for orchestration, ensuring a robust and resilient system. Each microservice has its own dedicated database and communicates with others through a shared network, following best practices for distributed systems.

### Architecture

The application is composed of the following microservices:

- **Users:** Handles user registration, authentication, and management.
- **Admin:** Provides an administrative interface for managing products, ambassadors, and orders.
- **Ambassador:** Allows ambassadors to generate unique links, view their stats, and see their rankings.
- **Checkout:** Processes orders made through ambassador links.
- **Email:** Manages the sending of emails for various events.

### Technologies Used

- **Golang:** The primary programming language for all microservices.
- **Fiber:** A high-performance web framework for Golang.
- **Docker & Docker Compose:** For containerizing and running the application locally.
- **Kubernetes:** For orchestrating the deployment of the application in a production environment.
- **MySQL:** The relational database used by each microservice.
- **Redis:** Used for caching and session management.
- **Kafka:** For asynchronous communication between microservices (inferred from `kafka.go` models).

### Getting Started

To run the application locally, you will need to have Docker and Docker Compose installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ambassador-microservices-golang.git
   cd ambassador-microservices-golang
   ```

2. **Start the services:**
   Each microservice has its own `docker-compose.yaml` file. You will need to start each one in a separate terminal window.

   - **Users Service:**
     ```bash
     cd users
     docker-compose up --build
     ```
   - **Admin Service:**
     ```bash
     cd admin
     docker-compose up --build
     ```
   - **Ambassador Service:**
     ```bash
     cd ambassador
     docker-compose up --build
     ```
   - **Checkout Service:**
     ```bash
     cd checkout
     docker-compose up --build
     ```
   - **Email Service:**
     ```bash
     cd email
     docker-compose up --build
     ```

### API Endpoints

The following are the available API endpoints for each microservice:

#### Users Service (`/api`)
- `POST /register`: Register a new user.
- `POST /login`: Log in a user.
- `GET /users`: Get a list of users.
- `GET /users/:id`: Get a specific user.
- `GET /user/:scope`: Get the currently authenticated user.
- `POST /logout`: Log out a user.
- `PUT /users/info`: Update user information.
- `PUT /users/password`: Update user password.

#### Admin Service (`/api/admin`)
- `POST /register`: Register a new admin.
- `POST /login`: Log in an admin.
- `GET /user`: Get the currently authenticated admin.
- `POST /logout`: Log out an admin.
- `PUT /users/info`: Update admin information.
- `PUT /users/password`: Update admin password.
- `GET /ambassadors`: Get a list of ambassadors.
- `GET /products`: Get a list of products.
- `POST /products`: Create a new product.
- `GET /products/:id`: Get a specific product.
- `PUT /products/:id`: Update a product.
- `DELETE /products/:id`: Delete a product.
- `GET /users/:id/links`: Get the links for a specific user.
- `GET /orders`: Get a list of orders.

#### Ambassador Service (`/api/ambassador`)
- `POST /register`: Register a new ambassador.
- `POST /login`: Log in an ambassador.
- `GET /products/frontend`: Get products for the frontend.
- `GET /products/backend`: Get products for the backend.
- `GET /user`: Get the currently authenticated ambassador.
- `POST /logout`: Log out an ambassador.
- `PUT /users/info`: Update ambassador information.
- `PUT /users/password`: Update ambassador password.
- `POST /links`: Create a new link.
- `GET /stats`: Get ambassador stats.
- `GET /rankings`: Get ambassador rankings.

#### Checkout Service (`/api/checkout`)
- `GET /links/:code`: Get a link by its code.
- `POST /orders`: Create a new order.
- `POST /orders/confirm`: Confirm an order.

### Deployment

The application can be deployed to a Kubernetes cluster using the provided YAML files in the `kubernetes` directory. The `ingress.yaml` file configures the routing of traffic to the appropriate microservices. You will need to have a Kubernetes cluster and `kubectl` configured to use it.

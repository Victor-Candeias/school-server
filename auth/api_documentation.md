# API Documentation

## Overview
This document provides an overview of the REST API endpoints for the FastAPI application. 
The API interacts with a MongoDB database and provides CRUD operations.
The API is for users auth and list.

---

## Base URL
- **Local Development**: `http://127.0.0.1:8010`
- **Dockerized Environment**: `http://<docker_host>:8010`

---

## Endpoints

<div style="border: 1px solid red; border-radius: 5px; padding: 10px;">

### 1. **Register User**
- **URL**: `/auth/register`
- **Method**: `POST`
- **Description: Inserts a new user into a specified MongoDB collection.**

#### Request Body:
```json
{
    "name": "name",
    "email": "name@gmail.com",
    "password": "P@ssw0rd",
    "role": "role"
}
```

#### Example curl Command:
```bash
curl -X POST "http://127.0.0.1:8010/auth/register" \
-H "Content-Type: application/json" \
-d "{ \"name\": \"Carla\", \"email\": \"carlahoa@gmail.com\", \"password\": \"P@ssw0rd\", \"role\": \"admin\" }"
```

#### Response:
```json
{
    "message": "User registered successfully",
    "user": "67dd81700834edd2ee144c39"
}
```

</div>

---

<div style="border: 1px solid red; border-radius: 5px; padding: 10px;">

### 2. **Login User**
- **URL: /auth/login**
- **Method: POST**
- **Description: Logon the user in the app and return a token.**

#### Request Body:
```json
{
    "email": "email@gmail.com",
    "password": "P@ssw0rd"
}
```

#### Example curl Command:
```bash
curl -X POST "http://127.0.0.1:8010/auth/login" \
-H "Content-Type: application/json" \
-d "{ \"email\": \"email@gmail.com\", \"password\": \"P@ssw0rd\" }"
```

#### Response Body:
```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGQ3Yzg0MDgzNGVkZDJlZTE0NGMzOCIsInVzZXJuYW1lIjoiY2FybGFob2FAZ21haWwuY29tIn0.RhSa-Y9QyMV5E3rib43KUNh4qi5WFNTHrP_kyuMI7-A"
}
```
</div>

---

<div style="border: 1px solid red; border-radius: 5px; padding: 10px;">

### 3. **List user**
- **URL: /auth/list**
- **Method: GET**
- **Description: Retrieves the users information from a specified MongoDB collection based on a query.**

**List all users**
#### Request Body:
```json
{ }
```
#### Example curl Command:
```bash
curl -X GET "http://127.0.0.1:8010/auth/list" \
-H "Content-Type: application/json" \
-d "{}"
```

#### Response:
```json
{
    "users": [{
            "_id": "67dcaab2260e88dab077acc3",
            "name": "John Doe",
            "email": "johndoe@example.com",
            "password": "$2b$12$I2KPrLCv8qFqCS6ODqh2qeseIz9qpntsupUY2w4SjQNrvGy9VQd..",
            "role": "user"
        }, 
    ]
}
```

**List users by query**
#### Request Body:
```json
{
    "email": "carlahoa@gmail.com"
}
```
#### Example curl Command:
```bash
curl -X GET "http://127.0.0.1:8010/auth/list" \
-H "Content-Type: application/json" \
-d "{ \"email\": \"carlahoa@gmail.com\" }"
```

#### Response:
```json
{
    "users": [{
            "_id": "67dcaab2260e88dab077acc3",
            "name": "John Doe",
            "email": "johndoe@example.com",
            "password": "$2b$12$I2KPrLCv8qFqCS6ODqh2qeseIz9qpntsupUY2w4SjQNrvGy9VQd..",
            "role": "user"
        }, 
    ]
}
```

**List users by id**
#### Request Body:
```json
{
    "id": "67dcb0bf260e88dab077acc6"
}
```
#### Example curl Command:
```bash
curl -X GET "http://127.0.0.1:8010/auth/list" \
-H "Content-Type: application/json" \
-d "{ \"id\": \"67dcb0bf260e88dab077acc6\" }"
```

#### Response:
```json
{
    "users": [{
            "_id": "67dcaab2260e88dab077acc3",
            "name": "John Doe",
            "email": "johndoe@example.com",
            "password": "$2b$12$I2KPrLCv8qFqCS6ODqh2qeseIz9qpntsupUY2w4SjQNrvGy9VQd..",
            "role": "user"
        }, 
    ]
}
```
</div>
---

### 6. **Environment Variables**
The application uses the following environment variables:

## Environment Variables

| Variable Name                  | Description                        | Default Value           |
| ------------------------------ | ---------------------------------- | ----------------------- |
| `BD_BASE_URL`    | MongoDB connection string         | `http://127.0.0.1:8000/db` |
| `HOST`                          | Host for the FastAPI server       | `127.0.0.1`            |
| `PORT`                          | Port for the FastAPI server       | `8010`                 |

### Running the Application
#### Locally
#### 1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

### 2. **Run the server**
```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

#### Using Docker
#### 1. **Build and start the containers:**
```bash
docker-compose up --build
```

#### 2. **Access the API at http://127.0.0.1:8000**

### Debugging Tips
- **Check the logs of the app container:**
```bash
docker logs <container_name>
```

- **Verify that the .env file is correctly loaded and contains the required variables.**

- **License**
**This project is licensed under the MIT License.**
</div>
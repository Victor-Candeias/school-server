# API Documentation

## Overview
This document provides an overview of the REST API endpoints for the FastAPI application. The API interacts with a MongoDB database and provides CRUD operations.

---

## Base URL
- **Local Development**: `http://127.0.0.1:8000`
- **Dockerized Environment**: `http://<docker_host>:8000`

---

## Endpoints

<div style="background: lightgray; border: 1px solid red; border-radius: 5px; padding: 10px;">

### 1. **Insert Document**
- **URL**: `/db/insert`
- **Method**: `POST`
- **Description**: Inserts a document into a specified MongoDB collection.

#### Request Body:
```json
{
  "collection": "test_collection",
  "data": {
    "name": "test_document"
  }
}
```

#### Example curl Command:
```bash
curl -X POST "http://127.0.0.1:8000/db/insert" \
-H "Content-Type: application/json" \
-d "{\"collection\": \"test_collection\", \"data\": {\"name\": \"test_document\"}}"
```

#### Response:
```json
{
  "message": "Document inserted",
  "id": "mocked_id"
}
```

</div>

---

<div style="border: 1px solid red; border-radius: 5px; padding: 10px;">

### 2. **Find Documents**
- **URL: /db/find**
- **Method: POST**
- **Description: Retrieves documents from a specified MongoDB collection based on a query.**

**Find by query**
#### Request Body:
```json
{
  "collection": "test_collection",
  "query": {
    "name": "test_document"
  }
}
```

#### Example curl Command:
```bash
curl -X POST "http://127.0.0.1:8000/db/find" \
-H "Content-Type: application/json" \
-d "{\"collection\": \"test_collection\", \"query\": {\"name\": \"test_document\"}}"
```

#### Response Body:
```json
{
  "collection": "test_collection"
}
```

**Find all**
#### Request Body:
```json
{
  "collection": "test_collection"
}
```

#### Example curl Command:
```bash
curl -X POST "http://127.0.0.1:8000/db/find" \
-H "Content-Type: application/json" \
-d "{\"collection\": \"test_collection\"}"
```

#### Response:
```json
{
  "documents": [
    {
      "_id": "mocked_id",
      "name": "test_document"
    }
  ]
}
```
</div>

---

<div style="border: 1px solid red; border-radius: 5px; padding: 10px;">

### 3. **Find Documents by id**
- **URL: /db/findbyid**
- **Method: POST**
- **Description: Retrieves documents from a specified MongoDB collection based on a query.**

**Find by id**
#### Request Body:
```json
{
  "collection": "test_collection",
  "id": "test_document"
}
```

#### Example curl Command:
**Find by id**
```bash
curl -X POST "http://127.0.0.1:8000/db/find" \
-H "Content-Type: application/json" \
-d "{\"collection\": \"test_collection\", \"query\": {\"name\": \"test_document\", \"id\": \"123133131312\"}}"
```

#### Response:
```json
{
  "documents": [
    {
      "_id": "mocked_id",
      "name": "test_document"
    }
  ]
}
```

</div>

---

<div style="border: 1px solid red; border-radius: 5px; padding: 10px;">

### 4. **Update Document**
- **URL: /db/update**
- **Method: PUT**
- **Description: Updates documents in a specified MongoDB collection based on a query.**

#### Request Body:

**Update by query**
```json
{
  "collection": "test_collection",
  "query": {
    "name": "test_document"
  },
  "data": {
    "name": "updated_document"
  }
}
```

#### Example curl Command:
```bash
curl -X PUT "http://127.0.0.1:8000/db/update" \
-H "Content-Type: application/json" \
-d "{\"collection\": \"test_collection\", \"query\": { \"name\": \"test_document\"}, \"data\": {\"name\": \"updated_document2\"}}"
```

**Update by id**
```json
{
  "collection": "test_collection",
  "id": "242344234234",
  "data": {
    "name": "updated_document"
  }
}
```
#### Example curl Command:
```bash
curl -X PUT "http://127.0.0.1:8000/db/update" \
-H "Content-Type: application/json" \
-d "{\"collection\": \"test_collection\", \"id\": \"67dc2de410c0831da60c10ca\", \"data\": {\"name\": \"updated_document2\"}}"
```

#### Response:
```json
{
  "message": "Document updated",
  "modified_count": 1
}
```

</div>

---

<div style="border: 1px solid red; border-radius: 5px; padding: 10px;">

### 5. **Delete Document**
- **URL: /db/delete**
- **Method: DELETE**
- **Description: Deletes documents from a specified MongoDB collection based on a query.**

#### Request Body:

**Delete by query**
```json
{
  "collection": "test_collection",
  "query": {
    "name": "updated_document"
  }
}
```
#### Example curl Command:
```bash
curl -X DELETE "http://127.0.0.1:8000/db/delete" \
-H "Content-Type: application/json" \
-d "{\"collection\": \"test_collection\", \"query\": {\"name\": \"updated_document2\"}}"
```

**Delete by id**
```json
{
  "collection": "test_collection",
  "id": "1232341423"
}
```
#### Example curl Command:
```bash
curl -X DELETE "http://127.0.0.1:8000/db/delete" \
-H "Content-Type: application/json" \
-d "{\"collection\": \"test_collection\", \"id\": \"67dc316d29a78376709a148d\"}"
```

#### Response:
```json
{
  "message": "Document deleted",
  "deleted_count": 1
}
```
</div>

---

<div style="border: 1px solid red; border-radius: 5px; padding: 10px;">

### 6. **Environment Variables**
The application uses the following environment variables:

## Environment Variables

| Variable Name                  | Description                        | Default Value           |
| ------------------------------ | ---------------------------------- | ----------------------- |
| `MONGO_DB_CONNECTION_STRING`    | MongoDB connection string         | `mongodb://mongo:27017` |
| `DATABASE_NAME`                 | Name of the MongoDB database      | `school`                |
| `HOST`                          | Host for the FastAPI server       | `127.0.0.1`            |
| `PORT`                          | Port for the FastAPI server       | `8000`                 |

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
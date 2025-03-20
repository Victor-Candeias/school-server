# Import necessary modules and libraries
import os
from pymongo import MongoClient
from bson.objectid import ObjectId
from utils.logging import logging
from datetime import datetime, timezone

class Database:
    """
    A singleton class to manage the connection to MongoDB and perform database operations.
    Ensures that only one instance of the database connection is created.
    """
    
    # Static property to hold the single instance of the class
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance._init_db()
            logging.info('Initialize Database')
        return cls._instance

    def _init_db(self):
        """
        Initialize the database connection using the MongoDB URI and database name 
        from environment variables. Log the connection status and select the required collections.
        """
        mongo_uri = os.getenv("MONGO_DB_CONNECTION_STRING")
        mongo_database = os.getenv("DATABASE_NAME")
        
        logging.info(f"_init_db();mongo_uri={mongo_uri}")
        logging.info(f"_init_db();mongo_database={mongo_database}")
        
        self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        self.client.admin.command('ping')
        logging.info("_init_db();MongoDB connected successfully.")
        
        self.db = self.client[mongo_database]

    def insert(self, collection_name: str, data: dict):
        """
        Insert a document into the specified collection.

        Args:
            collection_name (str): The name of the collection.
            data (dict): The document to insert.

        Returns:
            str: The ID of the inserted document.
        """
        try:
            collection = self.db[collection_name]
            result = collection.insert_one(data)
            logging.info(f"insert();Inserted into {collection_name}: {result.inserted_id}")
            return str(result.inserted_id)
        except Exception as e:
            logging.error(f"insert();Error inserting into {collection_name}: {e}")
            raise

    def find(self, collection_name: str, filter: dict = {}):
        """
        Retrieve documents from the specified collection.

        Args:
            collection_name (str): The name of the collection.
            filter (dict): The filter criteria for the query.

        Returns:
            list: A list of matching documents.
        """
        try:
            collection = self.db[collection_name]
            result = list(collection.find(filter))
            logging.info(f"find();Found {len(result)} documents in {collection_name}")
            return [self.serialize_data(doc) for doc in result]
        except Exception as e:
            logging.error(f"find();Error finding documents in {collection_name}: {e}")
            return []

    def update(self, collection_name: str, document_id: str, data: dict):
        """
        Update a document in the specified collection by its ID.

        Args:
            collection_name (str): The name of the collection.
            document_id (str): The ID of the document to update.
            data (dict): The new data to update the document with.

        Returns:
            dict: The updated document.
        """
        try:
            collection = self.db[collection_name]
            result = collection.find_one_and_update(
                {"_id": ObjectId(document_id)}, {"$set": data}, return_document=True
            )
            logging.info(f"update();Updated document in {collection_name}: {result}")
            return self.serialize_data(result) if result else None
        except Exception as e:
            logging.error(f"update();Error updating document in {collection_name}: {e}")
            return None

    def delete(self, collection_name: str, document_id: str):
        """
        Delete a document from the specified collection by its ID.

        Args:
            collection_name (str): The name of the collection.
            document_id (str): The ID of the document to delete.

        Returns:
            int: The number of documents deleted.
        """
        try:
            collection = self.db[collection_name]
            result = collection.delete_one({"_id": ObjectId(document_id)})
            logging.info(f"delete();Deleted {result.deleted_count} document(s) from {collection_name}")
            return result.deleted_count
        except Exception as e:
            logging.error(f"delete();Error deleting document from {collection_name}: {e}")
            return 0

    def serialize_data(self, data):
        """
        Converts MongoDB data into a JSON-serializable format.

        Args:
            data: The data to serialize, which can be of various types (ObjectId, dict, list).

        Returns:
            The JSON-serializable representation of the data.
        """
        if isinstance(data, ObjectId):
            return str(data)
        if isinstance(data, dict):
            return {key: self.serialize_data(value) for key, value in data.items()}
        if isinstance(data, list):
            return [self.serialize_data(item) for item in data]
        return data

    def get_next_id(self, collection_name: str) -> int:
        """
        Generate the next unique ID for a collection.

        Args:
            collection_name (str): The name of the MongoDB collection.

        Returns:
            int: The next unique ID.
        """
        try:
            # Busca o último documento ordenado pelo campo "id" em ordem decrescente
            last_document = database.find(collection_name, {})
            
            if last_document:
                return last_document.sort("id", -1).limit(1)[0]["id"] + 1
            
            return 1  # Retorna 1 se não houver documentos na coleção
        except Exception as e:
            raise Exception(f"Error generating next ID for collection {collection_name}: {e}")
        
# Create a singleton instance of the Database class for use in the application
database = Database()
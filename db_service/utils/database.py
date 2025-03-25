# Import necessary modules and libraries
import os  # For accessing environment variables
from pymongo import MongoClient  # MongoDB client for database operations
from bson.objectid import ObjectId  # For working with MongoDB ObjectId
from utils.logging import logging  # Custom logging utility
from datetime import datetime
from utils.config import MONGO_DATABASE, MONGO_URI

class Database:
    """
    A singleton class to manage the connection to MongoDB and perform database operations.
    Ensures that only one instance of the database connection is created.
    """

    # Static property to hold the single instance of the class
    _instance = None

    def __new__(cls):
        """
        Create a new instance of the Database class if it doesn't already exist.
        This ensures the singleton pattern is followed.
        """
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance._init_db()  # Initialize the database connection
            logging.info('Initialize Database')  # Log the initialization
        return cls._instance

    def _init_db(self):
        """
        Initialize the database connection using the MongoDB URI and database name 
        from environment variables. Log the connection status and select the required collections.
        """
        # Log the connection details (excluding sensitive information)
        logging.info(f"_init_db();mongo_uri={MONGO_URI}")
        logging.info(f"_init_db();mongo_database={MONGO_DATABASE}")

        # Connect to MongoDB and verify the connection
        self.client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        self.client.admin.command('ping')  # Ping the server to ensure it's reachable
        logging.info("_init_db();MongoDB connected successfully.")

        # Select the database
        self.db = self.client[str(MONGO_DATABASE)]

    def insert(self, collection_name: str, data: dict):
        """
        Insert a document into the specified collection.

        Args:
            collection_name (str): The name of the MongoDB collection.
            data (dict): The document to insert.

        Returns:
            str: The ID of the inserted document.

        Raises:
            Exception: If an error occurs during the insertion process.
        """
        try:
            collection = self.db[collection_name]
            result = collection.insert_one(data)  # Insert the document
            logging.info(f"insert();Inserted into {collection_name}: {result.inserted_id}")
            return str(result.inserted_id)  # Return the inserted document's ID
        except Exception as e:
            logging.error(f"insert();Error inserting into {collection_name}: {e}")
            raise

    def find(self, collection_name: str, id: str = '', filter: dict = {}):
        """
        Retrieve documents from the specified collection.

        Args:
            collection_name (str): The name of the MongoDB collection.
            id (str, optional): The ID of the document to retrieve. Defaults to an empty string.
            filter (dict, optional): The filter criteria for the query. Defaults to an empty dictionary.

        Returns:
            list: A list of matching documents.

        Raises:
            Exception: If an error occurs during the retrieval process.
        """
        try:
            collection = self.db[collection_name]
            
            if id:
                filter = {"_id": ObjectId(id)}

            result = list(collection.find(filter))  # Find documents matching the filter

            logging.info(f"find();Found {len(result)} documents in {collection_name}")
            return [self.serialize_data(doc) for doc in result]  # Serialize the results
        except Exception as e:
            logging.error(f"find();Error finding documents in {collection_name}: {e}")
            return []

    def update(self, collection_name: str, id: str, filter: dict, data: dict):
        """
        Update a document in the specified collection.

        Args:
            collection_name (str): The name of the MongoDB collection.
            id (str): The ID of the document to update.
            filter (dict): The filter criteria for selecting documents to update.
            data (dict): The new data to update the document with.

        Returns:
            dict: The updated document, or None if no document was updated.

        Raises:
            Exception: If an error occurs during the update process.
        """
        try:
            collection = self.db[collection_name]

            if not filter:
                result = collection.find_one_and_update(
                    {"_id": ObjectId(id)}, {"$set": data}, return_document=True
                )
            else:
                result = collection.find_one_and_update(
                    filter, {"$set": data}, return_document=True
                )  

            logging.info(f"update();Updated document in {collection_name}: {result}")
            return self.serialize_data(result) if result else None
        except Exception as e:
            logging.error(f"update();Error updating document in {collection_name}: {e}")
            return None

    def delete(self, collection_name: str, document_id: str, filter: dict):
        """
        Delete a document from the specified collection.

        Args:
            collection_name (str): The name of the MongoDB collection.
            document_id (str): The ID of the document to delete.
            filter (dict): The filter criteria for selecting documents to delete.

        Returns:
            int: The number of documents deleted.

        Raises:
            Exception: If an error occurs during the deletion process.
        """
        try:
            collection = self.db[collection_name]
            if not filter:
                result = collection.delete_one({"_id": ObjectId(document_id)})  # Delete the document
            else:
                result = collection.delete_one(filter)  # Delete the document
            
            logging.info(f"delete();Deleted {result.deleted_count} document(s) from {collection_name}")
            return result.deleted_count  # Return the count of deleted documents
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
            return str(data)  # Convert ObjectId to string
        if isinstance(data, dict):
            return {key: self.serialize_data(value) for key, value in data.items()}  # Serialize dict
        if isinstance(data, list):
            return [self.serialize_data(item) for item in data]  # Serialize list
        return data  # Return other types as-is

    def get_next_id(self, collection_name: str) -> int:
        """
        Generate the next unique ID for a collection.

        Args:
            collection_name (str): The name of the MongoDB collection.

        Returns:
            int: The next unique ID.

        Raises:
            Exception: If an error occurs during the ID generation process.
        """
        try:
            # Retrieve the last document sorted by "id" in descending order
            last_document = self.find(collection_name, {}).sort("id", -1).limit(1)
            
            if last_document:
                return last_document[0]["id"] + 1  # Increment the last ID by 1
            
            return 1  # Return 1 if the collection is empty
        except Exception as e:
            raise Exception(f"Error generating next ID for collection {collection_name}: {e}")

    def log_to_mongodb(self, log_collection: str, level: str, message: str, extra: dict = None):
        """
        Log a message to a specified MongoDB collection.

        Args:
            log_collection (str): The name of the MongoDB collection to store logs.
            level (str): The log level (e.g., "INFO", "ERROR", "DEBUG").
            message (str): The log message.
            extra (dict, optional): Additional metadata to include in the log entry.

        Returns:
            str: The ID of the inserted log entry.

        Raises:
            Exception: If an error occurs during the logging process.
        """
        try:
            # Prepare the log entry
            log_entry = {
                "level": level,
                "message": message,
            }

            # Add extra metadata if provided
            if extra:
                log_entry["extra"] = extra

            # Insert the log entry into the specified collection
            collection = self.db[str(log_collection)]

            result = collection.insert_one(log_entry)

            logging.info(f"log_to_mongodb();Logged to {log_collection}: {result.inserted_id}")
            return str(result.inserted_id)  # Return the ID of the inserted log entry
        except Exception as e:
            logging.error(f"log_to_mongodb();Error logging to {log_collection}: {e}")
            raise

# Create a singleton instance of the Database class for use in the application
database = Database()
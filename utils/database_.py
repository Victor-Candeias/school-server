"""
database.py

This module provides a singleton class `Database` to manage the connection to MongoDB
and perform database operations. It ensures that only one instance of the database
connection is created and shared across the application.

Features:
    - MongoDB connection management.
    - CRUD operations for users and data collections.
    - Logging for database operations.
    - Utility methods for serializing MongoDB data.

Dependencies:
    - os: For accessing environment variables.
    - pymongo.MongoClient: For connecting to MongoDB.
    - bson.ObjectId: For working with MongoDB document IDs.
    - dotenv.load_dotenv: For loading environment variables from a `.env` file.
    - utils.logging: For logging operations.
    - utils.utilities: For general utility functions.
"""

# Import necessary modules and libraries
import os
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
from utils.logging import logging
from utils import utilities
from datetime import datetime, timezone

# Load environment variables from the .env file
load_dotenv()

class Database:
    """
    A singleton class to manage the connection to MongoDB and perform database operations.
    Ensures that only one instance of the database connection is created.
    """
    
    # Static property to hold the single instance of the class
    _instance = None

    def __new__(cls):
        """
        Override the default __new__ method to implement the singleton pattern.
        If an instance of the class doesn't exist, create and initialize it.
        """
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance._init_db()  # Initialize the database connection
            
            logging.info('Initialize Database')  # Log that the database has been initialized
        
        return cls._instance

    def _init_db(self):
        """
        Initialize the database connection using the MongoDB URI and database name 
        from environment variables. Log the connection status and select the required collections.
        """
        
        # Load MongoDB connection string and database name from environment variables
        mongo_uri = os.getenv("MONGO_DB_CONNECTION_STRING")
        mongo_database = os.getenv("DATABASE_NAME")
        
        # Log the connection URI and database name for debugging
        logging.info(f"_init_db();mongo_uri={mongo_uri}")
        logging.info(f"_init_db();mongo_database={mongo_database}")
        
        # Establish connection to MongoDB
        self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Ping the database to check if the connection is successful
        self.client.admin.command('ping')
        is_connected = True  # Variable indicating successful connection
        logging.info("_init_db();MongoDB connected successfully.")
        
        # Select the database
        self.db = self.client[mongo_database]
        
        # References to collections within the database
        self.users = self.db["users"]
        self.data = self.db["data"]
        self.dataLevel = self.db["schoolYears"]
        self.classes = self.db["classes"]
        self.logs = self.db["logs"]
        self.logsError = self.db["logsError"]

    def add_log(self, method, log, error=False):
        """
        Insert a new log entry into the 'logs' or 'logsError' collection.

        Args:
            method (str): The name of the method where the log is generated.
            log (str): The log message.
            error (bool): Whether the log is an error log (default: False).

        Returns:
            str: The ID of the inserted log document.
        """
        try:
            logData = {
                "method": method,
                "log": log,
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }

            if error:
                result = self.logsError.insert_one(logData)
            else:
                result = self.logs.insert_one(logData)
            
            return result.inserted_id
        
        except Exception as e:
            logging.error(f"add_log();error={e};method={method};log={log}")

    def add_user(self, user):
        """
        Insert a new user into the 'users' collection.

        Args:
            user (dict): The user data to be added.

        Returns:
            str: The ID of the inserted user document.
        """
        result = self.users.insert_one(user)
    
        # Log the insertion result
        logging.info(f"add_user();inserted_id={result.inserted_id}")
        
        return result.inserted_id

    def get_user(self, filter={}):
        """
        Retrieve users from the 'users' collection that match the provided filter.

        Args:
            filter (dict): The filter criteria to match users (e.g., username).

        Returns:
            list: A list of matching user documents.
        """
        logging.info(f"get_user();filter={filter}")
        
        result = list(self.users.find(filter))
        
        logging.info(f"get_user();result={result}")
        
        # Serialize the user data
        return [self.serialize_data(user) for user in result] if result else []

    def add_data(self, data):
        """
        Insert new data into the 'data' collection.

        Args:
            data (dict): The data to be added.

        Returns:
            str: The ID of the inserted data document.
        """
        logging.info(f"add_data();data={data}")
        
        result = self.data.insert_one(data)
        
        logging.info(f"add_data();inserted_id={result.inserted_id}")
        
        return result.inserted_id

    def get_all_data(self, filter={}):
        """
        Retrieve all data from the 'data' collection or use a filter to match specific records.

        Args:
            filter (dict): The filter criteria to match data records.

        Returns:
            list: A list of matching data documents.
        """
        result = list(self.data.find(filter))
        
        logging.info(f"get_all_data();result={result}")
        
        return [self.serialize_data(item) for item in result] if result else []

    def update_data(self, id, data):
        """
        Update an existing data record in the 'data' collection by its ID.

        Args:
            id (str): The ID of the data record to update.
            data (dict): The new data to update the record with.

        Returns:
            dict: The updated data document.
        """
        result = self.data.find_one_and_update(
            {"_id": ObjectId(id)}, {"$set": data}, return_document=True
        )
        
        logging.info(f"update_data();result={result}")
        
        return self.serialize_data(result) if result else None

    def delete_data(self, id):
        """
        Delete a data record from the 'data' collection by its ID.

        Args:
            id (str): The ID of the data record to delete.

        Returns:
            int: The number of documents deleted.
        """
        result = self.data.delete_one({"_id": ObjectId(id)})
        
        logging.info(f"delete_data();deleted_count={result.deleted_count}")

        return result.deleted_count

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

    def get_level(self):
        """
        Retrieve all school levels from the 'schoolYears' collection.

        Returns:
            list: A list of school level documents.
        """
        result = list(self.dataLevel.find())
        
        logging.info(f"get_level();result={result}")
        
        return [self.serialize_data(item) for item in result] if result else []

    def get_classes(self, filter={}):
        try:
            result = list(self.classes.find(filter))
            
            logging.info(f"get_classes();result={result}")
            
            return [self.serialize_data(item) for item in result] if result else []
    
        except Exception as e:
            logging.error(f"get_classes();error={e};filter={filter}")
            return []
    
# Create a singleton instance of the Database class for use in the application
database = Database()

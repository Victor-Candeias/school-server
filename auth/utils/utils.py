"""
utils.py

This module provides a utility class `Utils` that handles various tasks such as encryption, 
token creation, password validation, and more. It includes methods for secure operations 
like AES encryption/decryption, JWT token management, and password hashing.

Features:
    - AES encryption and decryption in CBC mode.
    - JWT token creation and verification.
    - Password hashing and validation.
    - Logging for debugging and error tracking.

Dependencies:
    - os: For interacting with environment variables.
    - re: For regular expressions, used for password complexity rules.
    - logging: For logging messages and errors.
    - base64: For encoding data.
    - hashlib: For creating cryptographic hash values.
    - bcrypt: For password hashing and validation.
    - cryptography: For AES encryption and decryption.
    - jwt: For creating and verifying JSON Web Tokens (JWTs).
    - dotenv: For loading environment variables from a `.env` file.
    - bson: For handling MongoDB ObjectId.
"""

import os
import re
import logging
import base64
import hashlib
from bcrypt import checkpw, gensalt, hashpw
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import jwt
from dotenv import load_dotenv
# from bson import ObjectId
from utils.logging import logging
from datetime import datetime
# from utils.database import database

# Importing the User model from the models module
from models.user import User

from config import LOGS_COLLECTION, LOGS_ERROR_COLLECTION

# Load environment variables from the .env file
load_dotenv()

class Utils:
    """
    A utility class that handles various tasks such as encryption, token creation, 
    and password validation.
    """

    def __init__(self):
        """
        Initializes the Utils class by loading encryption settings and password complexity rules.
        - ENCRYPTION_KEY: 32-byte encryption key derived from an environment variable.
        - IV_LENGTH: Length of the initialization vector (IV) for AES encryption.
        """
        self.ENCRYPTION_KEY = hashlib.sha256(os.getenv("ENCRYPTION_KEY").encode()).digest()[:32]  # Generate a 32-byte encryption key
        self.IV_LENGTH = 16  # AES uses a 16-byte IV
        logging.info("Utils initialized with encryption settings.")

    def create_token(self, userId: str, username: str):
        """
        Creates a JSON Web Token (JWT) for the given user.
        
        Args:
            user (dict): A dictionary containing user data (e.g., ID and username).
        
        Returns:
            str: The signed JWT token.
        """
        try:
            payload = {
                'id': userId,  # MongoDB user ID
                'username': username  # Username
            }
            secret_key = os.getenv("ENCRYPTION_KEY")  # Retrieve the secret key from environment variables
            token = jwt.encode(payload, secret_key, algorithm="HS256")  # Sign the JWT using HMAC and SHA-256
            logging.info(f"Token created for user: {username}")
            return token
        except Exception as e:
            logging.error(f"create_token();Error creating token: {e}")
            return None

    def verify_token(self, token):
        """
        Verifies the provided JWT token and returns the decoded payload.
        
        Args:
            token (str): The JWT token to verify.
        
        Returns:
            dict: Decoded token payload if valid, None otherwise.
        """
        if not token:
            logging.error("verify_token();Token required")
            return None

        try:
            secret_key = os.getenv("ENCRYPTION_KEY")  # Retrieve the secret key from environment variables
            userToken = jwt.decode(token, secret_key, algorithms=['HS256'])  # Decode and verify the token
            logging.info("Token verified successfully.")
            return userToken
        except jwt.ExpiredSignatureError as e:
            logging.error(f"verify_token();Token has expired: {e}")
            return None
        except jwt.InvalidTokenError as e:
            logging.error(f"verify_token();Invalid token: {e}")
            return None
        
    def encrypt(self, text):
        """
        Encrypts the provided text using AES encryption in CBC mode.
        
        Args:
            text (str): The text to be encrypted.
        
        Returns:
            str: The encrypted text, represented as a hexadecimal string with IV.
        """
        try:
            iv = os.urandom(self.IV_LENGTH)  # Generate a random IV
            cipher = Cipher(algorithms.AES(self.ENCRYPTION_KEY), modes.CBC(iv), backend=default_backend())  # AES-CBC cipher
            encryptor = cipher.encryptor()

            # Pad the text to be a multiple of the block size (16 bytes for AES)
            padding_length = algorithms.AES.block_size - len(text) % algorithms.AES.block_size
            padded_text = text + (chr(padding_length) * padding_length)
            
            # Perform the encryption
            encrypted = encryptor.update(padded_text.encode('utf-8')) + encryptor.finalize()
            
            logging.info("Text encrypted successfully.")
            return iv.hex() + ":" + encrypted.hex()
        except Exception as e:
            logging.error(f"encrypt();Error encrypting text: {e}")
            return None

    def decrypt(self, text):
        """
        Decrypts the provided encrypted text using AES decryption in CBC mode.
        
        Args:
            text (str): The encrypted text, formatted as a hexadecimal string with IV.
        
        Returns:
            str: The decrypted plaintext, or an empty string if decryption fails.
        """
        try:
            if not text:
                logging.warning("decrypt();Empty text provided for decryption.")
                return ""

            # Split the text to extract IV and encrypted text
            text_parts = text.split(":")
            iv = bytes.fromhex(text_parts[0])  # Convert the IV from hex to bytes
            encrypted_text = bytes.fromhex(text_parts[1])  # Convert the encrypted text from hex to bytes
            
            # Set up the AES-CBC cipher for decryption
            cipher = Cipher(algorithms.AES(self.ENCRYPTION_KEY), modes.CBC(iv), backend=default_backend())
            decryptor = cipher.decryptor()
            
            # Perform the decryption
            decrypted = decryptor.update(encrypted_text) + decryptor.finalize()
            
            # Remove padding
            padding_length = decrypted[-1]
            plaintext = decrypted[:-padding_length].decode('utf-8')
            logging.info("decrypt();Text decrypted successfully.")
            return plaintext
        except Exception as e:
            logging.error(f"decrypt();Error decrypting text: {e}")
            return ""

    def hash_password(self, password):
        """
        Hashes the provided password using bcrypt.
        
        Args:
            password (str): The plaintext password to hash.
        
        Returns:
            str: The hashed password.
        """
        try:
            hashed = hashpw(password.encode(), gensalt()).decode()
            logging.info("hash_password();Password hashed successfully.")
            return hashed
        except Exception as e:
            logging.error(f"hash_password();Error hashing password: {e}")
            return None

    def validate_password(self, stored_hash, entered_password):
        """
        Validates the entered password against the stored hashed password.
        
        Args:
            stored_hash (str): The hashed password stored in the database.
            entered_password (str): The plaintext password entered by the user.
        
        Returns:
            bool: True if the passwords match, False otherwise.
        """
        try:
            is_valid = checkpw(entered_password.encode(), stored_hash.encode())
            if is_valid:
                logging.info("validate_password();Password validation successful.")
            else:
                logging.warning("validate_password();Password validation failed.")
            return is_valid
        except Exception as e:
            logging.error(f"validate_password();Error validating password: {e}")
            return False
        
    # def add_log_to_db(self, method, log, error=False):
    #     logData = {
    #                     "method": method,
    #                     "log": log,
    #                     "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    #         }
        
    #     collection = LOGS_COLLECTION if not error else LOGS_ERROR_COLLECTION
    #     result = database.insert(collection, logData)

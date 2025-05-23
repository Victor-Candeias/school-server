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

from enum import Enum
import os
import re
import logging
import base64
import hashlib
from typing import Any, Dict
from bcrypt import checkpw, gensalt, hashpw
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from fastapi import Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from utils.bd_client import BDClient
from utils.logging import logging
from datetime import datetime, timedelta

from utils.config import ENCRYPTION_KEY

class LevelEnum(str, Enum):
    SEVEN = "7"
    EIGHT = "8"
    NINE = "9"
    TEN = "10"
    ELEVEN = "11"
    TWELVE = "12"
    
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
        self.ENCRYPTION_KEY = hashlib.sha256(ENCRYPTION_KEY.encode()).digest()[:32]  # Generate a 32-byte encryption key
        self.IV_LENGTH = 16  # AES uses a 16-byte IV
        logging.info("Utils initialized with encryption settings.")
        
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
        
    async def add_log_to_db(self, api_client: BDClient, source: str, method: str, message: str, error: bool=False):
        logData = {
                    "collection": "logs",
                    "source": "auth_api",
                    "logtype": "db",
                    "level": "ERROR" if error else "INFO",
                    "message": message,
                    "extra": {
                        "module": method,
                        }
                    }
        
        # Check if the user already exists in the database via the REST API
        await api_client.insert(endpoint="log", payload=logData)

    def returnLevels(self):
        """
        Returns a list of fixed level values from the LevelEnum.

        This method retrieves all available values from the LevelEnum and returns them as a list.

        Returns:
            list: A list of string values representing the available levels.

        Example:
            >>> obj = SomeClass()
            >>> obj.returnLevels()
            ['7', '8', '9', '10', '11', '12']
        """
        return [level.value for level in LevelEnum]

    async def add_document(self, api_client: BDClient, request: Request, collection: str, source: str, method: str):
        try:
            payload = await request.json()
            
            query_params = {"collection": collection, "query": payload}
            # await self.add_log_to_db(api_client=api_client, source=source, method=method, message=query_params)
            
            response = await api_client.find(endpoint="find", payload=query_params)
            if response.get("documents"):
                result = f"Document already exists: id={response.get('documents', [{}])[0].get('_id', 'unknown')}"
                return JSONResponse(status_code=400, content={"message": result})
            
            insert_params = {"collection": collection, "data": payload}
            created_item = await api_client.insert(endpoint="insert", payload=insert_params)
            created_id = created_item.get("id", "unknown")
            
            if created_id == "unknown":
                return JSONResponse(status_code=404, content={"message": f"Error creating {method} {payload}"})
            
            return JSONResponse(content={"message": f"{method.capitalize()} added successfully", "id": created_id}, status_code=201)
        
        except Exception as e:
            err_message = f"{method.capitalize()} registration error: {e}"
            await self.add_log_to_db(api_client=api_client, source=source, method=method, message=err_message, error=True)
            return JSONResponse(status_code=500, content={"message": err_message})
        
    async def get_documents(self, api_client: BDClient, endpoint: str, request: Request, collection: str, source: str, method: str):
        try:
            # Tenta obter o payload da requisição, se não for válido ou vazio, usa um dicionário vazio
            try:
                payload = await request.json()
            except Exception:
                payload = {}  

            query_params = {"collection": collection, "query": payload}
            
            # await self.add_log_to_db(api_client=api_client, source=source, method=method, message=query_params)
            response = await api_client.find(endpoint=endpoint, payload=query_params)
            
            if not response.get("documents"):
                return JSONResponse(status_code=400, content=f"Document {method.capitalize()} not found!!!")
            
            # await self.add_log_to_db(api_client=api_client, source=source, method=method, message=f"Found {len(response.get('documents'))} {method}s!!!")
            
            return JSONResponse(content=response.get("documents"), status_code=200)
        
        except Exception as e:
            await self.add_log_to_db(api_client=api_client, source=source, method=method, message=f"Get {method} error: {e}", error=True)
            return JSONResponse(status_code=500, content={"message": f"Get {method} error: {e}"})

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
                'username': username,  # Username,
                "exp": datetime.now(datetime.timezone.utc) + timedelta(minutes=30), # expirationDate
            }

            token = jwt.encode(payload, ENCRYPTION_KEY, algorithm="HS256")  # Sign the JWT using HMAC and SHA-256
            logging.info(f"Token created for user: {username}")
            return token
        except Exception as e:
            logging.error(f"create_token();Error creating token: {e}")
            return None

    def verificar_token_cookie(request: Request) -> Dict[str, Any]:
        token = request.cookies.get("access_token")
        if not token:
            raise HTTPException(status_code=401, detail="Token não encontrado")
        try:
            payload = jwt.decode(token, ENCRYPTION_KEY, algorithms="HS256")
            return payload
        
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expirado")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Token inválido")

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
from pydantic import BaseModel, EmailStr, Field, validator
from typing import ClassVar
import re

class User(BaseModel):
    """
    Pydantic model for user request validation.
    
    Attributes:
        name (str): The username.
        email (EmailStr): The user's email address.
        password (str): The user's password.
        role (str): The user's role in the system.
    """
    name: str = Field(..., min_length=3, max_length=50, description="The name of the user")
    email: EmailStr = Field(..., description="The email address of the user")
    password: str = Field(..., min_length=8, description="The hashed password of the user")
    role: str = Field(..., description="The role of the user (e.g., admin, teacher, student)")

    # Regex pattern to enforce at least one special character
    SPECIAL_CHARACTERS_REGEX: ClassVar[str] = r"[!@#$%^&*(),.?\":{}|<>]"

    @validator("password")
    def validate_password(cls, value):
        """
        Validates that the password contains at least one special character.
        
        Args:
            value (str): The password to validate.
        
        Returns:
            str: The validated password.
        
        Raises:
            ValueError: If the password does not meet the requirements.
        """
        if not re.search(cls.SPECIAL_CHARACTERS_REGEX, value):
            raise ValueError("Password must contain at least one special character.")
        return value

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "johndoe@example.com",
                "password": "P@ssw0rd!",
                "role": "admin"
            }
        }
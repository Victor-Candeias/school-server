from pydantic import BaseModel, EmailStr, Field

class UserLogin(BaseModel):
    """
    Pydantic model for user request validation.
    
    Attributes:
        name (str): The username.
        password (str): The user's password.
    """
    email: EmailStr = Field(..., description="The email address of the user")
    password: str = Field(..., min_length=8, description="The hashed password of the user")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "johndoe@example.com",
                "password": "hashed_password",
            }
        }

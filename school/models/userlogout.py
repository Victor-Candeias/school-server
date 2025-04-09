from pydantic import BaseModel, Field

class UserLogout(BaseModel):
    """
    Pydantic model for user request validation.
    
    Attributes:
        name (str): The username.
        password (str): The user's password.
    """
    userId: str = Field(..., min_length=1, description="The user id")

    class Config:
        json_schema_extra = {
            "example": {
                "userId": "userId",
            }
        }

from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class StudentsClass(BaseModel):
    """
    Pydantic model for validating student class data.
    
    Attributes:
        name (str): The name of the student.
        email (EmailStr): The email address of the student.
        level (int): The school year of the class.
        className (str): The name of the class the student belongs to.
    """
    id_Class: Optional[int] = Field(None, description="The unique identifier for the student class (autonumber)")
    id: Optional[int] = Field(None, description="The unique identifier for the student (autonumber)")
    name: str = Field(..., min_length=3, max_length=50, description="The name of the student")
    email: EmailStr = Field(..., description="The email address of the student")
 
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "johndoe@example.com",
            }
        }

    def dict(self, **kwargs):
        """
        Override the dict method to exclude the 'id' field from the Swagger documentation.
        """
        kwargs["exclude"] = {"id"}
        return super().dict(**kwargs)
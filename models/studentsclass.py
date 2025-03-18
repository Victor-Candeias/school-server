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
    name: str = Field(..., min_length=3, max_length=50, description="The name of the student")
    email: EmailStr = Field(..., description="The email address of the student")
    level: int = Field(..., description="The school year of the class")
    className: str = Field(..., min_length=1, max_length=10, description="The class name")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "johndoe@example.com",
                "level": 7,
                "className": "A"
            }
        }
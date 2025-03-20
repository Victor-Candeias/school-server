from typing import Optional
from pydantic import BaseModel, Field

class Classes(BaseModel):
    """
    Pydantic model for validating student class data.
    
    Attributes:
        level (int): The school year of the class.
        className (str): The name of the class the student belongs to.
    """
    id: Optional[int] = Field(None, description="The unique identifier for the student (autonumber)")
    level: int = Field(..., description="The school year of the class")
    className: str = Field(..., min_length=1, max_length=10, description="The class name")

    class Config:
        json_schema_extra = {
            "example": {
                "level": 7,
                "className": "A"
            }
        }

    def dict(self, **kwargs):
        """
        Override the dict method to exclude the 'id' field from the Swagger documentation.
        """
        # kwargs["exclude"] = {"id"}
        return super().dict(**kwargs)
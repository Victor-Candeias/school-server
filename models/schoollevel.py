from pydantic import BaseModel, Field

class SchoolLevel(BaseModel):
    """
    Pydantic model for user request validation.
    
    Attributes:
        level (str): The school level.
    """
    level: int = Field(..., description="The student's school level")

    class Config:
        json_schema_extra = {
            "example": {
                "level": 7,
            }
        }


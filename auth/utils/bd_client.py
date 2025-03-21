import httpx
from typing import Optional, Dict, Any

class BDClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    async def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Perform a GET request to the API.

        Args:
            endpoint (str): The API endpoint (e.g., "/users").
            params (dict, optional): Query parameters for the request.

        Returns:
            dict: The JSON response from the API.
        """
        async with httpx.AsyncClient() as client:
            try:
                # Construct the full URL for the request
                url = f"{self.base_url}{endpoint}"
                headers = {"Content-Type": "application/json"}  # Custom headers

                # If query parameters are provided, include them in the request
                if (params is None):
                    response = await client.get(url, headers=headers)
                else:
                    response = await client.get(url, headers=headers, json=params)

                # Raise an exception for any HTTP errors
                response.raise_for_status()
                return response.json()
            except Exception as e:
                # Log the error and return an empty response
                print(f"Error in get(): {e}")
                return {}

    async def post(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Perform a POST request to the API.

        Args:
            endpoint (str): The API endpoint (e.g., "/users").
            data (dict): The payload to send in the request.

        Returns:
            dict: The JSON response from the API.
        """
        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}{endpoint}"
            headers = {"Content-Type": "application/json"}  # Custom headers
            response = await client.post(url, headers=headers, json=data)
            response.raise_for_status()
            return response.json()
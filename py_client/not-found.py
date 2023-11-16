import requests
endpoint = "http://localhost:8000/api/products/1225532233214141441414/"
get_response = requests.get(endpoint)
print(get_response.json())
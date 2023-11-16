import requests
headers = {'Authorization': 'Bearer 601fb2cf32844de3ef22c280290dec8298348b2c'}
endpoint = "http://localhost:8000/api/products/"
data = {
    "title" : "This field is done",
    "price" : 32.99
}
get_response = requests.post(endpoint , json=data , headers=headers)
print(get_response.json())
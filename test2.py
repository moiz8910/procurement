import requests

url = "http://localhost:8000/api/copilot/chat"
headers = {"Content-Type": "application/json", "user-id": "1"}
payload = {
    "query": "Give me details of PR_00001",
    "context": {
        "module": "Dashboard",
        "filters": {}
    }
}

try:
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status() # Raise an exception for HTTP errors (4xx or 5xx)
    print("SUCCESS:", response.json())
except requests.exceptions.RequestException as e:
    print("ERROR:", e)
    if e.response is not None:
        print("FAILED:", e.response.text)
except Exception as e:
    print("ERROR:", e)

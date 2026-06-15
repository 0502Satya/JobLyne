import urllib.request
import json
import sys

data = {
    "email": "testcandidate3@example.com",
    "password": "Password123",
    "password_confirm": "Password123",
    "account_type": "CANDIDATE"
}

req = urllib.request.Request("http://127.0.0.1:8000/api/auth/signup/")
req.add_header('Content-Type', 'application/json')
jsondata = json.dumps(data)
jsondataasbytes = jsondata.encode('utf-8')

try:
    response = urllib.request.urlopen(req, jsondataasbytes)
    print("STATUS:", response.getcode())
    print("RESPONSE:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print("BODY:", e.read().decode('utf-8'))
except Exception as e:
    print("ERR:", str(e))

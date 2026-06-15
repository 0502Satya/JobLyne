import urllib.request
import json

data = {
    "email": "company_admin@example.com",
    "password": "Password123",
    "password_confirm": "Password123",
    "company_name": "Test Company Inc",
    "industry": "Technology",
    "website": "http://testcompany.example.com"
}

req = urllib.request.Request("http://127.0.0.1:8000/api/auth/company/signup/")
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

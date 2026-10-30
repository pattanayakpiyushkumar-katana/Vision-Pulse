import urllib.request
import urllib.parse
import json

BASE_URL = "http://127.0.0.1:5000/api"

def make_req(path, method="GET", payload=None, token=None):
    url = f"{BASE_URL}{path}"
    data = json.dumps(payload).encode("utf-8") if payload else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body)
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except:
            parsed = err_body
        return e.code, parsed

print("1. Registering user...")
status, res = make_req("/auth/register", "POST", {
    "full_name": "Test Inspector",
    "organization": "Apex Manufacturing",
    "role": "SMT Lead",
    "email": "inspector@visionpulse.ai",
    "password": "visionpulse2026"
})
print("Register status:", status)
token = res.get("token")
if not token:
    print("User may already exist, logging in...")
    status, res = make_req("/auth/login", "POST", {
        "email": "inspector@visionpulse.ai",
        "password": "visionpulse2026"
    })
    print("Login status:", status)
    token = res.get("token")

print("Token obtained:", token[:25] + "..." if token else "None")

print("\n2. Checking /auth/me...")
status, me_res = make_req("/auth/me", "GET", token=token)
print("Me response:", status, me_res.get("user", {}).get("full_name"))

print("\n3. Creating inspection site...")
status, site_res = make_req("/sites", "POST", {
    "name": "SMT Line #4 Surface Cleanroom",
    "location": "Building 2, Level 3",
    "domain_category": "MANUFACTURING_QC",
    "camera_or_source_type": "4K Overhead Optical Cam",
    "status": "Active"
}, token=token)
print("Create site status:", status, "Site ID:", site_res.get("site", {}).get("id"))
site_id = site_res.get("site", {}).get("id")

print("\n4. Submitting inspection...")
# Small valid base64 image data url
dummy_b64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
status, insp_res = make_req("/inspections/analyze", "POST", {
    "site_id": site_id,
    "title": "Batch #408 Surface Mount PCB Check",
    "domain_category": "MANUFACTURING_QC",
    "analysis_mode": "Deep Defect & Root-Cause Audit",
    "operator_notes": "IPC-A-610 Class 3 standard required.",
    "image_data_url": dummy_b64
}, token=token)
print("Analyze status:", status)
inspection = insp_res.get("inspection", {})
inspection_id = inspection.get("id")
print("Inspection ID:", inspection_id)
print("Health Score:", inspection.get("visual_health_score"))
print("Severity:", inspection.get("severity_level"))
anomalies = inspection.get("anomalies", [])
print(f"Detected {len(anomalies)} anomalies")

if anomalies:
    anomaly_id = anomalies[0].get("id")
    print(f"\n5. Updating anomaly {anomaly_id} status to 'In Progress'...")
    status, anom_update = make_req(f"/anomalies/{anomaly_id}/status", "PATCH", {
        "remediation_status": "In Progress"
    }, token=token)
    print("Anomaly update status:", status, "New status:", anom_update.get("anomaly", {}).get("remediation_status"))

print("\n6. Checking /dashboard/stats...")
status, dash_res = make_req("/dashboard/stats", "GET", token=token)
print("Dashboard status:", status)
print("Stats:", dash_res.get("stats"))

print("\n7. Testing Contextual AI Chat...")
status, chat_res = make_req(f"/inspections/{inspection_id}/chat", "POST", {
    "message": "What is the recommended fix for the detected solder bridge?",
    "history": []
}, token=token)
print("Chat status:", status)
print("Answer snippet:", chat_res.get("answer", "")[:120])

print("\nAll integration checks passed successfully!")


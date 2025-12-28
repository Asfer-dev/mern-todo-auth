# Kubernetes Deployment Guide

## Overview

This guide covers deploying the MERN Todo application on a Minikube cluster with proper database persistence, auto-scaling, and external access via ngrok tunnels.

## Architecture

### Components

1. **Frontend (Web Server)**: React application served via Nginx
2. **Backend (API Server)**: Node.js Express API
3. **Database**: MongoDB with persistent storage
4. **Auto-scaling**: HPA for frontend and backend
5. **Exposure**: NodePort services + ngrok tunnels

---

## Prerequisites

### 1. AWS EC2 Instance Setup

```bash
# Launch an EC2 instance (recommended: t3.medium or larger)
# Ubuntu 22.04 LTS
# Open required ports: 22 (SSH), 30000-32767 (NodePort range)
```

### 2. Install Required Tools

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Configure ngrok with your authtoken
ngrok config add-authtoken YOUR_NGROK_AUTHTOKEN
```

### 3. Start Minikube

```bash
# Option 1: Recommended (if you have 4+ CPU cores and 4GB+ RAM)
minikube start --cpus=4 --memory=4096 --driver=docker

# Option 2: Minimum (if you have 2 CPU cores and 2GB RAM)
minikube start --cpus=2 --memory=2048 --driver=docker

# Option 3: Let minikube decide (uses available resources)
minikube start --driver=docker

# Enable metrics server (required for HPA)
minikube addons enable metrics-server

# Verify cluster is running
kubectl cluster-info
kubectl get nodes
```

---

## Deployment Steps

### Step 1: Create Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### Step 2: Deploy Database (MongoDB)

The database deployment includes:

- **PersistentVolume (PV)**: Provides 5Gi storage
- **PersistentVolumeClaim (PVC)**: Claims the storage
- **Deployment**: MongoDB container with volume mounted
- **Service**: NodePort service for database access

```bash
# Apply in order:
kubectl apply -f k8s/backend/mongo-pv.yaml
kubectl apply -f k8s/backend/mongo-pvc.yaml
kubectl apply -f k8s/backend/mongo-deployment.yaml
kubectl apply -f k8s/backend/mongo-service.yaml

# Verify MongoDB is running
kubectl get pods -n mern-app -l app=mongo
kubectl get pvc -n mern-app
kubectl get pv
```

**Verify database persistence:**

```bash
# Check if PVC is bound
kubectl get pvc -n mern-app mongo-pvc
# Should show STATUS: Bound

# Check MongoDB pod logs
kubectl logs -n mern-app deployment/mongo
```

### Step 3: Deploy Backend (API Server)

The backend deployment:

- Uses your Docker image with application code
- Connects to MongoDB service
- Exposes NodePort service
- Has HPA for auto-scaling

```bash
# Deploy backend
kubectl apply -f k8s/backend/backend-deployment.yaml
kubectl apply -f k8s/backend/backend-service.yaml
kubectl apply -f k8s/backend/backend-hpa.yaml

# Verify backend is running
kubectl get pods -n mern-app -l app=backend
kubectl get svc -n mern-app backend
kubectl get hpa -n mern-app backend-hpa
```

### Step 4: Deploy Frontend (Web Server)

The frontend deployment:

- Uses your Docker image with bundled React app
- Exposes NodePort service
- Has HPA for auto-scaling based on traffic

```bash
# Deploy frontend
kubectl apply -f k8s/frontend/frontend-deployment.yaml
kubectl apply -f k8s/frontend/frontend-service.yaml
kubectl apply -f k8s/frontend/frontend-hpa.yaml

# Verify frontend is running
kubectl get pods -n mern-app -l app=frontend
kubectl get svc -n mern-app frontend
kubectl get hpa -n mern-app frontend-hpa
```

### Step 5: Verify All Deployments

```bash
# Check all resources
kubectl get all -n mern-app

# Check HPA status (may take a few minutes to show metrics)
kubectl get hpa -n mern-app

# Expected output:
# NAME           REFERENCE             TARGETS         MINPODS   MAXPODS   REPLICAS
# backend-hpa    Deployment/backend    <cpu>/50%       1         5         2
# frontend-hpa   Deployment/frontend   <cpu>/70%       2         10        2
```

---

## External Access via ngrok

### Step 6: Expose Frontend Application

```bash
# Get the NodePort for frontend service
kubectl get svc -n mern-app frontend
# Note the NodePort (e.g., 30001)

# Get minikube IP
minikube ip
# Note the IP (e.g., 192.168.49.2)

# Create ngrok tunnel for frontend
# Open a new terminal session
ngrok http $(minikube ip):30001

# Copy the forwarding URL (e.g., https://abc123.ngrok.io)
# This is your FRONTEND_URL for submission
```

### Step 7: Expose Minikube Dashboard

```bash
# Start minikube dashboard in background
nohup minikube dashboard --url &

# Note the dashboard URL and port (e.g., http://127.0.0.1:45678)
# Extract just the port number

# Create ngrok tunnel for dashboard
# Open another new terminal session
ngrok http 45678

# Copy the forwarding URL (e.g., https://xyz789.ngrok.io)
# This is your DASHBOARD_URL for submission
```

---

## Verification & Testing

### Test 1: Database Persistence

```bash
# Connect to MongoDB pod and create test data
kubectl exec -it -n mern-app deployment/mongo -- mongosh -u admin -p password123 --authenticationDatabase admin

# In mongo shell:
use mern_app
db.testcollection.insertOne({test: "persistence"})
db.testcollection.find()
exit

# Delete the MongoDB pod (will be recreated)
kubectl delete pod -n mern-app -l app=mongo

# Wait for new pod to be ready
kubectl wait --for=condition=ready pod -n mern-app -l app=mongo --timeout=60s

# Verify data persists
kubectl exec -it -n mern-app deployment/mongo -- mongosh -u admin -p password123 --authenticationDatabase admin

# In mongo shell:
use mern_app
db.testcollection.find()
# Should still show the test data
exit
```

### Test 2: Application Functionality

```bash
# Access your frontend via ngrok URL
# Example: https://abc123.ngrok.io

# Test:
1. Register a new user
2. Login
3. Create a todo
4. Refresh page - todo should persist (proves DB persistence)
```

### Test 3: Auto-scaling (HPA)

```bash
# Generate load on frontend (use ApacheBench or similar)
# From your local machine:
ab -n 10000 -c 100 https://YOUR_NGROK_FRONTEND_URL/

# Watch HPA scale up
kubectl get hpa -n mern-app -w

# You should see REPLICAS increase as CPU utilization goes up
```

### Test 4: Dashboard Monitoring

```bash
# Access dashboard via ngrok URL
# Example: https://xyz789.ngrok.io

# Verify you can see:
1. All deployments (mongo, backend, frontend)
2. Services (NodePort type)
3. Pods scaling up/down
4. PVC status (Bound)
5. HPA metrics
```

---

## Architecture Verification Checklist

### ✅ Database Server Requirements

- [x] MongoDB Deployment created
- [x] PersistentVolumeClaim attached (5Gi storage)
- [x] PersistentVolume created with hostPath
- [x] Service type: NodePort (port 30002)
- [x] Data persists across pod restarts

### ✅ Backend Server (API) Requirements

- [x] Deployment with Docker image containing app code
- [x] Service type: NodePort (port 30003)
- [x] Connected to MongoDB service
- [x] HPA configured (1-5 replicas, 50% CPU target)

### ✅ Frontend Server (Web) Requirements

- [x] Deployment with Docker image containing app code
- [x] Service type: NodePort (port 30001)
- [x] HPA configured (2-10 replicas, 70% CPU + 80% memory target)

### ✅ YAML File Requirements

- [x] Well indented YAML files
- [x] Deployment + Service pairs for each server
- [x] HorizontalPodAutoscaler for web server
- [x] Namespace for organization

### ✅ External Access Requirements

- [x] ngrok tunnel for frontend application
- [x] ngrok tunnel for minikube dashboard
- [x] Both URLs accessible externally

---

## File Structure

```
k8s/
├── namespace.yaml                    # Namespace definition
├── backend/
│   ├── mongo-pv.yaml                # PersistentVolume for MongoDB
│   ├── mongo-pvc.yaml               # PersistentVolumeClaim for MongoDB
│   ├── mongo-deployment.yaml        # MongoDB Deployment with volume
│   ├── mongo-service.yaml           # MongoDB NodePort Service
│   ├── backend-deployment.yaml      # Backend API Deployment
│   ├── backend-service.yaml         # Backend NodePort Service
│   └── backend-hpa.yaml            # Backend HorizontalPodAutoscaler
└── frontend/
    ├── frontend-deployment.yaml     # Frontend Deployment
    ├── frontend-service.yaml        # Frontend NodePort Service
    └── frontend-hpa.yaml           # Frontend HorizontalPodAutoscaler
```

---

## Deployment Order

```bash
# 1. Namespace
kubectl apply -f k8s/namespace.yaml

# 2. Database (with persistence)
kubectl apply -f k8s/backend/mongo-pv.yaml
kubectl apply -f k8s/backend/mongo-pvc.yaml
kubectl apply -f k8s/backend/mongo-deployment.yaml
kubectl apply -f k8s/backend/mongo-service.yaml

# 3. Backend API
kubectl apply -f k8s/backend/backend-deployment.yaml
kubectl apply -f k8s/backend/backend-service.yaml
kubectl apply -f k8s/backend/backend-hpa.yaml

# 4. Frontend
kubectl apply -f k8s/frontend/frontend-deployment.yaml
kubectl apply -f k8s/frontend/frontend-service.yaml
kubectl apply -f k8s/frontend/frontend-hpa.yaml
```

---

## Useful Commands

```bash
# View all resources
kubectl get all -n mern-app

# View logs
kubectl logs -n mern-app deployment/frontend
kubectl logs -n mern-app deployment/backend
kubectl logs -n mern-app deployment/mongo

# Describe resources
kubectl describe pod -n mern-app <pod-name>
kubectl describe hpa -n mern-app frontend-hpa

# Scale manually (testing)
kubectl scale deployment frontend -n mern-app --replicas=5

# Delete all resources
kubectl delete namespace mern-app

# Get service URLs (for minikube)
minikube service list -n mern-app

# Access services locally
kubectl port-forward -n mern-app svc/frontend 8080:80
kubectl port-forward -n mern-app svc/backend 5000:5000
kubectl port-forward -n mern-app svc/mongo 27017:27017
```

---

## Troubleshooting

### HPA not showing metrics

```bash
# Check if metrics-server is running
kubectl get deployment metrics-server -n kube-system

# If not, enable it
minikube addons enable metrics-server

# Wait a few minutes for metrics to populate
kubectl top nodes
kubectl top pods -n mern-app
```

### PVC not binding

```bash
# Check PVC status
kubectl describe pvc -n mern-app mongo-pvc

# Check if PV exists and is available
kubectl get pv

# If using hostPath, ensure minikube has access
minikube ssh
sudo mkdir -p /data/mongo
sudo chmod 777 /data/mongo
exit
```

### Pods not starting

```bash
# Check pod events
kubectl describe pod -n mern-app <pod-name>

# Check logs
kubectl logs -n mern-app <pod-name>

# Check if images can be pulled
kubectl get events -n mern-app --sort-by='.lastTimestamp'
```

### ngrok tunnel issues

```bash
# Ensure ngrok authtoken is configured
ngrok config check

# Test local access first
curl http://$(minikube ip):30001

# If local works, create tunnel
ngrok http $(minikube ip):30001
```

---

## Submission Checklist

- [ ] Minikube running on AWS EC2 instance
- [ ] All YAML files properly indented and organized
- [ ] MongoDB with PVC deployed and data persists
- [ ] Backend and Frontend services are NodePort type
- [ ] HPA configured for frontend (web server)
- [ ] Frontend ngrok tunnel URL (active and accessible)
- [ ] Dashboard ngrok tunnel URL (active and accessible)
- [ ] Both URLs tested and working
- [ ] Screenshot of minikube dashboard showing deployments
- [ ] Screenshot showing HPA autoscaling behavior

---

## URLs to Submit

```
Frontend Application URL: https://YOUR_FRONTEND_NGROK_URL.ngrok.io
Minikube Dashboard URL: https://YOUR_DASHBOARD_NGROK_URL.ngrok.io
```

**Note**: Keep ngrok tunnels running during evaluation!

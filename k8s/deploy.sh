#!/bin/bash

# MERN Todo App - Kubernetes Deployment Script
# Run this script on your AWS EC2 instance with Minikube installed

set -e

echo "================================================"
echo "MERN Todo App - Kubernetes Deployment"
echo "================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Verify prerequisites
echo -e "\n${BLUE}Step 1: Verifying prerequisites...${NC}"
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}kubectl is not installed!${NC}"; exit 1; }
command -v minikube >/dev/null 2>&1 || { echo -e "${RED}minikube is not installed!${NC}"; exit 1; }
command -v ngrok >/dev/null 2>&1 || { echo -e "${RED}ngrok is not installed!${NC}"; exit 1; }
echo -e "${GREEN}✓ All prerequisites satisfied${NC}"

# Step 2: Start Minikube (if not already running)
echo -e "\n${BLUE}Step 2: Ensuring Minikube is running...${NC}"
if ! minikube status | grep -q "Running"; then
    echo "Starting Minikube..."
    minikube start --cpus=4 --memory=4096 --driver=docker
else
    echo -e "${GREEN}✓ Minikube is already running${NC}"
fi

# Step 3: Enable metrics-server
echo -e "\n${BLUE}Step 3: Enabling metrics-server for HPA...${NC}"
minikube addons enable metrics-server
echo -e "${GREEN}✓ Metrics server enabled${NC}"

# Step 4: Create namespace
echo -e "\n${BLUE}Step 4: Creating namespace...${NC}"
kubectl apply -f namespace.yaml
echo -e "${GREEN}✓ Namespace created${NC}"

# Step 5: Deploy MongoDB with persistence
echo -e "\n${BLUE}Step 5: Deploying MongoDB with PersistentVolume...${NC}"
kubectl apply -f backend/mongo-pv.yaml
kubectl apply -f backend/mongo-pvc.yaml
kubectl apply -f backend/mongo-deployment.yaml
kubectl apply -f backend/mongo-service.yaml
echo "Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -n mern-app -l app=mongo --timeout=120s
echo -e "${GREEN}✓ MongoDB deployed successfully${NC}"

# Step 6: Deploy Backend API
echo -e "\n${BLUE}Step 6: Deploying Backend API...${NC}"
kubectl apply -f backend/backend-deployment.yaml
kubectl apply -f backend/backend-service.yaml
kubectl apply -f backend/backend-hpa.yaml
echo "Waiting for Backend to be ready..."
kubectl wait --for=condition=ready pod -n mern-app -l app=backend --timeout=120s
echo -e "${GREEN}✓ Backend deployed successfully${NC}"

# Step 7: Deploy Frontend
echo -e "\n${BLUE}Step 7: Deploying Frontend...${NC}"
kubectl apply -f frontend/frontend-deployment.yaml
kubectl apply -f frontend/frontend-service.yaml
kubectl apply -f frontend/frontend-hpa.yaml
echo "Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -n mern-app -l app=frontend --timeout=120s
echo -e "${GREEN}✓ Frontend deployed successfully${NC}"

# Step 8: Show deployment status
echo -e "\n${BLUE}Step 8: Deployment Status${NC}"
echo "==========================================="
kubectl get all -n mern-app
echo ""
kubectl get pvc -n mern-app
echo ""
kubectl get pv

# Step 9: Get service information
echo -e "\n${BLUE}Step 9: Service Information${NC}"
echo "==========================================="
MINIKUBE_IP=$(minikube ip)
FRONTEND_PORT=$(kubectl get svc -n mern-app frontend -o jsonpath='{.spec.ports[0].nodePort}')
BACKEND_PORT=$(kubectl get svc -n mern-app backend -o jsonpath='{.spec.ports[0].nodePort}')
MONGO_PORT=$(kubectl get svc -n mern-app mongo -o jsonpath='{.spec.ports[0].nodePort}')

echo "Minikube IP: ${MINIKUBE_IP}"
echo "Frontend NodePort: ${FRONTEND_PORT}"
echo "Backend NodePort: ${BACKEND_PORT}"
echo "MongoDB NodePort: ${MONGO_PORT}"
echo ""
echo "Local Access URLs:"
echo "  Frontend: http://${MINIKUBE_IP}:${FRONTEND_PORT}"
echo "  Backend:  http://${MINIKUBE_IP}:${BACKEND_PORT}"
echo "  MongoDB:  mongodb://${MINIKUBE_IP}:${MONGO_PORT}"

# Step 10: Instructions for ngrok tunnels
echo -e "\n${BLUE}Step 10: Setting up External Access${NC}"
echo "==========================================="
echo "To expose your application externally, run these commands in SEPARATE terminals:"
echo ""
echo -e "${GREEN}Terminal 1 - Frontend Tunnel:${NC}"
echo "  ngrok http ${MINIKUBE_IP}:${FRONTEND_PORT}"
echo ""
echo -e "${GREEN}Terminal 2 - Dashboard Tunnel:${NC}"
echo "  minikube dashboard --url &"
echo "  # Note the port from the dashboard URL above, then:"
echo "  ngrok http <DASHBOARD_PORT>"
echo ""

# Step 11: Test database persistence
echo -e "\n${BLUE}Step 11: Testing Database Persistence${NC}"
echo "==========================================="
echo "To verify database persistence:"
echo "  kubectl exec -it -n mern-app deployment/mongo -- mongosh -u admin -p password123 --authenticationDatabase admin"
echo ""

# Step 12: Monitor HPA
echo -e "\n${BLUE}Step 12: Monitoring Auto-scaling${NC}"
echo "==========================================="
echo "To watch HPA in action:"
echo "  kubectl get hpa -n mern-app -w"
echo ""

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next Steps:"
echo "1. Set up ngrok tunnels (see Step 10 above)"
echo "2. Access your frontend via ngrok URL"
echo "3. Test the application"
echo "4. Monitor autoscaling: kubectl get hpa -n mern-app"
echo "5. View logs: kubectl logs -n mern-app deployment/<deployment-name>"
echo ""
echo "To clean up:"
echo "  kubectl delete namespace mern-app"
echo "  minikube stop"

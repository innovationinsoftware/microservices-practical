# Lab Exercise: Deploying Multi-tier App to Azure AKS Using Azure Container Registry

## Overview

In this lab exercise, you will:

- Create a copy of a multi-tier application
- Install necessary tools including Azure CLI
- Deploy the application to Azure Kubernetes Service (AKS) using Azure Container Registry (ACR)

## Prerequisites

## This lab should be run on the Linux VM.

Set environment variables to use throughout the lab:

```
export RESOURCE_GROUP="YOUR_INITIALS-rg"
export AKS="YOUR_INITIALS-aks"
export ACR_NAME="YOUR_INITIALSregistry12182024"
export LOCATION="eastus"
```

Note: Replace `YOUR_INITIALS` with your actual initials (in lower case) in the commands above.

## Step 1: Create Project Directory

Create a copy of the multi-tier lab folder:

```
cp -r $HOME/microservices-practical/labs/day2/solutions/lab3 $HOME/guestbook-aks
```

## Step 2: Install Required Tools

### Azure CLI Installation

For Linux:

```
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

Verify installation:

```
az --version
```

## Step 3: Set Up Azure Container Registry (ACR)

1. **Log in to Azure**

```
az login --use-device-code
```

- Open the provided URL in browser
- Enter the device code
- Log in with instructor-provided credentials

2. **Create Resource Group**

```
az group create --name $RESOURCE_GROUP --location $LOCATION
```

3. **Create ACR Instance**

```
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $ACR_NAME \
    --sku Basic \
    --admin-enabled true
```

4. **Log in to ACR**

```
az acr login --name $ACR_NAME
```

5. **Set Additional Environment Variables**

```
export ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
```

## Step 4: Deploy to AKS

### Create and Configure AKS Cluster

1. **Create Cluster**

```
az aks create \
    --resource-group $RESOURCE_GROUP \
    --name $AKS \
    --node-count=1 \
    --enable-addons=monitoring \
    --generate-ssh-key
```

Note: This process takes approximately 20 minutes

2. **Configure kubectl**

```
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS
```

3. **Grant ACR Access**

```
az aks update \
    --name $AKS \
    --resource-group $RESOURCE_GROUP \
    --attach-acr $ACR_NAME
```

### Deploy Application Components

1. **Navigate to Lab Directory**

```
cd $HOME/guestbook-aks
```

### Redis Leader Deployment

1. **Deploy Redis Leader**

```
kubectl apply -f manifests/redis-leader-deployment.yaml
```

2. **Verify Deployment**

```
kubectl get pods
```

3. **Check Logs**

```
kubectl logs <POD_NAME>
```

4. **Create Redis Leader Service**

```
kubectl apply -f manifests/redis-leader-service.yaml
```

5. **Verify Service**

```
kubectl get svc
```

### Redis Follower Deployment

1. **Deploy Redis Followers**

```
kubectl apply -f manifests/redis-follower-deployment.yaml
```

2. **Create Follower Service**

```
kubectl apply -f manifests/redis-follower-service.yaml
```

### Frontend Deployment

1. **Deploy Frontend**

```
kubectl apply --record -f manifests/frontend-deployment.yaml
```

2. **Create Frontend Service**

   Update `frontend-service.yaml` to use a service type `LoadBalancer`

   ```yaml
     # if your cluster supports it, uncomment the following to automatically create
     # an external load-balanced IP for the frontend service.
     type: NodePort // CHANGE THIS TO LoadBalancer
     ports:
   ```

   

```
kubectl apply -f manifests/frontend-service.yaml
```

3. **Access Frontend**

   * **Test the Deployment**

     - Get the external IP of the frontend service:

       ```bash
       kubectl get service frontend
       ```

     - Access the application using the external IP in your web browser.

     - **Tip**: It may take a few minutes for the LoadBalancer to assign an external IP.

## Scaling and Updates

### Scale Frontend

Scale up:

```
kubectl scale deployment frontend --replicas=5
```

Scale down:

```
kubectl scale deployment frontend --replicas=2
```

### Update Frontend Image

1. **Check Current Version**

```
kubectl describe deployment frontend | grep Image
```

2. **Update Deployment File**

- Edit `manifests/frontend-deployment.yaml`
- Update image version from `v4` to `v5`
- Deploy changes:

```
kubectl apply --record -f manifests/frontend-deployment.yaml
```

### Rollback Deployment

1. **View Rollout History**

```
kubectl rollout history deployment frontend
```

2. **View Specific Revision**

```
kubectl rollout history deployment frontend --revision=<NUMBER>
```

3. **Perform Rollback**
   To previous version:

```
kubectl rollout undo deployment frontend
```

To specific version:

```
kubectl rollout undo deployment frontend --to-revision=1
```

## Cleanup

Remove all deployments:

```
kubectl delete --ignore-not-found=true -f manifests/
```

Verify cleanup:

```
kubectl get pods
```

Clean up Azure resources:

```
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

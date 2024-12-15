### Lab Exercise: Deploying the 12-Factor App to Azure AKS Using Azure Container Registry and Converting Backend to Azure Functions

In this lab exercise, you will:

- Create a copy of your 12-Factor App solution from Day 1.
- Install necessary tools such as Azure CLI, Docker, and kubectl.
- Deploy the entire application to Azure Kubernetes Service (AKS) using Azure Container Registry (ACR) for storing your container images.
- Convert the backend service to use Azure Functions and update the frontend and AKS deployment accordingly.

By the end of this exercise, you will gain hands-on experience in deploying containerized applications to Azure AKS, using ACR, and integrating Azure Functions into your application architecture.

---

#### Step 1: Create a Copy of Your 12-Factor App Solution

- **Create a Copy of Your Project**

  - Clone your Day 1 12-Factor App repository or copy your project folder to a `Day3/Solutions/Lab1`. This will be the starting point for this exercise.
---

#### Step 2: Install Required Tools

Before proceeding, ensure that the following tools are installed on your machine. If not, follow the instructions below to install them.

1. **Azure CLI**

   - **Download and Install Azure CLI**

     - **Windows:**
       - Download the installer from [Install Azure CLI on Windows](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-windows?tabs=azure-cli).
       - Run the installer and follow the prompts.

     - **macOS:**
       - Install using Homebrew:

         ```bash
         brew update && brew install azure-cli
         ```

     - **Linux:**
       - Install using the package manager for your distribution. Instructions can be found at [Install Azure CLI on Linux](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-linux).

   - **Verify Installation:**

     ```bash
     az --version
     ```

     - **Tip**: This should display the version of Azure CLI installed.

2. **Docker**

   - **Download and Install Docker**

     - **Windows and macOS:**
       - Install Docker Desktop from [Docker Desktop](https://www.docker.com/products/docker-desktop).
       - Run the installer and follow the prompts.

     - **Linux:**
       - Install Docker Engine following instructions at [Install Docker Engine](https://docs.docker.com/engine/install/).

   - **Verify Installation:**

     ```bash
     docker --version
     ```

     - **Tip**: Ensure Docker Engine is running.

3. **Kubectl**

   - **Install Kubectl**

     - **Windows:**
       - Install via Chocolatey:

         ```bash
         choco install kubernetes-cli
         ```

     - **macOS:**
       - Install via Homebrew:

         ```bash
         brew install kubectl
         ```

     - **Linux:**
       - Install using the native package management or download the binary from [Install and Set Up kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/).

   - **Verify Installation:**

     ```bash
     kubectl version --client
     ```

4. **Azure Functions Core Tools**

   - **Install Azure Functions Core Tools**

     - **Windows and macOS:**

       ```bash
       npm install -g azure-functions-core-tools@3 --unsafe-perm true
       ```

     - **Linux:**
       - See instructions at [Install Azure Functions Core Tools on Linux](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local#v2).

   - **Verify Installation:**

     ```bash
     func --version
     ```

---

#### Step 3: Set Up Azure Container Registry (ACR)

Azure Container Registry (ACR) is a managed, private Docker registry service that stores and manages your container images.

1. **Log In to Azure**
   - Make sure you have an Azure Subscription to proceed with the rest of the exercise
   - Open your terminal and log in to your Azure account:

     ```bash
     az login
     ```

     - This will open a web browser for authentication.
     - **Tip**: If you're working within a remote session, use `az login --use-device-code`.

2. **Create a Resource Group**

   - Create a resource group to organize your Azure resources:

     ```bash
     az group create --name myResourceGroup --location eastus
     ```

     - **Tip**: Replace `myResourceGroup` with your desired resource group name.

3. **Create an Azure Container Registry**

   - Create an ACR instance:

     ```bash
     az acr create --resource-group myResourceGroup --name mycontainerregistry010 --sku Basic --admin-enabled true
     ```

     - **Important**: Replace `mycontainerregistry010` with a globally unique name (lowercase letters and numbers only).
     - The `--admin-enabled true` flag enables the admin user for authentication.

4. **Log In to ACR**

   - Authenticate Docker with your ACR registry:

     ```bash
     az acr login --name mycontainerregistry010
     ```

5. **Set Environment Variables for ACR**

   - Store the registry name and login server in environment variables:
   - 
    Bash
     ```bash
     ACR_NAME=mycontainerregistry010
     ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
     ```

     Powershell
     ```powershell
     $ACR_NAME = "mycontainerregistry010"
     $ACR_LOGIN_SERVER = az acr show --name $ACR_NAME --query loginServer --output tsv
     ```


---

#### Step 4: Deploy the Application to Azure AKS Using ACR

1. **Create an AKS Cluster**

   - Create an Azure Kubernetes Service (AKS) cluster:

     ```bash
     az aks create --resource-group myResourceGroup --name myAKSCluster --node-count 1 --enable-addons monitoring --generate-ssh-keys
     ```

     - **Tip**: The `--enable-addons monitoring` flag enables monitoring via Azure Monitor for containers.

2. **Connect to the AKS Cluster**

   - Set up kubectl to connect to your AKS cluster:

     ```bash
     az aks get-credentials --resource-group myResourceGroup --name myAKSCluster
     ```

3. **Grant AKS Access to ACR**

   - Allow the AKS cluster to pull images from your ACR:

     ```bash
     az aks update -n myAKSCluster -g myResourceGroup --attach-acr $ACR_NAME
     ```

4. **Build and Push Docker Images to ACR**

   - **Build and Push Backend Image**

     ```bash
     cd backend
     docker build -t $ACR_LOGIN_SERVER/backend:latest .
     docker push $ACR_LOGIN_SERVER/backend:latest
     cd ..
     ```

   - **Build and Push Frontend Image**

     ```bash
     cd frontend
     docker build -t $ACR_LOGIN_SERVER/frontend:latest .
     docker push $ACR_LOGIN_SERVER/frontend:latest
     cd ..
     ```

5. **Update Kubernetes Deployment Files**

   - **Create the Backend Deployment**

     ##### /Day3/Solutions/Lab1/12factor/k8s/backend-deployment.yaml

     ```yaml
     # filepath: /Day3/Solutions/Lab1/12factor/k8s/backend-deployment.yaml
     apiVersion: apps/v1
     kind: Deployment
     metadata:
       name: backend-deployment
       labels:
         app: backend
     spec:
       replicas: 1
       selector:
         matchLabels:
           app: backend
       template:
         metadata:
           labels:
             app: backend
         spec:
           containers:
           - name: backend
             image: mycontainerregistry010.azurecr.io/backend:latest
             ports:
             - containerPort: 3001
             env:
             - name: PORT
               value: "3001"
     ---
     apiVersion: v1
     kind: Service
     metadata:
       name: backend-service
     spec:
       selector:
         app: backend
       ports:
       - protocol: TCP
         port: 3001
         targetPort: 3001
       type: ClusterIP
     ```

   - **Create the Frontend Deployment**

     ##### /Day3/Solutions/Lab1/12factor/k8s/frontend-deployment.yaml

     ```yaml
     # filepath: /Day3/Solutions/Lab1/12factor/k8s/frontend-deployment.yaml
     apiVersion: apps/v1
     kind: Deployment
     metadata:
       name: frontend-deployment
       labels:
         app: frontend
     spec:
       replicas: 1
       selector:
         matchLabels:
           app: frontend
       template:
         metadata:
           labels:
             app: frontend
         spec:
           containers:
           - name: frontend
             image: mycontainerregistry010.azurecr.io/frontend:latest
             ports:
             - containerPort: 3000
             env:
             - name: REACT_APP_BACKEND_URL
               value: "http://backend-service:3001/api"
     ---
     apiVersion: v1
     kind: Service
     metadata:
       name: frontend-service
     spec:
       selector:
         app: frontend
       ports:
       - protocol: TCP
         port: 80
         targetPort: 3000
       type: LoadBalancer
     ```

6. **Deploy to AKS**

   - Apply the deployment configurations:

     ```bash
     kubectl apply -f k8s/backend-deployment.yaml
     kubectl apply -f k8s/frontend-deployment.yaml
     ```

7. **Test the Deployment**

   - Get the external IP of the frontend service:

     ```bash
     kubectl get service frontend-service
     ```

   - Access the application using the external IP in your web browser.

   - **Tip**: It may take a few minutes for the LoadBalancer to assign an external IP.

---

#### Step 5: Convert the Backend to Azure Functions

1. **Create a Storage Account**

   - **Important**: Storage accounts are required for Azure Functions.

    BASH
     ```bash
     STORAGE_ACCOUNT_NAME=mystorage$RANDOM
     az storage account create --name $STORAGE_ACCOUNT_NAME --location eastus --resource-group myResourceGroup --sku Standard_LRS
     ```

     POWERSHELL
     ```powershell
     $RANDOM = Get-Random
     $STORAGE_ACCOUNT_NAME = "mystorage$RANDOM"
     az storage account create --name $STORAGE_ACCOUNT_NAME --location eastus --resource-group myResourceGroup --sku Standard_LRS
     ```

2. **Create an Azure Function App**

   ```bash
   FUNCTION_APP_NAME=funcapp$RANDOM
   az functionapp create --resource-group myResourceGroup --consumption-plan-location eastus --runtime node --functions-version 4 --name $FUNCTION_APP_NAME --storage-account $STORAGE_ACCOUNT_NAME
   ```

3. **Modify Backend Code for Azure Functions**

   - **Initialize the Function App**

     ```bash
     cd backend
     func init . --javascript
     ```

   - **Create a New Function**

     ```bash
     func new --name HttpTrigger --template "HTTP trigger" --authlevel "anonymous"
     ```

   - **Update the Function Code**

     ##### /Day3/Solutions/Lab1/12factor/backend/HttpTrigger/index.js

     ```javascript
     // filepath: /Day3/Solutions/Lab1/12factor/backend/HttpTrigger/index.js
     module.exports = async function (context, req) {
       context.res = {
         body: { message: 'Hello from the Azure Function backend!' }
       };
     };
     ```

4. **Deploy the Azure Function**

   - **Publish the Function**

     ```bash
     func azure functionapp publish $FUNCTION_APP_NAME --javascript
     ```

   - **Enable CORS so that the frontend can call the service**
     
     ```bash
     az functionapp cors add --name $FUNCTION_APP_NAME --resource-group myResourceGroup --allowed-origins *
    ```

5. **Update Frontend Environment Variable**

   - **Update `.env` File**

     ##### /Day3/Solutions/Lab1/12factor/frontend/.env

     ```env
     # filepath: /Day3/Solutions/Lab1/12factor/frontend/.env
     REACT_APP_BACKEND_URL=https://<your-function-app-name>.azurewebsites.net/api/HttpTrigger
     ```

     - **Tip**: Replace `<your-function-app-name>` with your actual Function App name.
   - **Update `App.js` File**

      #### /Day3/Solutions/Lab1/12factor/frontend/src/App.js

      ```javascript
          // App.js
      import React, { useEffect, useState } from 'react';
      import { Container, Alert } from 'reactstrap';

      function App() {
        const [message, setMessage] = useState('');

        useEffect(() => {
          fetch(`${process.env.REACT_APP_BACKEND_URL}`)
            .then(res => res.json())
            .then(data => setMessage(data.message));
        }, []);

        return (
          <Container className="mt-5">
            <Alert variant="success">
              <h1>{message}</h1>
            </Alert>
          </Container>
        );
      }

      export default App;
      ```

6. **Rebuild and Push Frontend Image**az functionapp cors add --name myFunctionApp --resource-group myResourceGroup --allowed-origins http://localhost:3000az functionapp cors add --name myFunctionApp --resource-group myResourceGroup --allowed-origins http://localhost:3000

   - **Build and Push Updated Frontend Image**

     ```bash
     cd frontend
     docker build -t $ACR_LOGIN_SERVER/frontend:latest .
     docker push $ACR_LOGIN_SERVER/frontend:latest
     cd ..
     ```

7. **Update Frontend Deployment in AKS**

   - **Update the Frontend Deployment**

     ##### /Day3/Solutions/Lab1/12factor/k8s/frontend-deployment.yaml

     ```yaml
     # filepath: /Day3/Solutions/Lab1/12factor/k8s/frontend-deployment.yaml
     apiVersion: apps/v1
     kind: Deployment
     metadata:
       name: frontend-deployment
       labels:
         app: frontend
     spec:
       replicas: 1
       selector:
         matchLabels:
           app: frontend
       template:
         metadata:
           labels:
             app: frontend
         spec:
           containers:
           - name: frontend
             image: mycontainerregistry010.azurecr.io/frontend:latest
             ports:
             - containerPort: 3000
             env:
             - name: REACT_APP_BACKEND_URL
               value: "https://<your-function-app-name>.azurewebsites.net/api/HttpTrigger"
     ```

   - **Apply the Updated Deployment**

     ```bash
     kubectl apply -f k8s/frontend-deployment.yaml
     ```

8. **Remove Backend Deployment from AKS**

   - **Delete the Backend Deployment**

     ```bash
     kubectl delete -f k8s/backend-deployment.yaml
     ```

9. **Test the Updated Application**

   - **Access the Application**

     - Use the external IP of the `frontend-service` to access the application in your web browser.

   - **Verify Functionality**

     - Ensure that the frontend communicates with the Azure Function backend successfully.

---

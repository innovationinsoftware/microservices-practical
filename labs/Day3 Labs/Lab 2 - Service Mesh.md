### Lab Exercise: Implementing a Service Mesh with Istio on Minikube

In this lab exercise, you will:

- Set up a local Kubernetes cluster using **Minikube**.
- Install **Istio**, a service mesh, on your Minikube cluster.
- Deploy your existing application onto the cluster.
- Modify your application to work with Istio.
- Explore traffic management, observability, and security features provided by Istio.

By the end of this exercise, you will have hands-on experience in deploying a service mesh and integrating it with your applications locally using Minikube.

---

#### Prerequisites

Ensure you have the following installed on your machine:
- A copy of your 12factor app solution from Day1
- **Minikube**
- **kubectl**
- **Docker**
- **Istio CLI (`istioctl`)**

---

#### Step 0: Create a Copy of Your 12-Factor App Solution

- **Create a Copy of Your Project**

  - Copy your Day 1 12-Factor App repository or copy your project folder to a your `Day3/Solutions/Lab2` directory. This will be the starting point for this exercise.


#### Step 1: Set Up Minikube

1. **Install Minikube**

   - **Windows and macOS:**

     - Download the installer from the [Minikube Installation Guide](https://minikube.sigs.k8s.io/docs/start/).
     - Follow the installation instructions for your operating system.

   - **Linux:**

     ```bash
     curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
     sudo install minikube-linux-amd64 /usr/local/bin/minikube
     ```

   - **Verify Installation:**

     ```bash
     minikube version
     ```

     - **Tip**: This should display the version of Minikube installed.

2. **Start Minikube**

   - Start a Minikube cluster:

     ```bash
     minikube start --driver=docker
     ```

     - **Note**: You can specify a different driver based on your system (e.g., `virtualbox`, `hyperkit`).

   - **Verify that the Cluster is Running:**

     ```bash
     kubectl get nodes
     ```

     - You should see a node named `minikube` in `Ready` status.

---

#### Step 2: Install Istio on Minikube

1. **Download Istio**

   - Download the latest Istio release from the [Istio website](https://istio.io/latest/docs/setup/getting-started/).

     ```bash
     curl -L https://istio.io/downloadIstio | sh -
     ```

     - This will download and extract the Istio package into a directory named `istio-<version>`.

   - **Add `istioctl` to PATH**

     - **Linux or macOS:**

       ```bash
       export PATH=$PWD/istio-1.23.3/bin:$PATH
       ```

       - Replace `istio-1.23.3` with your actual Istio version directory.
       - **Tip**: You can add this line to your `.bashrc` or `.zshrc` to make it persistent.

     - **Windows (PowerShell):**

       ```powershell
       $Env:Path += ";$PWD/istio-1.23.3/bin"
       ```

       - Replace `istio-1.23.3` with your actual Istio version directory.
       - **Tip**: You can add this line to your PowerShell profile to make it persistent.

2. **Install Istio on Minikube**

   - Install Istio using the `demo` profile:

     ```bash
     istioctl install --set profile=demo -y
     ```

     - The `demo` profile is suitable for learning and exploring Istio features.

   - **Verify the Installation**

     ```bash
     kubectl get pods -n istio-system
     ```

     - Ensure all Istio components are running.

3. **Label the Namespace for Sidecar Injection**

   - Enable automatic sidecar injection for the `default` namespace:

     ```bash
     kubectl label namespace default istio-injection=enabled
     ```

---

#### Step 3: Build and Deploy Your Application to Minikube

1. **Set Up Docker Environment for Minikube**

   - Configure Docker to use the Minikube Docker daemon:

     ```bash
     eval $(minikube -p minikube docker-env)
     ```

     - **Note**: This allows you to build Docker images inside Minikube's Docker.

2. **Build Backend Docker Image**

   - Navigate to your backend directory and build the Docker image:

     ```bash
     cd .../Day3/Solutions/Lab2/12factor/backend
     docker build -t backend:latest .
     cd ../..
     ```

3. **Build Frontend Docker Image**

   - Navigate to your frontend directory and build the Docker image:

     ```bash
     cd .../Day3/Solutions/Lab2/12factor/frontend
     docker build -t frontend:latest .
     cd ../..
     ```

4. **Create Kubernetes Deployment Manifests**

   - **Backend Deployment**

     Create the backend deployment and service manifest.

     ##### .../Day3/Solutions/Lab2/12factor/k8s/backend-deployment.yaml

     ```yaml
     # filepath: .../Day3/Solutions/Lab2/12factor/k8s/backend-deployment.yaml
     apiVersion: apps/v1
     kind: Deployment
     metadata:
       name: backend-deployment
       labels:
         app: backend
         version: v1
     spec:
       replicas: 1
       selector:
         matchLabels:
           app: backend
           version: v1
       template:
         metadata:
           labels:
             app: backend
             version: v1
         spec:
           containers:
           - name: backend
             image: backend:latest
             ports:
             - containerPort: 3001
             env:
             - name: PORT
               value: "3001"
     ---
     apiVersion: v1
     kind: Service
     metadata:
       name: backend
     spec:
       selector:
         app: backend
       ports:
       - protocol: TCP
         port: 3001
         targetPort: 3001
     ```

   - **Frontend Deployment**

     Create the frontend deployment and service manifest.

     ##### .../Day3/Solutions/Lab2/12factor/k8s/frontend-deployment.yaml

     ```yaml
     # filepath: .../Day3/Solutions/Lab2/12factor/k8s/frontend-deployment.yaml
     apiVersion: apps/v1
     kind: Deployment
     metadata:
       name: frontend-deployment
       labels:
         app: frontend
         version: v1
     spec:
       replicas: 1
       selector:
         matchLabels:
           app: frontend
           version: v1
       template:
         metadata:
           labels:
             app: frontend
             version: v1
         spec:
           containers:
           - name: frontend
             image: frontend:latest
             ports:
             - containerPort: 3000
             env:
             - name: REACT_APP_BACKEND_URL
               value: "http://backend:3001/api"
     ---
     apiVersion: v1
     kind: Service
     metadata:
       name: frontend
     spec:
       selector:
         app: frontend
       ports:
       - protocol: TCP
         port: 3000
         targetPort: 3000
     ```

5. **Deploy Applications to Minikube**

   - Apply the manifests:

     ```bash
     kubectl apply -f k8s/backend-deployment.yaml
     kubectl apply -f k8s/frontend-deployment.yaml
     ```

6. **Verify Deployments**

   - Check that the pods are running:

     ```bash
     kubectl get pods
     ```

---

#### Step 4: Configure Istio Ingress Gateway

1. **Create an Istio Gateway**

   Create the Istio Gateway manifest.

   ##### .../Day3/Solutions/Lab2/12factor/k8s/frontend-gateway.yaml

   ```yaml
   # filepath: .../Day3/Solutions/Lab2/12factor/k8s/frontend-gateway.yaml
   apiVersion: networking.istio.io/v1beta1
   kind: Gateway
   metadata:
     name: frontend-gateway
   spec:
     selector:
       istio: ingressgateway
     servers:
     - port:
         number: 80
         protocol: HTTP
         name: http
       hosts:
       - "*"
   ```

2. **Create an Istio Virtual Service**

   Create the Virtual Service manifest.

   ##### .../Day3/Solutions/Lab2/12factor/k8s/frontend-virtualservice.yaml

   ```yaml
   # filepath: .../Day3/Solutions/Lab2/12factor/k8s/frontend-virtualservice.yaml
   apiVersion: networking.istio.io/v1beta1
   kind: VirtualService
   metadata:
     name: frontend
   spec:
     hosts:
     - "*"
     gateways:
     - frontend-gateway
     http:
     - match:
       - uri:
           prefix: "/"
       route:
       - destination:
           host: frontend
           port:
             number: 3000
   ```

3. **Apply Istio Configurations**

   - Apply the manifests:

     ```bash
     kubectl apply -f k8s/frontend-gateway.yaml
     kubectl apply -f k8s/frontend-virtualservice.yaml
     ```

---

#### Step 5: Access the Application

1. **Retrieve the Ingress IP and Port**

   - Since we're using Minikube, we need to access the application via Minikube's IP and the NodePort.

   - Get the URL to access the application:

     ```bash
     kubectl get svc istio-ingressgateway -n istio-system
     ```

     - Note the `PORT(S)` column, find the port mapping for `80:PORT/TCP` (usually `80:31721/TCP`).

   - Get Minikube's IP:

     ```bash
     minikube ip
     ```

   - Access the application at `http://<minikube-ip>:<nodeport>`

     - **Example**: If Minikube IP is `192.168.99.100` and NodePort is `31721`, then access `http://192.168.99.100:31721`

     - **Tip**: You can also use Minikube's service tunnel:

       ```bash
       minikube tunnel
       ```

       - This may require administrative privileges.

---

#### Step 6: Traffic Management with Istio

1. **Deploy Backend Version 2**

   - Update your backend code for version 2 (e.g., change the response message).

     ##### .../Day3/Solutions/Lab2/12factor/backend/index.js

     ```javascript
     // filepath: .../Day3/Solutions/Lab2/12factor/backend/index.js
     const express = require('express');
     const app = express();
     const port = process.env.PORT || 3001;

     app.get('/api', (req, res) => {
       res.json({ message: 'Hello from the backend v2!' });
     });

     app.listen(port, () => {
       console.log(`Backend server is running on port ${port}`);
     });
     ```

   - Build the new image:

     ```bash
     docker build -t backend:v2 .
     ```

   - Deploy the new version:

     Create the deployment manifest.

     ##### .../Day3/Solutions/Lab2/12factor/k8s/backend-v2-deployment.yaml

     ```yaml
     # filepath: .../Day3/Solutions/Lab2/12factor/k8s/backend-v2-deployment.yaml
     apiVersion: apps/v1
     kind: Deployment
     metadata:
       name: backend-v2-deployment
       labels:
         app: backend
         version: v2
     spec:
       replicas: 1
       selector:
         matchLabels:
           app: backend
           version: v2
       template:
         metadata:
           labels:
             app: backend
             version: v2
         spec:
           containers:
           - name: backend
             image: backend:v2
             ports:
             - containerPort: 3001
             env:
             - name: PORT
               value: "3001"
     ```

   - Apply the manifest:

     ```bash
     kubectl apply -f k8s/backend-v2-deployment.yaml
     ```

2. **Create a DestinationRule**

   ##### .../Day3/Solutions/Lab2/12factor/k8s/backend-destinationrule.yaml

   ```yaml
   # filepath: .../Day3/Solutions/Lab2/12factor/k8s/backend-destinationrule.yaml
   apiVersion: networking.istio.io/v1beta1
   kind: DestinationRule
   metadata:
     name: backend
   spec:
     host: backend
     subsets:
     - name: v1
       labels:
         version: v1
     - name: v2
       labels:
         version: v2
   ```

   - Apply the manifest:

     ```bash
     kubectl apply -f k8s/backend-destinationrule.yaml
     ```

3. **Create a VirtualService for Traffic Splitting**

   ##### .../Day3/Solutions/Lab2/12factor/k8s/backend-virtualservice.yaml

   ```yaml
   # filepath: .../Day3/Solutions/Lab2/12factor/k8s/backend-virtualservice.yaml
   apiVersion: networking.istio.io/v1beta1
   kind: VirtualService
   metadata:
     name: backend
   spec:
     hosts:
     - backend
     http:
     - route:
       - destination:
           host: backend
           subset: v1
         weight: 50
       - destination:
           host: backend
           subset: v2
         weight: 50
   ```

   - Apply the manifest:

     ```bash
     kubectl apply -f k8s/backend-virtualservice.yaml
     ```

4. **Test Traffic Splitting**

   - Access the frontend application multiple times.

   - Observe that the messages from the backend alternate between version 1 and version 2.

---

#### Step 7: Observability with Istio

1. **Install Istio Add-ons**

   - Install the Kiali, Prometheus, Grafana, and Jaeger components:

     ```bash
     kubectl apply -f istio-1.16.1/samples/addons
     ```

     - **Note**: Adjust the Istio version in the path if necessary.

2. **Access Kiali Dashboard**

   - Launch the Kiali dashboard:

     ```bash
     istioctl dashboard kiali
     ```

     - A browser window should open with the Kiali dashboard.

   - **Explore Service Graph**

     - Observe the service mesh topology.

3. **Access Grafana and Jaeger**

   - Launch the Grafana dashboard:

     ```bash
     istioctl dashboard grafana
     ```

   - Launch the Jaeger tracing UI:

     ```bash
     istioctl dashboard jaeger
     ```

---

#### Step 8: Implement Security with Mutual TLS

1. **Enable Mutual TLS**

   - Create the PeerAuthentication manifest.

     ##### .../Day3/Solutions/Lab2/12factor/k8s/peer-authentication.yaml

     ```yaml
     # filepath: .../Day3/Solutions/Lab2/12factor/k8s/peer-authentication.yaml
     apiVersion: security.istio.io/v1beta1
     kind: PeerAuthentication
     metadata:
       name: default
     spec:
       mtls:
         mode: STRICT
     ```

   - Apply the manifest:

     ```bash
     kubectl apply -f k8s/peer-authentication.yaml
     ```

2. **Verify mTLS**

   - Use `istioctl` to check the status:

     ```bash
     istioctl authn tls-check $(kubectl get pod -l app=frontend -o jsonpath='{.items[0].metadata.name}') backend.default.svc.cluster.local
     ```

---

#### Step 9: Cleanup

1. **Delete Minikube Cluster**

   ```bash
   minikube delete
   ```

---

#### Additional Notes

- **Minikube Environment**

  - Remember to switch back your Docker environment after you're done:

    ```bash
    eval $(minikube -p minikube docker-env --unset)
    ```

- **Persistence**

  - Since Minikube runs locally, your data and state will not persist once the cluster is deleted.

- **Exploring Istio**

  - Use the various dashboards to explore metrics, traces, and the overall health of your service mesh.

- **Helpful Commands**

  - Get all pods and services:

    ```bash
    kubectl get pods,services
    ```

  - Describe a pod:

    ```bash
    kubectl describe pod <pod-name>
    ```

---

All file modifications are provided with their full file paths. Remember to adjust the paths and commands according to your environment.

**Happy Learning and Exploring Istio on Minikube!**
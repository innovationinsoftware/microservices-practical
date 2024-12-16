# Setup Student VM's

### Launch VS Code in Administrator Mode to Install software in a Terminal window

### Step 1: Run VS Code as Administrator
1. Close any open instances of Visual Studio Code.
2. Search for "Visual Studio Code" in the Start menu.
3. Right-click on it and select **Run as Administrator**.
   - If prompted by User Account Control (UAC), click **Yes** to allow it.

---
### **Step 2: Open the Integrated Terminal**
1. In VS Code, click on the **Terminal** menu at the top and select **New Terminal**.
   - Alternatively, use the shortcut: `Ctrl + ~` (Windows/Linux) or `Cmd + ~` (Mac).
2. Ensure the terminal is using **PowerShell**, as Chocolatey requires it.

---

### **Step 3: Set Execution Policy**
1. Check the current execution policy by running:
   ```powershell
   Get-ExecutionPolicy
   ```
2. If the policy is not `AllSigned` or `Bypass`, set it to `Bypass` temporarily:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force
   ```

---

## Install Chocolatey

### **Step 4: Install Chocolatey**
1. Run the following command in the terminal:
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```
2. Wait for the script to complete. Chocolatey will be installed on your system.

---

### **Step 5: Verify the Installation**
1. Test that Chocolatey is installed by running:
   ```powershell
   choco --version
   ```
   - This should display the installed version of Chocolatey.

---

### **Step 6: Use Chocolatey to install needed packages**
1. Install some required packages:
   ```powershell
   choco install git wget awscli terraform -y
   ```
---

### **Important Note:**
Always remember to run VS Code in **Administrator mode** whenever you need to use Chocolatey for installing or managing software that requires system-level changes.

# Install Terraform extension for VSCode

### **Step 1: Open Visual Studio Code**
1. Launch **Visual Studio Code** on your computer.
2. Make sure you have it installed. If not, you can download it from [https://code.visualstudio.com/](https://code.visualstudio.com/).

---

### **Step 2: Open the Extensions View**
1. In VS Code, click on the **Extensions** icon on the left-hand sidebar. 
   - Alternatively, press `Ctrl + Shift + X` (Windows/Linux) or `Cmd + Shift + X` (Mac) to open the Extensions view.

---

### **Step 3: Search for the Terraform Extension**
1. In the search bar at the top of the Extensions view, type:
   ```
   Terraform
   ```
2. Look for the **Terraform** extension by **HashiCorp**.

---

### **Step 4: Install the Extension**
1. Click the **Install** button for the extension.
   - The extension will download and install automatically.

---

# Configure AWS credentials

### **Step 1: Log into the AWS Console**

1. In a browser, log into the [AWS Console](https://console.aws.amazon.com/).
2. Search for IAM in the search bar.
3. Click **IAM**
4. Click **Users**.
5. Click **autodev-admin**.
6. On the right click, **Create access key**.
7. Select **Command Line Interface (CLI)**. 
8. Check the confirmation box at the bottom of the page and click **Next**.
9. Skip the description and click **Create access key**.
10. **IMPORTANT:** Copy the **Access key** and **Secret access key** and save them somewhere. You can optionally download the csv file for easy reference. 

---

### **Step 2: Use AWS Configure**

1. Run aws configure in the Visual Studio Code terminal. 
2. Supply the required information.
   * Credentials 
   * Region = `us-west-1`

---

### **Step 3: Test AWS CLI**

1. Confirm that `aws` can use the credentials.

   ```
   aws sts get-caller-identity
   ```

2. You should see your account information returned.


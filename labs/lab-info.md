To access the Windows VMs, please go to [Inspired Portal](https://html.inspiredvlabs.com/) and log in with the following: 


| First Name | Last Name     | Username    | Password      |
|------------|---------------|-------------|---------------|
| Marko      | Durovic       | WNS2022-43  | tekWNS2022!   |
| Prasun     | Sharma        | WNS2022-44  |               |
| Preeti     | Shinde        | WNS2022-45  |               |
| Brick      | DuBose        | WNS2022-46  |               |
| Paul       | Drehs         | WNS2022-47  |               |
| Brandon    | Ballenger     | WNS2022-48  |               |
| Srikanth   | Reddemynam    | WNS2022-49  |               |
| Cam        | Arrowood      | WNS2022-50  |               |
| Miles      | Flanagan      | WNS2022-51  |               |
| Surendra   | Bhandari      | WNS2022-52  |               |
| Sairam     | Nalla         | WNS2022-53  |               |
| Neville    | Masese        | WNS2022-54  |               |
|            |               | WNS2022-55  |               |

# Access the Linux lab VMs

| First Name | Last Name     | VM              |
|------------|---------------|-----------------|
| Marko      | Durovic       | 3.101.108.21    |
| Prasun     | Sharma        | 13.56.181.172   |
| Preeti     | Shinde        | 184.169.196.243 |
| Brick      | DuBose        | 54.177.28.166   |
| Paul       | Drehs         | 3.101.104.227   |
| Brandon    | Ballenger     | 54.183.250.6    |
| Srikanth   | Reddemynam    | 54.193.121.34   |
| Cam        | Arrowood      | 54.193.204.17   |
| Miles      | Flanagan      | 3.101.107.222   |
| Surendra   | Bhandari      | 54.241.232.226  |
| Sairam     | Nalla         | 13.56.237.90    |
| Neville    | Masese        | 54.151.20.250   |
|            |               | 204.236.139.86  |

# Azure credentials
Please log into the [Azure Portal](http://portal.azure.com) using the credentials below. 
Username: `<student#>@jasoninnovationinsoftware.onmicrosoft.com`
Instructor will provide the password 

| First Name | Last Name     | student number  |
|------------|---------------|-----------------|
| Marko      | Durovic       | student1        |
| Prasun     | Sharma        | student2        |
| Preeti     | Shinde        | student3        |
| Brick      | DuBose        | student4        |
| Paul       | Drehs         | student5        |
| Brandon    | Ballenger     | student6        |
| Srikanth   | Reddemynam    | student7        |
| Cam        | Arrowood      | student8        |
| Miles      | Flanagan      | student9        |
| Surendra   | Bhandari      | student10       |
| Sairam     | Nalla         | student11       |
| Neville    | Masese        | student12       |

# Lab Setup
To connect to the lab VMs, you must authenticate using an SSH key. Download the keys from [here](https://github.com/innovationinsoftware/microservices-practical/raw/refs/heads/main/keys.zip). Once the download is complete, extract the zip file where it is easily accessible.

### Mac/Linux

The username for SSH is
`ubuntu`

Open a terminal and `cd` to the extracted lab directory that contains the SSH keys. Inside the directory, run the following command.

### Set permission on SSH keys

```
chmod 600 lab.pem
```



### SSH to lab servers

```
ssh -i lab.pem ubuntu@<MANAGED NODE IP FROM SPREADSHEET>
```

### Set up Putty

If you don’t already have it, download Putty from [here](https://the.earth.li/~sgtatham/putty/latest/w64/putty.exe) and save it to your desktop.

Open Putty and configure a new session for the lab VM.

![img](https://jruels.github.io/openshift-admin/labs/openshift-deploy/images/putty-session.png)

Expand Connection -> SSH -> Auth -> Credentials, click “Browse”, and then in the extracted `keys` directory, choose `lab.ppk`

![image-20230918185300995](https://jruels.github.io/openshift-admin/labs/openshift-deploy/images/putty-auth.png)

**Remember to save your sessions**.

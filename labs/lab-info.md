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

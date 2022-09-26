# Antei
XLAB hackathon assignment. 
Antei is a prototype for a yield aggregator
Note: This code is not safe and should not be used in production.

# Antei
### Yield Aggregator


<br>

## EIPs
- ERC20
- ERC 4626 https://eips.ethereum.org/EIPS/eip-4626



## HardHat

- hardhat `npm i --save hardhat`
- Initiate project: `npx hardhat`
- openzeppelin contracts `npm i @openzeppelin/contracts`
![](https://i.imgur.com/OOyx49c.png)


### Testing on local node

Hardhat node
![](https://i.imgur.com/tYw0AtV.png)


Running tests
![](https://i.imgur.com/pzanLFn.png)



### Deploying to Rinkeby


 Changing the configuration file:
![](https://i.imgur.com/Ls6AltN.png)


Deploying to the network
![](https://i.imgur.com/sZRFCI8.png)



- TX:
https://rinkeby.etherscan.io/tx/0x3cbf35138487aee72f65184733aee71789ed56f899cbcf70d8f22aa285d347e2




- bulding app
`npm run build`


- serving app
`npm install -g serve`
`serve -s build`




<br>
<br>






## Front End with React



connect react app to deployed contract after testing




The app will detect if you are connected to the rinkeby network, and if not then ask you to do so
![](https://i.imgur.com/GYQsGU0.png)

![](https://i.imgur.com/L8x6Pds.png)



<br>
<br>

## VPS(Virtual Private Server)



### Renting a VPS
I rented a server using cryptocurrencies. - https://njal.la/
#### 0. I rented a server for 2 months, which cost me 30$
<img src="https://i.imgur.com/utW7KAV.png" alt="" width="400"/>


#### 1. I bought 100$ of Ethereum
<img src="https://i.imgur.com/DeaLtYE.png" alt="" width="400"/>

#### 2. transfered from my exchange account to Njalla
<img src="https://i.imgur.com/CWMjXju.png" alt="" width="300"/>


#### 3. Paid $30for the server
<img src="https://i.imgur.com/FrIvVeL.png" alt="drawing" width="300"/>

#### 4. Additionally, paid $15 more to buy the [anteixlab.xyz](https://anteixlab.xyz/) domain
<img src="https://i.imgur.com/2OUl3Xf.png" alt="" width="400"/>


#### 5. Adding DNS record to point domain to IP address
<img src="https://i.imgur.com/loR7OFi.png" alt="" width="400"/>



<br>
<br>

### SSH

#### 1. create ssh key

<img src="https://i.imgur.com/BtdoBhl.png" alt="drawing" width="300"/>

#### 2. Generates private and public key

<img src="https://i.imgur.com/25Yp2TP.png" alt="drawing" width="300"/>


#### 3. ssh inside the server

<img src="https://i.imgur.com/ga9qwxt.png" alt="" width="400"/>


<br>
<br>

### Configuration

1. `apt update && apt upgrade`

2. Change ssh from standard port 22 to a different port to minimize risk of automated bruteforcing attacks. 
<img src="https://i.imgur.com/KWUhRwF.png" alt="" width="400"/>

`~$ sudo nano /etc/ssh/sshd_config`
`Port 54321`
![](https://i.imgur.com/GjyLJ3A.png)

`sudo systemctl restart sshd`
`reboot`

#### Now ssh in again through the new port 
<img src="https://i.imgur.com/pm8AsUH.png" alt="" width="400"/>

#### Make new root password
`su root`
`passwd`
![](https://i.imgur.com/7KtiawP.png)


#### Create user with restricted perms
`adduser pm`
![](https://i.imgur.com/YpuTpnB.png)


#### Disallow root login
`vim /etc/ssh/ssdd_config`
![](https://i.imgur.com/BpRydJO.png)

`systemctl restart sshd`


#### Now it is not possible to login with root as before
![](https://i.imgur.com/yjE0BMu.png)


### Install dependencies
- `apt install nodejs`
- `apt install npm`
- `apt insall git`
- `apt install curl`

### Create production build
- clone app from repo into server `git clone https://github.com/misirov/Antei.git`
- install all react dependencies
- `npm install`

`npm -g install create-react-app`



## NGINX

- Install
`sudo apt-install nginx`

- Check status
`sudo service nginx status`

- set configuration files under:
`/etc/nginx/sites-available/`

- To serve a React app, first create a configuration file inside `/etc/nginx/sites-available/` with the app path and routing settings. *example of the config file* `reactBuild`:

```bash
server {
    listen 80;
    listen [::]:80;
    root /home/pm/Antei-build/build;
    index index.html index.htm index.nginx-debian.html;
    server_name anteixlab.xyz www.anteixlab.xyz;
    location / {
      try_files $uri /index.html;
    }
}
```

- Then make a symbolic link to `/etc/nginx/sites-enabled/` for nginx to query:
`sudo ln -s /etc/nginx/sites-available/reactBuild /etc/nginx/sites-enabled/`

- compile and test nginx syntax
`sudo nginx -t`

- reload nginx to apply settings:
`sudo service nginx reload`




http://anteixlab.xyz/


## httpS

https://github.com/vinyll/certbot-install#how-to-install

![](https://i.imgur.com/CBcROYQ.png)


successful cert
![](https://i.imgur.com/lxHJCzZ.png)


from UNSECURE IP 
![](https://i.imgur.com/0zOzhbx.png)


to SECURE

![](https://i.imgur.com/PMkmScp.png)





<br>
<br>


## Links and resources
- https://github.com/vinyll/certbot-install#how-to-install

# Madersenia_APP

## Setup

docker build --progress=plain -t madersenia-api .
docker run -d -p 443:443 --name madersenia-api madersenia-api

docker build --progress=plain -t madersenia-cli .
docker run -d -p 443:443 --name madersenia-cli madersenia-cli

 docker-compose up -d --build


### Database Init

- docker run -d -p 50000:50000 -e LICENSE=accept taskana/db2:11.1

### Node Setup

- Clone the repo and go to ./madersenia_api path
- npm i 

Bedfore installation make sure that you have this:

Download the specific driver for your OS system, here:
https://public.dhe.ibm.com/ibmdl/export/pub/software/data/db2/drivers/odbc_cli/

Windows:
 - x32: ntx32_odbc_cli.zip	
 - x64: ntx64_odbc_cli.zip	
Linux:
- x64: linuxx64_odbc_cli.tar.gz	
z/OS:
- s390x: ODBC support from IBM Db2 for z/OS 11.0 or 12.0

Set environment variables the clidriver:

#### Example:
set IBM_DB_HOME=C:\Users\Arnau\Desktop\clidriver
* This can also be setted at environment variables 

If you want to see the IBM DB2 database via using VSCode extension you must have a Java SE version installed otherwise the extension wil not work correctly.

### Client Setup

- Clone the repo and got to ./madersenia_cli path
- npm i 

## Execution

* On API:
- node index.js

* On CLI
- npm run dev

### API


## Other Links of DB Info
db2cli writecfg add -dsn alias -database TSKDB -host localhost -port 50000 -parameter "PROTOCOL=TCPIP"
db2cli validate -dsn alias -connect -user db2inst1 -passwd db2inst1-pwd

- https://www.ibm.com/support/pages/node/6573279
- https://www.ibm.com/support/fixcentral/swg/downloadFixes?parent=ibm%7EInformation%20Management&product=ibm/Information+Management/IBM+Data+Server+Client+Packages&release=11.1.*&platform=Windows+32-bit,+x86&function=fixId&fixids=DSClients-nt32-odbc_cli-11.1.4070.1733-FP007&includeRequisites=1&includeSupersedes=0&downloadMethod=http&source=fc
- https://www.ibm.com/docs/en/db2/11.5?topic=systems-testing-cli-connectivity-database




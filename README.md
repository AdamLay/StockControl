# Setup

## General ##
Create a C:\Projects folder. Good idea to store projects in a short path, so you'll end up with C:\Projects\StockControl

## Install VS 2015 Community ##
[Visual Studio 2015](https://go.microsoft.com/fwlink/?LinkId=532606&clcid=0x409)
When installing, check custom. Go to custom tools at the bottom and tick "GitHub Extension". Can ignore everything else. This might take a while to install.
Once installed, you'll need a few extensions which can be installed easily through "Tools > Extensions and Updates... > Online".
Search node tools, download and install "Node Tools 1.1 RC for Visual Studio 2015".
Search web essentials, download "Web Essentials 2015".
Search web compiler, download "Web Compiler" (this is for the .less files)
Lastly, do any updates for the GitHub extension (if any).

## Install Node ##
[Node JS](https://nodejs.org/dist/latest/x64/node-v0.12.7-x64.msi)
Just a simple install, leave path as C:\Program Files\nodejs\ then next next install etc.

## Install MongoDb ##
[MongoDB](https://fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-ssl-3.0.6-signed.msi?_ga=1.200363047.828262666.1441270901)
Do complete install, nothing to see here. Afterwards, you'll need to add to your PATH C:\Program Files\MongoDB\Server\3.0\bin

## Install GitHub Desktop ##
[GitHub Desktop](https://github-windows.s3.amazonaws.com/GitHubSetup.exe)
Just download and install. When it's running, sign in with your GitHub account.

## Getting the project ##
Firstly you'll need to go to [the Stock Control repo](https://github.com/AdamLay/StockControl) and hit "Clone in Desktop" to get a local copy. Make sure you've selected C:\Projects\ as the directory to clone into.
Open up Visual Studio, go to the Team Explorer window and "Connect..." to GitHub with your account. Under local git repositories, add the C:\Projects\StockControl folder. Double click the resulting project, then under solutions double click StockControl.sln to open.
Open a cmd window at C:\Projects\StockControl\StockControl and run "npm install". This will install the node dependencies.
Run the run_mongo.bat file in the project root (allow through firewall, etc).
Go back to VS, press F5 and it should all run nicely :)
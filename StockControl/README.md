# StockControl

## Files to worry about
Don't edit any js files directly, ever.

### app.ts
This is the node server file. Any server side operations will be done in here, and will usually be in the form of socket.io events.

### web/index.html
This is the default html file.

### web/js/main.ts
This is the main client side script.

### web/styles/main.less
This is your main stylesheet, don't edit the css - only this ``.less`` file.

## Before Running
Open a cmd prompt in this folder and run ``npm install``

Run the run_mongo.bat file to start up the mongodb process.
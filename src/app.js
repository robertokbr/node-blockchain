const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const BlockChainClass = require('./models/blockchain.js');
const BlockchainController = require('./blockchain.controller.js');

class ApplicationServer {
	constructor() {
		this.app = express();
		this.blockchain = new BlockChainClass.Blockchain();
		this.initExpress();
		this.initExpressMiddleWare();
		this.initControllers();
		this.start();
	}

	initExpress() {
		this.app.set("port", 8000);
	}

	initExpressMiddleWare() {
		this.app.use(morgan("dev"));
		this.app.use(bodyParser.urlencoded({extended:true}));
		this.app.use(bodyParser.json());
	}

	initControllers() {
    BlockchainController(this.app, this.blockchain);
	}

	start() {
		let self = this;
		this.app.listen(this.app.get("port"), () => {
			console.log(`Server Listening for port: ${self.app.get("port")}`);
		});
	}
}

new ApplicationServer();

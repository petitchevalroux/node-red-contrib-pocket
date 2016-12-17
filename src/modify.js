"use strict";
var path = require("path");
var PocketClient = require(path.join(__dirname, "client"));
var credentialsHelper = require(path.join(__dirname, "credentials-helper"));

module.exports = function(RED) {
    RED.nodes.registerType("pocket modify", function(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.pocketCredentials = RED.nodes.getCredentials(config.pocketCredentials);
        this.on("input", function(msg) {
            node.pocketCredentials = RED.nodes.getCredentials(
                config.pocketCredentials);
            var credentials = credentialsHelper.getFromNode(
                node);
            if (credentials === null) {
                return;
            }
            var client = new PocketClient(credentials.consumerKey);
            
            node.status({
                fill: "green",
                shape: "dot",
                text: "modifying " + JSON.stringify(
                    msg.payload)
            });
            var timeout;
            client.modify(credentials.accessToken, msg.payload)
                .then(function(response) {
                    if(response.status !== 1) {
                        throw new Error("unexpected response status: "
                            + JSON.stringify(response));
                    }
                    node.status({
                        fill: "green",
                        shape: "ring",
                        text: "successfully modified " +
                            JSON.stringify(
                                msg.payload)
                    });
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                    timeout = setTimeout(function() {
                        node.status({
                            fill: "green",
                            shape: "ring",
                            text: "connected"
                        });
                    }, 5000);
                    node.log(
                        "item modified " +
                        JSON.stringify(response));
                    return response;
                })
                .catch(function(err) {
                    var info = JSON.stringify({
                        "error": err.message,
                        "payload": msg.payload
                    });
                    var str = "error modifying " + info;
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: str
                    });
                    node.error(str);
                });
        });
    });
};

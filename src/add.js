"use strict";
var path = require("path");
var PocketClient = require(path.join(__dirname, "client"));
var credentialsHelper = require(path.join(__dirname, "credentials-helper"));

module.exports = function(RED) {
    RED.nodes.registerType("pocket add", function(config) {
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
            var toAdd = {};
            if (typeof(msg.payload) === "string") {
                toAdd.url = msg.payload;
            } else {
                toAdd = msg.payload;
            }
            node.status({
                fill: "green",
                shape: "dot",
                text: "adding " + JSON.stringify(
                    toAdd)
            });
            var timeout;
            client.add(credentials.accessToken, toAdd.url,
                    toAdd.title, toAdd.tags, toAdd.tweet_id
                )
                .then(function(response) {
                    node.status({
                        fill: "green",
                        shape: "ring",
                        text: "successfully added " +
                            JSON.stringify(
                                toAdd)
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
                        "item added " +
                        JSON.stringify(response));
                    return response;
                })
                .catch(function(err) {
                    var info = JSON.stringify({
                        "error": err.message,
                        "item": toAdd
                    });
                    var msg = "error adding " + info;
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: msg
                    });
                    node.error(msg);
                });
        });
    });
};

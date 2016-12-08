"use strict";
var path = require("path");
var PocketClient = require(path.join(__dirname, "client"));

module.exports = function(RED) {
    RED.nodes.registerType("pocket in", function(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.pocketCredentials = RED.nodes.getCredentials(config.pocketCredentials);
        var credentials = node.pocketCredentials;
        if (!credentials) {
            node.status({
                fill: "red",
                shape: "dot",
                text: "credentials not found"
            });
            node.error("credentials not found");
            return;
        }
        if (!credentials.accessToken) {
            node.status({
                fill: "red",
                shape: "dot",
                text: "access token not found"
            });
            node.error("access token not found");
            return;
        }
        if (!credentials.consumerKey) {
            node.status({
                fill: "red",
                shape: "dot",
                text: "consumer key not found"
            });
            node.error("consumer key not found");
            return;
        }
        var options = {};
        if (config.state !== "") {
            options.state = config.state;
        }
        if (config.favorite !== "") {
            options.favorite = config.favorite;
        }
        if (config.tag !== "") {
            options.tag = config.tag;
        }
        if (config.contentType !== "") {
            options.contentType = config.contentType;
        }
        if (config.sort !== "") {
            options.sort = config.sort;
        }
        if (config.detailType !== "") {
            options.detailType = config.detailType;
        }
        if (config.search !== "") {
            options.search = config.search;
        }
        if (config.domain !== "") {
            options.domain = config.domain;
        }
        if (config.since !== "") {
            options.since = parseInt(config.since);
        }
        if (config.count !== "") {
            options.count = parseInt(config.count);
        }
        if (config.offset !== "") {
            options.offset = parseInt(config.offset);
        }

        node.clearFetchPocketItemsTimeout = function() {
            if (this.fetchPocketItemsTimeout) {
                clearTimeout(this.fetchPocketItemsTimeout);
            }
        };

        node.on("close", function() {
            node.clearFetchPocketItemsTimeout();
        });

        node.nextFetchPocketItems = function() {
            this.clearFetchPocketItemsTimeout();
            if (config.interval !== "") {
                options.since = node.lastFetchPocketItems;
                this.fetchPocketItemsTimeout = setTimeout(
                    function() {
                        node.fetchPocketItems();
                    }, config.interval * 1000);
            }
        };

        if (config.interval !== "") {
            delete options.offset;
            delete options.count;
        }

        node.fetchPocketItems = function() {
            var client = new PocketClient(credentials.consumerKey);
            this.lastFetchPocketItems = Math.floor(Date.now() /
                1000);
            client.retrieve(credentials.accessToken, options)
                .then(function(items) {
                    var messages = [];
                    items.forEach(function(item) {
                        node.log("retrieved item " +
                            JSON.stringify(item)
                        );
                        messages.push({
                            "payload": item
                        });
                    });
                    node.send(messages);
                    node.nextFetchPocketItems();
                    return items;
                })
                .catch(function(err) {
                    var msg = "error retrieving " + err.message;
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: msg
                    });
                    node.error(msg);
                });
        };
        node.fetchPocketItems();
    });
};

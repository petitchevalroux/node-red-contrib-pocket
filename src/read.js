"use strict";
var path = require("path");
var PocketClient = require(path.join(__dirname, "client"));
var credentialsHelper = require(path.join(__dirname, "credentials-helper"));

module.exports = function(RED) {
    RED.nodes.registerType("pocket read", function(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.pocketCredentials = RED.nodes.getCredentials(config.pocketCredentials);
        var credentials = credentialsHelper.getFromNode(node);
        if (credentials === null) {
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
                    items.forEach(function(item) {
                        node.log("retrieved item " +
                            JSON.stringify(item)
                        );
                        node.send({
                            "payload": item
                        });
                    });
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

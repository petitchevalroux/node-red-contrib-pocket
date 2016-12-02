"use strict";
var path = require("path");
var PocketClient = require(path.join(__dirname, "client"));

module.exports = function(RED) {
    var client = new PocketClient("61039-15eaef932c93244d94399065");

    // Define route in order to redirect user to pocket website for authentication
    RED.httpAdmin.get("/pocket/:id/auth", function(req, res) {
        var callbackUrl = req.protocol + "://" + req.get("host") +
            "/pocket/" + encodeURIComponent(req.params.id) +
            "/callback";
        client.getRequestToken(callbackUrl)
            .then(function(token) {
                RED.nodes.addCredentials(req.params.id, {
                    request_token: token
                });
                return client.getRedirectUrl(token, callbackUrl);
            })
            .then(function(redirectUrl) {
                return res.redirect(redirectUrl);
            })
            .catch(function(error) {
                RED.log.error(error);
            });
    });

    // Callback route the visitor is returned from pocket website
    RED.httpAdmin.get("/pocket/:id/callback", function(req, res) {
        var credentials = RED.nodes.getCredentials(req.params.id);
        if (credentials.request_token) {
            client.getAccessToken(credentials.request_token)
                .then(function(data) {
                    RED.nodes.addCredentials(
                        req.params.id, {
                            username: data.username,
                            access_token: data.access_token
                        }
                    );
                    RED.nodes.getNode(req.params.id)
                        .status({
                            fill: "green",
                            shape: "ring",
                            text: "connected"
                        });
                    res.redirect(req.protocol + "://" + req.get(
                        "host"));
                    return data;
                })
                .catch(function(err) {
                    RED.log.error(err);
                    res.status(500)
                        .send(JSON.stringify(err));
                });
        } else {
            res.status(410)
                .send("No request token");
        }
    });


    RED.nodes.registerType("pocket out", function(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        this.on("input", function(msg) {
            var credentials = RED.nodes.getCredentials(node
                .id);
            if (!credentials.access_token) {
                node.status({
                    fill: "red",
                    shape: "dot",
                    text: "not connected"
                });
                return;
            }
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
            client.add(credentials.access_token, toAdd.url,
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
                    RED.log.info(
                        "Item successfully added to Pocket: " +
                        JSON.stringify(response));
                    return response;
                })
                .catch(function(err) {
                    var info = JSON.stringify({
                        "error": err,
                        "item": toAdd
                    });
                    node.status({
                        fill: "red",
                        shape: "dot",
                        text: "error adding " +
                            info
                    });
                    RED.log.error(
                        "Unable to add item to Pocket: "
                        .info);
                });
        });
    }, {
        credentials: {
            username: {
                type: "text"
            },
            access_token: {
                type: "password"
            },
            request_token: {
                type: "password"
            }
        }
    });
};

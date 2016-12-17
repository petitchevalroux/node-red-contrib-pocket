"use strict";
var path = require("path");
var PocketClient = require(path.join(__dirname, "client"));

module.exports = function(RED) {

    // Callback route the visitor is returned from pocket website
    RED.httpAdmin.get("/pocket/:id/callback", function(req, res) {
        var credentials = RED.nodes.getCredentials(req.params.id);
        var client = new PocketClient(credentials.consumerKey);
        if (credentials.requestToken) {
            client.getAccessToken(credentials.requestToken)
                .then(function(data) {
                    RED.nodes.addCredentials(
                        req.params.id, {
                            user: data.username,
                            consumerKey: credentials.consumerKey,
                            accessToken: data.access_token
                        }
                    );
                    res.setHeader("Content-Type",
                        "text/plain; charset=utf-8");
                    res.send(
                        "Pocket's account configured (account: " +
                        data.username +
                        "), you can close this window and continue on Node-RED"
                    );
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

    // Define route in order to redirect user to pocket website for authentication
    RED.httpAdmin.get("/pocket/:id/auth", function(req, res) {
        var callbackUrl = req.protocol + "://" + req.get("host") +
            "/pocket/" + encodeURIComponent(req.params.id) +
            "/callback";
        var consumerKey = "61039-15eaef932c93244d94399065";
        var client = new PocketClient(consumerKey);
        client.getRequestToken(callbackUrl)
            .then(function(token) {
                RED.nodes.addCredentials(req.params.id, {
                    "requestToken": token,
                    "consumerKey": consumerKey
                });
                return client.getRedirectUrl(token, callbackUrl);
            })
            .then(function(redirectUrl) {
                return res.redirect(redirectUrl);
            })
            .catch(function(error) {
                RED.log.error(error);
                res.status(500)
                    .send(error);
            });
    });

    RED.httpAdmin.get("/pocket/:id/credentials", function(req, res) {
        var status = 0;
        var data = {};
        var credentials = RED.nodes.getCredentials(req.params.id);
        if (credentials) {
            if (credentials.requestToken) {
                status = 1;
            } else if (credentials.user) {
                status = 2;
                data.user = credentials.user;
            }
        }
        res.setHeader("Content-Type", "application/json");
        res.send(JSON.stringify({
            "status": status,
            "data": data
        }));
    });

    RED.nodes.registerType("pocket-credentials", function(n) {
        RED.nodes.createNode(this, n);
        this.user = n.user;
    }, {
        credentials: {
            "consumerKey": {
                type: "password"
            },
            "user": {
                type: "text"
            },
            "accessToken": {
                type: "password"
            },
            "requestToken": {
                type: "password"
            }
        }
    });
};

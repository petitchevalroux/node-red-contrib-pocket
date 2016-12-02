"use strict";
var Promise = require("bluebird");

function PocketClient(consumerKey) {
    this.consumerKey = consumerKey;

    this.getRequest = function() {
        if (!this.defaultRequest) {
            var request = require("request");
            this.defaultRequest = request.defaults({
                "headers": {
                    "content-type": "application/json",
                    "x-accept": "application/json"
                },
                "baseUrl": "https://getpocket.com/v3/"
            });
        }
        return this.defaultRequest;
    };

    this.query = function(path, data) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var request = self.getRequest();
            request.post({
                "uri": path,
                body: JSON.stringify(data)
            }, function(error, response, body) {
                if (error) {
                    reject(error);
                    return;
                }
                if (response.statusCode !== 200) {
                    var e = new Error("Non 200");
                    reject(e);
                    return;
                }
                try {
                    var object = JSON.parse(body);
                } catch (err) {
                    reject(err);
                    return;
                }
                resolve(object);
            });
        });
    };

    this.getRequestToken = function(redirectUri, state) {
        var params = {
            "consumer_key": this.consumerKey,
            "redirect_uri": redirectUri
        };
        if (state) {
            params.state = state;
        }
        return this.query("oauth/request", params)
            .then(function(response) {
                return response.code;
            });
    };

    this.getAccessToken = function(requestToken) {
        return this.query(
                "oauth/authorize", {
                    "consumer_key": this.consumerKey,
                    "code": requestToken
                }
            )
            .then(function(response) {
                return response;
            });
    };

    this.add = function(accessToken, url, title, tags, tweetId) {
        var params = {
            "consumer_key": this.consumerKey,
            "access_token": accessToken,
            "url": url
        };
        if (title) {
            params.title = title;
        }
        if (tags) {
            params.tags = tags;
        }
        if (tweetId) {
            params.tweet_id = tweetId;
        }
        return this.query("add", params)
            .then(function(response) {
                return response;
            });
    };

    this.getRedirectUrl = function(requestToken, redirectUri) {
        return "https://getpocket.com/auth/authorize?request_token=" +
            encodeURIComponent(requestToken) +
            "&redirect_uri=" +
            encodeURIComponent(redirectUri);
    };
}

module.exports = PocketClient;

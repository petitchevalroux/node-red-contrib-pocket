"use strict";
var Promise = require("bluebird");

/**
 * Pocket API Client
 * @param {string} consumerKey The consumer key for your application
 * @returns {PocketClient}
 */
function PocketClient(consumerKey) {
    this.consumerKey = consumerKey;

    /**
     * Return request object
     * @returns {Request}
     */
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

    /**
     * Query path and resolve promise with parsed body as an object 
     * @param {string} path
     * @param {object} data
     * @returns {Promise}
     */
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

    /**
     * Get request token from the API
     * doc: https://getpocket.com/developer/docs/authentication
     * @param {string} redirectUri The URL to be called when the authorization
     * process has been completed.
     * @param {string} state optional A string of metadata used by your app.
     * This string will be returned in all subsequent authentication responses.
     * @returns {Promise}
     */
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

    /**
     * Get an access token from a request token
     * doc: https://getpocket.com/developer/docs/authentication
     * @param {string} requestToken request token
     * @returns {Promise}
     */
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

    /**
     * Add an item to pocket
     * doc: https://getpocket.com/developer/docs/v3/add
     * @param {string} accessToken
     * @param {string} url
     * @param {string} title (optional) This can be included for cases where an
     * item does not have a title, which is typical for image or PDF URLs.
     * If Pocket detects a title from the content of the page, this parameter
     * will be ignored
     * @param {string} tags (optional) A comma-separated list of tags to apply
     * to the item
     * @param {string} tweetId (optional) If you are adding Pocket support to a
     * Twitter client, please send along a reference to the tweet status id.
     * This allows Pocket to show the original tweet alongside the article.
     * @returns {Promise}
     */
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

    /**
     * Get url where redirect user to perform Pocket authentication
     * doc: https://getpocket.com/developer/docs/authentication
     * @param {string} requestToken request token
     * @param {string} redirectUri the redirect_uri is the URL to be called when
     * the user has completed the authorization within Pocket.
     * @returns {String}
     */
    this.getRedirectUrl = function(requestToken, redirectUri) {
        return "https://getpocket.com/auth/authorize?request_token=" +
            encodeURIComponent(requestToken) +
            "&redirect_uri=" +
            encodeURIComponent(redirectUri);
    };
}

module.exports = PocketClient;

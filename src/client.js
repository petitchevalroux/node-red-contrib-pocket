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
                "body": JSON.stringify(data)
            }, function(error, response, body) {
                if (error) {
                    reject(error);
                    return;
                }
                if (response.statusCode !== 200) {
                    var e = new Error("Non 200: " +
                        JSON.stringify({
                            "status": response.statusCode,
                            "body": body
                        }));
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

    /**
     * Retrieving a User's Pocket Data
     * doc: https://getpocket.com/developer/docs/v3/retrieve
     * @param {string} accessToken
     * @param {object} options (optional) object containing options valid values are
     *
     * options.state {string} state (optional) (unread|archive|all)
     *      unread = only return unread items (default)
     *      archive = only return archived items
     *      all = return both unread and archived items
     * options.favorite {string} favorite (optional)
     *      "0" = only return un-favorited items
     *      "1" = only return favorited items
     * options.tag {string} tag (optional)
     *      tag_name = only return items tagged with tag_name
     *      _untagged_ = only return untagged items
     * options.contentType {string} contentType (optional) (article|video|image)
     *      article = only return articles
     *      video = only return videos or articles with embedded videos
     *      image = only return images
     * options.sort {string} sort (optional) (newest|oldest|title|site)
     *      newest = return items in order of newest to oldest
     *      oldest = return items in order of oldest to newest
     *      title = return items in order of title alphabetically
     *      site = return items in order of url alphabetically
     * options.detailType {string} detailType (optional) (simple|complete)
     *      simple = only return the titles and urls of each item
     *      complete = return all data about each item, including tags, images, authors, videos and more
     * options.search {string} (optional) search Only return items whose title or url contain the search string
     * options.domain {string} (optional) domain Only return items from a particular domain
     * options.since {int} since (optional) Only return items modified since the given since unix timestamp
     * options.count {int} count (optional) Only return count number of items
     * options.offset {int} offset (optional) Used only with count; start returning from offset position of results
     * @returns {Promise}
     */
    this.retrieve = function(accessToken, options) {
        var params = options || {};
        params.consumer_key = this.consumerKey;
        params.access_token = accessToken;
        var self = this;
        var p = new Promise(function(resolve, reject) {
            self.query("get", params)
                .then(function(response) {
                    if (!response.list) {
                        reject(new Error("Invalid response " +
                            JSON.stringify({
                                "response": response
                            })));
                    } else {
                        var items = [];
                        Object.getOwnPropertyNames(response.list)
                            .forEach(function(name) {
                                if (name !== "length") {
                                    items.push(response.list[
                                        name]);
                                }
                            });
                        // Sort items by sort_id
                        items.sort(function(a, b) {
                            if (typeof(a.sort_id) ===
                                "undefined" ||
                                typeof(b.sort_id) ===
                                "undefined" ||
                                a.sort_id === b.sort_id
                            ) {
                                return 0;
                            } else if (a.sort_id < b.sort_id) {
                                return -1;
                            } else {
                                return 1;
                            }
                        });
                        resolve(items);
                    }
                    return response;
                })
                .catch(function(error) {
                    reject(error);
                });
        });
        return p;
    };

    /**
     * Modifying a User's Pocket Data
     * doc: https://getpocket.com/developer/docs/v3/modify
     * @param {string} accessToken
     * @param {array} actions update action to perform, see doc
     * @returns {Promise}
     */
    this.modify = function(accessToken, actions) {
        var params = {
            "consumer_key": this.consumerKey,
            "access_token": accessToken,
            "actions": actions
        };
        return this.query("send", params)
            .then(function(response) {
                return response;
            });
    };
}

module.exports = PocketClient;

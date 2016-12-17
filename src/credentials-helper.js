"use strict";
module.exports = {
    /**
     * Returne node credentials and log/change status if error
     * @param {object} node
     * @returns {object}
     */
    getFromNode: function(node) {
        var credentials = node.pocketCredentials;
        if (!credentials) {
            node.status({
                fill: "red",
                shape: "dot",
                text: "credentials not found"
            });
            node.error("credentials not found");
            return null;
        }
        if (!credentials.accessToken) {
            node.status({
                fill: "red",
                shape: "dot",
                text: "access token not found"
            });
            node.error("access token not found");
            return null;
        }
        if (!credentials.consumerKey) {
            node.status({
                fill: "red",
                shape: "dot",
                text: "consumer key not found"
            });
            node.error("consumer key not found");
            return null;
        }
        return credentials;
    }
};

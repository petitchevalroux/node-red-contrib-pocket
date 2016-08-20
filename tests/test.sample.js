"use strict";
var path = require("path");
var assert = require("assert");
var SampleModule = require(path.join(__dirname, "..", "src", "sample"));

describe("SampleModule", function() {
    describe("foo", function() {
        var instance = new SampleModule();
        it("Return foo", function(done) {
            assert.equal(instance.foo(), "foo");
            done();
        });
    });
});

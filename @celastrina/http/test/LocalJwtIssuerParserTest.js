/*
 * Copyright (c) 2020, Robert R Murrell.
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const {LocalJwtIssuerParser} = require("../HTTP");
const {MockPropertyManager} = require("./PropertyManagerTest");
const assert = require("assert");

describe("LocalJwtIssuerParser", () => {
    describe("#_create(_LocalJwtIssuer)", () => {
        it("creates a new LocalJwtIssuer", async () => {
            let pm = new MockPropertyManager();
            let _parser = new LocalJwtIssuerParser();
            let _LocalJwtIssuer = {_content: {type: "application/vnd.celastrinajs.attribute+json;LocalJwtIssuer"},
                                   issuer: "@celastrinajs/issuer/mock",
                                   audiences: ["celastrinajs_mock_aud"],
                                   assignments: ["assignment_a"],
                                   key: "celastrinajsmocktoken_key",
                                   validateNonce: true};
            let _issuer = await _parser._create(_LocalJwtIssuer, pm);
            assert.strictEqual(_issuer.issuer, "@celastrinajs/issuer/mock", "Expected '@celastrinajs/issuer/mock'.");
            assert.strictEqual(_issuer.key, "celastrinajsmocktoken_key", "Expected 'celastrinajsmocktoken_key'.");
            assert.deepStrictEqual(_issuer.audiences, ["celastrinajs_mock_aud"], "Expected ['celastrinajs_mock_aud'].");
            assert.deepStrictEqual(_issuer.assignments, ["assignment_a"], "Expected ['assignment_a'].");
            assert.strictEqual(_issuer.validateNonce, true, "Expected true.");
        });
        it("creates a default LocalJwtIssuer", async () => {
            let pm = new MockPropertyManager();
            let _parser = new LocalJwtIssuerParser();
            let _LocalJwtIssuer = {_content: {type: "application/vnd.celastrinajs.attribute+json;LocalJwtIssuer"},
                issuer: "@celastrinajs/issuer/mock",
                audiences: ["celastrinajs_mock_aud"],
                key: "celastrinajsmocktoken_key"};
            let _issuer = await _parser._create(_LocalJwtIssuer, pm);
            assert.strictEqual(_issuer.issuer, "@celastrinajs/issuer/mock", "Expected '@celastrinajs/issuer/mock'.");
            assert.strictEqual(_issuer.key, "celastrinajsmocktoken_key", "Expected 'celastrinajsmocktoken_key'.");
            assert.deepStrictEqual(_issuer.audiences, ["celastrinajs_mock_aud"], "Expected ['celastrinajs_mock_aud'].");
            assert.deepStrictEqual(_issuer.assignments, [], "Expected [].");
            assert.strictEqual(_issuer.validateNonce, false, "Expected false.");
        });
    });
});


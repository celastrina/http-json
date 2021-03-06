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
const {CelastrinaError, CelastrinaValidationError, LOG_LEVEL, Configuration, AddOn} = require("@celastrina/core");
const {LocalJwtIssuer, HTTPContext, Cookie, JwtSubject, JwtAddOn, JwtAuthenticator, HTTPAddOn} = require("../HTTP");
const {MockAzureFunctionContext} = require("./AzureFunctionContextMock");
const {MockHTTPContext} = require("./HTTPContextTest");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const {MockPropertyManager} = require("./PropertyManagerTest");

describe("JwtAuthenticator", () => {
    describe("#authenticate(context)", () => {
        it("authenticates a valid user", async () => {
            let _mockpayload = {iss: "@celastrinajs/issuer/mock", aud: "aefff932-5d4e-4216-a117-0d42e47b06b7", exp: 1857350304};
            let _mocktoken = jwt.sign(_mockpayload, "celastrinajsmocktoken");
            let _azctx  = new MockAzureFunctionContext();
            _azctx.req.headers["authorization"] = "Bearer " + _mocktoken;
            /**@type{Configuration}*/let _config = new Configuration("JwtAuthenticator");
            /**@type{HTTPAddOn}*/let _httpconfig = new HTTPAddOn();
            /**@type{JwtAddOn}*/let _jwtconfig = new JwtAddOn();
            let _pm = new MockPropertyManager();
            _config.setValue(Configuration.CONFIG_PROPERTY, _pm);
            _config.addOn(_jwtconfig).addOn(_httpconfig);
            _jwtconfig.addIssuer(new LocalJwtIssuer("@celastrinajs/issuer/mock", "celastrinajsmocktoken", ["aefff932-5d4e-4216-a117-0d42e47b06b7"], ["mock_user_role"]));
            await _config.initialize(_azctx);
            let _context = new MockHTTPContext(_config);

            let _subject = new JwtSubject(await _config.sentry.authenticate(_context));
            assert.strictEqual(_subject.issuer, "@celastrinajs/issuer/mock", "Expected '@celastrinajs/issuer/mock'.");
            assert.strictEqual(_subject.audience, "aefff932-5d4e-4216-a117-0d42e47b06b7", "Expected 'aefff932-5d4e-4216-a117-0d42e47b06b7'.");
            assert.deepStrictEqual(_subject.subject.roles, new Set(["mock_user_role"]), "Expected ['mock_user_role']");
        });
        it("fails an invalid user due to bad token", async () => {
            let _mockpayload = {iss: "@celastrinajs/issuer/mock", aud: "aefff932-5d4e-4216-a117-0d42e47b06b7", exp: 1857350304};
            let _mocktoken = jwt.sign(_mockpayload, "celastrinajsmocktoken");
            let _azctx  = new MockAzureFunctionContext();
            _azctx.req.headers["authorization"] = "Bearer " + _mocktoken + "_foozled";
            /**@type{Configuration}*/let _config = new Configuration("JwtSentryTest");
            /**@type{JwtAddOn}*/let _jwtconfig = new JwtAddOn();
            /**@type{HTTPAddOn}*/let _httpconfig = new HTTPAddOn();
            let _pm = new MockPropertyManager();
            _config.setValue(Configuration.CONFIG_PROPERTY, _pm);
            _config.addOn(_jwtconfig).addOn(_httpconfig);
            _jwtconfig.addIssuer(new LocalJwtIssuer("@celastrinajs/issuer/mock", "celastrinajsmocktoken", ["aefff932-5d4e-4216-a117-0d42e47b06b7"], ["mock_user_role"]));
            await _config.initialize(_azctx);
            let _context = new MockHTTPContext(_config);

            try {
                let _subject = new JwtSubject(await _config.sentry.authenticate(_context));
                assert.fail("Expected 401, not authorized CelastrinaException.");
            }
            catch(exception) {
                // do nothing
            }
        });
        it("fails an invalid user due to bad issuer", async () => {
            let _mockpayload = {iss: "@celastrinajs/issuer/mock/foozled", aud: "aefff932-5d4e-4216-a117-0d42e47b06b7", exp: 1857350304};
            let _mocktoken = jwt.sign(_mockpayload, "celastrinajsmocktoken");
            let _azctx  = new MockAzureFunctionContext();
            _azctx.req.headers["authorization"] = "Bearer " + _mocktoken;
            /**@type{Configuration}*/let _config = new Configuration("JwtSentryTest");
            /**@type{JwtAddOn}*/let _jwtconfig = new JwtAddOn();
            /**@type{HTTPAddOn}*/let _httpconfig = new HTTPAddOn();
            let _pm = new MockPropertyManager();
            _config.setValue(Configuration.CONFIG_PROPERTY, _pm);
            _config.addOn(_jwtconfig).addOn(_httpconfig);
            _jwtconfig.addIssuer(new LocalJwtIssuer("@celastrinajs/issuer/mock", "celastrinajsmocktoken", ["aefff932-5d4e-4216-a117-0d42e47b06b7"], ["mock_user_role"]));
            await _config.initialize(_azctx);
            let _context = new MockHTTPContext(_config);

            try {
                let _subject = new JwtSubject(await _config.sentry.authenticate(_context));
                assert.fail("Expected 401, not authorized CelastrinaException.");
            }
            catch(exception) {
                // do nothing
            }
        });
        it("fails an invalid user due to bad audience", async () => {
            let _mockpayload = {iss: "@celastrinajs/issuer/mock", aud: "aefff932-5d4e-4216-a117-0d42e47b06b7_foozled", exp: 1857350304};
            let _mocktoken = jwt.sign(_mockpayload, "celastrinajsmocktoken");
            let _azctx  = new MockAzureFunctionContext();
            _azctx.req.headers["authorization"] = "Bearer " + _mocktoken;
            /**@type{Configuration}*/let _config = new Configuration("JwtSentryTest");
            /**@type{JwtAddOn}*/let _jwtconfig = new JwtAddOn();
            /**@type{HTTPAddOn}*/let _httpconfig = new HTTPAddOn();
            let _pm = new MockPropertyManager();
            _config.setValue(Configuration.CONFIG_PROPERTY, _pm);
            _config.addOn(_jwtconfig).addOn(_httpconfig);
            _jwtconfig.addIssuer(new LocalJwtIssuer("@celastrinajs/issuer/mock", "celastrinajsmocktoken", ["aefff932-5d4e-4216-a117-0d42e47b06b7"], ["mock_user_role"]));
            await _config.initialize(_azctx);
            let _context = new MockHTTPContext(_config);

            try {
                let _subject = new JwtSubject(await _config.sentry.authenticate(_context));
                assert.fail("Expected 401, not authorized CelastrinaException.");
            }
            catch(exception) {
                // do nothing
            }
        });
        it("fails an invalid user due to no token", async () => {
            let _mockpayload = {iss: "@celastrinajs/issuer/mock", aud: "aefff932-5d4e-4216-a117-0d42e47b06b7", exp: 1857350304};
            let _mocktoken = jwt.sign(_mockpayload, "celastrinajsmocktoken");
            let _azctx  = new MockAzureFunctionContext();
            /**@type{Configuration}*/let _config = new Configuration("JwtSentryTest");
            /**@type{JwtAddOn}*/let _jwtconfig = new JwtAddOn();
            /**@type{HTTPAddOn}*/let _httpconfig = new HTTPAddOn();
            let _pm = new MockPropertyManager();
            _config.setValue(Configuration.CONFIG_PROPERTY, _pm);
            _config.addOn(_jwtconfig).addOn(_httpconfig);
            _jwtconfig.addIssuer(new LocalJwtIssuer("@celastrinajs/issuer/mock", "celastrinajsmocktoken", ["aefff932-5d4e-4216-a117-0d42e47b06b7"], ["mock_user_role"]));
            await _config.initialize(_azctx);
            let _context = new MockHTTPContext(_config);

            try {
                let _subject = new JwtSubject(await _config.sentry.authenticate(_context));
                assert.fail("Expected 401, not authorized CelastrinaException.");
            }
            catch(exception) {
                // do nothing
            }
        });
    });
});


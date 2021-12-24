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
const {CelastrinaError, CelastrinaValidationError, LOG_LEVEL, Configuration} = require("@celastrina/core");
const {JSONHTTPContext, Cookie} = require("../HTTP");
const {MockAzureFunctionContext} = require("./AzureFunctionContextMock");
const assert = require("assert");

class MockHJSONTTPContext extends JSONHTTPContext {
    constructor(config = new Configuration("MockHTTPContext")) {
        super(config);
        this.initializeExecuted = false;
    }
    async initialize() {
        await super.initialize();
        this.initializeExecuted = true;
    }
    reset() {
        this.initializeExecuted = false;
    }
}

describe("JSONHTTPContext", () => {
    describe("constructor(context = new MockAzureFunctionContext(), config = new Configuration(\"MockHTTPContext\"))", () => {
        it("Creates successfully", async () => {
            let _azcontext = new MockAzureFunctionContext();
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.notStrictEqual(_context, null, "Context null.");
            assert.notStrictEqual(typeof _context, "undefined", "Context undefined.");
            assert.strictEqual(_context._session, null, "Session not null.");
            assert.deepStrictEqual(_context._cookies, {}, "Cookies not empty object.");
        });
        it("Sets default response", async () => {
            let _azcontext = new MockAzureFunctionContext();
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.deepStrictEqual(_azcontext.res.status, 200, "Expected status 200.");
            assert.deepStrictEqual(_azcontext.res.headers, {"Content-Type": "application/json; charset=utf-8"}, "Expected Content Type Header.");
            assert.deepStrictEqual(_azcontext.res.body, {name: "MockJSONHTTPContext", code: 200, message: "Success! Welcome to celastrinajs."}, "Expected default HTML body.");
        });
    });
    describe("getter/setters", () => {
        it("Gets Cookies", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.deepStrictEqual(_context.cookies, {}, "Session not empty object.");
        });
        it("Gets method", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.deepStrictEqual(_context.method, "post", "Expected method 'post'.");
        });
        it("Gets URL", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.deepStrictEqual(_context.url, "https://www.celastrinajs.com", "Expected method 'https://www.celastrinajs.com'.");
        });
        it("Gets Request", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.deepStrictEqual(_context.request, _azcontext.req, "Expected context request.");
        });
        it("Gets Response", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.deepStrictEqual(_context.response, _azcontext.res, "Expected context response.");
        });
        it("Gets Params", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.deepStrictEqual(_context.params, _azcontext.req.params, "Expected context params.");
        });
        it("Gets Query", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.deepStrictEqual(_context.query, _azcontext.req.query, "Expected context query.");
        });
        it("Gets Raw Body", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.deepStrictEqual(_context.raw, _azcontext.req.rawBody, "Expected context raw body.");
        });
        it("Gets Request Body", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.deepStrictEqual(_context.requestBody, _azcontext.req.body, "Expected context request body.");
        });
        it("Gets Response Body", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.deepStrictEqual(_context.responseBody, _azcontext.res.body, "Expected context response body.");
        });
        it("Gets Session", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.strictEqual(_context.session, null, "Expected null.");
        });
        it("Gets Query", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.strictEqual(await _context.getQuery("param1"), "test123", "Expected 'test123'.");
        });
        it("Gets Query default", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.strictEqual(await _context.getQuery("param100", "test456"), "test456", "Expected 'test456'.");
        });
        it("Gets Query null", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.strictEqual(await _context.getQuery("param100"), null, "Expected null.");
        });
        it("Gets Request Header", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.strictEqual(await _context.getRequestHeader("header1"), "testRequest123", "Expected 'testRequest123'.");
        });
        it("Gets Request Header default", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.strictEqual(await _context.getRequestHeader("header100", "testHeadr456"), "testHeadr456", "Expected 'testHeadr456'.");
        });
        it("Gets Request Header null", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.strictEqual(await _context.getRequestHeader("header100"), null, "Expected null.");
        });
        it("Gets Response Header", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.strictEqual(await _context.getResponseHeader("header1"), "testResponse123", "Expected 'testResponse123'.");
        });
        it("Gets Response Header default", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.strictEqual(await _context.getResponseHeader("header100", "testHeadr456"), "testHeadr456", "Expected 'testHeadr456'.");
        });
        it("Gets Response Header null", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.strictEqual(await _context.getResponseHeader("header100"), null, "Expected null.");
        });
        it("Gets URI Binding", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            assert.deepStrictEqual(await _context.getURIBinding("status"), {key: "value"}, "Expected {key: 'value'}.");
        });
        it("S/Gets Cookie", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            let _cookie = new Cookie("newCookie", "test123");
            await _context.setCookie(_cookie);
            assert.deepStrictEqual(await _context.getCookie("newCookie"), _cookie, "Expected cookie.");
        });
    });
    describe("Request/Response functions", () => {
        it("Sets an existing response header", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            await _context.setResponseHeader("header2", "testHeadr456");
            assert.strictEqual(await _context.getResponseHeader("header2"), "testHeadr456", "Expected 'testHeadr456'.");
        });
        it("Sets a new response header", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            await _context.setResponseHeader("header3", "testHeadr789");
            assert.strictEqual(await _context.getResponseHeader("header3"), "testHeadr789", "Expected 'testHeadr789'.");
        });
        it("Deletes a response header", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            await _context.deleteResponseHeader("header4");
            assert.strictEqual(await _context.getResponseHeader("header4"), null, "Expected null.");
        });
    });
    describe("Cookies", () => {
        it("Sets cookie", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            let _cookie = new Cookie("cookie-name", "cookie-value");
            await _context.setCookie(_cookie);
            assert.deepStrictEqual(_context._cookies["cookie-name"], _cookie, "Expected cookie 'cookie-name'.");
        });
        it("Sets cookie", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            let _cookie = new Cookie("cookie-name", "cookie-value");
            await _context.setCookie(_cookie);
            assert.deepStrictEqual(await _context.getCookie("cookie-name"), _cookie, "Expected cookie 'cookie-name'.");
        });
    });
    describe("Sending", () => {
        it("Sends default 204 response", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            _context.send();
            assert.strictEqual(_azcontext.res.status, 204, "Expected status code 204.");
            assert.strictEqual(_azcontext.res.body, null, "Expected null body.");
        });
        it("Sends response+200", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();
            let _response = {code: 1234};
            _context.send(_response, 200);
            assert.strictEqual(_azcontext.res.status, 200, "Expected status code 200.");
            assert.strictEqual(_azcontext.res.body, _response, "Expected _response body.");
        });
        it("Sends response default 200", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            let _response = {code: 1234};
            _context.send(_response);
            assert.strictEqual(_azcontext.res.status, 200, "Expected status code 200.");
            assert.deepStrictEqual(_azcontext.res.body, _response, "Expected _response body.");
            assert.deepStrictEqual(_azcontext.res.headers["X-celastrina-request-uuid"], _context.requestId, "Expected request header 'X-celastrina-request-uuid' to be set.");
        });
        it("Sends validation error", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            let _response = CelastrinaValidationError.newValidationError("Invalid Message", "test.message");
            _context.sendValidationError(_response);
            assert.strictEqual(_azcontext.res.status, 400, "Expected status code 400.");
            assert.deepStrictEqual(_azcontext.res.body, {cause: null, code: 400, drop: false, message: "Invalid Message", name: "CelastrinaValidationError", tag: "test.message"}, "Expected _response body.");
        });
        it("Sends validation error, null error", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            _context.sendValidationError();
            assert.strictEqual(_azcontext.res.status, 400, "Expected status code 400.");
            assert.deepStrictEqual(_azcontext.res.body, {cause: null, code: 400, drop: false, message: "bad request", name: "CelastrinaValidationError", tag: null}, "Expected _response body.");
        });
        it("Sends redirect, body null", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            _context.sendRedirect("https://www.google.com");
            assert.strictEqual(_azcontext.res.status, 302, "Expected status code 302.");
            assert.deepStrictEqual(await _context.getResponseHeader("Location"), "https://www.google.com", "Expected location header 'https://www.google.com'.");
            assert.deepStrictEqual(_azcontext.res.body, {code: 302, url: "https://www.google.com"}, "Expected default body.");
        });
        it("Sends redirect", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            _context.sendRedirect("https://www.google.com", {code: 1234});
            assert.strictEqual(_azcontext.res.status, 302, "Expected status code 302.");
            assert.deepStrictEqual(await _context.getResponseHeader("Location"), "https://www.google.com", "Expected location header 'https://www.google.com'.");
            assert.deepStrictEqual(_azcontext.res.body, {code: 1234}, "Expected {code: 1234} body.");
        });
        it("Sends redirect forward request body", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            _azcontext.req.body = {code: 1234};
            _context.sendRedirectForwardBody("https://www.google.com");
            assert.strictEqual(_azcontext.res.status, 302, "Expected status code 302.");
            assert.deepStrictEqual(await _context.getResponseHeader("Location"), "https://www.google.com", "Expected location header 'https://www.google.com'.");
            assert.deepStrictEqual(_azcontext.res.body, {code: 1234}, "Expected {code: 1234} body.");
        });
        it("Sends server error, error null", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            let _response = CelastrinaError.newError("Internal Server Error.");
            _context.sendServerError();
            assert.strictEqual(_azcontext.res.status, 500, "Expected status code 500.");
            assert.deepStrictEqual(_azcontext.res.body, {cause: null, code: 500, drop: false, message: "Internal Server Error.", name: "CelastrinaError", tag: null}, "Expected _response body.");
        });
        it("Sends server error, error not Celastrina", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            let _response = CelastrinaError.newError("New Error");
            _context.sendServerError(new Error("New Error"));
            assert.strictEqual(_azcontext.res.status, 500, "Expected status code 500.");
            assert.deepStrictEqual(_azcontext.res.body, {cause: "New Error", code: 500, drop: false, message: "New Error", name: "CelastrinaError", tag: null}, "Expected _response body.");
        });
        it("Sends server error, error Celastrina", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            _context.sendServerError(CelastrinaError.newError("New Error"));
            assert.strictEqual(_azcontext.res.status, 500, "Expected status code 500.");
            assert.deepStrictEqual(_azcontext.res.body, {cause: null, code: 500, drop: false, message: "New Error", name: "CelastrinaError", tag: null}, "Expected _response body.");
        });
        it("Sends not authorized error, error null", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            let _response = CelastrinaError.newError("Not Authorized.", 401);
            _context.sendNotAuthorizedError();
            assert.strictEqual(_azcontext.res.status, 401, "Expected status code 401.");
            assert.deepStrictEqual(_azcontext.res.body, {cause: null, code: 401, drop: false, message: "Not Authorized.", name: "CelastrinaError", tag: null}, "Expected _response body.");
        });
        it("Sends not authorized error, error not Celastrina", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            let _response = CelastrinaError.newError("New Error", 401);
            _context.sendNotAuthorizedError(new Error("New Error"));
            assert.strictEqual(_azcontext.res.status, 401, "Expected status code 401.");
            assert.deepStrictEqual(_azcontext.res.body, {cause: "New Error", code: 401, drop: false, message: "New Error", name: "CelastrinaError", tag: null}, "Expected _response body.");
        });
        it("Sends not authorized error, error Celastrina", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            _context.sendNotAuthorizedError(CelastrinaError.newError("New Error"));
            assert.strictEqual(_azcontext.res.status, 401, "Expected status code 401.");
            assert.deepStrictEqual(_azcontext.res.body, {cause: null, code: 401, drop: false, message: "New Error", name: "CelastrinaError", tag: null}, "Expected _response body.");
        });
        it("Sends Forbidden error, error null", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            let _response = CelastrinaError.newError("Forbidden.", 403);
            _context.sendForbiddenError();
            assert.strictEqual(_azcontext.res.status, 403, "Expected status code 403.");
            assert.deepStrictEqual(_azcontext.res.body, {cause: null, code: 403, drop: false, message: "Forbidden.", name: "CelastrinaError", tag: null}, "Expected _response body.");
        });
        it("Sends Forbidden error, error not Celastrina", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            let _response = CelastrinaError.newError("New Error", 403);
            _context.sendForbiddenError(new Error("New Error"));
            assert.strictEqual(_azcontext.res.status, 403, "Expected status code 403.");
            assert.deepStrictEqual(_azcontext.res.body, {cause: "New Error", code: 403, drop: false, message: "New Error", name: "CelastrinaError", tag: null}, "Expected _response body.");
        });
        it("Sends Forbidden error, error Celastrina", async () => {
            let _azcontext = new MockAzureFunctionContext();
            _azcontext.req.method = "POST";
            _azcontext.req.originalUrl = "https://www.celastrinajs.com";
            _azcontext.req.params = {test: "test"};
            _azcontext.req.query = {param1: "test123"};
            _azcontext.req.rawBody = "{\"key1\": \"value1\"}";
            _azcontext.req.headers["header1"] = "testRequest123";
            _azcontext.req.body = {key1: "value1"};
            _azcontext.bindingData.status = {key: "value"};
            _azcontext.res.headers["header1"] = "testResponse123";
            _azcontext.res.headers["header2"] = "testResponse123";
            _azcontext.res.headers["header4"] = "testResponse789";
            _azcontext.res.body = {key2: "value2"};
            let _config = new Configuration("MockJSONHTTPContext");
            await _config.initialize(_azcontext);
            let _context = new JSONHTTPContext(_config);
            await _context.initialize();

            let _response = CelastrinaError.newError("New Error", 403);
            _context.sendForbiddenError(CelastrinaError.newError("New Error"));
            assert.strictEqual(_azcontext.res.status, 403, "Expected status code 403.");
            assert.deepStrictEqual(_azcontext.res.body, {cause: null, code: 403, drop: false, message: "New Error", name: "CelastrinaError", tag: null}, "Expected _response body.");
        });
    });
});

module.exports = {
    MockHJSONTTPContext: MockHJSONTTPContext
};

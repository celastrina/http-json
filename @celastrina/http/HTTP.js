/*
 * Copyright (c) 2021, KRI, LLC.
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
/**
 * @author Robert R Murrell
 * @copyright Robert R Murrell
 * @license MIT
 */
"use strict";
const axios  = require("axios").default;
const {v4: uuidv4} = require("uuid");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const cookie = require("cookie");
const {CelastrinaError, CelastrinaValidationError, AddOn,
       LOG_LEVEL, Configuration, Subject, Sentry, Algorithm, AES256Algorithm, Cryptography, RoleFactory,
       RoleFactoryParser, Context, BaseFunction, ValueMatch, AttributeParser, ConfigLoader, Authenticator,
       instanceOfCelastrinaType, AddOnEvent} = require("@celastrina/core");
/**
 * @typedef _AzureRequestBinging
 * @property {string} originalUrl
 * @property {string} method
 * @property {Object} query
 * @property {Object} headers
 * @property {Object} params
 * @property {Object} body
 * @property {string} rawBody
 */
/**
 * @typedef _AzureResponseBinging
 * @property {Object} headers
 * @property {number} status
 * @property {Object} body
 * @property {string} rawBody
 * @property {Array.<Object>} cookies
 */
/**
 * @typedef _AZLogger
 * @function error
 * @function warn
 * @function info
 * @function verbose
 */
/**
 * @typedef _TraceContext
 * @property {string} traceparent
 */
/**
 * @typedef _ExecutionContext
 * @property {string} invocationId
 * @property {string} functionName
 * @property {string} functionDirectory
 */
/**
 * @typedef _AzureFunctionContext
 * @property {_ExecutionContext} executionContext
 * @property {_TraceContext} traceContext
 * @property {_AZLogger} log
 * @property {Object} bindings
 * @property {_AzureRequestBinging} req
 * @property {_AzureResponseBinging} res
 * @property {Object} bindingData
 */
/**
 * @typedef _jwtpayload
 * @property {string} aud
 * @property {string} sub
 * @property {string} oid
 * @property {string} iss
 * @property {number} iat
 * @property {number} exp
 * @property {string} nonce
 */
/**
 * @typedef _jwt
 * @property {_jwtpayload} payload
 * @typedef _ClaimsPayload
 * @property {moment.Moment} issued
 * @property {moment.Moment} expires
 * @property {string} token
 * @property {string} audience
 * @property {string} subject
 * @property {string} issuer
 */
/**
 * @typedef {Object} JWKSKEY
 * @property {string} [kid]
 * @property {string} [kty]
 * @property {string} [x5c]
 * @property {string} [e]
 * @property {string} [n]
 * @property {string} [x]
 * @property {string} [y]
 * @property {string} [crv]
 */
/**
 * @typedef {Object} JWKS
 * @property {(null|string)} [issuer]
 * @property {string} type
 * @property {JWKSKEY} key
 */
/**
 * Cookie
 * @author Robert R Murrell
 */
class Cookie {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/Cookie#",
                                                      type: "celastrinajs.http.Cookie"};}
    /**
     * @param {string} name
     * @param {(null|string)} [value=null]
     * @param {Object} [options={}]
     * @param {boolean} [dirty=false]
     */
    constructor(name, value = null, options = {}, dirty = false, ) {
        if(typeof name !== "string" || name.trim().length === 0)
            throw CelastrinaValidationError.newValidationError("Invalid String. Attribute 'name' cannot be undefined, null, or zero length.", "cookie.name");
        this._name = name.trim();
        this._value = value;
        this._options = options;
        this._dirty = dirty;
    }
    /**@return{boolean}*/get doSetCookie() {return this._dirty};
    /**@return{string}*/get name() {return this._name;}
    /**@return{string}*/get parseValue() {
        if(this._value == null)
            return "";
        else
            return this._value;
    }
    /**@return{null|string}*/get value() {return this._value;}
    /**@param{null|string}value*/set value(value) {
        this._value = value;
        this._dirty = true;
    }
    /**@return{Object}*/get options() {return this._options;}
    /**@param{Object}options*/set options(options) {
        if(options == null || typeof options === "undefined")
            options = {};
        this._options = options;
        this._dirty = true;
    }
    /**
     * @param {string} name
     * @param {*} value
     */
    setOption(name, value) {
        this._options[name] = value;
        this._dirty = true;
    }
    /**
     * @returns {string}
     */
    serialize() {
        return cookie.serialize(this._name, this.parseValue, this._options);
    }
    /**
     * @return {Promise<{name: string, value: string}>}
     */
    async toAzureCookie() {
        let _obj = {name: this._name, value: this.parseValue};
        Object.assign(_obj, this._options);
        return _obj;
    }
    /**@param{number}age*/set maxAge(age) {this.setOption("maxAge", age);}
    /**@param{Date}date*/set expires(date) {this.setOption("expires", date);}
    /**@param{boolean}http*/set httpOnly(http) {this.setOption("httpOnly", http);}
    /**@param{string}domain*/set domain(domain) {this.setOption("domain", domain);}
    /**@param{string}path*/set path(path) {this.setOption("path", path);}
    /**@param{boolean}secure*/set secure(secure) {this.setOption("secure", secure);}
    /**@param("lax"|"none"|"strict")value*/set sameSite(value) {this.setOption("sameSite", value)};
    /**@return{number}*/get maxAge() {return this._options["maxAge"];}
    /**@return{Date}*/get expires() {return this._options["expires"];}
    /**@return{boolean}*/get httpOnly() {return this._options["httpOnly"];}
    /**@return{string}*/get domain() {return this._options["domain"];}
    /**@return{string}*/get path() {return this._options["path"];}
    /**@return{boolean}*/get secure() {return this._options["secure"];}
    /**@return("lax"|"none"|"strict")*/get sameSite() {return this._options["sameSite"];};
    /**@param {string} value*/encodeStringToValue(value) {this.value = Buffer.from(value).toString("base64");}
    /**@param {Object} _object*/encodeObjectToValue(_object) {this.encodeStringToValue(JSON.stringify(_object));}
    /**@return{string}*/decodeStringFromValue() {return Buffer.from(this.value).toString("ascii");}
    /**@return{any}*/decodeObjectFromValue() {return JSON.parse(this.decodeStringFromValue());}
    delete() {
        this.value = null;
        let _epoch = moment("1970-01-01T00:00:00Z");
        this.expires = _epoch.utc().toDate();
    }
    /**
     * @param {string} name
     * @param {(null|string)} [value=null]
     * @param {Object} [options={}]
     * @returns {Cookie} A new cookie whos dirty marker is set to 'true', such that doSerializeCookie will generte a
     *     value to the Set-Cookie header.
     */
    static newCookie(name, value = null, options = {}) {
        return new Cookie(name, value, options, true);
    }
    /**
     * @param {string} name
     * @param {(null|string)} [value=null]
     * @param {Object} [options={}]
     * @returns {Promise<Cookie>} A new cookie whos dirty marker is set to 'false', such that doSerializeCookie will
     *     NOT generte a value to the Set-Cookie header.
     */
    static async loadCookie(name, value = null, options = {}) {
        return new Cookie(name, value, options);
    }
    /**
     * @param {string} value
     * @param {Array.<Cookie>} [results=[]];
     * @returns {Promise<Array.<Cookie>>} A new cookie whos dirty marker is set to 'false', such that doSerializeCookie
     *     will NOT generte a value to the Set-Cookie header.
     */
    static async parseCookies(value,results = []) {
        let _cookies = cookie.parse(value);
        for(let _name in _cookies) {
            if(_cookies.hasOwnProperty(_name)) {
                results.unshift(new Cookie(_name, _cookies[_name]));
            }
        }
        return results;
    }
}
/**
 * JwtSubject
 * @author Robert R murrell
 */
class JwtSubject {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/JwtSubject#",
                                                      type: "celastrinajs.http.JwtSubject"};}
    static PROP_JWT_HEADER = "celastrinajs.jwt.header";
    static PROP_JWT_SIGNATURE = "celastrinajs.jwt.signature";
    static PROP_JWT_NONCE = "nonce";
    static PROP_JWT_TOKEN = "celastrinajs.jwt";
    static PROP_JWT_AUD = "aud";
    static PROP_JWT_ISS = "iss";
    static PROP_JWT_ISSUED = "iat";
    static PROP_JWT_NOTBEFORE = "nbf";
    static PROP_JWT_EXP = "exp";
    /**
     * @param {Subject} subject
     */
    constructor(subject) {
        /**@type{Subject}*/this._subject = subject
    }
    /**@return{Subject}*/get subject() {return this._subject;}
    /**@return{Object}*/get header() {return this._subject.getClaimSync(JwtSubject.PROP_JWT_HEADER);}
    /**@return{Object}*/get signature() {return this._subject.getClaimSync(JwtSubject.PROP_JWT_SIGNATURE);}
    /**@return{string}*/get token() {return this._subject.getClaimSync(JwtSubject.PROP_JWT_TOKEN);}
    /**@return{string}*/get nonce(){return this._subject.getClaimSync(JwtSubject.PROP_JWT_NONCE);}
    /**@return{string}*/get audience() {return this._subject.getClaimSync(JwtSubject.PROP_JWT_AUD);}
    /**@return{string}*/get issuer(){return this._subject.getClaimSync(JwtSubject.PROP_JWT_ISS);}
    /**@return{moment.Moment}*/get issued(){return moment.unix(this._subject.getClaimSync(JwtSubject.PROP_JWT_ISSUED));}
    /**@return{moment.Moment}*/get notBefore(){ //optional payload so we must check.
        let _nbf = this._subject.getClaimSync(JwtSubject.PROP_JWT_NOTBEFORE);
        if(_nbf != null) _nbf = moment.unix(_nbf);
        return _nbf;
    }
    /**@return{moment.Moment}*/get expires(){return moment.unix(this._subject.getClaimSync(JwtSubject.PROP_JWT_EXP));}
    /**@return{boolean}*/get expired(){ return moment().isSameOrAfter(this.expires);}
    /**
     * @param {undefined|null|object}headers
     * @param {string}[name="Authorization]
     * @param {string}[scheme="Bearer "]
     * @return {Promise<object>}
     */
    async setAuthorizationHeader(headers, name = "Authorization", scheme = "Bearer ") {
        if(typeof headers === "undefined" || headers == null) headers = {};
        headers[name] = scheme + this._subject.getClaimSync(JwtSubject.PROP_JWT_TOKEN);
        return headers;
    }
    /**
     * @param {string}name
     * @param {null|string}defaultValue
     * @return {Promise<number|string|Array.<string>>}
     */
    async getHeader(name, defaultValue = null) {
        let header = this.header[name];
        if(typeof header === "undefined" || header == null) header = defaultValue;
        return header;
    }
    /**
     * @param {Subject} subject
     * @param {string} token
     * @return {Promise<JwtSubject>}
     */
    static async decode(subject, token) {return JwtSubject.decodeSync(subject, token);}
    /**
     * @param {Subject} subject
     * @param {string} token
     * @return {JwtSubject}
     */
    static decodeSync(subject, token) {
        if(typeof token !== "string" || token.trim().length === 0)
            throw CelastrinaError.newError("Not Authorized.", 401);
        /** @type {null|Object} */let decoded = /** @type {null|Object} */jwt.decode(token, {complete: true});
        if(typeof decoded === "undefined" || decoded == null)
            throw CelastrinaError.newError("Not Authorized.", 401);
        subject.addClaims(decoded.payload);
        subject.addClaim(JwtSubject.PROP_JWT_HEADER, decoded.header);
        subject.addClaim(JwtSubject.PROP_JWT_SIGNATURE, decoded.signature);
        subject.addClaim(JwtSubject.PROP_JWT_TOKEN, token);
        return new JwtSubject(subject);
    }
    /**
     * @param {Subject} subject
     * @param {Object} decoded
     * @param {String} token
     * @return {Promise<JwtSubject>}
     */
    static async wrap(subject, decoded, token) {
        subject.addClaims(decoded.payload);
        subject.addClaim(JwtSubject.PROP_JWT_HEADER, decoded.header);
        subject.addClaim(JwtSubject.PROP_JWT_SIGNATURE, decoded.signature);
        subject.addClaim(JwtSubject.PROP_JWT_TOKEN, token);
        return new JwtSubject(subject);
    }
}

/**
 * Issuer
 * @abstract
 * @author Robert R Murrell
 */
class Issuer {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/Issuer#",
                                                      type: "celastrinajs.http.Issuer"};}
    /**
     * @param {null|string} issuer
     * @param {(Array.<string>|null)} [audiences=null]
     * @param {(Array.<string>|null)} [assignments=[]] The role assignments to escalate the subject to if the JWT token
     *     is valid for this issuer.
     * @param {boolean} [validateNonce=false]
     */
    constructor(issuer = null, audiences = null, assignments = null,
                validateNonce = false) {
        this._issuer = issuer;
        this._audiences = audiences;
        this._assignments = assignments;
        this._validateNonce = validateNonce;
    }
    /**@return{string}*/get issuer(){return this._issuer;}
    /**@param{string}issuer*/set issuer(issuer){this._issuer = issuer;}
    /**@return{Array.<string>}*/get audiences(){return this._audiences;}
    /**@param{Array.<string>}audience*/set audiences(audience){this._audiences = audience;}
    /**@return{Array<string>}*/get assignments(){return this._assignments;}
    /**@param{Array<string>}assignments*/set assignments(assignments){this._assignments = assignments;}
    /**@return{boolean}*/get validateNonce() {return this._validateNonce;}
    /**@param{boolean}validate*/set validateNonce(validate) {return this._validateNonce = validate;}
    /**
     * @param {HTTPContext} context
     * @param {JwtSubject} subject
     * @return {Promise<*>}
     * @abstract
     */
    async getKey(context, subject) {throw CelastrinaError.newError("Not Implemented", 501);}
    /**
     * @param {HTTPContext} context
     * @param {JwtSubject} subject
     * @return {Promise<(null|string)>}
     */
    async getNonce(context, subject) {return null;}
    /**
     * @param {HTTPContext} context
     * @param {JwtSubject} _jwt
     * @return {Promise<{verified:boolean,assignments?:(null|Array<string>)}>}
     */
    async verify(context, _jwt) {
        if(_jwt.issuer === this._issuer) {
            try {
                let decoded = jwt.verify(_jwt.token, await this.getKey(context, _jwt), {algorithm: "RSA"});
                if(typeof decoded === "undefined" || decoded == null) {
                    context.log("Failed to verify token.", LOG_LEVEL.THREAT,
                        "Issuer.verify(context, _jwt)");
                    return {verified: false};
                }
                if(this._audiences != null) {
                    if(!this._audiences.includes(_jwt.audience)) {
                        context.log("Subject '" + _jwt.subject.id + "' with audience '" + _jwt.audience +
                                     "' failed to match audiences.", LOG_LEVEL.THREAT, "Issuer.verify(context, _jwt)");
                        return {verified: false};
                    }
                }
                if(this._validateNonce) {
                    let nonce = await this.getNonce(context, _jwt);
                    if(typeof nonce === "string" && nonce.trim().length > 0) {
                        if(_jwt.nonce !== nonce) {
                            context.log("Subject '" + _jwt.subject.id + "' failed to pass nonce validation.", LOG_LEVEL.THREAT,
                                        "Issuer.verify(context, _jwt)");
                            return {verified: false};
                        }
                    }
                }
                return {verified: true, assignments: this._assignments};
            }
            catch(exception) {
                context.log("Exception authenticating JWT: " + exception, LOG_LEVEL.THREAT,
                            "Issuer.verify(context, _jwt)");
                return {verified: false};
            }
        }
        else return {verified: false};
    }
}
/**
 * LocalJwtIssuer
 * @author Robert R Murrell
 */
class LocalJwtIssuer extends Issuer {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/LocalJwtIssuer#",
                                                      type: "celastrinajs.http.LocalJwtIssuer"};}
    /**
     * @param {(null|string)} issuer
     * @param {(null|string)} key
     * @param {(Array.<string>|null)} [audiences=null]
     * @param {(Array.<string>|null)} [assignments=[]] The role assignments to escalate the subject to if the JWT token
     *     is valid for this issuer.
     * @param {boolean} [validateNonce=false]
     */
    constructor(issuer = null, key = null, audiences = null,
                assignments = null, validateNonce = false) {
        super(issuer, audiences, assignments, validateNonce);
        this._key = key;
    }
    /**
     * @param {HTTPContext} context
     * @param {JwtSubject} subject
     * @return {Promise<*>}
     */
    async getKey(context, subject) {
        return this._key;
    }
    /**@return{string}*/get key() {return this._key;}
    /**@param{string}key*/set key(key) {this._key = key;}
}
/**
 * OpenIDJwtValidator
 * @description Use the following OpenID IDP's for  OpenIDJwtValidator
 *              <ul>
 *                  <li>Microsoft Azure AD IDP:
 *     https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration</li>
 *                  <li>Microsoft Azure ADB2C IDP: https://[tenant name].b2clogin.com/[tenant
 *     name].onmicrosoft.com/{claim[tfp]}/v2.0/.well-known/openid-configuration</li>
 *              </ul>
 *              All values in curly-brace {} will be replaced with a value from the claim name {claim} in the decoded
 *     JWT.
 * @author Robert R Murrell
 */
class OpenIDJwtIssuer extends Issuer {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/OpenIDJwtIssuer#",
                                                      type: "celastrinajs.http.OpenIDJwtIssuer"};}
    /**
     * @param {null|string} issuer
     * @param {null|string} configUrl
     * @param {(Array.<string>|null)} [audiences=null]
     * @param {(Array.<string>|null)} [assignments=[]] The role assignments to escalate the subject to if the JWT token
     *     is valid for this issuer.
     * @param {boolean} [validateNonce=false]
     */
    constructor(issuer = null, configUrl = null, audiences = null,
                assignments = null, validateNonce = false) {
        super(issuer, audiences, assignments, validateNonce);
        this._configUrl = configUrl;
    }
    get configURL() {return this._configUrl;}
    set configURL(url) {this._configUrl = url;}
    /**
     * @param {HTTPContext} context
     * @param {JwtSubject} _jwt
     * @param {string} url
     * @return {Promise<string>}
     */
    static async _replaceURLEndpoint(context, _jwt, url) {
        /**@type {RegExp}*/let regex = RegExp(/{([^}]*)}/g);
        let match;
        let matches = new Set();
        while((match = regex.exec(url)) !== null) {
            matches.add(match[1]);
        }
        for(const match of matches) {
            let value = _jwt.subject.getClaimSync(match);
            if(value == null) {
                context.log("Claim '" + match + "' not found for subject '" + _jwt.subject.id + "' while building OpenID configuration URL.",
                                    LOG_LEVEL.THREAT, "OpenIDJwtIssuer._replaceURLEndpoint(context, _jwt, url)");
                throw CelastrinaError.newError("Not Authorized.", 401);
            }
            if(Array.isArray(value)) value = value[0];
            url = url.split("{" + match + "}").join(/**@type{string}*/value);
        }
        return url;
    }
    /**
     * @param {HTTPContext} context
     * @param {JwtSubject} _jwt
     * @param {string} configUrl
     * @return {Promise<(null|JWKS)>}
     * @private
     */
    static async _getKey(context, _jwt, configUrl) {
        let _endpoint = await OpenIDJwtIssuer._replaceURLEndpoint(context, _jwt, configUrl);
        try {
            let _response = await axios.get(_endpoint);
            let _issuer = _response.data["issuer"];
            _endpoint = _response.data["jwks_uri"];
            _response = await axios.get(_endpoint);
            /**@type{(null|JWKS)}*/let _key = null;
            for (const key of _response.data.keys) {
                if(key.kid === _jwt.header.kid) {
                    _key = {issuer: _issuer, type: key.kty, key: key};
                    break;
                }
            }
            return _key;
        }
        catch(exception) {
            context.log("Exception getting OpenID configuration for subject " + _jwt.subject.id + ": " + exception,
                                LOG_LEVEL.ERROR, "OpenIDJwtIssuer._getKey(subject, context)");
            CelastrinaError.newError("Exception authenticating user.", 401);
        }
    }
    /**
     * @param {(null|JWKS)} key
     * @param {HTTPContext} context
     * @return {Promise<string>}
     * @private
     */
    async _getPemX5C(key, context) {
        return "-----BEGIN PUBLIC KEY-----\n" + key.key.x5c + "\n-----END PUBLIC KEY-----\n";
    }
    /**
     * @param {HTTPContext} context
     * @param {JwtSubject} _jwt
     * @return {Promise<void>}
     * @private
     */
    async getKey(context, _jwt) {
        /**@type{(null|JWKS)}*/let key = await OpenIDJwtIssuer._getKey(context, _jwt, this._configUrl);
        let pem;
        if(typeof key.key.x5c === "undefined" || key.key.x5c == null)
            pem = jwkToPem(key.key);
        else
            pem = await this._getPemX5C(key, context);
        return pem;
    }
}
/**
 * IssuerParser
 * @author Robert R Murrell
 * @abstract
 */
class IssuerParser extends AttributeParser {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/IssuerParser#",
                                                      type: "celastrinajs.http.IssuerParser"};}
    /**
     * @param {AttributeParser} [link=null]
     * @param {string} [type="Object"]
     * @param {string} [version="1.0.0"]
     */
    constructor(link = null, type = "BaseIssuer", version = "1.0.0") {
        super(type, link, version);
    }
    /**
     * @param {Object} _Issuer
     * @param {Issuer} _issuer
     */
    _loadIssuer(_Issuer, _issuer) {
        if(!(_Issuer.hasOwnProperty("issuer")) || (typeof _Issuer.issuer !== "string") || _Issuer.issuer.trim().length === 0)
            throw CelastrinaValidationError.newValidationError(
                "[IssuerParser._loadIssuer(_Issuer, _issuer)][_Issuer.issuer]: Issuer cannot be null, undefined, or empty.", "_Issuer.issuer");
        if(!(_Issuer.hasOwnProperty("audiences")) || !(Array.isArray(_Issuer.audiences)) || _Issuer.audiences.length === 0)
            throw CelastrinaValidationError.newValidationError(
                "[IssuerParser._loadIssuer(_Issuer, _issuer)][_Issuer.audiences]: Audiences cannot be null.", "_Issuer.audiences");
        let assignments = [];
        if((_Issuer.hasOwnProperty("assignments")) && (Array.isArray(_Issuer.assignments)) && _Issuer.assignments.length > 0)
            assignments = _Issuer.assignments;
        let _validate = false;
        if(_Issuer.hasOwnProperty("validateNonce") && (typeof _Issuer.validateNonce === "boolean"))
            _validate = _Issuer.validateNonce;
        _issuer.issuer = _Issuer.issuer.trim();
        _issuer.audiences = _Issuer.audiences;
        _issuer.assignments = assignments;
        _issuer.validateNonce = _validate;
    }
}
/**
 * LocalJwtIssuerParser
 * @author Robert R Murrell
 */
class LocalJwtIssuerParser extends IssuerParser {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/LocalJwtIssuerParser#",
                                                      type: "celastrinajs.http.LocalJwtIssuerParser"};}
    /**
     * @param {AttributeParser} [link=null]
     * @param {string} [version="1.0.0"]
     */
    constructor(link = null, version = "1.0.0") {
        super(link, "LocalJwtIssuer", version);
    }
    /**
     * @param {Object} _LocalJwtIssuer
     * @param {PropertyManager} pm
     * @return {Promise<LocalJwtIssuer>}
     * @private
     */
    async _create(_LocalJwtIssuer, pm) {
        let _issuer = new LocalJwtIssuer();
        await this._loadIssuer(_LocalJwtIssuer, _issuer);
        if(!(_LocalJwtIssuer.hasOwnProperty("key")) || (typeof _LocalJwtIssuer.key !== "string") ||  _LocalJwtIssuer.key.trim().length === 0)
            throw CelastrinaValidationError.newValidationError(
                "[LocalJwtIssuerParser._create(_LocalJwtIssuer)][_LocalJwtIssuer.key]: ",
                    "_LocalJwtIssuer.key");
        _issuer.key = _LocalJwtIssuer.key.trim();
        return _issuer;
    }
}
/**
 * LocalJwtIssuerParser
 * @author Robert R Murrell
 */
class OpenIDJwtIssuerParser extends IssuerParser {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/OpenIDJwtIssuerParser#",
                                                      type: "celastrinajs.http.OpenIDJwtIssuerParser"};}
    /**
     * @param {AttributeParser} [link=null]
     * @param {string} [version="1.0.0"]
     */
    constructor(link = null, version = "1.0.0") {
        super(link, "OpenIDJwtIssuer", version);
    }
    /**
     * @param {Object} _OpenIDJwtIssuer
     * @param {PropertyManager} pm
     * @return {Promise<OpenIDJwtIssuer>}
     * @private
     */
    async _create(_OpenIDJwtIssuer, pm) {
        let _issuer = new OpenIDJwtIssuer();
        await this._loadIssuer(_OpenIDJwtIssuer, _issuer);
        if(!(_OpenIDJwtIssuer.hasOwnProperty("configURL")) || (typeof _OpenIDJwtIssuer.configURL !== "string") ||  _OpenIDJwtIssuer.configURL.trim().length === 0)
            throw CelastrinaValidationError.newValidationError(
                "[OpenIDJwtIssuerParser._create(_OpenIDJwtIssuer)][_OpenIDJwtIssuer.configURL]: configURL cannot be null or empty.",
                    "_OpenIDJwtIssuer.configURL");
        _issuer.configURL = _OpenIDJwtIssuer.configURL.trim();
        return _issuer;
    }
}
/**
 * HTTPParameter
 * @abstract
 * @author Robert R Murrell
 */
class HTTPParameter {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/HTTPParameter#",
                                                      type: "celastrinajs.http.HTTPParameter"};}
    /**
     * @param{string}[type]
     * @param{boolean}[readOnly]
     */
    constructor(type = "HTTPParameter", readOnly = false) {
        this._type = type;
        this._readOnly = readOnly
    }
    /**@return{string}*/get type() {return this._type;}
    /**@return{boolean}*/get readOnly() {return this._readOnly;}
    /**
     * @param {HTTPContext} context
     * @param {string} key
     * @return {*}
     * @abstract
     */
    async _getParameter(context, key) {
        throw CelastrinaError.newError("Not Implemented.", 501);
    }
    /**
     * @param {HTTPContext} context
     * @param {string} key
     * @param {*} [defaultValue]
     * @return {Promise<*>}
     */
    async getParameter(context, key, defaultValue = null) {
        let _value = await this._getParameter(context, key);
        if(typeof _value === "undefined" || _value == null) _value = defaultValue;
        return _value;
    }
    /**
     * @param {HTTPContext} context
     * @param {string} key
     * @param {*} [value = null]
     * @abstract
     */
    async _setParameter(context, key, value = null) {}
    /**
     * @param {HTTPContext} context
     * @param {string} key
     * @param {*} [value = null]
     * @return {Promise<void>}
     */
    async setParameter(context, key, value = null) {
        if(this._readOnly)
            throw CelastrinaError.newError("Set Parameter not supported.");
        await this._setParameter(context, key, value);
    }
}
/**
 * HeaderParameter
 * @author Robert R Murrell
 */
class HeaderParameter extends HTTPParameter {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/HeaderParameter#",
                                                      type: "celastrinajs.http.HeaderParameter"};}
    constructor(type = "header"){super(type);}
    /**
     * @param {HTTPContext} context
     * @param {string} key
     * @return {(null|string)}
     */
    async _getParameter(context, key) {
        return context.getRequestHeader(key);
    }
    /**
     * @param {HTTPContext} context
     * @param {string} key
     * @param {(null|string)} [value = null]
     */
    async _setParameter(context, key, value = null) {
        await context.setResponseHeader(key, value);
    }
}
/**
 * CookieParameter
 * @author Robert R Murrell
 */
class CookieParameter extends HTTPParameter {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/CookieParameter#",
                                                      type: "celastrinajs.http.CookieParameter"};}
    constructor(type = "cookie"){super(type);}
    /**
     * @param {HTTPContext} context
     * @param {string} key
     * @return {Cookie}
     */
    async _getParameter(context, key) {
        let cookie = await context.getCookie(key, null);
        if(cookie != null) cookie = cookie.value;
        return cookie;
    }
    /**
     * @param {HTTPContext} context
     * @param {string} key
     * @param {null|string} [value = null]
     */
    async _setParameter(context, key, value = null) {
        let cookie = await context.getCookie(key, null);
        if(cookie == null)
            cookie = Cookie.newCookie(key, value);
        else
            cookie.value = value;
        await context.setCookie(cookie);
    }
}
/**
 * QueryParameter
 * @author Robert R Murrell
 */
class QueryParameter extends HTTPParameter {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/QueryParameter#",
                                                      type: "celastrinajs.http.QueryParameter"};}
    constructor(type = "query"){super(type, true);}
    /**
     * @param {HTTPContext} context
     * @param {string} key
     * @return {(null|string)}
     */
    async _getParameter(context, key) {
        return context.getQuery(key);
    }
    /**
     * @param {HTTPContext} context
     * @param {string} key
     * @param {(null|string)} [value = null]
     */
    async _setParameter(context, key, value = null) {
        throw CelastrinaError.newError("QueryParameter.setParameter not supported.", 501);
    }
}
/**
 * BodyParameter
 * @author Robert R Murrell
 */
class BodyParameter extends HTTPParameter {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/BodyParameter#",
                                                      type: "celastrinajs.http.BodyParameter"};}
    constructor(type = "body"){super(type);}
    /**
     * @param {HTTPContext} context
     * @param {string} key
     * @return {*}
     */
    async _getParameter(context, key) {
        let _value = context.requestBody;
        /**@type{Array<string>}*/let _attrs = key.split(".");
        for(const _attr of _attrs) {
            _value = _value[_attr];
        }
        return _value;
    }
    /**
     * @param {HTTPContext} context
     * @param {string} key
     * @param {*} [value = null]
     */
    async _setParameter(context, key, value = null) {
        let _value = context.responseBody;
        /**@type{Array<string>}*/let _attrs = key.trim().split(".");
        for(let idx = 0; idx < _attrs.length - 2; ++idx) {
            _value = _value[_attrs[idx]];
            if(typeof _value === "undefined" || _value == null)
                throw CelastrinaError.newError("Invalid object path '" + key + "'.");
        }
        _value[_attrs[_attrs.length - 1]] = value;
    }
}
/**
 * HTTPParameterParser
 * @author Robert R Murrell
 */
class HTTPParameterParser extends AttributeParser {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/HTTPParameterParser#",
                                                      type: "celastrinajs.http.HTTPParameterParser"};}
    /**
     * @param {AttributeParser} [link=null]
     * @param {string} [version="1.0.0"]
     */
    constructor(link = null, version = "1.0.0") {
        super("HTTPParameter", link, version);
    }
    /**
     * @param {Object} _HTTPParameter
     * @param {PropertyManager} pm
     * @return {Promise<HTTPParameter>}
     */
    async _create(_HTTPParameter, pm) {
        let _parameter = "header";
        if(_HTTPParameter.hasOwnProperty("parameter") && (typeof _HTTPParameter.parameter === "string") &&
                _HTTPParameter.parameter.trim().length > 0)
            _parameter = _HTTPParameter.parameter.trim();
        return HTTPParameterParser.createHTTPParameter(_parameter);
    }
    /**
     * @param {string} type
     * @return {HTTPParameter}
     */
    static createHTTPParameter(type) {
        switch(type) {
            case "header":
                return new HeaderParameter();
            case "cookie":
                return new CookieParameter();
            case "query":
                return new QueryParameter();
            case "body":
                return new BodyParameter();
            default:
                throw CelastrinaValidationError.newValidationError(
                    "[HTTPParameterParser.getHTTPParameter(type)][type]: '" + type + "' is not supported.",
                    "type");
        }
    }
}
/**
 * Session
 * @author Robert R Murrell
 */
class Session {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/Session#",
                                                      type: "celastrinajs.http.Session"};}
    /**
     * @param {Object} [values = {}]
     * @param {boolean} [isNew = false]
     * @param {(null|string)} [id = null]
     */
    constructor(values = {}, isNew = false, id = uuidv4()) {
        if(typeof values.id === "undefined" || values.id == null) values.id = id;
        this._values = values;
        /**@type{boolean}*/this._dirty = isNew;
        /**@type{boolean}*/this._new = isNew;
    }
    /**@return{string}*/get id() {return this._values.id;}
    /**@return{boolean}*/get isNew() {return this._new;}
    /**
     * @param {string} name
     * @param {*} defaultValue
     * @return {Promise<*>}
     */
    async getProperty(name, defaultValue = null) {
        let _value = this._values[name];
        if(typeof _value === "undefined" || _value == null)
            return defaultValue;
        else
            return _value;
    }
    /**
     * @param {string} name
     * @param {*} value
     * @return {Promise<void>}
     */
    async setProperty(name, value) {
        this._values[name] = value;
        this._dirty = true;
    }
    /**
     * @param {string} name
     * @return {Promise<void>}
     */
    async deleteProperty(name) {delete this._values[name]; this._dirty = true;}
    /**@type{boolean}*/get doWriteSession() {return this._dirty;}
    /**
     * @param {Object} values
     */
    static load(values) {
        return new Session(values);
    }
}
/**
 * SessionManager
 * @author Robert R Murrell
 */
class SessionManager {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/SessionManager#",
                                                      type: "celastrinajs.http.SessionManager"};}
    /**
     * @param {HTTPParameter} parameter
     * @param {string} [name = "celastrinajs_session"]
     * @param {boolean} [createNew = true]
     */
    constructor(parameter, name = "celastrinajs_session", createNew = true) {
        if(typeof parameter === "undefined" || parameter == null)
            throw CelastrinaValidationError.newValidationError("Argument 'parameter' cannot be null.", "parameter");
        if(typeof name !== "string" || name.trim().length === 0)
            throw CelastrinaValidationError.newValidationError("Argument 'name' cannot be null or empty.", "name");
        this._parameter = parameter;
        this._name = name.trim();
        this._createNew = createNew;
    }
    /**@return{HTTPParameter}*/get parameter() {return this._parameter;}
    /**@return{string}*/get name() {return this._name;}
    /**@return{boolean}*/get createNew() {return this._createNew;}
    /**
     * @param azcontext
     * @param {Object} config
     * @return {Promise<void>}
     */
    async initialize(azcontext, config) {}
    /**
     * @return {Promise<Session>}
     */
    async newSession() {this._session = new Session({}, true); return this._session;}
    /**
     * @param {*} session
     * @param {HTTPContext} context
     * @return {(null|string)}
     */
    async _loadSession(session, context) {return session;}
    /**
     * @param {HTTPContext} context
     * @return {Promise<Session>}
     */
    async loadSession(context) {
        let _session = await this._parameter.getParameter(context, this._name);
        if((typeof _session === "undefined" || _session == null)) {
            if(this._createNew)
                _session = this.newSession();
            else
                return null;
        }
        else {
            /**@type{string}*/let _obj = await this._loadSession(_session, context);
            if(typeof _obj == "undefined" || _obj == null || _obj.trim().length === 0) {
                if(this._createNew)
                    _session = await this.newSession();
                else
                    return null;
            }
            else
                _session = Session.load(JSON.parse(_obj));
        }
        return _session;
    }
    /**
     * @param {string} session
     * @param {HTTPContext} context
     * @return {(null|string)}
     */
    async _saveSession(session, context) {return session;}
    /**
     * @param {Session} [session = null]
     * @param {HTTPContext} context
     * @return {Promise<void>}
     */
    async saveSession(session = null, context) {
        if(instanceOfCelastrinaType(Session, session)) {
            if(session.doWriteSession && !this._parameter.readOnly)
                await this._parameter.setParameter(context, this._name, await this._saveSession(JSON.stringify(session), context));
        }
    }
}
/**
 * SecureSessionManager
 * @author Robert R Murrell
 */
class SecureSessionManager extends SessionManager {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/SecureSessionManager#",
                                                      type: "celastrinajs.http.SecureSessionManager"};}
    /**
     * @param {Algorithm} algorithm
     * @param {HTTPParameter} parameter
     * @param {string} [name = "celastrinajs_session"]
     * @param {boolean} [createNew = true]
     */
    constructor(algorithm, parameter, name = "celastrinajs_session", createNew = true) {
        super(parameter, name, createNew);
        this._crypto = new Cryptography(algorithm);
    }
    /**@return{Cryptography}*/get cryptography() {return this._crypto;}
    /**
     * @param azcontext
     * @param {Object} config
     * @return {Promise<void>}
     */
    async initialize(azcontext, config) {
        await super.initialize(azcontext, config);
        await this._crypto.initialize();
    }
    /**
     * @param {*} session
     * @param {HTTPContext} context
     * @return {(null|string)}
     */
    async _loadSession(session, context) {
        return this._crypto.decrypt(session);
    }
    /**
     * @param {string} session
     * @param {HTTPContext} context
     * @return {(null|string)}
     */
    async _saveSession(session, context) {
        return this._crypto.encrypt(session);
    }
}
/**
 * AESSessionManager
 * @author Robert R Murrell
 */
class AESSessionManager extends SecureSessionManager {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/AESSessionManager#",
                                                      type: "celastrinajs.http.AESSessionManager"};}
    /**
     * @param {(undefined|null|{key:string,iv:string})} options
     * @param {HTTPParameter} parameter
     * @param {string} [name = "celastrinajs_session"]
     * @param {boolean} [createNew = true]
     */
    constructor(options, parameter, name = "celastrinajs_session",
                createNew = true) {
        if(typeof options === "undefined" || options == null)
            throw CelastrinaValidationError.newValidationError(
                "Argement 'options' cannot be undefined or null", "options");
        if(typeof options.key !== "string" || options.key.trim().length === 0)
            throw CelastrinaValidationError.newValidationError(
                "Argement 'key' cannot be undefined, null or zero length.", "options.key");
        if(typeof options.iv !== "string" || options.iv.trim().length === 0)
            throw CelastrinaValidationError.newValidationError(
                "Argement 'iv' cannot be undefined, null or zero length.", "options.iv");
        super(AES256Algorithm.create(options), parameter, name, createNew);
    }
}
/**
 * SessionRoleFactory
 * @author Robert R Murrell
 */
class SessionRoleFactory extends RoleFactory {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/SessionRoleFactory#",
                                                      type: "celastrinajs.http.SessionRoleFactory"};}
    /**
     * @param {string} [key="roles"]
     */
    constructor(key = "roles") {
        super();
        this._key = key;
    }
    /**@return{string}*/get key() {return this._key;}
    /**
     * @param {Context|HTTPContext} context
     * @param {Subject} subject
     * @return {Promise<Array.<string>>}
     */
    async getSubjectRoles(context, subject) {
        let _roles = await context.session.getProperty(this._key, []);
        if(!Array.isArray(_roles)) throw CelastrinaError.newError("Invalid role assignments for session key '" + this._key + "'.");
        return _roles;
    }
}
/**
 * SessionRoleFactoryParser
 * @author Robert R Murrell
 */
class SessionRoleFactoryParser extends RoleFactoryParser {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/SessionRoleFactoryParser#",
                                                      type: "celastrinajs.http.SessionRoleFactoryParser"};}
    /**
     * @param {AttributeParser} link
     * @param {string} version
     */
    constructor(link = null, version = "1.0.0") {
        super(link, "SessionRoleFactory", version);
    }
    /**
     * @param {Object} _SessionRoleFactory
     * @param {PropertyManager} pm
     * @return {Promise<SessionRoleFactory>}
     */
    async _create(_SessionRoleFactory, pm) {
        let _key = "roles";
        if(_SessionRoleFactory.hasOwnProperty("key") && (typeof _SessionRoleFactory.key === "string"))
            _key = _SessionRoleFactory.key;
        return new SessionRoleFactory(_key);
    }
}
/**
 * AESSessionManagerParser
 * @author Robert R Murrell
 */
class AESSessionManagerParser extends AttributeParser {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/AESSessionManagerParser#",
                                                      type: "celastrinajs.http.AESSessionManagerParser"};}
    /**
     * @param {AttributeParser} [link=null]
     * @param {string} [version="1.0.0"]
     */
    constructor(link = null, version = "1.0.0") {
        super("AESSessionManager", link, version);
    }
    /**
     * @param {Object} _AESSessionManager
     * @param {PropertyManager} pm
     * @return {Promise<AESSessionManager>}
     */
    async _create(_AESSessionManager, pm) {
        let _paramtype = "cookie";
        let _paramname = "celastrinajs_session";
        if(_AESSessionManager.hasOwnProperty("parameter") && (typeof _AESSessionManager.parameter === "string"))
            _paramtype = _AESSessionManager.parameter;
        if(_AESSessionManager.hasOwnProperty("name") && (typeof _AESSessionManager.name === "string"))
            _paramname = _AESSessionManager.name;
        let _createnew = true;
        if(_AESSessionManager.hasOwnProperty("createNew") && (typeof _AESSessionManager.createNew === "boolean"))
            _createnew = _AESSessionManager.createNew;
        let _options = null;
        if(_AESSessionManager.hasOwnProperty("options") && (typeof _AESSessionManager.options === "object") &&
                _AESSessionManager.options != null)
            _options = _AESSessionManager.options;
        else {
            throw CelastrinaValidationError.newValidationError(
                "[AESSessionManagerParser._create(_AESSessionManager)][AESSessionManager.options]: Argument 'optiosn' cannot be null or undefined.",
                "AESSessionManager.options");
        }
        if(!(_options.hasOwnProperty("iv")) || (typeof _options.iv !== "string") || _options.iv.trim().length === 0)
            throw CelastrinaValidationError.newValidationError(
                "[AESSessionManagerParser._create(_AESSessionManager)][AESSessionManager.options.iv]: Aregument 'iv' cannot be null or empty.",
                "AESSessionManager.options.iv");
        if(!(_options.hasOwnProperty("key")) || (typeof _options.key !== "string") || _options.key.trim().length === 0)
            throw CelastrinaValidationError.newValidationError(
                "[AESSessionManagerParser._create(_AESSessionManager)][AESSessionManager.options.key]: Argument 'key' cannot be null or empty.",
                "AESSessionManager.options.key");
        return new AESSessionManager(_options, HTTPParameterParser.createHTTPParameter(_paramtype), _paramname, _createnew);
    }
}
/**
 * HMAC
 * @author Robert R Murrell
 */
class HMAC {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/HMAC#",
                                                      type: "celastrinajs.http.HMAC"};}
    /**
     * @param {string} secret
     * @param {HTTPParameter} parameter
     * @param {string} name
     * @param {string} algorithm
     * @param {BinaryToTextEncoding|string} encoding
     * @param {Array<string>} assignments
     */
    constructor(secret, parameter = new HeaderParameter(), name = "x-ms-content-sha256",
                algorithm = "sha256", encoding = "hex", assignments = []) {
        this._parameter = parameter;
        this._name = name;
        this._secret = secret;
        this._algorithm = algorithm;
        /**@type{Array<string>}*/this._assignments = assignments;
        /**@type{BinaryToTextEncoding}*/this._encoding = encoding;
    }
    /**@return{string}*/get name() {return this._name;}
    /**@return{string}*/get secret() {return this._secret;}
    /**@return{string}*/get algorithm() {return this._algorithm;}
    /**@return{BinaryToTextEncoding}*/get encoding() {return this._encoding;}
    /**@return{HTTPParameter}*/get parameter() {return this._parameter;}
    /**@type{Array<string>}*/get assignments() {return this._assignments;}
    /**@param{Array<string>}assignments*/set assignments(assignments) {return this._assignments = assignments;}
}
/***
 * @typedef HTTPAddOnEvent
 * @extends AddOnEvent
 * @property {HTTPContext} context
 * @property {HTTPFunction} source
 */
/**
 * @typedef HTTPConfiguration
 * @property {{manager:SessionManager}} session
 */
/**
 * HTTPConfigurationParser
 * @author Robert R Murrell
 */
class HTTPConfigLoader extends ConfigLoader {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/HTTPConfigLoader#",
                                                      type: "celastrinajs.http.HTTPConfigLoader"};}
    /**
     * @param {ConfigLoader} [link=null]
     * @param {string} [version="1.0.0"]
     */
    constructor(link = null, version = "1.0.0") {
        super("HTTP", link, version);
    }
    /**
     * @param {Object} _Configuration
     * @param {Object} config
     * @return {Promise<*>}
     * @private
     */
    async _load(_Configuration, config) {
        if(!_Configuration.hasOwnProperty("session") || (typeof _Configuration.session !== "object") ||
                _Configuration.session == null)
            throw CelastrinaValidationError.newValidationError("Argument 'session' is required.",
                "_Configuration.session");
        if(!_Configuration.session.hasOwnProperty("manager") ||
                (!instanceOfCelastrinaType(SessionManager, _Configuration.session.manager)))
            throw CelastrinaValidationError.newValidationError("Argument 'manager' is required.",
                "_Configuration.session.manager");
        config[HTTPAddOn.CONFIG_HTTP] = _Configuration;
    }
}
/**
 * HTTPAddOn
 * @author Robert R Murrell
 */
class HTTPAddOn extends AddOn {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/HTTPAddOn#",
                                                      type: "celastrinajs.http.HTTPAddOn",
                                                      addOn: "celastrinajs.addon.http"};}
    /**@type{string}*/static CONFIG_HTTP = "celastrinajs.addon.http.config";
    constructor() {
        super([]);
        /**@type{HTTPConfiguration}*/this._httpconfig = {
            session: {manager: null}
        };
    }
    /**@return {ConfigLoader}*/getConfigLoader() {
        return new HTTPConfigLoader();
    }
    /**@return {AttributeParser}*/getAttributeParser() {
        return new AESSessionManagerParser(new SessionRoleFactoryParser(new HTTPParameterParser()));
    }
    /**@return{SessionManager}*/get sessionManager() {return this._httpconfig.session.manager;}
    /**@param{SessionManager}sm*/set sesionManager(sm) {this._httpconfig.session.manager = sm;}
    /**
     * @param {SessionManager} [sm=null]
     * @return {HTTPAddOn}
     */
    setSessionManager(sm = null) {
        this._httpconfig.session.manager = sm;
        return this;
    }
    async install(azcontext, config, handler) {
        let httpconfig = config[HTTPAddOn.CONFIG_HTTP];
        if(typeof httpconfig !== "undefined" && httpconfig != null) // Override what was programatically set
            Object.assign(this._httpconfig, httpconfig);
        if(instanceOfCelastrinaType(SessionManager, this._httpconfig.session.manager))
            await this._httpconfig.session.manager.initialize(azcontext, config);
        await handler.addEventListener(AddOnEvent.TYPE.AFTER_PROCESS, this, HTTPAddOn.handleProcessLifecycle);
        await handler.addEventListener(AddOnEvent.TYPE.AFTER_TERMINATE, this, HTTPAddOn.handleTerminateLifecycle);
        await handler.addEventListener(AddOnEvent.TYPE.AFTER_EXCEPTION, this, HTTPAddOn.handleExceptionLifecycle);
        await handler.addEventListener(AddOnEvent.TYPE.AFTER_MONITOR, this, HTTPAddOn.handleMonitorLifecycle);
    }
    /**
     * @param {HTTPContext} context
     * @return {Promise<Session>}
     */
    async loadSession(context) {
        if(this._httpconfig.session.manager != null)
            return this._httpconfig.session.manager.loadSession(context);
        else return null;
    }
    /**
     * @param {HTTPContext} context
     * @param {Session} session
     * @return {Promise<void>}
     */
    async saveSession(context, session) {
        if(this._httpconfig.session.manager != null)
            return this._httpconfig.session.manager.saveSession(context, session);
    }
    /**
     * @param {(AddOnEvent|HTTPAddOnEvent)} event
     * @param {AddOn} addon
     * @param {*} data
     * @return {Promise<void>}
     */
    static async handleProcessLifecycle(event, addon, data) {
        /**@type{Function}*/let _handler = event.source[event.context.method];
        if(typeof _handler !== "function")
            await event.source.unhandledRequestMethod(event.context);
        else
            await _handler.call(event.source, event.context);
    }
    /**
     * @param {(AddOnEvent|HTTPAddOnEvent)} event
     * @param {AddOn} addon
     * @param {*} data
     * @return {Promise<void>}
     */
    static async handleTerminateLifecycle(event, addon, data) {
        await event.context.terminate();
    }
    /**
     * @param {(AddOnEvent|HTTPAddOnEvent)} event
     * @param {AddOn} addon
     * @param {*} data
     * @return {Promise<void>}
     */
    static async handleExceptionLifecycle(event, addon, data) {
        /**@type{null|Error|CelastrinaError|*}*/let ex = event.data;
        if(instanceOfCelastrinaType(/**@type{Class}*/CelastrinaValidationError, ex))
            event.context.sendValidationError(ex);
        else if(instanceOfCelastrinaType(/**@type{Class}*/CelastrinaError, ex))
            event.context.sendServerError(ex);
        else if(ex instanceof Error) {
            ex = CelastrinaError.wrapError(ex);
            event.context.sendServerError(ex);
        }
        else if(typeof ex === "undefined" || ex == null) {
            ex = CelastrinaError.newError("Unhandled server error.");
            event.context.sendServerError(ex);
        }
        else {
            ex = CelastrinaError.wrapError(ex);
            event.context.sendServerError(ex);
        }
        event.context.log("Request failed to process. \r\n (MESSAGE: " + ex.message + ") \r\n (STACK: " + ex.stack + ")" +
                            " \r\n (CAUSE: " + ex.cause + ")", LOG_LEVEL.ERROR, "HTTP.exception(context, exception)");
    }
    /**
     * @param {(AddOnEvent|HTTPAddOnEvent)} event
     * @param {AddOn} addon
     * @param {*} data
     * @return {Promise<void>}
     */
    static async handleMonitorLifecycle(event, addon, data) {
        let response = [{test: context.name, passed: event.context.monitorResponse.passed,
                         failed: event.context.monitorResponse.failed,
                         result: event.context.monitorResponse.result}];
        event.context.send(response, 200);
    }
}

/**
 * @typedef JwtConfiguration
 * @property {Array<Issuer>} issuers
 * @property {HTTPParameter} parameter
 * @property {string} name
 * @property {string} scheme
 * @property {boolean} removeScheme
 * @property {boolean} required
 */
/**
 * JwtConfigLoader
 * @author Robert R Murrell
 */
class JwtConfigLoader extends ConfigLoader {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/JwtConfigurationParser#",
                                                      type: "celastrinajs.http.JwtConfigLoader"};}
    /**
     * @param {ConfigLoader} [link=null]
     * @param {string} [version="1.0.0"]
     */
    constructor(link = null, version = "1.0.0") {
        super("JWT", link, version);
    }
    /**
     * @param {Object} _Configuration
     * @param {Object} config
     * @return {Promise<void>}
     * @private
     */
    async _load(_Configuration, config) {
        config[JwtAddOn.CONFIG_JWT] = _Configuration;
    }
}
/**
 * JwtAddOn
 * @author Robert R Murrell
 */
class JwtAddOn extends AddOn {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/JwtAddOn#",
                                                      type: "celastrinajs.http.JwtAddOn",
                                                      addOn: "celastrinajs.addon.http.jwt"};}
    /**@type{string}*/static CONFIG_JWT = "celastrinajs.addon.http.jwt.config";
    constructor() {
        super([HTTPAddOn.$object.addOn]);
        /**@type{JwtConfiguration}*/this._jwtconfig = {
            issuers: [],
            parameter: new HeaderParameter(),
            name: "authorization",
            scheme: "Bearer",
            removeScheme: true,
            required: false
        };
    }
    /**@return{ConfigLoader}*/getConfigLoader() {
        return new JwtConfigLoader();
    }
    /**@return{AttributeParser}*/getAttributeParser() {
        return new OpenIDJwtIssuerParser(new LocalJwtIssuerParser());
    }
    /**
     * @param {_AzureFunctionContext} azcontext
     * @param {Object} config
     * @param {AddOnEventHandler} handler
     * @return {Promise<void>}
     */
    async install(azcontext, config, handler) {
        /**@type{Object}*/let jwtconfig = config[JwtAddOn.CONFIG_JWT];
        if(typeof jwtconfig !== "undefined" && jwtconfig != null) // Override what was programatically set
            Object.assign(this._jwtconfig, jwtconfig);
        /**@type{Sentry}*/let _sentry = config[Configuration.CONFIG_SENTRY];
        _sentry.addAuthenticator(new JwtAuthenticator(this._jwtconfig.required, null, this._jwtconfig.parameter,
            this._jwtconfig.name, this._jwtconfig.scheme, this._jwtconfig.removeScheme, this._jwtconfig.issuers));
    }
    /**@return{Array.<Issuer>}*/get issuers(){return this._jwtconfig.issuers;}
    /**@param{Array.<Issuer>} issuers*/
    set issuers(issuers) {
        if(typeof issuers === "undefined" || issuers == null) issuers = [];
        this._jwtconfig.issuers = issuers;
    }
    /**@return{HTTPParameter}*/get parameter() {return this._jwtconfig.parameter}
    /**@param{HTTPParameter}param*/set parameter(param) {this._jwtconfig.parameter = param;}
    /**@return{string}*/get token() {return this._jwtconfig.name;}
    /**@param{string}token*/set token(token) {this._jwtconfig.name = token;}
    /**@return{string}*/get scheme() {return this._jwtconfig.scheme;}
    /**@param{string}scheme*/set scheme(scheme) {this._jwtconfig.scheme = scheme;}
    /**@return{boolean}*/get removeScheme() {return this._jwtconfig.removeScheme;}
    /**@param{boolean}remove*/set removeScheme(remove) {this._jwtconfig.removeScheme = remove;}
    /**@return{boolean}*/get required() {return this._jwtconfig.required;}
    /**@param{boolean}required*/set required(required) {this._jwtconfig.required = required;}
    /**
     * @param {Array<Issuer>} [issuers=[]]
     * @return {JwtAddOn}
     */
    setIssuers(issuers = []){this._jwtconfig.issuers = issuers; return this;}
    /**
     * @param {Issuer} issuer
     * @return {JwtAddOn}
     */
    addIssuer(issuer){this._jwtconfig.issuers.unshift(issuer); return this;}
    /**
     * @param {HTTPParameter} param
     * @return {JwtAddOn}
     */
    setParameter(param) {this._jwtconfig.parameter = param; return this;}
    /**
     * @param {string} token
     * @return {JwtAddOn}
     */
    setToken(token) {this._jwtconfig.name = token; return this;}
    /**
     * @param {string} scheme
     * @return {JwtAddOn}
     */
    setScheme(scheme) {this._jwtconfig.scheme = scheme; return this;}
    /**
     * @param {boolean} remove
     * @return {JwtAddOn}
     */
    setRemoveScheme(remove) {this._jwtconfig.removeScheme = remove; return this;}
    /**
     * @param {boolean} required
     * @return {JwtAddOn}
     */
    setRequired(required) {this._jwtconfig.required = required; return this;}
}
/**
 * HTTPContext
 * @author Robert R Murrell
 */
class HTTPContext extends Context {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/HTTPContext#",
                                                      type: "celastrinajs.http.HTTPContext"};}
    /**
     * @param {Configuration} config
     */
    constructor(config) {
        super(config);
        /**@type{Object}*/this._cookies = {};
        /**@type{Session}*/this._session = null;
    }
    /**@return{Object}*/get cookies() {return this._cookies;}
    /**@return{string}*/get method(){return this._action;}
    /**@return{string}*/get url(){return this._config.context.req.originalUrl;}
    /**@return{Object}*/get request(){return this._config.context.req;}
    /**@return{Object}*/get response(){return this._config.context.res;}
    /**@return{Object}*/get headers() {return this._config.context.req.headers;}
    /**@return{Object}*/get params(){return this._config.context.req.params;}
    /**@return{Object}*/get query(){return this._config.context.req.query;}
    /**@return{string}*/get raw(){return this._config.context.req.rawBody;}
    /**@return{Object}*/get requestBody(){return this._config.context.req.body;}
    /**@return{Object}*/get responseBody(){return this._config.context.res.body;}
    /**@return{Session}*/get session(){return this._session;}
    /**
     * @return {Promise<void>}
     * @private
     */
    async _setRequestId() {
        let id = this._config.context.req.query["requestId"];
        if(typeof id === "undefined" || id == null) id = this._config.context.req.headers["x-celastrina-requestId"];
        if(typeof id === "string") this._requestId = id;
    }
    /**
     * @return {Promise<void>}
     * @private
     */
    async _setMonitorMode() {
        let monitor;
        if(this.method === "trace") monitor = true;
        else {
            monitor = this._config.context.req.query["monitor"];
            if (typeof monitor === "undefined" || monitor == null)
                monitor = this._config.context.req.headers["x-celastrina-monitor"];
            monitor = (typeof monitor === "string") ? (monitor === "true") : false;
        }
        this._monitor = monitor;
    }
    /**
     * @return {Promise<void>}
     * @private
     */
    async _parseCookies() {
        let cookies = cookie.parse(await this.getRequestHeader("cookie", ""), "");
        for(let prop in cookies) {
            if(cookies.hasOwnProperty(prop)) {
                let local = cookies[prop];
                if(typeof local !== "undefined" && local != null)
                    this._cookies[prop] = new Cookie(prop, local);
            }
        }
    }
    /**
     * @return {Promise<void>}
     * @private
     */
    async _setSession() {
        /**@type{HTTPAddOn}*/let addon = /**@type{HTTPAddOn}*/await this._config.addOns.get(HTTPAddOn);
        if(addon != null) this._session = await addon.loadSession(this);
    }
    /**
     * @return {Promise<void>}
     */
    async initialize() {
        await super.initialize();
        this._config.context.res.status = 200;
        this._config.context.res.headers["Content-Type"] = "text/html; charset=ISO-8859-1";
        this._config.context.res.body = "<html lang=\"en\"><head><title>" + this._config.name + "</title></head><body><header>200, Success</header><footer>Powered by celastrinajs.</footer></body></html>";
        /**@type{string}*/this._action = this._config.context.req.method.toLowerCase();
        await this._setMonitorMode();
        await this._setRequestId();
        await this._parseCookies();
        await this._setSession();
    }
    /**
     * @return {Promise<void>}
     * @private
     */
    async _rewriteSession() {
        /**@type{HTTPAddOn}*/let addon = /**@type{HTTPAddOn}*/await this._config.addOns.get(HTTPAddOn);
        if(addon != null) {
            if(this.session != null && this.session.doWriteSession)
                await addon.saveSession(this, this._session);
        }
    }
    /**
     * @return {Promise<void>}
     * @private
     */
    async _setCookies() {
        let _cookies = this.cookies;
        let _setcookies = [];
        for(/**@type{Cookie}*/const _param in _cookies) {
            if(_cookies.hasOwnProperty(_param)) {
                let _cookie = _cookies[_param];
                if(instanceOfCelastrinaType(Cookie, _cookie))
                    _setcookies.unshift(_cookie.toAzureCookie());
            }
        }
        _setcookies = await Promise.all(_setcookies);
        if(_setcookies.length > 0)
            this.azureFunctionContext.res.cookies = _setcookies;
    }
    /**
     * @return {Promise<void>}
     */
    async terminate() {
        await this._rewriteSession();
        await this._setCookies();
    }
    /**
     * @param {string} name
     * @param {null|string} [defaultValue=null]
     * @return {Promise<null|string>}
     */
    async getURIBinding(name, defaultValue = null) {
        let uirbinding = this._config.context.bindingData[name];
        if(typeof uirbinding === "undefined" || uirbinding == null) return defaultValue
        else return uirbinding;
    }
    /**
     * @param {string} name
     * @param {Cookie} [defaultValue=null]
     * @return {Promise<Cookie>}
     */
    async getCookie(name, defaultValue = null) {
        let cookie = this._cookies[name];
        if(typeof cookie === "undefined" || cookie == null)
            return defaultValue;
        else
            return cookie;
    }
    /**
     * @param {Cookie} cookie
     * @return {Promise<void>}
     */
    async setCookie(cookie) {
        this._cookies[cookie.name] = cookie;
    }
    /**
     * @param {string} name
     * @param {null|string} [defaultValue=null]
     * @return {Promise<(null|string)>}
     */
    async getQuery(name, defaultValue = null) {
        let qry = this._config.context.req.query[name];
        if(typeof qry !== "string") return defaultValue;
        else return qry;
    }
    /**
     * @param {(null|string)} value
     * @param {string} [chr = ";"]
     * @param {boolean} [trim = true]
     * @return {Promise<Array<string>>}
     */
    async splitHeader(value, chr = ";", trim = true) {
        if(value != null) {
            /**@type{Array<string>}*/let _values = value.split(chr);
            if(trim) {
                for (let index = 0; index < _values.length; ++index) {
                    _values[index] = _values[index].trim();
                }
            }
            return _values;
        }
        else return [];
    }
    /**
     * @param {string} name
     * @param {null|string|Array.<string>} [defaultValue=null]
     * @return {null|string|Array.<string>}
     */
    async getRequestHeader(name, defaultValue = null) {
        let header = this._config.context.req.headers[name];
        if(typeof header !== "string") return defaultValue;
        else return header;
    }
    /**
     * @param {string} name
     * @param {(null|string)} [defaultValue = null] The default header value to split into an array of strings.
     * @param {string} [chr = ";"]
     * @param {boolean} [trim = true]
     * @return {Promise<Array<string>>}
     */
    async splitRequestHeader(name, defaultValue = null, chr = ";", trim = true) {
        return this.splitHeader(await this.getRequestHeader(name, defaultValue), chr, trim);
    }
    /**
     * @param {string} name
     * @param {string} value
     * @param {boolean} [defaultValue = false]
     * @return {Promise<boolean>}
     */
    async requestHeaderContains(name, value, defaultValue = false) {
        /**@type{string}*/let _header = await this.getRequestHeader(name);
        if(_header != null) return (_header.search(value) !== -1);
        else return false;
    }
    /**
     * @param {string} name
     * @return {Promise<boolean>}
     */
    async containsRequestHeader(name) {
        return this.config.context.req.headers.hasOwnProperty(name);
    }
    /**
     * @param {string} name
     * @return {Promise<void>}
     */
    async deleteResponseHeader(name) {
        try {
            delete this._config.context.res.headers[name];
        }
        catch(exception) {
            this.log("Silent exception thrown while deleting response header: " + exception + ". \r\nNo action taken.",
                             LOG_LEVEL.ERROR, "HTTPContext.deleteResponseHeader(name)");
        }
    }
    /**
     * @param {string} name
     * @param {null|string} [defaultValue=null]
     * @return {null|string}
     */
    async getResponseHeader(name, defaultValue = null) {
        let header = this._config.context.res.headers[name];
        if(typeof header !== "string") return defaultValue;
        else return header;
    }
    /**
     * @param {string} name
     * @param {(null|string)} [defaultValue = null] The default header value to split into an array of strings.
     * @param {string} [chr = ";"]
     * @param {boolean} [trim = true]
     * @return {Promise<Array<string>>}
     */
    async splitResponseHeader(name, defaultValue = null, chr = ";", trim = true) {
        return this.splitHeader(await this.getResponseHeader(name, defaultValue), chr, trim);
    }
    /**
     * @param {string} name
     * @param {string|Array.<string>} value
     */
    async setResponseHeader(name, value) {
        this._config.context.res.headers[name] = value;
    }
    /**
     * @param {*} [body=null]
     * @param {number} [status] The HTTP status code, default is 200.
     */
    send(body = null, status = 200) {
        if((status >= 200 && status <= 299) && (body == null || (typeof body === "string" && body.length === 0))) status = 204;
        this._config.context.res.status = status;
        this._config.context.res.headers["X-celastrina-request-uuid"] = this._requestId;
        this._config.context.res.body = body;
    }
    /**
     * @param {CelastrinaValidationError} [error=null]
     * @param {*} [body=null]
     */
    sendValidationError(error = null, body = null) {
        if(error == null) error = CelastrinaValidationError.newValidationError("bad request");
        if(body == null) body = "<html lang=\"en\"><head><title>" + this._config.name + "</title></head><body><header>400 - Bad Request</header><main><p><h2>" + error.message + "</h2><br />" + error.tag + "</p></main><footer>Powered by celastrinajs.</footer></body></html>";
        this.send(body, error.code);
    }
    /**
     * @param {string} url
     * @param {*} [body=null]
     */
    sendRedirect(url, body = null) {
        this._config.context.res.headers["Location"] = url;
        if(body == null) body = "<html lang=\"en\"><head><title>" + this._config.name + "</title></head><body><header>302 - Redirect</header><main><p><h2>" + url + "</h2></main><footer>Pwered by celastrinajs.</footer></body></html>";
        this.send(body, 302);
    }
    /**@param{string}url*/sendRedirectForwardBody(url) {this.sendRedirect(url, this._config.context.req.body);}
    /**
     * @param {*} [error=null]
     * @param {*} [body=null]
     */
    sendServerError(error = null, body = null) {
        if(error == null) error = CelastrinaError.newError("Internal Server Error.");

        else if(!instanceOfCelastrinaType(/**@type{Class}*/CelastrinaError, error)) error = CelastrinaError.wrapError(error, 500);
        switch(error.code) {
            case 403:
                this.sendForbiddenError(error);
                break;
            case 401:
                this.sendNotAuthorizedError(error);
                break;
            case 400:
                this.sendValidationError(error);
                break;
            default:
                if(body == null) body = "<html lang=\"en\"><head><title>" + this._config.name + "</title></head><body><header>" + error.code + " - Internal Server Error</header><main><p><h2>" + error.message + "</h2></main><footer>Powered by celastrinajs.</footer></body></html>";
                this.send(body, error.code);
        }
    }
    /**
     * @param {*} [error=null]
     * @param {*} [body=null]
     */
    sendNotAuthorizedError(error= null, body = null) {
        if(error == null) error = CelastrinaError.newError("Not Authorized.", 401);
        else if(!instanceOfCelastrinaType(/**@type{Class}*/CelastrinaError, error)) error = CelastrinaError.wrapError(error, 401);
        if(body == null) body = "<html lang=\"en\"><head><title>" + this._config.name + "</title></head><body><header>401 - Not Authorized</header><main><p><h2>" + error.message + "</h2></main><footer>Powered by celastrinajs.</footer></body></html>";
        this.send(body, 401);
    }
    /**
     * @param {*} [error=null]
     * @param {*} [body=null]
     */
    sendForbiddenError(error = null, body = null) {
        if(error == null) error = CelastrinaError.newError("Forbidden.", 403);
        else if(!instanceOfCelastrinaType(/**@type{Class}*/CelastrinaError, error)) error = CelastrinaError.wrapError(error, 403);
        if(body == null) body = "<html lang=\"en\"><head><title>" + this._config.name + "</title></head><body><header>403 - Forbidden</header><main><p><h2>" + error.message + "</h2></main><footer>Powered by celastrinajs.</footer></body></html>";
        this.send(body, 403);
    }
}
/**
 * JSONHTTPContext
 * @author Robert R Murrell
 */
class JSONHTTPContext extends HTTPContext {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/JSONHTTPContext#",
                                                      type: "celastrinajs.http.JSONHTTPContext"};}
    /**
     * @param {Configuration} config
     */
    constructor(config) {
        super(config);
    }
    async initialize() {
        await super.initialize();
        this._config.context.res.status = 200;
        this._config.context.res.headers["Content-Type"] = "application/json; charset=utf-8";
        this._config.context.res.body = {name: this._config.name, code: 200, message: "Success! Welcome to celastrinajs."};
    }
    /**
     * @param {CelastrinaError|CelastrinaValidationError} error
     * @param {(null|number)} code
     */
    sendCelastrinaError(error, code = null) {
        let _tag = null;
        if(typeof error.tag === "string" && error.tag.trim().length > 0) _tag = error.tag;
        let _causeMessage = null;
        if(error.cause instanceof Error) _causeMessage = error.cause.message;
        let _code = error.code;
        if(code != null) _code = code;
        this.send({name: error.name, message: error.message, tag: _tag, code: _code, cause: _causeMessage,
                        drop: error.drop}, _code);
    }
    /**
     * @param {CelastrinaValidationError} [error=null]
     * @param {Object} [body=null]
     */
    sendValidationError(error = null, body = null) {
        if(error == null) error = CelastrinaValidationError.newValidationError("bad request");
        if(body == null)
            this.sendCelastrinaError(error, 400);
        else
            this.send(body, 400);
    }
    /**
     * @param {string} url
     * @param {Object} [body=null]
     */
    sendRedirect(url, body = null) {
        this._config.context.res.headers["Location"] = url;
        if(body == null) body = {code: 302, url: url};
        this.send(body, 302);
    }
    /**
     * @param {*} [error=null]
     * @param {Object} [body=null]
     */
    sendServerError(error = null, body = null) {
        if(error == null) error = CelastrinaError.newError("Internal Server Error.");
        else if(!instanceOfCelastrinaType(/**@type{Class}*/CelastrinaError, error)) error = CelastrinaError.wrapError(error, 500);
        if(body == null)
            this.sendCelastrinaError(error);
        else
            this.send(body, 500);
    }
    /**
     * @param {*} [error=null]
     * @param {Object} [body=null]
     */
    sendNotAuthorizedError(error= null, body = null) {
        if(error == null) error = CelastrinaError.newError("Not Authorized.", 401);
        else if(!instanceOfCelastrinaType(/**@type{Class}*/CelastrinaError, error)) error = CelastrinaError.wrapError(error, 401);
        if(body == null)
            this.sendCelastrinaError(error, 401);
        else
            this.send(body, 401);
    }
    /**
     * @param {*} [error=null]
     * @param {Object} [body=null]
     */
    sendForbiddenError(error = null, body = null) {
        if(error == null) error = CelastrinaError.newError("Forbidden.", 403);
        else if(!instanceOfCelastrinaType(/**@type{Class}*/CelastrinaError, error)) error = CelastrinaError.wrapError(error, 403);
        if(body == null)
            this.sendCelastrinaError(error, 403);
        else
            this.send(body, 403);
    }
}
/**
 * JwtAuthenticator
 * @author Robert R Murrell
 */
class JwtAuthenticator extends Authenticator {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/JwtAuthenticator#",
                                                      type: "celastrinajs.http.JwtAuthenticator"};}
    /**
     * @param required
     * @param link
     * @param {HTTPParameter} parameter
     * @param {string} token
     * @param {string} scheme
     * @param {boolean} removeScheme
     * @param {Array<Issuer>} issuers
     */
    constructor(required = false, link = null, parameter, token, scheme,
                removeScheme, issuers) {
        super("JWT", required, link);
        /**@type{HTTPParameter}*/this._parameter = parameter;
        /**@type{string}*/this._token = token;
        /**@type{string}*/this._scheme = scheme;
        /**@type{boolean}*/this._removeScheme = removeScheme;
        /**@type{Array<Issuer>}*/this._issuers = issuers;
    }
    /**
     * @param {HTTPContext} context
     * @return {Promise<string>}
     * @private
     */
    async _getToken(context) {
        /**@type{string}*/let _token = await this._parameter.getParameter(context, this._token);
        if(typeof _token !== "string") {
            context.log("JWT " + this._parameter.type + " token " + this._token + " but none was found.",
                        LOG_LEVEL.THREAT, "JwtAuthenticator._getToken(context, _config)");
            return null;
        }
        let _scheme = this._scheme;
        if(typeof _scheme === "string" && _scheme.length > 0) {
            if(!_token.startsWith(_scheme)) {
                context.log("Expected JWT token scheme '" + _scheme + "' but none was found.", LOG_LEVEL.THREAT,
                             "JwtAuthenticator._getToken(context, _config)");
                return null;
            }
            if(this._removeScheme) _token = _token.slice(_scheme.length).trim();
        }
        return _token;
    }
    /**
     * @param {Assertion} assertion
     * @return {Promise<boolean>}
     */
    async _authenticate(assertion) {
        let _token = await this._getToken(/**@type{HTTPContext}*/assertion.context);
        if(_token != null) {
            let _jwt = null;
            try {
                _jwt = JwtSubject.decodeSync(assertion.subject, _token);
            }
            catch(exception) {
                assertion.context.log("JWT Token failed to decode, invlid signature.", LOG_LEVEL.THREAT,
                                              "JwtAuthenticator.createSubject(context)");
                return assertion.assert(this._name, false, null, "Invalid Signature.");
            }
            let _subjectid = assertion.subject.id;
            if(typeof _subjectid === "undefined" || _subjectid == null) _subjectid = assertion.context.requestId;
            if(_jwt.expired) {
                assertion.context.log("'" +_subjectid + "' token expired.", LOG_LEVEL.THREAT,
                                      "JwtAuthenticator.createSubject(context)");
                return assertion.assert(this._name, false, null, "Token Expired.");
            }
            /**@type{Array.<Promise<boolean>>}*/let promises = [];
            for(const _issuer of this._issuers) {
                promises.unshift(_issuer.verify(/**@type{HTTPContext}*/assertion.context, _jwt)); // Performs the role escalations too.
            }
            /**type{Array<{verified:boolean,assignments?:(null|Array<string>)}>}*/let results = await Promise.all(promises);
            let _verified = false;
            let _assignments = [];
            for(/**@type{{verified:boolean,assignments?:(null|Array<string>)}}*/let _verification of results) {
                if(_verification.verified && !_verified) _verified = true;
                _assignments = _assignments.concat(_verification.assignments);
            }
            return assertion.assert(this._name, _verified, _assignments);
        }
        else {
            assertion.context.log("No JWT token found.", LOG_LEVEL.THREAT,
                                          "JwtAuthenticator.createSubject(context)");
            return assertion.assert(this._name, false, null, "No Token Found.");
        }
    }
}
/**
 * HTTPFunction
 * @author Robert R Murrell
 * @type {BaseFunction}
 */
class HTTPFunction extends BaseFunction {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/HTTPFunction#",
                                                      type: "celastrinajs.http.HTTPFunction"};}
    /**@param{Configuration}configuration*/
    constructor(configuration) {super(configuration);}
    /**
     * @param {Configuration} config
     * @return {Promise<Context & HTTPContext>}
     */
    async createContext(config) {
        return new HTTPContext(config);
    }
    /**
     * @param {Context & HTTPContext} context
     * @return {Promise<void>}
     */
    async unhandledRequestMethod(context) {
        throw CelastrinaError.newError("HTTP Method '" + context.method + "' not supported.", 501);
    }
    /**
     * @param {_AzureFunctionContext} azcontext
     * @param {Context|HTTPContext} context
     * @param {CelastrinaError} error
     * @return {Promise<void>}
     * @private
     */
    async handleError(azcontext, context, error) {
        azcontext.res.status = error.code;
        azcontext.res.headers["X-celastrinajs-invocationId"] = azcontext.executionContext.invocationId;
        azcontext.res.headers["Content-Type"] = "text/html; charset=UTF-8";
        azcontext.res.body = "<html lang=\"en\">" +
                             "<head><title>" + azcontext.executionContext.functionName + "</title></head>" +
                             "<body><header>" + error.code + " - " + error.message + "</header>" +
                             "<main></main><footer>Powered by celastrinajs</footer></body></html>";
    }
}
/**
 * JSONHTTPFunction
 * @author Robert R Murrell
 */
class JSONHTTPFunction extends HTTPFunction {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/JSONHTTPFunction#",
                                                      type: "celastrinajs.http.JSONHTTPFunction"};}
    /**@param{Configuration}configuration*/
    constructor(configuration) {super(configuration);}
    /**
     * @param {Configuration} config
     * @return {Promise<HTTPContext>}
     */
    async createContext(config) {
        return new JSONHTTPContext(config);
    }
    /**
     * @param {_AzureFunctionContext} azcontext
     * @param {Context|HTTPContext} context
     * @param {CelastrinaError} error
     * @return {Promise<void>}
     * @private
     */
    async handleError(azcontext, context, error) {
        azcontext.res.status = error.code;
        azcontext.res.headers["X-celastrinajs-invocationId"] = azcontext.executionContext.invocationId;
        azcontext.res.headers["Content-Type"] = "application/json; charset=UTF-8";
        azcontext.res.body = {name: error.name, message: error.message, code: error.code, drop: error.drop};
    }
}
/**
 * MatchAlways
 * @author Robert R Murrell
 */
class MatchAlways extends ValueMatch {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/MatchAlways#",
                                                      type: "celastrinajs.http.MatchAlways"};}
    constructor() {
        super("MatchAlways");
    }
    /**
     * @param {Set<string>} assertion
     * @param {Set<string>} values
     * @return {Promise<true>}
     */
    async isMatch(assertion, values) {
        return true;
    }
}
/**
 * HMACAuthenticator
 * @author Robert R Murrell
 */
class HMACAuthenticator extends Authenticator {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/HMACAuthenticator#",
                                                      type: "celastrinajs.http.HMACAuthenticator"};}
    constructor(required = false, hmac, link = null) {
        super("HMAC", required, link);
        /**@type{HMAC}*/this._hmac = hmac;
    }
    /**
     * @param {Assertion} assertion
     * @return {Promise<void>}
     * @private
     */
    async _authenticate(assertion) {
        /**@type{HTTPContext}*/let _context = /**@type{HTTPContext}*/assertion.context;


        /**@type{string}*/let _signature = crypto.createHmac(this._hmac.algorithm, this._hmac.secret).update(
                                                                        _context.raw).digest(this._hmac.encoding).toString();
        let _challange = await this._hmac.parameter.getParameter(_context, this._hmac.name);
        let _authenticated = (_challange.toUpperCase() === _signature.toUpperCase());
        /**@type{Array<string>}*/let _assignments = null;
        if(!_authenticated)
            assertion.context.log("'" + assertion.subject.id + "' has an invalid HMAC signature.", LOG_LEVEL.THREAT,
                                   "HMACAuthenticator._authenticate(assertion)");
        else
            _assignments = this._hmac.assignments;
        assertion.assert(this._name, _authenticated, _assignments);
    }
}
/**
 * HMACAttributeParser
 * @author Robert R Murrell
 */
class HMACConfigLoader extends ConfigLoader {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/HMACConfigurationParser#",
                                                      type: "celastrinajs.http.HMACConfigurationParser"};}
    /**
     * @param {ConfigLoader} [link=null]
     * @param {string} [version="1.0.0"]
     */
    constructor(link = null, version = "1.0.0") {
        super("HMAC", link, version);
    }
    /**
     * @param {Object} _Configuration
     * @param {Object} config
     * @return {Promise<void>}
     * @private
     */
    async _load(_Configuration, config) {
        config[HMACAddOn.CONFIG_HMAC] = _Configuration;
    }
}
/**
 * HMACAttributeParser
 * @author Robert R Murrell
 */
class HMACParser extends AttributeParser {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/HMACParser#",
                                                      type: "celastrinajs.http.HMACParser"};}
    /**
     * @param {AttributeParser} link
     * @param {string} version
     */
    constructor(link = null, version = "1.0.0") {
        super("HMAC", link, version);
    }
    /**
     * @param {Object} _HMAC
     * @param {PropertyManager} pm
     * @return {Promise<HMAC>}
     * @private
     */
    async _create(_HMAC, pm) {
        if(!_HMAC.hasOwnProperty("secret") || (typeof _HMAC.secret !== "string") || _HMAC.secret.length === 0)
            throw CelastrinaValidationError.newValidationError("Argument 'secret' is required.", "_HMAC.secret");
        let _name = "x-celastrinajs-hmac";
        let _parameter = new HeaderParameter();
        let _algo = "sha256";
        let _encoding = "hex";
        let _assignments;
        if(_HMAC.hasOwnProperty("parameter") && (instanceOfCelastrinaType(HTTPParameter, _HMAC.parameter)))
            _parameter = _HMAC.parameter;
        if(_HMAC.hasOwnProperty("name") && (typeof _HMAC.name === "string") && _HMAC.name.trim().length > 0)
            _name = _HMAC.name.trim();
        if(_HMAC.hasOwnProperty("algorithm") && (typeof _HMAC.algorithm === "string") && _HMAC.algorithm.trim().length > 0)
            _algo = _HMAC.algorithm.trim();
        if(_HMAC.hasOwnProperty("encoding") && (typeof _HMAC.encoding === "string") && _HMAC.encoding.trim().length > 0)
            _encoding = _HMAC.encoding.trim();
        if(_HMAC.hasOwnProperty("assignments") && Array.isArray(_HMAC.assignments))
            _assignments = _HMAC.assignments;
        else
            _assignments = [];
        return new HMAC(_HMAC.secret, _parameter, _name, _algo, _encoding, _assignments);
    }
}
/**
 * HMACAddOn
 * @author Robert R Murrell
 */
class HMACAddOn extends AddOn {
    /**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/http/HMACAddOn#",
                                                      type: "celastrinajs.http.HMACAddOn",
                                                      addOn: "celastrinajs.addon.http.hmac"};}
    static CONFIG_HMAC = "celastrinajs.addon.http.hmac.config";
    /**
     * @param {Array<string>} [dependencies=[HTTPAddOn.$object.addOn]]
     */
    constructor(dependencies = [HTTPAddOn.$object.addOn]) {
        super(dependencies);
        this._hmacconfig = {
            required: false,
            hmac: null
        };
    }
    /**@return{ConfigLoader}*/getConfigLoader() {return new HMACConfigLoader();}
    /**@return{AttributeParser}*/getAttributeParser() {return new HMACParser();}
    /**@return{HMAC}*/get hmac() {
        return this._hmacconfig.hmac;
    }
    /**@param{HMAC}hmac*/set hmac(hmac) {
        this._hmacconfig.hmac = hmac;
    }
    /**@return{boolean}*/get required() {return this._hmacconfig.required;}
    /**@param{boolean}req*/set required(req) {this._hmacconfig.required = req;}
    async install(azcontext, config, handler) {
        let hmacconfig = config[HMACAddOn.CONFIG_HMAC];
        if(typeof hmacconfig !== "undefined" && hmacconfig != null) // Override what was programatically set
            Object.assign(this._hmacconfig, hmacconfig);
        /**@type{Sentry}*/let _sentry = config[Configuration.CONFIG_SENTRY];
        if(((!instanceOfCelastrinaType(HMAC, this._hmacconfig.hmac)) ||
                (typeof this._hmacconfig.hmac.secret === "undefined") || this._hmacconfig.hmac.secret == null ||
                this._hmacconfig.hmac.secret.length === 0))
            throw CelastrinaError.newError("Cannot load HMAC Add-On, missing required HMAC configuration.");
        _sentry.addAuthenticator(new HMACAuthenticator(this._hmacconfig.required, this._hmacconfig.hmac));
    }
}
module.exports = {
    MatchAlways: MatchAlways,
    Cookie: Cookie,
    JwtSubject: JwtSubject,
    HTTPContext: HTTPContext,
    JSONHTTPContext: JSONHTTPContext,
    Issuer: Issuer,
    IssuerParser: IssuerParser,
    LocalJwtIssuer: LocalJwtIssuer,
    LocalJwtIssuerParser: LocalJwtIssuerParser,
    OpenIDJwtIssuer: OpenIDJwtIssuer,
    OpenIDJwtIssuerParser: OpenIDJwtIssuerParser,
    HTTPParameter: HTTPParameter,
    HeaderParameter: HeaderParameter,
    QueryParameter: QueryParameter,
    BodyParameter: BodyParameter,
    CookieParameter: CookieParameter,
    Session: Session,
    SessionManager: SessionManager,
    SecureSessionManager: SecureSessionManager,
    AESSessionManager: AESSessionManager,
    AESSessionManagerParser: AESSessionManagerParser,
    SessionRoleFactory: SessionRoleFactory,
    SessionRoleFactoryParser: SessionRoleFactoryParser,
    HTTPConfigLoader: HTTPConfigLoader,
    HTTPAddOn: HTTPAddOn,
    HMAC: HMAC,
    HMACAuthenticator: HMACAuthenticator,
    HMACParser: HMACParser,
    HMACConfigLoader: HMACConfigLoader,
    HMACAddOn: HMACAddOn,
    JwtAuthenticator: JwtAuthenticator,
    JwtConfigLoader: JwtConfigLoader,
    JwtAddOn: JwtAddOn,
    HTTPFunction: HTTPFunction,
    JSONHTTPFunction: JSONHTTPFunction
};

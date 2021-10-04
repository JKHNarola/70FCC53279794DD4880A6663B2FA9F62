import { Promise } from 'bluebird';
Promise.config({ warnings: false });

class RESTRequest {
    constructor(apiurl, data) {
        this.apiurl = apiurl;
        this.data = data;
        this.method = "GET";
        this.timeout = 0;
        this.responseType = "";
        this.isDebug = false;
        this.headers = [];
        this.xhr = null;
        this.xhrDownloadProgressCallback = null;
        this.xhrUploadProgressCallback = null;
    }

    send = (method, apiurl, data) => {
        var currObj = this;
        return new Promise((resolve, reject) => {
            try {
                currObj.xhr = new XMLHttpRequest();

                if (typeof method === 'string')
                    currObj.method = method.trim().toUpperCase();
                if (typeof apiurl === 'string')
                    currObj.apiurl = apiurl;
                if (typeof data !== 'undefined')
                    currObj.data = data;

                var d = "";
                var dataToSend = null;

                if (currObj.data) {
                    if (currObj.data instanceof FormData) {
                        if (currObj.method === "GET") {
                            if (currObj.isDebug)
                                console.log("FormData with GET method is not allowed");
                            var ed = {
                                status: 600,
                                statusText: "",
                                response: null,
                                type: "",
                                msg: "FormData with GET method is not allowed",
                                err: new Error("FormData with GET method is not allowed")
                            };
                            reject(ed);
                            currObj.clear();
                            return;
                        }
                        dataToSend = this.data;
                    }
                    else if (currObj.method === "GET")
                        d = "?" + currObj.prepareQueryStringFromJSON(currObj.data);
                    else {
                        try {
                            dataToSend = JSON.stringify(currObj.data);
                        } catch (ex) {
                            var edobj = {
                                status: 601,
                                statusText: "",
                                response: null,
                                type: "",
                                msg: "Couldn't stringify Json data",
                                err: ex
                            };
                            if (currObj.isDebug)
                                console.log("Couldn't stringify Json data", ex);
                            reject(edobj);
                            currObj.clear();
                            return;
                        }
                    }
                }

                currObj.xhr.onreadystatechange = () => {
                    if (currObj.xhr.readyState === 4) {
                        if (currObj.isDebug) console.log("Response " + currObj.xhr.status + ":", currObj.xhr);
                        if (currObj.xhr.status === 0) return;
                        if (currObj.xhr.status >= 100 && currObj.xhr.status <= 399)
                            resolve(currObj.xhrResponsePrettifier(currObj.xhr));
                        else
                            reject(currObj.xhrResponsePrettifier(currObj.xhr));
                        currObj.clear();
                    }
                };
                currObj.xhr.onerror = () => {
                    if (currObj.isDebug) console.log("onerror", currObj.xhr);
                    var x = currObj.xhrResponsePrettifier(currObj.xhr);
                    x.status = 602;
                    if (!x.msg) x.msg = "Request failed";
                    reject(x);
                    currObj.clear();
                };
                currObj.xhr.ontimeout = () => {
                    if (currObj.isDebug) console.log("ontimeout", currObj.xhr);
                    var x = currObj.xhrResponsePrettifier(currObj.xhr);
                    x.status = 603;
                    x.msg = "Request timeout";
                    reject(x);
                    currObj.clear();
                };
                currObj.xhr.onabort = () => {
                    if (currObj.isDebug) console.log("onabort", currObj.xhr);
                    var x = currObj.xhrResponsePrettifier(currObj.xhr);
                    x.status = 604;
                    x.msg = "Request aborted";
                    reject(x);
                    currObj.clear();
                };
                currObj.xhr.onprogress = (event) => {
                    if (currObj.isDebug) console.log("onprogress", event);
                    if (currObj.xhrDownloadProgressCallback && typeof currObj.xhrDownloadProgressCallback === "function") {
                        var obj = {
                            totalBytes: event.total,
                            downloadedBytes: event.loaded,
                            percentComplete: (event.loaded / event.total) * 100
                        }
                        currObj.xhrDownloadProgressCallback(obj);
                    }
                };

                currObj.xhr.upload.onload = () => {
                };
                currObj.xhr.upload.onerror = () => {
                    console.log("upload.onerror");
                };
                currObj.xhr.upload.onabort = () => {
                };
                currObj.xhr.upload.onprogress = (event) => {
                    if (currObj.isDebug) console.log("upload.onprogress", event);
                    if (currObj.xhrUploadProgressCallback && typeof currObj.xhrUploadProgressCallback === "function") {
                        var obj = {
                            totalBytes: event.total,
                            uploadedBytes: event.loaded,
                            percentComplete: (event.loaded / event.total) * 100
                        }
                        currObj.xhrUploadProgressCallback(obj);
                    }
                };
                currObj.xhr.open(currObj.method, currObj.apiurl + d, true);

                if (currObj.responseType)
                    currObj.xhr.responseType = currObj.responseType;
                if (currObj.timeout && /^\+?(0|[1-9]\d*)$/.test(currObj.timeout))
                    currObj.xhr.timeout = currObj.timeout;

                if (currObj.headers && Array.isArray(currObj.headers) && currObj.headers.length > 0) {
                    currObj.headers.map(x => {
                        currObj.xhr.setRequestHeader(x.key, x.value);
                        return null;
                    });
                }

                currObj.xhr.send(dataToSend);

                if (currObj.isDebug)
                    console.log("XHR Started");

            } catch (e) {
                if (currObj.isDebug) console.log("Exception in send", e);
                reject({
                    status: 605,
                    statusText: "",
                    response: null,
                    type: null,
                    msg: "Error while processing request",
                    err: e
                });
                currObj.clear();
            }
        });
    }

    cancel = () => {
        if (this.xhr && this.xhr.readyState > 0 && this.xhr.readyState < 4) {
            this.xhr.abort();
            return true;
        }
        return false;
    }

    abort = () => {
        if (this.xhr) {
            this.xhr.abort();
            return true;
        }
        return false;
    }

    get = (apiurl, data) => {
        return this.send("GET", apiurl, data);
    }

    post = (apiurl, data) => {
        return this.send("POST", apiurl, data);
    }

    put = (apiurl, data) => {
        return this.send("PUT", apiurl, data);
    }

    patch = (apiurl, data) => {
        return this.send("PATCH", apiurl, data);
    }

    delete(apiurl, data) {
        return this.send("DELETE", apiurl, data);
    }

    setHeader = (key, value) => {
        this.headers.push({
            key: key,
            value: value
        });
        return this;
    }

    setContentTypeHeader = (contentType) => {
        if (!contentType)
            contentType = "application/json; charset=UTF-8";
        this.headers.push({
            key: "Content-Type",
            value: contentType
        });
        return this;
    }

    setResponseType = type => {
        if (!type || typeof type !== "string" || (type !== "" && type.toLowerCase() !== "text" && type.toLowerCase() !==
            "json" && type.toLowerCase() !== "arraybuffer" && type.toLowerCase() !== "blob" && type.toLowerCase() !==
            "document"))
            type = "";
        this.responseType = type.toLowerCase();
        return this;
    }

    xhrResponsePrettifier = xhr => {
        var type = xhr.getResponseHeader('content-type');
        var ed = {
            status: xhr.status,
            statusText: xhr.statusText,
            response: null,
            type: type
        };
        if (xhr.response) {
            if ((xhr.responseType === "" || xhr.responseType === "text") && type.indexOf("application/json") >= 0) {
                try {
                    var r = xhr.responseText ? xhr.responseText : xhr.response;
                    ed.response = JSON.parse(r);
                } catch (e) {
                    if (this.isDebug)
                        console.log("Exception xhrResponsePrettifier", e);
                    ed.msg = "Error while parsing response";
                    ed.err = e;
                    ed.response = xhr.responseText ? xhr.responseText : xhr.response;
                }
            } else
                ed.response = xhr.response;
        }
        return ed;
    }

    prepareQueryStringFromJSON = jsondata => {
        if (typeof jsondata === 'object') {
            var qsArray = Object.keys(jsondata).map(function (k) {
                var v = jsondata[k];
                if (v == null)
                    return "";
                if (typeof v === "object")
                    v = JSON.stringify(jsondata[k]);
                else if (typeof v !== 'string')
                    v = jsondata[k].toString();
                return encodeURIComponent(k) + '=' + encodeURIComponent(v);
            });
            var filtered = qsArray.filter(function (el) {
                return el !== "";
            });
            if (filtered && filtered.length > 0)
                return filtered.join('&');
            return "";
        }
        return jsondata;
    }

    clear = () => {
        this.apiurl = "";
        this.data = undefined;
        this.timeout = 0;
        this.responseType = "json";
        this.isDebug = false;
        this.headers = [];
        this.xhr = null;
    }
}

/** 
 * properties of config
 * 
 * ====================
 * 
 * {
 * 
 * url: api url,
 * 
 * method: api method (GET, POST, PUT, PATCH, DELETE)
 * 
 * data: api data json,
 * 
 * responseType: (text, json, arraybuffer, blob, document),
 * 
 * timeout: request timeout default to 0, 
 * 
 * isDebug: true/false, 
 * 
 * headers: [{key: "headerkey", value: "headervalue"}], 
 * 
 * isJson: true/false - if true, "Content-Type": "application/json; charset=UTF-8" is set on request, 
 * 
 * onDownloadProgress: function with parameter,
 * 
 * onUploadProgress: function with parameter, 
 * 
 * onSuccess: function with parameter Ex. 
 * 
            {
                status: number (0-605),
                statusText: "",
                response: data from api result - can be json or file data in case of arraybuffer response type,
                type: "",
                msg: "",
                err: error object in case of error
            },
 *
 * onError: function with parameter same as onSuccess response, 
 *
 * onComplete: function without parameter
 *
 * }
 * 
 * Custom error status codes
 * 
 * =========================
 * 
 * 600 - FormData with GET method is not allowed
 * 
 * 601 - Couldn't stringify Json data
 * 
 * 602 - Request failed
 * 
 * 603 - Request timeout
 * 
 * 604 - Request aborted
 * 
 * 605 - Error while processing request
*/
export const restRequest = config => {
    var req = new RESTRequest(config.url, config.data);
    var promise = null;
    try {
        req.method = config.method && typeof config.method === "string" ? config.method.trim().toUpperCase() : "GET";
        if (config.responseType && typeof config.responseType === "string") req.setResponseType(config.responseType.trim());
        if (config.timeout && /^\+?(0|[1-9]\d*)$/.test(config.timeout)) req.timeout = config.timeout;
        if (typeof config.isDebug === "boolean") req.isDebug = config.isDebug;
        if (config.headers && Array.isArray(config.headers)) {
            config.headers.map(x => {
                req.setHeader(x.key, x.value);
                return null;
            });
        }
        if (typeof config.isJson === "boolean" && config.isJson === true) req.setContentTypeHeader();
        if (config.onDownloadProgress && typeof config.onDownloadProgress === "function")
            req.xhrDownloadProgressCallback = config.onDownloadProgress;
        if (config.onUploadProgress && typeof config.onUploadProgress === "function")
            req.xhrUploadProgressCallback = config.onUploadProgress;
    }
    catch (ex) {
        promise = new Promise((resolve, reject) => {
            reject({
                status: 0,
                statusText: "",
                response: null,
                type: "",
                err: ex.message
            });
        });
        return req;
    }

    switch (req.method) {
        case "GET":
            promise = req.get();
            break;
        case "POST":
            promise = req.post();
            break;
        case "PUT":
            promise = req.put();
            break;
        case "PATCH":
            promise = req.patch();
            break;
        case "DELETE":
            promise = req.delete();
            break;
        default:
            promise = new Promise((resolve, reject) => {
                reject({
                    status: 0,
                    statusText: "",
                    response: null,
                    type: "",
                    err: "Provided method is not supported"
                });
            });
            break;
    }

    promise
        .then(r => {
            if (config.onSuccess && typeof config.onSuccess === "function") config.onSuccess(r);
        })
        .catch(e => {
            if (config.onError && typeof config.onError === "function") config.onError(e);
        })
        .done(() => {
            if (config.onComplete && typeof config.onComplete === "function") config.onComplete();
        });

    return req;
}

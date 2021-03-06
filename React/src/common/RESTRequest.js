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
        var currInstance = this;
        return new Promise((resolve, reject) => {
            try {
                currInstance.xhr = new XMLHttpRequest();

                if (typeof method === 'string')
                    currInstance.method = method.trim().toUpperCase();
                if (typeof apiurl === 'string')
                    currInstance.apiurl = apiurl;
                if (typeof data !== 'undefined')
                    currInstance.data = data;

                var d = "";
                var dataToSend = null;
                currInstance.isError = false;
                currInstance.lastOnProgessCalledD = null;
                currInstance.lastOnProgessCalledU = null;

                if (currInstance.data) {
                    if (currInstance.data instanceof FormData) {
                        if (currInstance.method === "GET") {
                            if (currInstance.isDebug)
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
                            currInstance.clear();
                            return;
                        }
                        dataToSend = this.data;
                    }
                    else if (currInstance.method === "GET")
                        d = "?" + currInstance.prepareQueryStringFromJSON(currInstance.data);
                    else {
                        try {
                            dataToSend = JSON.stringify(currInstance.data);
                        } catch (ex) {
                            var edobj = {
                                status: 601,
                                statusText: "",
                                response: null,
                                type: "",
                                msg: "Couldn't stringify Json data",
                                err: ex
                            };
                            if (currInstance.isDebug)
                                console.log("Couldn't stringify Json data", ex);
                            reject(edobj);
                            currInstance.clear();
                            return;
                        }
                    }
                }

                currInstance.xhr.onreadystatechange = () => {
                    if (currInstance.xhr.readyState === 4) {
                        if (currInstance.isDebug) console.log("Response " + currInstance.xhr.status + ":", currInstance.xhr);
                        if (currInstance.xhr.status === 0) return;
                        if (currInstance.xhr.status >= 100 && currInstance.xhr.status <= 399)
                            resolve(currInstance.xhrResponsePrettifier(currInstance.xhr));
                        else
                            reject(currInstance.xhrResponsePrettifier(currInstance.xhr));
                        currInstance.clear();
                    }
                };
                currInstance.xhr.onerror = () => {
                    currInstance.isError = true;
                    if (currInstance.isDebug) console.log("onerror", currInstance.xhr);
                    var x = currInstance.xhrResponsePrettifier(currInstance.xhr);
                    x.status = 602;
                    if (!x.msg) x.msg = "Request failed";
                    reject(x);
                    currInstance.clear();
                };
                currInstance.xhr.ontimeout = () => {
                    if (currInstance.isDebug) console.log("ontimeout", currInstance.xhr);
                    var x = currInstance.xhrResponsePrettifier(currInstance.xhr);
                    x.status = 603;
                    x.msg = "Request timeout";
                    reject(x);
                    currInstance.clear();
                };
                currInstance.xhr.onabort = () => {
                    currInstance.isAborted = true;
                    if (currInstance.isDebug) console.log("onabort", currInstance.xhr);
                    var x = currInstance.xhrResponsePrettifier(currInstance.xhr);
                    x.status = 604;
                    x.msg = "Request aborted";
                    reject(x);
                    currInstance.clear();
                };
                currInstance.xhr.onprogress = (event) => {
                    if (currInstance.isDebug) console.log("onprogress", event);
                    if (currInstance.xhrDownloadProgressCallback && typeof currInstance.xhrDownloadProgressCallback === "function") {
                        var obj = {
                            totalBytes: event.total,
                            downloadedBytes: event.loaded,
                            percentComplete: (event.loaded / event.total) * 100
                        }
                        currInstance.xhrDownloadProgressCallback(obj);
                    }
                };

                currInstance.xhr.upload.onload = () => {
                    currInstance.isError = true;
                };
                currInstance.xhr.upload.onerror = () => {
                };
                currInstance.xhr.upload.onabort = () => {
                    currInstance.isAborted = true;
                };
                currInstance.xhr.upload.onprogress = (event) => {
                    let currtime = new Date();
                    if (currInstance.lastOnProgessCalledU === null || (currtime.getTime() - currInstance.lastOnProgessCalledU.getTime()) >= 1000 || event.loaded === event.total || currInstance.isError || currInstance.isAborted) {
                        currInstance.lastOnProgessCalledU = currtime;
                        if (currInstance.isDebug) console.log("upload.onprogress", event);
                        if (currInstance.xhrUploadProgressCallback && typeof currInstance.xhrUploadProgressCallback === "function") {
                            var obj = {
                                totalBytes: event.total,
                                uploadedBytes: event.loaded,
                                percentComplete: (event.loaded / event.total) * 100
                            }
                            currInstance.xhrUploadProgressCallback(obj);
                        }
                    }
                };
                currInstance.xhr.open(currInstance.method, currInstance.apiurl + d, true);

                if (currInstance.responseType)
                    currInstance.xhr.responseType = currInstance.responseType;
                if (currInstance.timeout && /^\+?(0|[1-9]\d*)$/.test(currInstance.timeout))
                    currInstance.xhr.timeout = currInstance.timeout;

                currInstance.setNoCacheHeaders();
                if (currInstance.headers && Array.isArray(currInstance.headers) && currInstance.headers.length > 0) {
                    currInstance.headers.map(x => {
                        currInstance.xhr.setRequestHeader(x.key, x.value);
                        return null;
                    });
                }

                currInstance.xhr.send(dataToSend);

                if (currInstance.isDebug)
                    console.log("XHR Started");

            } catch (e) {
                if (currInstance.isDebug) console.log("Exception in send", e);
                reject({
                    status: 605,
                    statusText: "",
                    response: null,
                    type: null,
                    msg: "Error while processing request",
                    err: e
                });
                currInstance.clear();
            }
        });
    };

    cancel = () => {
        if (this.xhr && this.xhr.readyState > 0 && this.xhr.readyState < 4) {
            this.xhr.abort();
            return true;
        }
        return false;
    };

    abort = () => {
        if (this.xhr) {
            this.xhr.abort();
            return true;
        }
        return false;
    };

    get = (apiurl, data) => {
        return this.send("GET", apiurl, data);
    };

    post = (apiurl, data) => {
        return this.send("POST", apiurl, data);
    };

    put = (apiurl, data) => {
        return this.send("PUT", apiurl, data);
    };

    patch = (apiurl, data) => {
        return this.send("PATCH", apiurl, data);
    };

    delete(apiurl, data) {
        return this.send("DELETE", apiurl, data);
    };

    setHeader = (key, value) => {
        this.headers.push({
            key: key,
            value: value
        });
        return this;
    };

    setContentTypeHeader = (contentType) => {
        if (!contentType)
            contentType = "application/json; charset=UTF-8";
        this.headers.push({
            key: "Content-Type",
            value: contentType
        });
        return this;
    };

    setResponseType = type => {
        if (!type || typeof type !== "string" || (type !== "" && type.toLowerCase() !== "text" && type.toLowerCase() !==
            "json" && type.toLowerCase() !== "arraybuffer" && type.toLowerCase() !== "blob" && type.toLowerCase() !==
            "document"))
            type = "";
        this.responseType = type.toLowerCase();
        return this;
    };

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
    };

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
    };

    clear = () => {
        this.lastOnProgessCalled = undefined;
        this.isError = undefined;
    };

    setNoCacheHeaders = () => {
        if (!this.xhr) return;
        this.xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
        this.xhr.setRequestHeader("Expires", "Tue, 01 Jan 1980 1:00:00 GMT");
        this.xhr.setRequestHeader("Pragma", "no-cache");
    };
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
const restRequest = config => {
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
            if (config.onComplete && typeof config.onComplete === "function") config.onComplete(req.isAborted);
        });

    return req;
}

export default restRequest;
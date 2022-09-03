const httpStatus = require("http-status-codes"),
    htmlContentType = {
        "Content-Type": "text/html"
    },
    routes = {
        "GET": {},
        'POST': {},
        'DELETE':{},
        'PUT':{}
    };
exports.handle = (req, res) => {
    let urlLink = req.url.toString().split("?")[0];
    try {
        if (routes[req.method][urlLink]) {
            routes[req.method][urlLink](req, res);
        } else {
            res.writeHead(httpStatus.NOT_FOUND, htmlContentType);
            res.end("<h1>No such file exists</h1>");
        }
    } catch (ex) {
        console.log("error: " + ex);
    }
};
exports.get = (url, action) => {
    routes["GET"][url] = action;
};
exports.post = (url, action) => {
    routes["POST"][url] = action;
};
exports.delete = (url, action) => {
    routes["DELETE"][url] = action;
};
exports.put = (url, action) => {
    routes["PUT"][url] = action;
};
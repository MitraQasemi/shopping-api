const port = 3000;
const http = require("http");
const url = require('url');
const formidable = require('formidable');
const httpStatusCodes = require("http-status-codes");
const router = require("./router");
const fs = require("fs");
const plainTextContentType = {
    "Content-Type": "text/plain"
};
const htmlContentType = {
    "Content-Type": "text/html"
};
router.get("/showList", (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    try {
        const data = fs.readFileSync("products.json", "utf-8");
        const jsonData = JSON.parse(data);
        res.write(JSON.stringify(jsonData));
        res.end();
    } catch (error) {
        console.log(error);
    }
})
router.get("/getById", (req, res) => {
    var q = url.parse(req.url, true);
    res.writeHead(200, { "Content-Type": "application/json" });
    try {
        const data = fs.readFileSync("products.json", "utf-8");
        const jsonData = JSON.parse(data);
        index = jsonData.findIndex(x => x.id == q.query.id);
        if (index >= 0) {
            res.end(JSON.stringify(jsonData[index]));
        } else {
            res.end("this id does not exist");
        }

    } catch (error) {
        console.log(error);
    }
})
router.post("/addProduct", (req, res) => {
    let data = "";
    req.on('data', (chunk) => {
        data += chunk;
    });
    req.on('end', function () {
        const newProduct = JSON.parse(data);
        res.writeHead(200, { "Content-Type": "application/json" });
        try {
            const data = fs.readFileSync("products.json", "utf-8");
            const jsonData = JSON.parse(data);
            if (jsonData.length === 0) {
                newProduct.id = 0;
            } else {
                newProduct.id = jsonData[jsonData.length - 1].id + 1;
            }
            jsonData.push(newProduct);
            fs.writeFileSync("products.json", JSON.stringify(jsonData));
        } catch (error) {
            console.log(error);
        }
    });
    res.end("done");
})
router.delete("/deleteProduct", (req, res) => {
    var q = url.parse(req.url, true);
    res.writeHead(200, { "Content-Type": "application/json" });
    try {
        const data = fs.readFileSync("products.json", "utf-8");
        const jsonData = JSON.parse(data);
        index = jsonData.findIndex(x => x.id == q.query.id);
        if (index >= 0) {
            jsonData.splice(index, 1);
            fs.writeFileSync("products.json", JSON.stringify(jsonData));
            res.end("done");
        } else {
            res.end("this id does not exist");
        }

    } catch (error) {
        console.log(error);
    }
})
router.put("/updateById", (req, res) => {
    let q = url.parse(req.url, true);
    let data = "";
    req.on('data', (chunk) => {
        data += chunk;
    });
    req.on('end', function () {
        const newProduct = JSON.parse(data);
        res.writeHead(200, { "Content-Type": "application/json" });
        try {
            const data = fs.readFileSync("products.json", "utf-8");
            const jsonData = JSON.parse(data);
            index = jsonData.findIndex(x => x.id == q.query.id);
            if (index >= 0) {
                newProduct.id = q.query.id;
                jsonData[index] = newProduct;
                fs.writeFileSync("products.json", JSON.stringify(jsonData));
                res.end("done");
            } else {
                res.end("this id does not exist");
            }

        } catch (error) {
            console.log(error);
        }
    });
})
router.get('/image', (req, res) => {
    var q = url.parse(req.url, true);
    res.writeHead(200, { "Content-Type": "image/ief" });
    try {
        let img = fs.readFileSync(`./images/${q.query.filename}`);
        res.end(img);
    } catch (error) {
        console.log(error);
    }
})
router.post("/setImage", (req, res) => {
    var q = url.parse(req.url, true);
    res.writeHead(200, { "Content-Type": "application/json" });
    try {
        const data = fs.readFileSync("products.json", "utf-8");
        const jsonData = JSON.parse(data);
        index = jsonData.findIndex(x => x.id == q.query.id);
        if (index >= 0) {
            const form = formidable({
                uploadDir: 'images',
                keepExtensions: true,
                filename: (name, ext) => {
                    return name + ext;
                }
            });
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if (typeof (jsonData[index].image) === "string") {
                    let array = [];
                    array.push(`http://localhost:3000/image?filename=${files.file.originalFilename}`);
                    jsonData[index].image = array;
                } else {
                    jsonData[index].image.push(`http://localhost:3000/image?filename=${files.file.originalFilename}`);
                }
                fs.writeFileSync("products.json", JSON.stringify(jsonData));
            })
        } else {
            res.end("this id does not exist");
        }
    } catch (error) {
        console.log(error);
    }
    res.end("done")
})
http.createServer(router.handle).listen(3000);
console.log(`The server is listening on port number:
   ➥ ${port}`);
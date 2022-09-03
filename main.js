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
            newProduct.image = newProduct.id + ".png";
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
router.get('/sendImage', (req, res) => {
    var q = url.parse(req.url, true);
    try {
        let img = fs.readFileSync(`./images/${q.query.id}.png`);
        res.end(img, 'binary');
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
                    return q.query.id + ".png";
                }
            });
            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.log(err);
                    return;
                }
                res.end("file uploaded");
            })
            jsonData[index].image = q.query.id + ".png";
            fs.writeFileSync("products.json", JSON.stringify(jsonData));
        } else {
            res.end("this id does not exist");
        }
    } catch (error) {
        console.log(error);
    }
    // let data = "";
    // req.on('data', function (chunk) {
    //     data += chunk;
    // });
    // req.on('end', function () {
    //     let buff = new Buffer.from(data);
    //     let base64data = buff.toString('base64');
    //     let buff1 = Buffer.from(base64data, 'base64');
    //     try {
    //         fs.writeFileSync('./images/test.png', buff1);
    //     } catch (error) {
    //         console.log(error);
    //     }
    // });
})
http.createServer(router.handle).listen(3000);
console.log(`The server is listening on port number:
   ➥ ${port}`);
var http = require("http");
var fs = require("fs");
var url = require("url");
var port = process.argv[2];

if (!port) {
  console.log("请指定端口号好不啦？\nnode server.js 8888 这样不会吗？");
  process.exit(1);
}

var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true);
  var pathWithQuery = request.url;
  var queryString = "";
  if (pathWithQuery.indexOf("?") >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf("?"));
  }
  var path = parsedUrl.pathname;
  var query = parsedUrl.query;
  var method = request.method;

  /******** 从这里开始看，上面不要看 ************/

  console.log("有个傻子发请求过来啦!路径（带查询参数）为:" + pathWithQuery);

  if (path === "/register" && method === "POST") {
    response.setHeader("Content-Type", "text/html;charset=utf-8");
    const userArray = JSON.parse(fs.readFileSync("./db/users.json"));
    //先读取内容
    const array = [];
    request.on("data", (chunk) => {
      //request是请求
      array.push(chunk);
    });
    request.on("end", () => {
      console.log(array);
      const string = Buffer.concat(array).toString(); //把不同的数据合成一个字符串
      console.log(string);
      const lastUser = userArray[userArray.length - 1];
      const obj = JSON.parse(string);
      const newUser = {
        id: lastUser ? lastUser.id + 1 : 1,
        //id为最后一个用户的id加1
        name: obj.name,
        password: obj.password,
      };
      userArray.push(newUser);
      fs.writeFileSync("./db/users.json", JSON.stringify(userArray));
      //把它变成字符串之后写到这个文件里面
      response.end(); //响应
    });
  } else {
    response.statusCode = 200;
    const filePath = path === "/" ? "/index.html" : path;
    //默认首页
    const index = filePath.lastIndexOf(".");
    console.log(index);
    const suffix = filePath.substring(index);
    //suffix是后缀
    console.log(suffix);

    const fileTypes = {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
      ".png": "image/png",
      ".jpg": "image/jpeg",
    };
    response.setHeader(
      "Content-Type",
      `${fileTypes[suffix] || "text/html"},charset=utf-8`
    );

    let content;
    try {
      content = fs.readFileSync(`./public${filePath}`);
    } catch (error) {
      content = "文件不存在";
      response.statusCode = 404;
    }
    response.write(content);
    response.end();
  }

  /******** 代码结束，下面不要看 ************/
});

server.listen(port);
console.log(
  "监听 " +
    port +
    " 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:" +
    port
);

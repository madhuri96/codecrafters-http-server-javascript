const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// const server = net.createServer((socket) => {
//   socket.once("data", (data) => {
//     const request = data.toString();
//     const lines = request.split("\r\n");
//     const [method, path] = lines[0].split(" ");

//     if (path === "/") {
//       socket.write("HTTP/1.1 200 OK\r\n\r\n");
//     } else {
//       socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
//     }

//     socket.end();
//   });
// });

const server = net.createServer((socket) => {
  socket.once("data", (data) => {
    const request = data.toString();
    const lines = request.split("\r\n");
    const [method, path] = lines[0].split(" ");

    if (method === "GET" && path.startsWith("/echo/")) {
      const str = decodeURIComponent(path.substring(6));
      const responseBody = str;
      const contentLength = Buffer.byteLength(responseBody, "utf-8");

      const responseHeaders = [
        "HTTP/1.1 200 OK",
        "Content-Type: text/plain",
        `Content-Length: ${contentLength}`,
        "",
        responseBody,
      ].join("\r\n");

      socket.write(responseHeaders);
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }

    socket.end();
  });
});

server.listen(4221, "localhost");

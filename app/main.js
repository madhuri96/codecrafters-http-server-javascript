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
    const [method, url] = lines[0].split(" ");

    if (url === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else if (url.startsWith("/echo/")) {
      const content = url.split("/echo/")[1];
      const responseBody = content;
      const contentLength = Buffer.byteLength(responseBody, "utf-8");

      const responseHeaders = [
        "HTTP/1.1 200 OK",
        "Content-Type: text/plain",
        `Content-Length: ${contentLength}`,
        "",
      ].join("\r\n");

      socket.write(responseHeaders + "\r\n" + responseBody);
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }

    socket.end();
  });

  // Error Handling
  socket.on("error", (e) => {
    console.error("ERROR: " + e);
    socket.end();
  });
});

server.listen(4221, "localhost");

const net = require("net");
const fs = require("fs");
const path = require("path");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer({ keepAlive: true }, (socket) => {
  socket.on("data", (data) => {
    const request = data.toString();
    const lines = request.split("\r\n");
    const [method, url] = lines[0].split(" ");

    // Parse request headers
    const headers = {};
    lines.slice(1, -2).forEach((line) => {
      const [name, value] = line.split(": ");
      headers[name.toLowerCase()] = value;
    });

    if (url === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
      socket.end();
    } else if (method === "POST" && url.startsWith("/files/")) {
      const directory = process.argv[3];
      const fileName = path.join(directory, url.split("/files/")[1]);

      const contentLengthHeader = lines.find((line) =>
        line.startsWith("Content-Length:")
      );
      const contentLength = contentLengthHeader
        ? parseInt(contentLengthHeader.split(": ")[1])
        : 0;

      const bodyStartIndex = request.indexOf("\r\n\r\n") + 4;
      const requestBody = request.slice(bodyStartIndex);

      fs.writeFile(fileName, requestBody, (err) => {
        if (err) {
          socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
        } else {
          socket.write("HTTP/1.1 201 Created\r\n\r\n");
        }
        socket.end();
      });
    } else if (url.startsWith("/echo/")) {
      const content = url.split("/echo/")[1];
      const responseBody = content;
      const contentLength = Buffer.byteLength(responseBody, "utf-8");

      // Accept-Encoding header is present and includes gzip
      const acceptEncoding = headers["accept-encoding"] || "";
      const includeContentEncoding = acceptEncoding.includes("gzip");

      const responseHeaders = [
        "HTTP/1.1 200 OK",
        "Content-Type: text/plain",
        `Content-Length: ${contentLength}`,
        includeContentEncoding ? "Content-Encoding: gzip" : "",
        "",
      ].join("\r\n");

      socket.write(responseHeaders + "\r\n" + responseBody);
      socket.end();
    } else if (url.startsWith("/files/")) {
      const directory = process.argv[3];
      const fileName = path.join(directory, url.split("/files/")[1]);

      fs.readFile(fileName, (err, data) => {
        if (err) {
          socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
          socket.end();
        } else {
          const contentLength = Buffer.byteLength(data);

          const responseHeaders = [
            "HTTP/1.1 200 OK",
            "Content-Type: application/octet-stream",
            `Content-Length: ${contentLength}`,
            "",
          ].join("\r\n");

          socket.write(responseHeaders + "\r\n");
          socket.write(data);
          socket.end();
        }
      });
    } else if (url === "/user-agent") {
      const userAgent = lines.find((line) => line.startsWith("User-Agent: "));
      const userAgentValue = userAgent ? userAgent.split(": ")[1] : "Unknown";
      const contentLength = Buffer.byteLength(userAgentValue, "utf-8");

      const responseHeaders = [
        "HTTP/1.1 200 OK",
        "Content-Type: text/plain",
        `Content-Length: ${contentLength}`,
        "",
      ].join("\r\n");

      socket.write(responseHeaders + "\r\n" + userAgentValue);
      socket.end();
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.end();
    }
  });

  socket.on("error", (e) => {
    console.error("ERROR: " + e);
    socket.end();
  });
});

server.listen(4221, "localhost");

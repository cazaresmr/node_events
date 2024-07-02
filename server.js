const http = require("http");
const { EventEmitter } = require("events");
const path = require("path");
const fs = require("fs");

const NewsLetter = new EventEmitter();

const server = http.createServer((req, res) => {
  const chunks = [];

  req.on("data", (chunk) => {
    chunks.push(chunk);
  });

  req.on("end", () => {
    if (req.method === "POST" && req.url === "/newsletter_signup") {
      const bodyString = Buffer.concat(chunks).toString();
      if (bodyString) {
        try {
          const body = JSON.parse(bodyString);
          const contact = `${body.name},${body.email}\n`;
          NewsLetter.emit("signup", contact);
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("Signup successful");
        } catch (error) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Invalid JSON");
        }
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Empty request body");
      }
    } else if (req.method === "GET" && req.url === "/newsletter_signup") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`
        <html>
          <body>
            <form action="/newsletter_signup" method="post">
              <label for="name">Name:</label>
              <input type="text" id="name" name="name" required>
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required>
              <button type="submit">Sign Up</button>
            </form>
          </body>
        </html>
      `);
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });
});

NewsLetter.on("signup", (contact) => {
  const filePath = path.join(__dirname, "newsletter.csv");

  fs.appendFile(filePath, contact, (err) => {
    if (err) {
      console.error("Failed to append contact to CSV file", err);
    } else {
      console.log("Contact appended to CSV file");
    }
  });
});

server.listen(3000, (err) => {
  if (err) {
    console.error("Failed to start server", err);
  } else {
    console.log("Server is listening on port 3000");
  }
});

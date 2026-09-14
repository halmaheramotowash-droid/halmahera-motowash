import fs from "fs";
import https from "https";
import next from "next";

const dev = false;
const hostname = "0.0.0.0";
const port = 3000;

const cert = fs.readFileSync(
  "./certificates/172.20.10.9+1.pem"
);

const key = fs.readFileSync(
  "./certificates/172.20.10.9+1-key.pem"
);

const app = next({
  dev,
  hostname,
  port,
});

const handle = app.getRequestHandler();

await app.prepare();

const server = https.createServer(
  {
    key,
    cert,
  },
  (req, res) => {
    handle(req, res);
  }
);

server.listen(port, hostname, () => {
  console.log(
    `HTTPS server berjalan di https://localhost:${port}`
  );

  console.log(
    `HTTPS LAN: https://172.20.10.9:${port}`
  );
});
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const PORT = 5000;
const TEMPS_FILE = "temps.csv";
const TEMPS_FILE_SEPARATOR = ",";
const app = express();

app.use(cors());

app.use("/static", express.static("static"));
app.get("/", (req, resp, next) =>
  resp.sendFile("static/index.html", { root: __dirname })
);

let lastTemp = {
  temperature: null,
  date: null,
};

app.post("/temperatures/:temp", (req, resp, _next) => {
  const { temp } = req.params;
  console.log("received temp", temp);
  const now = new Date();
  const line = `${now.toISOString()}${TEMPS_FILE_SEPARATOR}${temp}\n`;
  lastTemp = {
    temperature: +temp,
    date: now,
  };
  fs.appendFile(TEMPS_FILE, line, (err) => {
    if (err)
      return resp
        .status(500)
        .send({ error: "could not save temperature record" });
    resp.sendStatus(201);
  });
});

//This endpoint is called when sonoff button is pressed
app.post("/buttons/:sonoffId", (req, resp, _next) => {
  const { sonoffId } = req.params;
  resp.sendStatus(204);
});

app.get("/temperatures", (_req, resp, _next) => {
  fs.readFile(TEMPS_FILE, (err, data) => {
    if (err) return resp.status(500).json({ error: "database error" });
    const temperatures = data
      .toString()
      .split("\n")
      .filter((line) => !!line)
      .map((line) => {
        const [date, temp] = line.split(TEMPS_FILE_SEPARATOR);
        return {
          date,
          temp: +temp,
        };
      });
    resp.json({ temperatures });
  });
});

app.get("/temperatures/latest", (_req, resp, next) => {
  resp.json(lastTemp);
});

fs.stat(TEMPS_FILE, (err) => {
  if (err) {
    fs.writeFile(TEMPS_FILE, "", (err) => {
      if (err) return console.log("Cannot create temperature file");
      console.log("Temperature file created");
      startApi();
    });
  } else {
    console.log("Temperature file already created");
    startApi();
  }
});

const startApi = () => {
  app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
  });
};

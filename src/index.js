const express = require("express");
const app = express();
const port = 3010;
const ffmpeg = require("ffmpeg-static");
const cp = require("child_process");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");

const ytdl = require("ytdl-core");

__dirname = path.resolve(__dirname);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/video/1080/:id", async (req, res) => {
  let videoSize;
  let videoURL;
  if (req.params.id == "undefined") {
    videoURL = "https://www.youtube.com/watch?v=JfVOs4VSpmA";
  } else {
    videoURL = req.params.id;
  }
  // const headers = {
  //   "Content-Length": 2000,
  //   "Content-Type": "video/mp4",
  // };
  // res.writeHead(206, headers);
  res.header("Content-Disposition", `attachment;  filename=.mp4`);
  let video = ytdl(videoURL, { filter: "videoonly" });
  let audio = ytdl(videoURL, { filter: "audioonly", highWaterMark: 1 << 25 });

  const ffmpegProcess = cp.spawn(
    ffmpeg,
    [
      "-i",
      `pipe:3`,
      "-i",
      `pipe:4`,
      "-map",
      "0:v",
      "-map",
      "1:a",
      "-c:v",
      "copy",
      "-c:a",
      "libmp3lame",
      "-crf",
      "27",
      "-preset",
      "veryfast",
      "-movflags",
      "frag_keyframe+empty_moov",
      "-f",
      "mp4",
      "-loglevel",
      "error",
      "-",
    ],
    {
      stdio: ["pipe", "pipe", "pipe", "pipe", "pipe"],
    }
  );

  video.pipe(ffmpegProcess.stdio[3]);
  audio.pipe(ffmpegProcess.stdio[4]);

  ffmpegProcess.stdio[1].pipe(res);
  let ffmpegLogs = "";

  ffmpegProcess.stdio[2].on("data", (chunk) => {
    ffmpegLogs += chunk.toString();
  });

  ffmpegProcess.on("exit", (exitCode) => {
    if (exitCode === 1) {
      console.error(ffmpegLogs);
    }
  });
});
app.get("/video/720/:id", async (req, res) => {
  let videoURL;
  if (req.params.id == "undefined") {
    videoURL = "https://www.youtube.com/watch?v=JfVOs4VSpmA";
  } else {
    videoURL = req.params.id;
  }

  let video = ytdl(videoURL, { filter: "videoandaudio" });
  video.pipe(res);
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

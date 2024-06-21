import { FILE_WATCHER_MAPPER } from "./mapper";
import chokidar from "chokidar";
import fs from "fs";
import path from "path";
import { forOwn } from "lodash";
import { spawn } from "child_process";
import "dotenv/config";

if (!process.env.BASE_PATH) {
  console.error("BASE_PATH is not set");
  process.exit(1);
}

const basePath = process.env.BASE_PATH;

function handleAction(
  originPath: string,
  commands: Record<string, string[]>
) {
  console.log("Change detected in", originPath);
  return function () {
    Object.keys(commands).forEach((destination) => {
      const absoluteDestination = path.join(basePath, destination);
      const command = commands[destination][0];
      const args = commands[destination].slice(1);
      console.log(`Running command: ${command}`);
      console.log(`With cwd: ${absoluteDestination}`);
      const childProcess = spawn(
        command,
        args, {
        cwd: absoluteDestination,
        shell: true,
      })
      childProcess.stdout.on("data", (data: Buffer) => {
        console.log(data.toString());
      });
    });
  }
}

forOwn(FILE_WATCHER_MAPPER, (commands: Record<string, string[]>, origin: string) => {
  const absoluteOrigin = path.join(basePath, origin);
  chokidar.watch(absoluteOrigin).on("change", handleAction(absoluteOrigin, commands));
  chokidar.watch(absoluteOrigin).on("add", handleAction(absoluteOrigin, commands));
});

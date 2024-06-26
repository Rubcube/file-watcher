import "dotenv/config";

import chokidar from "chokidar";
import path from "path";

import { Action, FILE_WATCHER_MAPPER } from "./mapper";
import { copyFileSync } from "fs";
import { forOwn } from "lodash";
import { spawn } from "child_process";

if (!process.env.BASE_PATH) {
  console.error("BASE_PATH is not set");
  process.exit(1);
}

const basePath = process.env.BASE_PATH;

function handleActions(
  originWithBase: string,
  actions: Record<string, Action[]>,
  emmitedBy: string,
) {
  console.log(`File ${emmitedBy} has been changed`);
  Object.entries(actions).forEach(([destination, actions]) => {
    const destinationWithBase = path.join(basePath, destination);
    actions.forEach((action) => {
      if (action.action === "copy") {
        const currentLocation = emmitedBy;
        const destinationWithSuffix = path.join(destinationWithBase, action.to);
        const newLocation = emmitedBy.replace(originWithBase, destinationWithSuffix);
        console.log(`Copying ${currentLocation} to ${newLocation}`);
        copyFileSync(
          currentLocation,
          newLocation
        );
      } else if (action.action === "command") {
        const command = action.command.join(" ");
        const child = spawn(command, [], {
          cwd: originWithBase,
          shell: true,
        });
        child.stdout.on("data", (data) => {
          console.log(`stdout: ${data}`);
        });
      }
    });
  });
}

forOwn(FILE_WATCHER_MAPPER, (actions: Record<string, Action[]>, origin: string) => {
  const originWithBase = path.join(basePath, origin);
  chokidar.watch(originWithBase, {
    ignoreInitial: true,
  }).on("change", (emmitedBy) => handleActions(originWithBase, actions, emmitedBy))
    .on("add", (emmitedBy) => handleActions(originWithBase, actions, emmitedBy));
});

type CopyAction = {
  action: "copy";
  /**
   * Relative string to copy to
   */
  to?: string;
};

type CommandAction = {
  action: "command";
  command: string[];
}

export type Action = CopyAction | CommandAction;

type FileWatcherMapper = {
  [origin: string]: {
    [destination: string]: Action[];
  };
};

export const FILE_WATCHER_MAPPER: FileWatcherMapper = {
  "banking-app-road-plugin/dist": {
    "banking-app-customizer-out-road": [
      {
        action: "copy",
        to: "node_modules/@banking-road/banking-app-road-plugin/dist"
      }
    ]
  }
};

export type RunOptions = {
  /** Working directory to run the command in. */
  cwd?: string;
  /**  How to handle stdio ("pipe": capture stdout and return it as a string (default), "inherit": stream output directly to the parent process */
  stdio?: "inherit" | "pipe";
  /**  Environment variables to use while running the command. */
  env?: NodeJS.ProcessEnv;
  /** Optional timeout in milliseconds for the command. */
  timeoutMs?: number;
};

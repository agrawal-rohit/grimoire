import {
  type ConfirmOptions,
  confirm,
  intro,
  log,
  type SelectOptions,
  select,
  spinner,
  type TextOptions,
  text,
} from "@clack/prompts";
import chalk from "chalk";

class CLI {
  handleCancel(value: unknown) {
    if (
      typeof value !== "symbol" ||
      value.toString() !== "Symbol(clack:cancel)"
    ) {
      return value;
    }

    this.end("Setup interrupted");
  }

  header(title: string): void {
    log.message(" ", {
      symbol: chalk.bgCyanBright(` ${title} `),
    });
  }

  intro(message: string): void {
    console.log();
    intro(`${chalk.bgGreen(" @agrawalrohit/create-lib ")} ${message}`);
  }

  warn(message: string): void {
    console.warn(`${chalk.bgYellow(" warn ")} ${message}`);
  }

  error(message: string): void {
    console.error(`${chalk.bgRed(" error ")} ${message}`);
    process.exit(1);
  }

  end(message: string): void {
    console.error(`${chalk.bgRed(" end ")} ${message}`);
    console.log();
    process.exit(0);
  }

  /**
   * Run an async function while showing a spinner.
   * Starts the spinner, runs fn, then stops the spinner with a final message.
   * @param message Initial spinner message.
   * @param fn Async function to execute while the spinner is active.
   * @param doneMessage Final message to show upon success. Defaults to "Done".
   * @returns The resolved value of fn.
   * @throws Re-throws any error after stopping the spinner with "Failed".
   */
  async withSpinner<T>(
    message: string,
    fn: () => Promise<T>,
    doneMessage = "Done"
  ): Promise<T> {
    const s = spinner();
    s.start(message);
    try {
      const res = await fn();
      s.stop(doneMessage);
      return res;
    } catch (err) {
      s.stop("Failed");
      throw err;
    }
  }

  /**
   * Prompt for a text input.
   * @param message The prompt message to display.
   * @param opts Additional options for the text prompt (excluding message).
   * @param defaultValue The default value to use if the user provides no input.
   * @returns The typed value entered by the user.
   */
  async textInput<
    Value extends Exclude<Awaited<ReturnType<typeof text>>, symbol>,
  >(
    message: string,
    opts: Partial<Omit<TextOptions, "message">> = {},
    defaultValue: Value | undefined = undefined
  ): Promise<Value> {
    if (defaultValue) {
      opts.defaultValue = defaultValue;
      opts.placeholder = opts.placeholder ?? defaultValue;
    }

    return (await text({
      message,
      ...opts,
    }).then((v) => this.handleCancel(v))) as Promise<Value>;
  }

  /**
   * Prompt for a selection input.
   * @param message The prompt message to display.
   * @param opts Options for the select prompt (excluding message). Default includes an empty options array.
   * @param defaultValue The default value to preselect.
   * @returns The selected value.
   */
  async selectInput<
    Value extends Exclude<Awaited<ReturnType<typeof select>>, symbol>,
  >(
    message: string,
    opts: Omit<SelectOptions<Value>, "message"> = {
      options: [],
    },
    defaultValue: Value | undefined = undefined
  ): Promise<Value> {
    if (defaultValue) opts.initialValue = defaultValue;

    return (await select<Value>({
      message,
      ...opts,
    }).then((v) => this.handleCancel(v))) as Promise<Value>;
  }

  /**
   * Prompt for a boolean confirmation input.
   * @param message The prompt message to display.
   * @param opts Options for the confirm prompt (excluding message).
   * @param defaultValue The default value to use if no explicit input is given.
   * @returns The confirmed value.
   */
  async confirmInput<
    Value extends Exclude<Awaited<ReturnType<typeof confirm>>, symbol>,
  >(
    message: string,
    opts: Omit<ConfirmOptions, "message"> = {},
    defaultValue: Value | undefined = undefined
  ): Promise<Value> {
    if (defaultValue) opts.initialValue = defaultValue;

    return (await confirm({
      message,
      ...opts,
    }).then((v) => this.handleCancel(v))) as Promise<Value>;
  }
}

const cli = new CLI();
export default cli;

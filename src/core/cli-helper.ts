import {
  type ConfirmOptions,
  confirm,
  intro,
  log,
  type SelectOptions,
  select,
  type TextOptions,
  text,
} from "@clack/prompts";
import chalk from "chalk";

class CLIHelper {
  // Internal helpers
  handleCancel(value: unknown) {
    if (
      typeof value !== "symbol" ||
      value.toString() !== "Symbol(clack:cancel)"
    ) {
      return value;
    }

    this.end("Setup interrupted");
  }

  // Logging methods
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

  // Prompt methods
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

const cliHelper = new CLIHelper();
export default cliHelper;

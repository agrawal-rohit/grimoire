import {
  type ConfirmOptions,
  confirm,
  intro,
  log,
  outro,
  type SelectOptions,
  select,
  type TextOptions,
  text,
} from "@clack/prompts";
import chalk from "chalk";
import type { ListrTaskWrapper } from "listr2";
import { type DefaultRenderer, Listr, type SimpleRenderer } from "listr2";

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

  outro(message: string): void {
    outro(`${chalk.bgGreen(" setup complete ")} ${message}`);
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
   * Run multiple subtasks under a grouped goal using listr2 for a coherent task list.
   * Each subtask gets a chalk-styled title and runs sequentially.
   * @param goalTitle - Overall goal title (e.g., "Preparing project", styled bold cyan).
   * @param subtasks - Array of subtasks, each with a title and async task function.
   * @returns Promise that resolves when all subtasks complete.
   * @throws Re-throws errors from subtasks, updating their titles to "Failed" (red).
   */
  async withTasks(
    goalTitle: string,
    subtasks: Array<{
      title: string;
      task: () => Promise<void>;
    }>
  ): Promise<void> {
    const tasks = new Listr(
      [
        {
          title: chalk.cyan(goalTitle),
          task: async (
            _ctx: unknown,
            task: ListrTaskWrapper<
              unknown,
              typeof DefaultRenderer,
              typeof SimpleRenderer
            >
          ) => {
            const subTasks = subtasks.map(({ title, task: run }) => ({
              title: chalk.grey(title),
              task: async () => {
                await run();
              },
            }));
            return task.newListr(subTasks, {
              rendererOptions: {
                collapseErrors: false,
              },
            });
          },
        },
      ],
      {
        rendererOptions: {
          collapseErrors: false,
        },
      }
    );

    await tasks.run();
  }

  /**
   * Prompt for a text input.
   * @param message - The prompt message to display.
   * @param opts - Additional options for the text prompt (excluding message).
   * @param defaultValue - The default value to use if the user provides no input.
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
   * @param message - The prompt message to display.
   * @param opts - Options for the select prompt (excluding message). Default includes an empty options array.
   * @param defaultValue - The default value to preselect.
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
   * @param message - The prompt message to display.
   * @param opts - Options for the confirm prompt (excluding message).
   * @param defaultValue - The default value to use if no explicit input is given.
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

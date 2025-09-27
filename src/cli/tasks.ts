import chalk from "chalk";
import {
	type DefaultRenderer,
	Listr,
	type ListrTaskWrapper,
	type SimpleRenderer,
} from "listr2";

/** A single executable subtask. */
export type Subtask = {
	title: string;
	task: () => Promise<void>;
};

/**
 * Helper to conditionally include a task in a task list.
 * @param condition - Include the task when true; exclude when false.
 * @param title - Task title.
 * @param task - Task function.
 * @returns Array with the task if condition is true; otherwise an empty array.
 */
export function conditionalTask(
	condition: boolean,
	title: string,
	task: () => Promise<void>,
): Subtask[] {
	return condition ? [{ title, task }] : [];
}

/**
 * Run multiple subtasks grouped under a single goal using listr2.
 * Provides a clean, stylized task list with collapsed errors.
 * @param goalTitle - Overall goal title (e.g., "Preparing package").
 * @param subtasks - Array of subtasks to run.
 * @param opts - Optional rendering behavior.
 */
export async function runWithTasks(
	goalTitle: string,
	task?: () => Promise<void>,
	subtasks: Subtask[] = [],
	opts: { collapseErrors?: boolean } = {},
): Promise<void> {
	const tasks = new Listr(
		[
			{
				title: chalk.cyan(goalTitle),
				task: async (
					_ctx: unknown,
					_task: ListrTaskWrapper<
						unknown,
						typeof DefaultRenderer,
						typeof SimpleRenderer
					>,
				) => {
					if (task) return task;

					const subTasks = subtasks.map(({ title, task: run }) => ({
						title: chalk.grey(title),
						task: async () => {
							await run();
						},
					}));

					return _task.newListr(subTasks, {
						rendererOptions: {
							collapseErrors: opts.collapseErrors ?? true,
						},
					});
				},
			},
		],
		{
			rendererOptions: {
				collapseErrors: opts.collapseErrors ?? true,
			},
		},
	);

	await tasks.run();
}

/** Convenience default export for straightforward importing. */
const tasks = {
	runWithTasks,
	conditionalTask,
};

export default tasks;

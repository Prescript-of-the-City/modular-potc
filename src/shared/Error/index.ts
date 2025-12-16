import Signal from "@rbxts/signal";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Error {
	class Error {
		static readonly OnThrownError: Signal<(dat: string) => void> = new Signal();

		constructor(public Name: string) {}

		Format(): string {
			return "";
		}
	}

	export function ThrowError(err: Error) {
		// broadcast to client for logging
		Error.OnThrownError.Fire(err.Format());
		print(`[${os.date("%I:%M")}] ${err.Name} was thrown! \nError was thrown inside of ${err.Format()}`);
	}

	export class InvalidTokenType extends Error {
		constructor(
			private Script: string,
			private idx: number,
		) {
			super("InvalidTokenType");
		}

		Format(): string {
			return `script: "${this.Script}", index: ${this.idx}`;
		}
	}

	export class ScriptNoAssign extends Error {
		constructor(
			private Script: string,
			private idx: number,
		) {
			super("NoAssignmentInsideFunction");
		}

		Format(): string {
			return `script: "${this.Script}", index: ${this.idx}`;
		}
	}

	export class ScriptFunctionNotFound extends Error {
		constructor(private func: string) {
			super("ScriptFunctionNotFound");
		}

		Format(): string {
			return `function: "${this.func}"`;
		}
	}
}

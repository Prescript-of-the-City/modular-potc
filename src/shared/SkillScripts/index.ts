/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable roblox-ts/lua-truthiness */

import { Error } from "shared/Error";
import { LogOutput } from "shared/LogOutput";

enum TokenType {
	IDENTIFIER,
	ASSIGNER,
	LPAREN,
	RPAREN,
}

export class Token {
	constructor(
		public readonly tokenType: TokenType,
		public readonly content: string,
		public readonly isArg: boolean,
		public readonly isAssignment: boolean,
	) {}
}

class ModularSkillScript<State> {
	static StaticBuffer: unknown[] = [];
	static LastExecutedGetter: string;

	private readonly source: string;
	private readonly buffer: [string, string][] = [];

	constructor(modScript: string) {
		this.source = modScript;
	}

	Tokenize(): Token[] {
		const tokens: Token[] = [];
		let i = 0;

		let current = "";
		let funcDepth = 0;
		let assignmentMode = false;

		const pushIdentifier = () => {
			if (current !== "") {
				tokens.push(new Token(TokenType.IDENTIFIER, current, funcDepth > 0, assignmentMode));
				current = "";
			}
		};

		while (i <= this.source.size()) {
			const char = this.source.sub(i, i);

			switch (char) {
				case "(": {
					pushIdentifier();
					tokens.push(new Token(TokenType.LPAREN, "(", funcDepth > 0, assignmentMode));
					funcDepth++;

					const [endIdx] = this.source.sub(i).find(")");
					if (!endIdx) {
						Error.ThrowError(new Error.InvalidTokenType(this.source, i));
					}
					break;
				}

				case ")":
					pushIdentifier();
					funcDepth = math.max(0, funcDepth - 1);
					tokens.push(new Token(TokenType.RPAREN, ")", funcDepth > 0, assignmentMode));
					break;

				case ",":
				case "/":
					pushIdentifier();
					assignmentMode = false;
					break;

				case ":":
					pushIdentifier();
					if (funcDepth > 0) {
						Error.ThrowError(new Error.ScriptNoAssign(this.source, i));
					}
					tokens.push(new Token(TokenType.ASSIGNER, ":", false, assignmentMode));
					assignmentMode = true;
					break;

				default:
					current += char;
					break;
			}

			i++;
		}

		if (current !== "") {
			pushIdentifier();
		}

		return tokens;
	}

	Enact(enacter: State, target: State) {
		const tokens = this.Tokenize();

		let lastIden: string = "";
		for (const token of tokens) {
			if (token.tokenType === TokenType.IDENTIFIER) {
				if (token.content.sub(1, 1) === "v") {
					print(token.content.sub(1, 1));
					lastIden = token.content;
					continue;
				}

				const functionsFolder = script.FindFirstChild("Functions") as Folder;
				if (!functionsFolder) continue;

				const fn = functionsFolder.FindFirstChild(token.content);
				if (!fn) {
					Error.ThrowError(new Error.ScriptFunctionNotFound(token.content));
					continue;
				}

				// eslint-disable-next-line @typescript-eslint/no-require-imports
				const action: SkillScriptAction.Action = require(fn as ModuleScript) as SkillScriptAction.Action;
				if (!(action instanceof SkillScriptAction.Action)) {
					continue;
				}

				const context: Map<number, unknown> = new Map([
					[0, enacter],
					[1, target],
				]);

				if (action.kind === SkillScriptAction.SkillScriptClassType.GETTER) {
					const res = action.execute(context) as string;
					if (lastIden.sub(0, 0) === "v") {
						this.buffer.push([lastIden, res]);
					}

					LogOutput(`Just executed getter function result: ${res}`);
					// else we can assume its a setter
				} else {
					action.execute(context);
				}

				lastIden = token.content;
			}
		}
	}
}

namespace SkillScriptAction {
	export enum SkillScriptClassType {
		GETTER,
		SETTER,
	}

	export abstract class Action {
		constructor(
			public kind: SkillScriptClassType,
			args: Token[],
		) {}

		execute(ctx: Map<number, unknown>): void | string {}
	}
}

export { ModularSkillScript, SkillScriptAction };

import { SkillScriptAction, Token } from "..";

export default class extends SkillScriptAction.Action {
	constructor(args: Token[]) {
		super(SkillScriptAction.SkillScriptClassType.GETTER, args);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	execute(_: Map<number, unknown>): void | string {
		return "value";
	}
}

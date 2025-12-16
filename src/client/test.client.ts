import { ModularSkillScript } from "shared/SkillScripts";

const skillTest = new ModularSkillScript("vVariableName:getValue()/useValue(vVariableName)");
print(skillTest.Tokenize());
print(
	skillTest.Enact(
		{
			posture: 100,
		},
		{
			posture: 100,
		},
	),
);

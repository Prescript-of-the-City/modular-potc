export const LogOutput = (...args: unknown[]) => {
	// eslint-disable-next-line prefer-const
	let [s, n, l] = debug.info(2, "snl");
	const split = s.split(".");
	s = split[split.size() - 1];

	if (n !== undefined && n !== "") {
		print(`[${s}:${n}:${l}] [${os.date("%I:%M")}]`, ...args);
	} else {
		print(`[${s}:${l}] [${os.date("%I:%M")}]`, ...args);
	}
};

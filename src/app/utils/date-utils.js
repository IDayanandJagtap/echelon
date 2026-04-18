export function getStartAndEndDate(today, rangeType, operation) {
	const result = {
		startDate: new Date(today),
		endDate: new Date(today),
	};

	if (String(rangeType).toLowerCase() === "monthly") {
		let targetMonth = today.getMonth() + operation;
		let targetYear = today.getFullYear() + Math.floor(targetMonth / 12);
		targetMonth = (targetMonth + 12) % 12;

		result.startDate = new Date(targetYear, targetMonth, 1);
		result.endDate = new Date(targetYear, targetMonth + 1, 0); // last day of target month
	} else if (String(rangeType).toLowerCase() === "weekly") {
		const dayOfWeek = today.getDay(); // Sunday = 0
		const startOfWeek = new Date(today);
		startOfWeek.setDate(today.getDate() - dayOfWeek + operation * 7);

		const endOfWeek = new Date(startOfWeek);
		endOfWeek.setDate(startOfWeek.getDate() + 6);

		result.startDate = startOfWeek;
		result.endDate = endOfWeek;
	} else if (String(rangeType).toLowerCase() === "yearly") {
		const targetYear = today.getFullYear() + operation;
		result.startDate = new Date(targetYear, 0, 1); // Jan 1st
		result.endDate = new Date(targetYear, 11, 31); // Dec 31st
	}

	return result;
}

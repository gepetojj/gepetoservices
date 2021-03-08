import cache from "memory-cache";

function cacheController(uid) {
	const cachedData = cache.get(uid);

	if (cachedData === null) {
		return { cached: false };
	} else {
		return {
			cached: true,
			data: {
				...cachedData,
				cachedData: true,
			},
		};
	}
}

export default cacheController;

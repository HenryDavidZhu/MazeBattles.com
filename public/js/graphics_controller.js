function displayTab(index, maxIndex) {
	// Tab ids are named in the following structure:
	// menu-1, menu-2, menu-3, ... menu-maxIndex
	for (var i = 0; i < maxIndex; i++) {
		if (i == index) {
			$("#menu-" + i).css({"display":"inline"});
		}
		if (i != index) {
			$("#menu-" + i).css({"display":"none"})
		}
	}
}	
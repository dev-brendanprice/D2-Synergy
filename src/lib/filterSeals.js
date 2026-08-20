function filterSealsBySearch(inputText, {originalSealsArray, mutableSealsArray, setMutableSealsArray}) {
    // originalSealsArray, mutableSealsArray, setMutableSealsArray are useState variables

    // if searchbar is empty, re-populate search box with seals
    if (!inputText) {
        setMutableSealsArray(originalSealsArray);
        return;
    }

    // filter seals based on input text
    const filteredSeals = mutableSealsArray.filter((item) => {
        return item.displayProperties.uiName.toLowerCase().includes(inputText.toLowerCase());
    });
    setMutableSealsArray(filteredSeals);
}

export default filterSealsBySearch;
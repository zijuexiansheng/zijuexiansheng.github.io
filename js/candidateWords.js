function CandidateWords(data, uniqueLetterWords, dupLetterWords) {
    this.data = data;
    this.wordRow = data.length;
    this.wordLen = data.length == 0 ? 0 : data[0].length;
    this.uniqueLetterWords = uniqueLetterWords;
    this.dupLetterWords = dupLetterWords;

    this.uniqueLetterCandidates = [];
    this.uniqueLetterIndex = 0;
    this.dupLetterCandidates = [];
    this.dupLetterIndex = 0;

    this.greenList = [];
    this.orangeList = [];
    this.letterMinCnt = {};
    this.letterExactCnt = {}; // 0 if the letter doesn't exist

    this.run = function() {
        if (this.wordRow == 0) {
            return;
        }

        this.preprocess();
        this.filterCandidates(this.uniqueLetterWords, this.uniqueLetterCandidates);
        this.filterCandidates(this.dupLetterWords, this.dupLetterCandidates);
    };

    this.nextUniqueLetterWords = (n) => {
        const len = this.uniqueLetterCandidates.length;
        if (n === undefined) {
            n = len;
        }

        const ret = this.uniqueLetterCandidates.slice(this.uniqueLetterIndex, this.uniqueLetterIndex + n);
        if (this.uniqueLetterIndex + n >= len) {
            this.uniqueLetterIndex = len;
        } else {
            this.uniqueLetterIndex += n;
        }

        return ret;
    };

    this.nextDupLetterWords = (n) => {
        const len = this.dupLetterCandidates.length;
        if (n === undefined) {
            n = len;
        }

        const ret = this.dupLetterCandidates.slice(this.dupLetterIndex, this.dupLetterIndex + n);
        if (this.dupLetterIndex + n >= len) {
            this.dupLetterIndex = len;
        } else {
            this.dupLetterIndex += n;
        }

        return ret;
    };

    this.preprocess = () => {
        for (let j = 0; j < this.wordLen; ++j) {
            this.greenList.push(null);
            this.orangeList.push([]);
        }

        const green = "green";
        const orange = "orange";
        const gray = "gray";
        // find all Green letters
        for (let i = 0; i < this.wordRow; ++i) {
            for (let j = 0; j < this.wordLen; ++j) {
                if (this.data[i][j][1] === green) {
                    if (this.greenList[j] === null) {
                        this.greenList[j] = this.data[i][j][0];
                    } else if(this.greenList[j] !== this.data[i][j][0]) {
                        throw new Error(`Invalid green letter at row ${i+1} column ${j+1}`);
                    }
                }
            }
        }
        // find explicit orange letters
        for (let i = 0; i < this.wordRow; ++i) {
            for (let j = 0; j < this.wordLen; ++j) {
                if (this.data[i][j][1] === orange) {
                    if (this.greenList[j] === this.data[i][j][0]) {
                        throw new Error(`Invalid orange letter at row ${i+1} column ${j+1}. It's also green in this column`);
                    }
                    if (this.orangeList[j].includes( this.data[i][j][0] )) {
                        continue;
                    }
                    this.orangeList[j].push(this.data[i][j][0]);
                }
            }
        }
        // find true gray letters, implicit orange letter, and count min occurrence for each letter
        for (let i = 0; i < this.wordRow; ++i) {
            const nonGrayLetters = {};
            for (let j = 0; j < this.wordLen; ++j) {
                if (this.data[i][j][1] === gray) {
                    if (this.greenList[j] === this.data[i][j][0]) {
                        throw new Error(`Invalid gray letter at row ${i+1} column ${j+1}. It's green at the same column`);
                    }
                    continue;
                }
                this.incLetterCnt(nonGrayLetters, this.data[i][j][0]);
            }

            // update min occurrence for each letter
            for (let letter in nonGrayLetters) {
                if (this.letterMinCnt.hasOwnProperty(letter)) {
                    if (this.letterMinCnt[letter] < nonGrayLetters[letter]) {
                        this.letterMinCnt[letter] = nonGrayLetters[letter];
                    }
                } else {
                    this.letterMinCnt[letter] = nonGrayLetters[letter];
                }
            }

            for (let j = 0; j < this.wordLen; ++j) {
                const tmpLetter = this.data[i][j][0];
                if (this.data[i][j][1] !== gray) {
                    continue;
                }
                const tmpCnt = this.getLetterCnt(nonGrayLetters, tmpLetter, 0);

                if (this.letterExactCnt.hasOwnProperty(tmpLetter) && this.letterExactCnt[tmpLetter] !== tmpCnt) {
                    throw new Error(`Invalid gray letter at row ${i+1} column ${j+1}. There are ${this.letterExactCnt[tmpLetter]} non-gray letter ${tmpLetter} on other rows, but there there are ${tmpCnt} on row ${i+1}`);
                }
                this.letterExactCnt[tmpLetter] = tmpCnt;

                if (tmpCnt > 0) { // found implicit orange letter
                    if (!this.orangeList[j].includes(tmpLetter)) {
                        this.orangeList[j].push(tmpLetter);
                    }
                }
            }
        }

        for (let letter in this.letterExactCnt) {
            if (!this.letterMinCnt.hasOwnProperty(letter)) {
                continue;
            }

            if (this.letterMinCnt[letter] > this.letterExactCnt[letter]) {
                throw new Error(`Found invalid configuration for letter "${letter}". Please double check your current guesses`);
            }
            this.letterMinCnt[letter] = this.letterExactCnt[letter];
        }
    };

    this.incLetterCnt = (obj, letter) => {
        if (obj.hasOwnProperty(letter)) {
            ++obj[letter];
        } else {
            obj[letter] = 1;
        }
    };

    this.getLetterCnt = (obj, letter, defaultValue) => {
        if (obj.hasOwnProperty(letter)) {
            return obj[letter];
        }
        return defaultValue;
    };

    this.filterCandidates = (words, candidates) => {
        console.log("============> filter candidates");
        console.log(this.greenList);
        console.log(this.orangeList);
        console.log(this.letterMinCnt);
        console.log(this.letterExactCnt);

        words.forEach(word => {
            const letterCnt = {};
            for (let col = 0; col < word.length; ++col) {
                const tmpLetter = word[col];
                // filter by green letter position
                if (this.greenList[col] !== null && this.greenList[col] !== tmpLetter) {
                    return;
                }
                // filter by orange letter position
                if (this.orangeList[col].includes(tmpLetter)) {
                    return;
                }

                this.incLetterCnt(letterCnt, tmpLetter);
            }

            if (word === "agape") {
                console.log("agape: ");
                console.log(letterCnt);
            }

            // filter by exact letter count
            for (let letter in this.letterExactCnt) {
                if (this.letterExactCnt[letter] !== this.getLetterCnt(letterCnt, letter, 0)) {
                    return;
                }
            }
            
            // filter by min letter count
            for (let letter in this.letterMinCnt) {
                if (this.letterMinCnt[letter] > this.getLetterCnt(letterCnt, letter, 0)) {
                    return;
                }
            }

            if (word === "agape") {
                console.log("agape is not filtered out");
            }

            candidates.push(word);
        });

        candidates.sort();
    };
}

function FindRecommendationWords(wordlist, possibleAnswers) {
    this.wordlist = wordlist;
    this.possibleAnswers = possibleAnswers;
    this.nextIndex = 0;
    this.ans = [];

    this.incLetterCnt = (obj, letter, increment) => {
        if (increment === undefined) {
            increment = 1;
        }

        if (obj.hasOwnProperty(letter)) {
            obj[letter] += increment;
        } else {
            obj[letter] = increment;
        }
    };

    this.getLetterCnt = (obj, letter, defaultValue) => {
        if (obj.hasOwnProperty(letter)) {
            return obj[letter];
        } else {
            return defaultValue;
        }
    };

    this.computeLetterWeight = () => {
        const wordLen = this.possibleAnswers[0].length;
        const letterCnt = [];
        const letterWeight = {};

        for (let i = 0; i < wordLen; ++i) {
            letterCnt.push({});
        }

        this.possibleAnswers.forEach((word) => {
            for (let i = 0; i < wordLen; ++i) {
                this.incLetterCnt(letterCnt[i], word[i]);
            }
        });

        this.printObj("letterCnt = ", letterCnt);

        const wordCnt = this.possibleAnswers.length;
        for (let i = 0; i < wordLen; ++i) {
            let s = 0;
            let squareS = 0;
            for (let letter in letterCnt[i]) {
                const tmpCnt = letterCnt[i][letter];
                s += tmpCnt;
                squareS += tmpCnt * tmpCnt;
            }
            console.log(`${squareS}, ${wordCnt}, ${s}`);
            const locInverseWeight = Math.exp(Math.sqrt(squareS / wordCnt - s * s / wordCnt / wordCnt));
            console.log(`locWeight[${i}] = ${locInverseWeight}`);

            for (let letter in letterCnt[i]) {
                this.incLetterCnt(letterWeight, letter, letterCnt[i][letter] / locInverseWeight);
            }
        }

        this.printObj("letterWeight = ", letterWeight);

        return letterWeight;
    };

    this.printObj = (msg, obj) => {
        console.log(`${msg} ${JSON.stringify(obj, null, 4)}`);
    };


    this.sortCandidates = () => {
        if (this.possibleAnswers.length <= 2) {
            this.ans = this.possibleAnswers.map(word => [word, 0, 0]);
            this.ans.sort((a, b) => a[0].localeCompare(b[0]));
            return;
        }

        const scores = [];
        const letterWeight = this.computeLetterWeight();

        this.wordlist.forEach((word) => {
            let weight = 0;
            for (let i = 0; i < word.length; ++i) {
                weight += this.getLetterCnt(letterWeight, word[i], 0);
            }
            if (weight > 0) {
                scores.push([word, weight]);
            }
        }, this);
        
        const possibleAnswersSet = new Set(this.possibleAnswers);
        scores.sort((a, b) => {
            if (a[1] != b[1]) {
                return b[1] - a[1];
            }
            if (possibleAnswersSet.has(a[0])) {
                if (possibleAnswersSet.has(b[0])) {
                    return a[0].localeCompare(b[0]);
                } else {
                    return -1;
                }
            } else {
                if (possibleAnswersSet.has(b[0])) {
                    return 1;
                } else {
                    return a[0].localeCompare(b[0]);
                }
            }
        });

        this.ans = scores;
    };

    this.nextWords = (n) => {
        const len = this.ans.length;
        if (n === undefined) {
            n = len;
        }

        const ret = this.ans.slice(this.nextIndex, this.nextIndex + n);
        if (this.nextIndex + n >= len) {
            this.nextIndex = len;
        } else {
            this.nextIndex += n;
        }

        return ret;
    };
}

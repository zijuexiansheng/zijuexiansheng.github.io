function FindRecommendationWords(wordlist, possibleAnswers) {
    this.wordlist = wordlist;
    this.possibleAnswers = possibleAnswers;
    this.nextIndex = 0;
    this.ans = [];

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
        } else {
            return defaultValue;
        }
    };

    this.cntPossibleWords = (guess, target) => {
        if (guess === target) {
            return 0;
        }

        let wordCnt = 0;

        let greenList = [];
        let orangeList = [];
        let letterExactCnt = {};
        let letterMinCnt = {};
        let letterGuessCnt = {};
        let letterTargetCnt = {};

        const n = guess.length;

        for (let i = 0; i < n; ++i) {
            if (guess[i] === target[i]) {
                greenList.push(guess[i]);
                orangeList.push(null);
            } else {
                greenList.push(null);

                if (target.includes(guess[i])) {
                    orangeList.push(guess[i]);
                } else {
                    orangeList.push(null);
                }
            }

            this.incLetterCnt(letterGuessCnt, guess[i]);
            this.incLetterCnt(letterTargetCnt, target[i]);
        }

        Object.entries(letterGuessCnt).forEach(([letter, letterCnt]) => {
            if (!letterTargetCnt.hasOwnProperty(letter)) {
                letterExactCnt[letter] = 0;
            } else if (letterTargetCnt[letter] < letterCnt) {
                letterExactCnt[letter] = letterTargetCnt[letter];
            } else {
                letterMinCnt[letter] = letterCnt;
            }
        });

        this.possibleAnswers.forEach((word) => {
            let wordLetterCnt = {};

            for (let i = 0; i < n; ++i) {
                this.incLetterCnt(wordLetterCnt, word[i]);
                // filter by greenList
                if (greenList[i] !== null && word[i] !== greenList[i]) {
                    return;
                }
                // filter by orangeList position
                if (orangeList[i] !== null && orangeList[i] === word[i]) {
                    return;
                }
            }
            // filter by exact letter cnt
            for (let letter in letterExactCnt) {
                if (letterExactCnt[letter] !== this.getLetterCnt(wordLetterCnt, letter, 0)) {
                    return;
                }
            }
            // filter by min letter cnt
            for (let letter in letterMinCnt) {
                if (letterMinCnt[letter] > this.getLetterCnt(wordLetterCnt, letter, 0)) {
                    return;
                }
            }

            ++wordCnt;
        });

        return wordCnt;
    };


    this.sortCandidates = () => {
        if (this.possibleAnswers.length <= 2) {
            this.ans = this.possibleAnswers.map(word => [word, 0, 0]);
            this.ans.sort((a, b) => a[0].localeCompare(b[0]));
            return;
        }

        const scores = [];

        const possLen = this.possibleAnswers.length;
        this.wordlist.forEach((word) => {
            let score = 0;
            let squareScore = 0;
            this.possibleAnswers.forEach((candidate) => {
                const tmpScore = this.cntPossibleWords(word, candidate);
                score += tmpScore;
                squareScore += tmpScore * tmpScore;
            }, this);
            scores.push([word, score, squareScore * possLen - score * score]);
        }, this);
        
        const possibleAnswersSet = new Set(this.possibleAnswers);
        scores.sort((a, b) => {
            if (a[1] != b[1]) {
                return a[1] - b[1];
            }
            if (a[2] != b[2]) {
                return a[2] - b[2];
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

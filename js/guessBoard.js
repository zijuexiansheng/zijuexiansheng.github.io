function GuessBoard(domId, resolveBtnDomId, wordLen, maxRow) {
    this.domId = domId;
    this.resolveBtn = document.getElementById(resolveBtnDomId);
    this.wordLen = wordLen === undefined ? 5 : wordLen;
    this.maxRow = maxRow === undefined ? 5 : maxRow;
    this.maxLoc = this.wordLen * this.maxRow;
    this.curLoc = 0;
    this.cellList = [];
    this.guessBoard = null;

    this.initialColor = "gray";
    this.cellColors = {
        gray: "grayCell",
        orange: "orangeCell",
        green: "greenCell"
    };
    this.nextColor = {
        gray: "orange",
        orange: "green",
        green: "gray"
    };

    this.init = function() {
        this.guessBoard = document.getElementById(this.domId);
        this.cellList = this.guessBoard.getElementsByClassName("cell");

        for (let i = 0; i < this.cellList.length; ++i) {
            this.cellList[i].setAttribute("contenteditible", "true");
        }

        this.guessBoard.focus();
        this.setFocus(0);

        this.handleKeyboard();
        this.handleChangeColor();
    }

    this.setFocus = (loc) => {
        const cellFocusedClassName = "cellFocused";
        this.cellList[ this.curLoc ].classList.remove(cellFocusedClassName);
        this.curLoc = loc;
        this.cellList[ loc ].classList.add(cellFocusedClassName);
        this.cellList[ loc ].focus();
    };

    this.handleChangeColor = () => {
        let that = this;
        for (let i = 0; i < this.cellList.length; ++i) {
            this.cellList[ i ].addEventListener("click", () => {
                if (!that.isEmptyCell(i)) {
                    that.setCellColor({loc: i});
                }
            });
        }
    };

    this.isEmptyCell = (loc) => {
        return this.cellList[ loc ].innerHTML.trim() === "";
    };

    this.handleKeyboard = () => {
        let that = this;
        this.guessBoard.addEventListener("keydown", function(event) {
            console.debug(`keydown: ${event.keyCode}, curLoc = ${that.curLoc}`);
            if (event.keyCode >= 65 && event.keyCode <= 90) {
                // letter key
                that.cellList[ that.curLoc ].innerHTML = String.fromCharCode(event.keyCode);
                that.setCellColor({color: that.cellList[ that.curLoc ].getAttribute("data-color")});
                if (that.curLoc + 1 < that.maxLoc) {
                    that.setFocus(that.curLoc + 1);
                }
            } else if (event.keyCode === 8) {
                // backward
                if (that.isEmptyCell( that.curLoc )) {
                    if (that.curLoc > 0) {
                        that.setFocus(that.curLoc - 1);
                        that.cellList[ that.curLoc ].innerHTML = "";
                        that.clearColor();
                    }
                } else {
                    that.cellList[ that.curLoc ].innerHTML = "";
                    that.clearColor();
                }

            } else if (event.keyCode === 13) {
                // enter key
                that.resolveBtn.click();
            }
        });
    };

    this.clearColor = () => {
        const dom = this.cellList[ this.curLoc ];
        const color = dom.getAttribute("data-color");
        if (color !== null) {
            dom.removeAttribute("data-color");
            dom.classList.remove(this.cellColors[color]);
        }
    };

    this.setCellColor = (params) => {
        if (params === undefined) {
            params = {};
        }
        if (params.loc === undefined) {
            params.loc = this.curLoc;
        }

        const dom = this.cellList[ params.loc ];
        const oldColor = dom.getAttribute("data-color");
        if (oldColor === null) {
            params.color = params.color === undefined || params.color === null ? this.initialColor : params.color;
        } else {
            dom.classList.remove(this.cellColors[oldColor]);
            params.color = params.color === undefined || params.color === null ? this.nextColor[oldColor] : params.color;
        }

        dom.setAttribute("data-color", params.color);
        dom.classList.add(this.cellColors[params.color]);
    };

    this.fetchData = () => {
        let lastLoc = this.curLoc;
        if (this.curLoc + 1 == this.maxLoc && !this.isEmptyCell(this.curLoc)) {
            ++lastLoc;
        } 

        if (lastLoc == 0 || lastLoc % this.wordLen !== 0) {
            throw new Error(`Row ${Math.floor(lastLoc / this.wordLen) + 1} isn't complete`);
        }

        const ret = [];
        let curRow = null;
        for (let i = 0; i < lastLoc; ++i) {
            if (i % this.wordLen == 0) {
                if (curRow !== null) {
                    ret.push(curRow);
                }
                curRow = [];
            }

            const curCell = this.cellList[i];
            curRow.push([ curCell.innerHTML.trim().toLowerCase(), curCell.getAttribute('data-color') ]);
        }

        if (curRow !== null) {
            ret.push(curRow);
        }
        return ret;
    };
}

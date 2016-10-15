var Game = (function () {
    function Game(gameColCount, gameRowCount, mineCount, canvasWidth, canvasHeight, canvasGame) {
        this.Width = canvasWidth; // 游戏的宽
        this.Height = canvasHeight; // 游戏的高
        this.ItemWidth = canvasWidth / gameColCount; // 每个格子的宽
        this.ItemHeight = canvasHeight / gameRowCount; // 每个格子的高
        this.CanvasGame = canvasGame; // 保存本游戏的canvas
        this.gameColCount = gameColCount;
        this.gameRowCount = gameRowCount;
        this.mineCount = mineCount;
        this.ctx = this.CanvasGame.getContext("2d");
    }
    Game.prototype.Init = function () {
        Game.thisGame = this;
        this.mineLeft = this.mineCount;
        this.Cells = [];
        // 初始化所有的格
        for (var y = 0; y < this.gameRowCount; y++) {
            this.Cells[y] = [];
            for (var x = 0; x < this.gameColCount; x++) {
                var cell = new Cell();
                cell.Status = CellStatus.Closed;
                cell.HasMine = false;
                cell.SurMineCount = 0;
                cell.HasFlag = false;
                this.Cells[y][x] = cell;
            }
        }
        // 布雷
        var iCount = 0;
        do {
            var iCol = Math.floor(Math.random() * this.gameColCount);
            var iRow = Math.floor(Math.random() * this.gameRowCount);
            if (this.Cells[iRow][iCol].HasMine)
                continue;
            this.Cells[iRow][iCol].HasMine = true;
            // 计算周围雷数
            this.ForeachAround({ x: iCol, y: iRow }, function (cell, pos) {
                cell.SurMineCount++;
                return true;
            });
            iCount++;
        } while (iCount < this.mineCount);
        // event
        this.CanvasGame.addEventListener('mouseup', Game.onMouseUp, false);
    };
    Game.prototype.Draw = function () {
        this.ctx.beginPath(); // 开始路径绘制
        this.ctx.lineWidth = 1.0; // 设置线宽
        this.ctx.fillStyle = "#ffffff";
        // 竖线
        for (var i = 0; i < this.gameColCount; i++) {
            this.ctx.moveTo(i * this.ItemWidth, 0);
            this.ctx.lineTo(i * this.ItemWidth, this.Height);
        }
        // 横线
        for (var i = 0; i < this.gameRowCount; i++) {
            this.ctx.moveTo(0, i * this.ItemHeight);
            this.ctx.lineTo(this.Width, i * this.ItemHeight);
        }
        this.ctx.stroke(); // 进行线的着色，这时整条线才变得可见
        this.ctx.fillRect(0, 0, this.Width, this.Height);
        this.ctx.font = "Bold " + this.ItemWidth / 1.5 + "px Arial";
        for (var x = 0; x < this.gameColCount; x++) {
            for (var y = 0; y < this.gameRowCount; y++) {
                var cell = this.Cells[x][y];
                this.DrawCell({ x: y, y: x });
            }
        }
    };
    Game.prototype.DrawCell = function (loc, backcolor) {
        if (backcolor === void 0) { backcolor = "#eeeeee"; }
        var cell = this.Cells[loc.y][loc.x];
        var x = loc.x;
        var y = loc.y;
        if (cell.Status == CellStatus.Closed) {
            this.ctx.fillStyle = "#bbbbbb";
            this.ctx.fillRect(x * this.ItemWidth + 1, y * this.ItemHeight + 1, this.ItemWidth - 2, this.ItemHeight - 2);
            if (cell.HasFlag) {
                this.ctx.fillStyle = "#ffbbbb";
            }
            this.ctx.fillRect(x * this.ItemWidth + 1, y * this.ItemHeight + 1, this.ItemWidth - 2, this.ItemHeight - 2);
        }
        else {
            this.ctx.fillStyle = backcolor;
            this.ctx.fillRect(x * this.ItemWidth + 1, y * this.ItemHeight + 1, this.ItemWidth - 2, this.ItemHeight - 2);
            this.ctx.font = "Bold " + this.ItemWidth / 3 + "px Arial";
            this.ctx.fillStyle = "#000000";
            var text = '';
            if (cell.HasMine) {
                text = '@';
            }
            else if (cell.SurMineCount != 0) {
                text = cell.SurMineCount.toString();
                switch (cell.SurMineCount) {
                    case 1:
                        this.ctx.fillStyle = "#008800";
                        break;
                    case 2:
                        this.ctx.fillStyle = "#cccc00";
                        break;
                    case 3:
                        this.ctx.fillStyle = "#cc8800";
                        break;
                    case 4:
                        this.ctx.fillStyle = "#ff8800";
                        break;
                    case 5:
                        this.ctx.fillStyle = "#ff0000";
                        break;
                    case 6:
                        this.ctx.fillStyle = "#cc0000";
                        break;
                    case 7:
                        this.ctx.fillStyle = "#aa0000";
                        break;
                    case 8:
                        this.ctx.fillStyle = "#880000";
                        break;
                    default:
                        this.ctx.fillStyle = "#880000";
                        break;
                }
            }
            this.ctx.fillText(text, (x + 0.3) * this.ItemWidth, (y + 0.7) * this.ItemHeight, this.ItemWidth);
        }
    };
    Game.onMouseUp = function (evt) {
        evt.preventDefault();
        var loc = Game.getPointOnCanvas(evt.target, evt.clientX, evt.clientY);
        console.log("button:", evt.button);
        console.log("buttons:", evt.button);
        console.log("ctrlKey:", evt.ctrlKey);
        console.log("shiftKey:", evt.shiftKey);
        console.log("altKey:", evt.altKey);
        if (evt.button == 0) {
            if (!evt.ctrlKey && !evt.shiftKey && !evt.altKey) {
                Game.thisGame.OpenCell(loc);
            }
            if (evt.altKey) {
                Game.thisGame.SwitchFlag(loc);
            }
            if (evt.shiftKey) {
                // 快速打开
                Game.thisGame.OpenAllAround(loc);
            }
        }
        if (evt.button == 1) {
        }
        if (evt.button == 2) {
        }
    };
    // 座标转换。请用event.X，Y来转换，不要用PageX,PageY, 不然滚屏时出错误。
    Game.getPointOnCanvas = function (canvas, x, y) {
        var bbox = canvas.getBoundingClientRect();
        var x2 = (x - bbox.left) * (canvas.width / bbox.width);
        var y2 = (y - bbox.top) * (canvas.height / bbox.height);
        return {
            x: x2,
            y: y2
        };
    };
    Game.prototype.SwitchFlag = function (loc) {
        console.log(loc);
        var x = Math.floor(loc.x / this.ItemWidth);
        var y = Math.floor(loc.y / this.ItemHeight);
        var pos = { x: x, y: y };
        console.log(pos);
        var cell = this.Cells[y][x];
        if (cell.Status == CellStatus.Opened) {
            return;
        }
        cell.HasFlag = !cell.HasFlag;
        this.DrawCell(pos);
    };
    Game.prototype.ForeachAround = function (pos, fun) {
        for (var y = pos.y - 1; y <= pos.y + 1; y++) {
            for (var x = pos.x - 1; x <= pos.x + 1; x++) {
                if (x == pos.x && y == pos.y)
                    continue;
                if (x < 0 || x >= this.gameColCount
                    || y < 0 || y >= this.gameRowCount)
                    continue;
                var cell = this.Cells[y][x];
                if (!fun(cell, { x: x, y: y })) {
                    return;
                }
            }
        }
    };
    Game.prototype.OpenAllAround = function (loc) {
        var thisGame = this;
        console.log(loc);
        var x = Math.floor(loc.x / this.ItemWidth);
        var y = Math.floor(loc.y / this.ItemHeight);
        var pos = { x: x, y: y };
        console.log(x, y);
        var cell = this.Cells[y][x];
        if (cell.Status == CellStatus.Closed) {
            return;
        }
        var flagCount = 0;
        this.ForeachAround(pos, function (cell, loc) {
            if (cell.Status == CellStatus.Opened)
                return true;
            if (cell.HasFlag)
                flagCount++;
            return true;
        });
        if (flagCount == cell.SurMineCount) {
            this.ForeachAround(pos, function (cell, loc) {
                if (cell.HasFlag)
                    return true;
                cell.Status = CellStatus.Opened;
                thisGame.DrawCell(loc);
                if (cell.HasMine) {
                    thisGame.SetLose(loc);
                    return false;
                }
                thisGame.OpenNeiberZero(loc);
                return true;
            });
        }
    };
    Game.prototype.OpenCell = function (loc) {
        console.log(loc);
        var x = Math.floor(loc.x / this.ItemWidth);
        var y = Math.floor(loc.y / this.ItemHeight);
        var pos = { x: x, y: y };
        console.log(x, y);
        var cell = this.Cells[y][x];
        if (cell.Status == CellStatus.Opened) {
            return;
        }
        // 如果是雷，那么输了。全开。
        if (cell.HasMine) {
            this.SetLose(pos);
            return;
        }
        // 如果是数字，那么只开一个。
        if (cell.SurMineCount != 0) {
            if (cell.Status == CellStatus.Closed) {
                cell.Status = CellStatus.Opened;
                this.DrawCell(pos);
            }
        }
        else {
            // 如果是0，那么开所有的相连的零。
            this.OpenNeiberZero(pos);
        }
        if (this.CheckWin() == true) {
            this.Draw();
            window.alert("You Win!!");
            return;
        }
    };
    Game.prototype.CheckWin = function () {
        // 如果有close的不是雷，那么就还没赢
        for (var y = 0; y < this.gameRowCount; y++) {
            for (var x = 0; x < this.gameColCount; x++) {
                var cell = this.Cells[y][x];
                if (cell.Status == CellStatus.Closed && cell.HasMine)
                    return false;
            }
        }
        this.SetAllOpen();
        return true;
    };
    // 打开相连的 0 cell
    Game.prototype.OpenNeiberZero = function (pos) {
        var cell = this.Cells[pos.y][pos.x];
        cell.Status = CellStatus.Opened;
        this.DrawCell(pos);
        if (cell.SurMineCount != 0)
            return;
        if (cell.HasMine)
            return;
        var thisGame = this;
        this.ForeachAround(pos, function (cell, loc) {
            if (cell.Status == CellStatus.Opened)
                return true;
            thisGame.OpenNeiberZero(loc);
            return true;
        });
    };
    Game.prototype.SetLose = function (loseFrom) {
        this.SetAllOpen();
        this.Draw();
        this.DrawCell(loseFrom, "#ff0000");
    };
    Game.prototype.SetAllOpen = function () {
        for (var y = 0; y < this.gameRowCount; y++) {
            for (var x = 0; x < this.gameColCount; x++) {
                var cell = this.Cells[y][x];
                cell.Status = CellStatus.Opened;
            }
        }
    };
    return Game;
})();
var CellStatus;
(function (CellStatus) {
    CellStatus[CellStatus["Closed"] = 0] = "Closed";
    CellStatus[CellStatus["Opened"] = 1] = "Opened";
})(CellStatus || (CellStatus = {}));
var Cell = (function () {
    function Cell() {
    }
    return Cell;
})();
var Loc = (function () {
    function Loc() {
    }
    return Loc;
})();
//# sourceMappingURL=mime.js.map
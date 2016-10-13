class Game
{
    Width :number; // 游戏的宽
    Height : number; // 游戏的高
    ItemWidth :number; // 每个格子的宽
    ItemHeight : number; // 每个格子的高
    CanvasGame :HTMLCanvasElement; // 保存本游戏的canvas
    gameColCount:number;
    gameRowCount:number;
    mineCount:number;
    mineLeft:number;
    Cells:[[Cell]];
    ctx:CanvasRenderingContext2D;

    static thisGame:Game;

    constructor(
        gameColCount:number,
        gameRowCount:number,
        mineCount:number,
        canvasWidth:number,
        canvasHeight:number,
        canvasGame:HTMLCanvasElement)
    {
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


    public Init() {
        Game.thisGame = this;
        this.mineLeft = this.mineCount;
        this.Cells = [];
        // 初始化所有的格
        for (var y = 0; y < this.gameRowCount; y++)
        {
            this.Cells[y] = [];
            for(var x = 0; x <  this.gameColCount;x ++){
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
        do
        {
            var iCol = Math.floor(Math.random() * this.gameColCount);
            var iRow = Math.floor(Math.random() * this.gameRowCount);
            if (this.Cells[iRow][iCol].HasMine)
                continue;

            this.Cells[iRow][iCol].HasMine = true;

            // 计算周围雷数
            this.ForeachAround({x:iCol,y:iRow}, function(cell, pos){
                cell.SurMineCount ++;
                return true;
            });

            iCount++;
        }while(iCount < this.mineCount);

        // event
        this.CanvasGame.addEventListener('mouseup', Game.onMouseUp, false);

    }

    public Draw(){
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
        this.ctx.font = "Bold "+this.ItemWidth / 1.5 +"px Arial";
        for (var i = 0; i < this.gameColCount; i++) {
            for (var j = 0; j < this.gameRowCount; j++) {
                var cell = this.Cells[i][j];
                this.DrawCell(j, i)
            }
        }
    }

    DrawCell(x,y, backcolor:string = "#eeeeee")
    {
        var cell = this.Cells[y][x];
        var j = x;
        var i = y;
        if (cell.Status == CellStatus.Closed){

            this.ctx.fillStyle = "#bbbbbb";
            this.ctx.fillRect(j * this.ItemWidth + 1, i * this.ItemHeight + 1, this.ItemWidth - 2, this.ItemHeight - 2 );
            if (cell.HasFlag)
            {
                this.ctx.fillStyle = "#ffbbbb";
            }
            this.ctx.fillRect(j * this.ItemWidth + 1, i * this.ItemHeight + 1, this.ItemWidth - 2, this.ItemHeight - 2 );
        }
        else
        {
            this.ctx.fillStyle =backcolor;
            this.ctx.fillRect(j * this.ItemWidth + 1, i * this.ItemHeight + 1, this.ItemWidth - 2, this.ItemHeight - 2 );
            this.ctx.font = "Bold " + this.ItemWidth/3  + "px Arial";
            this.ctx.fillStyle = "#000000";
            var text = '';
            if (cell.HasMine)
            {
                text = '@';
            }
            else if (cell.SurMineCount != 0)
            {
                text = cell.SurMineCount.toString();
                switch(cell.SurMineCount){
                    case 1:
                        this.ctx.fillStyle = "#008800";
                        break;
                    case 2:
                        this.ctx.fillStyle = "#888800";
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

            this.ctx.fillText(text,
                (x + 0.3) * this.ItemWidth, (y + 0.7) * this.ItemHeight, this.ItemWidth);
        }
    }

    static onMouseUp(evt) {
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
            if (evt.ctrlKey)  // 插旗
            {
                Game.thisGame.SwitchFlag(loc);
            }
            if(evt.altKey)
            {
                // 快速打开
                Game.thisGame.OpenAllAround(loc);
            }
        }

        if (evt.button == 1) // 中键
        {

        }
        if (evt.button == 2) // 右键
        {

        }
    }

    // 座标转换。请用event.X，Y来转换，不要用PageX,PageY, 不然滚屏时出错误。
    static getPointOnCanvas(canvas, x, y) {
        var bbox = canvas.getBoundingClientRect();
        var x2 = (x - bbox.left) * (canvas.width / bbox.width);
        var y2 = (y - bbox.top) * (canvas.height / bbox.height);
        return {
            x: x2,
            y: y2
        };
    }

    SwitchFlag(loc:Loc) {
        console.log(loc);
        var x = Math.floor(loc.x / this.ItemWidth);
        var y = Math.floor(loc.y / this.ItemHeight);
        var pos:Loc = {x: x, y: y};
        console.log(x, y);
        var cell = this.Cells[y][x];
        if (cell.Status == CellStatus.Opened)
        {
            return;
        }

        cell.HasFlag = !cell.HasFlag ;
        this.DrawCell(x, y);
    }

    ForeachAround(pos, fun)
    {
        for (var y = pos.y - 1; y <= pos.y + 1; y++) {
            for (var x = pos.x - 1; x <= pos.x + 1; x++) {

                if (x == pos.x && y == pos.y)
                    continue;
                if (x < 0 || x >= this.gameColCount
                    || y < 0 || y >= this.gameRowCount)
                    continue;

                var cell = this.Cells[y][x];
                if (!fun(cell, {x:x, y:y}))
                {
                    return;
                }
            }
        }
    }

    OpenAllAround(loc:Loc) {
        var thisGame = this;
        console.log(loc);
        var x = Math.floor(loc.x / this.ItemWidth);
        var y = Math.floor(loc.y / this.ItemHeight);
        var pos:Loc = {x: x, y: y};
        console.log(x, y);
        var cell = this.Cells[y][x];
        if (cell.Status == CellStatus.Closed)
        {
            return;
        }
        var flagCount = 0;
        this.ForeachAround(pos, function(cell, loc){
            if (cell.Status == CellStatus.Opened)
               return true;

            if (cell.HasFlag) flagCount ++;
            return true;
        });

        if (flagCount == cell.SurMineCount) // 旗帜与雷数相等, 可以全开。
        {

            this.ForeachAround(pos, function(cell, loc){
                if (cell.HasFlag) // 有旗的不开。
                    return true;

                cell.Status = CellStatus.Opened;
                thisGame.Draw(loc.x, loc.y);
                if(cell.HasMine)
                {
                    thisGame.SetLose(loc);
                    return false;
                }
                return true;
            });
        }



    }
    OpenCell(loc:Loc)
    {
        console.log(loc);
        var x = Math.floor(loc.x/this.ItemWidth);
        var y = Math.floor(loc.y / this.ItemHeight);
        var pos:Loc = {x:x,y:y};
        console.log(x, y);
        var cell = this.Cells[y][x];
        if (cell.Status == CellStatus.Opened)
        {
            return;
        }
        // 如果是雷，那么输了。全开。
        if (cell.HasMine)
        {
            this.SetLose(pos);
            return;
        }
        // 如果是数字，那么只开一个。
        if (cell.SurMineCount != 0)
        {
            if (cell.Status == CellStatus.Closed) {
                cell.Status = CellStatus.Opened;
                this.DrawCell(x, y);
            }
        }
        else{
            // 如果是0，那么开所有的相连的零。
            this.OpenNeiberZero(pos);
        }
        if(this.CheckWin()==true)
        {
            this.Draw();
            window.alert("You Win!!")
            return;
        }
    }

    CheckWin():boolean
    {
        // 如果有close的不是雷，那么就还没赢
        for (var y = 0; y < this.gameRowCount; y++)
        {
            for(var x = 0; x <  this.gameColCount;x ++){
                var cell = this.Cells[y][x];
                if (cell.Status == CellStatus.Closed && cell.HasMine)
                    return false;
            }
        }
        this.SetAllOpen();
        return true;
    }

    // 打开相连的 0 cell
    OpenNeiberZero(pos)
    {
        var cell = this.Cells[pos.y][pos.x];
        cell.Status = CellStatus.Opened;
        this.DrawCell(pos.x, pos.y);

        if (cell.SurMineCount != 0)
            return;
        if (cell.HasMine)
            return;
        var thisGame = this;
        this.ForeachAround(pos, function(cell, loc){
            if (cell.Status == CellStatus.Opened)
                return true;

            thisGame.OpenNeiberZero(loc);
            return true;
        });
    }

    SetLose(loseFrom:Loc)
    {
        this.SetAllOpen();
        this.Draw();
        this.DrawCell(loseFrom.x,loseFrom.y,"#ff0000");
    }

    SetAllOpen()
    {
        for (var y = 0; y < this.gameRowCount; y++)
        {
            for(var x = 0; x <  this.gameColCount;x ++){
                var cell = this.Cells[y][x];
                cell.Status = CellStatus.Opened;
            }
        }
    }
}

enum CellStatus{
    Closed,
    Opened
}

class Cell{
    Status : CellStatus;
    HasMine: boolean;
    SurMineCount:number;
    HasFlag:boolean;
}

class Loc
{
    x:number;
    y:number;
}

// 格子类， 一个对象代表一个小格格。
function Cell(n) {
    this.N = n;   //数字类
    this.Fixed = true; // 是否是固定的数字格？ 
    this.OptNumbes = null; // 可填数字
    this.InConflict = false;  // 是否此格与其他格有冲突
}


Cell.prototype.toString = function () {
    if (this.N == null || this.N == undefined) {
        return "";
    }

    return this.N.toString();
};

// 1-5
function Sudo(width, height, canvasGame) {
    
    this.Cells = null; // 9*9的格子，会在Init里做初始化
    this.Width = width; // 游戏的宽
    this.Height = height; // 游戏的高
    this.ItemWidth = width / 9; // 每个格子的宽
    this.ItemHeight = height / 9; // 每个格子的高
    this.ShowOptionNumber = false; //是否显示可选数字
    this.CanvasGame = canvasGame; // 保存本游戏的canvas
    this.bUseBuffer = true;
    this.EditingCellIndex = null; // 正在编辑状态的格子索引
    this.EditPannel = null; // 正在编辑状态时，指向编辑板实例。不在编辑状态时，指向null;
    
    // double buffer
    this.ctx2 = this.CanvasGame.getContext("2d");
    
    this.setUseBuffer = function (b)
    {
        this.bUseBuffer = b;
    }
    
    // 初始化一个sudo.
    this.Init = function (level) {
        this.Cells = [
            [new Cell(1), new Cell(2), new Cell(3), new Cell(4), new Cell(5), new Cell(6), new Cell(7), new Cell(8), new Cell(9)],
            [new Cell(4), new Cell(5), new Cell(6), new Cell(7), new Cell(8), new Cell(9), new Cell(1), new Cell(2), new Cell(3)],
            [new Cell(7), new Cell(8), new Cell(9), new Cell(1), new Cell(2), new Cell(3), new Cell(4), new Cell(5), new Cell(6)],
            [new Cell(2), new Cell(3), new Cell(4), new Cell(5), new Cell(6), new Cell(7), new Cell(8), new Cell(9), new Cell(1)],
            [new Cell(5), new Cell(6), new Cell(7), new Cell(8), new Cell(9), new Cell(1), new Cell(2), new Cell(3), new Cell(4)],
            [new Cell(8), new Cell(9), new Cell(1), new Cell(2), new Cell(3), new Cell(4), new Cell(5), new Cell(6), new Cell(7)],
            [new Cell(3), new Cell(4), new Cell(5), new Cell(6), new Cell(7), new Cell(8), new Cell(9), new Cell(1), new Cell(2)],
            [new Cell(6), new Cell(7), new Cell(8), new Cell(9), new Cell(1), new Cell(2), new Cell(3), new Cell(4), new Cell(5)],
            [new Cell(9), new Cell(1), new Cell(2), new Cell(3), new Cell(4), new Cell(5), new Cell(6), new Cell(7), new Cell(8)]
        ];

        for (var i = 0; i < 9; i++) {
            // 找两个对调数字
            var n1 = this.Cells[0][i].N; // 从第一行依次取数与后面的某数字对调
            var i2 = Math.floor(Math.random() * (9 - i - 1)) + i;
            var n2 = this.Cells[0][i2].N;
            this.swapSudoNumber(n1, n2);
        }

        // 开始随机删除数字
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (Math.random() * 6 < level) {
                    this.Cells[i][j].N = null;
                    this.Cells[i][j].Fixed = false;
                }
            }
        }

        this.CalcAllOptNumber();

        this.CanvasGame.addEventListener('mousemove', onMouseMove, false);
        this.CanvasGame.addEventListener('mousedown', onMouseDown, false);
        this.CanvasGame.addEventListener('mouseup', onMouseUp, false);

    };

    // 计算所有格子里的可选数字
    this.CalcAllOptNumber = function () {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (this.Cells[i][j].Fixed == false) {
                    var l = this.CalcOptNumber({ i: i, j: j });
                    this.Cells[i][j].OptNumbes = l;
                }
            }
        }
    };

    // 交换整个sudo里的两个数字
    this.swapSudoNumber = function (n1, n2) {
        if (n1 == n2)
            return;
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {

                if (this.Cells[i][j].N == n1) {
                    this.Cells[i][j].N = n2;
                }
                else if (this.Cells[i][j].N == n2) {
                    this.Cells[i][j].N = n1;
                }
                else {
                    // do nothing
                }
            }
        }
    };

    // 绘制sudo
    this.Draw = function (){
        
        var width = this.Width;
        var height = this.Height;
        var itemWidth = width / 9;
        var itemHeight = height / 9;
        
        
        var cvBuffer = null; 
        var ctx2 = null;
        if (this.bUseBuffer)
        {
            cvBuffer = document.createElement("canvas");
            cvBuffer.width = this.CanvasGame.width;
            cvBuffer.height = this.CanvasGame.height;
            cvBuffer.style.width = this.CanvasGame.style.width;
            cvBuffer.style.height = this.CanvasGame.style.height;
            
            ctx2 = cvBuffer.getContext("2d"); 
        }
        else
        {
            ctx2 = this.ctx2;
        }
       
        
        ctx2.fillStyle = "#ffffff";
        ctx2.fillRect(0, 0, this.Width, this.Height);

        ctx2.font = "Bold "+this.ItemWidth / 1.5 +"px Arial";

        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                var cell = this.Cells[i][j];
                // 如果是固定格，那么画底纹
                if (cell.Fixed) {
                    ctx2.fillStyle = "#dddddd";
                    ctx2.fillRect(j * itemWidth, i * itemHeight, itemWidth, itemHeight);                    
                }

                ctx2.fillStyle = "#008800";
                if (cell.N == null) {
                    if (this.ShowOptionNumber) {
                        var optns = cell.OptNumbes.join("");
                        // 分为5个一行
                        var optnList = this.ReSegString(optns, 3);
                        ctx2.save();
                        ctx2.font = "Bold " + this.ItemWidth / 3 + "px Arial";
                        for (var k = 0; k < optnList.length; k++) {
                            ctx2.fillText(optnList[k], (j+0.1) * this.ItemWidth, (i+0.3) * this.ItemHeight  + k *(this.ItemHeight /3) , this.ItemWidth);
                        }
                        ctx2.restore();
                    }
                    else {
                        // ctx2.fillText(cell.N.toString(), j * itemWidth + 15, i * itemHeight + 30);
                    }
                }
                else {
                    if (cell.InConflict) {
                        ctx2.fillStyle = "red";
                    }
                    else if (cell.Fixed) {
                        ctx2.fillStyle = "#000000";
                    }
                    else{
                        ctx2.fillStyle = "#008800";
                    }
                    ctx2.fillText(cell.N.toString(), (j +0.3)* itemWidth , (i + 0.8) * itemHeight);
                }
                
            }
        }
        ctx2.lineWidth = 1.0; // 设置线宽
        ctx2.strokeStyle = "#000000"; // 设置线的颜色
        for (var i = 0; i < 10; i++) {
            if (i % 3 == 0) {
                ctx2.lineWidth = 3.0; // 设置线宽
            }
            else {
                ctx2.lineWidth = 1.0; // 设置线宽
            }

            ctx2.beginPath(); // 开始路径绘制
            ctx2.moveTo(i * itemWidth, 0);
            ctx2.lineTo(i * itemWidth, height);

            ctx2.moveTo(0, i * itemHeight);
            ctx2.lineTo(width, i * itemHeight);

            ctx2.stroke(); // 进行线的着色，这时整条线才变得可见
        }
        
        if (this.bUseBuffer)
        {
            this.ctx2.drawImage(cvBuffer, 0, 0);
        }
        else
        {
            
        }
    };

    // 分段字串
    this.ReSegString = function(s,n)
    {
        var s2 = "";
        var l = [];
        for (var i = 0; i < s.length; i++)
        {
            if (i != 0 && i % n == 0)
            {
                l.push(s2);
                s2 = "";
            }
            s2 += s.charAt(i);
        }
        l.push(s2);
        return l;
    };

    // 从一个座标计算下面的格子索引值
    this.getCellIndex = function (pos) {
        var j = Math.floor(pos.x / this.ItemWidth);
        var i = Math.floor(pos.y / this.ItemHeight);
        return {
            j: j,
            i: i
        };
    };

    // 处理点击
    this.ProcMouseClick = function (pos) {
        if (this.EditingCellIndex == null) {
            // 非编辑状态进入编辑状态        
            var index = sudo.getCellIndex(pos);
            if (index.i < 0 || index.i > 8 || index.j < 0 || index.j > 8) {
                this.EditingCellIndex = null;
                this.EditPannel = null;
                // 重新画整个版面。
                this.Draw();
                return;
            }
            var cell = this.Cells[index.i][index.j];
            if (cell.Fixed == true) {
                this.EditingCellIndex = null;
                this.EditPannel = null;
                // 重新画整个版面。
                this.Draw();
                return;
            }

            this.EditingCellIndex = index;
            // 计算该格可以放的内容
            var nList = null;
            if (this.ShowOptionNumber) {
                nList = this.CalcOptNumber(index);
            }
            else {
                nList = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            }

            // 画个版子。
            this.EditPannel = new EditPannel(pos.x, pos.y, this.ItemWidth / 1.5, nList, this.Width, this.Height);
            this.EditPannel.Draw(ctx);
        }
        else {
            // 编辑状态选定数字，进入非编辑状态
            var seleN = this.EditPannel.GetHitNumber(pos.x, pos.y);
            if (seleN == null) {
                this.Cells[this.EditingCellIndex.i][this.EditingCellIndex.j].N = null;
            }
            else if (seleN == -1) { // 点在外面了
                this.EditingCellIndex = null;
                this.EditPannel = null;
                // 重新画整个版面。
                this.Draw();
                this.ProcMouseClick(pos);
                return;
            }
            else {
                this.Cells[this.EditingCellIndex.i][this.EditingCellIndex.j].N = seleN;                
            }
            
            this.EditingCellIndex = null;
            this.EditPannel = null;
            // 重新画整个版面。
            this.CalcAllOptNumber();
            this.CheckAllConflict();
            this.Draw();
            if (this.CheckWin())
                this.ShowWin();
        }
    };

    // 显示"你赢了"画面
    this.ShowWin = function ()
    {
        alert("You Win!!!");
    };

    // 计算可以用于该格的N们
    this.CalcOptNumber = function (index) {
        var l = [1,2,3,4,5,6,7,8,9];
        // 查找横行, 去掉所有已经有的数字
        for (var i = 0; i < 9; i++)
        {
            if (this.Cells[index.i][i].N == null || i == index.j)
                continue;

            l[this.Cells[index.i][i].N - 1] = null;
        }
        // 查找竖行, 去掉所有已经有的数字
        for (var i = 0; i < 9; i++) {
            if (this.Cells[i][index.j].N == null || i == index.i)
                continue;

            l[this.Cells[i][index.j].N - 1] = null;
        }

        // 查找所在9格
        var iStart = Math.floor(index.i / 3) * 3;
        var jStart = Math.floor(index.j / 3) * 3;
        for (var i = iStart; i < iStart + 3; i++)
        {
            for (var j = jStart; j < jStart + 3; j++)
            {
                if (this.Cells[i][j].N == null || (i == index.i && j == index.j))
                    continue;
                l[this.Cells[i][j].N - 1] = null;
            }
        }

        // 加上自己
        //var n = this.Cells[index.i][index.j];
        //l[n - 1] = n;
        

        return l;
    };

    // 检查所有的格子冲突
    this.CheckAllConflict = function ()
    {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                this.Cells[i][j].InConflict = this.CheckConflict({ i: i, j: j });
            }
        }
    };

    // 检查是否已经赢了
    this.CheckWin = function ()
    {
        this.CheckAllConflict();

        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (this.Cells[i][j].N == null || this.Cells[i][j].InConflict)
                    return false;

            }
        }
        return true;
    };

    // 检查某格是否有冲突
    this.CheckConflict = function (index) {
        
        var cell = this.Cells[index.i][index.j];
        if (cell.N == null || cell.N == undefined)
        {
            return false;
        }
        // 查找横行
        for (var i = 0; i < 9; i++) {
            if (this.Cells[index.i][i].N == cell.N && i != index.j) {
                return true;
            }
        }
        // 查找竖行
        for (var i = 0; i < 9; i++) {
            if (this.Cells[i][index.j].N == cell.N && i != index.i)
                return true;
        }

        // 查找所在9格
        var iStart = Math.floor(index.i / 3) * 3;
        var jStart = Math.floor(index.j / 3) * 3;

        for (var i = iStart; i < iStart + 3; i++) {
            for (var j = jStart; j < jStart + 3; j++) {
                if (this.Cells[i][j].N == cell.N && i != index.i && j != index.j)
                    return true;
            }
        }

        return false;
    };

    // 切换是否显示可选数字
    this.ToggleShowOptionNumber = function ()
    {
        this.ShowOptionNumber = !this.ShowOptionNumber;

        this.EditPannel = null;
        this.EditingCellIndex = null;

        return this.ShowOptionNumber;

    };

    // 切换编辑模式
    this.ToggleEditMode = function ()
    {
        this.EditMode = !this.EditMode;

        if (this.EditMode) {
            // 进入编辑模式
            for (var i = 0; i < 9; i++)
            {
                for (var j = 0; j < 9; j++)
                {
                    this.Cells[i][j].Fixed = false;
                }
            }
        }
        else {
            // 退出编辑模式
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    if (this.Cells[i][j].N == null)
                        this.Cells[i][j].Fixed = false;
                    else
                        this.Cells[i][j].Fixed = true;
                }
            }
        }

        this.EditPannel = null;
        this.EditingCellIndex = null;
        return this.EditMode;
    };

    this.ClearAll = function()
    {
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                if (
                this.Cells[i][j].Fixed == false) {
                    this.Cells[i][j].N = null;
                    this.Cells[i][j].InConflict = false;
                }
            }
        }
        this.CalcAllOptNumber();
        this.CheckAllConflict();
        this.EditPannel = null;
        this.EditingCellIndex = null;
    };
}

function InArray(obj, arr) {
    for (var i in arr) {
        if (arr[i] == obj) {
            return true;
        }
    }
    return false;
}

// 编辑板类
function EditPannel(x, y, ItemWidth, NList, maxWidth, maxHeight) {
    this.ItemWidth = ItemWidth;
    this.X = x;
    this.Y = y;
    this.NList = NList;
    this.W = this.ItemWidth * 3;
    this.H = this.ItemWidth * 4;
    this.DrawX = this.X - this.W / 2;
    this.DrawY = this.Y - this.H / 2;

    if (this.DrawX < 0)
        this.DrawX = 0;
    if (this.DrawY < 0)
        this.DrawY = 0;

    if (this.DrawX + this.W > maxWidth)
        this.DrawX = maxWidth - this.W;
    if (this.DrawY + this.H > maxHeight)
        this.DrawY = maxHeight - this.H;

}

// 在合适的位置上画一个编辑版
EditPannel.prototype.Draw = function () {
    // 在合适的位置上画一个编辑版
    ctx.fillStyle = 'pink';
    ctx.fillRect(this.DrawX, this.DrawY, this.W, this.H);
    ctx.strokeStyle = "#000000"; // 设置线的颜色
    ctx.lineWidth = 2.0; // 设置线宽
    ctx.strokeRect(this.DrawX, this.DrawY, this.W, this.H);
    ctx.strokeStyle = "#000000"; // 设置线的颜色
    ctx.lineWidth = 1.0; // 设置线宽
    for (var i = 1; i <= 9; i++) {
        var itemX = this.DrawX + ((i - 1) % 3) * this.ItemWidth;
        var itemY = this.DrawY + Math.floor((i - 1) / 3) * this.ItemWidth;
        ctx.strokeStyle = "#000000"; // 设置线的颜色
        ctx.strokeRect(
            itemX,
            itemY,
            this.ItemWidth, this.ItemWidth);
        if (InArray(i, this.NList)) {
            ctx.fillStyle = "green"; // 设置线的颜色
            ctx.font = "Bold " + (this.ItemWidth / 2) + "px Arial";
            ctx.fillText(i.toString(), itemX + this.ItemWidth / 3, itemY + this.ItemWidth / 1.5);
        }
    }
};

// 得到给定座标上的数字。
EditPannel.prototype.GetHitNumber = function (x, y) {
    var j = Math.floor((x - this.DrawX) / this.ItemWidth);
    var i = Math.floor((y - this.DrawY) / this.ItemWidth);

    if (j < 0 || j > 2 || i < 0 || i > 3) // 范围外
    {
        return -1;
    }

    if (i == 3)
        return null;

    var n = i * 3 + j + 1;

    if (!InArray(n, this.NList)) {
        return null;
    }
    return n;
};

// debug用的
function allPrpos(obj) {
    // 用来保存所有的属性名称和值 
    var props = "";
    // 开始遍历 
    for (var p in obj) { // 方法 
        if (typeof (obj[p]) == "function") {
            //obj[p]();
            props += p + " = function() <br /> ";
        } else { // p 为属性名称，obj[p]为对应属性的值 
            props += p + " = " + obj[p] + " <br /> ";
        }
    } // 最后显示所有的属性 
    return props;
}


// 事件处理。
function onMouseMove(evt) {
    //    var loc = getPointOnCanvas(evt.target, evt.x, evt.y);
    //    var index = sudo.getCellIndex(evt.target, loc);
}

function onMouseDown(evt) {
    //var loc = getPointOnCanvas(evt.target, evt.x, evt.y);
    //sudo.ProcMouseClick(loc);
    //spPos.innerHTML = allPrpos(evt);
}

function onMouseUp(evt) {
    //evt.PerventDefault();
    var loc = getPointOnCanvas(evt.target, evt.clientX, evt.clientY);
    sudo.ProcMouseClick(loc);
    //var index = sudo.getCellIndex(loc);

}

// 座标转换。请用event.X，Y来转换，不要用PageX,PageY, 不然滚屏时出错误。
function getPointOnCanvas(canvas, x, y) {
    var bbox = canvas.getBoundingClientRect();
    var x2 = (x - bbox.left) * (canvas.width / bbox.width);
    var y2 = (y - bbox.top) * (canvas.height / bbox.height);
    return {
        x: x2,
        y: y2
    };
}

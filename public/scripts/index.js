const board = document.getElementById('chessBoard');
const file = 8;
const rank = 8;


function square(parent, file, rank) {
    const height = (file-1)*12.5;
    const width = (rank-1)*12.5;
    let divBox = document.createElement("div");
    divBox.style.width = "12.5%";
    divBox.style.height = "12.5%";
    if((file+rank)%2 == 0)
    divBox.style.background = "#d3dee0";
    else
        divBox.style.background = "#328fa8";
    divBox.style.marginTop = height+"%";
    divBox.style.marginLeft = width+"%";
    divBox.style.position = "absolute";
    parent.appendChild(divBox);
}
for(let i=1;i<=file;i++)    {
    for(let j = 1;j<=rank;j++)  {
        square(board, i, j);
    }
}

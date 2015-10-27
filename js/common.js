function getTime() {
    var now = new Date();
    var Y = now.getFullYear();
    var M = now.getMonth() + 1;
    var D = now.getDate();
    var h = now.getHours();
    var m = now.getMinutes();
    var s = now.getSeconds();
    if (m < 10) m = '0' + m;
    if (s < 10) s = '0' + s;
    return Y + '-' + M + '-' + D + ' ' + h + ":" + m + ':' + s;
}
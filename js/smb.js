var smb = new Vue({
    el: "#smb",
    data: {
        ipt: '',
        msg: ''
    },
    computed: {
        ret: function(){
            return this.ipt.replace(/smb:/,'').replace(/\//g,'\\');
        }
    }
});

var btnGetLink = $('#btn-get-link');
var btnGetLinkCopy = new ZeroClipboard(btnGetLink);

btnGetLinkCopy.on('ready', function () {
    btnGetLinkCopy.on("aftercopy", function () {
        smb.msg = getTime() + ' 已复制';
    });
});
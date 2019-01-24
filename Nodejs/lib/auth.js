module.exports = {
    IsOwner: function(request, response) {
        if (request.user) {
            return true;
        } else {
            return false;
        }
    },
    StatusUI: function(request, response) {
        var authStatusUI = '<a href="/auth/login">login</a> | <a href="/auth/register">register</a>';
        if (this.IsOwner (request, response)) {
            console.log('statusui', request.user)
            authStatusUI = `${request.user.info.nickname} | <a href="/auth/logout">logout</a>`;
        }
        return authStatusUI;
    }
}
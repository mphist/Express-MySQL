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
            authStatusUI = `${JSON.parse(request.user.jdoc).nickname} | <a href="/auth/logout">logout</a>`;
        }
        return authStatusUI;
    }
}

var async = require('async');

var Handlebars = require('handlebars');

require('./extensions');

var internal =
{
    bindHashChange: function ()
    {
        $(window).on('hashchange', function ()
        {
            internal.loadRouteFromHash();
        });
    },

    getRouteFromHash: function ()
    {
        var hash = window.location.hash;

        if (hash.startsWith('#!')) return hash.substring(2);

        if (hash.startsWith('#')) return hash.substring(1);
        
        return hash;
    },

    loadRouteFromHash: function ()
    {
        var route = internal.getRouteFromHash();

        this.sparrow.loadRoute(
            route,
            function (result)
            {
            });
    },

    getViewUrlFromRoute: function (route)
    {
        if (route == '') return 'views/view.html';

        return 'views/' + route + '/view.html';
    },

    getModelUrlFromRoute: function (route)
    {
        return 'service/' + route;
    },

    compileView: function (view)
    {
        return Handlebars.compile(view);
    },

    getMainFrame: function ()
    {
        return $('main');
    }
};

module.exports = function()
{
    internal.sparrow =
    {
        onError: function (error)
        {
            alert('ERROR ' + error);
        },

        loadRoute: function (route)
        {
            async.parallel(
                {
                    model: function (end)
                    {
                        internal.sparrow.getModel(route, function (result)
                        {
                            end(null, result);
                        });
                    },

                    view: function (end)
                    {
                        internal.sparrow.getView(route, function (result)
                        {
                            end(null, internal.compileView(result));
                        });
                    }
                },
                function (error, results)
                {
                    var output = results.view(results.model);

                    internal.getMainFrame().html(output);
                });
        },

        getView: function (route, success)
        {
            $.ajax(
                {
                    url: internal.getViewUrlFromRoute(route),

                    type: 'GET'
                })
                .done(function (
                    response,
                    textStatus,
                    jqXhr)
                {
                    success(response);
                })
                .fail(function (
                    jqXhr,
                    textStatus,
                    errorThrown)
                {
                    internal.sparrow.onError('getView failed for ' + route + '. ' + textStatus + ' ' + errorThrown);
                });
        },

        getModel: function (route, success)
        {
            $.ajax(
                {
                    url: internal.getModelUrlFromRoute(route),

                    type: 'GET'
                })
                .done(function (
                    response,
                    textStatus,
                    jqXhr)
                {
                    success(response);
                })
                .fail(function (
                    jqXhr,
                    textStatus,
                    errorThrown)
                {
                    internal.sparrow.onError('getModel failed for ' + route + '. ' + textStatus + ' ' + errorThrown);
                });
        }
    };

    internal.bindHashChange();

    internal.loadRouteFromHash();

    console.log('sparrow initialized.');

    return internal.sparrow;
};

module.exports();
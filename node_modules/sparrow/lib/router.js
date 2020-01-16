
require('./extensions');

var internal =
{
    loadMasterController: function ()
    {
        try
        {
            var fs = require('fs');

            var path = require('path');

            var appRoot = process.cwd();

            // Discover all controller js filenames in controllers folder.

            var controllersFolder = appRoot + '/controllers';

            var controllerFilenames = fs
                .readdirSync(controllersFolder)
                .where(function (filename)
                {
                    return filename.toLowerCase().endsWith('.js');
                })
                .select(function (filename)
                {
                    return controllersFolder + '\\' + filename;
                });

            // Include the framework controller in the sparrow node module.

            controllerFilenames.push(__dirname + '\\controllers\\framework.js');

            // Load the controllers.

            var controllers = controllerFilenames
                .select(function (filename)
                {
                    var controllerName = filename.substring(0, filename.length - 3);

                    return require(controllerName);
                });

            // Aggregate the controllers into a master controller.

            var masterController = {};

            for (var i = 0; i < controllers.length; i++)
            {
                masterController = this.mergeObjects(masterController, controllers[i]);
            }
            console.dir(masterController);
            return masterController;
        }
        catch (ex)
        {
            console.log('error ' + ex);
        }
    },

    mergeObjects: function (first, second)
    {
        var merged = {};

        for (firstKey in first)
        {
            if (second[firstKey] != undefined)
            {
                merged[firstKey] = this.mergeObjects(first[firstKey], second[firstKey]);
            }
            else
            {
                merged[firstKey] = first[firstKey];
            }
        }

        for (secondKey in second)
        {
            if (merged[secondKey] == undefined)
            {
                merged[secondKey] = second[secondKey];
            }
        }

        return merged;
    },

    resolveAction: function (controller, method, route)
    {
        var queryParts = route.split('?');

        var segments = queryParts[0]
            .split('/')
            .select(function (segment) { return unescape(segment); });

        var routeValues = {};

        var node = controller;

        for (var i = 0; i < segments.length; i++)
        {
            var subnode = node[segments[i]];

            if (subnode == undefined)
            {
                var routeValueFound = false;

                for (var propertyName in node)
                {
                    if (propertyName.startsWith('{') && propertyName.endsWith('}'))
                    {
                        key = propertyName.substring(1, propertyName.length - 1);

                        routeValues[key] = segments[i];

                        subnode = node[propertyName];
                    }
                }
            }

            if (subnode == undefined) return null;

            node = subnode;
        }

        var actionFunction = node[method.toLowerCase()];

        if (actionFunction == undefined) return null;

        return (
        {
            actionFunction: actionFunction,

            query: queryParts.length == 1 ? {} : this.parseQuery(queryParts[1]),

            routeValues: routeValues
        });
    },

    parseQuery: function (queryString)
    {
        var query = {};

        var queryParts = queryString.split('&');

        queryParts.select(function (queryPart)
        {
            var elementParts = queryPart.split('=');

            var key = unescape(elementParts[0]);

            var value = unescape(elementParts[1]);

            query[key] = value;
        });

        return query;
    },

    createArgumentsForActionFunction: function (
        actionFunction,
        routeValues,
        query,
        body,
        respond)
    {
        var me = this;

        if (!actionFunction.parameterNames)
        {
            // Cache parameter names for subsequent requests.

            actionFunction.parameterNames = actionFunction.getParameterNames();
        }

        return actionFunction
            .parameterNames
            .select(function (parameterName)
            {
                return me.resolveValueForParameter(
                    parameterName,
                    routeValues,
                    query,
                    body,
                    respond);
            });
    },

    resolveValueForParameter: function (
        parameterName,
        routeValues,
        query,
        body,
        respond)
    {
        if (parameterName == 'respond') return respond;

        if (parameterName == 'routeValues') return routeValues;

        if (parameterName == 'query') return query;

        if (parameterName == 'body') return body;

        if (routeValues && routeValues[parameterName] != undefined)
        {
            return routeValues[parameterName];
        }

        if (query && query[parameterName] != undefined)
        {
            return query[parameterName];
        }

        if (body && body[parameterName] != undefined)
        {
            return body[parameterName];
        }

        return null;
    }
};

module.exports =
{
    masterController: internal.loadMasterController(),

    tryRoute: function (
        request,
        response,
        succeed,
        fail)
    {
        var route = request.url.substring('/service/'.length);

        var action = internal.resolveAction(
            this.masterController,
            request.method,
            route);

        if (action == null)
        {
            fail(
                'Action could not be resolved for ' +
                request.method.toLowerCase() + ' ' +
                route);
        }

        var arguments = internal.createArgumentsForActionFunction(
            action.actionFunction,
            action.routeValues,
            action.query,
            request.body,
            function respond(error, result)
            {
                succeed(error, result);
            });


        action.actionFunction.apply(null, arguments);
    }
};


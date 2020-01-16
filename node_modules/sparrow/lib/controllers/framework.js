
var internal =
{
    serviceToProxy: function (service, route)
    {
        var proxy = {};

        for (serviceKey in service)
        {
            var serviceValue = service[serviceKey];

            var subRoute = route || '';

            if (typeof serviceValue === 'function')
            {
                proxy[serviceKey] = this.serviceFunctionToProxyFunction(serviceValue, serviceKey, subRoute);
            }
            else
            {
                if (subRoute.length > 0) subRoute += '/';

                subRoute += serviceKey;

                proxy[serviceKey] = this.serviceToProxy(serviceValue, subRoute);
            }
        }

        return proxy;
    },

    serviceFunctionToProxyFunction: function (
        serviceFunction,
        name,
        route)
    {
        var parameterNames = serviceFunction.getParameterNames();

        var routeParameterNames = parameterNames.where(function (parameterName)
        {
            return parameterName != 'body' && parameterName != 'respond';
        });

        var templating = require('../templating');

        var code = templating.templates['proxy-function.js'](
        {
            parameters: parameterNames.aggregate(function (a, b) { return a + ', ' + b; }),

            routeParameterNames: routeParameterNames,

            route: route,

            method: name.toUpperCase()
        });

        return eval(code);
    },

    proxyToJavaScript: function (proxy, indent)
    {
        if (indent == undefined) indent = 0;

        var output = '';

        for (proxyKey in proxy)
        {
            var proxyValue = proxy[proxyKey];

            if (typeof proxyValue === 'function')
            {
                for (var i = 0; i < indent; i++) output += '    ';

                output += '\'' + proxyKey + '\': ';

                output += proxyValue;

                output += ',\r\n';
            }
            else
            {
                for (var i = 0; i < indent; i++) output += '    ';

                output += '\'' + proxyKey + '\':\r\n';

                for (var i = 0; i < indent; i++) output += '    ';

                output += '{\r\n';

                output += this.proxyToJavaScript(proxy[proxyKey], indent + 1);

                for (var i = 0; i < indent; i++) output += '    ';

                output += '},\r\n';
            }
        }

        return output;
    }
};

module.exports =
{
    framework:
    {
        'service.js':
        {
            get: function (respond)
            {
                var response = '';

                var router = require('../router');

                var proxy = internal.serviceToProxy(router.masterController);

                var script = internal.proxyToJavaScript(proxy, 1);

                script = 'var service = \r\n{\r\n' + script + '}\r\n';

                respond(script);
            }
        }
    }
};
(
    function({{parameters}})
    {
        var routeValues = 
        {
            {{#each routeParameterNames}}
                '{{this}}': {{this}},
            {{/each}}
        };

        var url = '/service/{{route}}';

        for(var routeValueKey in routeValues)
        {
            url = url.replaceAll('{' + routeValueKey + '}', String(routeValues[routeValueKey]));
        }

        $.ajax(
        {
            url: url,

            type: '{{method}}',

            data: typeof body !== 'undefined' ? body : undefined,

            success: function (result)
            {
                respond(result);
            }
        });
    }
)
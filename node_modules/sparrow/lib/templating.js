
require('./extensions');

var Handlebars = require('handlebars');

var internal =
{
    loadTemplates: function ()
    {
        var fs = require('fs');

        var templatesFolder = __dirname + '\\templates';

        var templateFilenames = fs.readdirSync(templatesFolder);

        var templates = {};

        for (var i = 0; i < templateFilenames.length; i++)
        {
            var templateFilename = templateFilenames[i];

            var contents = fs.readFileSync(templatesFolder + '\\' + templateFilename, 'utf8');

            templates[templateFilename] = Handlebars.compile(contents);
        }

        return templates;
    }
};

module.exports =
{
    templates: internal.loadTemplates()
};
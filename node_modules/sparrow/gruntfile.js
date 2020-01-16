
module.exports = function (grunt)
{
    grunt.initConfig(
    {
        browserify:
        {
            client:
            {
                src: ['./lib/client.js'],

                dest: './lib/content/sparrow.js',

                options:
                {
                    alias: ['./lib/client:sparrow']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('default', ['browserify']);
};
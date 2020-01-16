
// String prototypes

if (typeof String.prototype.contains != 'function')
{
    String.prototype.contains = function (str)
    {
        return Boolean(~this.indexOf(str));
    };
}

if (typeof String.prototype.endsWith != 'function')
{
    String.prototype.endsWith = function (str)
    {
        return this.slice(-str.length) == str;
    };
}

if (typeof String.prototype.replaceAll != 'function')
{
    String.prototype.replaceAll = function (from, to)
    {
        return this.replace(new RegExp(from, 'g'), to);
    };
}

if (typeof String.prototype.startsWith != 'function')
{
    String.prototype.startsWith = function (str)
    {
        return this.slice(0, str.length) == str;
    };
}

// Array prototypes

if (typeof Array.prototype.any != 'function')
{
    Array.prototype.any = function (selector)
    {
        if (selector == undefined) return this.length > 0;

        for (var i = 0; i < this.length; i++)
        {
            if (selector(this[i])) return true;
        }

        return false;
    }
}

if (typeof Array.prototype.select != 'function')
{
    Array.prototype.select = function (selector)
    {
        var r = [];

        for (var i = 0; i < this.length; i++)
        {
            r.push(selector(this[i]));
        }

        return r;
    }
}

if (typeof Array.prototype.where != 'function')
{
    Array.prototype.where = function (selector)
    {
        var r = [];

        for (var i = 0; i < this.length; i++)
        {
            if (selector(this[i])) r.push(this[i]);
        }

        return r;
    }
}

if (typeof Array.prototype.concat != 'function')
{
    Array.prototype.concat = function (other)
    {
        var r = [];

        for (var i = 0; i < this.length; i++)
        {
            r.push(this[i]);
        }

        for (var i = 0; i < other.length; i++)
        {
            r.push(other[i]);
        }

        return r;
    }
}

if (typeof Array.prototype.aggregate != 'function')
{
    Array.prototype.aggregate = function (combine)
    {
        if (this.length < 2) return this;

        var aggregate = this[0];

        for (var i = 1; i < this.length; i++)
        {
            aggregate = combine(aggregate, this[i]);
        }

        return aggregate;
    }
}

// Function Prototypes

var commentRegex = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

if (typeof Function.prototype.getParameterNames != 'function')
{
    Function.prototype.getParameterNames = function ()
    {
        var fnStr = this.toString().replace(commentRegex, '');

        var result = fnStr
            .slice(
                fnStr.indexOf('(') + 1,
                fnStr.indexOf(')'))
            .match(/([^\s,]+)/g);

        if (result === null) result = [];

        return result;
    }
}

// Console Extensions

console.logdir = function (message, object)
{
    for (var i = 0; i < arguments.length; i += 2);
    {
        console.log(arguments[i] + ' = ');

        console.dir(arguments[i + 1]);
    }
};

module.exports =
{
};

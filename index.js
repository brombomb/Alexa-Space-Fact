'use strict';
var Alexa = require('alexa-sdk');
var http = require('http');

var APP_ID =  'amzn1.ask.skill.771d00b1-b723-458a-9d5b-7e28ec220843';
var SKILL_NAME = 'Rocket Man';

function api(cb) {

    return http.get({
        host: 'astrocast.herokuapp.com',
        path: '/bites'
    }, function(res) {
        res.setEncoding('utf8');
        // Continuously update stream with data
        var body = '';
        res.on('data', function(d) {
            body += d;
        });
        res.on('end', function() {

            try {
                var parsed = JSON.parse(body);
                console.log(body);
                var factIndex = Math.floor(Math.random() * Object.keys(parsed).length);
                cb(parsed[factIndex]);
            } catch (err) {
                console.error('Unable to parse response as JSON', err);
                throw(err);
            }
        });
    }).on('error', function(err) {
        // handle errors with the request itself
        console.error('Error with the request:', err.message);
        throw(err);
    });

}


exports.handler = function(event, context, callback) {
    console.log(event);
    //console.log(event.request.intent.name);
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetFact');
    },
    'GetNewFactIntent': function () {
        this.emit('GetFact');
    },
    'GetFact': function () {

        api(function(fact) {
            console.log(fact);
            var cardTitle = 'Rocket Man Fact';
            var shouldEndSession = true;
            var speechOutput = "Did you know " + fact.name;
            
            this.emit(':tellWithCard', speechOutput, SKILL_NAME, fact.name)
                
        }.bind(this));
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = "You can say tell me a space fact, or, you can say exit... What can I help you with?";
        var reprompt = "What can I help you with?";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Goodbye!');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Goodbye!');
    }
};

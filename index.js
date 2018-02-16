var request = require('request');

exports.handler = (event, context, callback) => {

  try {

    if (event.session.new) {
      console.log("NEW SESSION")
    }

    switch (event.request.type) {
      case "LaunchRequest":
        console.log(`LAUNCH REQUEST`)
        break;
      case "IntentRequest":
        console.log(`INTENT REQUEST`)

        switch(event.request.intent.name){
          case "GetGithubFollowerCount":
            getFollowerCount(function(count){
              context.succeed(buildResponse(`You have ${count} followers`))
            })
            break;
          case "GetGithubRepositoryCount":
            getRepositoryCount(function(count){
              context.succeed(buildResponse(`You have ${count} repositories`))
            })
            break;
          case "GetGithubRepositoryCountByLanguage":
            var language = event.request.intent.slots.Language.value
            getRepositoryCountByLanguage(language, function(count){
              context.succeed(buildResponse(`There are ${count} ${language} repositories in Github`))
            })
            break;
          default:
          context.succeed(buildResponse("Sorry I couldn't understand"))
        }
        break;
      case "SessionEndedRequest":
        console.log(`SESSION ENDED REQUEST`)
        break;
      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)
    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}

getFollowerCount = (callback) =>{
  var options = {
    url: `https://api.github.com/users/${process.env.USERNAME}`,
    headers: {
      'User-Agent': 'alexa-skill'
    }
  };
  request(options, function(error, response, body){
    var data = JSON.parse(body)
    callback(data.followers)
  })
}

getRepositoryCount = (callback) =>{
  var options = {
    url: `https://api.github.com/users/${process.env.USERNAME}`,
    headers: {
      'User-Agent': 'alexa-skill'
    }
  };
  request(options, function(error, response, body){
    var data = JSON.parse(body)
    callback(data.public_repos)
  })
}

getRepositoryCountByLanguage = (language, callback) =>{
  var options = {
    url:  `https://api.github.com/search/repositories?q=language:${language}`,
    headers: {
      'User-Agent': 'alexa-skill'
    }
  };
  request(options, function(error, response, body){
    var data = JSON.parse(body)
    callback(data.total_count)
  })
}

buildResponse = (outputText) => {
  return {
    version: "1.0",
    response: {
      outputSpeech: {
        type: "PlainText",
        text: outputText
      },
      shouldEndSession: true
    },
    sessionAttributes: {}
  }
}

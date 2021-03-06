let express = require('express'),
  bodyParser = require('body-parser'),
  app = express();

let alexaVerifier = require('alexa-verifier'); // at the top of our file

function requestVerifier(req, res, next) {
  alexaVerifier(
    req.headers.signaturecertchainurl,
    req.headers.signature,
    req.rawBody,
    function verificationCallback(err) {
      if (err) {
        res.status(401).json({
          message: 'Verification Failure',
          error: err
        });
      } else {
        next();
      }
    }
  );
}

function buildResponse(session, speech, card, end) {
  return {
    version: "1.0",
    sessionAttributes: session,
    response: {
      outputSpeech: {
        type: 'SSML',
        ssml: speech
      },
      card: card,
      shouldEndSession: !!end
    }
  };
}

app.set('port', process.env.PORT || 3000);


app.use(bodyParser.json({
  verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
  }
}));
app.post('/flip', requestVerifier, function(req, res) {
  var a = "tails";
  if (req.body.request.type === 'LaunchRequest') {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Welcome to magic coin <break time=\"0.5s\"/> your decision making tool</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'FlipCoin'){
    if (Math.random() > 0.5) {
      a = "heads";
    }
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>You flipped a "+ a +"</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'RollDice'){
    var sides = 6;
    if (!(!req.body.request.intent.slots.sides ||
        !req.body.request.intent.slots.sides.value)) {
      sides = parseInt(req.body.request.intent.slots.sides.value);
    }
    console.log(req.body.request.intent.slots.sides);
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>You rolled a "+ Math.floor(Math.random() * sides + 1).toString() +" on a " + sides.toString()+" sided dice</speak>"
        }
      }
    });
  }
  else if (req.body.request.type === 'IntentRequest' && req.body.request.intent.name === 'FlipMultiCoin'){
    var times = 1;
    if (!(!req.body.request.intent.slots.num ||
        !req.body.request.intent.slots.num.value)) {
      times = parseInt(req.body.request.intent.slots.num.value);
    }
    var heads = 0
    for (var i = 0; i < times; i++) {
      if (Math.random() > 0.5) {
        heads++;
      }
    }
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": false,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>After flipping "+ times.toString() + " coins, " + heads.toString() + " of them were heads, and " + (times-heads).toString() + " of them were tails</speak>"
        }
      }
    });
  }
  else {
    res.json({
      "version": "1.0",
      "response": {
        "shouldEndSession": true,
        "outputSpeech": {
          "type": "SSML",
          "ssml": "<speak>Goodbye</speak>"
        }
      }
    });
  }
}); app.listen(app.get("port"));

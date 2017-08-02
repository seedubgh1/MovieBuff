var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
XMLHttpRequest.UNSENT = 0;
XMLHttpRequest.OPENED = 1;
XMLHttpRequest.HEADERS_RECEIVED = 2;
XMLHttpRequest.LOADING = 3;
XMLHttpRequest.DONE = 4;

//category = 11  === Entertainment, Film;

function callAPI(p_url) {
  var req = new XMLHttpRequest();

  req.open('GET',p_url,false);
  req.send();
  return req;
};// callAPI

module.exports = {
getToken: function() {
  var tokenURL = 'https://opentdb.com/api_token.php?command=request',
      response = callAPI(tokenURL),
      responseText = response.responseText,
      responseObj = JSON.parse(responseText);

  if (responseObj.response_code === 0) {
    return responseObj.token;
  } else {
    return '';
  };
},// getToken

getQuestion: function (p_categ, p_amt, p_token) {
  var questionURL = 'https://opentdb.com/api.php?type=multiple';

  if (p_categ) {
    questionURL +=  '&category=' + p_categ.toString();
  };

  if (p_amt) {
    if (p_amt > 50) {
     p_amt = 50;
    };
    questionURL +=  '&amount=' + p_amt.toString();
  } else {
 // get at least one question
    questionURL +=  '&amount=1';
  };

  if (p_token) {
    questionURL +=  '&token=' + p_token.toString();
  };
  //console.log(questionURL);

  var response = callAPI(questionURL),
      questionText = response.responseText,
      questionObj = JSON.parse(questionText);

  if (questionObj.response_code === 0) {
    return questionObj.results;
  } else {
    return [
            {question: 'Why didn\'t I get any questions'
           ,correct_answer: 'The internet is down.'
           ,incorrect_answers: ['Alexa won\'t allow it.'
                               ,'These questions are too hard for you.'
                               ,'I don\'t want to get you questions.'
                               ]} ];
  };
}, //getQuestion

convertQuestion: function (q_src,lang) {

  function cr_js(prop, val) {
    var jsonStr = '{"' + prop + '":' + val + '}';
    return JSON.parse(jsonStr);
  };

  function trnsltr(str,fromLang,toLang){
    return str;
  };

  function replLastChar(str, bad, good) {
    if (str.charAt(str.length-1) == bad){
      str = str.substr(0,str.length-1) + good;
    };

    return str;
  };

  var questions = q_src;
  var q_set = [];
  var answers = [];
  var alexa_q = {};

  for (i = 0; i < questions.length; i += 1) {

    answers = [];
    if (questions[i].question.indexOf('need for speed') == -1) {
      questions[i].question = questions[i].question.replace(new RegExp('&quot;', 'g'), "");
      questions[i].question = questions[i].question.replace(new RegExp('&#039;', 'g'), "");
      questions[i].question = questions[i].question.replace(new RegExp(':', 'g'), ",");
      questions[i].question = questions[i].question.replace(new RegExp('E\.T\.', 'g'), "ET,");
      questions[i].question = replLastChar(questions[i].question,'.',',');
      questions[i].question = replLastChar(questions[i].question,".'",',');
      questions[i].question = replLastChar(questions[i].question,"...",', ');

//    if (!lang) {
      alexa_q = cr_js(questions[i].question,'17');
      answers = answers.concat(questions[i].correct_answer);
      answers = answers.concat(questions[i].incorrect_answers);
    // } else {
    //   alexa_q = cr_js(trnsltr(questions[i].question,'us',lang),'17');
    //   questions[i].correct_answer = trnsltr(questions[i].correct_answer,'us',lang);
    //   answers = answers.concat(questions[i].correct_answer);
    //   for (j = 0; j < questions[i].incorrect_answers.length; j+= 1) {
    //     questions[i].incorrect_answers[j] = trnsltr(questions[i].incorrect_answers[j],'us',lang)
    //     answers.push(questions[i].incorrect_answers[j]);
    //   };
    // };

    alexa_q[Object.keys(alexa_q)[0]] = answers;
    //console.log('obj_keys: ',Object.keys(alexa_q)[0]);
    q_set.push(alexa_q);
    };
  };

  return q_set;

}
};

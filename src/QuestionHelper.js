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
  var questionURL = 'https://opentdb.com/api.php?type=multiple&encode=base64';

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
  // console.log('questionURL: ',questionURL);

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
  var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};


  for (i = 0; i < questions.length; i += 1) {

    answers = [];
    questions[i].question = Base64.decode(questions[i].question);
    if (questions[i].question.indexOf('need for speed') == -1) {
      questions[i].question = questions[i].question.replace(new RegExp('&quot;', 'g'), "");
      questions[i].question = questions[i].question.replace(new RegExp('&#039;', 'g'), "");
      questions[i].question = questions[i].question.replace(new RegExp(':', 'g'), ",");
      questions[i].question = questions[i].question.replace(new RegExp('E\.T\.', 'g'), "ET,");
      questions[i].question = questions[i].question.replace(new RegExp('"', 'g'), "'");
      questions[i].question = replLastChar(questions[i].question,'.',',');
      questions[i].question = replLastChar(questions[i].question,".'",',');
      questions[i].question = replLastChar(questions[i].question,"...",', ');

//    if (!lang) {
      alexa_q = cr_js(questions[i].question,'17');
      answers = answers.concat(Base64.decode(questions[i].correct_answer));
      answers = answers.concat(questions[i].incorrect_answers.map((answer) => Base64.decode(answer)));
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

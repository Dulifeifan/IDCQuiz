let allQuestions = [];
$.getJSON("./questions.json", function (data) {
    allQuestions = [...data];
})
let userName = '';
let emailAddress = '';
let countDownSecond = 180;
let countDownFlag = false;
let chosenQuestions = [];
let currentQuestionSingleC = false;
let currentQuizIndex = 0;
let answers = [];
let score = 0;
let optionsOrder = [];
let reportFlag = false;

function emailAddressValidator() {
    var temp = $("input[name='emailAdd']");
    var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if (!myreg.test(temp.val())) {
        return false;
    }
}

$("#submitInfo").on("click", () => {
    let emailFlag = false;
    let nameFlag = false;
    if (emailAddressValidator() != false) {
        emailAddress = $("input[name='emailAdd']").val();
        emailFlag = true;
    }
    if ($("input[name='userName']").val() != null && $("input[name='userName']").val() != '') {
        userName = $("input[name='userName']").val();
        nameFlag = true;
    } else {
        $(".alert").alert();
        //alert('Invalid Name');
    }
    if (emailFlag && nameFlag) {
        $("div.emailAndName").addClass("disappear");
        $("div.promtBeforeQuiz").removeClass("disappear");
    } else {
        if (!emailFlag && !nameFlag) {
            $("#emailAndNameAlert").text("Invalid Email Address Or Name").removeClass("disappear");
        } else if (!emailFlag) {
            $("#emailAndNameAlert").text("Invalid Email Address").removeClass("disappear");
        } else {
            $("#emailAndNameAlert").text("Invalid Name").removeClass("disappear");
        }
    }
})

$("#startQuiz").on("click", () => {
    $("div.promtBeforeQuiz").addClass("disappear");
    $("div.quiz").removeClass("disappear");
    chooseQuestions();
    startCountDown();
    renderQuiz();
})

function startCountDown() {
    setInterval('countDown()', 1000);
}
             
function countDown() {
    if (countDownSecond > 0 && !reportFlag) {
        $("#countDownNumber").text(countDownSecond--);
    } else {
        if (!countDownFlag) {
            countDownFlag = true;
            let currentAns = [];
            $("input[name='options']:checked").each(function () {
                currentAns = [...currentAns, $(this).val()]
            });
            if (currentAns && currentAns != '') {
                answers[currentQuizIndex] = currentAns;
            }
            if (!reportFlag) {
                $("#runOutOfTimeAlert").removeClass("disappear");
                renderReport();
            }
        }
    }
}

function chooseQuestions() {
    let fixFlag = false;
    let fixObj = '';
    let fixNum = -1;
    for (let i = 0, l = allQuestions.length; i < l; i++) {
        let rc = parseInt(Math.random() * l);
        const empty = allQuestions[i];
        allQuestions[i] = allQuestions[rc];
        allQuestions[rc] = empty;
    }
    
    chosenQuestions = allQuestions.slice(0, 10);
    chosenQuestions.forEach(o => {
        if (o.fix) {
            fixFlag = true;
            fixObj = o;
            fixNum = o.fix - 1;
        }
    })
    if (fixFlag) {
        let newIndex = chosenQuestions.indexOf(fixObj);
        chosenQuestions[newIndex] = chosenQuestions[fixNum];
        chosenQuestions[fixNum] = fixObj;
    }
}

function randomOptionOrder() {
    let currentQustion = chosenQuestions[currentQuizIndex];
    let newOrder = [];
    if (optionsOrder[currentQuizIndex] && optionsOrder[currentQuizIndex].length !== 0) {
        newOrder = optionsOrder[currentQuizIndex];
    } else {
        newOrder = [...currentQustion.options];
        let fixFlag = false;
        let fixObj = '';
        let fixNum = -1;
        newOrder.forEach(o => {
            if (o.fix) {
                fixFlag = true;
                fixObj = o;
                fixNum = o.fix - 1;
            }
        })
        for (let i = 0, l = newOrder.length; i < l; i++) {            
            let rc = parseInt(Math.random() * l);
            const empty = newOrder[i];
            newOrder[i] = newOrder[rc];
            newOrder[rc] = empty;
        }
        if (fixFlag) {
            let newIndex = newOrder.indexOf(fixObj);
            newOrder[newIndex] = newOrder[fixNum];
            newOrder[fixNum] = fixObj;
        }
    }
    
    newOrder.forEach(o => {
        if (o.optionType === "Textual or numeric") {
            $("#options").append("<input name='options' value=" + o.optionId + ">" + o.option + "<br />");
            $("#options").append("<div class='mar'></div>");
        } else if (o.optionType === "Image-based") {
            $("#options").append("<input name='options' value=" + o.optionId + "><img src='" + o.option + "' height='200' width='200' /><br />");
            $("#options").append("<div class='mar'></div>");
        } else {
            $("#options").append("<input name='options' value=" + o.optionId + "><code>" + o.option + "</code><br />");
            $("#options").append("<div class='mar'></div>");
        }
    })
    if (currentQustion.optionType === "Single choice" || currentQustion.optionType === "True/False") {
       
        $("input[name='options']").attr("type", "radio");
    } else {
        $("input[name='options']").attr("type", "checkbox");
    }
    if (answers[currentQuizIndex]) {
        answers[currentQuizIndex].forEach(a => {
            $("input[value='" + a + "']").attr("checked", "checked");
        })
    }
    optionsOrder[currentQuizIndex] = newOrder;
}

function renderQuiz() {
    $("#quizAlert").addClass("disappear");
    $("progress").attr("value", currentQuizIndex + 1);
    $("#currentQuizIndex").text(currentQuizIndex + 1);
    if (currentQuizIndex === 0) {
        $("#previousButton").addClass("disappear");
        $("#nextButton").removeClass("disappear");
        $("#skipButton").removeClass("disappear");
        $("#submitButton").addClass("disappear");
    }

    if (currentQuizIndex === 9) { 
        $("#previousButton").removeClass("disappear");
        $("#nextButton").addClass("disappear");
        $("#skipButton").addClass("disappear");
        $("#submitButton").removeClass("disappear");
    }
    else if (currentQuizIndex !== 0) {
        $("#previousButton").removeClass("disappear");
        $("#nextButton").removeClass("disappear");
        $("#skipButton").removeClass("disappear");
        $("#submitButton").addClass("disappear");
    }
    let currentQustion = chosenQuestions[currentQuizIndex];
    currentQustion.question.forEach(q => {
        if (q.contentType === "Textual or numeric" || q.contentType ==="Always") {
            $("#questionContent").append("<div>"+q.content+"</div>");
        } else if (q.contentType === "Image-based") {
            $("#questionContent").append("<img src='" + q.content + "' height='200' width='200' /><br />");
        } else {
            $("#questionContent").append("<code>" + q.content + "</code>");
        }
    })
    randomOptionOrder();
}

$("#nextButton").on("click", () => {
    let currentAns = [];
    $("input[name='options']:checked").each(function () {
        currentAns = [...currentAns, $(this).val()]
    });
    if (currentAns && currentAns != '') {
        answers[currentQuizIndex]=currentAns;
        nextQuiz();
    } else {
        $("#quizAlert").text("Choose your answer").removeClass("disappear");
    }  
});

function nextQuiz() {
    currentQuizIndex++;
    $("#questionContent").empty();
    $("#options").empty();
    renderQuiz();
}

$("#skipButton").on("click", () => {
    nextQuiz();
});

$("#previousButton").on("click", () => {
    let currentAns = [];
    $("input[name='options']:checked").each(function () {
        currentAns = [...currentAns, $(this).val()]
    });
    if (currentAns && currentAns != '') {
        answers[currentQuizIndex] = currentAns;
    }
    currentQuizIndex--;
    $("#questionContent").empty();
    $("#options").empty();
    renderQuiz();
});

$("#submitButton").on("click", () => {
    let currentAns = [];
    $("input[name='options']:checked").each(function () {
        currentAns = [...currentAns, $(this).val()]
    });
    if (currentAns && currentAns != '') {
        answers[currentQuizIndex] = currentAns;    
    }
    renderReport();
});

function renderReport() {
    reportFlag = true;
    $(".quiz").addClass("disappear");
    $(".report").removeClass("disappear");
    $("#reportName").text(userName);
    $("#reportEmail").text(emailAddress);
    $("#reportTimeLeft").text(countDownSecond);
    let answeredQ = 0;
    chosenQuestions.forEach((c, i) => {
        $("#reportAnswers").append("<div class='mar'></div>");
        $("#reportAnswers").append("<div>****</div>");
        c.question.forEach(q => {
            
            if (q.contentType === "Textual or numeric" || q.contentType ==="Always") {
                $("#reportAnswers").append("<div>" + q.content + "</div>");
            } else if (q.contentType === "Image-based") {
                $("#reportAnswers").append("<img src='" + q.content + "' height='200' width='200' /><br />");
            } else {
                $("#reportAnswers").append("<code>" + q.content + "</code>");
            }
        })
        
        let corrctFlag = false;

        if (c.optionType === "Single choice" || c.optionType === "True/False") {
            let correctOption = c.options[c.correctOptionId - 1];
            $("#reportAnswers").append("<div id=reportChoise" + i + "></div>");
            if (answers[i] && answers[i] != '') {
                answeredQ++;

                if (answers[i] == c.correctOptionId) {
                    score++;
                    corrctFlag = true;
                    $("#reportChoise" + i).text(" Correct").addClass("correct");
                } else {
                    $("#reportChoise" + i).text(" Wrong").addClass("wrong");
                }
                console.log(c.options)
                console.log(answers[i])
                let chosenAnswer = c.options[answers[i] - 1];
                console.log(chosenAnswer)
                if (chosenAnswer.optionType === "Textual or numeric") {
                    $("#reportAnswers").append("<div>" + chosenAnswer.option + "</div>");
                } else if (chosenAnswer.optionType === "Image-based") {
                    $("#reportAnswers").append("<img src='" + chosenAnswer.option + "' height='200' width='200' /><br />");
                } else {
                    $("#reportAnswers").append("<code>" + chosenAnswer.option + "</code>");
                }
            } else {
                $("#reportChoise" + i).text(" No Answer").addClass("wrong");
            }
            if (!corrctFlag) {
                $("#reportAnswers").append("<div class='correct'>Correct Answer is: </div>");
                if (correctOption.optionType === "Textual or numeric") {
                    $("#reportAnswers").append("<div>"+correctOption.option + "</div>");
                } else if (correctOption.optionType === "Image-based") {
                    $("#reportAnswers").append("<img src='" + correctOption.option + "' height='200' width='200' /><br />");
                } else {
                    $("#reportAnswers").append("<code>" + correctOption.option + "</code>");
                }
            }
        } else {
            $("#reportAnswers").append("<div id=reportChoise" + i + "></div>");
            if (answers[i] && answers[i] != '') {
                answeredQ++;

                if (answers[i].sort().toString() == c.correctOptionId.toString()) {
                    score++;
                    corrctFlag = true;
                    $("#reportChoise" + i).text(" Correct").addClass("correct");
                } else {
                    $("#reportChoise" + i).text(" Wrong").addClass("wrong");
                }
                answers[i].forEach(a => {
                    let chosenAnswer = c.options[a - 1];
                    if (chosenAnswer.optionType === "Textual or numeric") {
                        $("#reportAnswers").append("<div>" + chosenAnswer.option + "</div>");
                    } else if (chosenAnswer.optionType === "Image-based") {
                        $("#reportAnswers").append("<img src='" + chosenAnswer.option + "' height='200' width='200' /><br />");
                    } else {
                        $("#reportAnswers").append("<code>" + chosenAnswer.option + "</code>");
                    }
                })
            } else {
                $("#reportChoise" + i).text(" No Answer").addClass("wrong");
            }
            if (!corrctFlag) {
                $("#reportAnswers").append("<div class='correct'>Correct Answer: </div>");
                c.correctOptionId.forEach((i) => {
                    let correctOption = c.options[i - 1];
                    if (correctOption.optionType === "Textual or numeric") {
                        $("#reportAnswers").append("<div>" +correctOption.option + "</div>");
                    } else if (correctOption.optionType === "Image-based") {
                        $("#reportAnswers").append("<img src='" + correctOption.option + "' height='200' width='200' /><br />");
                    } else {
                        $("#reportAnswers").append("<code>" + correctOption.option + "</code>");
                    }
                })
            }

        }
    });
    $("#reportAnsweredQuestions").text(answeredQ);
    $("#reportScore").text(score);
}
function printpage() {
    window.onbeforeprint = function (event) {
        $("#reportPrintButton").addClass("disappear")
    };
    window.onafterprint = function (event) {
        $("#reportPrintButton").removeClass("disappear")
    };
    window.print(); 
}
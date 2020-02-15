$(document).ready(function () {

function compare(correct, userInput) {
    var inc = [];
    var i;
    var j = 0;
    for(i=0; i<correct.length; i++){
        if(correct[i] == userInput[j]){
            console.log("Correct: Correct is: " + correct[i] + " and userInput is: " + userInput[j] );
            j++;
        }
        else{
            var nextWord = correct[i+1];
            var indexNext = userInput.indexOf(nextWord,j+1);
            if(indexNext != -1){
                console.log("Possible, match for: " + correct[i] + " and userInput is: " + userInput.slice(j, indexNext));
                j = indexNext;
            }
            else{
                console.log("Possible, match for: " + correct[i] + " and userInput is: " + userInput.slice(j, userInput.length));
            }
            inc.push(correct[i]);
        }
    }

    return inc;
}

function render_incorrect_words(incorrectWords){
    incorrectWords.forEach(word => {
        $('#incorrectWords').append(
            '<div class="incorrect" id='+ word + '><p class="incorrectP">' +  word.charAt(0).toUpperCase() + word.slice(1) + 
            '</p><div class="playBack" id="'+ word + 'Play"><i class="material-icons">&#xe050;</i></div>' +
            '</div>'
        )
    });
}

function correct_pronounciation(incorrectWords){
        var voiceList = document.querySelector('#voiceList');
        var synth = window.speechSynthesis;
        var voices = [];

        PopulateVoices();
        if(speechSynthesis !== undefined){
            speechSynthesis.onvoiceschanged = PopulateVoices;
        }

        incorrectWords.forEach(word => {
            $("#"+word).on("click",function(){
                var toSpeak = new SpeechSynthesisUtterance(word);
                var selectedVoiceName = voiceList.selectedOptions[0].getAttribute('data-name');
                synth.speak(toSpeak);

                $(this).css("background-color", "#e8ffe9");
            })
        });

        function PopulateVoices(){
            voices = synth.getVoices();
            var selectedIndex = voiceList.selectedIndex < 0 ? 0 : voiceList.selectedIndex;
            voiceList.innerHTML = '';
            voices.forEach((voice)=>{
                var listItem = document.createElement('option');
                listItem.textContent = voice.name;
                listItem.setAttribute('data-lang', voice.lang);
                listItem.setAttribute('data-name', voice.name);
                voiceList.appendChild(listItem);
            });

            voiceList.selectedIndex = selectedIndex;
        }
}

// compare the expected string to the returned string from the Google API
var correct = ['the', 'island', 'is', 'surrounded', 'by', 'sharks']
var userInput = ["the", 'is', 'land', 'is', 'surrogate', 'by', 'sharpie', 'pen']

// get back the expected words that were not heard by google
var words = compare(correct, userInput);

// print out those expected words and create audio to 
render_incorrect_words(words);
correct_pronounciation(words);

});
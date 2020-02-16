$(document).ready(function () {

    //=============================================================
    //==================GETTING USER AUDIO=========================
    // taken from: https://github.com/addpipe/simple-recorderjs-demo
    //=============================================================
    var user_audio_blob;   // OURS
    var encoded_64;        // OURS
    var wav_base_64 = "";  // OURS
    
    
    URL = window.URL || window.webkitURL;

    var gumStream; 						//stream from getUserMedia()
    var rec; 							//Recorder.js object
    var input; 							//MediaStreamAudioSourceNode we'll be recording

    // shim for AudioContext when it's not avb. 
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext //audio context to help us record

    //var recordButton = document.getElementById("recordButton");
    //var stopButton = document.getElementById("stopButton");
    //var pauseButton = document.getElementById("pauseButton");

    //add events to those 2 buttons
    //recordButton.addEventListener("click", startRecording);
    //stopButton.addEventListener("click", stopRecording);
    //pauseButton.addEventListener("click", pauseRecording);

    function startRecording() {
        console.log("recordButton clicked");

        /*
            Simple constraints object, for more advanced audio features see
            https://addpipe.com/blog/audio-constraints-getusermedia/
        */

        var constraints = { audio: true, video: false }

        /*
            Disable the record button until we get a success or fail from getUserMedia() 
        */

        // recordButton.disabled = true;
        // stopButton.disabled = false;
        // pauseButton.disabled = false

        /*
            We're using the standard promise based getUserMedia() 
            https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        */

        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

            /*
                create an audio context after getUserMedia is called
                sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
                the sampleRate defaults to the one set in your OS for your playback device
            */
            audioContext = new AudioContext();

            //update the format 
            //document.getElementById("formats").innerHTML = "Format: 1 channel pcm @ " + audioContext.sampleRate / 1000 + "kHz"

            /*  assign to gumStream for later use  */
            gumStream = stream;

            /* use the stream */
            input = audioContext.createMediaStreamSource(stream);

            /* 
                Create the Recorder object and configure to record mono sound (1 channel)
                Recording 2 channels  will double the file size
            */
            rec = new Recorder(input, { numChannels: 1 })

            //start the recording process
            rec.record()

            console.log("Recording started");

        }).catch(function (err) {
            //enable the record button if getUserMedia() fails
            console.log(err);
            // recordButton.disabled = false;
            // stopButton.disabled = true;
            // pauseButton.disabled = true
        });
    }


    function stopRecording() {
        console.log("stopButton clicked");

        //disable the stop button, enable the record too allow for new recordings
        // stopButton.disabled = true;
        // recordButton.disabled = false;
        // pauseButton.disabled = true;

        //reset button just in case the recording is stopped while paused
        // pauseButton.innerHTML = "Pause";

        //tell the recorder to stop the recording
        rec.stop();

        //stop microphone access
        gumStream.getAudioTracks()[0].stop();

        //create the wav blob and pass it on to createDownloadLink
        rec.exportWAV(blob => {                         // ENTIRE CALLBACK FUNNCTION IS OURS
            user_audio_blob = blob;                     //  ^
            let readr = new FileReader();               //  ^
            readr.readAsDataURL(user_audio_blob);       //  ^

            readr.onload = function () {                //  ^
                encoded_64 = readr.result;              //  ^
                let wav_start = encoded_64.search("base64,") + 7;
                wav_base_64 = encoded_64.slice(wav_start);
            }
        });
    }

    //=============================================================
    //=====MAKING CALL TO GOOGLE SPEECH TO TEXT WITH USER AUDIO====
    //=============================================================
    /** Sample JavaScript code for speech.speech.recognize */
    var recognized_speech;

    function loadClient() {
        gapi.client.setApiKey("AIzaSyAx6MldUcdZy7j2JAK20UCzp5zLSHpNhbs");
        return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/speech/v1p1beta1/rest")
            .then(function () { console.log("GAPI client loaded for API"); },
                function (err) { console.error("Error loading GAPI client for API", err); });
    }

    // Make sure the client is loaded before calling this method.
    function execute() {
        return gapi.client.speech.speech.recognize({
            "audio": {
                "content": wav_base_64
            },
            "config": {
                //"encoding": "MP3",                 ------not needed for WAV files
                //"sampleRateHertz": 16000,          ____/
                "languageCode": user_lang,
                "enableWordConfidence": true,
                "enableAutomaticPunctuation": false,
            }
        })
            .then(function (response) {
                // Handle the results here (response.result has the parsed body).
                recognized_speech = response.result;
                show_results(recognized_speech);
            },
                function (err) { console.error("Execute error", err); });
    }

    gapi.load("client");


    //=============================================================
    //=============OUR ALGORITHM AND SHOWING RESULTS===============
    //=============================================================


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
        $('#incorrectWords').empty();
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

    function show_results(recognized_speech){
        // this function will be called by the execute gogole success callback, with its interpreted string
        // then we take that string and do what we need with it
        transcript = recognized_speech.results[0].alternatives[0].transcript;

        // after we the google api call is executed and we get a response, we call the compare function with the user and google inputs
        incorrect_words = compare(user_input[0].value.split(" "), transcript.split(" "));
        // send the list of incorrect words form the compare function to the other function to update the dom
        render_incorrect_words(incorrect_words);
        correct_pronounciation(incorrect_words);

    }


    //=============================================================
    //===============CONNECT TO DOM, SET HANDLERS==================
    //=============================================================

    var user_input;
    var user_lang;

    $("#main_form").submit(function (event) {
        event.preventDefault();
        // here we start recording
        startRecording();
        // and we also take the sentence they put in the form and save into a variable so we can compare with it later
        user_input = $("#main_form").serializeArray();
        user_lang = user_input[1].value;
        // based on the user value we also want to change the text to speech thing to give them the correct pronounciation
        text_to_speech = {
            "it-IT": "Google italiano",
            "nl-NL": "Google Nederlands",
            "pl-PL": "Google polski",
            "id-ID": "Google Bahasa Indonesia",
            "fr-FR": "Google français",
            "es-ES": "Google español",
            "en-US": "Google US English",
            "de-DE": "Google Deutsch",
            "pt-BR": "Google português do Brasil"
        }
        // now we check to see if the user lang is in our supported langs for text to speech and if it is
        // we change the select element that is used to make the api call
        if(text_to_speech.hasOwnProperty(user_lang)){
            $("#voiceList").attr("value", text_to_speech[user_lang]);
        } else {
            $('#incorrectWords').append("<p>Sorry correct pronounciation sounds are not available for this language</p>");
        }
        // load client
        loadClient();
    });

    $("#end_pronounce").click(function() {
        // here we end the pronounciation and store the wav base 64 encoding
        stopRecording();
    })

    $("#evaluate").click(function() {
        // execute the gapi client which will the use the variables that we have stored values in
        execute();
    })
    
    
});
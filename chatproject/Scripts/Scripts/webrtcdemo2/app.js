
var myAudio = $("#song")[0];
document.getElementById("song").loop = true;
var isPlaying = false;

function togglePlay() {
    if (isPlaying) {
        myAudio.pause();
    } else {
        myAudio.play();
    }
};
myAudio.onplaying = function () {
    isPlaying = true;
};
myAudio.onpause = function () {
    isPlaying = false;
};

function waitTenSec() {
    setTimeout(function () {
        if ($('.callingSection').css('display') == 'block') {
            togglePlay();
            $(".callingSection").hide();
        }

    }, 15000);
}

var height = 240; // parseInt(option_height.value),
var width = 240; // parseInt(option_width.value),
var framerate = 10; // parseInt(option_framerate.value),
var audiobitrate = 22050; // 44100; 11025 parseInt(option_bitrate.value),
var videoElement = document.querySelector('.video.mine');
var audioSelect = document.querySelector('select#audioSource');
var videoSelect = document.querySelector('select#videoSource');
var _mediaStream;
audioSelect.onchange = getStream;
videoSelect.onchange = getStream;

//getStream().then(getDevices).then(gotDevices);

function getDevices() {
    // AFAICT in Safari this only gets default devices until gUM is called :/
    return navigator.mediaDevices.enumerateDevices();
}

function gotDevices(deviceInfos) {
    window.deviceInfos = deviceInfos; // make available to console
    console.log('Available input and output devices:', deviceInfos);
    for (const deviceInfo of deviceInfos) {
        const option = document.createElement('option');
        option.value = deviceInfo.deviceId;
        if (deviceInfo.kind === 'audioinput') {
            option.text = deviceInfo.label || `Microphone ${audioSelect.length + 1}`;
            audioSelect.appendChild(option);
        } else if (deviceInfo.kind === 'videoinput') {
            option.text = deviceInfo.label || `Camera ${videoSelect.length + 1}`;
            videoSelect.appendChild(option);
        }
    }
}

function getStream() {
    alert('version1')
    if (window.stream) {
        window.stream.getTracks().forEach(track => {
            track.stop();
        });
    }
    const audioSource = audioSelect.value;
    const videoSource = videoSelect.value;
    const constraints = {
        audio: { deviceId: audioSource ? { exact: audioSource } : undefined },

        video: {
            //width: { min: 100, ideal: width, max: 1920 },
            //height: { min: 100, ideal: height, max: 1080 },
            width: { min: 100, ideal: 240, max: 100 },
            height: { min: 100, ideal: 240, max: 100 },
            frameRate: { ideal: framerate },
            deviceId: videoSource ? { exact: videoSource } : undefined
        }
    };
    return navigator.mediaDevices.getUserMedia(constraints).
        then(gotStream).catch(handleError);
}

function gotStream(stream) {
    _mediaStream = stream;
    //  window.stream = stream; // make stream available to console
    audioSelect.selectedIndex = [...audioSelect.options].
        findIndex(option => option.text === stream.getAudioTracks()[0].label);
    videoSelect.selectedIndex = [...videoSelect.options].
        findIndex(option => option.text === stream.getVideoTracks()[0].label);
    videoElement.srcObject = stream;
}

function handleError(error) {
    console.error('Error: ', error);
}


//var imageAddr = "https://stream.sup-ect.ir/img/test.jpg";
//var downloadSize = 3788800; //bytes
//var Result = 0;
//function ShowProgressMessage(msg) {
//    if (console) {
//        if (typeof msg == "string") {
//            console.log(msg);
//        } else {
//            for (var i = 0; i <msg.length; i++) {
//                console.log(msg[i]);
//            }
//        }
//    }
//    var oProgress = document.getElementById("progress");
//    if (oProgress) {
//        var actualHTML = (typeof msg == "string") ? msg : msg.join("<br />");
//        oProgress.innerHTML = actualHTML;
//    }
//}
//function InitiateSpeedDetection() {
//    ShowProgressMessage("Loading the image, please wait...");
//    window.setTimeout(MeasureConnectionSpeed, 1);
//};
//if (window.addEventListener) {
//    window.addEventListener('load', InitiateSpeedDetection, false);
//} else if (window.attachEvent) {
//    window.attachEvent('onload', InitiateSpeedDetection);
//}
//function MeasureConnectionSpeed() {
//    var startTime, endTime;
//    var download = new Image();
//    download.onload = function () {
//        endTime = (new Date()).getTime();
//        showResults();
//    }
//    download.onerror = function (err, msg) {
//        ShowProgressMessage("Invalid image, or error downloading");
//    }
//    startTime = (new Date()).getTime();
//    var cacheBuster = "?nnn=" + startTime;
//    download.src = imageAddr + cacheBuster;
//    function showResults() {
//        var duration = (endTime - startTime) / 1000;
//        var bitsLoaded = downloadSize * 8;
//        var speedBps = (bitsLoaded / duration).toFixed(2);
//        var speedKbps = (speedBps / 1024).toFixed(0);
//        Result = speedKbps; 
//       // var speedMbps = (speedKbps / 1024).toFixed(2);

//    }
//}





let silence = () => {
    let ctx = new AudioContext(), oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
}

let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext('2d').fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
}

//let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
let blackSilence = (...args) => new MediaStream([black(...args), silence()]);

var WebRtcDemo = WebRtcDemo || {};

// todo:
//  cleanup: proper module loading
//  cleanup: promises to clear up some of the async chaining
//  feature: multiple chat partners

WebRtcDemo.App = (function (viewModel, connectionManager) {
    var _hub,

        _geustStream = "0",
        _slaveNumber = 1,
        _streamType = 'blank',
        _IAMDone,
        _Attachment = {},
        mediaRecorder,
        reader = null,
        intervalVar

    _connect = function (username, onSuccess, onFailure) {
        // Set Up SignalR Signaler

        var hub = $.connection.chatHub;
        hub.client.SetDefaultStream = function (index) {

        };
        hub.client.setMessage = function (message, connectionID, name, type, progressID) {



            if (connectionID == viewModel.MyConnectionId()) {
                //var ul = $(".messages ul");
                //const li = document.createElement('li');
                //li.className = 'sent';
                //li.innerHTML = `<p>` + name +": " + message + `</p> `;
                //// var li = ' <li class="sent"> <img src = "http://emilcarlsson.se/assets/mikeross.png" alt = "" /> </li >';
                //ul.append(li);

            }
            else {

                var hasobject; // بفهمیم چنتا ال آی باید به لیست اضافه کنیم
                var hastext;
                var li; // مال متن همراه با آبجکت یا بدون آبجکت 
                var li2;// مال آبجکت
                var ul = $(".messages ul"); // لیست اصلی پیام ها - سیستم اینجوری کار میکنه که دوتالیست نداریم یه لیست داریم برای داخل و خارج که لیست با مستر خودش هیدن میشه
                console.log(message);
                if (message.includes('***')) {
                    let msg = message.split('***')[0];
                    url = message.split('***')[1];
                    hastext = true;
                    li = document.createElement('li');
                    li2 = document.createElement('li');
                    li.className = 'replies ' + connectionID;
                    li2.className = 'replies ' + connectionID;
                    li.innerHTML = `<p>` + msg + `</p> `;

                }
                else {
                    hastext = false;
                    url = message   // این یو آر ال میتواند هم یور ال هر آبجکتی باشد هم تکست آبحکت تکست
                    li = document.createElement('li');
                    li.className = 'replies ' + connectionID;
                    li.innerHTML = `<p>` + url + `</p> `;
                }

                if (type == "image") {
                    console.log(url);
                    li2 = document.createElement('li');
                    li2.className = 'replies ' + connectionID;
                    li2.innerHTML = `<div  style="position:relative;object-fit:scale-down;float:left;border-radius:0;border: 2px solid white;border-radius: 5px;"> <i id="` + url + `" style="position: absolute; top: 50%; left: 50%;  font-size: 20px;cursor:pointer; transform: translate(-50%, -50%);" class="fal fa-download" onclick="downlodIMG(this,1)"></i><img  style="min-width: 150px;max-width: 150px;border-radius:5px;margin: 0;"  src="/Files/0` + url + `"/></div>`;// `<img style="width:150px; float:left; border-radius:0" src="/Files/` + url + `" />`;
                    hasobject = true;
                }
                else if (type == "audio") {
                    li2 = document.createElement('li');
                    li2.className = 'replies ' + connectionID;
                    li2.innerHTML = 'replies ' + connectionID;
                    li2.innerHTML = `<div  style="position:relative;object-fit:scale-down;float:left;border-radius:0;border: 2px solid white;border-radius: 5px;"> <i id="` + url + `" style="z-index:99; position: absolute; top: 50%; left: 50%;  font-size: 20px;cursor:pointer; transform: translate(-50%, -50%);" class="fal fa-download" onclick="downlodIMG(this,2)"></i><audio controls='' style="float:right"><source src=""></source></audio></div>`;
                    hasobject = true;
                }
                else if (type == "file") {
                    li2 = document.createElement('li');
                    li2.className = 'replies ' + connectionID;
                    li2.innerHTML = `<div class='fileUploadParent  row'   style=""><img  src="/images/fileicon.png" /><span  >` + url + `</span></div>` + `<i id="` + url+`" class="fa fa-download" style="font-size: 14px;position: absolute;bottom: 20px;right: 10px;color: #1d1c1c; cursor:pointer" onclick = downlodFile(this)></i>`;
                    hasobject = true;
                }
                else {
                    hastext = true;
                }

                display = 'block';
                var ul = $(".messages ul");
                if (hasobject == true) {
                    li2.style.display = display;
                    ul.append(li2);
                }
                if (hastext == true) {
                    li.style.display = display;
                    ul.append(li);
                }



                var objDiv = document.getElementById("message");
                objDiv.scrollTop = objDiv.scrollHeight;
                _hub.server.messageRcieved(connectionID, progressID);

            }


        };

        hub.client.messageRecived = function (progressID) {
            var spg = $("#" + progressID).parent();
            let check = `<i class="fa fa-check" style="font-size: 12px;position: absolute;bottom: 5px;left: 10px;color: white;"></i>`;
            spg.append(check);

        };
        hub.client.callEveryOne = function (connectionID) {
            console.log("i am called");

            if (false) {
                hub.server.resPonseToCallEveryOne(connectionID);
                console.log("i have stream are you ready")
            }
            else {
                console.log("i am buisy")
            }
        };
        hub.client.areYouStillThere = function (responser) {
            if (_IAMDone != true) {
                _IAMDone = true;

                console.log(responser);
                console.log("i am waiting please send stream");

                hub.server.streamRequest(responser, _requestType);

            }
        };
        hub.client.updateUserList = function (userList) {

            viewModel.setUsers(userList);
        };
        hub.client.streamRequest = function (connectionId, reason) {
            console.log("calling user");
            _RequestedStream = 'blank';
            _hub.server.callUser(connectionId, "");
            alertify.success(reason);
        };
        // Hub Callback: Incoming Call
        hub.client.incomingCall = function (callingUser) {
            console.log('تماس ورودی از طرف: ' + JSON.stringify(callingUser));
            // alertify.success( "تماس ورودی " + _geustStream)
            if (callingUser.Username != 'relay') {
                _streamType = "video"
            }
            else {
                _streamType = "blank"
            }
            _adminConnectionID = callingUser.ConnectionId;
            hub.server.answerCall(true, callingUser.ConnectionId);
            viewModel.Mode('incall');

            //// Ask if we want to talk
            //alertify.confirm(callingUser.Username + ' منتظر شماست، آیا به گفتمان می پیوندید ؟', function (e) {
            //    if (e) {
            //        // I want to chat
            //        hub.server.answerCall(true, callingUser.ConnectionId);

            //        // So lets go into call mode on the UI
            //        viewModel.Mode('incall');
            //    } else {
            //        // Go away, I don't want to chat with you
            //        hub.server.answerCall(false, callingUser.ConnectionId);
            //    }
            //});
        };

        // Hub Callback: Call Accepted
        hub.client.callAccepted = function (acceptingUser) {

            console.log('پذیرفته شدن تماس از طرف : ' + JSON.stringify(acceptingUser) + '.  ');

            connectionManager.sendSignal(acceptingUser.ConnectionId, _RequestedStream);
            viewModel.guestConnectionId(acceptingUser.ConnectionId);
            connectionManager.initiateOffer(acceptingUser.ConnectionId, [_geustStream, _geustStream2], "1");
            //connectionManager.initiateOffer(acceptingUser.ConnectionId, _mediaStream);

            // Set UI into call mode
            viewModel.Mode('incall');
        };

        // Hub Callback: Call Declined
        hub.client.callDeclined = function (decliningConnectionId, reason) {
            console.log('رد تماس از طرف: ' + decliningConnectionId);

            // Let the user know that the callee declined to talk
            alertify.error(reason);

            // Back to an idle UI
            viewModel.Mode('idle');
        };

        // Hub Callback: Call Ended
        hub.client.callEnded = function (connectionId, reason) {
            console.log('تماس با ' + connectionId + ' پایان یافت: ' + reason);

            // Let the user know why the server says the call is over
            //الرت نمیده
            // alertify.error(reason);

            // Close the WebRTC connection
            connectionManager.closeConnection(connectionId);
            //_geustStream = "0";
            $(".hangup").css("display", "none");
            // Set the UI back into idle mode
            viewModel.Mode('idle');
        };

        // Hub Callback: Update User List
        hub.client.changeStream = function (stream, acceptingUser) {
            console.log(stream);
            console.log(acceptingUser.ConnectionId);

            if (stream == 'video') {
                connectionManager.changeTrack([_mediaStream], acceptingUser.ConnectionId);
            }
            else if (stream == 'blank') {
                connectionManager.changeTrack([blackSilence()], acceptingUser.ConnectionId);
            }


        };
        //hub.client.HideYourVideo = function (index) {
        //    if (_slaveNumber > 1) {
        //        var srt = '.video.partner' + index;
        //        console.log(srt);
        //        var videoToHide = document.querySelector(srt);
        //        videoToHide.style.display = "none";
        //        _slaveNumber = _slaveNumber - 1;

        //        if (_slaveNumber == 1) {
        //            $(".master").css("height", "100%");
        //            $(".slave").css("width", "30%");
        //            $(".slave").css("height", "30%");
        //            $(".slave").css("position", "absolute");
        //        }
        //        else if (_slaveNumber == 2) {
        //            $(".master").css("height", "50%");
        //            $(".slave").css("width", "50%");
        //            $(".slave").css("height", "50%");
        //            $(".slave").css("position", "relative");
        //            $(".slave video").css("object-fit", "cover");
        //        }
        //    }


        //};
        //hub.client.ShowYourVideo = function (index) {
        //    if (_slaveNumber <3) {
        //        var srt = '.video.partner' + index;
        //        console.log(srt);
        //        var videoToHide = document.querySelector(srt);
        //        videoToHide.style.display = "block";
        //        _slaveNumber = _slaveNumber + 1;

        //        if (_slaveNumber == 2) {
        //            $(".master").css("height", "50%");
        //            $(".slave").css("width", "50%");
        //            $(".slave").css("height", "50%");
        //            $(".slave").css("position", "relative");
        //            $(".slave video").css("object-fit", "cover");

        //        }
        //        else if (_slaveNumber == 3) {
        //            $(".master").css("height", "50%");
        //            $(".master").css("width", "50%");
        //            $(".slave").css("width", "50%");
        //            $(".slave").css("height", "50%");
        //            $(".slave").css("position", "relative");
        //            $(".slave video").css("object-fit", "cover");

        //        }
        //    }

        //};


        // Hub Callback: WebRTC Signal Received
        hub.client.receiveSignal = function (callingUser, data) {

            connectionManager.newSignal(callingUser.ConnectionId, data);
        };
        $.support.cors = true;
        $.connection.hub.url = '/signalr/hubs';
        $.connection.hub.start()
            .done(function () {
                //alert('connected to SignalR hub... connection id: ' + _hub.connection.id);

                // Tell the hub what our username is
                console.log(viewModel.Groupname());
                console.log(username);
                hub.server.join(viewModel.Groupname(), username, 'client');
                $("#chatname").text(username)
                if (onSuccess) {
                    onSuccess(hub);
                }
            })
            .fail(function (event) {

                if (onFailure) {
                    //onFailure(event);
                }
            });

        $.connection.hub.disconnected(function () {
            setTimeout(function () {
                $.connection.hub.start().done(function () {
                    //alert('connected to SignalR hub... connection id: ' + _hub.connection.id);

                    // Tell the hub what our username is
                    console.log(viewModel.Groupname());
                    console.log(username);
                    hub.server.join(viewModel.Groupname(), username, 'client');
                    $("#chatname").text(username)
                    if (onSuccess) {
                        onSuccess(hub);
                    }
                }).fail(function (event) {

                    if (onFailure) {
                        onFailure(event);
                    }
                });
                console.log("restart connection");
            }, 5000); // Restart connection after 5 seconds.
        });
        // Setup client SignalR operations
        //_setupHubCallbacks(hub);

        _hub = hub;
    },


        _start = function (hub, type) {
            console.log("start-" + type);
            // Show warning if WebRTC support is not detected
            if (webrtcDetectedBrowser == null) {
                console.log('مرورگر خود را به روزرسانی کنید');
                $('.browser-warning').show();
            }

            // Then proceed to the next step, gathering username
            _getUsername(type);
        },

        _getUsername = function (type) {
            console.log("getusername-" + type);
            alertify.prompt(" نام شما ؟", function (e, username) {
                if (e == false || username == '') {
                    //username = 'کاربر ' + Math.floor((Math.random() * 10000) + 1);
                    alertify.success('جهت اتصال باید نام کلاس را وارد کنید');
                }
                else {
                    _startSession(username);
                }

                // proceed to next step, get media access and start up our connection

            }, '');
        },

        _startSession = function (username) {

            // Set the selected username in the UI
            if (username != "") {
                viewModel.Username(username);
            }
           
            viewModel.Loading(true); // Turn on the loading indicator
            $('.instructions').hide();
            //var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            //if (!isMobile) {

            //    navigator.mediaDevices.getDisplayMedia({
            //        video: {
            //            cursor: "always"
            //        },
            //        audio: true
            //    }).then(

            //        stream => {
            //            console.log("screen is awesom");
            //            var videoScreen = document.querySelector('.video.screen');
            //            _screenStream = stream;


            //           // attachMediaStream(videoScreen, _screenStream);

            //        },
            //        error => {
            //            console.log("Unable to acquire screen capture", error);
            //            viewModel.Loading(false);
            //        });

            //}
            //else {
            //    $('.video.screen').css("display", "none");
            //};




            $('.instructions').hide();
            _finalStream = _mediaStream;

            //var videoElement = document.querySelector('.video.mine');
            //attachMediaStream(videoElement, stream);
            $(".audio.mine").css("display", "none");
            $(".mineholder").css("display", "inline-block");



            // Now we have everything we need for interaction, so fire up SignalR

            _connect(username, function (hub) {

                // tell the viewmodel our conn id, so we can be treated like the special person we are.
                viewModel.MyConnectionId(hub.connection.id);

                // Initialize our client signal manager, giving it a signaler (the SignalR hub) and some callbacks
                // alert('initializing connection manager');
                connectionManager.initialize(hub.server, _callbacks.onReadyForStream, _callbacks.onStreamAdded, _callbacks.onStreamRemoved, _callbacks.onTrackAdded);

                // Store off the stream reference so we can share it later
                // _mediaStream = stream;

                // Load the stream into a video element so it starts playing in the UI
                console.log('playing my local video feed');






                // Hook up the UI
                _attachUiHandlers();

                viewModel.Loading(false);

            }, function (event) {
                alertify.alert('<h4>Failed SignalR Connection</h4> We were not able to connect you to the signaling server.<br/><br/>Error: ' + JSON.stringify(event));
                viewModel.Loading(false);
            });
            // Ask the user for permissions to access the webcam and mic
            //getUserMedia(
            //    {
            //        // Permissions to request
            //        video: true,
            //        audio: true,
            //    },
            //    function (stream) { // succcess callback gives us a media stream

            //    },
            //    function (error) { // error callback
            //        alertify.alert('<h4>Failed to get hardware access!</h4> Do you have another browser type open and using your cam/mic?<br/><br/>You were not connected to the server, because I didn\'t code to make browsers without media access work well. <br/><br/>Actual Error: ' + JSON.stringify(error));
            //        viewModel.Loading(false);
            //    }
            //);


        },

        _attachUiHandlers = function () {

            var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                $(".slave").click(function () {
                    if (_slaveNumber > 1) {

                        if ($(this).width() != screen.width || screen.height - $(this).height() + $(".container-fluid").height() > 100) {

                            $(this).css("width", "100%");
                            $(this).css("height", "100%");
                            $(this).css("position", "absolute");
                            $(this).css("z-index", "9");
                            $(this).css("overflow", "none");
                            $(".slave video").css("object-fit", "contain");

                        }
                        else {
                            $(this).css("width", "50%");
                            $(this).css("height", "50%");
                            $(this).css("position", "relative");
                            $(this).css("z-index", "1");
                            $(this).css("overflow", "hidden");
                            $(".slave video").css("object-fit", "cover");

                        }
                    }
                })
                $(".master").click(function () {

                    if (_slaveNumber == 1) {

                        if ($(this).width() != screen.width) {

                            $(this).css("position", "relative");
                            $(this).css("width", "100%");
                            $(this).css("z-index", "0");

                        }
                        else {
                            $(this).css("position", "absolute");
                            $(this).css("width", "101%");
                            $(this).css("z-index", "9");


                        }
                    }
                    else if (_slaveNumber == 2) {
                        if ($(this).width() != screen.width || screen.height - $(this).height() + $(".container-fluid").height() > 100) {

                            $(this).css("width", "100%");
                            $(this).css("height", "100%");
                            $(this).css("position", "absolute");
                            $(this).css("z-index", "9");
                            $(this).css("overflow", "none");
                            $(this).css("object-fit", "scale-down");

                        }
                        else {
                            $(this).css("width", "100%");
                            $(this).css("height", "50%");
                            $(this).css("position", "relative");
                            $(this).css("z-index", "1");
                            $(this).css("overflow", "hidden");
                            $(this).css("object-fit", "cover");

                        }
                    }
                });
            }

            $(".mycamera").click(function () {
                var x = document.getElementById("cameraSection");
                if (x.style.display === "none") {
                    $("#cameraSection").slideDown();
                    // x.style.display = "block";
                } else {
                    $("#cameraSection").slideUp();
                    // x.style.display = "none";
                }
            });

            $(".chat").click(function () {
                var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) {
                    var width = $("#chatHolder").width();
                    if (width == 0) {
                        $(".content").css("display", "block");
                        $("#vidoeHolder").animate({
                            width: '0%'
                        });
                        $("#chatHolder").animate({
                            width: '100%'
                        })
                    }
                    else {
                        $(".content").css("display", "none");
                        $("#vidoeHolder").animate({
                            width: '100%'
                        });
                        $("#chatHolder").animate({
                            width: '0%'
                        })
                    }

                }
                else {
                    var width = $("#chatHolder").width();
                    if (width == 0) {
                        $("#vidoeHolder").animate({
                            width: '60%'
                        });
                        $("#chatHolder").animate({
                            width: '40%'
                        })
                    }
                    else {
                        $("#vidoeHolder").animate({
                            width: '100%'
                        });
                        $("#chatHolder").animate({
                            width: '0%'
                        })
                    }

                }


            });
            // Add click handler to users in the "Users" pane
            $('.user').live('click', function () {
                // Find the target user's SignalR client id
                var targetConnectionId = $(this).attr('data-cid');

                // Make sure we are in a state where we can make a call
                //if (viewModel.Mode() !== 'idle') {
                //    alertify.error('Sorry, you are already in a call.  Conferencing is not yet implemented.');
                //    return;
                //}

                // Then make sure we aren't calling ourselves.
                if (targetConnectionId != viewModel.MyConnectionId()) {
                    // Initiate a call
                    _hub.server.callUser(targetConnectionId);// 

                    // UI in calling mode
                    viewModel.Mode('calling');
                } else {
                    alertify.error("Ah, nope.  Can't call yourself.");
                }
            });

            // Add handler for the hangup button
            $('.hangup').click(function () {
                $(".master").css("height", "100%");
                //$(".slave").css("width", "30%");
                //$(".slave").css("height", "30%");
                //$(".slave").css("position", "absolute");
                _IAMDone = "";
                _geustStream = "0";
                // Only allow hangup if we are not idle
                $(".requst").css("display", "inline-block")
                $(".hangup").css("display", "none")
                if (viewModel.Mode() != 'idle') {
                    _hub.server.hangUp("");
                    connectionManager.closeAllConnections();
                    viewModel.Mode('idle');
                }
            });
            $('.requstSoti').click(function () {
                _requestType = 0;
                $(".master").css("height", "100%");
                //$(".slave").css("width", "30%");
                //$(".slave").css("height", "30%");
                //$(".slave").css("position", "absolute");
                _IAMDone = "";
                _geustStream = "0";
                // Only allow hangup if we are not idle
                $(".requst").css("display", "inline-block")
                $(".hangup").css("display", "none")
                if (viewModel.Mode() != 'idle') {
                    _hub.server.hangUp("");
                    connectionManager.closeAllConnections();
                    viewModel.Mode('idle');
                }



                getUserMedia(
                    {
                        // Permissions to request
                        video: false,
                        audio: true,
                    },
                    function (stream) { // succcess callback gives us a media stream

                        //var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                        //if (!isMobile) {
                        //     var audioTrack = stream.getAudioTracks()[0];
                        //     _screenStream.addTrack(audioTrack);
                        //}

                        $('.instructions').hide();
                        let videoTrack = stream.getVideoTracks()[0];
                        let audioTrack = stream.getAudioTracks()[0];

                        _mediaStream = stream;//new MediaStream([black(), audioTrack]); 
                        //_finalStream = new MediaStream([black(...args), silence()]);;
                        var videoElement = document.querySelector('.video.mine');
                        attachMediaStream(videoElement, _mediaStream);
                        $(".audio.mine").css("display", "none");


                        //blackSilence());//

                        viewModel.Loading(false);
                        $(".master").css("height", "100%");
                        //$(".slave").css("width", "30%");
                        //$(".slave").css("height", "30%");
                        //$(".slave").css("position", "absolute");
                        _IAMDone = "";
                        _geustStream = "0";
                        _hub.server.hangUp("");
                        connectionManager.closeAllConnections(viewModel.guestConnectionId());
                        _hub.server.callEveryOne(viewModel.guestConnectionId());
                        $(".callingSection").show();
                        togglePlay();
                        alertify.success("درخواست شما ارسال شد");
                        waitTenSec();
                    },
                    function (error) { // error callback
                        alertify.alert('<h4>Failed to get hardware access!</h4> Do you have another browser type open and using your cam/mic?<br/><br/>You were not connected to the server, because I didn\'t code to make browsers without media access work well. <br/><br/>Actual Error: ' + JSON.stringify(error));
                        viewModel.Loading(false);
                    }
                );


            });
            $('.requstTasviri').click(function () {
                _requestType = 1;
                $(".master").css("height", "100%");
                //$(".slave").css("width", "30%");
                //$(".slave").css("height", "30%");
                //$(".slave").css("position", "absolute");
                _IAMDone = "";
                _geustStream = "0";
                // Only allow hangup if we are not idle
                $(".requst").css("display", "inline-block")
                $(".hangup").css("display", "none")
                if (viewModel.Mode() != 'idle') {
                    _hub.server.hangUp("");
                    connectionManager.closeAllConnections();
                    viewModel.Mode('idle');
                }
                getUserMedia(
                    {
                        // Permissions to request
                        video: true,
                        audio: true,
                    },
                    function (stream) { // succcess callback gives us a media stream

                        //var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                        //if (!isMobile) {
                        //     var audioTrack = stream.getAudioTracks()[0];
                        //     _screenStream.addTrack(audioTrack);
                        //}

                        $('.instructions').hide();
                        let videoTrack = stream.getVideoTracks()[0];
                        let audioTrack = stream.getAudioTracks()[0];

                        _mediaStream = stream;//new MediaStream([black(), audioTrack]); 
                        //_finalStream = new MediaStream([black(...args), silence()]);;
                        var videoElement = document.querySelector('.video.mine');
                        attachMediaStream(videoElement, _mediaStream);
                        $(".audio.mine").css("display", "none");


                        //blackSilence());//

                        viewModel.Loading(false);
                        $(".master").css("height", "100%");
                        //$(".slave").css("width", "30%");
                        //$(".slave").css("height", "30%");
                        //$(".slave").css("position", "absolute");
                        _IAMDone = "";
                        _geustStream = "0";
                        _hub.server.hangUp("");
                        connectionManager.closeAllConnections(viewModel.guestConnectionId());
                        _hub.server.callEveryOne(viewModel.guestConnectionId());
                        $(".callingSection").show();
                        togglePlay();
                        alertify.success("درخواست شما ارسال شد");
                        waitTenSec();
                    },
                    function (error) { // error callback
                        alertify.alert('<h4>Failed to get hardware access!</h4> Do you have another browser type open and using your cam/mic?<br/><br/>You were not connected to the server, because I didn\'t code to make browsers without media access work well. <br/><br/>Actual Error: ' + JSON.stringify(error));
                        viewModel.Loading(false);
                    }
                );



            });

            $(".attachment").click(function () {
                $("#fileupload").click();
            });
            $("#addItem").click(function () {
                $("#fileupload").click();
            });
            $("#fileupload").on('change', function () {

                var input = this;
                var url = $(this).val()
                var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
                var filename = url.substring(url.lastIndexOf('\\') + 1).toLowerCase();
                if (input.files && input.files[0] && (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) {
                    $("#attachmentDiv").fadeIn();

                    const mydiv = document.createElement('div');
                    mydiv.className = 'thumbItem added';
                    mydiv.innerHTML = `<img src="#" style="width:100%;height:100%"/>`;

                    var reader = new FileReader();

                    reader.onload = function (e) {
                        sourc = e.target.result;
                        $('#preview').attr('src', sourc);
                        mydiv.firstChild.setAttribute("src", sourc);

                    }

                    reader.readAsDataURL(input.files[0]);
                    $(".thumbHolder").append(mydiv);
                    let key = $("#fileupload").val();

                    _Attachment[key] = input.files[0];

                } else {
                    $("#attachmentDiv").fadeIn();

                    const mydiv = document.createElement('div');
                    mydiv.className = 'thumbItem added';
                    let key = $("#fileupload").val();
                    mydiv.innerHTML = `<img src="/images/fileicon.png" style="width:100%;height:100%"/>`;
                    $('#preview').attr('src', '/images/fileicon.png');
                    $('#previewText').text(filename);

                    $(".thumbHolder").append(mydiv);

                    _Attachment[key] = input.files[0];
                }


                //if (input.files && input.files[0]) {
                //    _Attachment = input.files[0]
                //    $("#attachmentDiv").show();
                //    var reader = new FileReader();
                //    reader.onload = function () {
                //        $("#preview").attr("src", reader.result);
                //    }

                //    reader.readAsDataURL(file);

                //    //$("#preview").attr('src', $("#fileupload").val()); 
                //   // $(".previewImage").attr() text($(this).val()
                //}
                //else {
                //    // alert("s")
                //}

            });
            $("#removePreview").click(function () {
                $("#attachmentDiv").fadeOut();
                _Attachment = {};
                $('.added').remove();
            });

            $(".submit").click(function () {  // به ازای هر آبجکت علاوه بر ذخیره سازی یه بلاب برای نمایش میسازد و مسیج را نیز میفرستد همراه با آرایه

              
               

                $("#attachmentDiv").hide();
                var messageType = "text";
                var message = $("#chatMessage").val();
                let count = 0;
                _Attachment2 = {};
              
                var ul = $(".messages ul");
            
                $.each(_Attachment, function (key, value) {
                    count += 1;
                    var progressID = _makeid();
                    var ext = key.substring(key.lastIndexOf('.') + 1).toLowerCase();
                    var filename = key.substring(key.lastIndexOf('\\') + 1).toLowerCase();
                    var ul = $(".messages ul");
                    if (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg") {

                        reader = new FileReader();
                       
                        reader.onload = function (e) {
                            count += 1;
                            const li = document.createElement('li');
                            li.className = "sent";
                            li.innerHTML = `<img id="` + progressID + `" src="` + e.target.result + `" style="float:right; width: 150px;border-radius:0; position: relative;background-color: #ddd;color: black;"/>`;
                            ul.append(li);
                            messageType = 'image';


                            // $("#chatMessage2").val('');
                            //$('#preview').attr('src', sourc);
                            //mydiv.firstChild.setAttribute("src", sourc);

                        }

                        reader.readAsDataURL(value);
                    }
                    else {
                       
                       
                        const li = document.createElement('li');
                        li.className = "sent";
                        li.innerHTML = `<div class='fileUploadParent row' id="` + progressID + `" style=""><div class="row"><img  src="/images/fileicon.png" /><span  >` + filename + `</span><div></div>`;
                        ul.append(li);
                        messageType = 'image';

                        
                    };


                    _Attachment2[filename + ";;;" + progressID ] = value;

                });

                if (count != 0) {   // اگر تعداد فایل بالای صفر باشد دیگر کاری به نوشته دارد و فایل ها را میفرستد برای ارسال
                   
                    _Attachment = {};
                    var returnName = _sendFile(_Attachment2);
                    
                }
                else {


                    var Username = $("#chatname").text();
                    if (message != '') {
                        var progressID = _makeid();
                        _hub.server.sendMessage(message, 'admin', messageType, progressID);
                        $("#chatMessage").val('');
                        var ul = $(".messages ul");
                        const li = document.createElement('li');
                        li.className = 'sent';
                        li.innerHTML = `<div id=` + progressID + `><p>` + message + `</p><i class="fa fa-check" style="font-size: 12px;position: absolute;bottom: 5px;left: 0px;color: white;"></i></div> `;
                        // var li = ' <li class="sent"> <img src = "http://emilcarlsson.se/assets/mikeross.png" alt = "" /> </li >';
                        ul.append(li);





                    };

                    //var objDiv = $("#messages");
                   

                }


                var objDiv = document.getElementById("message");
                objDiv.scrollTop = objDiv.scrollHeight;
                console.log($("#message").offset().top + '-');

                $(".message-input").val('');

                //var objDiv = document.getElementsByClassName("messages");
                //objDiv.scrollTop = objDiv.scrollHeight;
            });
            $('#save-recording').click(function () {
                this.disabled = true;
                mediaRecorder.save();
            });
            $("#recodrdVoice").on('mousedown', function (e) {

                _startRecording();
            });
            $("#recodrdVoice").on('mouseup', function (e) {

                _stopRecording();
            });


        },

        _captureUserMedia = function (mediaConstraints, successCallback, errorCallback) {

            navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
        },
        _startRecording = function (idx) {
            //$('#start-recording').disabled = true;
            //audiosContainer = document.getElementById('audios-container');
            //document.getElementById("clicks").innerHTML = "درحال رکورد";

            var f = document.getElementById('clicks');
            intervalVar = setInterval(function () {
                f.style.display = (f.style.display == 'none' ? '' : 'none');
            }, 1000);
            var mediaConstraints = {
                audio: true
            };
            _captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
        },
        onMediaSuccess = function (stream) {
            var TOK = $("#validation").val();

            mediaRecorder = new MediaStreamRecorder(stream);
            mediaRecorder.stream = stream;
            mediaRecorder.mimeType = 'audio/wav';
            mediaRecorder.audioChannels = 1;
            mediaRecorder.ondataavailable = function (blob) {

                var fileObject = new File([blob], "test.wav", {
                    type: 'audio/wav'
                });


                // در اینجا بلاب راظاهر میکنیم

                var reader = new FileReader();
                var progressID = _makeid();
                reader.onload = function (e) {

                    const li = document.createElement('li');
                    li.className = "sent";
                    li.innerHTML = `<audio id=` + progressID + ` controls='' style="float:right"><source src="` + e.target.result + `"></source></audio>`;;
                    var ul = $(".messages ul");
                    ul.append(li);
                }

                reader.readAsDataURL(fileObject);










                var formData = new FormData();

                // recorded data
                formData.append('audio-blob', fileObject);

                // file name
                formData.append('audio-filename', fileObject.name);
                let request = new XMLHttpRequest();
                request.open('POST', '/Screen/sendToServer');

                // upload progress event
                request.upload.addEventListener('progress', function (e) {
                    let percent_complete = parseInt((e.loaded / e.total) * 100);

                    let classname = '';
                    if (percent_complete >= 50) {
                        classname = 'over50';
                    }
                    let srt = `<div style="right:270px;"  class="progress-circlle ` + classname + `  p` + percent_complete + ` "><span>` + percent_complete + `%</span><div class="left-half-clipper"><div class="first50-bar"></div><div class="value-bar"></div></div></div>`;
                    var spg = $("#" + progressID).parent();

                    spg.children('.progress-circlle').each(function () {
                        this.remove();
                    })
                    spg.append(srt);
                });

                // AJAX request finished event
                request.addEventListener('load', function (e) {

                    var spg = $("#" + progressID).parent();
                    spg.children('.progress-circlle').each(function () {
                        this.remove();
                    })
                    let check = `<i class="fa fa-check" style="font-size: 12px;position: absolute;bottom: 5px;left:0px;color: white;"></i>`;
                    spg.append(check);

                    let messageType;
                    let rsp = request.response;

                    messageType = 'audio';

                    _hub.server.sendMessage(rsp, 'admin', messageType, progressID);// اینجا میفرسته برا ادمین
                    console.log('resid');
                    $("#chatMessage2").val('');


                    var objDiv = document.getElementById("message");
                    console.log($("#message").offset().top + '-');

                    objDiv.scrollTop = objDiv.scrollHeight;

                    message = "";
                    console.log(request.status);
                    console.log(request.response);


                });
                request.send(formData);
            };

            var timeInterval = 360 * 1000;
            mediaRecorder.start(timeInterval);
            // $('#stop-recording').disabled = false;
        },
        onMediaError = function (e) {
            console.error('media error', e);
        },
        _stopRecording = function () {
            clearInterval(intervalVar);

            document.getElementById("clicks").style.display = "none";

            //var f = document.getElementById('clicks');
            //setInterval(function () {
            //    f.style.display = (f.style.display == 'none' ? '' : 'none');
            //}, 10000);
            mediaRecorder.stop();
            mediaRecorder.stream.stop();


            //$('.start-recording').disabled = false;
        },
        bytesToSize = function (bytes) {
            var k = 1000;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes === 0) return '0 Bytes';
            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
        },
        getTimeLength = function (milliseconds) {
            var data = new Date(milliseconds);
            return data.getUTCHours() + " hours, " + data.getUTCMinutes() + " minutes and " + data.getUTCSeconds() + " second(s)";
        },
        _makeid = function () {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < 10; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        },

        _sendFile = function (file) {
           
            let total = 0;
            let counter = 0;
            $.each(file, function (key, value) {
                total += 1;
            });
            $.each(file, function (key, value) {

             
                let progressID = key.split(';;;')[1];
                key = key.split(';;;')[0];

                var ext = key.substring(key.lastIndexOf('.') + 1).toLowerCase();
                var filename = key.substring(key.lastIndexOf('\\') + 1).toLowerCase();
                let messageType = null;
                if (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg") {
                    messageType = 'image';
                }
                else {
                    messageType = 'file';
                }


                var formData = new FormData();
                var fileName = key
                formData.append('blob', value);
                formData.append('filename', fileName);
                let request = new XMLHttpRequest();
                request.open('POST', '/screen/sendToServer');
                request.upload.addEventListener('progress', function (e) {

                    let percent_complete = parseInt((e.loaded / e.total) * 100);

                    let classname = '';
                    if (percent_complete >= 50) {
                        classname = 'over50';
                    }
                    let classnamerForthis = '';
                  
                    if (messageType == 'file') {
                        classnamerForthis = 'filePostition';
                    }

                   

                    let srt = `<div  class="` + classnamerForthis + `  progress-circlle ` + classname + `  p` + percent_complete + ` "><span>` + percent_complete + `%</span><div class="left-half-clipper"><div class="first50-bar"></div><div class="value-bar"></div></div></div>`;
                    var spg = $("#" + progressID).parent();

                    spg.children('.progress-circlle').each(function () {
                        this.remove();
                    })
                    spg.append(srt);

                    //console.log(e.loaded / e.total + "-" + percent_complete + "%");
                });

                // AJAX request finished event
                request.addEventListener('load', function (e) {

                    var ext = key.substring(key.lastIndexOf('.') + 1).toLowerCase();
                    var filename = key.substring(key.lastIndexOf('\\') + 1).toLowerCase();
                    let messageType = null;
                    if (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg") {
                        messageType = 'image';
                    }
                    else {
                        messageType = 'file';
                    }


                    var ul = $(".messages ul");
                    counter += 1;

                    let rsp = request.response;
                    var spg = $("#" + progressID).parent();



                    spg.children('.progress-circlle').each(function () {
                        this.remove();
                    })
                    let check = `<i class="fa fa-check" style="font-size: 12px;position: absolute;bottom: 5px;left: 0px;color: white;"></i>`;
                    spg.append(check);




                  
                    if (counter == total) {
                        message = $("#chatMessage2").val();
                      
                        if (message != '') {
                            const li2 = document.createElement('li');
                            li2.className = "sent";
                            let htmlsrt2;
                            htmlsrt2 = `<p>` + message + `</p> `;
                            li2.innerHTML = htmlsrt2;
                            ul.append(li2);
                            message = message + "***" + rsp;


                        }
                        else {
                            message = rsp;
                        }
                        _Attachment = {};
                        $('.added').remove();
                        $("#fileupload").val('');
                        $("#chatMessage2").val('');

                    }
                    else {
                        message = rsp;
                    }

                    _hub.server.sendMessage(message, 'admin', messageType, progressID);// اینجا میفرسته برا ادمین


                    //setInterval(function () {

                    //}, 1000);
                    var myobj = document.getElementById("message");
                    myobj.scrollTop = myobj.scrollHeight;



                    message = "";

                })
                // send POST request to server side script
                request.send(formData);
            })


        },
        _setName = function (name) {
           viewModel.Groupname(name);
          
        },
        // Connection Manager Callbacks
        _callbacks = {

            onReadyForStream: function (connection) {

                // The connection manager needs our stream
                // todo: not sure I like this

                //navigator.mediaDevices.getDisplayMedia({
                //    video: {
                //        cursor: "always"
                //    },
                //    audio: true
                //}).then(
                //    stream => {
                //        console.log("awesom");
                //        _mediaStream = stream;
                //        var videoElement = document.querySelector('.video.mine');
                //        attachMediaStream(videoElement, stream);
                //        $(".audio.mine").css("display", "none");


                //    },
                //    error => {
                //        console.log("Unable to acquire screen capture", error);
                //    });

                //connection.addStream(_mediaStream); 


                var st1 = new MediaStream();
                var st2 = new MediaStream();

                // st2.getAudioTracks[0] = blackSilence().getAudioTracks[0];
                // st2.getAudioTracks[0] = _mediaStream.getAudioTracks[0];

                //st2.getVideoTracks[0] = blackSilence().getVideoTracks[0];
                // st2.getVideoTracks[0] = _mediaStream.getVideoTracks[0];

                //let STES = [_mediaStream, blackSilence()];
                //for (const stream of STES) {

                //};
                if (_streamType == 'video') {
                    _mediaStream.getTracks().forEach(function (track) {

                        connection.addTrack(track, st1);
                    });
                }
                else {

                    blackSilence().getTracks().forEach(function (track) {

                        connection.addTrack(track, st1);
                    });
                }


                console.log("adding media stream");
                //connection.addStream(_finalStream);


            },
            onStreamAdded: function (connection, event) {
                console.log('binding remote stream to the partner window');

                // Bind the remote stream to the partner window


                //var otherVideo = document.querySelector('.video.partner');

                //attachMediaStream(otherVideo, event.stream); // from adapter.js

                //$(".video.mine").parent().removeClass();
                //$(".video.mine").parent().addClass('mineholderAfter');
                //$(".video.screen").parent().removeClass();
                //$(".video.screen").parent().addClass('mineholderScreenAfter');
                $(".partnerholder").css("display", "inline-block");
                $(".requst").css("display", "inline-block");
                $(".hangup").css("display", "inline-block");




            },
            onTrackAdded: function (connection, event) {
                // alertify.success("ontrack   "+_geustStream);
                togglePlay();
                $(".callingSection").hide();
                if (_geustStream == "0") {
                    _geustStream = "1";
                    var otherVideo = document.querySelector('.video.partner');
                    var otherVideo2 = document.querySelector('.video.partner2');
                    var otherVideo3 = document.querySelector('.video.partner3');

                    //_geustStream = event.stream;
                    //_hasStream = "true";
                    var st1 = new MediaStream();
                    if (event.streams[0].getVideoTracks() != null) {
                        if (event.streams[0].getVideoTracks()[0] != null) {
                            console.log("1 has video")
                            st1.addTrack(event.streams[0].getVideoTracks()[0]);

                        }

                    }
                    if (event.streams[0].getVideoTracks() != null) {
                        if (event.streams[0].getAudioTracks()[0] != null) {
                            console.log("1 has audio")
                            st1.addTrack(event.streams[0].getAudioTracks()[0]);
                        }
                    }


                    var st2 = new MediaStream();
                    if (event.streams[0].getVideoTracks() != null) {
                        if (event.streams[0].getVideoTracks()[1] != null) {
                            console.log("2 has video")
                            st2.addTrack(event.streams[0].getVideoTracks()[1]);

                        }
                    }
                    if (event.streams[0].getVideoTracks() != null) {

                        if (event.streams[0].getAudioTracks()[1] != null) {
                            console.log("2 has audio")
                            st2.addTrack(event.streams[0].getAudioTracks()[1]);
                        }
                    }



                    var st3 = new MediaStream();
                    if (event.streams[0].getVideoTracks() != null) {
                        if (event.streams[0].getVideoTracks()[2] != null) {
                            console.log("3 has video")
                            st3.addTrack(event.streams[0].getVideoTracks()[2]);

                        }
                    }
                    if (event.streams[0].getVideoTracks() != null) {

                        if (event.streams[0].getAudioTracks()[2] != null) {
                            console.log("3 has audio")
                            st3.addTrack(event.streams[0].getAudioTracks()[2]);
                        }
                    }





                    attachMediaStream(otherVideo, st1);
                    //attachMediaStream(otherVideo2, st2);
                    //attachMediaStream(otherVideo3, st3);

                    console.log("ontrack fired!");

                    //if (_guestConnectionID != null) {
                    //    connectionManager.sendSignal(_guestConnectionID, _RequestedStream);
                    //    connectionManager.initiateOffer(_guestConnectionID, [_geustStream, _geustStream2], "1");
                    //}

                }
                else {
                    console.log("_getstream in no null");
                }





            },
            onStreamRemoved: function (connection, streamId) {
                // todo: proper stream removal.  right now we are only set up for one-on-one which is why this works.
                console.log('removing remote stream from partner window');

                // Clear out the partner window
                var otherVideo = document.querySelector('.video.partner');
                otherVideo.src = '';
            }
        };

    return {
        start: _start, // Starts the UI process
        getStream: function () { // Temp hack for the connection manager to reach back in here for a stream
            return _mediaStream;
        },
        setName: _setName
    };
})(WebRtcDemo.ViewModel, WebRtcDemo.ConnectionManager);

// Kick off the app
WebRtcDemo.App.start();
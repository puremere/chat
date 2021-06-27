
var minutesLabel = document.getElementById("minutes");
var secondsLabel = document.getElementById("seconds");
var totalSeconds = 0;
var time;
var f;
var isfirst = 0;


function setTime() {
    ++totalSeconds;
    secondsLabel.innerHTML = pad(totalSeconds % 60);
    minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}
function setTimeRefresh() {

    secondsLabel.innerHTML = pad(00);
    minutesLabel.innerHTML = pad(00);
}

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
}
function bleeper() {
    f = document.getElementById('beepImage');
    f.style.display = (f.style.display == 'none' ? 'flex' : 'none');
}
function setIntervalAndExecute(fn, t) {
    fn();
    return (setInterval(fn, t));
}
function play(url) {
    return new Promise(function (resolve, reject) {   // return a promise
        var audio = new Audio();                     // create audio wo/ src
        audio.preload = "auto";                      // intend to play through
        audio.autoplay = true;                       // autoplay when loaded
        audio.onerror = reject;                      // on error, reject
        audio.onended = resolve;                     // when done, resolve

        audio.src =  url; // just for example
    });
}

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

        hub.client.setMessage = function (message, connectionID, name, type, progressID, messageID,refresh) {



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
                    li.id = messageID;
                    li.className = 'sent ' + connectionID;
                    li2.className = 'sent ' + connectionID;
                    li.innerHTML = `<span>` + name + ` </span><br><p>` + msg + `</p> `;

                }
                else {
                    hastext = false;
                    url = message   // این یو آر ال میتواند هم یور ال هر آبجکتی باشد هم تکست آبحکت تکست
                    li = document.createElement('li');
                    li.id = messageID;
                    li.className = 'sent ' + connectionID;
                    li.innerHTML = `<span>` + name + ` </span><br><p>` + url + `</p> `;
                }

                if (type == "image") {
                    console.log(url);
                    li2 = document.createElement('li');
                    li2.id = messageID;
                    li2.className = 'sent ' + connectionID;
                    li2.innerHTML = `<span>` + name + ` </span><br><div  style="position:relative;object-fit:scale-down;float:left;border-radius:0;border: 2px solid white;border-radius: 5px;"> <span class="downloadIconHolder"><i id="` + url + `"  class="fa fa-download" onclick="downlodIMG(this,1)"></i></span><img  style="min-width: 150px;max-width: 150px;border-radius:5px;margin: 0;"  src="/Files/0` + url + `"/></div>`;// `<img style="width:150px; float:left; border-radius:0" src="/Files/` + url + `" />`;
                    hasobject = true;
                }
                else if (type == "audio") {
                    li2 = document.createElement('li');
                    li2.id = messageID;
                    li2.className = 'sent ' + connectionID;
                    li2.innerHTML = 'sent ' + connectionID;
                    li2.innerHTML = `<span>` + name + ` </span><br><div  style="position:relative;object-fit:scale-down;float:left;border-radius:0;border: 2px solid white;border-radius: 5px;"> <span class="downloadIconHolder"><i id="` + url + `" class="fa fa-download" onclick="downlodIMG(this,2)"></i></span><audio controls='' style="float:right"><source src=""></source></audio></div>`;
                    hasobject = true;
                }
                else if (type == "file") {
                    li2 = document.createElement('li');
                    li2.id = messageID;
                    li2.className = 'sent ' + connectionID;
                    li2.innerHTML = `<span>` + name + ` </span><br><div class='fileUploadParent  row'   style=""><img  src="/images/fileicon.png" /><span  >` + url + `</span></div>` + `<span  class="downloadIconHolder" style = "left: 5%;"><i id="` + url + `" class="fa fa-download"  onclick = downlodFile(this)></i></span>`;
                    hasobject = true;
                }
                else {
                    hastext = true;
                }

                display = 'block';
                var ul = $(".messages ul");
                if (hasobject == true)
                {
                    if (refresh == 1) {

                        var html = ul.html();
                        ul.html(li2);
                        ul.append(html);
                    }
                    else {
                        li2.style.display = display;
                        ul.append(li2);
                    }
                  
                }
                if (hastext == true) {
                    if (refresh == 1) {
                        var html = ul.html();
                        ul.html(li);
                        ul.append(html);
                    }
                    else {
                        li.style.display = display;
                        ul.append(li);
                    }
                  
                }


                if (refresh != 1) {
                    var objDiv = document.getElementById("message");
                    objDiv.scrollTop = objDiv.scrollHeight;
                } 
                
                // _hub.server.messageRcieved(connectionID, progressID);

            }


        };
        hub.client.loading = function (type) {
            console.log(type)
            if (type == 1) {
                $("#loading").show();
            }
            else {
               
                $("#loading").hide();
            }
        }
        hub.client.scrollTo = function (id) {
            var elem = $("#"+id);
            //$("#message").animate({ scrollTop: elem.offset().top }, { duration: 'fast', easing: 'swing' });
            console.log(elem)
            $("#message").scrollTop(elem.offset().top);
        }
        
        hub.client.messageRecived = function (progressID) {
            var spg = $("#" + progressID).parent();
            let check = `<i class="fa fa-check" style="font-size: 12px;position: absolute;bottom: 5px;left: 10px;color: white;"></i>`;
            spg.append(check);

        };


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
               
                if (isfirst == 1 ) {
                    $('ul').html('');
                    console.log('clearing ')
                }
                else {
                    isfirst = 1;
                }
                console.log("isfirst is :"+ isfirst);
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
                $('ul').html('');
            }, 5000); // Restart connection after 5 seconds.
        });

        _hub = hub;
    },


        _start = function (hub, type) {
            console.log("start-" + type);
            // Show warning if WebRTC support is not detected
            if (webrtcDetectedBrowser == null) {
                console.log('مرورگر خود را به روزرسانی کنید');
                $('.browser-warning').show();
            }

            var constraints = {
                audio: true
            };
            navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                _startSession();
            })
            .catch(function (err) {
                alertify.alert('<h4>عدم دسترسی به میکروفون</h4> برنامه جهت ادامه مجوز استفاده از میکروفون را لازم دارد<br/><br/> ');

            });
            // Then proceed to the next step, gathering username
           
        },



        _startSession = function (username) {
            username = viewModel.Username();



            $('.instructions').hide();
            $(".audio.mine").css("display", "none");
            $(".mineholder").css("display", "inline-block");

            _connect(username, function (hub) {

                viewModel.MyConnectionId(hub.connection.id);
                _attachUiHandlers();

            }, function (event) {
                alertify.alert('<h4>عدم ارتباط با سرور</h4> لطفا اینترنت خود را کنترل کنید و یا کانکشن خود را بروز رسانی کنید<br/><br/> ');

                viewModel.Loading(false);
            });

        },

        _attachUiHandlers = function () {




        $(".attachment").click(function () {
                $("#fileupload").click();
            });
            $("#addItem").click(function () {
                $("#fileupload").click();
            });
            $("#fileupload").on('change', function () {
                $("#recodrdVoice").hide();
                $(".submit").css("display", "block");
               
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
                $(".submit").css("display", "none");
                $("#recodrdVoice").show();
                //$("#recodrdVoice").css("display", "block");
            });

            $(".submit").click(function () {  // به ازای هر آبجکت علاوه بر ذخیره سازی یه بلاب برای نمایش میسازد و مسیج را نیز میفرستد همراه با آرایه

                $(".submit").css("display", "none");
                $("#recodrdVoice").css("display", "block");


                $("#attachmentDiv").hide();
                var messageType = "text";
                var message = $("#chatMessage").val();
                let count = 0;
                _Attachment2 = {};

                var ul = $(".messages ul");
                var Username = viewModel.Username();
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
                            li.innerHTML = `<span>` + Username + `  </span><br><img id="` + progressID + `" src="` + e.target.result + `" style="float:right; width: 150px;border-radius:0; position: relative;background-color: #ddd;color: black;"/>`;
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
                        li.innerHTML = `<div class='fileUploadParent row' id="` + progressID + `" style=""><div class="row"><spna>` + Username + ` <span><br><img  src="/images/fileicon.png" /><span  >` + filename + `</span><div></div>`;
                        ul.append(li);
                        messageType = 'image';


                    };


                    _Attachment2[filename + ";;;" + progressID] = value;

                });

                if (count != 0) {   // اگر تعداد فایل بالای صفر باشد دیگر کاری به نوشته دارد و فایل ها را میفرستد برای ارسال

                    _Attachment = {};
                    var returnName = _sendFile(_Attachment2);

                }
                else {


                    var Username = viewModel.Username();
                    if (message != '') {
                        var progressID = _makeid();
                        var groupname = viewModel.Groupname();
                        console.log(groupname);
                        _hub.server.sendChat(message, messageType, progressID, Username, groupname);
                        $("#chatMessage").val('');
                        var ul = $(".messages ul");
                        const li = document.createElement('li');
                        li.className = 'sent';
                        var ll = '<span>` + name + ` </span><br><p>` + msg + `</p> '
                        li.innerHTML = `<div  id=` + progressID + `><span>` + Username + `  </span><br><p>` + message + `</p></div> `;
                        // var li = ' <li class="sent"> <img src = "http://emilcarlsson.se/assets/mikeross.png" alt = "" /> </li >';
                        ul.append(li);





                    };

                    //var objDiv = $("#messages");


                }


                var objDiv = document.getElementById("message");
                objDiv.scrollTop = objDiv.scrollHeight;
                //console.log($("#message").offset().top + '-');

                $(".message-input").val('');

                //var objDiv = document.getElementsByClassName("messages");
                //objDiv.scrollTop = objDiv.scrollHeight;
            });
            $('#save-recording').click(function () {
                this.disabled = true;
                mediaRecorder.save();
            });
            $("#recodrdVoice").on('mousedown', function (e) {
                play("/beep.mp3").then(function () {
                    totalSeconds = 0;
                    time = setIntervalAndExecute(setTime, 1000);
                    intervalVar = setIntervalAndExecute(bleeper, 1000);
                    _startRecording();
                });
                //var audio = new Audio('');
                //audio.play();

            });
            $("#recodrdVoice").on('mouseup', function (e) {
                clearInterval(time);
                clearInterval(intervalVar);
                _stopRecording();
                setTimeRefresh();
            });
            $("#recodrdVoice").on('touchstart', function (e) {
                var audio = new Audio('/beep.mp3');
                audio.play();
                totalSeconds = 0;
                time = setIntervalAndExecute(setTime, 1000);
                intervalVar = setIntervalAndExecute(bleeper, 1000);
                _startRecording();
            });
            $("#recodrdVoice").on('touchend ', function (e) {
                clearInterval(time);
                clearInterval(intervalVar);
                _stopRecording();
                setTimeRefresh();
            });
            $("#chatMessage").on("input", function () {

                if ($(this).val().length > 0) {

                    $(".submit").css("display", "block");
                    $("#recodrdVoice").css("display", "none");
                }
                else {
                    $(".submit").css("display", "none");
                    $("#recodrdVoice").css("display", "block");
                }
                //alert(length);
            })
            $("#chatMessage").on("keydown", function (e) {

                if (e.keyCode == '13') {
                    if ($(this).val().length > 0) {
                        $(".submit").click();
                    }

                }
            })
            $("#message").on("scroll", function () {

                if ($("#message").scrollTop() == 0) {
                    //user is at the top of the page; no need to show the back to top button
                    _getNextList($("ul li:first").attr('id'));
                }
        });

        



        },

        _captureUserMedia = function (mediaConstraints, successCallback, errorCallback) {

            navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
        },
        _startRecording = function (idx) {
          //$('#start-recording').disabled = true;
            //audiosContainer = document.getElementById('audios-container');
            //document.getElementById("clicks").innerHTML = "درحال رکورد";

            //    var f = document.getElementById('clicks');
            //    intervalVar = setInterval(function () {
            //        f.style.display = (f.style.display == 'none' ? '' : 'none');
            //}, 1000);
        $('#clicks').css("display", "flex");
        var mediaConstraints = {
            audio: true
        };
        _captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

       
            
        },
        onMediaSuccess = function (stream) {
            var TOK = $("#validation").val();

            //clearInterval(myVar); 
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
                var Username = viewModel.Username();
                reader.onload = function (e) {

                    const li = document.createElement('li');
                    li.className = "sent";
                    li.innerHTML = `<span>` + Username + `  </span><br><audio id=` + progressID + ` controls='' style="float:right"><source src="` + e.target.result + `"></source></audio>`;
                    var ul = $(".messages ul");
                    ul.append(li);
                    var objDiv = document.getElementById("message");
                    objDiv.scrollTop = objDiv.scrollHeight;
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
                    var objDiv = document.getElementById("message");
                    objDiv.scrollTop = objDiv.scrollHeight;
                });

                // AJAX request finished event
                request.addEventListener('load', function (e) {

                    var spg = $("#" + progressID).parent();
                    spg.children('.progress-circlle').each(function () {
                        this.remove();
                    })


                    let messageType;
                    let rsp = request.response;

                    messageType = 'audio';
                    var Username = viewModel.Username();
                    var groupname = viewModel.Groupname();
                    console.log("line: " + Username);
                    _hub.server.sendChat(rsp, messageType, progressID, Username, groupname);// اینجا میفرسته برا ادمین
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


            document.getElementById("clicks").style.display = "none";

            //var f = document.getElementById('clicks');
            //setInterval(function () {
            //    f.style.display = (f.style.display == 'none' ? '' : 'none');
            //}, 10000);
            mediaRecorder.stop();
            mediaRecorder.stream.stop();


            //$('.start-recording').disabled = false;
        },
        _getNextList = function (id) {
            _hub.server.getChatUpdate(viewModel.MyConnectionId(), viewModel.Groupname(), id);
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
                    var Username = viewModel.Username();
                    var groupname = viewModel.Groupname();
                    _hub.server.sendChat(message, messageType, progressID, Username, groupname);// اینجا میفرسته برا ادمین


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
        _setName = function (name, username) {
            viewModel.Groupname(name);
            viewModel.Username(username);
            _start()
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
//WebRtcDemo.App.start();
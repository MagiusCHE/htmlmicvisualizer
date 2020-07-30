window.onload = function () {
    "use strict";
    var paths = document.getElementsByTagName('path');
    var visualizer = document.getElementById('visualizer');
    var mask = visualizer.getElementById('mask');
    var h = document.getElementsByTagName('h1')[0];
    var hSub = document.getElementsByTagName('h1')[1];
    var AudioContext;
    var audioContent;
    var start = false;
    var permission = false;
    var path;
    var seconds = 0;
    var loud_volume_threshold = 30;
	var lines = 20
	var lineheight = 80
	var linewidth= 1
	var initialspace = 0//0.25
    
    var soundAllowed = function (stream) {
		h.innerHTML=''
        permission = true;
        var audioStream = audioContent.createMediaStreamSource( stream );
        var analyser = audioContent.createAnalyser();
        var fftSize = 128;

        analyser.fftSize =fftSize
        audioStream.connect(analyser);

        var bufferLength = analyser.frequencyBinCount;
        var frequencyArray = new Uint8Array(bufferLength);
        
        visualizer.setAttribute('viewBox', '0 0 ' + (lines*2) + ' ' + lineheight*2);
      
        for (var i = 0 ; i < lines*4; i++) {
            path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('stroke-dasharray', '4,1');
            mask.appendChild(path);
        }
        var doDraw = function () {
            requestAnimationFrame(doDraw);
            if (start) {
                analyser.getByteFrequencyData(frequencyArray);
                var adjustedLength;
                for (var i = 0 ; i < lines; i++) {
					const val = frequencyArray[Math.floor(i * (frequencyArray.length/lines))]
                  	adjustedLength = Math.floor(((Math.floor(val) - (Math.floor(val) % 5))/255) * lineheight) /*- (Math.floor(val) % 5);*/
                    paths[i].setAttribute('d', 'M '+ (i+initialspace+lines) +',' + lineheight + ' l 0,-' + adjustedLength);
					paths[i+(lines*1)].setAttribute('d', 'M '+ (i+initialspace+lines) +',' + lineheight + ' l 0,' + adjustedLength);
					paths[i+(lines*2)].setAttribute('d', 'M '+ (lines-initialspace-i) +',' + lineheight + ' l 0,-' + adjustedLength);
					paths[i+(lines*3)].setAttribute('d', 'M '+ (lines-initialspace-i) +',' + lineheight + ' l 0,' + adjustedLength);
                }
            }
            else {
                for (var i = 0 ; i < lines; i++) {
                    paths[i].setAttribute('d', 'M '+ (i) +',' + lineheight+ ' l 0,-' + 0);
                }
            }
        }
        doDraw();
    }

    var soundNotAllowed = function (error) {
        h.innerHTML = "You must allow your microphone.";
        console.log(error);
    }

    document.getElementById('button').onclick = function () {
        if (start) {
            start = false;			
            this.innerHTML = "<span class='fa fa-play'></span>Start Listen";
            this.className = "green-button";
        }
        else {
            if (!permission) {
                navigator.mediaDevices.getUserMedia({audio:true})
                    .then(soundAllowed)
                    .catch(soundNotAllowed);

                AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContent = new AudioContext();
            }
            start = true;			
            this.innerHTML = "<span class='fa fa-stop'></span>Stop Listen";
            this.className = "red-button";
        }
    };
	setTimeout(function(){
		if (start){
			return
		}
		$('.button-container').hide()
		document.getElementById('button').onclick()
	},5000)
};
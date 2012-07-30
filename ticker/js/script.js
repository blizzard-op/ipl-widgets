// Author: James Burroughs 2012 - Code-Foo IPL


(function($) {

	//============================ TICKER NAMESPACE =============================//
	(function() {

		var _bar;
		var _width;
		var _pollSpeed = 5*1000; //How often the API is called
		var _marqueeSpeed = 20*1000; //The time it will take for text to move from one side to the other
		var _data;
		var _ajaxRequests = [];
		var _pollTimer;
		var _animStarted = false;
		var _animChainID = 1; //Allows me to invalidate a loop and restart (eg resizing on fly)
		var _resizeTimer;
		var _rootID = "iplTicker";

		var _fontSize;
		var _height;
		var _width;

		var textBlockMap = {
			plaintext: function(data) {
				var frag = document.createDocumentFragment();

				var headline = ce("span","ticker-headline", "", data.headline);
				var text = ce("span","ticker-text","",data.text);
				
				frag.appendChild(headline);
				frag.appendChild(text);

				return frag;
			},
			breaking: function(data) {

			},
			sc_player: function(data) {
				var frag = document.createDocumentFragment();

				frag.appendChild(ce("span", "ticker-player" + " " + data.race, "", data.nick));
				if(data.team) frag.appendChild(ce("span","ticker-team","", "." + data.team));

				return frag;
			},
			sc_result: function(data) {
				var frag = document.createDocumentFragment();

				var headline = ce("span","ticker-headline", "", data.headline);
				var winnerScore = ce("span", "ticker-score","", data.winner.score);
				var loserScore = ce("span", "ticker-score","", data.loser.score);
				var winner = this.sc_player(data.winner);
				var loser = this.sc_player(data.loser);
				var def = ce("span","ticker-def_vs","","def.");
				var text = ce("span","ticker-text","",data.text);

				frag.appendChild(headline);			
				frag.appendChild(winner);
				frag.appendChild(winnerScore);
				frag.appendChild(def);				
				frag.appendChild(loser);
				frag.appendChild(loserScore);
				frag.appendChild(text);

				return frag;
			},
			sc_match: function(data) {
				var frag = document.createDocumentFragment();

				var headline = ce("span","ticker-headline", "", data.headline);
				var player1 = this.sc_player(data.player1);
				var player2 = this.sc_player(data.player2);
				var vs = ce("span","ticker-def_vs","","vs.");
				var text = ce("span","ticker-text","",data.text);

				frag.appendChild(headline);			
				frag.appendChild(player1);
				frag.appendChild(vs);			
				frag.appendChild(player2);
				frag.appendChild(text);

				return frag;
			},
			lol_result: function(data) {

			}
		}

		//When DOM ready, fire
		$(function() {

			var root = document.getElementById(_rootID);
			if(!root) return;

			_bar = ce("div","","ticker-bar");

			//Get config if available
			var setup = window.iplTickerConfig || {};

			//Set bar attributes based off setup obj
			if(setup.height) {
				_height = setup.height;
				$(_bar).height(setup.height);
			}
			if(setup.width) {
				_width = setup.width;
				$(_bar).width(setup.width);
			}
			if(setup.speed) {
				var speed = Number(setup.speed);
				if(speed !== NaN) _marqueeSpeed = speed * 1000;
			}
			if(setup.fontSize) _fontSize = setup.fontSize;

			root.appendChild(_bar);

			//Bind onresize
			$(window).resize(resizeBar);

			//Bind onfocus event so animation properly resumes from being in background
			$(window).focus(function() {
				//resetAnimation();
			});

			//Start it off!
			resizeBar();
		});
		

		function resizeBar() {
			var currWidth = $(_bar).width();
			if(currWidth !== _width) {
				_width = currWidth;
				resetAnimation();
			}
		}


		function poll() {

			if(_pollTimer) clearTimeout(_pollTimer);

			_ajaxRequests.push(
				$.ajax({
				url: "dummy_ajax.json",
					dataType: "json",
					type: "GET",
					cache: false,

					success: function(data) {
						_data = data;
						if(!_animStarted) {
							animate(_animChainID);
							_animStarted = true;
						}
						_pollTimer = setTimeout(function() {
							poll(); //Poll again!!!
						}, _pollSpeed);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						if(textStatus === "abort") return;
						//There was an error, so poll again in half a second
						_pollTimer = setTimeout(function() {
							poll();
						}, 500);
					}
				})
			);

		}

		function resetAnimation() {
			//Abort all ajax requests
			while(_ajaxRequests.length) _ajaxRequests.pop().abort();

			_animStarted = false;
			_animChainID++;

			poll();
		}


		function animate(id) {

			//Create a new textSlider from the latest data
			var textSlider = createTextSlider(_data);

			//Add textSlider to DOM		
			document.body.appendChild(textSlider); //Insert into overlay to attain actual width (with different styling)
			var textSliderWidth = $(textSlider).width(); //Grab DOM width
			$(textSlider).width(textSliderWidth); //Set width before inserting into _bar
			_bar.appendChild(textSlider); //Insert into _bar

			//We want the speed to be constant with varying textSlider lengths
			//Also we want the speed to be proportional to the resolution
			var distanceToTravel = textSliderWidth + _width;
			var multi = distanceToTravel / _width; //Also start next anim at this point
			var duration = _marqueeSpeed * multi;
			var start = new Date().getTime();
			var end = start + duration;

			//Start next animation
			var startedNext = false;
			var startNextAt = start + (textSliderWidth / distanceToTravel) * duration;

			(function animloop(now) {

				var f = window.requestAnimationFrame(animloop);
				//_animTimer = setTimeout(animloop, 16.66);

				//Is the animation complete?
				if(now > end || id !== _animChainID) {
					window.cancelAnimationFrame(f);
					$(textSlider).remove();
					return;
				}

				//Start the next animation yet?
				if(!startedNext) {
					if(now >= startNextAt) {
						animate(id);
						startedNext = true;
					}
				}

				var progress = (now - start) / duration;
				var x = _width - progress * distanceToTravel;

				textSlider.style.left = x + "px";


			})();

		}

		function createTextSlider(data) {

			var wrapper = ce("div", "ticker-textSlider");
			if(_fontSize) wrapper.style.fontSize = _fontSize;
			if(_height) wrapper.style.lineHeight = _height;

			for(var i = 0, len = data.length; i < len; i++) {
				var textBlock = ce("div","ticker-textBlock");
				var contents = textBlockMap[data[i].type] && textBlockMap[data[i].type](data[i]) || null;
				if(contents) textBlock.appendChild(contents);
				else continue;

				wrapper.appendChild(textBlock);
			}

			return wrapper;
		}


	})();


	//Request Animation Frame Polyfill
	(function() {
	    var lastTime = 0;
	    var vendors = ['ms', 'moz', 'webkit', 'o'];
	    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
	        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
	        window.cancelAnimationFrame = 
	          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
	    }
	 
	    if (!window.requestAnimationFrame)
	        window.requestAnimationFrame = function(callback, element) {
	            var currTime = new Date().getTime();
	            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
	            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
	              timeToCall);
	            lastTime = currTime + timeToCall;
	            return id;
	        };
	 
	    if (!window.cancelAnimationFrame)
	        window.cancelAnimationFrame = function(id) {
	            clearTimeout(id);
	    };
	}());

	//DOM object creator helper
	function ce(tag,c,id,text) {

		if(!tag) return;

		var e = document.createElement(tag);
		if(c) e.className = c;
		if(id) e.setAttribute("id", id);
		if(text) $(e).text(text);

		return e;
	}


})(jQuery)




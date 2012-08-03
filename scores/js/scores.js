(function($) {
	var basepath = "http://esports.ign.com/addons/ipl-widgets/scores/";
	var ipl = {
		init: function(config) {
			this.loadStyleSheet();
			this.url = 'http://esports.ign.com/scores.json';
			this.template = config.template;
			this.container = config.container;
			this.fetch();
			this.buttons();
		},

		attachTemplate: function() {
			var template = Handlebars.compile(this.template);
			this.container.append(template(this.matchUps));
		},

		fetch: function() {
			var self = this;
			$.ajax({
			    type: 'GET',
			    url: this.url,
			    dataType: "jsonp",
			    cache: true,
				jsonpCallback: "getCachedScores",

			    success: function(data) {
			        self.matchUps = [];
			        $.map(data, function(data, date) {
				        $.map(data, function(match) {
				        	var game = {
				        		date: moment(date, "YYYY-MM-DD").format("MMM D, YYYY"),
				        		title: (function (title) {
				        			if(title == "") {
				        				return "&nbsp;";
					        		} else {
					        			return title;
					        		}
					        	})(match.match_score.title),
				        		status: (function(status, url) {
				        			switch (status)
									{
									case 'finished':
										if(url == null) {
									  	return "COMING SOON";
									  } else {
									  	return "WATCH NOW";
									  };
									  	break;
									case 'underway':
										return "LIVE NOW";
										break;
									case 'ready':
										return "COMING SOON";
										break;
									default:
									  	return "FINISHED";
									}
				        		})(match.match_score.match.status, match.match_score.match.url),
				        		url: (function(url) {
				        			if(url == null) {
				        				return '#';
									} else {
										return 'http://ign.com' + url;
									};
				        		})(match.match_score.match.url)
				        	};
				        	var i = 1;
				        	var team1Score,
				        		team2Score,
				        		team1Class,
				        		team2Class;
				        	$.map(match.match_score.card, function(teamScore) {
				        		if (i == 1) team1Score = teamScore.points;
				        		if (i == 2) team2Score = teamScore.points;
				        		i++;
				        	});
				        	if (team1Score > team2Score) {
				        		team1Class = 'winner';
				        		team2Class = 'loser';
				        	} else if (team1Score < team2Score) {
				        		team2Class = 'winner';
				        		team1Class = 'loser';
				        	} else {
				        		team1Class = 'draw';
				        		team2Class = 'draw';
				        	}
				        	i = 1;	
				        	$.map(match.match_score.card, function(teamScore) {
				        		game['username' + i] = teamScore.username;
				        		game['points' + i] = teamScore.points;
				        		if (i == 1) game.team1Class = team1Class;
				        		if (i == 2) game.team2Class = team2Class;
				        		i++;
				        	});

				        	self.matchUps.push(game);
				        });
					});
					self.attachTemplate();
			    },
			    error: function(jqXHR, textStatus, errorThrown) {
			        data = {
			            error: true,
			            jqXHR: jqXHR,
			            textStatus: textStatus,
			            errorThrown: errorThrown
			        };
			        callback.call(this, data)
			    }
			});
		},

		loadStyleSheet: function() {
		   var head = document.getElementsByTagName( 'head' )[0], // reference to document.head for appending/ removing link nodes
		       link = document.createElement( 'link' );           // create the link node
		   link.setAttribute( 'href', + basepath + 'css/style.css' );
		   link.setAttribute( 'rel', 'stylesheet' );
		   head.appendChild(link);  // insert the link node into the DOM and start loading the style sheet
		},

		buttons: function() {

			$('#scores').on('mouseenter', ".left-button", function() {
				$(this).animate({'margin-left': '-=5'}, 300);
			}).on('mouseleave', '.left-button', function() {
				$(this).animate({'margin-left': '+=5'}, 300);
			});

			$('#scores').on('mouseenter','.right-button', function() {
				$(this).animate({'margin-left': '+=5'}, 300);
			}).on('mouseleave', '.right-button', function() {
				$(this).animate({'margin-left': '-=5'}, 300);
			});
					 
			var i = 1;

			$('#scores').on('click', '.right-button', function() {
				if(i == 5) {
					$('.box-scores').css('margin-left', '-760');
				} else {
					$('.box-scores').animate({'margin-left': '-=152'}, 500);
					i++;
				};
			});

			$('#scores').on('click', '.left-button', function() {
				if(i == 1) {
					$('.box-scores').css('margin-left', '0');
				} else {
					$('.box-scores').animate({'margin-left': '+=152'}, 500);
					i--;
				};
			});

			// Make entire div clickable
			$(".status-container").click(function(){
	     		window.location=$(this).find("a").attr("href"); 
	     		return false;
			});

		}

		// loadBox: function() {
		//    var box = document.getElementByID( 'box-scores' )[0], // reference to document.head for appending/ removing link nodes
		//        script = document.createElement( 'script' );           // create the link node
		//    script.setAttribute( 'src', 'box.js' );
		//    script.setAttribute( 'id', 'ipl-box-scores-template');
		//    script.setAttribute( 'type', 'ipl/template');
		//    box.appendChild(script);  // insert the link node into the DOM and start loading the style sheet
		// },

		// loadScores: function() {
		// 	var script = document.createElement('script');
		// 	script.type = 'text/javascript';
		// 	script.id = 'ipl-box-scores-template'
		// 	script.src = 'box.js';

		// 	$(".box-scores").append();
		// }

		// appendHTML: function() {
		// 	alert(document.body.innerHTML);
		// }
		
	};

	ipl.init({
		template: $('#' + scoresObj.id).html(),
		container: $('#scores'),
	});

})(jQuery);

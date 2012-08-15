(function($) {
	var basepath = "";
	if (typeof local === "undefined") {
		basepath = "http://esports.ign.com/addons/ipl-widgets/scores/";
	}
	var ipl = {
		init: function(config) {
			this.loadStyleSheet();
			this.url = 'http://esports.ign.com/scores.json';
			this.container = $('#scores');
			this.fetch();
			this.buttons();
		},
		scoresTmpl: function(){
			var html = "";
			html += "<div class='controls'><div class='left-control'><img src='http://esports.ign.com/addons/ipl-widgets/scores/images/left.png' class='left-button' /></div><div class='container'><div class='box-scores'>";
			for (var i = this.matchUps.length - 1; i >= 0; i--) {
				console.log();
				html += "<div class='match'>";
				html += "<div class='date-container'><div class='date'>" + this.matchUps[i].date + "</div></div>";
				html += "<div class='title'>" + this.matchUps[i].title + "</div>";
				html += "<div class='team-top'><div class='team-name " + this.matchUps[i].team1Class + "'>" + this.matchUps[i].username1 +"</div><div class='score " + this.matchUps[i].team1Class + "'>" + this.matchUps[i].points1 + "</div></div>";
				html += "<div class='team-bottom'><div class='team-name " + this.matchUps[i].team2Class + "'>" + this.matchUps[i].username2 +"</div><div class='score " + this.matchUps[i].team2Class + "'>" + this.matchUps[i].points2 + "</div></div>";
				if (this.matchUps[i].url !== "#") {
					html += "<div class='status-container'><a href='" + this.matchUps[i].url + "' class='status-link " + this.matchUps[i].status + "'>" + this.matchUps[i].status + "</a></div>";
				} else {
					html += "<div class='status-container'><p class='status " + this.matchUps[i].status + "'>" + this.matchUps[i].status + "</p></div>";
				}

				html += "</div>";
			}
			html += "</div></div><div class='right-control'><img src='http://esports.ign.com/addons/ipl-widgets/scores/images/right.png' class='right-button' /></div></div>";
			return html;
		},
		attachTemplate: function(){
			this.container.append(this.scoresTmpl());
		},
		getStatus: function(status, url){
			switch (status)
			{
			case 'finished':
				if(url === null) {
					return "coming soon";
				} else {
					return "watch vod";
				}
					break;
			case 'underway':
				return "live now";
			case 'ready':
				return "coming soon";
			default:
				return "finished";
			}
		},
		getURLs: function(url, status, franchiseSlug){
			if (status == 'underway') {
				return 'http://ign.com/ipl/' + franchiseSlug;
			} else if (status == 'finished' && url !== null) {
				return 'http://ign.com' + url;
			} else {
				return '#';
			}
		},
		fetch: function(url, status, slug) {
			var self = this;
			$.ajax({
					type: 'GET',
					url: this.url,
					dataType: "jsonp",
					cache: true,
				jsonpCallback: "getCached",

					success: function(data) {
							self.matchUps = [];
							var vodTitle = '';
							$.map(data, function(data, date) {
								$.map(data, function(match) {
									var game = {
										date: moment(date, "YYYY-MM-DD").format("MMM D, YYYY"),
										title: vodTitle = match.match_score.title ? match.match_score.title : "&nbsp;",
										status: self.getStatus(match.match_score.match.status, match.match_score.match.url),
										url: self.getURLs(match.match_score.match.url, match.match_score.match.status, match.match_score.match.show.franchise.slug)
									};
									var i = 1, team1Score, team2Score, team1Class, team2Class;
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
										if (i === 1) game.team1Class = team1Class;
										if (i === 2) game.team2Class = team2Class;
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
							callback.call(this, data);
					}
			});
		},

		loadStyleSheet: function() {
			var head = document.getElementsByTagName( 'head' )[0],
					link = document.createElement( 'link' );
			link.setAttribute( 'href', basepath + 'css/style.css' );
			link.setAttribute( 'rel', 'stylesheet' );
			head.appendChild(link);
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
				if(i === 5) {
					$('.box-scores').css('margin-left', '-760');
				} else {
					$('.box-scores').animate({'margin-left': '-=152'}, 500);
					i++;
				}
			});

			$('#scores').on('click', '.left-button', function() {
				if(i === 1) {
					$('.box-scores').css('margin-left', '0');
				} else {
					$('.box-scores').animate({'margin-left': '+=152'}, 500);
					i--;
				}
			});

			// Make entire div clickable
			$(".status-container").click(function(evt){
					evt.preventDefault();
					window.location = $(this).find("a").attr("href");
			});

		}
		
	};
	ipl.init();
})(jQuery);
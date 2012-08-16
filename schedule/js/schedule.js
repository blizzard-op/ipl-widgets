(function($) {
	var basepath = "";
	if (typeof local !== undefined) {
		basepath = "http://esports.ign.com/addons/ipl-widgets/schedule/";
	}
	var game_Arr;
	var match_Arr;
	var match_Obj;
	var matches_Obj;
	var match_start;
	var match_end;
	var title;
	var tag;
	var subtitle_1;
	var subtitle_2;
	
	var iplSchedule = {

		init: function(config) {

			this.loadStyleSheet();
			this.attachTemplate();
			this.url = 'http://esports.ign.com/schedule.json';
			this.fetch();

		},

		attachTemplate: function() {
			$("<table class='schedule-container'><tr class='header'><th><div class='date-header'>Date</div></th><th><div class='sc-header'><p><a href='http://www.ign.com/ipl/starcraft-2'>StarCraft II</a></p><p class='schedule'><a href='https://www.google.com/calendar/embed?src=1u5m1559a5rlih3tr8jqp4kgac%40group.calendar.google.com' class='schedule-link'>Full Schedule</a></p></div></th><th><div class='lol-header'><p><a href='http://www.ign.com/ipl/league-of-legends'>League of Legends</a></p><p class='schedule'><a href='https://www.google.com/calendar/embed?src=igpia9kc2fst1ijkde1avplkq0%40group.calendar.google.com' class='schedule-link'>Full Schedule</a></p></div></th></tr><tr><td id='date-today' class='date'><p id='day-1'></p><p id='date-1'></p><span id='tag' class='tag'>TODAY</span></td><td id='sc-today' class='sc2'></td><td id='lol-today' class='lol'></td></tr><tr><td id='date-tomorrow' class='date'><p id='day-2'></p><p id='date-2'></p></td><td id='sc-tomorrow' class='sc2'></td><td id='lol-tomorrow' class='lol'></td></tr><tr><td class='date'><p id='day-3'></p><p id='date-3'></p></td><td id='sc-3' class='sc2'></td><td id='lol-3' class='lol'></td></tr><tr><td class='date'><p id='day-4'></p><p id='date-4'></p></td><td id='sc-4' class='sc2'></td><td id='lol-4' class='lol'></td></tr><tr><td class='date'><p id='day-5'></p><p id='date-5'></p></td><td id='sc-5' class='sc2'></td><td id='lol-5' class='lol'></td></tr><tr><td class='date'><p id='day-6'></p><p id='date-6'></p></td><td id='sc-6' class='sc2'></td><td id='lol-6' class='lol'></td></tr><tr><td class='date'><p id='day-7'></p><p id='date-7'></p></td><td id='sc-7' class='sc2'></td><td id='lol-7' class='lol'></td></tr></table>").appendTo('#schedule');
		},

		fetch: function() {

			$.ajax({
					type: 'GET',
					url: this.url,
					dataType: "jsonp",
					cache: true,
					jsonpCallback: "getCachedSchedule",

					success: function(data) {
						var title, match_start, match_end;
						function getGameTitle(match_Obj) {
							title = match_Obj.title;
						}

						function getMatchDate(match_Obj) {

							match_start = match_Obj.starts_at;
							match_end = match_Obj.ends_at;
							var day, date, add_day, i = 0;
							while(i < 7) {
								add_day = moment().local().add('days', i);
								day = moment(add_day).local().format('dddd');
								date = moment(add_day).local().format('MMMM Do');
								$('#day-' + i).html(day);
								$('#date-' + i).html(date);
								i++;
							}
						}

						function getSubtitles(match_Obj) {
							subtitle_1 = match_Obj.subtitle_1;
							if (subtitle_1 === null || subtitle_1 === 'NA') subtitle_1 = '&nbsp';
							subtitle_2 = match_Obj.subtitle_2;
							if (subtitle_2 === null || subtitle_2 === 'NA') subtitle_2 = '&nbsp';
						}

						function setSchedule(match_Obj) {

							var gameStart = moment(match_start);
							var gameEnd   = moment(match_end);
							var now       = moment();
							var today     = moment().eod();
							var tomorrow  = moment().eod().add('hours', 24);
							var day3      = moment().eod().add('hours', 48);
							var day4      = moment().eod().add('hours', 72);
							var day5      = moment().eod().add('hours', 96);
							var day6      = moment().eod().add('hours', 120);
							var day7      = moment().eod().add('hours', 144);
							var html      = "<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + "</span></p>";
							var vodHTML   = "<p><a href='http://ign.com" + vodLink + "' class='vod'><img src='http://esports.ign.com/addons/ipl-widgets/schedule/images/video.png' class='vid' />Watch Vod</a></p></div>";
							var vodLink, vod;
									
							tag = match_Obj.metadata.rebroadcast;
							if (tag === false) {
								tag = 'all new';
							} else {
								tag = 'rebroadcast';
							}

							for(var matches in match_Obj.metadata.matches) {
								if (match_Obj.metadata.matches.hasOwnProperty(matches)){
									match_Arr = match_Obj.metadata.matches[matches];
									for (var rebroadcast in match_Arr) {
										matches_Obj = match_Arr[rebroadcast];
										vod = matches_Obj.games[0].game.video;
										if(vod) {
											vodLink = matches_Obj.games[0].game.video.url;
										}
									}
								}
							}
									
								if(gameTitle == 'league-of-legends') {
									if(now > gameStart && now < gameEnd) {
										$("<a href ='http://ign.com/ipl/tv' class='link-live'><div class='listing live-now'><p>" + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class='live'>LIVE NOW</span><span class=" + tag + '>' + tag + '</span></p></div></a>').appendTo('#lol-today');
									} else if(gameEnd > now && gameStart < today) {
										if (vodLink) {
											html += vodHTML;
										}
										html += "</div>";
										$("#lol-today").append(html);
									} else if(gameStart > today && gameStart < tomorrow){
										if (vodLink) {
											html += vodHTML;
										}
										html += "</div>";
										$("#lol-tomorrow").append(html);
									} else if(gameStart > tomorrow && gameStart < day3){
										if (vodLink) {
											html += vodHTML;
										}
										html += "</div>";
										$("#lol-3").append(html);
									} else if(gameStart > day3 && gameStart < day4){
										if (vodLink) {
											html += vodHTML;
										}
										html += "</div>";
										$("#lol-4").append(html);
									} else if(gameStart > day4 && gameStart < day5){
										if (vodLink) {
											html += vodHTML;
										}
										html += "</div>";
										$("#lol-5").append(html);
									} else if(gameStart > day5 && gameStart < day6){
										if (vodLink) {
											html += vodHTML;
										}
										html += "</div>";
										$("#lol-6").append(html);
									} else if(gameStart > day6 && gameStart < day7){
										if (vodLink) {
											html += vodHTML;
										}
										html += "</div>";
										$("#lol-7").append(html);
									}
								} else {
									if(now > gameStart && now < gameEnd) {
											$("<div class ='listing live-now'><a href='http://ign.com/ipl/tv' class='link-live'><p>" + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class='live'>LIVE NOW</span><span class=" + tag + '>' + tag + '</span></p></a></div>').appendTo('#sc-today');
										} else if(gameEnd > now && gameStart < today) {
											if (vodLink) {
												html += vodHTML;
											}
											html += "</div>";
											$("#sc-today").append(html);
									} else if(gameStart > today && gameStart < tomorrow){
											if (vodLink) {
												html += vodHTML;
											}
											html += "</div>";
											$("#sc-tomorrow").append(html);
									} else if(gameStart > tomorrow && gameStart < day3){
											if (vodLink) {
												html += vodHTML;
											}
											html += "</div>";
											$("#sc-3").append(html);
									} else if(gameStart > day3 && gameStart < day4){
											if (vodLink) {
												html += vodHTML;
											}
											html += "</div>";
											$("#sc-4").append(html);
									} else if(gameStart > day4 && gameStart < day5){
											if (vodLink) {
												html += vodHTML;
											}
											html += "</div>";
											$("#sc-5").append(html);
									} else if(gameStart > day5 && gameStart < day6){
											if (vodLink) {
												html += vodHTML;
											}
											html += "</div>";
											$("#sc-6").append(html);
									} else if(gameStart > day6 && gameStart < day7){
											if (vodLink) {
												html += vodHTML;
											}
											html += "</div>";
											$("#sc-7").append(html);
									}
								}
							}
						for(var gameTitle in data) {
							
							if (data.hasOwnProperty(gameTitle)){

								game_Arr = data[gameTitle];

								for (var i = 0; i < game_Arr.length; i++) {
									match_Obj = game_Arr[i];
									getGameTitle(match_Obj);
									getMatchDate(match_Obj);
									getSubtitles(match_Obj);
									setSchedule(match_Obj);
								}

							}

						}
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

				var head = document.getElementsByTagName( 'head' )[0], // reference to document.head for appending/removing link nodes
						link = document.createElement( 'link' );           // create the link node
				
				link.setAttribute( 'href', basepath + 'css/schedule.css' );
				link.setAttribute( 'rel', 'stylesheet' );
				
				head.appendChild(link);  // insert the link node into the DOM and match_start loading the style sheet
		}

	};

	iplSchedule.init();
})(jQuery);
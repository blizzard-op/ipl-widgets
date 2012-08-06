(function($) {
	
	var basepath = "http://esports.ign.com/addons/ipl-widgets/scores/";
	var game_Arr;
	var match_Obj;
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
			$("<table class='schedule-container'><th><tr class='header'><th><div class='date-header'>Date</div></th><th><div class='sc-header'><p><a href='http://www.ign.com/ipl/starcraft-2'>StarCraft II</a></p><p class='schedule'><a href='https://www.google.com/calendar/embed?src=1u5m1559a5rlih3tr8jqp4kgac%40group.calendar.google.com' class='schedule-link'>Full Schedule</a></p></div></th><th><div class='lol-header'><p><a href='http://www.ign.com/ipl/league-of-legends'>League of Legends</a></p><p class='schedule'><a href='https://www.google.com/calendar/embed?src=igpia9kc2fst1ijkde1avplkq0%40group.calendar.google.com' class='schedule-link'>Full Schedule</a></p></div></th></tr></th><tr><td id='date-today' class='date'><p id='day-1'></p><p id='date-1'></p><span id='tag' class='tag'>TODAY</span></td><td id='sc-today' class='sc2'></td><td id='lol-today' class='lol'></td></tr><tr><td id='date-tomorrow' class='date'><p id='day-2'></p><p id='date-2'></p></td><td id='sc-tomorrow' class='sc2'></td><td id='lol-tomorrow' class='lol'></td></tr><tr><td class='date'><p id='day-3'></p><p id='date-3'></p></td><td id='sc-3' class='sc2'></td><td id='lol-3' class='lol'></td></tr><tr><td class='date'><p id='day-4'></p><p id='date-4'></p></td><td id='sc-4' class='sc2'></td><td id='lol-4' class='lol'></td></tr><tr><td class='date'><p id='day-5'></p><p id='date-5'></p></td><td id='sc-5' class='sc2'></td><td id='lol-5' class='lol'></td></tr><tr><td class='date'><p id='day-6'></p><p id='date-6'></p></td><td id='sc-6' class='sc2'></td><td id='lol-6' class='lol'></td></tr><tr><td class='date'><p id='day-7'></p><p id='date-7'></p></td><td id='sc-7' class='sc2'></td><td id='lol-7' class='lol'></td></tr></table>").appendTo('#schedule');
		},

		fetch: function() {

			$.ajax({
			    type: 'GET',
			    url: this.url,
			    dataType: "jsonp",
			    cache: true,
				jsonpCallback: "getCachedSchedule",

			    success: function(data) {
			    	
			    	for(var gameTitle in data) {
			    		
			    		game_Arr = data[gameTitle];

			    		for (var i = 0; i < game_Arr.length; i++) {
			    			
			    			match_Obj = game_Arr[i];
			    			getGameTitle(match_Obj);
			    			getMatchDate(match_Obj);
			    			getSubtitles(match_Obj);
			    			setSchedule(match_Obj);

			    			function getGameTitle(match_Obj) {
			    				title = match_Obj.title;
			    			};
			    			
			    			function getMatchDate(match_Obj) {
			    				
			    				match_start = match_Obj.starts_at;
			    				match_end = match_Obj.ends_at;

			    				var day = moment().local();
			    				day = day.format('dddd');
			    				var date = moment().local();
			    				date = date.format('MMMM Do');
			    				$('#day-1').html(day);
			    				$('#date-1').html(date);
			    				var add_day = moment().local().add('days', 1);
			    				day = moment(add_day).local().format('dddd');
			    				date = moment(add_day).local().format('MMMM Do');
			    				$('#day-2').html(day);
			    				$('#date-2').html(date);
			    				var add_day = moment().local().add('days', 2);
			    				day = moment(add_day).local().format('dddd');
			    				date = moment(add_day).local().format('MMMM Do');
			    				$('#day-3').html(day);
			    				$('#date-3').html(date);
			    				var add_day = moment().local().add('days', 3);
			    				day = moment(add_day).local().format('dddd');
			    				date = moment(add_day).local().format('MMMM Do');
			    				$('#day-4').html(day);
			    				$('#date-4').html(date);
			    				var add_day = moment().local().add('days', 4);
			    				day = moment(add_day).local().format('dddd');
			    				date = moment(add_day).local().format('MMMM Do');
			    				$('#day-5').html(day);
			    				$('#date-5').html(date);
			    				var add_day = moment().local().add('days', 5);
			    				day = moment(add_day).local().format('dddd');
			    				date = moment(add_day).local().format('MMMM Do');
			    				$('#day-6').html(day);
			    				$('#date-6').html(date);
			    				var add_day = moment().local().add('days', 6);
			    				day = moment(add_day).local().format('dddd');
			    				date = moment(add_day).local().format('MMMM Do');
			    				$('#day-7').html(day);
			    				$('#date-7').html(date);
			    				// subtitle_1 = match_Obj.subtitle_1;
			    				// if (subtitle_1 == null || subtitle_1 == 'NA') subtitle_1 = '&nbsp';
			    				// subtitle_2 = match_Obj.subtitle_2;
			    				// if (subtitle_2 == null || subtitle_2 == 'NA') subtitle_2 = '&nbsp';

			    			};

			    			function getSubtitles(match_Obj) {
			    				subtitle_1 = match_Obj.subtitle_1;
			    				if (subtitle_1 == null || subtitle_1 == 'NA') subtitle_1 = '&nbsp';
			    				subtitle_2 = match_Obj.subtitle_2;
			    				if (subtitle_2 == null || subtitle_2 == 'NA') subtitle_2 = '&nbsp';
			    			};

			    			function setSchedule(match_Obj) {

			    				var gameStart = moment(match_start);
			    				var gameEnd = moment(match_end);
			    				var now = moment();
				    			var today = moment().eod();
				    			var tomorrow = moment().eod().add('hours', 24)
				    			var day3 = moment().eod().add('hours', 48);
				    			var day4 = moment().eod().add('hours', 72);
				    			var day5 = moment().eod().add('hours', 96);
				    			var day6 = moment().eod().add('hours', 120);
				    			var day7 = moment().eod().add('hours', 144);

				    	 		tag = match_Obj.metadata.rebroadcast;
								if (tag == false) {
								 	tag = 'all new';
							    } else {
								 	tag = 'rebroadcast';
								};
			    				
				    				if(gameTitle == 'league-of-legends') {
				    					(function() {
				    						if(now > gameStart && now < gameEnd) {
				    							$("<div class='listing live-now'><p>" + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class='live'><a href='http://ign.com/ipl/tv' class='now'>LIVE NOW</a></span><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#lol-today');
					    					} else if(gameEnd > now && gameStart < today) {
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#lol-today');
											} else if(gameStart > today && gameStart < tomorrow){
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#lol-tomorrow');
											} else if(gameStart > tomorrow && gameStart < day3){
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#lol-3');
											} else if(gameStart > day3 && gameStart < day4){
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#lol-4');
											} else if(gameStart > day4 && gameStart < day5){
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#lol-5');
											} else if(gameStart > day5 && gameStart < day6){
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#lol-6');
											} else if(gameStart > day6 && gameStart < day7){
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#lol-7');
											};
										})();
									} else {
										(function() {
											if(now > gameStart && now < gameEnd) {
				    							$("<div class='listing live-now'><p>" + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class='live'><a href='http://ign.com/ipl/tv' class='now'>LIVE NOW</a></span><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#sc-today');
					    					} else if(gameEnd > now && gameStart < today) {
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#sc-today');
											} else if(gameStart > today && gameStart < tomorrow){
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#sc-tomorrow');
											} else if(gameStart > tomorrow && gameStart < day3){
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#sc-3');
											} else if(gameStart > day3 && gameStart < day4){
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#sc-4');
											} else if(gameStart > day4 && gameStart < day5){
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#sc-5');
											} else if(gameStart > day5 && gameStart < day6){
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#sc-6');
											} else if(gameStart > day6 && gameStart < day7){
												$("<div class='listing'><p><span>" + gameStart.local().format('hA') + '</span> - ' + title + "</p><p class='sub1'>" + subtitle_1 + "</p><p class='sub2'>" + subtitle_2 + "</p><p class='tags'><span class=" + tag + '>' + tag + '</span></p></div>').appendTo('#sc-7');
											};
										})();
									};

									// if(now > gameStart && now < gameEnd) {
									// 	$("<span class='live'><a href='http://ign.com/ipl/tv' class='now'>LIVE NOW</a></span>").prependTo('.tags');
									// 	$(".listing").click(function() {
								 //     		window.location=$(this).find("a").attr("href"); 
								 //     		return false;
									// 	});
									// 	$('.listing').on('mouseenter', function() {
									// 		$(this).addClass('hover').on('mouseleave', function() {
									// 			$(this).removeClass('hover');
									// 		});
									// 	});
									// };
								};
							};
		    			};

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
		   
		   var head = document.getElementsByTagName( 'head' )[0], // reference to document.head for appending/removing link nodes
		       link = document.createElement( 'link' );           // create the link node
		   
		   link.setAttribute( 'href', /*basepath +*/ 'css/schedule.css' );
		   link.setAttribute( 'rel', 'stylesheet' );
		   
		   head.appendChild(link);  // insert the link node into the DOM and match_start loading the style sheet
		}

	};

	iplSchedule.init({
		// config
	});
})(jQuery);
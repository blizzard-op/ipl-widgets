(function($) {
	var basepath = "http://esports.ign.com/addons/ipl-widgets/scores/";
	var ipl = {
		init: function(config) {
			this.loadStyleSheet();
			this.url = 'http://esports.ign.com/schedule.json';
			//this.template = config.template;
			//this.container = config.container;
			this.fetch();
			//this.buttons();
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
				jsonpCallback: "getCachedSchedule",

			    success: function(data) {
			    	for(var gameTitle in data) {
			    		var game_Arr = data[gameTitle];

			    		for (var i = 0; i < game_Arr.length; i++) {
			    			var match_Obj = game_Arr[i],
			    				title = match_Obj.title,
			    				match_start = match_Obj.starts_at,
			    				match_end = match_Obj.ends_at,
			    				day = moment().format('dddd');
			    				date = moment().format('MMMM Do');
			    				$('#day-1').html(day);
			    				$('#date-1').html(date);
			    				add_day = moment().add('days', 1);
			    				day = moment(add_day).format('dddd');
			    				date = moment(add_day).format('MMMM Do');
			    				$('#day-2').html(day);
			    				$('#date-2').html(date);
			    				add_day = moment().add('days', 2);
			    				day = moment(add_day).format('dddd');
			    				date = moment(add_day).format('MMMM Do');
			    				$('#day-3').html(day);
			    				$('#date-3').html(date);
			    				add_day = moment().add('days', 3);
			    				day = moment(add_day).format('dddd');
			    				date = moment(add_day).format('MMMM Do');
			    				$('#day-4').html(day);
			    				$('#date-4').html(date);
			    				add_day = moment().add('days', 4);
			    				day = moment(add_day).format('dddd');
			    				date = moment(add_day).format('MMMM Do');
			    				$('#day-5').html(day);
			    				$('#date-5').html(date);
			    				add_day = moment().add('days', 5);
			    				day = moment(add_day).format('dddd');
			    				date = moment(add_day).format('MMMM Do');
			    				$('#day-6').html(day);
			    				$('#date-6').html(date);
			    				add_day = moment().add('days', 6);
			    				day = moment(add_day).format('dddd');
			    				date = moment(add_day).format('MMMM Do');
			    				$('#day-7').html(day);
			    				$('#date-7').html(date);
			    				subtitle_1 = match_Obj.subtitle_1;
			    				if (subtitle_1 == null) subtitle_1 = '';
			    					// if(current > match_start) tag = 'live now';
			    					//  	live_now = true;
			    					// } else {
			    					//  	live_now = false;
			    					// };
			    				
			    				// var day = moment().diff(match_start);
			    				var game_time = moment(match_start);
			    				var game_end = moment(match_end);
			    				var now = moment();
				    			var today = moment().eod();
				    			var tomorrow = moment().eod().add('hours', 24)
				    			var day3 = moment().eod().add('hours', 48);
				    			var day4 = moment().eod().add('hours', 72);
				    			var day5 = moment().eod().add('hours', 96);
				    			var day6 = moment().eod().add('hours', 120);
				    			var day7 = moment().eod().add('hours', 144);

				    	 		var tag = match_Obj.metadata.rebroadcast;
									if(now > game_time && now < game_end) {
									tag = 'live now';
									} else if (tag == false) {
									 	tag = 'new';
								    } else {
									 	tag = 'rebroadcast';
									};
			    					
				    			
				    				if(gameTitle == 'league-of-legends') {
				    					(function() {
					    					if(game_end > now && game_time < today) {
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#lol-today');
											} else if(game_time > today && game_time < tomorrow){
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#lol-tomorrow');
											} else if(game_time > tomorrow && game_time < day3){
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#lol-3');
											} else if(game_time > day3 && game_time < day4){
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#lol-4');
											} else if(game_time > day4 && game_time < day5){
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#lol-5');
											} else if(game_time > day5 && game_time < day6){
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#lol-6');
											} else if(game_time > day6 && game_time < day7){
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#lol-7');
											};
										})();
									} else {
										(function() {
					    					if(game_end > now && game_time < today) {
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#sc-today');
											} else if(game_time > today && game_time < tomorrow){
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#sc-tomorrow');
											} else if(game_time > tomorrow && game_time < day3){
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#sc-3');
											} else if(game_time > day3 && game_time < day4){
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#sc-4');
											} else if(game_time > day4 && game_time < day5){
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#sc-5');
											} else if(game_time > day5 && game_time < day6){
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#sc-6');
											} else if(game_time > day6 && game_time < day7){
												$("<div class='listing'><p><span>" + moment(match_start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p><p><span class=' + tag + '>' + tag + '</span></p></div>').appendTo('#sc-7');
											};
										})();
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
		   var head = document.getElementsByTagName( 'head' )[0], // reference to document.head for appending/ removing link nodes
		       link = document.createElement( 'link' );           // create the link node
		   link.setAttribute( 'href', /*basepath +*/ 'css/schedule.css' );
		   link.setAttribute( 'rel', 'stylesheet' );
		   head.appendChild(link);  // insert the link node into the DOM and match_start loading the style sheet
		},

	};

	ipl.init({
		// template: $('#' + scoresObj.id).html(),
		// container: $('#scores'),
	});
})(jQuery);
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
			    success: function(data) {
			    	for(var gameTitle in data) {
			    		var game_Arr = data[gameTitle];
			    		console.log(game_Arr);
			    		for (var i = 0; i < game_Arr.length; i++) {
			    			var match_Obj = game_Arr[i],
			    				title = match_Obj.title,
			    				start = match_Obj.starts_at;
			    				// day_1 = moment(start).format('dddd');
			    				// date_1 = moment(start).format('MMMM do');
			    				// $('#day-1').html(day_1);
			    				// $('#date-1').html(date_1);
			    				// day_2 = moment(start).format('dddd').add('days', 1);
			    				// date_2 = moment(start).format('MMMM do').add('days', 1);
			    				// $('#day-2').html(day_2);
			    				// $('#date-2').html(date_2);
			    				// day_3 = moment(start).format('dddd');
			    				// date_3 = moment(start).format('MMMM do');
			    				// $('#day-3').html(day_3);
			    				// $('#date-3').html(date_3);
			    				// day_4 = moment(start).format('dddd');
			    				// date_4 = moment(start).format('MMMM do');
			    				// $('#day-4').html(day_4);
			    				// $('#date-4').html(date_4);
			    				// day_5 = moment(start).format('dddd');
			    				// date_5 = moment(start).format('MMMM do');
			    				// $('#day-5').html(day_5);
			    				// $('#date-5').html(date_5);
			    				// day_6 = moment(start).format('dddd');
			    				// date_6 = moment(start).format('MMMM do');
			    				// $('#day-6').html(day_6);
			    				// $('#date-6').html(date_6);
			    				// day_7 = moment(start).format('dddd');
			    				// date_7 = moment(start).format('MMMM do');
			    				// $('#day-7').html(day_7);
			    				// $('#date-7').html(date_7);
			    				subtitle_1 = match_Obj.subtitle_1;
			    				if (subtitle_1 == null) subtitle_1 = '';
			    				var day = moment().diff(start);
				    				if(gameTitle == 'league-of-legends') {
				    					(function() {
					    					if(day > -86400000) {
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#lol-today');
											} else if(day > -172800000 && day < -86400000){
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#lol-tomorrow');
											} else if(day > -259200000 && day < -172800000){
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#lol-3');
											} else if(day > -345600000 && day < -259200000){
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#lol-4');
											} else if(day > -432000000 && day < -345600000){
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#lol-5');
											} else if(day > -518400000 && day < -432000000){
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#lol-6');
											} else {
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#lol-7');
											};
										})();
									} else {
										(function() {
					    					if(day > -86400000) {
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#sc-today');
											} else if(day > -172800000 && day < -86400000){
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#sc-tomorrow');
											} else if(day > -259200000 && day < -172800000){
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#sc-3');
											} else if(day > -345600000 && day < -259200000){
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#sc-4');
											} else if(day > -432000000 && day < -345600000){
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#sc-5');
											} else if(day > -518400000 && day < -432000000){
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#sc-6');
											} else {
												$("<div class='listing'><p><span>" + moment(start).format('hA') + '</span> - ' + title + "</p><p class='sub'>" + subtitle_1 + '</p></div>').appendTo('#sc-7');
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
		   head.appendChild(link);  // insert the link node into the DOM and start loading the style sheet
		},

	};

	ipl.init({
		// template: $('#' + scoresObj.id).html(),
		// container: $('#scores'),
	});
})(jQuery);
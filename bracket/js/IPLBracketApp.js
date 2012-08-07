// Requires John Resig's Class and jQuery libraries
var IPLBracketApp;

(function($){
	// enum for match state
	var MatchState = {
		'ready':0,
		'finished':1,
		'underway':2
	};
	// Main application - responsible for initializing components and managing events  
	IPLBracketApp = Class.extend({
		isDoubleElim:false,
		zoomLevel:.5,
		maxZoom:2,
		max3dZoom:-82,
		minZoom:.02,
		fps:30,
		windowManager:null,
		spoilers:true,
		$appContainer:null,
		$bracketLayer:null,
		$toolbar:null,
		loadedBracket:null,
		enable3d:false,
		enableZoom:true,
		enableSpoilers:false,
		//Mouse drag variables
		mouseIsDown:false,
		isDragging:false,
		mouseX:0,
		mouseY:0,
		oldMouse:{x:0,y:0},
		releaseAngle:0,
		speed:0,
		drag:.6,
		ZoomAmt3d:250,
		ZoomAmt2d:450,
		$zoomTip:null,

		init:function(Options){
			var that = this;
			var initalZoom;
			this.enable3d = Modernizr.csstransforms3d;
			this.$appContainer = Options.container;
			this.windowManager = new WindowManager(this,this.$appContainer);
		
			this.$bracketLayer = $('<div class="IPLBracketLayer">').appendTo(this.$appContainer);
			if(this.enable3d){
				$(this.$appContainer).css({'-moz-perspective':1000,
											'-webkit-perspective':1000, 
											'-ms-perspective':1000, 
											'-o-perspective':1000, 
											'transform-origin':'50%'});
				this.$bracketLayer.css({'translateZ':-1000, 'backface-visibility':'hidden', '-webkit-transform-style':'preserve-3d'});
			}else if(this.enableZoom){
				this.$bracketLayer.css({'scale': this.zoomLevel});
			}
			this.$toolbar = $('<div class="IPLBracketTools">').appendTo(this.$appContainer);
			
			if (navigator.appName == 'Microsoft Internet Explorer'){
				this.enableZoom = false;
			}

			//Apply no-zoom stylesheet
			if(!this.enableZoom){
				this.$bracketLayer.addClass('no-zoom');
			}
			this.loadBracketJSON(Options.url, this.backetLoaded);
			this.setupTools(this.$toolbar);
		},
		
		loadBracketJSON:function(JSONURI, Callback){
			var that = this;
			$.ajax({
				url:JSONURI,
				// TODO change to jsonp for production
				dataType:'jsonp',
				jsonpCallback:'getCached',
				cache:true,
				success:function(data){
					Callback.apply(that,[data]);
				}
			});
			// attach a preloader here
		},

		backetLoaded:function(Data){
			//add title
		 
			var $title = $('<div>').prependTo(this.$bracketLayer).css({float:'right', position:'absolute', display:'inline'})
			$('<h1 class="bracket-title">').appendTo($title).text(Data.name.replace(/-/g,' '));
			
			// TODO put a fallback here if number of players is invalid		
			//If there is a round after the finals then create a Double Elim bracket
			var bracketSize = Math.ceil(Math.log(Data.rounds[0].matches.length*2)/Math.log(2));
			if(Data.rounds.length >bracketSize){
				this.loadedBracket = new DoubleElimBracket(Data.rounds[0].matches.length*2);
			}else{
				this.loadedBracket = new Bracket(Data.rounds[0].matches.length*2);
			}
		
			this.loadedBracket.render(this.$bracketLayer);
			this.$bracketLayer.hide().fadeIn('slow');

			if(this.enableZoom){
				this.windowManager.centerObject(this.$bracketLayer);
				this.windowManager.setInitalZoom(this.$bracketLayer);
			}
			//$title.css('left',this.loadedBracket.championshipMatch.left()+this.loadedBracket.championshipMatch.$element.width()-$title.width());
			$title.css('left',this.$bracketLayer.width()-$title.width());
			// begin populating tree
			var mappedRound=0;
			for(var a in Data.rounds){
				//Add round title
				
				if(Data.rounds[a] && this.loadedBracket.matches[a]){
					this.addRoundTitle(Data.rounds[a].name, this.loadedBracket.matches[a][0], 'winner-title');
					//send data to match object	
					for(var b in Data.rounds[a].matches){			
						this.loadedBracket.matches[a][b].parseData(Data.rounds[a].matches[b].match);
					}
				}else if(Data.rounds[a] && this.loadedBracket.losersBracket.matches[a-this.loadedBracket.matches.length]){
					//add some sort of offset or add to a layer
					this.addRoundTitle(Data.rounds[a].name, this.loadedBracket.losersBracket.matches[a-this.loadedBracket.matches.length][0],'loser-title');
					for(var c in Data.rounds[a].matches){
						this.loadedBracket.losersBracket.matches[a-this.loadedBracket.matches.length][c].parseData(Data.rounds[a].matches[c].match);
					}
					
				}
			}
			if(this.loadedBracket instanceof DoubleElimBracket){
				var that = this;
				this.$bracketLayer.find('.loser-title').each(function(){
					$(this).css({
						'top':parseInt(that.$bracketLayer.find('.lossLayer').first().css('top'))+parseInt($(this).css('top')),
						'left':parseInt(that.$bracketLayer.find('.lossLayer').first().css('left'))+parseInt($(this).css('left'))
					});
				});
			}
		},
		addRoundTitle:function(Title, Element, TitleClass){
			
			$('<h2>').appendTo(this.$bracketLayer)
					.addClass('round-title')
					.text(Title)
					.css({
						width:Element.$element.width(), 
						top:Element.top(),
						left:Element.left()
					}).addClass(TitleClass);

		},
		update:function(){
			//stick drag code here
			if(this.mouseIsDown){
				var dragScaling = 1;
				var xDist = this.mouseX - this.oldMouse.x;
				var yDist = this.mouseY - this.oldMouse.y;
				this.releaseAngle = Math.atan2(yDist, xDist);
				this.speed = Math.sqrt((this.oldMouse.x - this.mouseX)*(this.oldMouse.x - this.mouseX) + (this.oldMouse.y-this.mouseY)*(this.oldMouse.y-this.mouseY))
				if(this.enable3d){
					var dragScaling = parseInt(this.$bracketLayer.css('translateZ')) * -.001;
					dragScaling = dragScaling<1?1:dragScaling;
				}
				this.$bracketLayer.css({'left':parseInt(this.$bracketLayer.css('left')) + (xDist*dragScaling), 'top':parseInt(this.$bracketLayer.css('top')) + (yDist*dragScaling)});
			}else if(this.speed>.1){
				this.$bracketLayer.css({'left':parseInt(this.$bracketLayer.css('left')) + (Math.cos(this.releaseAngle)*this.speed), 'top':parseInt(this.$bracketLayer.css('top')) + (Math.sin(this.releaseAngle)*this.speed)});
				this.speed *= this.drag;
			}
			
			this.oldMouse.x = this.mouseX;
			this.oldMouse.y = this.mouseY;
		},
		mouseHandler: function(event){
    		this.mouseX = event.pageX;
    		this.mouseY = event.pageY;
  		},
		setupTools:function($Layer){
			var that = this;
			//
			this.$zoomTip = this.windowManager.getZoomTooltip().insertBefore($Layer);
			/*
			$('<div class="toolbar-spoiler-box"><label class="checkbox inline">Hide Spoilers<input type="checkbox" checked="checked"></label></div>')
			.appendTo($Layer).find('input')
			.change(function(data){
				
				//WARN this will spoil outside of scope if there is more than one BracketApp on the page
				//TODO fix above problem using find()
				if($(this).prop('checked')){
					that.$appContainer.find('.match-pos-spoiler .match-content.score-tip').css('opacity',1).fadeIn();
					that.$appContainer.find('.match-hide-score').hide();
					$('.match-pos-spoiler').addClass('match-spoiler').find('.match-content.players').css('opacity',1).fadeOut();
				}else{
					$('.match-pos-spoiler').removeClass('match-spoiler').find('.match-content.players').css('opacity',1).fadeIn();
					that.$appContainer.find('.match-content.score-tip').css('opacity',1).fadeOut();
					that.$appContainer.find('.match-hide-score').show();
				}
			});*/

			//zoom buttons
			if(this.enableZoom){
				var $btnGrp = $('<div class="btn-group">').appendTo($Layer);  
				$('<button class="btn btn-danger">').appendTo($btnGrp).text("-").css('translateZ',4000).click(function(){
					that.changeZoom.apply(that,[-(that.enable3d?that.ZoomAmt3d*4:that.ZoomAmt2d*3)]);
				});
				$('<button class="btn btn-danger">').appendTo($btnGrp).text("+").css('translateZ',4000).click(function(){
					that.changeZoom.apply(that,[(that.enable3d?that.ZoomAmt3d*4:that.ZoomAmt2d*3)]);
				});
			}
			
			this.windowManager.positionToolbar();

		},
		onWheel:function(DeltaY){
			this.changeZoom(DeltaY*(this.enable3d?this.ZoomAmt3d:this.ZoomAmt2d));
		},
		changeZoom:function(ZoomAmt){
			if(this.enable3d){
				
				if(ZoomAmt>0 && parseFloat(this.$bracketLayer.css('translateZ'))+ZoomAmt>this.max3dZoom){
					this.$bracketLayer.animate({'translateZ':this.max3dZoom},{duration:300,queue:false});			
				}else{
					this.$bracketLayer.animate({'translateZ':'+='+ZoomAmt},{duration:300,queue:false});
				}
				
			}else if(this.enableZoom){
				this.zoomLevel += ZoomAmt*.00005; // factor out
				if(this.zoomLevel>0){
					this.zoomLevel = Math.min(this.zoomLevel, this.maxZoom);
				}else{
					this.zoomLevel = Math.max(this.zoomLevel, this.minZoom);
				}
				this.$bracketLayer.animate({'scale':this.zoomLevel},{duration:300,queue:false});
			}
		},
		mousedown:function(event){
			this.mouseIsDown = true;
		},
		mouseup:function(event){
			this.mouseIsDown = false;
		}
	});

	// Keeps track of matches and renders the graph 
	var Bracket = Class.extend({
		championshipMatch:null,
		matchDepth:0,
		totalCompetitors:0,
		matches:[],
		x:0,
		y:0,
		init:function(NumPlayers){
			this.matches = [];
			this.totalCompetitors = NumPlayers;
			this.matchDepth = Math.ceil(Math.log(NumPlayers)/Math.log(2));
			this.championshipMatch = new Match(null, this.matchDepth-1);
			this.buildGraph(this.championshipMatch);
		},
		//builds a graph to hold all matches
		buildGraph:function(HeadNode){
			var seedMatch = HeadNode;
			this.matches = new Array(this.matchDepth);

			this.matches[this.matchDepth-1] = [HeadNode]; //seedMatch.addBranch();
			for(var i=0;i<this.matchDepth-1;++i){
				this.matches[i] = [];
			}
			// builds the tree and adds each layer of nodes to the matches Array
			for(i=this.matchDepth-1;i>0;--i){
				for(var j=0;j<this.matches[i].length;++j){
					var newNodes = this.matches[i][j].addBranch();
					for(var k=0;k<newNodes.length;++k){
						this.matches[i-1].push(newNodes[k]);
					}
				}
			}
		},
		render:function($Layer, XSpacing, YSpacing){
			var $round;
			var horizontalSpacing = XSpacing || 1.6;
			var verticalSpacing = YSpacing || 40;

			var $lineLayer = $('<div class="line-layer">').appendTo($Layer).css('position','relative');
			var that = this;
			var match;
			for(var i=0;i<this.matches.length;++i){
				$round = $('<div class="bracket-round matches-'+this.matches[i].length+'">').appendTo($Layer);
				for(var j=0;j<this.matches[i].length;++j){
					match = this.matches[i][j];
					match.$element = $('<div class="bracket-match">').appendTo($round).css('position','absolute');
					if(match.depth==0){
						match.$element.css('top', j*(match.$element.height()+verticalSpacing));
					}else if(match.childMatches.length>1){
						match.$element.css('top', (parseInt(match.childMatches[0].$element.css('top'))+parseInt(match.childMatches[1].$element.css('top')))/2);
					}else if(match.childMatches.length>0){
						match.$element.css('top', parseInt(match.childMatches[0].$element.css('top')));
					}
					match.$element.css('left', i*(horizontalSpacing*match.$element.width()));
				}
				
			}
			$Layer.width((this.matches.length * (match.$element.width()*horizontalSpacing)) - (match.$element.width()*horizontalSpacing)+match.$element.width());
			$Layer.height(this.matches[0].length * (match.$element.height() + verticalSpacing) - verticalSpacing);

			that.connectMatches.apply(that,[$lineLayer,that.championshipMatch]);
		},
		connectMatches:function($Layer, Node){
			$Layer.css({'position':'absolute','top':-10});
			if(Node.childMatches.length>0){
				for(var a in Node.childMatches){
					Node.childLines[a] = this.createLine($Layer, Node.left()+4, Node.top()+(Node.$element.height()*.5), Node.childMatches[a].left()+Node.$element.width() ,Node.childMatches[a].top()+(Node.childMatches[a].$element.height())*.5);
					this.connectMatches($Layer,Node.childMatches[a]);
				}
			}else{
				return null;
			}
			
		},
		createLine:function($Layer,x1,y1, x2,y2){
    		var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
  			var angle  = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
  			var transform = 'rotate('+angle+'deg)';

    		var line = $('<div>')
        	.appendTo($Layer)
        	.addClass('line')
        	.css({
        	  'position': 'absolute',
        	  //'rotateZ': angle
        	  '-moz-transform': transform,
        	  '-webkit-transform': transform,
        	  '-o-transform': transform,
        	  '-ms-transform': transform
        	})
        	.width(length)
        	.css({top:y1,left:x1});
    		return line;
		}
	});

var DoubleElimBracket = Bracket.extend({
	losersBracket:null,
	init:function(NumPlayers){
		this._super(NumPlayers);
		this.losersBracket = new LoserBracket(NumPlayers);
		
		this.matches.push([new Match(null,this.matches.length)]);
		this.matches.push([new Match(null,this.matches.length)]);
		//set up the Grand Finals match connections
		this.matches[this.matches.length-2][0].parentMatch = this.matches[this.matches.length-1][0];
		this.matches[this.matches.length-2][0].childMatches = [this.matches[this.matches.length-3][0],this.losersBracket.matches[this.losersBracket.matches.length-1][0]];
		this.matches[this.matches.length-1][0].childMatches = [this.matches[this.matches.length-2][0]];
	},
	render:function($Layer, XSpacing, YSpacing){
		var $loss = $('<div class="lossLayer">').appendTo($Layer);
		this.losersBracket.render($loss, 1.1, 10);
		this._super($Layer, XSpacing, YSpacing);
		$loss.css({'top':$Layer.height()+80, 'left':-80});
		this.renderFinalMatches($Layer, $loss);
		$Layer.width($Layer.width()-this.matches[0][0].$element.width()*.5);
		$Layer.height($Layer.height()+$loss.height()+80);
	},
	renderFinalMatches:function($Layer, $LossLayer){
		var curMatch = this.matches[this.matches.length-2][0];
		var tTop = (parseInt(curMatch.childMatches[0].$element.css('top'))+$Layer.height()+(curMatch.$element.height()*.5)+parseInt(curMatch.childMatches[1].$element.css('top')))/2;
		var tLeft = parseInt(curMatch.childMatches[0].$element.css('left'))>(parseInt(curMatch.childMatches[1].$element.css('left')))?parseInt(curMatch.childMatches[0].$element.css('left'))+(curMatch.$element.width()*1.3):parseInt(curMatch.childMatches[1].$element.css('left'))+(curMatch.$element.width()*1.3);
		curMatch.$element.css({
			'top': tTop,
			'left': tLeft 
		});
		curMatch.parentMatch.$element.css({
			'top': tTop,
			'left': tLeft + (curMatch.$element.width() * 1.3) 
		});

		// Draw lines
		curMatch.parentMatch.childLines = [ this.createLine($Layer.find('.line-layer').last(), curMatch.left()+curMatch.$element.width(), curMatch.top()+curMatch.$element.height()*.5+6, curMatch.parentMatch.left(), curMatch.parentMatch.top()+curMatch.$element.height()*.5+6)];
		curMatch.childLines[0] = this.createLine($Layer.find('.line-layer').last(), curMatch.childMatches[0].left()+curMatch.$element.width(), curMatch.childMatches[0].top()+curMatch.$element.height()*.5+4, curMatch.left(), curMatch.top()+curMatch.$element.height()*.5+4);
		curMatch.childLines[1] = this.createLine($Layer.find('.line-layer').last(), curMatch.childMatches[1].left()+curMatch.$element.width()+parseInt($LossLayer.css('left')), curMatch.childMatches[1].top()+$Layer.height()+(curMatch.$element.height())+12, curMatch.left()+5, curMatch.top()+curMatch.$element.height()*.5+6);
	}
}); 

	var LoserBracket = Bracket.extend({
		init:function(NumPlayers){
			this.matches = [];
			this.totalCompetitors = NumPlayers;
			this.matchDepth = (Math.ceil(Math.log(NumPlayers)/Math.log(2))-1)*2;
			this.championshipMatch = new LoserMatch(null, this.matchDepth-1)
			this.buildGraph(this.championshipMatch);
		},
		buildGraph:function(HeadNode){
			this._super(HeadNode);
		}
	});

	// contains information about individual matches
	var Match = Class.extend({
		id:null,
		parentMatch:null,
		childMatches:null,
		childLines:null,
		matchName:null,
		players:null,
		games:null,
		bestOf:3,
		scheduledTime:'',
		winner:null,
		status:0,
		slug:'',
		depth:0,
		matchPosition:0,
		$element:null,
		init:function(ParentNode, Depth){
			this.parentMatch = ParentNode;
			this.depth = Depth;
			this.childMatches =[];
			this.childLines =[];
			this.players=[];
			this.games=[];
		},
		parseData:function(Data){
			this.slug = Data.slug || "";
			this.status = MatchState[Data.status] || 0; 
			this.bestOf = Data.best_of || 3;
			this.scheduledTime = Data.publish_at;
			this.id = Data.id;
			this.matchPosition = Data.position;
			this.matchName = Data.score.title || '';
			for(var a in Data.score.card){
				this.players.push(Data.score.card[a]);
			}
			//$('<h2>').appendTo(this.$element).text(this.status);
			this.populateMatch();
		},
		//Put a recursive call to get children nodes here
		getChildNodes:function(Ar){
			Ar = Ar || [] 
			Ar.push(this);
			if(this.childMatches.length>0){
				for(var a in this.childMatches){
					this.childMatches[a].getChildNodes(Ar);
				}
			}
			return Ar;
		},
		// Draws information about this match onto the DOM
		populateMatch:function(){
			var that = this;
			var $teamName;
			var $scores;
			var $content = $('<div class="match-content-container">').appendTo(this.$element).css({'position':'relative', 'height':'100%', width:this.$element.width()});
			
			//If the match has been played or is in progress...
			
			if(this.players.length > 0){
				$playersContain = $('<div class="match-content players">').appendTo($content).height(this.$element.height()).width(this.$element.width());
				$scores = $('<div class="score-slidein">').appendTo($playersContain);//.addClass('match-hide-score');
				for(var teamOrPlayer in this.players){
					$teamName = $('<div class="team-name">').appendTo($playersContain).html('<h2>'+this.players[teamOrPlayer].username +'</h2>');
					//$('<i class="icon-search icon-white"></i>').prependTo($content);
					if(this.players[teamOrPlayer].username.length > 12){
						$teamName.addClass('long-team-name');
					}
					//set up scores
					$('<div class="score">').appendTo($scores).html('<h3>'+this.players[teamOrPlayer].points+'</h3>');
					$scores.css('left', $content.outerWidth()-$scores.outerWidth());
					
					//check if child games have been played
					for(var a in this.childMatches){
						if(this.childMatches[a].status == MatchState.ready){
							this.childLines[a].addClass('unplayed');
						}
					}
					//hover hook
				}
				/*
				this.$element.mouseenter(function(event){
						that.onMouseEnter.apply(that,[event]);
					}).mouseleave(function(event){
						that.onMouseLeave.apply(that,[event]);
					}).click(function(event){
						that.onClick.apply(that,[event]);
					});
			*/
			// If it is upcoming... 
			}else{
				this.$element.addClass('unplayed');
				for(var b in this.childLines){
					this.childLines[b].addClass('unplayed');
				}
			}

			//add spoiler classes
			if(this.childMatches.length > 0){
				//this.$element.addClass('match-pos-spoiler match-spoiler');
				//$content.find('.players').hide();

				// add rev content
				if(this.status != MatchState.underway && this.players.length>0){
					$('<div class="match-content score-tip">').appendTo($content).append('<div class="score-tip-padding"><p>click to show winner</p></div>')
					.height(this.$element.height());
				//.css('margin-top', -parseInt(this.$element.height()));
				}
			}
		},
		addBranch:function(){
			this.childMatches = [new Match(this,this.depth-1), new Match(this,this.depth-1)];
			return this.childMatches;
		},
		left:function(){
			return parseFloat(this.$element.css('left'));
		},
		top:function(){
			return parseFloat(this.$element.css('top'));
		},
		showScores:function(){
			this.$element.find('.match-hide-score').show();
		},
		hideScores:function(){
			this.$element.find('.match-hide-score').hide();
		},
		onMouseEnter:function(event){
			if(this.$element.hasClass('match-spoiler')){
				//this.$element.removeClass('match-spoiler');
				this.$element.find('.match-content.players').show().css('opacity',0).animate({'opacity':1},{duration:400,queue:false});
				this.$element.find('.match-content.score-tip').animate({'opacity':0},{duration:400,queue:false});
				//unspoil behind
				
			}
			var trailers = this.getChildNodes([]);
			for(var i=1;i<trailers.length;++i){
				trailers[i].showScores();
			}
		},
		onMouseLeave:function(event){
			if(this.$element.hasClass('match-spoiler')){
				//this.$element.addClass('match-spoiler');
				this.$element.find('.match-content.players').animate({'opacity':0},{duration:400,queue:false});
				this.$element.find('.match-content.score-tip').show().css('opacity',0).animate({'opacity':1},{duration:400,queue:false});
				
			}

			var trailers = this.getChildNodes([]);
			for(var i=1;i<trailers.length;++i){
				trailers[i].hideScores();
			}
		},
		onClick:function(){
			if(this.$element.hasClass('match-pos-spoiler')){
				this.$element.removeClass('match-spoiler');
				this.$element.removeClass('match-pos-spoiler');
				//this.showScores();
			}
			this.$element.find('.match-hide-score').show();
			var trailers = this.getChildNodes([]);
			for(var i=1;i<trailers.length;++i){
				trailers[i].$element.find('.score-slidein').removeClass('.match-hide-score');
			}
		}
	});

	var LoserMatch = Match.extend({
		init:function(ParentNode, Depth){
			this._super(ParentNode, Depth);
		},
		addBranch:function(){
			if(this.depth%2==0){
				this.childMatches = [new LoserMatch(this,this.depth-1),new LoserMatch(this,this.depth-1)];
			}else{
				this.childMatches = [new LoserMatch(this,this.depth-1)];
			}
			return this.childMatches;
		}
	});

	// Contains information about an individual game within a match
	var Game = Class.extend({
		VOD:null,
		commentators:[], 
		init:function(){

		}
	});

	//detects the current stage size and adjusts the display list accordingly
	var WindowManager = Class.extend({
		parent:null,
		$appContainer:null,
		updateId:0,
		hasHover:false,
		
		init:function(Parent, Container){
			var that = this;
			this.parent = Parent;
			this.$appContainer = Container;
			this.$appContainer.addClass('IPLBracketWindow');
			$(window).mousemove(function(event){
      			that.parent.mouseHandler(event);
      			
    		});
    		$(window).resize(function(){
    			
    			that.centerObject(that.parent.$bracketLayer);
    			that.positionToolbar.apply(that);
    		});
			this.$appContainer.mousedown(function(event){
				that.parent.mousedown.apply(that.parent,[event]);
			}).mouseup(function(event){
				that.parent.mouseup.apply(that.parent,[event]);
			});
			
			this.$appContainer.mousewheel(function(event, delta, deltaX, deltaY){
				if(that.hasHover){
					event.preventDefault();
				}
				that.parent.onWheel.apply(that.parent,[-deltaY]);
				if(that.parent.$zoomTip != null){
					that.parent.$zoomTip.fadeOut();
					that.parent.$zoomTip = null;
				}

			});
			
			this.$appContainer.mouseenter(function(){
				that.hasHover=true;
				that.updateId = setInterval(function(){
					that.parent.update.apply(that.parent)}, 1000/that.parent.fps);
			}).mouseleave(function(){
				that.hasHover=false;
				clearInterval(that.updateId);
			});
			
		},
		centerObject:function($Target){
			$Target.css({'left':((this.$appContainer.width()/2) - ($Target.width()/2))});
			$Target.css({'top':((this.$appContainer.height()/2) - ($Target.height()/2))});
		},
		setInitalZoom:function($Target){
			
			if(this.parent.enable3d){
				// doesn't scale linearly, but this works for now
				var targetHeight3d =  ($Target.height()+100) / this.$appContainer.height();
				var targetWidth3d =  ($Target.width()+100) / this.$appContainer.width();
				if(targetHeight3d>targetWidth3d){
					$Target.css({'translateZ': -targetHeight3d*800});
				}else{
					$Target.css({'translateZ': -targetWidth3d*800});
				}
				
			}else{
				var targetHeight = this.$appContainer.height() / ($Target.height()+100);
				var targetWidth = this.$appContainer.width() / ($Target.width()+100);
				if(targetHeight < targetWidth){
					$Target.css('scale', targetHeight);
					this.parent.zoomLevel = targetHeight;
				}else{
					$Target.css('scale', targetWidth);
					this.parent.zoomLevel = targetWidth;
				}
			}	
		},
		getZoomTooltip:function($Layer){
			var $tip = $('<div>').html('<i class="icon-search"></i>Use mouse wheel to zoom').addClass('bracket-zoom-tip');
			return $tip;
		},
		positionToolbar:function(){

			this.parent.$toolbar.css({left:this.$appContainer.width()-6-this.parent.$toolbar.width()-parseInt(this.parent.$toolbar.css('padding-right'))*2, top:this.$appContainer.height()-6-this.parent.$toolbar.height()-parseInt(this.parent.$toolbar.css('padding-bottom'))*2});
			if(this.parent.$zoomTip != null){
				this.parent.$zoomTip.css({
					left:this.$appContainer.width() - this.parent.$zoomTip.width() -20,
					top:parseInt(this.parent.$toolbar.css('top')) - this.parent.$zoomTip.height() - 16
				});
			}
		}

	});

})(jQuery);

// Requires John Resig's Class and jQuery libraries
var IPLBracketApp;

(function($){
	// Main application - responsible for initializing components and managing events  
	var browserPrefix = "-webkit"
	IPLBracketApp = Class.extend({
		zoomLevel:.5,
		maxZoom:2,
		minZoom:.02,
		fps:30,
		windowManager:null,
		spoilers:true,
		$appContainer:null,
		$bracketLayer:null,
		$toolbar:null,
		loadedBracket:null,
		enable3d:false,
		//Mouse drag variables
		mouseIsDown:false,
		isDragging:false,
		mouseX:0,
		mouseY:0,
		oldMouse:{x:0,y:0},
		releaseAngle:0,
		speed:0,
		drag:.6,
		init:function(Container){
			var that = this;
			this.enable3d = Modernizr.csstransforms3d;
			this.$appContainer = Container;
			this.windowManager = new WindowManager(this,this.$appContainer);
			//console.log(Modernizr.prefixed('transform'));
			this.$bracketLayer = $('<div class="IPLBracketLayer">').appendTo(this.$appContainer);
			if(this.enable3d){
				$(this.$appContainer).css({'-moz-perspective':1500,'-webkit-perspective':1500, 'transform-origin':'50%'});
				this.$bracketLayer.css({'translateZ':-1000, 'backface-visibility':'hidden', '-webkit-transform-style':'preserve-3d'});
			}else{
				this.$bracketLayer.css({'scale': this.zoomLevel}); 
			}
			this.$toolbar = $('<div class="IPLBracketTools">').appendTo(this.$appContainer);
			this.loadedBracket = new Bracket(16);
			//var a = new DoubleElimBracket(16);
			this.loadBracketJSON("bin/foo_bracket_demo.json", this.backetLoaded);
			this.loadedBracket.absoluteRender(this.$bracketLayer);
			this.windowManager.centerObject(this.$bracketLayer);
			this.setupTools(this.$toolbar);
			console.log(this.loadedBracket);
			setInterval(function(){that.update()}, 1000/this.fps);
		},
		backetLoaded:function(Data){
			//add title
			var $title = $('<div>').prependTo(this.$bracketLayer).css({float:'right', position:'absolute', display:'inline'})
			$('<h1>').appendTo($title).text(Data.name);
			$title.css('left',this.$bracketLayer.width()-$title.width());
			 //Data.name
			// begin populating tree
			var mappedRound=0;
			for(var a in Data.rounds){
				for(var b in Data.rounds[a].matches){
					//flip the order so it maps to the bracket object
					mappedRound = this.loadedBracket.matches.length - Data.rounds[a].position - 1;
					this.loadedBracket.matches[mappedRound][b].parseData(Data.rounds[a].matches[b].match);
				}
			}
			//this.loadedBracket;
		},
		loadBracketJSON:function(JSONURI, Callback){
			var that = this;
			$.ajax({
				url:JSONURI,
				// TODO change to jsonp for production
				dataType:'json',
				success:function(data){

					Callback.apply(that,[data]);
				}
			});
			console.log('loading');
		},
		update:function(){
			//stick drag code here
			if(this.mouseIsDown){
				var xDist = this.mouseX - this.oldMouse.x;
				var yDist = this.mouseY - this.oldMouse.y;
				this.releaseAngle = Math.atan2(yDist, xDist);
				this.speed = Math.sqrt((this.oldMouse.x - this.mouseX)*(this.oldMouse.x - this.mouseX) + (this.oldMouse.y-this.mouseY)*(this.oldMouse.y-this.mouseY))
				this.$bracketLayer.css({'left':parseInt(this.$bracketLayer.css('left')) + xDist, 'top':parseInt(this.$bracketLayer.css('top')) + yDist});
			}else{
				if(this.speed>.1)
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
			$('<button class="btn btn-inverse">').appendTo($Layer).text("-").css('translateZ',4000).click(function(){
				that.changeZoom.apply(that,[-450]);
			});
			$('<button class="btn btn-inverse">').appendTo($Layer).text("+").css('translateZ',4000).click(function(){
				that.changeZoom.apply(that,[450]);
			});
			$('<div><label class="checkbox inline">Hide Spoilers<input type="checkbox" checked="checked"></label></div>').appendTo($Layer);
		},
		onWheel:function(DeltaY){
			this.changeZoom(DeltaY*350);
		},
		changeZoom:function(ZoomAmt){
			if(this.enable3d){
				this.$bracketLayer.animate({'translateZ':'+='+ZoomAmt},{duration:300,queue:false});
			}else{
				this.zoomLevel += ZoomAmt*.00005;
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

var DoubleElimBracket = Class.extend({
	winnersBracket:null,
	losersBracket:null,
	championshipMatch:null,
	init:function(NumPlayers){
		this.winnersBracket = new Bracket(NumPlayers);
		this.losersBracket = new LoserBracket(NumPlayers);
		this.championshipMatch = new Match(null,0);
		this.championshipMatch.childMatches[0] = this.winnersBracket.championshipMatch;
		this.championshipMatch.childMatches[0] = this.losersBracket.championshipMatch;
	},
	render:function($Layer){
		var $win=$('<div class="winLayer clearfix">').appendTo($Layer);
		var $loss=$('<div class="lossLayer clearfix">').appendTo($Layer);
		var $champ=$('<div class="champLayer">').appendTo($Layer);
		this.winnersBracket.render($win);
		//this.losersBracket.render($loss);
		//console.log(parseInt($win.height()+$loss.height()));
		//$('<div class="bracket-match clearfix">').appendTo($champ).css({'margin-right':-700, 'margin-top':-.5*($win.height()+$loss.height())});
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
			this.championshipMatch = new Match(null, 0);
			this.buildGraph();
		},
		//builds a graph to hold all matches
		buildGraph:function(){
			var seedMatch = this.championshipMatch;
			this.matches = new Array(this.matchDepth);

			this.matches[0] = [this.championshipMatch]; //seedMatch.addBranch();
			for(var i=1;i<this.matchDepth;++i){
				this.matches[i] = [];
			}
			// builds the tree and adds each layer of nodes to the matches Array
			for(i=0;i<this.matchDepth-1;++i){
				for(var j=0;j<this.matches[i].length;++j){
					var newNodes = this.matches[i][j].addBranch();
					for(var k=0;k<newNodes.length;++k){
						this.matches[i+1].push(newNodes[k]);
					}
				}
			}
		},
		render:function($Layer){
			//TODO refactor to use absolute positioning
			var $round;
			var bracketWidth = 0;
			var $lineLayer = $('<div>').appendTo($Layer).css('position','relitave');
			var that = this;
			for(var i=this.matches.length-1;i>=0;--i){
				$round = $('<div class="bracket-round matches-'+this.matches[i].length+'">').appendTo($Layer);
				for(var j=0;j<this.matches[i].length;++j){
					this.matches[i][j].$element =$('<div class="bracket-match">').appendTo($round);
				}
				bracketWidth += $round.width() + parseInt($round.css('margin-right')); 
			}
			$Layer.width(bracketWidth);
			this.alignMatches();
			that.connectMatches.apply(that,[$lineLayer,that.championshipMatch]);
		},
		absoluteRender:function($Layer){
			var $round;
			var bracketWidth = 0;
			var $lineLayer = $('<div>').appendTo($Layer).css('position','relitave');
			var that = this;
			var match;
			for(var i=this.matches.length-1;i>=0;--i){
				console.log(this.matches[i].length);
				$round = $('<div class="bracket-round matches-'+this.matches[i].length+'">').appendTo($Layer);
				for(var j=0;j<this.matches[i].length;++j){
					match = this.matches[i][j];
					match.$element =$('<div class="bracket-match">').appendTo($round).css('position','absolute');
					if(i==this.matches.length-1){
						match.$element.css('top', j*(match.$element.height()+40));
					}else{
						match.$element.css('top', (parseInt(match.childMatches[0].$element.css('top'))+parseInt(match.childMatches[1].$element.css('top')))/2);
					}
					match.$element.css('left', (this.matches.length - 1 - i) * (200+match.$element.width()));
				}
				bracketWidth += $round.width() + parseInt($round.css('margin-right')); 
			}
			that.connectMatches.apply(that,[$lineLayer,that.championshipMatch]);
		},
		alignMatches:function(){
			for(var i=this.matches.length-2;i>=0;--i){
				for(var j=0;j<this.matches[i].length;++j){
					var el = this.matches[i][j];
					var thisInd = el.childMatches[0].$element.index();
					var lastmargin = parseInt(el.childMatches[0].$element.css('margin-top'));
					var lastChildren = el.childMatches;

					if(thisInd>0){
						el.$element.css({'margin-top': lastChildren[0].$element.height() + lastmargin*2});
					}else{
						el.$element.css({'margin-top': (lastmargin*2)+(el.$element.height()*0.5)-(parseInt(el.$element.css('margin-top').replace(/px/,''))*0.5)});
					}
				}
			}
		},
		connectMatches:function($Layer, Node){
			
			$Layer.css({'position':'absolute','top':-10});
			if(Node.childMatches.length>0){
				
				for(var a in Node.childMatches){
					//this.createLine($Layer, Node.realX(), Node.realY()+50, Node.childMatches[a].realX()+Node.$element.width() ,Node.childMatches[a].realY()+50);
					//console.log(Node.childMatches[a].top());
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
        	})
        	.width(length)
        	.css({top:y1,left:x1});
    		return line;
		}


	});

	var LoserBracket = Bracket.extend({
		init:function(NumPlayers){
			this.totalCompetitors = NumPlayers;
			this.matchDepth = (Math.ceil(Math.log(NumPlayers)/Math.log(2))-1)*2;
			this.championshipMatch = new LoserMatch(null, 0);
			this.buildGraph();
		},
		buildGraph:function(){
			this._super();
		},
		alignMatches:function(){
			for(var i=this.matches.length-2;i>=0;--i){
				for(var j=0;j<this.matches[i].length;++j){
					var el = this.matches[i][j];
					var thisInd = el.childMatches[0].$element.index();
					var lastmargin = parseInt(el.childMatches[0].$element.css('margin-top'));
					var lastChildren = el.childMatches;
					if(i%2>0){
						if(thisInd>0){
							el.$element.css({'margin-top': lastChildren[0].$element.height() + lastmargin*2});
						}else{
							el.$element.css({'margin-top': (lastmargin*2)+(el.$element.height()*.5)-(parseInt(el.$element.css('margin'))*.5)});
						}
					}
				}
			}
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
		status:'upcoming',
		slug:'',
		depth:0,
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
			this.status = Data.status || 'upcoming'; 
			this.bestOf = Data.best_of || 3;
			this.scheduledTime = Data.publish_at;
			this.id = Data.id;
			this.matchName = Data.score.title || '';
			for(var a in Data.score.card){
				this.players.push(Data.score.card[a]);
			}
			//$('<h2>').appendTo(this.$element).text(this.status);
			this.populateMatch();
		},
		populateMatch:function(){
			//console.log(this.players);
			if(this.players.length > 0){
				for(var teamOrPlayer in this.players){
					$('<div class="team-name">').appendTo(this.$element).html('<h2>'+this.players[teamOrPlayer].username +'</h2>');
				}
			}else{
				this.$element.css('background-color','#555');
			}
			
		},
		addBranch:function(){
			this.childMatches = [new Match(this,this.depth+1), new Match(this,this.depth+1)];
			return this.childMatches;
		},
		left:function(){
			return parseFloat(this.$element.css('left'));
		},
		top:function(){
			return parseFloat(this.$element.css('top'));
		},
		realX:function(){
			return (this.$element.width() + parseInt(this.$element.parent().css('margin-right')) + (parseInt(this.$element.css('margin-right')))*2)*(this.$element.parent().index()-1) + 20;
		},
		realY:function(){
			var tot = parseInt(this.$element.parent().children().first().css('margin-top'))+(this.$element.height()*this.$element.index());
			if(this.$element.parent().children().length>1){
				tot+=(this.$element.index())*parseInt(this.$element.parent().children().eq(1).css('margin-top'));
			}
			return tot;
		}
	});

	var LoserMatch = Match.extend({
		init:function(ParentNode, Depth){
			this._super(ParentNode, Depth);
		},

		addBranch:function(){
			if(this.depth%2>0){
				this.childMatches = [new LoserMatch(this,this.depth+1),new LoserMatch(this,this.depth+1)];
			}else{
				this.childMatches = [new LoserMatch(this,this.depth+1)];
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
    		});
			this.$appContainer.mousedown(function(event){
				that.parent.mousedown.apply(that.parent,[event]);
			}).mouseup(function(event){
				that.parent.mouseup.apply(that.parent,[event]);
			});
			
			this.$appContainer.mousewheel(function(data, delta, deltaX, deltaY){
				that.parent.onWheel.apply(that.parent,[deltaY]);
			});
		},
		centerObject:function($Target){
			//$Target.left(((this.$appContainer.width()/2) - ($Target.width()/2)));
			$Target.css({'left':((this.$appContainer.width()/2) - ($Target.width()/2))});
			$Target.css({'top':((this.$appContainer.height()/2) - ($Target.height()/2))});
		}
	});

	// provides a small html5 canvas reprisentation of the bracket
	var MiniMap = Class.extend({
		init:function(){
			console.log("Boom");
		}
	});

})(jQuery);

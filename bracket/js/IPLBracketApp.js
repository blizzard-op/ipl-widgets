// Requires John Resig's Class and jQuery libraries
var IPLBracketApp;

(function($){
	// Main application - responsible for initializing components and managing events  
	IPLBracketApp = Class.extend({
		zoomLevel:1,
		fps:30,
		windowManager:null,
		spoilers:true,
		$appContainer:null,
		$bracketLayer:null,
		$toolbar:null,
		mouseIsDown:false,
		isDragging:false,
		enable3d:true,
		init:function(Container){
			var that = this;
			this.$appContainer = Container;
			this.windowManager = new WindowManager(this,this.$appContainer);
			
			this.$bracketLayer = $('<div class="IPLBracketLayer">').appendTo(this.$appContainer);
			if(this.enable3d){
				$(this.$appContainer).css({'-webkit-perspective':1500, '-webkit-transform-origin':'50%'});
				this.$bracketLayer.css({'translateZ':-1000, '-webkit-backface-visibility':'hidden'});
			}
			this.$toolbar = $('<div class="IPLBracketTools">').appendTo(this.$appContainer);
			var a = new Bracket(64);
			
			a.render(this.$bracketLayer);
			a.alignMatches();
			this.windowManager.centerObject(this.$bracketLayer);
			this.setupTools(this.$toolbar);
			setInterval(function(){that.update()}, 1000/this.fps);
			
		},
		update:function(){

		},
		setupTools:function($Layer){
			var that = this;
			$('<button class="btn btn-inverse">').appendTo($Layer).text("-").css('translateZ',4000).click(function(){
				that.changeZoom.apply(that);
			});
			$('<button class="btn btn-inverse">').appendTo($Layer).text("+").css('translateZ',4000).click(function(){
				that.changeZoom.apply(that);
			});
			$('<div><label>Hide Spoilers</label><input type="checkbox" checked="checked"></div>').appendTo($Layer);
		},
		onWheel:function(DeltaY){
			this.changeZoom(DeltaY*250);
		},
		changeZoom:function(ZoomAmt){
			this.$bracketLayer.animate({'translateZ':'+='+ZoomAmt},{duration:300,queue:false});
		},
		mousedown:function(event){
			mouseIsDown = true;
		},
		mouseup:function(event){
			mouseIsDown = false;
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
			var $round;
			var bracketWidth = 0;
			for(var i=this.matches.length-1;i>=0;--i){
				$round = $('<div class="bracket-round matches-'+this.matches[i].length+'">').appendTo($Layer);
				for(var j=0;j<this.matches[i].length;++j){
					this.matches[i][j].$element =$('<div class="bracket-match">').appendTo($round).css({'background-color':'#000'});
					
					//$('<div><h1>Let the games begin</h1></div>').appendTo(to).css({'translateZ':-2000});
				}
				bracketWidth += $round.width() + parseInt($round.css('margin-right')); 
			}
			$Layer.width(bracketWidth);
		},
		//populates a specific match with actual data
		populate:function(data){

		},
		//
		getMatchesAtRound:function(){

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
						el.$element.css({'margin-top': (lastmargin*2)+(el.$element.height()*.5)-(parseInt(el.$element.css('margin'))*.5)});
					}


				}
			}
		}
	});

	var DoubleElimBracket = Bracket.extend({
		init:function(){
			this._super();
		},
		buildGraph:function(){

		}

	});

	// contains information about individual matches
	var Match = Class.extend({
		parentMatch:null,
		childMatches:[],
		matchName:null,
		players:[],
		games:[],
		bestOf:3,
		scheduledTime:'',
		winner:null,
		status:'upcoming',
		depth:0,
		$element:null,
		init:function(ParentNode, Depth){
			this.parentMatch = ParentNode;
			this.depth = Depth;
		},
		addBranch:function(){
			this.childMatches = [new Match(this,this.depth+1), new Match(this,this.depth+1)];
			return this.childMatches;
		}
	});

	var LoserMatch = Match.extend({
		init:function(ParentNode, Depth){
			this._super(ParentNode, Depth);
		},
		addBranch:function(){
			if(this.depth%2>0){
				_super.addBranch();
			}else{
				this.childMatches = [null, new LoserMatch(this,this.depth+1)];
			}
			return this.childMatches;
		}
	});

	var DoubleElimChampionship = Match.extend({
		init:function(ParentNode, Depth){
			this._super(ParentNode, Depth);
		},
		addBranch:function(){
			this.childMatches = [new Match(this,this.depth+1), new LoserMatch(this,this.depth+1)];
			return this.childMatches;
		}
	})

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
			this.$appContainer.mousedown(function(event){
				that.parent.mousedown.apply(that,[event]);
			}).mousedown(function(event){
				that.parent.mousedown.apply(that,[event]);
			});
			var that = this;
			this.$appContainer.mousewheel(function(data, delta, deltaX, deltaY){
				//console.log(deltaY);
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


var app = angular.module('twitter-app', []);

app.controller('SearchController', function($scope, $location, $sce) { 
	$scope.currentSearch = "tweets";
	$scope.currentSearchTerm = "";
	$scope.path = [];
	$scope.results = [];
	$scope.currentResults = [];
	$scope.currentResultPage = 0;
	$scope.pagination = [];
	$scope.currentMaxId = "";
	$scope.showError = false;
    $scope.showModal = false;
    $scope.showLoading = false;
    $scope.modalOpen = false;
    $scope.iframeContent = "";
    $scope.firstLoad = true;
	$scope.$on('$locationChangeStart', function(event) {
		$scope.updateSearch(function(){$scope.firstLoad = false;});
		
	});
	$scope.updateSearch = function(callback){
		$scope.path = $location.url().split("/");

		if($scope.modalOpen){
			$scope.modalOpen = false;
			return false;
		}
		function load(){
			if($scope.path[1]){
				$scope.search = decodeURIComponent($scope.path[1]);
				$scope.currentSearchTerm = $scope.search;
			}else{
				return false;
			}
			switch($scope.search.charAt(0)){
				case "#": 
					$scope.currentSearch = "hashtag";
				break;
				case "@":
					$scope.currentSearch = "user";
				break;
				default:
					$scope.currentSearch = "tweets";
				break;
			}
			$scope.results = [];
			$scope.currentSearchDisplay = "Search "+$scope.currentSearch+" "+$scope.search;
			$scope.submitSearch(
				function(){
					$scope.updatePagination();
				}
			);
		}
		if($scope.path[3] && $scope.path[2] == "link"){
			var link = $location.url().substring($location.url().indexOf("link/") + 5);
			$scope.showPreview(link);
		}else{
			load();
		}
		if(callback){
			callback();
		}
	}
	$scope.submitSearch = function(callback){
    	$scope.showLoading = true;
		$scope.currentResults = [];
		$scope.showError = false;
		var url = "twitter-app/ajax/ajax3.php?searchTerm="+$scope.search.replace("#","")+"&searchType="+$scope.currentSearch;
		
		if($scope.currentMaxId){
			url += "&maxId="+$scope.currentMaxId;
		}

		$.ajax({
			type: "GET",
			dataType: "json",
			url: url,
			success : function(response){
				var statuses = ($scope.currentSearch == "user") ? response : response.statuses;
				for(i in statuses){
					$scope.currentResults.push({
						content : $sce.trustAsHtml($scope.linkify(statuses[i].text, "twitter")),
						id : statuses[i].id,
						user : statuses[i].user.name
					});
					$scope.currentMaxId = statuses[i].id;
					console.log(statuses[i].id);
				}
				$scope.results[$scope.currentResultPage] = $scope.currentResults;
				$scope.results.push([]);

				if(callback){
					callback();
				}
    			$scope.showLoading = false;
				$scope.updatePagination();
				$scope.$apply();
			},
			error : function(response){
				console.log(response);
				console.log('fail');
    			$scope.showLoading = false;
				$scope.showError = true;
				$scope.$apply();
			}
		})
	};
	$scope.compileUserStatuses = function(data){
		var compiledStatuses = [];
		for(i in data){
			compiledStatuses.push({
				text: data[i].text,
				id : data[i].id,
				name: data[i].user.name
			});
		}
	};
	$scope.changePage = function(page){
		$scope.currentResultPage = page;
		if($scope.results[$scope.currentResultPage].length < 1){
			$scope.submitSearch(
				function(){
					$scope.updatePagination();
				}
			);
		} else {
			$scope.currentResults = $scope.results[$scope.currentResultPage];
			$scope.updatePagination();
			$scope.$apply();
		}
	};
	$scope.updatePagination = function(){
		$scope.pagination = [];
		for(i = ($scope.currentResultPage - 2); i <= ($scope.currentResultPage + 2); i++){
			if($scope.results[i] && i >= 0){
				$scope.pagination.push(i);
			}
		}
	}
	$scope.formSubmit = function(){
		if(encodeURIComponent($scope.search) == $scope.path[1]){
			$scope.resetResults();
			$scope.updateSearch();
		}else{
			$scope.resetResults();
			$location.path('/'+$scope.search);
		}
	};
	$scope.clear = function(){
		$scope.search = "";
		$scope.currentSearchDisplay = "";
		$location.url("/");
		$scope.results = [];
		$scope.$apply();
	};
	$scope.resetResults = function(){
		$scope.results = [];
		$scope.currentResults = [];
		$scope.pagination = [];
		$scope.currentResultPage = 0;
	};
	$scope.paginationPrevious = function(){
		if($scope.currentResultPage > 0){
			$scope.changePage($scope.currentResultPage - 1);
		}
	}
	$scope.paginationNext = function(){
		$scope.changePage($scope.currentResultPage + 1);	
	}
	$scope.getPaginationClass = function(key){
		return key == $scope.currentResultPage ? "active" : "";
	};
	$scope.getPreviousClass = function(key){
		return $scope.currentResultPage == 0 ? "disabled" : "";
	};
	$scope.linkify = function(str, type) {
        var text = str.replace( /(?:https?\:\/\/|www\.)+(?![^\s]*?")([\w.,@?!^=%&amp;:\/~+#-]*[\w@?!^=%&amp;\/~+#-])?/ig, function(url) {
			var wrap = document.createElement('div');
			var anch = document.createElement('a');
			anch.href = "#/" + $scope.path[1].replace("@", "%40") + "/link/"+url;
			//anch.target = "_blank";
			anch.innerHTML = url;
			wrap.appendChild(anch);
			return wrap.innerHTML;
        });
		text = text.replace(/(|\s)*@([\u00C0-\u1FFF\w]+)/g, '$1<a href="#/%40$2">@$2</a>');
		text = text.replace(/(^|\s)*#([\u00C0-\u1FFF\w]+)/g, '$1<a href="#/%23$2">#$2</a>');
        return text;
    };
    $scope.showPreview = function(link){
    	$scope.showModal = true;
		$scope.iframeContent = $sce.trustAsHtml("<iframe id='iframe' style='width:100%; min-height: 400px;' src='"+link+"'></iframe>");
    	try{
    		$("#iframe").on("error", function(){
    			alert('error');
    		});
    	}catch(e){
    		console.log(e);
    	}
    };
    $scope.removeLink = function(){
        $location.url($scope.path[0]+$scope.path[1]);
        $scope.iframeContent = "";
    };
	$scope.toggleModal = function(){
	    $scope.showModal = !$scope.showModal;
	};
	$scope.toggleModalOpenValue = function(){
	    $scope.modalOpen = true;
	};
});

app.directive('modal', function () {
    return {
      template: '<div class="modal fade">' + 
          '<div class="modal-dialog">' + 
            '<div class="modal-content">' + 
              '<div class="modal-header">' + 
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                '<h4 class="modal-title">{{ title }}</h4>' + 
              '</div>' + 
              '<div class="modal-body" ng-transclude ng-bind-html="iframeContent">{{iframeContent}}</div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
      restrict: 'E',
      transclude: true,
      replace:true,
      scope:true,
      link: function postLink(scope, element, attrs) {
        scope.title = attrs.title;

        scope.$watch(attrs.visible, function(value){
          if(value == true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

        $(element).on('shown.bs.modal', function(){
          scope.$apply(function(){
          	scope.toggleModalOpenValue();
            scope.$parent[attrs.visible] = true;
          });
        });

        $(element).on('hidden.bs.modal', function(){
			scope.$apply(function(){
	            scope.$parent[attrs.visible] = false;
				scope.removeLink();
			});
        });
      }
    };
});
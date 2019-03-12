/* global angular */

angular.module('ProgressNote', [])

.controller('ProgressNoteCtrl', ['$scope', '$http', function($scope, $http) {
	console.info("init");
	$scope.spaceNum = 2;
	$scope.vitalSign = 

'BP:/mmHg 1071113-1414\n\
CVP: , SPO2:% 1071113-1414\n\
\n\
TPR:37.2℃/73bmp/20min  1071113-1414\n\
BP:134/81mmHg 1071113-1414 \n\
CVP: , SPO2:95% 1071113-1414\n\
\n\
TPR:36℃/58bmp/20min    1071113-0844\n\
BP:126/70mmHg 1071113-0844 \n\
CVP: , SPO2:% 1071113-0844\n\
\n\
TPR:40℃/bmp/min          1071112-2300\n\
BP:115/59mmHg 1071112-2300 \n\
CVP: , SPO2:% 1071112-2300\n\
\n\
TPR:℃/bmp/min          1071114-0930\n\
BP:137/83mmHg 1071114-0930 \n\
CVP: , SPO2:% 1071114-0930\n\
\n\
TPR:37℃/70bmp/18min    1071114-0845\n\
BP:153/70mmHg 1071114-0845 \n\
CVP: , SPO2:97% 1071114-0845\n\
\n\
TPR:36℃/58bmp/20min 1071113-0844  \n\
BP:126/70mmHg 1071113-0844 '

	$scope.onCleanAll = function() {
		var url = '/progressLab.cgi?cleanAll=' + encodeURI($scope.vitalSign) +
			'&space=' + encodeURI($scope.spaceNum);
		$http({method: 'GET', url: url}).success(function(data, status, headers, config) {
			console.info(arguments);
			$scope.vitalSign = data;
		});
	};
}]);

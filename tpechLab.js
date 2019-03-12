/* global angular */

angular.module('TpechLab', [])

.controller('TpechLabCtrl', ['$scope', '$http', function($scope, $http) {
	console.info("init");
	$scope.date = new Date();//Today.getFullYear() + month + day;
	$scope.labInput = 
'|備註:\n\
|---------------------------------------------------------------------------\n\
|      項  目  名  稱         結果值       單位         參考值範圍\n\
[血液檢查報告]\n\
      WBC                      8.22      10^3/ul   3.54   -  9.06\n\
      RBC                      4.45      10^6/ul   4.00   -  5.52\n\
      Hb                       13.5      g/dl      13.2   -  17.2\n\
      Hct                    L 40.1      %         40.4   -  51.1\n\
      MCV                      90.1      fL        80.0   -  100.0\n\
      MCH                      30.3      pg        26.0   -  34.0\n\
      MCHC                     33.7      g/dl      31.0   -  37.0\n\
      RDW-CV                   14.3      %         11.9   -  14.5\n\
      RDW-SD                   47.5      fl\n\
      Platelet                 194       10^3/ul   148    -  339\n\
      Neut                   H 88.9      %         41.2   -  74.7\n\
      Lym                    L 7.5       %         21.2   -  51.0\n\
      Mono                     3.4       %         3.1    -  8.0\n\
      Eos                    L 0.0       %         0.2    -  8.4\n\
      Basophil                 0.2       %         0.2    -  1.8\n\
|報告者: 呂瑞禎 檢字第008459號\n\
|---------------------------------------------------------------------------\n\
|***完整報告****                                             頁次:001\n\
|備註: 採檢時間:107/11/12 05:56人員:B2904\n\
|---------------------------------------------------------------------------\n\
|      項  目  名  稱         結果值       單位         參考值範圍\n\
      Total Protein          L 5.6       g/dl      6.2    -  8.3\n\
      Albumin                  3.5       g/dl      3.5    -  5.2\n\
      A/G                      1.67\n\
      Bilirubin Total        H 2.34      mg/dl     0.20   -  1.20\n\
      Bilirubin Direct       H 2.27      mg/dl     0.00   -  0.40\n\
      Alk Phosphotase        H 311       U/L       35     -  129\n\
      AST                      36        U/L       10     -  39\n\
      ALT                      24        U/L       7      -  42\n\
      r-GT                   H 440       U/L       5      -  61\n\
      Ca                     L 7.8       mg/dl     8.1    -  10.4\n\
      Phosphorus             L 1.6       mg/dL     2.5    -  4.5\n\
      CRP                    H 100.50    mg/L      <5.00  -\n\
      Lipemia                  0\n\
      Icterus                  1\n\
      Hemolysis                0\n\
|報告者: 聯合檢驗中心 柯惠芳 檢字第004393號\n\
|---------------------------------------------------------------------------\n\
|***完整報告****                                             頁次:001\n\
|備註: 採檢時間:107/11/14 06:00人員:B2904\n\
|---------------------------------------------------------------------------\n\
|      項  目  名  稱         結果值       單位         參考值範圍\n\
      BUN                      6.8       mg/dl     5.0    -  24.0\n\
      Creatinine               0.5       mg/dl     0.5    -  1.0\n\
                                         請注意:自105/03/09日參考值更改\n\
      GFR\n\
      eGFR(female)             128.100   ml/min/1.73m2\n\
           公式=175*Scr^-1.154*Age^-0.203*0.742\n\
      Na                       139       mEq/L     135    -  148\n\
      K                      L 3.2       mEq/L     3.5    -  5.1\n\
                                         請注意:自105/03/09日參考值更改\n\
      Amylase (Serum)          67        U/L       28     -  110\n\
                                         請注意:自105/03/09日參考值更改\n\
      Lipase (Serum)         H 75        U/L       22     -  51\n\
                                         請注意:自105/03/09日參考值更改\n\
       備   註              黃疸\n\
       =================================\n\
|報告者: 呂瑞禎 檢字第008459號\n\
|---------------------------------------------------------------------------\n\
|***完整報告****                                             頁次:001'



	$scope.onCleanAll = function() {
		var s = $scope.labInput;
		//console.info(s.split("\n"));
		var lines = s.split("\n");
		var labs = [];
		lines.forEach(function(item, index, array){
			cols = item.split(/\s+/);
			console.info(cols, cols[2], cols[3], cols[4]);
			if (cols[2] === '') {
				return;
			}
			var val = Number(cols[2]);
			var key = cols[1];
			if (isNaN(val) && cols[3] !== '') {
				val = Number(cols[3]);
			}
			if (isNaN(val) && cols[4] !== '') {
				val = Number(cols[4]);
			}
			if (cols[2] !== "H" &&
			    cols[2] !== "HH" &&
				cols[2] !== "L" &&
				cols[2] !== "LL" &&
				isNaN(Number(cols[2])) ) {
				key = key + " " + cols[2];
			}
			if (!isNaN(val) && item.search(key) < 8 && item.search(key) > 4) {
				labs.push({key: key, value: val});
			}
		});
		if ($scope.showAll === true) {
			$scope.printAllCols(labs);
		} else {
			$scope.printLabs(labs);
		}
	};
	$scope.getDateStr = function() {
	    var input_day = $scope.date;
	    var month = 1 + input_day.getMonth();
	    var day = input_day.getDate();
	    month = month > 9 ? '' + month : '0' + month;
	    day = day > 9 ? '' + day : '0' + day;

		return month + "." + day;
	};
	$scope.titleAbbr = function(title) {
		var abbr_map = [
			{key: "Prothrombin Time",	title: "PT"},
			{key: "Creatinine",			title: "Cr"},
			{key: "Platelet",			title: "Plt"},
			{key: "Alk Phosphotase",	title: "Alk-P"},
			{key: "Basophil",			title: "Baso"},
			{key: "Phosphorus",			title: "Pho"},
			{key: "Total Protein",		title: "T-Pro"},
			{key: "Albumin",			title: "Alb"},
			{key: "Amylase (Serum)",	title: "Amy"},
			{key: "Lipase (Serum)",		title: "Lipase"},
			{key: "eGFR(female)",		title: "eGFR"},
			{key: "eGFR(Male)",			title: "eGFR"},
			{key: "Bilirubin Direct",	title: "Bil-D"},
			{key: "Bilirubin Total",	title: "Bil-T"},
			{key: "Ammonia",			title: "NH3"},
			{key: "Troponin T",			title: "cTnT"},
			{key: "NT-proBNP",			title: "proBNP"},
			{key: "Procalcitonin",		title: "PCT"},
		    {key: "Lactate",			title: "LAC"}
		];

		pair = abbr_map.find(function(item, index, array){
			return item.key === title;
		});
		if (pair != undefined) {
			return pair.title;
		} else {
			return title;
		}
	}
	$scope.printAllCols = function(labs) {
		var line1 = "_Lab:";
		var line2 = $scope.getDateStr();
		$scope.labOutput = "";
		function byteLength(str) {
			// returns the byte length of an utf8 string
		    var s = str.length;
			for (var i=str.length-1; i>=0; i--) {
				var code = str.charCodeAt(i);
				if (code > 0x7f && code <= 0x7ff) s++;
				else if (code > 0x7ff && code <= 0xffff) s+=2;
				if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
			}
			return s;
		}
		labs.forEach(function(item, index, array){
			var title = $scope.titleAbbr(item.key);
			var title_length = Math.ceil((byteLength(title)+1)/7)*7;
			if (byteLength(line1) + title_length >= 77) {
				$scope.labOutput += line1 + "\n" + line2 + "\n\n";
				line1 = "     ";
				line2 = $scope.getDateStr();
			}
			line1 += title.padStart(title_length);
			line2 += String(item.value).padStart(title_length);
		});

		$scope.labOutput += line1 + "\n" + line2;
	};
	$scope.printLabs = function(labs) {
		var basics = [ {key: "WBC",				title: "   WBC"},
		             {key: "Hb",				title: "   Hb"},
		             {key: "Platelet",			title: "  plt"},
		             {key: "CRP",				title: "   CRP"},
		             {key: "Lactate",			title: "  LAC"},
		             {key: "BUN",				title: "  BUN"},
		             {key: "Creatinine",		title: "   Cr"},
		             {key: "Na",				title: "  Na"},
		             {key: "K",					title: "   K"},
		             {key: "AST",				title: "  AST"},
		             {key: "ALT",				title: "  ALT"},
		             {key: "Bilirubin Total",	title: " TBil"},
		             {key: "Albumin",			title: "  Alb"},
		             {key: "Troponin T",		title: " cTnT"}
		];

		console.info(labs);
		var line1 = "-Lab:";
		var line2 = $scope.getDateStr();
		basics.forEach(function(item, index, array){
			var now_key = item.key;
			pair = labs.find(function(item, index, array){
				return item.key === now_key;
			});
			line1 += item.title;
			if (pair == undefined) {
				line2 += "".padStart(item.title.length);
			} else {
				line2 += String(pair.value).padStart(item.title.length);
			}
		});
		$scope.labOutput = line1 + "\n" + line2;
	};
}]);

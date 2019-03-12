/* global angular */

angular.module('TpechLab', [])

.controller('TpechLabCtrl', ['$scope', '$http', function($scope, $http) {
	console.info("init");
	$scope.date = new Date();//Today.getFullYear() + month + day;
	$scope.onCleanAll = function() {
		var s = $scope.labInput;
		//console.info(s.split("\n"));
		var lines = s.split("\n");
		var labs = [];
		var reportClass = undefined;
		var reportTime = undefined;
		var reportClassItems = {
			生化: [],
			血: [],
			血液氣體: [],
			血液凝固: [],
			生化PLE: [],
			血清: []
		};
		var tmpReport = {};
		var report = {
			生化: [],
			血: [],
			血液氣體: [],
			血液凝固: [],
			生化PLE: [],
			血清: []
		};
		lines.forEach(function(item, index, array){
			cols = item.split(/\s+/);
			//console.info(cols, cols[2], cols[3], cols[4]);

			//取得報告類別
			if (cols[0].startsWith('◆報告類別：')) {
				reportClass = cols[0].substr(6);
			}
			if (reportClass === '急診生化') {
				reportClass = '生化';
			}
			//console.info("report class", reportClass);
			if (!reportClassItems.hasOwnProperty(reportClass)) {
				return
			}

			//取得報告時間 將暫存資料存入
			if (cols[4] && cols[4].startsWith('報告時間：')) {
				reportTime = cols[4].substr(8);
				tmpReport.time = reportTime;
				report[reportClass].unshift(tmpReport);
				tmpReport = {};
				//console.info("report", report);
			}
			if (cols[5] && cols[5].startsWith('報告時間：')) {
				reportTime = cols[5].substr(8);
				tmpReport.time = reportTime;
				report[reportClass].unshift(tmpReport);
				tmpReport = {};
				//console.info("report", report);
			}
			//console.info("report time", reportTime);

			//取得報告數值
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

			var ignore = ['Lipemia', 'Icterus', 'Hemolysis', 'B/C', 'A/G', 'ctO2c'];
			//確認報告數值正常 確認報告名稱在正確位置
			if (!isNaN(val) &&
				item.replace(/\(|\)/g, " ").search(key.replace(/\(|\)/g, " ")) < 8 &&
				item.replace(/\(|\)/g, " ").search(key.replace(/\(|\)/g, " ")) > 4 &&
				-1 === ignore.indexOf(key)) {
				//console.info(item);
				labs.push({key: key, value: val});
				//將報告名稱存入
				if (-1 === reportClassItems[reportClass].indexOf(key)) {
					reportClassItems[reportClass].push(key);
				}
				//將報告數值存入暫存 因為此時尚末得知報告時間
				tmpReport[key] = val;
				//console.info('report class items', reportClassItems);
			}
		});
		$scope.printReport(report, reportClassItems);
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
			{key: "Band neutrophil",	title: "BandNe"},
			{key: "Metamyelocyte",		title: "Metamy"},
			{key: "Phosphorus",			title: "Phos"},
			{key: "Magnesium",			title: "Mg"},
			{key: "Total Protein",		title: "T-Pro"},
			{key: "Albumin",			title: "Alb"},
			{key: "Amylase (Serum)",	title: "Amylas"},
			{key: "Lipase (Serum)",		title: "Lipase"},
			{key: "eGFR(female)",		title: "eGFR"},
			{key: "eGFR(Male)",			title: "eGFR"},
			{key: "Bilirubin Direct",	title: "Bil-D"},
			{key: "Bilirubin Total",	title: "Bil-T"},
			{key: "Ammonia",			title: "NH3"},
			{key: "Glucose",			title: "Glucos"},
			{key: "Troponin T",			title: "cTnT"},
			{key: "NT-proBNP",			title: "proBNP"},
			{key: "Procalcitonin",		title: "PCT"},
		    {key: "Lactate",			title: "LAC"},
		    {key: "Saturate O2",		title: "SaO2"},
		    {key: "Base Excess",		title: "BE"}
		];

		pair = abbr_map.find(function(item, index, array){
			return item.key === title;
		});
		if (pair != undefined) {
			return pair.title;
		} else {
			return title;
		}
	};
	$scope.printValue = function(report, tmpTitle, reportClass) {
		var output = "";
		report[reportClass].forEach(function(reportItem, reportIndex, reportArray) {
			var lineValue = reportItem.time + " ";
			var hasValue = false;
			tmpTitle.forEach(function(item, index, array) {
				var title = $scope.titleAbbr(item);
				var titleLength = $scope.byteLength(title) > 6 ? $scope.byteLength(title) : 6;
				if (reportItem.hasOwnProperty(item)) {
					hasValue = true;
					lineValue += String(reportItem[item]).padStart(titleLength);
				} else {
					lineValue += "".padStart(titleLength);
				}
				lineValue += " ";
			});
			if (hasValue === true) {
				output += lineValue + "\n";
			}
		});
		return output;
	};
	$scope.byteLength = function (str) {
		// returns the byte length of an utf8 string
	    var s = str.length;
		for (var i=str.length-1; i>=0; i--) {
			var code = str.charCodeAt(i);
			if (code > 0x7f && code <= 0x7ff) s++;
			else if (code > 0x7ff && code <= 0xffff) s+=1;
			if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
		}
		return s;
	};
	$scope.printReport = function(report, reportClassItems) {
		var output = "";
		for(var reportClass in reportClassItems) {
			if (reportClassItems[reportClass].length === 0) {
				continue;
			}
			var lineTitle = "     ";
			var tmpTitle = [];
			output += reportClass + ":\n";
			reportClassItems[reportClass].forEach(function(item, index, array) {
				var title = $scope.titleAbbr(item);
				if ($scope.byteLength(title) < 6) {
					//chinease char can not use padStart
					title = " ".repeat(6 - $scope.byteLength(title)) + title;
				}
				if ($scope.byteLength(lineTitle) + $scope.byteLength(title) >= 77) {
					output += lineTitle + "\n";
					output += $scope.printValue(report, tmpTitle, reportClass);
					lineTitle = "\n     ";
					tmpTitle = [];
				}
				tmpTitle.push(item);
				lineTitle += title + " ";
			});
			output += lineTitle + "\n";
			output += $scope.printValue(report, tmpTitle, reportClass) + "\n";
		}
		$scope.labOutput = output;
	};
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

		//console.info(labs);
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
	$scope.labInput = '';
}]);

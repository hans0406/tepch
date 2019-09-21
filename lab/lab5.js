/* global angular */

angular.module('TpechLab', [])

.controller('TpechLabCtrl', ['$scope', '$http', function($scope, $http) {
	console.info("init");
	$scope.hideBlood = true;
	$scope.hideChemo = true;
	$scope.hiddenReportClass = {};
	$scope.hiddenReportClassChange = {};
	$scope.hiddenList = {};
	$scope.init = function() {
		$scope.reports = {};
		$scope.itemNameList = {
			生化: [],
			血: [],
			血液氣體: [],
			血液凝固: [],
			生化PLE: [],
			血清: [],
			外送項目: [],
			BNprobe: [],
			聯檢血清: [],
			生化尿液: [],
			性防外送: []
		};
		for (i in $scope.itemNameList) {
			$scope.reports[i] = [];
		}
	}
	$scope.onCleanAll = function() {
		$scope.init();
		var s = $scope.labInput;
		var inputLines = s.split("\n");
		var reportClass;
		var reportTime;
		var tmpReport = {};
		var ignore = $scope.ignoredItemName();
		inputLines.forEach(function(inputLine, index, array) {
			var inputLineSplits = inputLine.split(/\s+/);
			reportClass = $scope.updateReportClass(reportClass, inputLineSplits);
			if (!$scope.itemNameList.hasOwnProperty(reportClass)) {
				return;
			}

			if (inputLineSplits[2] === '') {
				return;
			}
			//取得報告時間 將暫存資料存入
			if (inputLineSplits[4] && inputLineSplits[4].startsWith('報告時間：')) {
				reportTime = inputLineSplits[4].substr(8);
				tmpReport.time = reportTime;
				$scope.reports[reportClass].unshift(tmpReport);
				tmpReport = {};
			}
			if (inputLineSplits[5] && inputLineSplits[5].startsWith('報告時間：')) {
				reportTime = inputLineSplits[5].substr(8);
				tmpReport.time = reportTime;
				$scope.reports[reportClass].unshift(tmpReport);
				tmpReport = {};
			}
			var pair = $scope.getItemNameAndValue(inputLineSplits, inputLine);
			var itemName = pair.itemName;
			var val = pair.value;
			//確認報告數值正常 確認報告名稱在正確位置
			if (!isNaN(val) &&
				inputLine.replace(/\(|\)|\+/g, " ").search(itemName.replace(/\(|\)|\+/g, " ")) < 8 &&
				inputLine.replace(/\(|\)|\+/g, " ").search(itemName.replace(/\(|\)|\+/g, " ")) > 4 &&
				-1 === ignore.indexOf(itemName)) {
				//將報告名稱存入
				if (-1 === $scope.itemNameList[reportClass].indexOf(itemName)) {
					$scope.itemNameList[reportClass].push(itemName);
				}
				if (!$scope.hiddenList.hasOwnProperty(reportClass)) {
					$scope.hiddenList[reportClass] = {
						name: [],
						hidden: []
					};
				}
				if (!$scope.hiddenReportClassChange.hasOwnProperty(reportClass)) {
					var change = function(reportClassName) {
						return function() {
							console.info(reportClassName);
							console.info($scope.hiddenList[reportClassName]);
							console.info($scope.hiddenReportClass[reportClassName]);
							$scope.hiddenList[reportClassName].name.forEach(function(itemName, index, array) {
								$scope.hiddenList[reportClassName].hidden[index] = $scope.hiddenReportClass[reportClassName];
							});
						};
					}
					$scope.hiddenReportClassChange[reportClass] = change(reportClass);
				}
				if (-1 === $scope.hiddenList[reportClass].name.indexOf(itemName)) {
					$scope.hiddenList[reportClass].name.push(itemName);
					$scope.hiddenList[reportClass].hidden.push(false);
				}
				//將報告數值存入暫存 因為此時尚末得知報告時間
				tmpReport[itemName] = val;
			}
		});
		$scope.mergeIfIgnoreReportClass();
		$scope.mergeSameTimeReport();
		$scope.sortItemNameList();
		$scope.printReports();
		$scope.printTables();
		console.info($scope.hiddenReportClass, $scope.ignoreReportClass, $scope.hiddenReportClassChange);
	};
	$scope.mergeIfIgnoreReportClass = function() {
		if (true !== $scope.ignoreReportClass) {
			return;
		}
		var newItemList = [];
		var newReports = [];
		for(var reportClass in $scope.itemNameList) {
			newItemList = newItemList.concat($scope.itemNameList[reportClass]);
			newReports = newReports.concat($scope.reports[reportClass]);
		}
		newReports = newReports.sort(function (a, b) {
			return a.time - b.time;
		});
		console.info(newReports);
		$scope.itemNameList = {LAB: newItemList};
		$scope.reports = {LAB: newReports};
	}
	$scope.ignoredItemName = function() {
		var ignore = [];
		if ($scope.hideChemo) {
			ignore = ['Lipemia', 'Icterus', 'Hemolysis', 'B/C', 'A/G', 'ctO2c', 'CKMB%'];
		}
		if ($scope.hideBlood) {
			ignore = ignore.concat(['Hct', 'MCH', 'MCHC', 'RDW-CV', 'RDW-SD', 'Basophil', 'Eos']);
		}
		for (reportClass in $scope.hiddenList) {
			$scope.hiddenList[reportClass].name.forEach(function(itemName, index, array) {
				if ($scope.hiddenList[reportClass].hidden[index]) {
					ignore.push(itemName);
				}
			});
		}
		return ignore;
	};
	$scope.getItemNameAndValue = function(inputLineSplits, inputLine) {
		//取得報告數值
		var val = $scope.isValidValue(inputLineSplits[2], inputLine);
		var itemName = inputLineSplits[1];
		if (isNaN(val) && inputLineSplits[3] !== '') {
			val = $scope.isValidValue(inputLineSplits[3], inputLine);
		}
		if (isNaN(val) && inputLineSplits[4] !== '') {
			val = $scope.isValidValue(inputLineSplits[4], inputLine);
		}
		if (inputLineSplits[2] !== "H" &&
		    inputLineSplits[2] !== "HH" &&
			inputLineSplits[2] !== "L" &&
			inputLineSplits[2] !== "LL" &&
			isNaN($scope.isValidValue(inputLineSplits[2], inputLine)) ) {
			itemName = itemName + " " + inputLineSplits[2];
		}
		return { itemName: itemName, value: val };
	};
	$scope.updateReportClass = function(reportClass, inputLineSplits) {
		//取得報告類別
		if (inputLineSplits[0].startsWith('◆報告類別：')) {
			reportClass = inputLineSplits[0].substr(6);
		}
		if (reportClass === '急診生化') {
			reportClass = '生化';
		}
		return reportClass;
	};
	$scope.sortItemNameList = function() {
		var chemo = $scope.itemNameList['生化'] || $scope.itemNameList.LAB;
		if (!chemo) {
			return;
		}
		var moveToFirst = function(data, item) {
			if (data.indexOf(item) > 0) {
			    data.splice(data.indexOf(item), 1);
				data.unshift(item);
			}
		}
		moveToFirst(chemo, 'ALT');
		moveToFirst(chemo, 'AST');
		moveToFirst(chemo, 'NT-proBNP');
		moveToFirst(chemo, 'Procalcitonin');
		moveToFirst(chemo, 'CRP');
		moveToFirst(chemo, 'Lactate');
		moveToFirst(chemo, 'Bilirubin Direct');
		moveToFirst(chemo, 'Bilirubin Total');
		moveToFirst(chemo, 'eGFR(Male)');
		moveToFirst(chemo, 'eGFR(female)');
		moveToFirst(chemo, 'Creatinine');
		moveToFirst(chemo, 'BUN');
		moveToFirst(chemo, 'K');
		moveToFirst(chemo, 'Na');
	};
	$scope.mergeSameTimeReport = function() {
		for(var reportClass in $scope.reports) {
			var mergeReport = [];
			var tmpReport, time;
			$scope.reports[reportClass].forEach(function(eachReport, index, array){
				if (time !== eachReport.time) {
					if (tmpReport) {
						mergeReport.push(tmpReport);
					}
					tmpReport = eachReport;
					time = eachReport.time;
					return;
				}
				for (var itemName in tmpReport) {
					if (itemName === 'time') {
						continue;
					}
					if (eachReport.hasOwnProperty(itemName)) {
						mergeReport.push(tmpReport);
						tmpReport = eachReport;
						time = eachReport.time;
						return;
					}
				}
				for (var itemName in eachReport) {
					tmpReport[itemName] = eachReport[itemName];
				}
			});
			if (tmpReport) {
				mergeReport.push(tmpReport);
			}
			$scope.reports[reportClass] = mergeReport;
		}
	}
	$scope.isValidValue = function(input, line) {
		var val = NaN;
		// CRP >80 is valid, will change to 80
		if (input && ">" === input[0]) {
			input = input.substring(1);
		};
		var val = Number(input);
		if (line && input &&
			line.replace(/\(|\)|\+/g, " ").search(input.replace(/\(|\)|\+/g, " ")) > 26 &&
			line.replace(/\(|\)|\+/g, " ").search(input.replace(/\(|\)|\+/g, " ")) < 33) {
			return val;
		}
		return NaN;
	};
	$scope.itemNameAbbr = function(itemName) {
		var abbr_map = [
			{key: "Prothrombin Time",	title: "PT"},
			{key: "Creatinine",			title: "Cr"},
			{key: "Platelet",			title: "Plt"},
			{key: "Alk Phosphotase",	title: "Alk-P"},
			{key: "Basophil",			title: "Baso"},
			{key: "Band neutrophil",	title: "BndNu"},
			{key: "Metamyelocyte",		title: "Metmy"},
			{key: "Phosphorus",			title: "Phos"},
			{key: "Magnesium",			title: "Mg"},
			{key: "Total Protein",		title: "T-Pro"},
			{key: "Albumin",			title: "Alb"},
			{key: "Cholesterol",		title: "Chols"},
			{key: "Triglyceride",		title: "TG"},
			{key: "Amylase (Serum)",	title: "Amyls"},
			{key: "Lipase (Serum)",		title: "Lipas"},
			{key: "eGFR(female)",		title: "eGFR"},
			{key: "eGFR(Male)",			title: "eGFR"},
			{key: "Bilirubin Direct",	title: "Bil-D"},
			{key: "Bilirubin Total",	title: "Bil-T"},
			{key: "Ammonia",			title: "NH3"},
			{key: "Glucose",			title: "Gluco"},
			{key: "Troponin T",			title: "cTnT"},
			{key: "NT-proBNP",			title: "prBNP"},
			{key: "Procalcitonin",		title: "PCT"},
		    {key: "Lactate",			title: "LAC"},
		    {key: "Saturate O2",		title: "SaO2"},
		    {key: "Base Excess",		title: "BE"}
		];

		pair = abbr_map.find(function(item, index, array){
			return item.key === itemName;
		});
		if (pair != undefined) {
			return pair.title;
		} else {
			return itemName;
		}
	};
	$scope.printValue = function(printedItemNames, reportClass) {
		var output = "";
		$scope.reports[reportClass].forEach(function(report, reportIndex, reportArray) {
			var valueLine = report.time + " ";
			var hasValue = false;
			printedItemNames.forEach(function(itemName, index, array) {
				var abbrName = $scope.itemNameAbbr(itemName);
				var abbrNameLength = $scope.byteLength(abbrName);
				var columnLength = abbrNameLength > 6 ? abbrNameLength : 6;
				if (report.hasOwnProperty(itemName)) {
					hasValue = true;
					valueLine += String(report[itemName]).padStart(columnLength);
				} else {
					valueLine += "".padStart(columnLength);
				}
				valueLine += " ";
			});
			if (hasValue === true) {
				output += valueLine + "\n";
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
	$scope.printTables = function() {
		var tableResults = {};
		for(var reportClass in $scope.itemNameList) {
			if ($scope.itemNameList[reportClass].length === 0) {
				continue;
			}
			tableResults[reportClass] = {};
			tableResults[reportClass].heads = ['date'].concat($scope.itemNameList[reportClass]);
			tableResults[reportClass].results = [];
			$scope.reports[reportClass].forEach(function(report, reportIndex, reportArray) {
				var result = [report.time];
				var hasValue = false;
				$scope.itemNameList[reportClass].forEach(function(itemName, index, array) {
					if (report.hasOwnProperty(itemName)) {
						result.push(report[itemName]);
						hasValue = true;
					} else {
						result.push('');
					}
				});
				if (hasValue) {
					tableResults[reportClass].results.push(result);
				}
			});
		}
		$scope.tableResults = tableResults;
	};
	$scope.printReports = function() {
		var output = "";
		for(var reportClass in $scope.itemNameList) {
			if ($scope.itemNameList[reportClass].length === 0) {
				continue;
			}
			var titleLine = "     ";
			var toPrintItemNames = [];
			output += reportClass + ":\n";
			$scope.itemNameList[reportClass].forEach(function(itemName, index, array) {
				var abbrName = $scope.itemNameAbbr(itemName);
				var abbrNameLength = $scope.byteLength(abbrName);
				if (abbrNameLength < 6) {
					//chinease char can not use padStart
					abbrName = " ".repeat(6 - abbrNameLength) + abbrName;
				}
				if ($scope.byteLength(titleLine) + abbrNameLength >= 77) {
					//if > 77 print title(item name) in first line
					//and print report value in each line
					output += titleLine + "\n";
					output += $scope.printValue(toPrintItemNames, reportClass);
					titleLine = "\n     ";
					toPrintItemNames = [];
				}
				toPrintItemNames.push(itemName);
				titleLine += abbrName + " ";
			});
			output += titleLine + "\n";
			output += $scope.printValue(toPrintItemNames, reportClass);
		}
		$scope.labOutput = output;
	};
	$scope.hiddenReportClassChange = function() {
		console.info(arguments);
	};
	$scope.labInput = 
	'◆報告類別：急診生化\n\
|備註:\n\
|---------------------------------------------------------------------------\n\
|      項  目  名  稱         結果值       單位         參考值範圍\n\
      BUN                    H 25.0      mg/dl     5.0    -  24.0\n\
      Creatinine               0.7       mg/dl     0.7    -  1.2\n\
                                         請注意:自105/03/09日參考值更改\n\
      GFR\n\
      eGFR(Male)               115.400   ml/min/1.73m2\n\
          公式=175*Scr^-1.154*Age^-0.203\n\
      Bilirubin Total        H 1.60      mg/dl     0.20   -  1.20\n\
      Na                     L 129       mEq/L     135    -  148\n\
      K                        4.1       mEq/L     3.5    -  5.1\n\
                                         請注意:自105/03/09日參考值更改\n\
      AST                      37        U/L       10     -  42\n\
      ALT                      29        U/L       7      -  42\n\
|報告者: 徐忠揚 檢字第021695號\n\
|---------------------------------------------------------------------------\n\
|***完整報告****                                             頁次:001\n\
報告者：A4866 徐忠揚 檢字第021695號 申請日：1071114 報告時間：1071115 0707\n\n\
◆報告類別：急診生化 \n\
|備註: 採檢時間:107/11/12 06:28人員:B2904\n\
|---------------------------------------------------------------------------\n\
|      項  目  名  稱         結果值       單位         參考值範圍\n\
      Ammonia                  59        ug/dl     19     -  60\n\
                                         請注意:自105/03/09日參考值更改\n\
|報告者: 呂瑞禎 檢字第008459號\n\
|---------------------------------------------------------------------------\n\
|***完整報告****                                             頁次:001\n\
報告者：A3138 呂瑞禎 檢字第008459號 申請日：1071110 報告時間：1071112 0644 \n\n\
◆報告類別：急診生化 \n\
|備註: 採檢時間:107/11/09 05:35人員:B0116\n\
|---------------------------------------------------------------------------\n\
|      項  目  名  稱         結果值       單位         參考值範圍\n\
      Ammonia                H 69        ug/dl     19     -  60\n\
                                         請注意:自105/03/09日參考值更改\n\
|報告者: 汪柏均 檢字第014489號\n\
|---------------------------------------------------------------------------\n\
|***完整報告****                                             頁次:001\n\
報告者：A4248 汪柏均 檢字第014489號 申請日：1071108 報告時間：1071109 0557';
}]);

/* global angular */

myapp = angular.module('TpechLab', ['ui.sortable'])
.controller('TpechLabCtrl', ['$scope', '$http', function($scope, $http) {
	$scope.hideBlood = true;
	$scope.hideChemo = true;
	$scope.table1 = {
		title: "生化",
		reports: [],
		unselected: [],
		selected: []
	};
	$scope.table2 = {
		title: "血",
		reports: [],
		unselected: [],
		selected: []
	};
	$scope.table3 = {
		title: "其他",
		reports: [],
		unselected: [],
		selected: []
	};
	$scope.tables = [];
	$scope.tables.push($scope.table1);
	$scope.tables.push($scope.table2);
	$scope.tables.push($scope.table3);

	$scope.table1Options = {
		connectWith: '.connectedTable1 .list'
	};
	$scope.table2Options = {
		connectWith: '.connectedTable2 .list'
	};
	$scope.table3Options = {
		connectWith: '.connectedTable3 .list'
	};
	$scope.init = function() {
		$scope.reportClasses= {
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
		for (var i = 0; i < $scope.tables.length; i++) {
			$scope.tables[i].reports = [];
			delete $scope.tables[i].tmpReport;
		}
	};
	$scope.onCleanAll = function() {
		$scope.init();
		$scope.parseInputAndAddNewItemName();
		$scope.sortUnselected();
		$scope.mergeSameTimeReport();
		$scope.printTextField();
		$scope.printTableFields();
	};
	$scope.parseInputAndAddNewItemName = function() {
		var s = $scope.labInput;
		var inputLines = s.split("\n");
		var reportClass;
		var reportTime;
		for (var i=0; i < $scope.tables.length; i++) {
			var table = $scope.tables[i];
			table.tmpReport =  {
				isEmpty: true
			};
		}
		var ignore = $scope.ignoredItemName();
		inputLines.forEach(function(inputLine, index, array) {
			var inputLineSplits = inputLine.split(/\s+/);
			reportClass = $scope.updateReportClass(reportClass, inputLineSplits);
			if (!$scope.reportClasses.hasOwnProperty(reportClass)) {
				return;
			}

			if (inputLineSplits[2] === '') {
				return;
			}
			//取得報告時間 將暫存資料存入
			if (inputLineSplits[4] && inputLineSplits[4].startsWith('報告時間：')) {
				reportTime = inputLineSplits[4].substr(8);
				$scope.addTmpReport(reportTime);
			}
			if (inputLineSplits[5] && inputLineSplits[5].startsWith('報告時間：')) {
				reportTime = inputLineSplits[5].substr(8);
				$scope.addTmpReport(reportTime);
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
				$scope.addNewItemNameToTables(itemName, reportClass);
				
				//將報告數值存入暫存 因為此時尚末得知報告時間
				for (var i=0; i < $scope.tables.length; i++) {
					var table = $scope.tables[i];
					for (var j=0; j < table.selected.length; j++) {
						if (itemName === table.selected[j].text) {
							table.tmpReport[itemName] = val;
							table.tmpReport.isEmpty = false;
						}
					}
				}
			}
		});
	};
	// TODO debug function
	/*
	$scope.debugPrintReports = function() {
		for (var i=0; i < $scope.tables.length; i++) {
			var table = $scope.tables[i];
			console.info("DEBUG title: ", table.title);
			console.info("DEBUG tmpReport:", JSON.stringify(table.tmpReport));
			for (var j=0; j < table.reports.length; j++) {
				console.info("DEBUG index, report:", j, JSON.stringify(table.reports[j]));
			}
		}
	};
	*/
	$scope.addTmpReport = function(reportTime) {
		for (var i=0; i < $scope.tables.length; i++) {
			var table = $scope.tables[i];
			table.tmpReport.time = reportTime;
			if (false === table.tmpReport.isEmpty) {
				delete table.tmpReport.isEmpty;
				table.reports.unshift(table.tmpReport);
				table.tmpReport = {
					isEmpty: true
				};
			}
		}
	};
	$scope.sortUnselected = function() {
		var i;
		$scope.tables.forEach(function(table, index, array) {
			table.unselected = table.unselected.sort(function(a, b) {
				return a.text.localeCompare(b.text);
			});
		});
	};
	$scope.addNewItemNameToTables = function(itemName, reportClass) {
		for (var i=0; i < $scope.tables.length; i++) {
			$scope.addNewItemNameToTable($scope.tables[i], itemName, reportClass);
		}
	};
	$scope.addNewItemNameToTable = function(table, itemName, reportClass) {
		var newItemName = {
			text: itemName,
			value: itemName
		};
		for (var i=0; i < table.unselected.length; i++) {
			if (itemName === table.unselected[i].text) {
				return;
			}
		}
		for (var i=0; i < table.selected.length; i++) {
			if (itemName === table.selected[i].text) {
				return;
			}
		}
		if (table.title === reportClass) {
			table.selected.push(newItemName);
			return;
		}
		if (table.title === "其他") {
			for (var j=0; j < $scope.tables.length; j++) {
				if (reportClass === $scope.tables[j].title) {
					table.unselected.push(newItemName);
					return;
				}
			}
			table.selected.push(newItemName);
			return;
		}
		table.unselected.push(newItemName);
	};
	$scope.ignoredItemName = function() {
		var ignore = [];
		if ($scope.hideChemo) {
			ignore = ['Lipemia', 'Icterus', 'Hemolysis', 'B/C', 'A/G', 'ctO2c', 'CKMB%'];
		}
		if ($scope.hideBlood) {
			ignore = ignore.concat(['Hct', 'MCH', 'MCHC', 'RDW-CV', 'RDW-SD', 'Basophil', 'Eos']);
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
		if (reportClass === '急診生化' ||
			reportClass === '生化手工組') {
			reportClass = '生化';
		}
		if (reportClass === 'CBC') {
			reportClass = '血';
		}
		return reportClass;
	};
	$scope.mergeSameTimeReport = function() {
		for (var i=0; i < $scope.tables.length; i++) {
			var table = $scope.tables[i];
			var mergeReports = [];
			var tmpReport, time;
			table.reports.forEach(function(report, index, array){
				if (time !== report.time) {
					if (tmpReport) {
						mergeReports.push(tmpReport);
					}
					tmpReport = report;
					time = report.time;
					return;
				}
				for (var itemName in tmpReport) {
					if (itemName === 'time') {
						continue;
					}
					if (report.hasOwnProperty(itemName)) {
						mergeReports.push(tmpReport);
						tmpReport = report;
						time = report.time;
						return;
					}
				}
				for (var itemName in report) {
					tmpReport[itemName] = report[itemName];
				}
			});
			if (tmpReport) {
				mergeReports.push(tmpReport);
			}
			table.reports = mergeReports;
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
	$scope.getSelectedAndUsedItemNames = function(table) {
		var usedItemNames = []
		for (var i=0; i < table.selected.length; i++) {
			var itemName = table.selected[i].text;
			for (var j=0; j < table.reports.length; j++) {
				var report = table.reports[j];
				if (report.hasOwnProperty(itemName)) {
					usedItemNames.push(itemName);
					break;
				}
			}
		}
		return usedItemNames;
	};
	$scope.printValueLine = function(printedItemNames, table) {
		var output = "";
		table.reports.forEach(function(report, reportIndex, reportArray) {
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
		for (var i = str.length-1; i>=0; i--) {
			var code = str.charCodeAt(i);
			if (code > 0x7f && code <= 0x7ff) s++;
			else if (code > 0x7ff && code <= 0xffff) s+=1;
			if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
		}
		return s;
	};
	$scope.printTableFields = function() {
		var tableFields = [];
		for (var i=0; i < $scope.tables.length; i++) {
			var table = $scope.tables[i];
			var mustPrintItemNames = $scope.getSelectedAndUsedItemNames(table);
			if (mustPrintItemNames.length === 0) {
				continue;
			}
			var tableField = {
				title: table.title,
				rows: [[""]]
			}
			tableFields.push(tableField);
			//rows.length == mustPrintItemNames.length+1
			for (var j=0; j < mustPrintItemNames.length; j++) {
				tableField.rows.push([mustPrintItemNames[j]]);
			}
			table.reports.forEach(function(report, reportIndex, reportArray) {
				var hasValue = false;
				for (var j=1; j < tableField.rows.length; j++) {
					if (report.hasOwnProperty(tableField.rows[j][0])) {
						hasValue = true;
					}
				}
				if (false === hasValue) {
					return;
				}
				tableField.rows[0].push(report.time);
				for (var j=1; j < tableField.rows.length; j++) {
					if (report.hasOwnProperty(tableField.rows[j][0])) {
						tableField.rows[j].push(report[tableField.rows[j][0]]);
					} else {
						tableField.rows[j].push("");
					}
				}
			});
		}
		$scope.tableFields= tableFields;
	};
	$scope.printTextField = function() {
		var output = "";
		for (var i=0; i < $scope.tables.length; i++) {
			var table = $scope.tables[i];
			var mustPrintItemNames = $scope.getSelectedAndUsedItemNames(table);
			if (mustPrintItemNames.length === 0) {
				continue;
			}
			var titleLine = "     ";
			var toPrintItemNames = [];
			output += table.title + ":\n";
			mustPrintItemNames.forEach(function(itemName, index, array) {
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
					output += $scope.printValueLine(toPrintItemNames, table);
					titleLine = "\n     ";
					toPrintItemNames = [];
				}
				toPrintItemNames.push(itemName);
				titleLine += abbrName + " ";
			});
			output += titleLine + "\n";
			output += $scope.printValueLine(toPrintItemNames, table);
		}
		$scope.textField = output;
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
報告者：A4248 汪柏均 檢字第014489號 申請日：1071108 報告時間：1071109 0557\n\
◆報告類別：CBC \n\
|備註:\n\
|---------------------------------------------------------------------------\n\
|      項  目  名  稱         結果值       單位         參考值範圍\n\
      Prothrombin time         10.7      sec       8.0    -  12.0\n\
      INR                      1.03                0.85   -  1.15\n\
      APTT                     29.9      sec       23.9   -  35.5\n\
|報告者: 范姜素貞 檢字第005378號\n\
|---------------------------------------------------------------------------\n\
|***Discipline final                                         頁次:001\n\
報告者：A1352-范姜素貞 范姜素貞 檢字第005378號 申請日：1080426 報告時間：1080426 1534 \n\
◆報告類別：血  液 \n\
|備註: 採檢時間:107/12/04 05:34人員:B0093\n\
|---------------------------------------------------------------------------\n\
|      項  目  名  稱         結果值       單位         參考值範圍\n\
[血液檢查報告]\n\
      WBC                    L 2.56      10^3/ul   3.54   -  9.06\n\
      RBC                    L 3.30      10^6/ul   4.00   -  5.52\n\
      Hb                     L 10.2      g/dl      13.2   -  17.2\n\
      Hct                    L 30.5      %         40.4   -  51.1\n\
      MCV                      92.4      fL        80.0   -  100.0\n\
      MCH                      30.9      pg        26.0   -  34.0\n\
      MCHC                     33.4      g/dl      31.0   -  37.0\n\
      RDW-CV                   11.9      %         11.9   -  14.5\n\
      RDW-SD                   40.4      fl\n\
      Platelet                 209       10^3/ul   148    -  339\n\
      Neut                     68.3      %         41.2   -  74.7\n\
      Lym                    L 13.7      %         21.2   -  51.0\n\
      Mono                   H 11.7      %         3.1    -  8.0\n\
      Eos                      5.1       %         0.2    -  8.4\n\
      Basophil                 1.2       %         0.2    -  1.8\n\
|報告者: 蔣依庭 檢字第020858號\n\
|---------------------------------------------------------------------------\n\
|***完整報告****                                             頁次:001\n\
報告者：A4448 蔣依庭 檢字第020858號 申請日：1071203 報告時間：1071204 0626\n\
◆報告類別：生化手工組 \n\
|備註: _\n\
|---------------------------------------------------------------------------\n\
|      項  目  名  稱         結果值       單位         參考值範圍\n\
      HbA1C                  H 7.2       %         4.0    -  6.0\n\
|報告者: 聯合檢驗中心 李青青 檢字第009349號\n\
|---------------------------------------------------------------------------\n\
|***完整報告****                                             頁次:001\n\
\n\
報告者：Z2017-李青青 聯合檢驗中心 李青青 檢字第009349號 申請日：1080107 報告時間：1080402 0857 \n\
◆報告類別：血清 \n\
|備註: 採檢時間:107/12/20 06:11人員:B3534\n\
|---------------------------------------------------------------------------\n\
|      項  目  名  稱         結果值       單位         參考值範圍\n\
      AFP                      1.70      ng/ml     <7.00  -\n\
      CEA                    H 2264.0    ng/ml    0-5.0 ng/ml\n\
			                                      (smoker<=6.5 ng/ml\n\
      CA 199                 H 14241.00  U/ml      <27.00    -\n\
|報告者: 聯合檢驗中心 江雅玲 檢字第010839號\n\
|---------------------------------------------------------------------------\n\
|***完整報告****                                             頁次:001\n\
報告者：A2711 聯合檢驗中心 江雅玲 檢字第010839號 申請日：1071219 報告時間：1071220 1336 \n\
';
}]);


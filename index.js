// path for required node modules

var program = require("commander");
var path = require("path");
//csv parser
var csv_parse = require("babyparse");
var csv = require("fast-csv");
var fs = require("fs");
var moment = require("moment");
var transform = require("stream").Transform;
// angular module for validation
//var app = angular.module('csvApp', ['controller']);

// program for creating cmd line inputs
program
	.version('0.0.1')
	.option('-r, --readfile [path]', 'given a path to a csv file, open and read the contents of that file', getPath, "")
	.parse(process.argv);


// basic rules for a valid csv file: the column head, the format of info under column head, sequences of columns, etc
var csv_headers = {
				'HEALTH CARD NUMBER':{'format':'string', 'mand':false, 'seq': 1},
				'FIRST NAME': {'format':'string', 'mand':true, 'seq':2},
				'MIDDLE NAME': {'format':'string', 'mand':false, 'seq':3},
				'LAST NAME': {'format':'string', 'mand':true, 'seq':4}, 
				'DATE OF BIRTH': {'format':'date', 'mand':true, 'seq':5}, 
				'GENDER': {'format':'string', 'mand':true, 'seq':6},
				'ADDRESS TYPE': {'format':'string', 'mand':false, 'seq':7},
				'UNIT NUMBER': {'format':'string', 'mand':false, 'seq':8},
				'STREET NUMBER': {'format':'string', 'mand':false, 'seq':9},
				'STREET NAME': {'format':'string', 'mand':false, 'seq':10},
				'STREET TYPE': {'format':'string', 'mand':false, 'seq':11},
				'STREET DIRECTION': {'format':'string', 'mand':false, 'seq':12},
				'PO BOX': {'format':'string', 'mand':false, 'seq':13},
				'STN': {'format':'string', 'mand':false, 'seq':14},
				'RPO': {'format':'string', 'mand':false, 'seq':15},
				'RURAL ROUTE': {'format':'string', 'mand':false, 'seq':16},
				'PROVINCE/TERRITORY': {'format':'string', 'mand':false, 'seq':17},
				'CITY': {'format':'string', 'mand':false, 'seq':18},
				'POSTAL CODE': {'format':'string', 'mand':false, 'seq':19},
				'SCHOOL/DAY CARE': {'format':'string', 'mand':false, 'seq':20},
				'SUBMITTER FIRST NAME': {'format':'string', 'mand':false, 'seq':21},
				'SUBMITTER LAST NAME': {'format':'string', 'mand':false, 'seq':22},
				'SUBMITTER RELATIONSHIP': {'format':'string', 'mand':false, 'seq':23},
				'SUBMITTER PHONE NUMBER 1 TYPE': {'format':'string', 'mand':false, 'seq':24},
				'SUBMITTER PHONE NUMBER 1': {'format':'string', 'mand':false, 'seq':25},
				'SUBMITTER PHONE NUMBER 2 TYPE': {'format':'string', 'mand':false, 'seq':26},
				'SUBMITTER PHONE NUMBER 2': {'format':'string', 'mand':false, 'seq':27},
				'SUBMITTER EMAIL': {'format':'string', 'mand':false, 'seq':28},
				'IMMUNIZATION DATE': {'format':'date', 'mand':true, 'seq':29},
				'IMMUNIZING AGENT': {'format':'string', 'mand':true, 'seq':30},
				'OTHER DETAILS': {'format':'string', 'mand':false, 'seq':31}};
var immunAgent = 
[{"CONCEPT_DESCRIPTION":"Anth","CONCEPT_CODE":333521006},
{"CONCEPT_DESCRIPTION":"BAtx","CONCEPT_CODE":86080005},
{"CONCEPT_DESCRIPTION":"BCG vaccine","CONCEPT_CODE":418268006},
{"CONCEPT_DESCRIPTION":"BIG-IV","CONCEPT_CODE":416653007},
{"CONCEPT_DESCRIPTION":"CMVIg","CONCEPT_CODE":9778000},
{"CONCEPT_DESCRIPTION":"Chol","CONCEPT_CODE":35736007},
{"CONCEPT_DESCRIPTION":"Chol-Ecol-O","CONCEPT_CODE":7721000087106},
{"CONCEPT_DESCRIPTION":"D","CONCEPT_CODE":7701000087100},
{"CONCEPT_DESCRIPTION":"DAtx","CONCEPT_CODE":77048008},
{"CONCEPT_DESCRIPTION":"DPT","CONCEPT_CODE":7831000087100},
{"CONCEPT_DESCRIPTION":"DPT-HB","CONCEPT_CODE":20601000087103},
{"CONCEPT_DESCRIPTION":"DPT-HB-Hib","CONCEPT_CODE":20591000087106},
{"CONCEPT_DESCRIPTION":"DPT-Hib","CONCEPT_CODE":8211000087108},
{"CONCEPT_DESCRIPTION":"DPT-IPV","CONCEPT_CODE":7871000087103},
{"CONCEPT_DESCRIPTION":"DPTP","CONCEPT_CODE":7861000087107},
{"CONCEPT_DESCRIPTION":"DPTP-Hib","CONCEPT_CODE":8221000087100},
{"CONCEPT_DESCRIPTION":"DT","CONCEPT_CODE":7921000087109},
{"CONCEPT_DESCRIPTION":"DT-IPV","CONCEPT_CODE":7901000087103},
{"CONCEPT_DESCRIPTION":"DTaP","CONCEPT_CODE":7841000087106},
{"CONCEPT_DESCRIPTION":"DTaP-HB-IPV-Hib","CONCEPT_CODE":7731000087108},
{"CONCEPT_DESCRIPTION":"DTaP-IPV","CONCEPT_CODE":7881000087101},
{"CONCEPT_DESCRIPTION":"DTaP-IPV-Hib","CONCEPT_CODE":7931000087106},
{"CONCEPT_DESCRIPTION":"H1N1-unspecified","CONCEPT_CODE":443651005},
{"CONCEPT_DESCRIPTION":"HA","CONCEPT_CODE":14745005},
{"CONCEPT_DESCRIPTION":"HA-Typh-I","CONCEPT_CODE":333707007},
{"CONCEPT_DESCRIPTION":"HAHB","CONCEPT_CODE":333702001},
{"CONCEPT_DESCRIPTION":"HB","CONCEPT_CODE":8771000087109},
{"CONCEPT_DESCRIPTION":"HB (dialysis)","CONCEPT_CODE":8781000087106},
{"CONCEPT_DESCRIPTION":"HB-unspecified","CONCEPT_CODE":34689006},
{"CONCEPT_DESCRIPTION":"HBIg","CONCEPT_CODE":9542007},
{"CONCEPT_DESCRIPTION":"HPV-2","CONCEPT_CODE":7791000087109},
{"CONCEPT_DESCRIPTION":"HPV-4","CONCEPT_CODE":7801000087108},
{"CONCEPT_DESCRIPTION":"HPV-9","CONCEPT_CODE":20861000087100},
{"CONCEPT_DESCRIPTION":"Hib","CONCEPT_CODE":333680004},
{"CONCEPT_DESCRIPTION":"IPV","CONCEPT_CODE":125688000},
{"CONCEPT_DESCRIPTION":"Ig","CONCEPT_CODE":333711001},
{"CONCEPT_DESCRIPTION":"Inf","CONCEPT_CODE":7691000087100},
{"CONCEPT_DESCRIPTION":"JE","CONCEPT_CODE":333697005},
{"CONCEPT_DESCRIPTION":"LYM","CONCEPT_CODE":116083002},
{"CONCEPT_DESCRIPTION":"M","CONCEPT_CODE":386012008},
{"CONCEPT_DESCRIPTION":"MMR","CONCEPT_CODE":61153008},
{"CONCEPT_DESCRIPTION":"MMR-Var","CONCEPT_CODE":419550004},
{"CONCEPT_DESCRIPTION":"MR","CONCEPT_CODE":7281000087100},
{"CONCEPT_DESCRIPTION":"Men-B","CONCEPT_CODE":19461000087101},
{"CONCEPT_DESCRIPTION":"Men-C-ACYW135","CONCEPT_CODE":7121000087107},
{"CONCEPT_DESCRIPTION":"Men-C-C","CONCEPT_CODE":359068008},
{"CONCEPT_DESCRIPTION":"Men-P-ACYW135","CONCEPT_CODE":7101000087101},
{"CONCEPT_DESCRIPTION":"Mu","CONCEPT_CODE":7291000087103},
{"CONCEPT_DESCRIPTION":"OPV","CONCEPT_CODE":125690004},
{"CONCEPT_DESCRIPTION":"PLAG","CONCEPT_CODE":11866009},
{"CONCEPT_DESCRIPTION":"PPD","CONCEPT_CODE":423321003},
{"CONCEPT_DESCRIPTION":"Pneu-C-10","CONCEPT_CODE":7661000087108},
{"CONCEPT_DESCRIPTION":"Pneu-C-13","CONCEPT_CODE":448964007},
{"CONCEPT_DESCRIPTION":"Pneu-C-7","CONCEPT_CODE":125714002},
{"CONCEPT_DESCRIPTION":"Pneu-P-23","CONCEPT_CODE":7251000087108},
{"CONCEPT_DESCRIPTION":"R","CONCEPT_CODE":386013003},
{"CONCEPT_DESCRIPTION":"RSVAb","CONCEPT_CODE":108725001},
{"CONCEPT_DESCRIPTION":"RV1","CONCEPT_CODE":7811000087105},
{"CONCEPT_DESCRIPTION":"RV5","CONCEPT_CODE":7821000087102},
{"CONCEPT_DESCRIPTION":"Rab","CONCEPT_CODE":3526007},
{"CONCEPT_DESCRIPTION":"RabIg","CONCEPT_CODE":80834004},
{"CONCEPT_DESCRIPTION":"Sma","CONCEPT_CODE":33234009},
{"CONCEPT_DESCRIPTION":"T","CONCEPT_CODE":333621002},
{"CONCEPT_DESCRIPTION":"T-IPV","CONCEPT_CODE":7751000087104},
{"CONCEPT_DESCRIPTION":"TBE","CONCEPT_CODE":333699008},
{"CONCEPT_DESCRIPTION":"TIg","CONCEPT_CODE":86337009},
{"CONCEPT_DESCRIPTION":"Td","CONCEPT_CODE":59999009},
{"CONCEPT_DESCRIPTION":"Td-IPV","CONCEPT_CODE":7911000087101},
{"CONCEPT_DESCRIPTION":"Tdap","CONCEPT_CODE":7851000087109},
{"CONCEPT_DESCRIPTION":"Tdap-IPV","CONCEPT_CODE":7891000087104},
{"CONCEPT_DESCRIPTION":"Typh-I","CONCEPT_CODE":412324003},
{"CONCEPT_DESCRIPTION":"Typh-O","CONCEPT_CODE":346696005},
{"CONCEPT_DESCRIPTION":"Var","CONCEPT_CODE":108729007},
{"CONCEPT_DESCRIPTION":"VarIg","CONCEPT_CODE":62294009},
{"CONCEPT_DESCRIPTION":"YF","CONCEPT_CODE":56844000},
{"CONCEPT_DESCRIPTION":"Zoster","CONCEPT_CODE":407737004},
{"CONCEPT_DESCRIPTION":"aP","CONCEPT_CODE":7771000087105},
{"CONCEPT_DESCRIPTION":"ap","CONCEPT_CODE":7781000087107},
{"CONCEPT_DESCRIPTION":"ap-unspecified","CONCEPT_CODE":449019003},
{"CONCEPT_DESCRIPTION":"d","CONCEPT_CODE":7741000087102},
{"CONCEPT_DESCRIPTION":"d-unspecified","CONCEPT_CODE":428214002},
{"CONCEPT_DESCRIPTION":"hpv-unspecified","CONCEPT_CODE":424519000},
{"CONCEPT_DESCRIPTION":"inf-unspecified","CONCEPT_CODE":46233009},
{"CONCEPT_DESCRIPTION":"men-AC unspecified","CONCEPT_CODE":421281005},
{"CONCEPT_DESCRIPTION":"men-ACYW135 unspecified","CONCEPT_CODE":420261000},
{"CONCEPT_DESCRIPTION":"men-c-unspecified","CONCEPT_CODE":8231000087103},
{"CONCEPT_DESCRIPTION":"men-p-A unspecified","CONCEPT_CODE":7711000087103},
{"CONCEPT_DESCRIPTION":"men-p-AC unspecified","CONCEPT_CODE":7091000087106},
{"CONCEPT_DESCRIPTION":"men-p-unspecified","CONCEPT_CODE":8241000087109},
{"CONCEPT_DESCRIPTION":"men-unspecified","CONCEPT_CODE":423531006},
{"CONCEPT_DESCRIPTION":"p-unspecified","CONCEPT_CODE":111164008},
{"CONCEPT_DESCRIPTION":"pertussis-unspecified","CONCEPT_CODE":61602008},
{"CONCEPT_DESCRIPTION":"pneu-c-unspecified","CONCEPT_CODE":7261000087106},
{"CONCEPT_DESCRIPTION":"pneu-p-unspecified","CONCEPT_CODE":135642004},
{"CONCEPT_DESCRIPTION":"pneu-unspecified","CONCEPT_CODE":333598008},
{"CONCEPT_DESCRIPTION":"rota-unspecified","CONCEPT_CODE":116077000},
{"CONCEPT_DESCRIPTION":"typh-unspecified","CONCEPT_CODE":89428009},
{"CONCEPT_DESCRIPTION":"wP","CONCEPT_CODE":7761000087101}];
// luhnChk for health card validation
var luhnChk = function (value) {
  // accept only digits, dashes or spaces
	if (/[^0-9-\s]+/.test(value)) return false;

	// The Luhn Algorithm. It's so pretty.
	var nCheck = 0, nDigit = 0, bEven = false;
	value = value.replace(/\D/g, "");

	for (var n = value.length - 1; n >= 0; n--) {
		var cDigit = value.charAt(n),
			  nDigit = parseInt(cDigit, 10);

		if (bEven) {
			if ((nDigit *= 2) > 9) nDigit -= 9;
		}

		nCheck += nDigit;
		bEven = !bEven;
	}

	return (nCheck % 10) == 0;
	};
function isValidDate(dateString)
{
    // First check for the pattern
    var regex_date = /^\d{4}\-\d{1,2}\-\d{1,2}$/;

    if(!regex_date.test(dateString))
    {
        return false;
    }

    // Parse the date parts to integers
    var parts   = dateString.split("-");
    var day     = parseInt(parts[2], 10);
    var month   = parseInt(parts[1], 10);
    var year    = parseInt(parts[0], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
    {
        return false;
    }

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
    {
        monthLength[1] = 29;
    }

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
}

function parsefile(data, count, cause, validRec, invalidRec){
	//console.log(data);
	// if count is 1, then the we're at the header. Check the header for problems.
	if (count == 1){
		console.log(validcolumns(data));
		if (validcolumns(data)){
		}
		else{
			cause.push("The header row does not meet PHIX file specifications");
			return false
		}
	}
	// else, validate that row. keep track of count
	else {
		var validity = validData(data, count);
		//console.log(validity);
		// if the data is valid, push it to valid record array
		if (validity.length == 0){
			validRec.push(data);
		}
		else {
			invalidRec.push(data);
			var details = "";
			details += "Row " + count + ":" + "\n";
			for (var casee in validity){
				details += validity[casee].location + " " + validity[casee].reason + "\n";
			}
			cause.push(details);
		}
	}
}
// for the column heads to be valid, all the mandatory heads must be in the head and all the column heads
// are in sequence
function validcolumns(columns){
	var mand_list = getMandHead(csv_headers);
	var header_list = getHeaders(csv_headers);
	var column_seq = -1;
		for (var i = 0; i < columns.length;i++){
			// for each column, if any of the columns headers don't appear in csv_header, return false
			//console.log(columns[i]);
			csv_seq = header_list.indexOf(columns[i]);
			if (csv_seq == -1){
				/* console.log(columns[i]);
				console.log(header_list);
				console.log("ffffff");
				console.log(columns);*/
				return false
			}
			//
			else {
				// check that the array of column heads is still in sequence.
				// if the sequence number of current header <= previous header in the array
				// column headers are no longer in sequence
				//console.log([csv_seq, column_seq])
				if (csv_seq <= column_seq){
					column_seq = -1;
					return false
				}
				else {
					column_seq = csv_seq;
				}
			}
		}
		// check that all mandatory headers are included in the column head.
		for (var head in header_list){
			mandIn = columns.indexOf(header_list[head])
			//console.log(mandIn);
			if (mandIn == -1){
				return false
			}
		}
		return true
}
// get list of mandatory headers for csv file
function getMandHead(csv_headers){
	var list = [];
	for (var header in csv_headers){
		if (csv_headers[header].mand){
				list.push(header);
		}
	}
	return list
}

function getHeaders(csv_headers){
	var list = [];
		for (var head in csv_headers){
			list.push(head);
		}
	return list
}

function getImmuAgent(immunAgent){
	var list = [];
		for (var agent in immunAgent){
			list.push(immunAgent[agent].CONCEPT_DESCRIPTION)
		}
		return list
}

function validData(patient, count){
		var agentlist = getImmuAgent(immunAgent);
		var mand_list = getMandHead(csv_headers);
		// regex for missing element(empty space)
		var missing = /^\s*$/;
		var missingMand = [];
		var cause = [];
		var columns = getHeaders(csv_headers);
		//console.log([patient.length, columns.length, count]);
		if (patient == ""){
			var casu = {reason:"This record does not match the required format", location:""};
			cause.push(casu);
			return cause;
		}
		else if (patient.length != columns.length){

			//console.log(patient);
			var casu = {reason:"This record does not match the require format", location:""};
			cause.push(casu);
			return cause;
		}
		else {
			// for each column in the patient data
			// if there's any errors, mark it with a cause, containing the reason and the location of the error.
			for (var section in patient){
				header = columns[section];
				//console.log([patient[section], header]);
				// check if info under that column is mandatory, if that section is blank, return name of
				// mand spot to missing location to return as one condensed cause within $scope.reason
				if (mand_list.indexOf(header) != -1){
					if (patient[section].match(missing)){
						missingMand.push(header);
					}
				}
				// any data that's not under date of birth or immunization must be a string object
				if (typeof patient[section] == "string"){
					// if the column header is a postal code, check if it's in A#A#A# format. if not, reject it
					// postal code is case and space insensitive
					if (header == "POSTAL CODE"){
						var postalFormat = /^\s*[A-Z]\s*\d\s*[A-Z]\s*\d\s*[A-Z]\s*\d\s*$/i
						if (patient[section].match(postalFormat) || patient[section].match(/^\s*$/)){
						}
						else {
							var casu = {reason:"is invalid", location:"POSTAL CODE"};
							cause.push(casu);
						}
					}
					if (header == "GENDER"){
							var acceptedValues = ['M', 'F', 'Other', 'Unk', 'm', 'f', 'other', 'unk'];
						if (acceptedValues.indexOf(patient[section]) == -1){
							if (patient[section].match(missing)){
							}
							else{
								var casu = {reason:"is invalid", location:"GENDER"};
									cause.push(casu);									
								}
						}
					}
					// check if HCN follows the luhn algorithm
					if (header == "HEALTH CARD NUMBER"){
						if (!luhnChk(patient[section])){
								var casu = {reason:"is invalid and will not be added to the client's record", location:"HEALTH CARD NUMBER"};
								cause.push(casu);
						}
							//console.log(luhnChk(patient[section]));
					}
											// if it's an immunizing agent, check if the agent is one inside Panorama's list of values
					if (header == "IMMUNIZING AGENT"){
						if (agentlist.indexOf(patient[section]) == -1){
							if (patient[section].match(missing)){
							}
							else{
								var casu = {reason:"is invalid", location:"IMMUNIZING AGENT"};
								cause.push(casu);
							}
						}
					}
					if (header == "IMMUNIZATION DATE" || header == "DATE OF BIRTH"){
							// date format must be YYYY-MM-DD
							if (!isValidDate(patient[section]) && !patient[section].match(/^\s*$/)){
								var casu = {reason:"is invalid", location:header};
								cause.push(casu);
							}
							// neither date can be later than the current date
							else {
								var currentDate = moment();
								var date = moment(patient[section]);
								var difference = currentDate.diff(date);
								//console.log(difference);
								if (header == "DATE OF BIRTH"){
									var datebirth = moment(patient[section]);
								}
								if (difference < 0){
									var casu = {reason:"entered cannot be a future date", location:header};
									cause.push(casu);
								}
								if (header == "IMMUNIZATION DATE"){
									var immDate = moment(patient[section]);
									var diff = immDate.diff(datebirth);
									//console.log(['immudate difference', difference]);
									if (diff < 0){
										var casu = {reason:"cannot be before DATE OF BIRTH", location:"IMMUNIZATION DATE"};
										cause.push(casu);
									}
								}
							}
							// IMMUNIZATION DATE cannot be before date of birth
						}
				}
			}
			var casu = {reason:"", location:"One or more required values are missing: "};
			//console.log(missingMand);
			if (missingMand.length > 0){
				for (var each in missingMand){
					if (each > 0) {
						casu.location += ", "
					}
					casu.location += missingMand[each];
				}
				cause.push(casu);
			}
		}
		return cause;
};
// given a path to a csv file, return the file.
function getPath(dir){
	console.log(dir);
	// get directory part of file being validated
	var directory = path.dirname(dir);
	// get name of file being validated
	var name = path.basename(dir, '.csv');
	console.log([name, directory])
	// have node read from directory with readstream
	var stream = fs.createReadStream(dir);
	var outputList = ['', '', ''];
	if (directory == '.'){
		outputList[0] = "valid.csv";
		outputList[1] = "invalid.csv";
		outputList[2] = "problems.txt";
	}
	else {
		outputList[0] = directory + "/" + name + "_valid.csv";
		outputList[1] = directory + "/" + name + "_invalid.csv";
		outputList[2] = directory + "/" + name + "_problems.txt";
	}
	// have writestreams to the specified destinations, valid for all valid csvs, invalid for all invalid csvs, problem for full list of problems
	var valid = fs.createWriteStream(outputList[0]);
	var inValid = fs.createWriteStream(outputList[1]);
	var writeCause = fs.createWriteStream(outputList[2]);
	var count = 0;
	var sf = [];
	var cause = [];
	var validRec = [];
	var invalidRec = [];
	// set data encoding to utf8 so we can view data as string
	stream.setEncoding("utf8");
	stream.on('data', function(stuff) {
		// once data is received, parse data
		var data = csv_parse.parse(stuff);
		data = data.data;
		// for each row in the csv, check validation
		for (row in data){
			count += 1;
			dat = data[row];
			parsefile(dat, count, cause, validRec, invalidRec);
		}

	})
	// once all data processed
	stream.on('end', function() {
		console.log("done");
		// splice csv_header into first row of valid and invalid
		var csvHead = getHeaders(csv_headers);
		validRec.splice(0, 0, csvHead);
		invalidRec.splice(0, 0, csvHead);
		// write the output files for valid rows, invalid rows and problems.txt
		csv.write(validRec, {headers:true}).pipe(valid);
		csv.write(invalidRec, {headers:true}).pipe(inValid);
		for (n in cause){
			writeCause.write(cause[n]);
			writeCause.write('\n');
       	}
	})

    	//stream.pipe(csvStream);
}
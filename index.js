// path for required node modules
var angular = require("angular");
var path = require ("path");
var program = require("commander");
var csv_parse = require("babyparse");
var fs = require("fs");

// angular module for validation
var app = angular.module('csvApp', ['controller']);

// program for creating cmd line inputs
program
	.version('0.0.1');
	.option('-v, --validate <path>', 'given a path to a CSV file, program validates file based on PHIX standards');
	.parse(process.argv);

// headers for the csv file, whether their values are mandatory, where they are in sequence
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
				'OTHER DETAILS': {'format':'string', 'mand':false, 'seq':31},
				};
// list of immunization agents used in the current version of PHIX
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

// luhnCheck for health card validation
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

console.log(program.validate)
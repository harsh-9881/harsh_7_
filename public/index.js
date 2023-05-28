document.querySelector('#main-database-file').addEventListener('change', onMainDataUpload);
document.getElementById('filter-me-btn').addEventListener('click', filterStudents);

let firstFileUploaded = false;

let mainDatabaseList = null;


let placedStudentsList;
function onMainDataUpload(e) {
	const file = e.target.files[0];
	document.getElementById('main-database-file-name').innerHTML = file.name;

	const reader = new FileReader();
	reader.onload = function (e) {
		const data = e.target.result;
		const workbook = XLSX.read(data, {
			type: 'binary'
		});

		mainDatabaseList = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[0]]);
		console.log(mainDatabaseList);
		populateTable(mainDatabaseList, 'myTable');

		firstFileUploaded = true;
	};

	reader.onerror = function(error) {
		showErrorPopupWithText(error);
		console.error(error);
	};

	reader.readAsBinaryString(file);
}


function populateTable(data, tableId) {
	const table = document.getElementById(tableId);

	const tbody = table.querySelector("tbody");
	tbody.innerHTML = "";

	data.forEach(student => {
		let row = document.createElement("tr");

		for(const [key, studentData] of Object.entries(student)) {
			let cell = document.createElement("td");

			if(key == 'eligibilityReason') {
				if(studentData.eligibilityReason) cell.style.backgroundColor = 'green';
				else cell.style.backgroundColor = 'red';
			}
			cell.innerHTML = studentData;
			row.appendChild(cell);
		}
		tbody.appendChild(row);

	})
}


function filterStudents() {
	console.error("Filtering now");
	let placedFilterOption = null;



	if(!firstFileUploaded) {
		showErrorPopupWithText("Placement data not uploaded");
		console.error("Placement data not uploaded");
		return;
	}


	if(!document.getElementById('incoming-company-ctc').value) {
		showErrorPopupWithText("Please enter Incoming Company's CTC");
		console.error("Please enter Incoming Company's CTC");
		return;
	}

	filter(placedFilterOption);
}

function filter() {
	let filteredStudentsList = JSON.parse(JSON.stringify(mainDatabaseList));
	const incomingCompanyCTC = Number(document.getElementById('incoming-company-ctc').value);
	filteredStudentsList.forEach(function(student) {
		const firstPackage = student['Package1'];
		const secondPackage = student['Package2'];

		if(incomingCompanyCTC > 30) {
			student.isEligible = false;
			student.eligibilityReason = "ELIGIBLE. Super Dream company";
		} else if(firstPackage && secondPackage) {
			student.isEligible = false;
			student.eligibilityReason = "Ineligible. 2 offers completed";
		} else if(firstPackage > 7) {
			student.isEligible = false;
			student.eligibilityReason = "Ineligible. First company is dream company";
		} else {
			student.isEligible = true;
			student.eligibilityReason = "ELIGIBLE";
		}

		delete student['Package1'];
		delete student['Package2'];
	})

	console.log(filteredStudentsList)
	populateTable(filteredStudentsList, 'filtered-table');
	createExcelFile(filteredStudentsList);

	document.getElementById('filtered-table').classList.remove('hidden');
	document.getElementById('myTable').classList.add('hidden');

	document.getElementById('filter-me-btn').innerHTML = 'Filter again?';
}

function createExcelFile(filteredStudentsList) {
	const fileName = `Filtered List ${new Date()}.xlsx`;
	const ws = XLSX.utils.json_to_sheet(filteredStudentsList);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'Filtered Students');
	XLSX.writeFile(wb, fileName);
}


let popupTimeout = null;
function showSuccessPopupWithText(popupText) {
	if(popupTimeout) clearTimeout(popupTimeout);
	document.querySelector('#success-popup-txt').innerHTML = popupText;
	document.querySelector('#error-popup').classList.replace('translate-x-[4px]', '-translate-x-full');
	document.querySelector('#success-popup').classList.replace('-translate-x-full', 'translate-x-[4px]');
	popupTimeout = setTimeout(() => {
		document.querySelector('#success-popup').classList.replace('translate-x-[4px]', '-translate-x-full');
	}, 5000);
}

function showErrorPopupWithText(popupText) {
	if(popupTimeout) clearTimeout(popupTimeout);
	document.querySelector('#error-popup-txt').innerHTML = popupText;
	document.querySelector('#success-popup').classList.replace('translate-x-[4px]', '-translate-x-full');
	document.querySelector('#error-popup').classList.replace('-translate-x-full', 'translate-x-[4px]');
	popupTimeout = setTimeout(() => {
		document.querySelector('#error-popup').classList.replace('translate-x-[4px]', '-translate-x-full');
	}, 5000);
}
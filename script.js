// https://petlatkea.dk/2021/hogwarts/students.json
// https://petlatkea.dk/2021/hogwarts/families.json

"use strict"

const studentDataLink = "https://petlatkea.dk/2021/hogwarts/students.json"
const familiesLink = "https://petlatkea.dk/2021/hogwarts/families.json"

let expelledArr = [];
let studentArr = [];

let hacked = false;

const Student = {
    // fullname: "",
    firstName: "",
    lastName: "",
    middleName: "",
    nickname: "",
    gender: "",
    imgFile: "",
    house: "",
    bloodStatus: "",
    expelled: false,
    prefect: false,
    squad: false,
}

const settings = {
    filter: "all",
    sortBy: "name",
    sortDir: "asc"
};

init();

function init() {
    readData();
    registerButtons();
    readBloodStatus();
}

function readData() {
    fetch(studentDataLink)
    .then(response => response.json())
    .then(cleanData)
}

function readBloodStatus() {
    fetch(familiesLink)
    .then(response => response.json())
    .then(setBloodStatus)
}

function setBloodStatus(families) {
    console.log(families)
    studentArr.forEach(student => {
         if (families.half.includes(student.lastName) && families.pure.includes(student.lastName)) {
            student.bloodStatus = "Half"
        } else if (families.pure.includes(student.lastName)) {
            student.bloodStatus = "Pure";
        } else if (families.half.includes(student.lastName)) {
            student.bloodStatus = "Half"
        }  else {
            student.bloodStatus = "Muggle"
        }
    });
}


function cleanData(students) {
    students.forEach(student => {
        let splitNames = student.fullname.trim().split(' ');

        //variables for all the names
        let fixedHouse = capitalizeName(student.house.trim());
        let fixedFirstName = capitalizeName(splitNames[0]);
        let fixedLastName = capitalizeName(splitNames[splitNames.length-1]);
        let fixedMiddleName = ""
        let fixedNickname = ""
        let fixedImgFile = fixedLastName.toLowerCase() + '_' + fixedFirstName.toLowerCase().charAt(0);

        //checking if there's only one name
        if (splitNames.length == 1) {
            fixedLastName = "";
        }

        //fixing the image files, lazy way
        if (fixedLastName === "Patil") {
            fixedImgFile = fixedLastName.toLowerCase() + '_' + fixedFirstName.toLowerCase();
        } else if (fixedLastName == "") {
            fixedImgFile = fixedFirstName.toLowerCase();
        }

         //checking if there's a middle name
         if (splitNames.length > 2) {
            fixedMiddleName = capitalizeName(splitNames[splitNames.length-2]);
        }

        //checking if the middle name is a nickname
        if (fixedMiddleName.charAt(0) == `"`) {
            fixedNickname = `"` + fixedMiddleName.charAt(1).toUpperCase() + fixedMiddleName.slice(2);
            fixedMiddleName = "";
        }

        //checking for dash
        if (fixedLastName.includes(`-`)) {
            fixedLastName = fixedLastName.split(`-`)[0] + `-` + 
                            fixedLastName.split(`-`)[1].charAt(0).toUpperCase() + 
                            fixedLastName.split(`-`)[1].toLowerCase().slice(1);
            fixedImgFile = fixedLastName.split(`-`)[1].toLowerCase() + '_' + fixedFirstName.toLowerCase().charAt(0);
        }
        
        //creates the new student object
        const studentObj = Object.create(Student);
        // studentObj.fullname = student.fullname;
        studentObj.firstName = fixedFirstName;
        studentObj.lastName = fixedLastName;
        studentObj.middleName = fixedMiddleName;
        studentObj.nickname = fixedNickname;
        studentObj.house = fixedHouse;
        studentObj.gender = student.gender;
        studentObj.imgFile = fixedImgFile;

        studentArr.push(studentObj);
    });

    console.log(studentArr);
    displayStudents(studentArr)
}


//capitalize the student names
function capitalizeName(name) {
    //so it runs with dear leanne :)
    if (name != null) {
        let capitalName = name.charAt(0).toUpperCase() + name.toLowerCase().slice(1);
        return capitalName  
    }
}

function displayStudents(students) {
    console.log(students);

    document.querySelector("#students-here").innerHTML = `Total students: ${studentArr.length}
    <br>Displayed students: ${students.length}
    <br>Expelled students: ${expelledArr.length}`

    students.forEach((student) => {
        
        const studentInfoTemp = document.querySelector("#info").content;
        const studentInfoTempCopy = studentInfoTemp.cloneNode(true);

        studentInfoTempCopy.querySelector("#student-name").textContent = 
            student.firstName + ' ' + student.middleName + ' ' + student.nickname + ' ' + student.lastName;
        studentInfoTempCopy.querySelector("#student-img").src = './assets/student_images/' + student.imgFile + '.png';
        studentInfoTempCopy.querySelector(".gender-icon").src = './assets/misc/' + student.gender + '.png';
        setHouseCrest(student, studentInfoTempCopy);

        studentInfoTempCopy.querySelector("#modal-btn").addEventListener("click", function() {
            openModal(student);
        });

        if (student.expelled == true) {
            studentInfoTempCopy.querySelector(".student-container").classList.add("disabled")
        }

        document.querySelector("#students-here").appendChild(studentInfoTempCopy);
    });
}

window.addEventListener("click", function(event) {
    if (event.target == document.querySelector(".modal") || event.target == document.querySelector(".close-btn")) {
    document.querySelector(".modal").style.display = "none";
    } 
});

let displayingExpelled = false;
document.querySelector("#expelled-toggle").addEventListener("click", toggleDisplayedStudents)

function toggleDisplayedStudents() {
    if (displayingExpelled == false) {
        displayStudents(expelledArr);
        document.querySelector("#expelled-toggle").textContent = "Enrolled students";
    } else {
        displayStudents(studentArr);
        document.querySelector("#expelled-toggle").textContent = "Expelled students";
    }
    displayingExpelled = !displayingExpelled;
}

function setHouseCrest(student, studentInfoTempCopy) {
    let crestImg = studentInfoTempCopy.querySelector(".house-crest");

    switch (student.house) {
        case "Gryffindor":
            crestImg.src = "./assets/misc/gryffindor.png"
            break;
        case "Hufflepuff":
            crestImg.src = "./assets/misc/hufflepuff.png"
            break;
        case "Ravenclaw":
            crestImg.src = "./assets/misc/ravenclaw.png"
            break;
        case "Slytherin":
            crestImg.src = "./assets/misc/slytherin.png"
            break;
        default:
            console.log("setHouseCrest error")
            break
    }
}

function openModal(student) {
    const modal = document.querySelector(".modal")
    modal.style.display = "block"

    modal.querySelector("#blood-info").textContent = student.bloodStatus;
    modal.querySelector("#student-name-modal").textContent = 
            student.firstName + ' ' + student.middleName + ' ' + student.nickname + ' ' + student.lastName;
    modal.querySelector("#student-img-modal").src = './assets/student_images/' + student.imgFile + '.png';
    modal.querySelector("#gender").src = './assets/misc/' + student.gender + '.png';

    modal.querySelector("#prefect").addEventListener("click", clickPrefectBtn);
    modal.querySelector("#squad").addEventListener("click", clickSquadBtn);
    modal.querySelector("#expel").addEventListener("click", clickExpelBtn);

    setHouseCrest(student, modal);
    
    if (student.prefect) {
        document.querySelector("#prefect-icon").classList.remove("hide");
        document.querySelector("button#prefect").textContent = "Remove Prefect";
    } else {
        document.querySelector("#prefect-icon").classList.add("hide");
        document.querySelector("button#prefect").textContent = "Add Prefect";
    }

    function clickExpelBtn() {
        student.expelled = true;
        studentArr.forEach((arrayStudent, arrayStudentIndex) => {
            if (arrayStudent === student) {
                studentArr.splice(arrayStudentIndex, 1);
                expelledArr.push(student)
            }
        });
        console.log(expelledArr);
        document.querySelector(".modal").style.display = "none";
        buildList();
    }

    function clickPrefectBtn() {
        console.log(student)
        if (student.prefect) {
            student.prefect = false;
            modal.querySelector("#prefect-icon").classList.add("hide");
            modal.querySelector("button#prefect").textContent = "Add Prefect";
        } else {
            document.querySelector("#prefect-icon").classList.remove("hide");
            document.querySelector("button#prefect").textContent = "Remove Prefect";
            tryToMakeAPrefect(student);
        }
        buildList();
        modal.querySelector("button#prefect").removeEventListener("click", clickPrefectBtn);
    }

    if (student.squad) {
        document.querySelector("#squad-icon").classList.remove("hide");
        document.querySelector("button#squad").textContent = "Remove from Squad";
    } else {
        document.querySelector("#squad-icon").classList.add("hide");
        document.querySelector("button#squad").textContent = "Add to squad";
    }

    function clickSquadBtn() {
        if(student.squad) {
            student.squad = false;
            modal.querySelector("#squad-icon").classList.add("hide")
        } else {
            tryToPutInSquad(student);
        }

        buildList();
        modal.querySelector("button#squad").removeEventListener("click", clickSquadBtn)
    }

    if (student.house == "Slytherin" || student.bloodStatus == "Pure") {
        document.querySelector("button#squad").classList.remove("disabled");
    } else {
        document.querySelector("button#squad").classList.add("disabled");
    }
}

function tryToPutInSquad(selectedStudent) {
    if (selectedStudent.house === "Slytherin" || selectedStudent.bloodStatus === "Pure") {
        selectedStudent.squad = true;

        document.querySelector("#squad-icon").classList.remove("hide");
        document.querySelector("button#squad").textContent = "Remove to squad";
    }

    if (hacked == true) {
        setTimeout(() => {
            selectedStudent.squad = false;
            document.querySelector("#squad-icon").classList.add("hide");
            document.querySelector("button#squad").textContent = "Add to Squad";
        }, 1000);
    }
}

function tryToMakeAPrefect(selectedStudent) {
    const allPrefects = studentArr.filter(student => student.prefect);
    const other = allPrefects.filter(student => student.house === selectedStudent.house);

    if (other.length >= 2) {
        removeAorB(other[0], other[1]);
    } else {
        makePrefect(selectedStudent)
    }

    function removeAorB(prefectA, prefectB) {
        document.querySelector("#remove-aorb").classList.remove("hide");
        document.querySelector("#remove-aorb .close-button").addEventListener("click", closeDialog);
        document.querySelector("#remove-aorb #remove-a").addEventListener("click", clickRemoveA);
        document.querySelector("#remove-aorb #remove-b").addEventListener("click", clickRemoveB);

        document.querySelector("#remove-aorb [data-field=winnerA]").textContent = prefectA.firstName;
        document.querySelector("#remove-aorb [data-field=winnerB]").textContent = prefectB.firstName;
    }

    function closeDialog() {
        document.querySelector("#remove-aorb").classList.add("hide")
        document.querySelector("#remove-aorb .close-button").removeEventListener("click", closeDialog);
        document.querySelector("#remove-aorb #remove-a").removeEventListener("click", clickRemoveA);
        document.querySelector("#remove-aorb #remove-b").removeEventListener("click", clickRemoveB);
    }

    function clickRemoveA() {
        removePrefect(other[0]);
        makePrefect(selectedStudent);
        buildList();
        closeDialog();
    }

    function clickRemoveB() {
        removePrefect(other[1]);
        makePrefect(selectedStudent);
        buildList();
        closeDialog();
    }
}

function removePrefect(selectedStudent) {
    selectedStudent.prefect = false;
}

function makePrefect(student) {
    student.prefect = true;
}

function registerButtons() {
    //button for filter
    document.querySelectorAll("[data-action='filter']")
        .forEach(button => button.addEventListener("click", selectFilter));

    //button for sort
    document.querySelectorAll("[data-action='sort']")
        .forEach(button => button.addEventListener("click", selectSort));
}

function selectFilter(event) {
    const filter = event.target.dataset.filter;
    console.log(`User selected: ${filter}`);
    setFilter(filter);
}

function setFilter(filter) {
    settings.filterBy = filter;
    buildList();
}

function buildList() {
    const currentList = filterList(studentArr);
    const sortedList = sortList(currentList);

    displayList(sortedList);
}

function displayList(students) {
    console.log(students);
    // clear the list
    document.querySelector("#students-here").innerHTML = "";

    // build a new list
    displayStudents(students);
}

function filterList(filteredList) {
    switch (settings.filterBy) {
        case "gryff":
            filteredList = studentArr.filter(student => student.house == "Gryffindor")
            break;
        case "huffle":
            filteredList = studentArr.filter(student => student.house == "Hufflepuff")
            break;
        case "raven":
            filteredList = studentArr.filter(student => student.house == "Ravenclaw")
            break;
        case "slyth":
            filteredList = studentArr.filter(student => student.house == "Slytherin")
            break;
        case "*":
            filteredList = studentArr
            break;
        case "female":
            filteredList = studentArr.filter(student => student.gender == "girl")
            break;
        case "male":
            filteredList = studentArr.filter(student => student.gender == "boy")
            break;
        default:
            console.log("filterList error")
            break;
    }

    return filteredList;
}

function selectSort(event) {
    const sortBy = event.target.dataset.sort;
    const sortDir = event.target.dataset.sortDirection;

    //toggle the direction
    if (sortDir === "asc") {
        event.target.dataset.sortDirection = "desc";
    } else {
        event.target.dataset.sortDirection = "asc";
    }

    console.log(`User selected: ${sortBy} - ${sortDir}`);

    setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
    settings.sortBy = sortBy;
    settings.sortDir = sortDir;
    buildList();
}

function sortList(sortedList) {
    let direction = 1;
    if (settings.sortDir === "desc") {
        direction = -1
    } else {
        settings.direction = 1;
    }
    
    sortedList = sortedList.sort(sortByProperty);

    function sortByProperty(studentA, studentB) {
        if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
            return -1 * direction;
        } else {
            return 1 * direction;
        }
    }
    return sortedList;
}

document.querySelector("#hack-me").addEventListener("click", hackTheSystem);

function hackTheSystem() {
    hacked = true;
    injectMyself();
    randomizeBloodStatus();
    setInterval(() => {
        removeSquad();
    }, 1000);
    buildList();
}

function injectMyself() {
    const studentObj = Object.create(Student);
    // studentObj.fullname = student.fullname;
    studentObj.firstName = "Ebony";
    studentObj.lastName = "Way";
    studentObj.middleName = "Dark'ness Dementia Raven";
    studentObj.nickname = "";
    studentObj.house = "Slytherin";
    studentObj.gender = "girl";
    studentObj.imgFile = `ebony`;

    studentArr.unshift(studentObj);
}

function randomizeBloodStatus() {
    studentArr.forEach(student => {
        let randomNumber = Math.floor(Math.random() * 3);

        if (randomNumber == 0) {
            student.bloodStatus = "Pure";
        } else if (randomNumber == 1) {
            student.bloodStatus = "Half";
        } else if (randomNumber == 2) {
            student.bloodStatus = "Muggle"
        }
    });
}

document.querySelector("#search-input").addEventListener("keydown", searchStudent)

function searchStudent() {
    let searchValue = this.value.toLowerCase();
    let foundStudents = studentArr.filter(student => {
        if (student.firstName.toLowerCase().includes(searchValue) || student.middleName.toLowerCase().includes(searchValue) || 
            student.nickname.toLowerCase().includes(searchValue) || student.lastName.toLowerCase().includes(searchValue)) {
                return student;
            }
    });

    displayList(foundStudents);
}

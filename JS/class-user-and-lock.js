const element_class = document.getElementById("class-user");

const userBirthdate = localStorage.getItem("userBirthdate");

function getGrade(birthYear) {
    const now = new Date();

    let grade = 20 - (birthYear - 2000);

    if (now.getMonth() >= 5) { // Tháng 6 trở đi
        grade++;
    }

    return grade;
}

if (!userBirthdate) {
    element_class.textContent = "Chưa có dữ liệu";
} else {
    display_class();
}

function display_class() {
    const userBirthYear = new Date(userBirthdate).getFullYear();

    if (isNaN(userBirthYear)) {
        element_class.textContent = "Dữ liệu không hợp lệ";
        return;
    }

    const grade = getGrade(userBirthYear);

    if (grade < 1) {
        element_class.textContent = "Bạn đang học mẫu giáo";
    } else if (grade <= 12) {
        element_class.textContent = `Lớp ${grade}`;
    } else {
        element_class.textContent = "Bạn đã tốt nghiệp";
    }
}
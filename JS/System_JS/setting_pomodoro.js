function setting_pomodoro() {
    const options = [
        { label: "Học 25p, Nghỉ 5p",  value: "25-5" },
        { label: "Học 50p, Nghỉ 10p", value: "50-10" },
        { label: "Học 45p, Nghỉ 15p", value: "45-15" }
    ];

    showDropdownPrompt("Chọn chế độ học", options, function(val) {
        if (!val) return;

        const [pomo, breakT] = val.split('-').map(Number);

        localStorage.setItem('pomodoroTime', pomo);
        localStorage.setItem('breakTime', breakT);

        if (typeof resetTimer === 'function') {
            resetTimer();
        } else {
            location.reload();
        }
    });
}
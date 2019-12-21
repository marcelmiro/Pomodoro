

let app = new Vue({
    el: "#main-container",
    data: {
        roundName: "",
        roundNameShort: "",
        roundNames: ["Focus on work", "Take a short break", "Take a long break"],
        roundNamesShort: ["Work", "Short break", "Long break"],
        roundRange: 4,
        workRange: 0.1,
        sBreakRange: 0.1,
        lBreakRange: 15,
        currentRound: 1,
        totalRound: 0,
        nowDate: 0,
        newDate: 0,
        minutes: 25,
        seconds: 0,
        totalTime: 0,
        playState: true,
        isCountdown: false,
        isPaused: false,
        soundVolume: 100,
        musicVolume: 75,
        musicPref: "nature",
        isMusic: false,
        musicPlaying: false,
        autoPomodoro: true,
        autoBreak: true,
        autoTodoEmpty: false,
        infinite: false,
        musicInBreaks: false,
        newTask: "",
        tasks: [],
    },
    methods: {
        changeCountdown: function() {
            !this.isCountdown ? this.minutes = this.workRange : "";
        },
        changeRound: function() {
            this.infinite = false;
            this.totalRound = this.roundRange * 2;
        },
        changeVolume: function() {
            Object.keys(music).forEach(function(key) {
                music[key].volume = app.musicVolume / 100;
            });
        },
        changeInfinite: function() {
            if (!this.infinite) {
                this.roundRange = 0;
                this.currentRound = 1;
                this.totalRound = 20;
            } else {
                this.roundRange = 4;

                if (typeof(Storage) !== "undefined" && localStorage.getItem("roundRange") !== null) {
                    this.roundRange = localStorage.getItem("roundRange");
                } else {
                    this.roundRange = 4;
                }
                this.changeRound();
            }
        },
        playFunc: function() {
            this.playState = !this.playState;
            if (document.querySelector("#button-container > #play > div").classList.contains("play")) {
                if (this.isCountdown) {
                    this.isPaused = false;

                    this.nowDate = Math.trunc((new Date()).getTime() / 1000);
                    this.newDate = this.nowDate + this.minutes * 60 + this.seconds;

                    this.countDownTimer();
                    timerBar.animate(0, {duration: ((this.newDate - this.nowDate) * 1000 + 10)});
                    this.isMusic && !this.musicPlaying ? this.roundName === this.roundNames[0] || this.musicInBreaks ? this.musicOn(this.musicPref) : "" : "";
                } else {
                    this.currentRound = 1;
                    if (!this.infinite) {
                        [].forEach.call(document.querySelectorAll("#rounds-container li"), function (el) { el.classList.remove("active"); });
                        this.totalRound = this.roundRange * 2;
                    }
                    this.startCountdown();
                    this.isMusic && !this.musicPlaying ? this.musicOn(this.musicPref) : "";
                }
            } else {
                this.isPaused = true;
                timerBar.stop();
                this.musicPlaying ? this.musicOn("") : "";
            }
        },
        startCountdown: function() {
            let autoStart = true;

            if (this.currentRound > this.totalRound) {
                // Finished
                clearInterval(window.timer);
                this.playState = true;
                [].forEach.call(document.querySelectorAll("#rounds-container li"), function (el) { el.classList.remove("process"); });
                [].forEach.call(document.querySelectorAll("#rounds-container li"), function (el) { el.classList.add("active"); });
                timerBar.set(0);
                this.musicPlaying ? this.musicOn("") : "";
                return;
            } else if (this.currentRound === this.totalRound) {
                // Long break
                this.autoBreak ? autoStart = true : autoStart = false;
                if (this.infinite) {
                    this.currentRound = 1;
                    this.startCountdown();
                    return;
                } else {
                    this.minutes = this.lBreakRange;
                    this.totalTime = this.lBreakRange * 60;
                    this.roundName = this.roundNames[2];
                    document.querySelector("#rounds-container li:nth-child(" + this.currentRound / 2 + ")").classList.remove("process");
                    document.querySelector("#rounds-container li:nth-child(" + this.currentRound / 2 + ")").classList.add("active");
                    !this.musicInBreaks ? this.musicPlaying ? this.musicOn("") : "" : this.isMusic && !this.musicPlaying ? this.musicOn(this.musicPref) : "";
                }
            } else if (this.currentRound % 2 === 0) {
                // Short break
                this.autoBreak ? autoStart = true : autoStart = false;
                this.minutes = this.sBreakRange;
                this.totalTime = this.sBreakRange * 60;
                this.roundName = this.roundNames[1];
                if (!this.infinite) {
                    document.querySelector("#rounds-container li:nth-child(" + this.currentRound / 2 + ")").classList.remove("process");
                    document.querySelector("#rounds-container li:nth-child(" + this.currentRound / 2 + ")").classList.add("active");
                }
                !this.musicInBreaks ? this.musicPlaying ? this.musicOn("") : "" : "";
            } else {
                // Work
                !this.autoTodoEmpty ? autoStart = this.autoPomodoro : autoStart = Object.keys(this.tasks).length > 0 && this.autoPomodoro;

                this.minutes = this.workRange;
                this.totalTime = this.workRange * 60;
                this.roundName = this.roundNames[0];
                if (!this.infinite) {
                    document.querySelector("#rounds-container li:nth-child(" + (this.currentRound + 1) / 2 + ")").classList.add("process");
                }
                this.isMusic && !this.musicPlaying ? this.musicOn(this.musicPref) : "";
            }

            this.nowDate = Math.trunc((new Date()).getTime() / 1000);
            this.newDate = this.nowDate + this.totalTime;

            this.isCountdown = true;
            timerBar.set(1);

            if (this.currentRound === 1 || autoStart) {
                timerBar.animate(0, {duration: (this.totalTime * 1000 + 10)});
                this.countDownTimer();
            } else {
                this.playState = true;
            }
        },
        countDownTimer: function() {
            clearInterval(window.timer);
            window.timer = setInterval(() => {
                if (!this.isPaused) {
                    this.nowDate = Math.trunc((new Date()).getTime() / 1000);

                    this.minutes = Math.trunc((this.newDate - this.nowDate) / 60) % 60;
                    this.seconds = (this.newDate - this.nowDate) % 60;

                    this.newDate - this.nowDate === 0 ? (this.currentRound > this.totalRound ? this.soundEffect("finish") : this.currentRound === this.totalRound ? this.soundEffect("finish") : this.currentRound % 2 === 0 ? this.soundEffect("break") : this.soundEffect("work")) : "";
                    if (this.newDate - this.nowDate < 0) {
                        clearInterval(window.timer);

                        this.minutes = 0;
                        this.seconds = 0;

                        this.isCountdown = false;
                        this.currentRound++;

                        this.startCountdown();
                    }
                }
            },1000);
        },
        resetTimer: function() {
            clearInterval(window.timer);
            timerBar.set(1);

            this.minutes = this.workRange;
            this.seconds = 0;
            this.playState = true;

            [].forEach.call(document.querySelectorAll("#rounds-container li"), function (el) { el.classList.remove("process"); });
            [].forEach.call(document.querySelectorAll("#rounds-container li"), function (el) { el.classList.remove("active"); });

            this.isCountdown = false;
            this.isPaused = false;
            this.currentRound = 1;
        },
        fastForwardTimer: function() {
            if (this.isCountdown) {
                this.currentRound > this.totalRound ? this.soundEffect("finish") : this.currentRound === this.totalRound ? this.soundEffect("finish") : this.currentRound % 2 === 0 ? this.soundEffect("break") : this.soundEffect("work");
                clearInterval(window.timer);

                this.minutes = 0;
                this.seconds = 0;

                this.isCountdown = false;
                this.currentRound++;

                this.startCountdown();
            }
        },
        soundEffect: function(fx) {
            Object.keys(sound).forEach(function(key) {
                sound[key].pause();
                sound[key].currentTime = 0;
            });

            sound[fx].volume = this.soundVolume / 100;
            sound[fx].play();
        },
        resetDefault: function(setting) {
            if (setting === "time") {
                this.roundRange = 4;
                this.workRange = this.minutes = 25;
                this.sBreakRange = 4;
                this.lBreakRange = 15;
                this.changeCountdown();
                this.changeRound();
            } else if (setting === "audio") {
                this.isMusic = false;
                this.soundVolume = 100;
                this.musicVolume = 75;
                document.querySelector("#music-slider").classList.add("disabled");
                document.querySelector("#music-slider").disabled = true;
                [].forEach.call(document.querySelectorAll("#music_container button"), function (el) { el.classList.add("disabled"); el.disabled = true; });
                this.musicOn("");
                this.musicPref = "nature";
            } else {
                this.autoPomodoro = true;
                this.autoBreak = true;
                this.autoTodoEmpty = false;
                this.infinite = false;
                this.musicInBreaks = false;
            }
        },
        openTab: function(elem) {
            if (elem === "settings") {
                document.getElementsByClassName("overlay")[0].classList.add("opacBg");
                document.querySelector("#settings-container .container").style.left = "20px";
            } else {
                document.getElementsByClassName("overlay")[1].classList.add("opacBg");
                document.querySelector("#todo-container .container").style.right = "20px";
            }
        },
        removeOverlay: function(elem) {
            if (elem === "settings") {
                document.getElementsByClassName("overlay")[0].classList.remove("opacBg");
                document.querySelector("#settings-container .container").style.left = "-320px";
            } else {
                document.getElementsByClassName("overlay")[1].classList.remove("opacBg");
                document.querySelector("#todo-container .container").style.right = "-350px";
            }
        },
        musicState: function() {
            if (this.isMusic) {
                document.querySelector("#music-slider").classList.add("disabled");
                document.querySelector("#music-slider").disabled = true;
                [].forEach.call(document.querySelectorAll("#music_container button"), function (el) { el.classList.add("disabled"); el.disabled = true; });

                this.musicOn("");
            } else {
                document.querySelector("#music-slider").classList.remove("disabled");
                document.querySelector("#music-slider").disabled = false;
                [].forEach.call(document.querySelectorAll("#music_container button"), function (el) { el.classList.remove("disabled"); el.disabled = false; });

                this.musicOn(this.musicPref);
            }
        },
        musicOn: function(fx) {
            this.musicPlaying = false;
            Object.keys(music).forEach(function(key) {
                music[key].pause();
                music[key].currentTime = 0;
            });

            if (fx === "") {
                return;
            } else {
                this.musicPref = fx;
            }

            this.musicPlaying = true;
            music[this.musicPref].muted = false;
            music[this.musicPref].play();

            if (fx === "nature") {
                music[this.musicPref].volume = 0;
                let i = 0;
                function volumeLoop() {
                    setTimeout(function() {
                        i++;
                        music[app.musicPref].volume = i / 100;

                        if (i < app.musicVolume) {
                            volumeLoop();
                        }
                    }, 30);
                }
                volumeLoop();
            }
        },
        settingsTabs: function(tab) {
            if (tab === "time") {
                document.querySelector("#settings-container .container hr").style.marginLeft = "0";
                document.querySelector("#settings-container #page-container").style.marginLeft = "0";
            } else if (tab === "audio") {
                document.querySelector("#settings-container .container hr").style.marginLeft = "84px";
                document.querySelector("#settings-container #page-container").style.marginLeft = "-100%";
            } else {
                document.querySelector("#settings-container .container hr").style.marginLeft = "168px";
                document.querySelector("#settings-container #page-container").style.marginLeft = "-200%";
            }
        },
        addTask: function() {
            if (Object.keys(this.tasks).length >= 8) {
                this.newTask = "Can't add more tasks...";
                document.querySelector("#add-task-container textarea").classList.add("alert");

                setTimeout(function() {
                    app.newTask === "Can't add more tasks..." ? app.newTask = "" : "";
                    document.querySelector("#add-task-container textarea").classList.remove("alert");
                }, 3000);
                return;
            }

            let isPriority = false;

            if (this.newTask[0] === "!") {
                this.newTask = this.newTask.substr(1);
                isPriority = true;
            }

            this.newTask = this.newTask.trim().replace(/\s+/g," ");
            this.newTask = this.newTask.charAt(0).toUpperCase() + this.newTask.slice(1);
            if (this.newTask.length <= 0) { return; }

            this.tasks.push({
                text: this.newTask,
                completed: false,
                priority: isPriority,
            },);

            this.newTask = "";
            this.vueGetStorage();
        },
        removeTask: function(id) {
            document.querySelector(".task:nth-child(" + (id + 2) + ")").classList.add("remove");

            setTimeout(function() {
                app.tasks.splice(id, 1);
                [].forEach.call(document.querySelectorAll(".task"), function (el) { el.classList.remove("remove"); });
            }, 500);
            this.vueGetStorage();
        },
        completeTask: function(id) {
            //this.tasks[id].completed = !this.tasks[id].completed;

            //document.querySelector(".task:nth-child(" + (id + 2) + ") span.complete").classList.toggle("completed");
            [].forEach.call(document.querySelectorAll(".task:nth-child(" + (id + 2) + ") span"), function (el) { el.classList.toggle("completed"); });
            this.vueGetStorage();
        },
        vueGetStorage: function() {
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem("roundRange", this.roundRange);
                localStorage.setItem("workRange", this.workRange);
                localStorage.setItem("sBreakRange", this.sBreakRange);
                localStorage.setItem("lBreakRange", this.lBreakRange);
                localStorage.setItem("soundVolume", this.soundVolume);
                localStorage.setItem("musicVolume", this.musicVolume);
                localStorage.setItem("musicPref", this.musicPref);
                localStorage.setItem("isMusic", this.isMusic);
                localStorage.setItem("autoPomodoro", this.autoPomodoro);
                localStorage.setItem("autoBreak", this.autoBreak);
                localStorage.setItem("autoTodoEmpty", this.autoTodoEmpty);
                localStorage.setItem("infinite", this.infinite);
                localStorage.setItem("musicInBreaks", this.musicInBreaks);
                localStorage.setItem("tasks", this.tasks);
                if (!this.newTask.startsWith("Can't add more tasks...")) {
                    localStorage.setItem("newTask", this.newTask);
                } else {
                    localStorage.setItem("newTask", "");
                }
            }
        },
    },
    filters: {
        timerFormat: function(value) {
            return value.toString().length === 1 ? "0" + value : value;
        }
    },
    computed: {
        shortRoundName: function() {
            for (let i = 0; i < this.roundNames.length; i++) {
                if (this.roundName === this.roundNames[i]) {
                    return this.roundNamesShort[i];
                }
            }
            return "";
        }
    },
    watch: {
        roundRange: { handler() { this.vueGetStorage(); } },
        workRange: { handler() { this.vueGetStorage(); } },
        sBreakRange: { handler() { this.vueGetStorage(); } },
        lBreakRange: { handler() { this.vueGetStorage(); } },
        soundVolume: { handler() { this.vueGetStorage(); } },
        musicVolume: { handler() { this.vueGetStorage(); } },
        musicPref: { handler() { this.vueGetStorage(); } },
        isMusic: { handler() { this.vueGetStorage(); } },
        autoPomodoro: { handler() { this.vueGetStorage(); } },
        autoBreak: { handler() { this.vueGetStorage(); } },
        autoTodoEmpty: { handler() { this.vueGetStorage(); } },
        infinite: { handler() { this.vueGetStorage(); } },
        musicInBreaks: { handler() { this.vueGetStorage(); } },
    },
    mounted: function() {
        if (typeof(Storage) !== "undefined" && localStorage.getItem("roundRange") !== null) {
            this.roundRange = localStorage.getItem("roundRange");
            this.workRange = localStorage.getItem("workRange");
            this.minutes = localStorage.getItem("workRange");
            this.sBreakRange = localStorage.getItem("sBreakRange");
            this.lBreakRange = localStorage.getItem("lBreakRange");
            this.soundVolume = localStorage.getItem("soundVolume");
            this.musicVolume = localStorage.getItem("musicVolume");
            this.musicPref = localStorage.getItem("musicPref");
            // Can't autoplay if user has not interacted with website first
            //this.isMusic = (localStorage.getItem("isMusic") === "true");
            this.autoPomodoro = (localStorage.getItem("autoPomodoro") === "true");
            this.autoBreak = (localStorage.getItem("autoBreak") === "true");
            this.autoTodoEmpty = (localStorage.getItem("autoTodoEmpty") === "true");
            this.infinite = (localStorage.getItem("infinite") === "true");
            this.musicInBreaks = (localStorage.getItem("musicInBreaks") === "true");
            this.tasks = localStorage.getItem("tasks");
            this.newTask = localStorage.getItem("newTask");

            /*
            if (this.isMusic) {
                this.isMusic = false;
                this.musicState();
                this.isMusic = true;
            }
            */
        } else {
            this.vueGetStorage();
        }
    },
});

let timerBar = new ProgressBar.Path('#timer-path');
timerBar.set(1);

let sound = {
    "work" : new Audio("assets/audio_break.mp3"),
    "break" : new Audio("assets/audio_work.mp3"),
    "finish" : new Audio("assets/audio_finish.mp3")
};
let music = {
    "nature" : new Audio("assets/audio_nature.mp3"),
    "rain" : new Audio("assets/audio_rain.mp3"),
    "cafe" : new Audio("assets/audio_cafe.mp3"),
    "music" : new Audio("assets/audio_music.mp3")
};

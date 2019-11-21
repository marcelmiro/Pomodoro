
let app = new Vue({
    el: "#main-container",
    data: {
        roundName: "",
        roundNames: ["Work", "Short Break", "Long Break"],
        timerRange: 1,
        roundRange: 4,
        nowDate: 0,
        newDate: 0,
        minutes: 1,
        seconds: 0,
        totalTime: 0,
        playState: true,
        isCountdown: false,
        isPaused: false,
        progressFraction: 0,
    },
    methods: {
        changeProgress: function() {
            timerBar.set(1);
            this.minutes = this.timerRange;
            this.playState = true;
            this.isCountdown = false;
            this.isPaused = false;
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
                } else {
                    timerBar.set(1);
                    this.startCountdown();
                }
            } else {
                this.isPaused = true;
                timerBar.stop();
            }
        },
        startCountdown: function() {
            this.totalTime = this.timerRange * 60;

            this.nowDate = Math.trunc((new Date()).getTime() / 1000);
            this.newDate = this.nowDate + this.totalTime;

            this.isCountdown = true;
            timerBar.animate(0, {duration: (this.totalTime * 1000 + 10)});
            this.countDownTimer();
        },
        countDownTimer: function() {
            let timer = setInterval(() => {
                if (!this.isPaused) {
                    this.nowDate = Math.trunc((new Date()).getTime() / 1000);

                    this.minutes = Math.trunc((this.newDate - this.nowDate) / 60) % 60;
                    this.seconds = (this.newDate - this.nowDate) % 60;

                    if (this.newDate - this.nowDate <= 0) {
                        clearInterval(timer);
                        this.minutes = 0;
                        this.seconds = 0;
                        this.isCountdown = false;
                        this.playState = true;
                    }
                }
            },1000);
        }
    },
    filters: {
        timerFormat: function(value) {
            return value.toString().length === 1 ? "0"+value : value;
        },
        toInt: function(value) {
            return parseInt(value);
        }
    }
});


let timerBar = new ProgressBar.Path('#timer-path');
timerBar.set(1);



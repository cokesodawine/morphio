let isAnswering = false;
//let awayFromTerminal = {};
//let awayFromTerminalCount = {};
window.awayFromTerminal = {};
window.awayFromTerminalCount = {};

class QnAPanel {
    constructor({ match, answerChoices, details, socket }) {
        this.match = match;
        this.question = match.question;
        this.answerChoices = answerChoices;
        this.level = match.level;
        this.key = `${match.position.x},${match.position.y}`
        this.element = null;
        this.quest_timer_tag = null;
        this.hard_code = null;
        this.prevFocus = null;
        this.details = details;
        this.socket = socket;
    }

    createElement() {
        // Create question-panel tag
        let questPanel_element = (`
            <div class="question-panel"><p>${this.question}</p></div>
        `)

        // Create coding section if it is a hard level terminal
        if(this.level === 'hard'){
            this.hard_code = document.createElement("div");
            this.hard_code.classList.add("hard-code");
            this.hard_code.innerHTML = (`
                <div class="split-box">${this.match.code1}</div>
                <div class="split-box">${this.match.code2}</div>
            `);
        }

        // Create answer-panel tag
        let ansPanel_element = this.answerChoices.map((answerChoice, index) => {
            return (`
                <div class="option">
                    <button data-button="${index}">${answerChoice.ansStr}</button>
                </div>
            `)
        }).join("");

        // Create question-timer tag
        this.quest_timer_tag = document.createElement("div");
        this.quest_timer_tag.classList.add("question-timer");

        // Create QnA-panel tag
        this.element = document.createElement("div");
        this.element.classList.add("qna-panel");
        this.element.innerHTML = (`
            ${questPanel_element}
            <div class="answer-panel">
                ${ansPanel_element}
            </div>
        `);

        // Button action-listener
        this.element.querySelectorAll("button").forEach(button => {
            button.addEventListener("focus", () => {
                this.prevFocus = button;
            })

//            button.addEventListener("keydown", (event) => {
//                if (event.key === "Enter") {
//                }
//            });
        })

        // Focus on the the first button
        setTimeout(() => {
            this.element.querySelector("button[data-button]:not([disabled])").focus();
        }, 10)

        // Inject key press function
        this.submit =  new keyPressListener("Enter", () => {
            console.log(this.answerChoices[this.prevFocus.dataset.button]);
            // Too damn lazy to validate on server-side..,
            // Might change it later :\
            if(this.answerChoices[this.prevFocus.dataset.button].isCorrect){
                this.socket.emit('submit-quiz-event', { difficulty: this.level, details: this.details, quizKey: this.key });
                const trueAnswerPanel = new TrueAnswerPanel();
                trueAnswerPanel.init( document.querySelector(".game-container") );
                this.done();
            } else {
                this.submit.unbind();
                // TODO : more to be improved
                const wrongAnswerPanel = new WrongAnswerPanel();
                wrongAnswerPanel.init( document.querySelector(".game-container") );
                this.element.remove();

                window.awayFromTerminalCount[this.key] = 11;
                window.awayFromTerminal[this.key] = setInterval(() => {
                    window.awayFromTerminalCount[this.key]--;
                    console.log(window.awayFromTerminalCount);
                    if(window.awayFromTerminalCount[this.key] <= 0){
                        clearInterval(window.awayFromTerminal[this.key]);
                        delete window.awayFromTerminal[this.key];
                        delete window.awayFromTerminalCount[this.key];
                    }
                }, 1000)
            }
        })
        this.abort = new keyPressListener("Backspace", () => {
            this.done();
        })
        this.up = new keyPressListener("ArrowUp", () => {
            console.log('up button clicked');
            const current = Number(this.prevFocus.getAttribute("data-button"));
            const prevButton = Array.from(this.element.querySelectorAll("button[data-button]")).reverse().find(el => {
                return el.dataset.button < current && !el.disabled;
            })
            prevButton?.focus();
            this.toSelectAns = prevButton
        })
        this.down = new keyPressListener("ArrowDown", () => {
            console.log('down button clicked');
            const current = Number(this.prevFocus.getAttribute("data-button"));
            const nextButton = Array.from(this.element.querySelectorAll("button[data-button]")).find(el => {
                return el.dataset.button > current && !el.disabled;
            })
            console.log(nextButton);
            nextButton?.focus();
        })
    }

    done() {
        console.log(this.key);
        this.socket.emit('trmnt-quiz-event', {details: this.details, quizKey: this.key});
        this.submit.unbind();
        this.up.unbind();
        this.down.unbind();
        this.abort.unbind();
        this.element.remove();
        this.quest_timer_tag.remove();
        isAnswering = false;

        if(this.level === 'hard'){
            this.hard_code.remove();
        }
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);
        container.appendChild(this.quest_timer_tag);
        if(this.level === 'hard') { container.appendChild(this.hard_code); }

        const breakCount = document.querySelector('.game-container').querySelector('.qna-panel').getElementsByTagName('br').length
        document.querySelector('.game-container').querySelector('.qna-panel').style.height = `${6+breakCount}5px`;
    }
}
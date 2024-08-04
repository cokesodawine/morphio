class WrongAnswerPanel {
    constructor(){
        this.element = null;
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("wrong-answer-panel");
        this.element.innerHTML = (`
            Sorry mate, wrong answer choice
            <div class="backspace">&lt;- backspace</div>
        `);

        // Inject key press function
        this.abort = new keyPressListener("Backspace", () => {
            this.done();
        })
    }

    done() {
        this.element.remove();
        isAnswering = false;
    }
    
    init(container) {
        this.createElement();
        container.appendChild(this.element);
    }
}
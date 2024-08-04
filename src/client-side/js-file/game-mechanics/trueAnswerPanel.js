class TrueAnswerPanel {
    constructor() {
        this.element = null;
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("true-answer-panel");
        this.element.innerHTML = (`
            HaHa.. you got it
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
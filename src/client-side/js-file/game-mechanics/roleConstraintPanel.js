class RoleConstraintPanel {
    constructor(role){
        this.element = null;
        this.role = role;
        this.message = {
            'blue builder' : "oh ohh... you're blue repair, only allowed to repair RED terminal only",
            'red builder'  : "oh ohh... you're red repair, only allowed to repair BLUE terminal only",
            'blue breaker' : "oh ohh... you're sabotage, only allowed to sabotaage GREEN, YELLOW and ORANGE terminal only",
            'red breaker'  : "oh ohh... you're sabotage, only allowed to sabotaage GREEN, YELLOW and ORANGE terminal only"
        }
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("role-constrait-panel");
        this.element.innerHTML = (`
            ${this.message[this.role]}
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
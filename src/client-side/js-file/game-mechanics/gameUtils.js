const utils = {
    withGrid(n) {
        return n * 16; 
    },
    nextPosition(initialX, initialY, direction) {
        let x = initialX;
        let y = initialY;
        const size = 1;
        if (direction === "left") { 
            x -= size;
        } else if (direction === "right") {
            x += size;
        } else if (direction === "up") {
            y -= size;
        } else if (direction === "down") {
            y += size;
        }
        return {x: Math.round(x), y: Math.round(y)};
    }
}
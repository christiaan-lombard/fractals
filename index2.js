'use strict';

class FractalApp {

    constructor(canvas){
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.width = 0;
        this.height = 0;
        this.pan_x = 0;
        this.pan_y = 0;
        this.scale = 1;


    }
    
    init(){
        this.render();

        this.canvas.addEventListener('wheel', (e) => {
            let scale_add = (0.1 * -Math.sign(e.deltaY) * this.scale);
            this.scale += scale_add;
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.dragging = true;
        });

        this.canvas.addEventListener('mousemove', (e) => {

            if (this.dragging) {
                this.pan_x += event.movementX;
                this.pan_y += event.movementY;
            }

        });

        this.canvas.addEventListener('mouseup', (e) => {
            this.dragging = false;
        });

        window.addEventListener('keypress', (e) => {

            if(e.key === '-'){

            }else if(e.key === '+'){

            }

        });

    }

    resize(){
        this.width = this.canvas.width = document.body.clientWidth;
        this.height = this.canvas.height = document.body.clientHeight;
    }

    render(){

        this.resize();
        this.ctx.clearRect(0,0,this.width, this.height);
        this.ctx.setTransform(this.scale, 0, 0, this.scale, this.pan_x, this.pan_y);

        this.ctx.strokeStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(-10, 0);
        this.ctx.lineTo(10, 0);
        this.ctx.moveTo(0, -10);
        this.ctx.lineTo(0, 10);
        this.ctx.stroke();

        this.ctx.strokeRect(0,0,this.width, this.height);


        window.requestAnimationFrame(() => this.render());

    }


}

var app;

(function(){

    app = new FractalApp(document.getElementById('canvas'));

    app.init();

    console.log(app);

})();


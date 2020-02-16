"use strict";

class FractalApp {

    constructor(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.scale = 0.0015;
        this.scale = 0.0000463547315739489;
        this.dragging = false;
        this.width = document.body.clientWidth;
        this.height = document.body.clientHeight;
        this.origin_x = -this.width / 2;
        this.origin_y = -this.height / 2;
        this.origin_x = -16139;
        this.origin_y = -5617;
        this.n = 80;
        this.imageData = new ImageData(this.width, this.height);
        this.worker = new Worker('worker.js');

        this.tile_width = 100;
        this.tile_height = 100;

    }

    async init() {

        // await this.module.init();

        this.render();

        this.canvas.addEventListener('wheel', (e) => {

            let scale_add = (0.1 * Math.sign(e.deltaY) * this.scale);

            let re = (this.origin_x + (this.width / 2)) * this.scale;
            let im = (this.origin_y + (this.height / 2)) * this.scale;
    
            this.scale += scale_add;
            this.center(re, im);
            this.update();
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.dragging = true;
        });

        this.canvas.addEventListener('mousemove', (e) => {

            if (this.dragging) {
                this.origin_x -= event.movementX;
                this.origin_y -= event.movementY;
            }

        });

        this.canvas.addEventListener('mouseup', (e) => {
            if(this.dragging){
                this.update();
            }

            this.dragging = false;
        });

        window.addEventListener('keypress', (e) => {

            if(e.key === '-'){
                this.n -= 10;
                this.update();
            }else if(e.key === '+'){
                this.n += 10;
                this.update();
            }

        });

        this.worker.onmessage = (m) => {
            
            console.log('web message', m.data.type, m.data);

            if(m.data.type === 'init'){
                this.update();
                this.render();
            }

            if(m.data.type === 'render_complete'){
                this.imageData = new ImageData(m.data.buffer, this.width, this.height);
            }

        };


    }

    update(){
        const body = document.body;

        this.width = body.clientWidth;
        this.height = body.clientHeight;

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        if (this.imageData.width !== this.width || this.imageData.height !== this.imageData.height) {
            this.imageData = new ImageData(this.width, this.height);
        }

        this.worker.postMessage({
            type: 'render',
            width: this.width,
            height: this.height,
            origin_x: this.origin_x,
            origin_y: this.origin_y,
            n: this.n,
            scale: this.scale,
        });

    }

    render() {
        this.ctx.putImageData(this.imageData, 0, 0);
        window.requestAnimationFrame((t) => this.render());
    }

    center(re, lm){

        let x = re / this.scale;
        let y = lm / this.scale;

        this.origin_x = x - this.width/2;
        this.origin_y = y - this.height/2;

    }

}


(function () {

    let canvas = document.getElementById('canvas');
    let app = new FractalApp(canvas);

    app.init()
        .then(() => console.log('App init'))
        .catch(e => console.error('App init error', e));


})();



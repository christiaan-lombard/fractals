"use strict";


class FractalModule {

    constructor() {

        const maxWidth = 2000;
        const maxHeight = 2000;

        const byteSize = (maxWidth * maxHeight * 4);
        const initial = ((byteSize + 0xffff) & ~0xffff) >>> 16;

        console.log('init memory bytes=%d pages=%d', byteSize, initial);

        this.memory = new WebAssembly.Memory({ initial });
        this.memory_array = new Uint32Array(this.memory.buffer);

    }

    async init() {

        return fetch("build/optimized.wasm")
            .then(res => res.arrayBuffer())
            .then(buffer => WebAssembly.instantiate(buffer, {
                env: {
                    memory: this.memory,
                    abort: (e) => console.error(e)
                }
            }))
            .then(module => {
                const exports = module.instance.exports;
                this.writeMandelbrot = exports.writeMandelbrot;
                this.checkIfBelongsToMandelbrotSet = exports.checkIfBelongsToMandelbrotSet;
            })
            .catch(e => console.error(e));
    }

    render(imageData, origin_x, origin_y, n, scale) {

        if (this.writeMandelbrot === undefined) {
            console.error('FractalModule: module not initialized');
            return;
        }

        const argb = new Uint32Array(imageData.data.buffer);

        console.log('rendering w=%d h=%d ox=%d oy=%d scale=%f n=%d', 
            imageData.width, imageData.height,
            origin_x, origin_y, 
            scale, n
        );
        console.time('render');
        let r = this.writeMandelbrot(
            origin_x,
            origin_y,
            imageData.width,
            imageData.height,
            n,scale
        );

        
        
        for(let i = 0; i < argb.length; i++){
            argb[i] = this.memory_array[i];
        }

        // console.log('pi', 
        //     imageData.data
        // );


        // let w = imageData.width, h = imageData.height, im, re, v;

        // for (let y = 0; y < h; y++) {
        //     im = (y + origin_y) * scale;
        //     for (let x = 0; x < w; x++) {

        //         re = (x + origin_x) * scale;
        //         v = this.checkIfBelongsToMandelbrotSet(re, im, n);

        //         if (v == 0) {
        //             imageData.data[(x * 4) + (y * w * 4)] = 0;
        //             imageData.data[(x * 4) + (y * w * 4) + 1] = 0;
        //             imageData.data[(x * 4) + (y * w * 4) + 2] = 0;
        //             imageData.data[(x * 4) + (y * w * 4) + 3] = 255;
        //         } else {
        //             imageData.data[(x * 4) + (y * w * 4)] = v * 255 + 20;
        //             imageData.data[(x * 4) + (y * w * 4) + 1] = v * 255 + 20;
        //             imageData.data[(x * 4) + (y * w * 4) + 2] = v * 255 + 20;
        //             imageData.data[(x * 4) + (y * w * 4) + 3] = 255;
        //         }

        //     }
        // }

        console.timeEnd('render');
        // console.log('wrote', r);

    }


}

class FractalApp {

    constructor(canvas) {

        this.canvas = canvas;
        this.module = new FractalModule();
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

    }

    async init() {

        await this.module.init();

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
                this.update();
            }

        });

        this.canvas.addEventListener('mouseup', (e) => {
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

        this.update();
        this.render();

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

        this.module.render(
            this.imageData,
            this.origin_x,
            this.origin_y,
            this.n,
            this.scale
        );
    }

    render() {

        this.ctx.putImageData(this.imageData, 0, 0);

        // this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        // this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
        // this.ctx.beginPath();
        // this.ctx.moveTo(0,this.height/2);
        // this.ctx.lineTo(this.width,this.height/2);
        // this.ctx.moveTo(this.width / 2,0);
        // this.ctx.lineTo(this.width / 2,this.height);
        // this.ctx.stroke();

        // let re = (this.origin_x + (this.width / 2)) * this.scale;
        // let im = (this.origin_y + (this.height / 2)) * this.scale;

        // this.ctx.fillText(
        //     `R ${re.toFixed(5)} I ${im.toFixed(5)}`, 
        //     this.width / 2, 
        //     this.height / 2
        // );

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



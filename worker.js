
const self = this;

class FractalModule {

    constructor() {

        const maxWidth = 2000;
        const maxHeight = 2000;

        const byteSize = (maxWidth * maxHeight * 4);
        const initial = 100;//((byteSize + 0xffff) & ~0xffff) >>> 16;

        console.log('init memory bytes=%d pages=%d', byteSize, initial);

        this.memory = new WebAssembly.Memory({ initial });
        this.memory_array = new Uint8ClampedArray(this.memory.buffer);

    }

    async init() {

        await fetch("build/optimized.wasm")
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

        self.onmessage = (m) => {
            console.log('got message', m);
        
            if(m.data.type === 'render'){
                frac.render(
                    m.data.width, 
                    m.data.height, 
                    m.data.origin_x, 
                    m.data.origin_y, 
                    m.data.n, 
                    m.data.scale 
                );
            }
            
        };

        postMessage({type: 'init'});

    }

    render(width, height, origin_x, origin_y, n, scale) {

        if (this.writeMandelbrot === undefined) {
            console.error('FractalModule: module not initialized');
            return;
        }

        // const argb = new Uint32Array(imageData.data.buffer);

        console.log('rendering w=%d h=%d ox=%d oy=%d scale=%f n=%d', 
            width, height,
            origin_x, origin_y, 
            scale, n
        );
        console.time('render');
        let r = this.writeMandelbrot(
            origin_x,
            origin_y,
            width,
            height,
            n,scale
        );
        
        // for(let i = 0; i < buffer.length; i++){
        //     buffer[i] = this.memory_array[i];
        // }

        console.timeEnd('render');

        postMessage({
            type: 'render_complete',
            buffer: this.memory_array.slice(0, width * height * 4)
        });

    }


}

let frac = new FractalModule();



frac.init()
    .then(() => {
        
    });


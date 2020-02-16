// The entry file of your WebAssembly module.
// memory.grow(2);



function rgba(r: u32, g: u32, b: u32, a: u32): u32 {
    return (r)
         + (g << 8)
         + (b << 16)
         + (a << 24);
}

function hsl(h: f32, s: f32, l: f32): u32{

    let c:f32 = (1.0 - Mathf.abs(2.0 * l - 1.0)) * s;
    let x:f32 = c * (1.0 - Mathf.abs(((h / 60.0) % 2.0) - 1.0));
    let ma:f32 = l - (c / 2.0);
    let r:f32, g:f32, b:f32;

    if(h < 60.0){
        r = c; g = x; b = 0;
    }else if(h < 120.0){
        r = x; g = c; b = 0;
    }else if(h < 180.0){
        r = 0; g = c; b = x;
    }else if(h < 240.0){
        r = 0; g = x; b = c;
    }else if(h < 300.0){
        r = x; g = 0; b = c;
    }else{
        r = c; g = 0; b = x;
    }

    r = (r + ma) * 255.0;
    g = (g + ma) * 255.0;
    b = (b + ma) * 255.0;

    return rgba(<u32>r, <u32>g, <u32>b, 255);
}

export function writeMandelbrot(xo: i32, yo:i32, w: i32, h: i32, n: i32, scale: f64): i32 {

    let v: f64,
        im: f64, 
        re: f64, 
        xm: i32 = xo + w, 
        ym: i32 = yo + h,
        m = 0;

    for(let y:i32 = yo; y < ym; y++){
        im = <f64>y * scale;
        for(let x:i32 = xo; x < xm; x++){
            re = <f64>x * scale;
            v = checkIfBelongsToMandelbrotSet(re, im, n);
            store<u32>(m, hsl(<f32>v * 300.0, 1.0, 0.5));
            m += 4;
        }
    }


    return m;

}


export function checkIfBelongsToMandelbrotSet(real: f64, imaginary: f64, n: i32): f64 {
    let re: f64 = real;
    let im: f64 = imaginary;
    let temp_re: f64;
    let temp_im: f64;
    for (let i = 0; i < n; i++) {
        temp_re = re * re - im * im + real;
        temp_im = 2.0 * re * im + imaginary;
        re = temp_re;
        im = temp_im;

        // Return a number as a percentage
        if (re * im > 10.0)
            return <f64>i / <f64>n;
    }
    return 0;   // Return zero if in set        
}



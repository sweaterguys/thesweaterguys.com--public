// Typewriter
let clicked = false;

(function load(){
    function loadbar() {
        let img = document.images,
            c = 0,
            tot = img.length;
        if(tot == 0) return doneLoading();
        $("#progress").html(status + "%");
        function imgLoaded(){
            c += 1;
            var perc = ((110/tot*c) << 0) +"%";
            $("#progress").html(perc);
            if(c===tot) return doneLoading();
        }
        function doneLoading(){
            $('#load').fadeTo( "1s", "0", function() {
                $('#load').css("display", "none");
                $('nav').fadeTo( "1s", "1", function(){
                    $('#TypeName').fadeTo( "1s", "1", writer('Jeff Bezos, Mom, Elon Musk'));
                })
            })
        }
        for(let i=0; i<tot; i++) {
            const tImg = new Image();
            tImg.onload  = imgLoaded;
            tImg.onerror = imgLoaded;
            tImg.src     = img[i].src;
        }
    }
    document.addEventListener('DOMContentLoaded', loadbar, false);
}());
let typing;
function sleep(ms) {
    return typing = new Promise(resolve => setTimeout(resolve, ms));
}
async function typeWriter(text){
    let speed = 15;
    let typewriter = $('#TypeName');
    await sleep(1000);
    let names = text.split(', ');
    for (i = 0; i < names.length; i++) {
        let name = names[i];
        for (j = 0; j < name.length; j++) {
            if(clicked !== true){
                let temp = typewriter.val();
                temp += name.charAt(j);
                typewriter.val(temp);
                await sleep(1000 / speed);
            }
        }
        await sleep(5000 / speed);
        for (j = 0; j < name.length; j++) {
            if(clicked !== true) {
                let temp = typewriter.val();
                temp = temp.slice(0, -1);
                typewriter.val(temp);
                await sleep(1000 / speed);
            }
        }
        await sleep(5000 / speed);
    }
}
function writer(text){
    typeWriter(text);
}
document.onkeypress = function() {
    if (clicked === false){
        $('#TypeName').val('');
    }
    clicked = true;
};
function checkout(){
    console.log('what is inf/0?, reply with: theAnswerIs("ANS")');
}
function theAnswerIs(ANS){
    ANS=String(ANS);
    if (ANS === '2'){console.log('correct, now what is the meaning of life? Answer with: Meaning("ANS")')
    } else{console.log('nope.')}
}
function Meaning(ANS){
    ANS=String(ANS);
    if (['sweaters','sweater', 'Sweater', "Sweaters"].includes(ANS)){
        console.log('congratulations.');
        console.log('coupon code: \'†®0∫∫\' for 80% off');
    }else{
        console.log('no.');
    }
}
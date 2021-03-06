;(function(global){
    var buffer = [],
        active = true,
        mark = -1,
        lastChr = "",
        stripLastTwo = false,
        consonents = {
            // key : [character, mahaprana, sanyaka]
            z : [0xda4, 0x00, 0x00],
            Z : [0xda5, 0x00, 0x00],
            w : [0xdca, 0x00, 0x00],
            W : [0x200c, 0x00, 0x00],
            r : [0xdbb, 0x00, 0x00],
            R : [0xdbb, 0x00, 0x00],
            t : [0xdad, 0xdae, 0x00],
            T : [0xda7, 0xda8, 0x00],
            y : [0xdba, 0x00, 0x00],
            Y : [0xdba, 0x00, 0x00],
            p : [0xdb4, 0xdb5, 0x00],
            P : [0xdb5, 0xdb5, 0x00],
            s : [0xdc3, 0xdc2, 0x00],
            S : [0xdc1, 0xdc2, 0x00],
            d : [0xdaf, 0xdb0, 0xdb3],
            D : [0xda9, 0xdaa, 0xdac],
            f : [0xdc6, 0x00, 0x00],
            F : [0xdc6, 0x00, 0x00],
            g : [0xd9c, 0xd9d, 0xd9f],
            G : [0xd9f, 0xd9d, 0x00],
            h : [0xdc4, 0xd83, 0x00],
            H : [0xdc4, 0x00, 0x00],
            j : [0xda2, 0xda3, 0xda6],
            J : [0xda3, 0xda3, 0xda6],
            k : [0xd9a, 0xd9b, 0x00],
            K : [0xd9b, 0xd9b, 0x00],
            l : [0xdbd, 0x00, 0x00],
            L : [0xdc5, 0x00, 0x00],
            x : [0xd82, 0x00, 0x00],
            X : [0xd9e, 0x00, 0x00],
            c : [0xda0, 0xda1, 0x00],
            C : [0xda1, 0xda1, 0x00],
            v : [0xdc0, 0x00, 0x00],
            b : [0xdb6, 0xdb7, 0xdb9],
            B : [0xdb7, 0xdb7, 0xdb9],
            n : [0xdb1, 0x00, 0xd82],
            N : [0xdab, 0x00, 0xd9e],
            m : [0xdb8, 0x00, 0x00],
            M : [0xdb9, 0x00, 0x00]
        },
        vowels = {
            // key : [single0, double0, single1, double1]
            a : [0xd85, 0xd86, 0xdcf, 0xdcf],
            A : [0xd87, 0xd88, 0xdd0, 0xdd1],
            q : [0xd87, 0xd88, 0xdd0, 0xdd1],
            e : [0xd91, 0xd92, 0xdd9, 0xdda],
            E : [0xd91, 0xd92, 0xdd9, 0xdda],
            i : [0xd89, 0xd8a, 0xdd2, 0xdd3],
            I : [0xd93, 0x00, 0xddb, 0xddb],
            o : [0xd94, 0xd95, 0xddc, 0xddd],
            O : [0xd96, 0x00, 0xdde, 0xddf],
            u : [0xd8b, 0xd8c, 0xdd4, 0xdd6],
            U : [0xd8d, 0xd8e, 0xdd8, 0xdf2],
            V : [0xd8f, 0xd90, 0xd8f, 0xd90]
        };

    function reset()
    {
        lastChr = "";
        buffer = [];
        mark = -1;
    }

    function toggleState()
    {
        // Toggle active state
        active = !(active);

        // Reset state variables after deactivating
        if (!active) { reset; }
    }

    function isAlphabetical(charCode)
    {
        if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) {
            return true
        } else {
            return false
        }
    }

    function isVowel(charCode)
    {
        /* A E I O U V
           a e i o u q */
        var vowelCodes = ["65", "69", "73", "79", "85", "86",
                          "97", "101", "105", "111", "117", "113"];
        for(var i=0;i<vowelCodes.length;i++){
            if(vowelCodes[i]==charCode){return true};
        }
        return false;
    }

    function isConsonent(charCode)
    {
        if (isAlphabetical(charCode) && ! isVowel(charCode)){return true;}
        return false;
    }

    function transformContenteditableField(value, stripCount) {
        /**
         * Append character to textContent in conetnteditable field
         * currently being edited
         * credit:
         *  http://stackoverflow.com/a/2943242/96100
         *  http://stackoverflow.com/a/19997193/118872
         */
        var sel, range, textNode;
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
            }
        } else if ((sel = document.selection) && sel.type != "Control") {
            // For IE < 9
            // Note: Not tested. Not complete
            range = sel.createRange();
        }
        clone = range.cloneRange();

        clone.setStart(range.startContainer, range.startOffset - stripCount);
        clone.setEnd(range.startContainer, range.startOffset);
        clone.deleteContents();

        textNode = document.createTextNode(value);
        range.insertNode(textNode);
        // Move caret to the end of the newly inserted text node
        range.setStart(textNode, textNode.length);
        range.setEnd(textNode, textNode.length);

        sel.removeAllRanges();
        sel.addRange(range);
    }

    function transform(e)
    {
        if (!e) var e = window.event; //for IE
        // When inactive, control key pressed or on
        // keys we are not interested in, do nothing
        if (!active || e.ctrlKey || e.which < 65 || e.which > 90) {
            return;
        }

        stripCount = stripLastTwo ? 2 : 1;
        // We've got a workable character. Update text
        inputBox = document.activeElement;
        if (inputBox.value) {
            inputBox.value = inputBox.value.slice(0, stripCount * -1) + lastChr;
        } else {
            transformContenteditableField(lastChr, stripCount);
			// Join all text nodes. Required in Chrome
			inputBox.normalize();
        }

        stripLastTwo = false;
    }

    function sayura(e)
    {
        if (!e) var e = window.event; //for IE

        if (!active || e.ctrlKey) {
            // If inactive or control key pressed, do nothing
            return;
        } else if (e.which == 8) {
            // Backspace. Do the monkey dance
            buffer.pop();
            if (mark != -1) mark--;
            return;
        }

        var value = e.charCode;

        if (isAlphabetical(value)) {
            var chr = String.fromCharCode(value);
            buffer.push(value);
            mark++;

            if(isVowel(value)){
                if(buffer.length == 0 || !isAlphabetical(buffer[mark-1])){
                    lastChr = String.fromCharCode(vowels[chr][0]);
                } else if(isConsonent(buffer[mark-1])){
                    lastChr = String.fromCharCode(vowels[chr][2]);
                } else if(value == buffer[mark-1] && isConsonent(buffer[mark-2])){
                    stripLastTwo = true;
                    lastChr = String.fromCharCode(vowels[chr][3]);
                } else if(value == buffer[mark-1]){
                    stripLastTwo = true;
                    lastChr = String.fromCharCode(vowels[chr][1]);
                }

            } else {
                if(value == 71 && isConsonent(buffer[mark-1])){
                    //sanyaka
                    stripLastTwo = true;
                    prevChar = String.fromCharCode(buffer[mark-1]);
                    lastChr = String.fromCharCode(consonents[prevChar][2]);
                } else if((value == 72 || value == 102) && isConsonent(buffer[mark-1])){
                    stripLastTwo = true;
                    //mahaprana
                    prevChar = String.fromCharCode(buffer[mark-1]);
                    lastChr = String.fromCharCode(consonents[prevChar][1]);
                } else if((value == 82 || value == 89) && isConsonent(buffer[mark-1])){
                    //add al-kirima, zero width joiner and r/y for rakaransaya/yansaya
                    lastChr = String.fromCharCode(0xdca, 0x200d, consonents[chr][0]);
                } else if(value == 87 && isConsonent(buffer[mark-1])){
                    //zero width joiner, al-kirima for bandi-akuru
                    lastChr = String.fromCharCode(0x200d, 0xdca);
                } else {
                    lastChr = String.fromCharCode(consonents[chr][0]);
                }
            }

        } else if (e.charCode != 0){
            //Leaving numbers, signs etc. as it is
            lastChr = String.fromCharCode(value);
            buffer.push(String.fromCharCode(value));
            mark++;
        }
    }

    function init()
    {
        if (active){
            var nodes = document.querySelectorAll("textarea, input[type=text], [contenteditable]");
            len = nodes.length;

            if (len) {
                while (len--){
                    nodes[len].addEventListener('keypress', function(e){sayura(e)}, false);
                    nodes[len].addEventListener('keyup', function(e){transform(e)}, false);
                    nodes[len].addEventListener('focus', function(){reset()}, false);
                }
            }
        };
    }

    document.addEventListener("DOMContentLoaded", init, false);
    global.sayura = init;
    global.sayura.toggle = toggleState;
    if(typeof module !== 'undefined') module.exports = sayura;
})(this);

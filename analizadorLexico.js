let _NOMBRE_ARCHIVO = process.cwd() + "/Prueba.c"
let fs = require('fs');
const { exit } = require('process');
let cont = null;
let tabla_de_simbolos = []
const palabras_reservadas = [
    'PRINTF',
    'WHILE',
    'DEFINE',
    'SCANF',
    'SWITCH',
    'IF',
    'ELSE',
    'CASE',
    'INT',
    'FLOAT',
    'CHAR',
    'DOUBLE',
    'TRY',
    'CATCH',
    'MAIN',
    'VOID',
    'GETS',
    'DO',
    'FOR',
    'BREAK',
    'SYSTEM',
    'RETURN',
    'PAUSE',
];
const simb = ['(', ')', '{', '}', '[', ']', '"', ',']

for (i in palabras_reservadas) {
    tabla_de_simbolos.push(['PALABRA RESERVADA', palabras_reservadas[i]])
}

const operadores_relacionales = ['>', '<', '=', '!']
const operadores = ['+', '*', '/', '-', '%']
let analizis = [];
const data = fs.readFileSync(_NOMBRE_ARCHIVO, 'utf-8')
cont = data + " \0";
let estado = 0;
let contador = -1;
let c = null;
let pal = '';
let ascii = 0;
let linea = 1;
const sigToken = () => {
    if (contador >= cont.length - 2) return ("Fin del archivo")
    while (contador < cont.length - 1) {

        switch (estado) {
            case 0:
                c = cont[++contador];
                ascii = cont.toUpperCase().charCodeAt(contador);
                if (c.charCodeAt() === 13) linea++
                if (operadores_relacionales.includes(c)) {
                    if (c === '<') estado = 1
                    else if (c === '=') estado = 5
                    else if (c === '>') estado = 6
                    else if (c === '!') estado = 40
                    pal += c;
                } else if (ascii > 64 && ascii < 91) {
                    pal += c;
                    estado = 10;
                } else if (!isNaN(parseInt(c))) {
                    pal += c;
                    estado = 13;
                } else if (simb.includes(c)) {
                    estado = 22

                } else if (operadores.includes(c)) {
                    estado = 23;
                } else {
                    if (c.charCodeAt() >= 08 || c.charCodeAt() <= 15 || c.charCodeAt() == 32) estado = 0
                    else {
                        console.log("error en la linea ---->", linea, c.charCodeAt())
                        exit(1)
                    }
                }
                break;
            case 1:
                c = cont[++contador];
                ascii = cont.toUpperCase().charCodeAt(contador);
                if (c === '>') {
                    pal += c;
                    estado = 3;
                } else if (c === '=') {
                    pal += c;
                    estado = 2;
                } else {
                    estado = 4;
                }
                break;

            case 2:
                analizis.push(['oprel', 'LE']);
                pal = '';
                estado = 0;
                return "(LE, <=)"
                break;
            case 3:
                analizis.push(['oprel', 'NE']);

                pal = '';
                estado = 0;
                return "(NE, <>)"
                break;
            case 4:
                analizis.push(['oprel', 'LT']);
                pal = ''
                estado = 0;
                return "(LT, <)"
                break;
            case 5:
                analizis.push(['oprel', 'EQ']);
                pal = '';
                estado = 0;
                return "(EQ, =)"
                break;
            case 40:
                analizis.push(['oprel', 'DIS']);
                pal = '';
                estado = 0;
                return "(DIS, !)"
                break;
            case 6:
                c = cont[++contador]
                if (c === '=') {
                    pal += c;
                    estado = 7;
                } else {
                    estado = 8;
                }
                break;
            case 7:
                analizis.push(['oprel', 'GE'])

                pal = ''
                estado = 0
                return "(GE, >=)"
                break;
            case 8:
                analizis.push(['oprel', 'GT']);
                pal = '';
                estado = 0;
                return "(GT, >)"
                break;
            case 9: break;
            case 10:
                c = cont[++contador]
                ascii = cont.toUpperCase().charCodeAt(contador);
                if (ascii > 64 && ascii < 91 || (ascii > 47 && ascii < 58)) {
                    pal += c;
                    estado = 10;
                } else {
                    --contador
                    estado = 11
                }
                break;
            case 11:
                let con = pal
                pal = ''
                estado = 0
                send = pal
                if (palabras_reservadas.includes(con.toUpperCase())) {
                    return "(PALABRA RESERVADA, " + con + ")"
                } else {
                    tabla_de_simbolos.push(['id', con]);
                    return "(ID" + con + ")"
                }


                break;
            case 12: break;
            case 13:

                c = cont[++contador]

                if (!isNaN(parseInt(c))) {

                    pal += c;
                } else if (c === '.') {
                    pal += c;
                    estado = 14;
                } else if (c === 'E' || c == 'e') {
                    pal += c;
                    estado = 16;
                } else if (c === ' ') {
                    estado = 20;
                } else if (c.charCodeAt() === 13) {
                    linea++;
                    estado = 20;
                } else {
                    --contador
                    estado = 20;
                }
                break;
            case 14:
                c = cont[++contador]
                if (!isNaN(parseInt(c))) {
                    pal += c;
                    estado = 15;
                } else if (c === 'E' || c === 'e') {
                    pal += c;
                    estado = 16;
                } else {
                    console.error("error en la linea:->>> " + linea, c.charCodeAt());
                    process.exit(-1)
                }
                break;

            case 15:
                c = cont[++contador]
                if (!isNaN(parseInt(c))) {
                    pal += c;
                } else if (c === 'E' || c === 'e') {
                    pal += c;
                    estado = 16;
                } else if (c === ' ') {
                    estado = 21;
                } else if (c.charCodeAt() === 13) {
                    linea++;
                    estado = 21;
                } else {
                    contador--
                    estado = 20
                }
                break;
            case 16:
                c = cont[++contador]
                if (c === '+' || c === '-') {
                    pal += c
                    estado = 17
                } else if (!isNaN(parseInt(c))) {
                    pal += c;
                    estado = 18;
                }
                break;
            case 17:
                c = cont[++contador]
                if (!isNaN(parseInt(c))) {
                    pal += c;
                    estado = 18;
                } else {
                    console.error("error en la linea: " + linea);
                    process.exit(-1)
                }
                break;
            case 18:
                c = cont[++contador]

                if (!isNaN(parseInt(c))) {
                    pal += c;
                } else if (c.charCodeAt() === 13) {
                    linea++;
                    estado = 19;
                } else {
                    estado = 20
                    contador--
                }
                break;
            case 19:
                send = pal
                pal = ''
                estado = 0
                return "(LITERAL, " + send + ")"
                break;
            case 20:
                send = pal
                pal = ''
                estado = 0
                return "(LITERAL, " + send + ")"
                break;
            case 21:
                send = pal
                pal = ''
                estado = 0
                return "(LITERAL, " + send + ")"
                break;
            case 22:
                estado = 0
                if (c === '(') {
                    return "(APERTURA PARENTESIS,'" + c + "')"
                } else if (c === ')') {
                    return "(CERRADURA PARENTESIS,'" + c + "')"
                } else if (c === '}') {
                    return "(CERRADURA LLAVE,'" + c + "')"
                } else if (c === '{') {
                    return "(APERTURA LLAVE,'" + c + "')"
                } else if (c === '[') {
                    return "(APERTURA CORCHETE,'" + c + "')"
                } else if (c === ']') {
                    return "(CERRADURA CORCHETE,'" + c + "')"
                } else if (c === '"') {
                    estado = 24
                    pal += c
                    c = cont[++contador];
                } else if (c === ',') {
                    return "(COMA,'" + c + "')"
                }
                break;
            case 23:
                estado = 0
                if (c === '*') {
                    return "(MULTIPLICACIÓN,'" + c + "')"
                } else if (c === '+') {
                    return "(SUMA,'" + c + "')"
                } else if (c === '-') {
                    return "(RESTA,'" + c + "')"
                } else if (c === '/') {
                    return "(DIVISION,'" + c + "')"
                } else if (c === '%') {
                    return "(MODULO,'" + c + "')"
                }
                break;
            case 24:
                pal += c
                if (c != '"') {
                    estado = 24
                    c = cont[++contador]
                }
                else {
                    estado = 0
                    let pal2 = pal
                    pal = ''
                    return "(LITERAL,'" + pal2 + "')"
                }
                break;
        }
    }
}

console.log(sigToken());


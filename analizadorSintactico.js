const { grammar, simbolos } = require('./gramatica.jms')
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
const simb = ['(', ')', '{', '}', '[', ']', '"', ',', ";"]
const operadores_relacionales = ['>', '<', '=', '!']
const operadores = ['+', '*', '/', '-', '%']

for (i in palabras_reservadas) {
  tabla_de_simbolos.push(['PALABRA RESERVADA', palabras_reservadas[i]])
}
let analizis = [];
const data = fs.readFileSync(_NOMBRE_ARCHIVO, 'utf-8')
cont = data + " \0";
let estado = 0;
let contador = -1;
let c = null;
let pal = '';
let ascii = 0;
let linea = 1;
let preanalisis
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
        } else if (c == "$") {
          estado = 0
          pal = ''
          return ["Nulo", "$"]
        }
        else {
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
        return ["LE", "<="]
        break;
      case 3:
        analizis.push(['oprel', 'NE']);

        pal = '';
        estado = 0;
        return ["NE", "<>"]
        break;
      case 4:
        analizis.push(['oprel', 'LT']);
        pal = ''
        estado = 0;
        return ["LT", "<"]
        break;
      case 5:
        analizis.push(['oprel', 'EQ']);
        pal = '';
        estado = 0;
        return ["EQ", "="]
        break;
      case 40:
        analizis.push(['oprel', 'DIS']);
        pal = '';
        estado = 0;
        return ["DIS", "!"]
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
        return ["GE", ">="]
        break;
      case 8:
        analizis.push(['oprel', 'GT']);
        pal = '';
        estado = 0;
        return ["GT", ">"]
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
          return ["PALABRA RESERVADA", con.toUpperCase()]
        } else {
          tabla_de_simbolos.push(['id', con.toUpperCase()]);
          return [con, "ID"]
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
        return [send, "NUMBER"]
        break;
      case 20:
        send = pal
        pal = ''
        estado = 0
        return [send, "NUMBER"]
        break;
      case 21:
        send = pal
        pal = ''
        estado = 0
        return [send, "NUMBER"]
        break;
      case 22:
        estado = 0
        if (c === '(') {
          return ["APERTURA PARENTESIS", c]
        } else if (c === ')') {
          return ["CERRADURA PARENTESIS", c]
        } else if (c === '}') {
          return ["CERRADURA LLAVE", c]
        } else if (c === '{') {
          return ["APERTURA LLAVE", c]
        } else if (c === '[') {
          return ["APERTURA CORCHETE", c]
        } else if (c === ']') {
          return ["CERRADURA CORCHETE", c]
        } else if (c === '"') {
          estado = 24
          pal += c
          c = cont[++contador];
        } else if (c === ',') {
          return ["COMA", c]
        } else if (c === ';') {
          return ["PUNTO Y COMA", c]
        }
        break;
      case 23:
        estado = 0
        if (c === '*') {
          return ["MULTIPLICACION", c]
        } else if (c === '+') {
          return ["SUMA", c]
        } else if (c === '-') {
          return ["RESTA", c]
        } else if (c === '/') {
          return ["DIVISION", c]
        } else if (c === '%') {
          return ["MODULO", c]
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
          return [pal2, "STRING"]
        }
        break;

    }
  }
}



const Program = () => {
  switch (preanalisis) {
    case "INT":
      TypeId()
      Decl()
      break;
    case "CHAR":
      TypeId()
      Decl()
      break;
    case "BOOL":
      TypeId()
      Decl()
      break;
    case "FLOAT":
      TypeId()
      Decl()
      break;
    case "VOID":
      coincidir("VOID")
      coincidir("ID")
      Funcs()
      break;
      break; default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const TypeId = () => {
  switch (preanalisis) {
    case "INT":
      TypeSpec()
      coincidir("ID")
      break;
    case "CHAR":
      TypeSpec()
      coincidir("ID")
      break;
    case "BOOL":
      TypeSpec()
      coincidir("ID")
      break;
    case "FLOAT":
      TypeSpec()
      coincidir("ID")
      break;
      break; default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const Decl = () => {
  switch (preanalisis) {
    case "[":
      Vars()
      break;
    case "(":
      Funcs()
      break;

    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const TypeSpec = () => {
  switch (preanalisis) {
    case "INT":
      coincidir("INT")
      break;
    case "CHAR":
      coincidir("CHAR")
      break;
    case "BOOL":
      coincidir("BOOL")
      break;
    case "FLOAT":
      coincidir("FLOAT")
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const Vars = () => {
  switch (preanalisis) {
    case "[":
      ArrayDecl()
      VarDeclInit()
      DecList()
      coincidir(";")
      Decl2()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const ArrayDecl = () => {
  switch (preanalisis) {
    case "[":
      coincidir("[")
      coincidir("NUMCONST")
      coincidir("]")
      break;

  }
}
const VarDeclInit = () => {
  switch (preanalisis) {
    case "=":
      coincidir("=")
      Expresion()
      break;

  }
}
const DecList = () => {
  switch (preanalisis) {
    case ",":
      coincidir(",")
      VarNames()
      break;

  }
}
const VarNames = () => {
  switch (preanalisis) {
    case "ID":
      coincidir("ID")
      ArrayDecl()
      VarDeclInit()
      DecList()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const Decl2 = () => {
  switch (preanalisis) {
    case "INT":
      coincidir("ID")
      ArrayDecl()
      VarDeclInit()
      DecList()
      break;
    case "CHAR":
      coincidir("CHAR")
      ArrayDecl()
      VarDeclInit()
      DecList()
      break;
    case "BOOL":
      coincidir("BOOL")
      ArrayDecl()
      VarDeclInit()
      DecList()
      break;
    case "FLOAT":
      coincidir("FLOAT")
      ArrayDecl()
      VarDeclInit()
      DecList()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const Funcs = () => {
  switch (preanalisis) {
    case "(":
      coincidir("(")
      Params()
      coincidir(")")
      Stmt()
      FunDecListPrima()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const FunDecListPrima = () => {
  switch (preanalisis) {
    case "INT":
      FunDecList()
      FunDecListPrima()
      break;
    case "CHAR":
      FunDecList()
      FunDecListPrima()
      break;
    case "BOOL":
      FunDecList()
      FunDecListPrima()
      break;
    case "FLOAT":
      FunDecList()
      FunDecListPrima()
      break;

  }
}
const FunDecList = () => {
  switch (preanalisis) {
    case "INT":
      TypeSpec()
      coincidir("ID")
      coincidir("(")
      Params()
      coincidir(")")
      FuncStmt()
      break;
    case "CHAR":
      TypeSpec()
      coincidir("ID")
      coincidir("(")
      Params()
      coincidir(")")
      FuncStmt()
      break;
    case "BOOL":
      TypeSpec()
      coincidir("ID")
      coincidir("(")
      Params()
      coincidir(")")
      FuncStmt()
      break;
    case "FLOAT":
      TypeSpec()
      coincidir("ID")
      coincidir("(")
      Params()
      coincidir(")")
      FuncStmt()
      break;
    case "VOID":
      coincidir("VOID")
      coincidir("ID")
      coincidir("(")
      Params()
      coincidir(")")
      FuncStmt()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const Params = () => {
  switch (preanalisis) {
    case "INT":
      Param()
      ParamsPrima()
      break;
    case "CHAR":
      Param()
      ParamsPrima()
      break;
    case "BOOL":
      Param()
      ParamsPrima()
      break;
    case "FLOAT":
      Param()
      ParamsPrima()
      break;

  }
}
const ParamsPrima = () => {
  switch (preanalisis) {
    case ",":
      coincidir(",")
      Param()
      ParamsPrima()
      break;
    case "$": break; default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const Param = () => {
  switch (preanalisis) {
    case "INT":
      TypeSpec()
      coincidir("ID")
      break;
    case "CHAR":
      TypeSpec()
      coincidir("ID")
      break;
    case "BOOL":
      TypeSpec()
      coincidir("ID")
      break;
    case "FLOAT":
      TypeSpec()
      coincidir("ID")
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const FuncStmt = () => {
  switch (preanalisis) {
    case "{":
      Stmt()
      ReturnStmt()
      coincidir("}")
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const ReturnStmt = () => {
  switch (preanalisis) {
    case "return":
      coincidir("return")
      if (preanalisis == ";") coincidir(";")
      else { Expresion(); coincidir(";"); }
      break;

  }
}
const Stmts = () => {
  switch (preanalisis) {
    case "ID":
      Stmt()
      Stmts()
      break;
    case "!":
      Stmt()
      Stmts()
      break;
    case "-":
      Stmt()
      Stmts()
      break;
    case "true":
      Stmt()
      Stmts()
      break;
    case "false":
      Stmt()
      Stmts()
      break;
    case "NUMBER":
      Stmt()
      Stmts()
      break;
    case "STRING":
      Stmt()
      Stmts()
      break;
    case "ID":
      Stmt()
      Stmts()
      break;
    case "(":
      Stmt()
      Stmts()
      break;
    case "IF":
      Stmt()
      Stmts()
      break;
    case "while":
      Stmt()
      Stmts()
      break;
    case "for":
      Stmt()
      Stmts()
      break;

  }
}
const Stmt = () => {
  switch (preanalisis) {
    case "ID":
      ExprStmt()
      break;
    case "!":
      ExprStmt()
      break;
    case "-": break;
    case "true":
      ExprStmt()
      break;
    case "false":
      ExprStmt()
      break;
    case "NUMBER":
      ExprStmt()
      break;
    case "STRING":
      ExprStmt()
      break;
    case "ID":
      ExprStmt()
      break;
    case "(":
      ExprStmt()
      break;
    case "IF":
      IfStmt()
      break;
    case "WHILE":
      WhileStmt()
      break;
    case "FOR":
      ForStmt()
      break;
      break; default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const ExprStmt = () => {
  switch (preanalisis) {
    case "ID":
      Expresion()
      coincidir(";")
      break;
    case "!":
      Expresion()
      coincidir(";")
      break;
    case "-":
      Expresion()
      coincidir(";")
      break;
    case "true":
      Expresion()
      coincidir(";")
      break;
    case "false":
      Expresion()
      coincidir(";")
      break;
    case "NUMBER":
      Expresion()
      coincidir(";")
      break;
    case "STRING":
      Expresion()
      coincidir(";")
      break;
    case "ID":
      Expresion()
      coincidir(";")
      break;
    case "(":
      Expresion()
      coincidir(";")
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const Expresion = () => {
  switch (preanalisis) {
    case "ID":
      Assignement()
      break;
    case "!":
      Assignement()
      break;
    case "-":
      Assignement()
      break;
    case "true":
      Assignement()
      break;
    case "false":
      Assignement()
      break;
    case "NUMBER":
      Assignement()
      break;
    case "STRING":
      Assignement()
      break;
    case "ID":
      Assignement()
      break;
    case "(":
      Assignement()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const Assignement = () => {
  switch (preanalisis) {
    case "ID":
      coincidir("ID")
      coincidir("=")
      Assignement()
      break;
    case "!":
      LogicOr()
      break;
    case "-":
      LogicOr()
      break;
    case "true":
      LogicOr()
      break;
    case "false":
      LogicOr()
      break;
    case "NUMBER":
      LogicOr()
      break;
    case "STRING":
      LogicOr()
      break;
    case "ID":
      LogicOr()
      break;
    case "(":
      LogicOr()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const LogicOr = () => {
  switch (preanalisis) {
    case "ID":
      LogicAnd()
      LogicOrPrima()
      break;
    case "!":
      LogicAnd()
      LogicOrPrima()
      break;
    case "-":
      LogicAnd()
      LogicOrPrima()
      break;
    case "true":
      LogicAnd()
      LogicOrPrima()
      break;
    case "false":
      LogicAnd()
      LogicOrPrima()
      break;
    case "NUMBER":
      LogicAnd()
      LogicOrPrima()
      break;
    case "STRING":
      LogicAnd()
      LogicOrPrima()
      break;
    case "ID":
      LogicAnd()
      LogicOrPrima()
      break;
    case "(":
      LogicAnd()
      LogicOrPrima()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const LogicOrPrima = () => {
  switch (preanalisis) {
    case "||":
      LogicAnd()
      LogicOrPrima()
      break;

  }
}
const LogicAnd = () => {
  switch (preanalisis) {
    case "ID":
      Equality()
      LogicAndPrima()
      break;
    case "!":
      Equality()
      LogicAndPrima()
      break;
    case "-":
      Equality()
      LogicAndPrima()
      break;
    case "true":
      Equality()
      LogicAndPrima()
      break;
    case "false":
      Equality()
      LogicAndPrima()
      break;
    case "NUMBER":
      Equality()
      LogicAndPrima()
      break;
    case "STRING":
      Equality()
      LogicAndPrima()
      break;
    case "(":
      Equality()
      LogicAndPrima()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const LogicAndPrima = () => {
  switch (preanalisis) {
    case "&&":
      Equality()
      LogicAndPrima()
      break;

  }
}
const Equality = () => {
  switch (preanalisis) {
    case "ID":
      Comparison()
      EqualityPrima()
      break;
    case "!":
      Comparison()
      EqualityPrima()
      break;
    case "-":
      Comparison()
      EqualityPrima()
      break;
    case "true":
      Comparison()
      EqualityPrima()
      break;
    case "false":
      Comparison()
      EqualityPrima()
      break;
    case "NUMBER":
      Comparison()
      EqualityPrima()
      break;
    case "STRING":
      Comparison()
      EqualityPrima()
      break;
    case "(":
      Comparison()
      EqualityPrima()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const EqualityPrima = () => {
  switch (preanalisis) {
    case "¡":
      CompOper()
      Comparison()
      EqualityPrima()
      break;
    case "=":
      CompOper()
      Comparison()
      EqualityPrima()
      break;

  }
}
const CompOper = () => {
  switch (preanalisis) {
    case "¡":
      coincidir("¡")
      coincidir("=")
      break;
    case "=":
      coincidir("=")
      coincidir("=")
      break;
      break; default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const Comparison = () => {
  switch (preanalisis) {
    case "ID":
      Term()
      ComparisonPrima()
      break;
    case "!":
      Term()
      ComparisonPrima()
      break;
    case "-":
      Term()
      ComparisonPrima()
      break;
    case "true":
      Term()
      ComparisonPrima()
      break;
    case "false":
      Term()
      ComparisonPrima()
      break;
    case "NUMBER":
      Term()
      ComparisonPrima()
      break;
    case "STRING":
      Term()
      ComparisonPrima()
      break;
    case "(":
      Term()
      ComparisonPrima()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const ComparisonPrima = () => {
  switch (preanalisis) {
    case ">":
      LogicOperator()
      Term()
      ComparisonPrima()
      break;
    case ">=":
      LogicOperator()
      Term()
      ComparisonPrima()
      break;
    case "<":
      LogicOperator()
      Term()
      ComparisonPrima()
      break;
    case "<=":
      LogicOperator()
      Term()
      ComparisonPrima()
      break;

  }
}
const LogicOperator = () => {
  switch (preanalisis) {
    case ">":
      coincidir(">")
      break;
    case ">=":
      coincidir(">=")
      break;
    case "<":
      coincidir("<")
      break;
    case "<=":
      coincidir("<=")
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const Term = () => {
  switch (preanalisis) {
    case "ID":
      Factor()
      TermPrima()
      break;
    case "!":
      Factor()
      TermPrima()
      break;
    case "-":
      Factor()
      TermPrima()
      break;
    case "true":
      Factor()
      TermPrima()
      break;
    case "false":
      Factor()
      TermPrima()
      break;
    case "NUMBER":
      Factor()
      TermPrima()
      break;
    case "STRING":
      Factor()
      TermPrima()
      break;
    case "(":
      Factor()
      TermPrima()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const TermPrima = () => {
  switch (preanalisis) {
    case "-":
      coincidir("-")
      Factor()
      TermPrima()
      break;
    case "+":
      coincidir("+")
      Factor()
      TermPrima()
      break;

  }
}
const Factor = () => {
  switch (preanalisis) {
    case "ID":
      Unary()
      FactorPrima()
      break;
    case "!":
      Unary()
      FactorPrima()
      break;
    case "-":
      Unary()
      FactorPrima()
      break;
    case "true":
      Unary()
      FactorPrima()
      break;
    case "false":
      Unary()
      FactorPrima()
      break;
    case "NUMBER":
      Unary()
      FactorPrima()
      break;
    case "STRING":
      Unary()
      FactorPrima()
      break;
    case "(":
      Unary()
      FactorPrima()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const FactorPrima = () => {
  switch (preanalisis) {
    case "/":
      coincidir("/")
      Unary()
      FactorPrima()
      break;
    case "*":
      coincidir("*")
      Unary()
      FactorPrima()
      break;
  }
}
const Unary = () => {
  switch (preanalisis) {
    case "ID":
      Call()
      break;
    case "!":
      UnaryOp()
      Unary()
      break;
    case "-":
      UnaryOp()
      Unary()
      break;
    case "true":
      Call()
      break;
    case "false":
      Call()
      break;
    case "NUMBER":
      Call()
      break;
    case "STRING":
      Call()
      break;
    case "(":
      Call()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const UnaryOp = () => {
  switch (preanalisis) {
    case "!":
      coincidir("!")
      break;
    case "-":
      coincidir("-")
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const Call = () => {
  switch (preanalisis) {
    case "true":
      Primary()
      CallFunc()
      break;
    case "false":
      Primary()
      CallFunc()
      break;
    case "NUMBER":
      Primary()
      CallFunc()
      break;
    case "STRING":
      Primary()
      CallFunc()
      break;
    case "ID":
      Primary()
      CallFunc()
      break;
    case "(":
      Primary()
      CallFunc()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const CallFunc = () => {
  switch (preanalisis) {
    case "(":
      coincidir("(")
      Params()
      coincidir(")")
      break;

  }
}
const Primary = () => {
  switch (preanalisis) {
    case "true":
      coincidir("true")
      break;
    case "false":
      coincidir("false")
      break;
    case "NUMBER":
      coincidir("NUMBER")
      break;
    case "STRING":
      coincidir("STRING")
      break;
    case "ID":
      coincidir("ID")
      break;
    case "(":
      coincidir("(")
      Expresion()
      coincidir(")")
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const IfStmt = () => {
  switch (preanalisis) {
    case "IF":
      coincidir("IF")
      coincidir("(")
      Expresion()
      coincidir(")")
      coincidir("{")
      Stmts()
      coincidir("}")
      ElseStmt()
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const ElseStmt = () => {
  switch (preanalisis) {
    case "else":
      coincidir("else")
      coincidir("{")
      Stmts()
      coincidir("}")
      break;

  }
}
const WhileStmt = () => {
  switch (preanalisis) {
    case "while":
      coincidir("while")
      coincidir("(")
      Expresion()
      coincidir("{")
      Stmts()
      coincidir("}")
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const ForStmt = () => {
  switch (preanalisis) {
    case "for":
      coincidir("for")
      coincidir("(")
      ForExpr()
      coincidir(";")
      ForExpr()
      coincidir(";")
      ForExpr()
      coincidir(")")
      coincidir("{")
      Stmts()
      coincidir("}")
      break;
    default: console.log("Hubo un error en la gramatica con : ", preanalisis); break;
  }
}
const ForExpr = () => {
  switch (preanalisis) {
    case "ID":
      Expresion()
      break;
    case "!":
      Expresion()
      break;
    case "-":
      Expresion()
      break;
    case "true":
      Expresion()
      break;
    case "false":
      Expresion()
      break;
    case "NUMBER":
      Expresion()
      break;
    case "STRING":
      Expresion()
      break;
    case "ID":
      Expresion()
      break;
    case "(":
      Expresion()
      break;

  }
}



const SIZE = grammar.length
let arreglo = []
let simbolosPrimero = {}

const Primero = (simbolo) => {
  if (!simbolos.includes(simbolo)) {
    arreglo.push(simbolo)
    return
  }
  for (let i = 0; i < SIZE; i++) {
    if (grammar[i].name == simbolo) {
      Primero(grammar[i].symbols[0])
    }
  }
}

const funcionesPrimero = () => {
  for (let i = 0; i < SIZE; i++) {
    Primero(grammar[i].symbols[0])
    simbolosPrimero[grammar[i].name] = arreglo
    if (i < SIZE - 1)
      if (grammar[i + 1].name != grammar[i].name) arreglo = []
  }
}

const coincidir = (t) => {
  if (preanalisis.toUpperCase() == t.toUpperCase()) {
    try {
      preanalisis = sigToken()[1];
    } catch (err) {
    }
  }
  else console.log("error de sintaxis", preanalisis);
}

funcionesPrimero()
preanalisis = sigToken()[1]
Program()
console.log("Programa sin errores")

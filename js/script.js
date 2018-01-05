function Token(type, value) {
		this.type = type;
		this.value = value;
}

/*
		Token types
*/
var Type = {
		NUMBER: "NUMBER",
		ADDITION: "ADDITION",
		SUBTRACTION: "SUBTRACTION",
		MULTIPLICATION: "MULTIPLICATION",
		DIVISION: "DIVISION",
		EOF: "EOF",
		LPAREN: "LPAREN",
		RPAREN: "RPAREN"
}

/*
		Regex Helpers
*/

var regexHelpers = (function() {
		return {
				isWhiteSpace: function(character) {
						return / /.test(character);
				},
				isInteger: function(character) {
						return /\d+/.test(character);
				},
				isAdditionOp: function(character) {
						return /\+/.test(character);
				},
				isSubtractOp: function(character) {
						return /\-/.test(character);
				},
				isMultiplyOp: function(character) {
						return /\*/.test(character);
				},
				isDivideOp: function(character) {
						return /\//.test(character);
				},
				isLParenOp: function(character) {
						return /\(/.test(character);
				},
				isRParenOp: function(character) {
						return /\)/.test(character);
				},
				isDecimal: function(character) {
						return /^\.$/.test(character);
				}
		}
}());

var Lexer = function(regexHelpers) {
		var tokens = [];
		var position = 0;
		var currentChar;
		var text;
		var helpers = regexHelpers;

		var advance = function() {
				position += 1;
				if (position >= text.length) {
						currentChar = null;
				} else {
						currentChar = text.charAt(position);
				}

		};

		var createNumber = function() {
				var sum = "";
				while (helpers.isInteger(currentChar) || helpers.isDecimal(currentChar)) {
						sum += currentChar;
						advance();
				}

				if (sum.indexOf(".") !== -1) {
						try {
								sum = parseFloat(sum);
						} catch (e) {
								throw new Error("lexer error");
						}
				} else {
						sum = parseInt(sum, 10);
				}
				return sum;
		};

		var skipWhiteSpace = function() {
				while (helpers.isWhiteSpace(currentChar)) {
						advance();
				}
		}

		return {
				init: function(str) {
						text = str;
						currentChar = text.charAt(position);
				},
				getText: function() {
						return text;
				},
				createTokens: function() {
						while (currentChar !== null) {
								if (helpers.isWhiteSpace(currentChar)) {
										advance();
								}

								if (helpers.isDecimal(currentChar)) {
										tokens.push(new Token(Type.NUMBER, createNumber(currentChar)));
										continue;
								}

								if (helpers.isInteger(currentChar)) {
										tokens.push(new Token(Type.NUMBER, createNumber(currentChar)));
										continue;
								}

								if (helpers.isAdditionOp(currentChar)) {
										tokens.push(new Token(Type.ADDITION, "+"));
										advance();
										continue;
								}

								if (helpers.isSubtractOp(currentChar)) {
										tokens.push(new Token(Type.SUBTRACTION, "-"));
										advance();
										continue;
								}

								if (helpers.isMultiplyOp(currentChar)) {
										tokens.push(new Token(Type.MULTIPLICATION, "*"));
										advance();
										continue;
								}

								if (helpers.isDivideOp(currentChar)) {
										tokens.push(new Token(Type.DIVISION, "/"));
										advance();
										continue;
								}

								if (helpers.isLParenOp(currentChar)) {
										tokens.push(new Token(Type.LPAREN, "("));
										advance();
										continue;
								}

								if (helpers.isRParenOp(currentChar)) {
										tokens.push(new Token(Type.RPAREN, ")"));
										advance();
										continue;
								}

								throw new Error("lexer error");
						}
						if (currentChar === null) {
								tokens.push(new Token(Type.EOF, "EOF"));
						} else {
								throw new Error("lexer error");
						}

						return tokens;
				},
				helpers: function() {
						return helpers;
				}
		}
};

var Interpreter = function() {
		var position = 0;
		var tokens;
		var currentToken;

		var advance = function() {
				position += 1;
				currentToken = tokens[position];
		};

		var verifyToken = function(type) {
				if (currentToken.type === type) {
						advance();
				} else {
						throw new Error("parsing error");
				}
		};

		var term = function() {
				var result = factor();

				while (currentToken.type === "MULTIPLICATION" || currentToken.type === "DIVISION") {
						if (currentToken.type === "MULTIPLICATION") {
								verifyToken("MULTIPLICATION");
								result *= factor();
						} else if (currentToken.type === "DIVISION") {
								verifyToken("DIVISION");
								result /= factor();
						}
				}

				return result;
		}

		var factor = function() {
				var result = "";

				if (currentToken.type === "NUMBER") {
						result = currentToken.value;
						verifyToken("NUMBER");
				} else if (currentToken.type === "LPAREN") {
						verifyToken("LPAREN");
						result = expr();
						verifyToken("RPAREN");
				}

				return result;
		}

		var expr = function() {

				var result = term();

				while (currentToken.type === "ADDITION" || currentToken.type === "SUBTRACTION") {
						if (currentToken.type === "ADDITION") {
								verifyToken("ADDITION");
								result += term();
						} else if (currentToken.type === "SUBTRACTION") {
								verifyToken("SUBTRACTION");
								result -= term();
						}
				}

				return result;
		}

		return {
				init: function(tokensArr) {
						tokens = tokensArr;
						currentToken = tokens[position];
				},
				getTokens: function() {
						return tokens;
				},
				expr: expr
		}
};


$(document).ready(function() {

		var sum = "";

		function clickHandler(e) {
				var foo = $(this).data("id");

				if (foo === "c") {
						sum = "";
						$(".calc_total_display_number").val(sum);
				} else if (foo !== "=") {
						if (sum === "0") {
								sum = "";
						} else {
								sum += foo;
						}
						$(".calc_total_display_number").val(sum);
				} else {
						var lexer = Lexer(regexHelpers);
						lexer.init(sum);
						var tokens = lexer.createTokens();
						var interpret = Interpreter();
						interpret.init(tokens);
						sum = interpret.expr();
						$(".calc_total_display_number").val(sum);
				}


		}

		var keyMap = {
				"13": "=",
				"42": "*",
				"43": "+",
				"45": "-",
				"46": ".",
				"47": "/",
				"48": "0",
				"49": "1",
				"50": "2",
				"51": "3",
				"52": "4",
				"53": "5",
				"54": "6",
				"55": "7",
				"56": "8",
				"57": "9"
		}

		function keyHandler(e) {
				var key = e.which;

				if (key === 67 || key === 99) {
						sum = "";
						$(".calc_total_display_number").val(sum);
				} else if (key === 13) {
						var lexer = Lexer(regexHelpers);
						lexer.init(sum);
						var tokens = lexer.createTokens();
						var interpret = Interpreter();
						interpret.init(tokens);
						sum = interpret.expr();
						$(".calc_total_display_number").val(sum);
						console.log(sum);
				} else if (key === 47 || key === 42 || key === 45 || key === 43 || key === 41 || key === 40) {
						sum += String.fromCharCode(key);
						console.log(sum);
						$(".calc_total_display_number").val(sum);
				} else if (e.which >= 42 && e.which <= 57 || e.which === 61) {
						if ($(".calc_total_display_number").val() !== "0") {
								sum += +String.fromCharCode(key) + "";
								console.log(sum);
								$(".calc_total_display_number").val(sum);
						} else {
								sum = "";
								sum = +String.fromCharCode(key) + "";
								console.log(sum);
								$(".calc_total_display_number").val(sum);
						}
				}
		}

		$(document).keypress(keyHandler);

		$(".calc_buttons_container").delegate(".calc_button", "click", clickHandler);

});
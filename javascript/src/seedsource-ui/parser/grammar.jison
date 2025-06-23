%lex

%%
\s+						/* skip whitespace */
[0-9]+("."[0-9]+)?\b  	return 'NUMBER';
'**'					return 'POWER';
"*"						return 'TIMES';
"/"						return 'SLASH';
'-'						return 'MINUS';
'+'						return 'PLUS';
'('						return 'LPAREN';
')'						return 'RPAREN';
[a-zA-Z_][a-zA-Z0-9_]*	return 'ID';

/lex

%start expressions

%%

expressions
	: expr
		{return $1;}
	;

expr
	: expr PLUS term
		{$$ = $1 + $3;}
	| expr MINUS term
		{$$ = $1 - $3;}
	| term
		{$$ = $1;}

	;

term
	: term MUL factor
		{$$ = $1 * $3;}
	| term TIMES factor
		{$$ = $1 * $3;}
	| term SLASH factor
		{$$ = $1 / $3;}
	| term POWER factor
		{$$ = Math.pow($1, $3);}
	| factor
		{$$ = $1;}

	;

factor
	: NUMBER
		{$$ = Number(yytext);}
	| ID
		{$$ = yy.context[yytext];}
	| LPAREN expr RPAREN
		{$$ = $2;}
	| PLUS factor
		{$$ = +$2;}
	| MINUS factor
		{$$ = -$2;}

	;


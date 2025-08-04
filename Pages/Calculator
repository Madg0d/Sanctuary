
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator as CalcIcon, Delete, RotateCcw } from "lucide-react";

export default function Calculator() {
    const [display, setDisplay] = useState("0");
    const [equation, setEquation] = useState("");
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    // Helper to handle calculation results and potential errors (NaN, Infinity)
    const handleCalculationResult = (result) => {
        if (isNaN(result) || !isFinite(result)) {
            setDisplay("Error");
            setEquation("");
            setWaitingForOperand(true);
            return false; // Indicate error occurred
        }
        setDisplay(String(result));
        return true; // Indicate success
    };

    const inputNumber = (num) => {
        // If an error is displayed, start fresh with the new number
        if (display === "Error" || display.startsWith("Error:")) {
            setDisplay(String(num));
            setEquation(""); // Clear any pending equation
            setWaitingForOperand(false);
            return;
        }

        if (waitingForOperand) {
            setDisplay(String(num));
            setWaitingForOperand(false);
        } else {
            setDisplay(display === "0" ? String(num) : display + num);
        }
    };

    const inputDecimal = () => {
        // If an error is displayed, start fresh with "0."
        if (display === "Error" || display.startsWith("Error:")) {
            setDisplay("0.");
            setEquation(""); // Clear any pending equation
            setWaitingForOperand(false);
            return;
        }

        if (waitingForOperand) {
            setDisplay("0.");
            setWaitingForOperand(false);
        } else if (display.indexOf(".") === -1) {
            setDisplay(display + ".");
        }
    };

    const clear = () => {
        setDisplay("0");
        setEquation("");
        setWaitingForOperand(false);
    };

    const deleteLast = () => {
        // If an error is displayed, clear completely
        if (display === "Error" || display.startsWith("Error:")) {
            clear();
            return;
        }

        if (display.length > 1 && display !== "0") {
            setDisplay(display.slice(0, -1));
        } else {
            setDisplay("0");
        }
    };

    const performOperation = (nextOperator) => {
        const inputValue = parseFloat(display);

        // Handle error state if current display is an error message
        if (display === "Error" || display.startsWith("Error:")) {
            // If user presses an operator after an error, clear and start new equation with 0
            if (nextOperator) {
                setEquation("0" + nextOperator);
                setDisplay("0"); // Keep display clean for next input
                setWaitingForOperand(true);
            } else { // If '=' pressed on error, clear
                clear();
            }
            return;
        }


        if (equation) {
            // If there's a pending operation, calculate the result first
            const currentEquation = equation;
            const operator = currentEquation.slice(-1); // Extracts last char which is the operator
            const prevValue = parseFloat(currentEquation.slice(0, -1)); // Extracts number before operator

            if (isNaN(prevValue) || isNaN(inputValue)) {
                setDisplay("Error");
                setEquation("");
                setWaitingForOperand(true);
                return;
            }

            let result;
            switch (operator) {
                case '+':
                    result = prevValue + inputValue;
                    break;
                case '-':
                    result = prevValue - inputValue;
                    break;
                case '×':
                    result = prevValue * inputValue;
                    break;
                case '÷':
                    if (inputValue === 0) {
                        setDisplay("Error: Div by 0");
                        setEquation("");
                        setWaitingForOperand(true);
                        return;
                    }
                    result = prevValue / inputValue;
                    break;
                default:
                    // Should not happen if equation state is well-managed
                    // If an unknown operator, just update equation with current value and new operator
                    setEquation(nextOperator ? inputValue + nextOperator : "");
                    setWaitingForOperand(true);
                    return;
            }

            if (handleCalculationResult(result)) {
                // Calculation successful, update equation for chaining or clear if '='
                setEquation(nextOperator ? String(result) + nextOperator : "");
            }
        } else {
            // No pending operation, just store the current display value and the operator
            setEquation(nextOperator ? inputValue + nextOperator : "");
        }

        setWaitingForOperand(true);
    };

    const calculate = () => {
        // Only perform calculation if there's an equation and user has entered an operand
        if (equation && !waitingForOperand) {
            performOperation(null); // Passing null clears the equation after calculation
        } else if (display === "Error" || display.startsWith("Error:")) {
            clear(); // Clear error state if equals is pressed
        }
        // If equation is empty or waitingForOperand is true (meaning only operator was pressed last), do nothing
    };

    // Helper for scientific operations to handle errors and state reset consistently
    const handleScientificOperation = (operationFn) => {
        const value = parseFloat(display);

        // If an error is displayed, pressing a scientific function clears it and starts fresh
        if (display === "Error" || display.startsWith("Error:")) {
            setDisplay("0");
            setEquation("");
            setWaitingForOperand(false);
            // If the operation is a constant like PI, apply it now
            try {
                const result = operationFn(parseFloat("0")); // Pass a default 0 if error was there
                handleCalculationResult(result);
            } catch (e) {
                setDisplay("Error");
            }
            return;
        }

        if (isNaN(value)) {
            setDisplay("Error");
            setEquation("");
            setWaitingForOperand(true);
            return;
        }

        let result;
        try {
            result = operationFn(value);
            if (handleCalculationResult(result)) {
                setEquation(""); // Scientific operations always clear the pending equation
                setWaitingForOperand(false); // Ready for new input or chain
            }
        } catch (e) {
            // Catch specific errors thrown by the operation function (e.g., negative sqrt)
            setDisplay("Error: " + e.message);
            setEquation("");
            setWaitingForOperand(true);
        }
    };

    const buttonClass = "h-14 text-lg font-medium transition-colors";
    const numberButtonClass = `${buttonClass} bg-zinc-800 text-white hover:bg-zinc-700`;
    const operatorButtonClass = `${buttonClass} bg-zinc-700 text-white hover:bg-zinc-600`;
    const specialButtonClass = `${buttonClass} bg-zinc-600 text-white hover:bg-zinc-500`;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wider text-white">CALCULATOR</h1>
                <p className="text-zinc-400 text-sm">Simple and focused calculations</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Calculator */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                            <CalcIcon className="w-5 h-5" />
                            <span>Calculator</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Display */}
                        <div className="bg-zinc-800 rounded-lg p-4 mb-4">
                            {equation && (
                                <div className="text-sm text-zinc-400 mb-1 text-right">{equation}</div>
                            )}
                            <div className="text-right text-3xl font-mono text-white">
                                {display}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-4 gap-3">
                            {/* Row 1 */}
                            <Button onClick={clear} className={specialButtonClass}>
                                AC
                            </Button>
                            <Button onClick={deleteLast} className={specialButtonClass}>
                                <Delete className="w-5 h-5" />
                            </Button>
                            <Button onClick={() => performOperation('÷')} className={operatorButtonClass}>
                                ÷
                            </Button>
                            <Button onClick={() => performOperation('×')} className={operatorButtonClass}>
                                ×
                            </Button>

                            {/* Row 2 */}
                            <Button onClick={() => inputNumber(7)} className={numberButtonClass}>
                                7
                            </Button>
                            <Button onClick={() => inputNumber(8)} className={numberButtonClass}>
                                8
                            </Button>
                            <Button onClick={() => inputNumber(9)} className={numberButtonClass}>
                                9
                            </Button>
                            <Button onClick={() => performOperation('-')} className={operatorButtonClass}>
                                -
                            </Button>

                            {/* Row 3 */}
                            <Button onClick={() => inputNumber(4)} className={numberButtonClass}>
                                4
                            </Button>
                            <Button onClick={() => inputNumber(5)} className={numberButtonClass}>
                                5
                            </Button>
                            <Button onClick={() => inputNumber(6)} className={numberButtonClass}>
                                6
                            </Button>
                            <Button onClick={() => performOperation('+')} className={operatorButtonClass}>
                                +
                            </Button>

                            {/* Row 4 */}
                            <Button onClick={() => inputNumber(1)} className={numberButtonClass}>
                                1
                            </Button>
                            <Button onClick={() => inputNumber(2)} className={numberButtonClass}>
                                2
                            </Button>
                            <Button onClick={() => inputNumber(3)} className={numberButtonClass}>
                                3
                            </Button>
                            <Button onClick={calculate} className={`${buttonClass} bg-white text-black hover:bg-zinc-200 row-span-2`}>
                                =
                            </Button>

                            {/* Row 5 */}
                            <Button onClick={() => inputNumber(0)} className={`${numberButtonClass} col-span-2`}>
                                0
                            </Button>
                            <Button onClick={inputDecimal} className={numberButtonClass}>
                                .
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Scientific Functions */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white">Scientific Functions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <Button
                                onClick={() => handleScientificOperation((val) => {
                                    if (val < 0) throw new Error("Negative input");
                                    return Math.sqrt(val);
                                })}
                                className={operatorButtonClass}
                            >
                                √
                            </Button>
                            <Button
                                onClick={() => handleScientificOperation((val) => Math.pow(val, 2))}
                                className={operatorButtonClass}
                            >
                                x²
                            </Button>
                            <Button
                                onClick={() => handleScientificOperation((val) => {
                                    if (val === 0) throw new Error("Div by 0");
                                    return 1 / val;
                                })}
                                className={operatorButtonClass}
                            >
                                1/x
                            </Button>
                            <Button
                                onClick={() => handleScientificOperation((val) => Math.sin(val * Math.PI / 180))}
                                className={operatorButtonClass}
                            >
                                sin
                            </Button>
                            <Button
                                onClick={() => handleScientificOperation((val) => Math.cos(val * Math.PI / 180))}
                                className={operatorButtonClass}
                            >
                                cos
                            </Button>
                            <Button
                                onClick={() => handleScientificOperation((val) => Math.tan(val * Math.PI / 180))}
                                className={operatorButtonClass}
                            >
                                tan
                            </Button>
                            <Button
                                onClick={() => handleScientificOperation((val) => {
                                    if (val <= 0) throw new Error("Invalid input");
                                    return Math.log10(val);
                                })}
                                className={operatorButtonClass}
                            >
                                log
                            </Button>
                            <Button
                                onClick={() => handleScientificOperation((val) => {
                                    if (val <= 0) throw new Error("Invalid input");
                                    return Math.log(val);
                                })}
                                className={operatorButtonClass}
                            >
                                ln
                            </Button>
                            <Button
                                onClick={() => handleScientificOperation(() => Math.PI)}
                                className={operatorButtonClass}
                            >
                                π
                            </Button>
                        </div>

                        {/* Quick Calculations */}
                        <div className="border-t border-zinc-800 pt-4">
                            <h4 className="text-sm font-medium mb-3 text-zinc-400">Quick Calculations</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-2 bg-zinc-800 rounded">
                                    <span className="text-sm text-zinc-300">Percentage</span>
                                    <Button
                                        size="sm"
                                        onClick={() => handleScientificOperation((val) => val / 100)}
                                        className="bg-zinc-700 text-white hover:bg-zinc-600"
                                    >
                                        %
                                    </Button>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-zinc-800 rounded">
                                    <span className="text-sm text-zinc-300">Plus/Minus</span>
                                    <Button
                                        size="sm"
                                        onClick={() => handleScientificOperation((val) => -val)}
                                        className="bg-zinc-700 text-white hover:bg-zinc-600"
                                    >
                                        ±
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

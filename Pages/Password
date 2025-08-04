
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Copy, RefreshCw, Shield, Check } from "lucide-react";

export default function Password() {
    const [generatedPassword, setGeneratedPassword] = useState("");
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [checkText, setCheckText] = useState("");
    const [checkResult, setCheckResult] = useState(null);
    const [copied, setCopied] = useState(false);
    
    const [options, setOptions] = useState({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeSimilar: false
    });

    const generatePassword = () => {
        let charset = "";
        
        if (options.includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
        if (options.includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (options.includeNumbers) charset += "0123456789";
        if (options.includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
        
        if (options.excludeSimilar) {
            charset = charset.replace(/[0oO1lI]/g, "");
        }

        if (charset.length === 0) {
            setGeneratedPassword("Please select at least one character type.");
            setPasswordStrength(0);
            return;
        }
        
        let password = "";
        for (let i = 0; i < options.length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        setGeneratedPassword(password);
        setPasswordStrength(calculateStrength(password));
    };

    const calculateStrength = (password) => {
        let score = 0;
        
        // Length score
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 25; // Additional for longer passwords
        if (password.length >= 16) score += 10; // Even more for very long
        
        // Character type scores
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/[0-9]/.test(password)) score += 10;
        if (/[^A-Za-z0-9]/.test(password)) score += 20;

        // Bonus for mix of character types (heuristic)
        let charTypeCount = 0;
        if (/[a-z]/.test(password)) charTypeCount++;
        if (/[A-Z]/.test(password)) charTypeCount++;
        if (/[0-9]/.test(password)) charTypeCount++;
        if (/[^A-Za-z0-9]/.test(password)) charTypeCount++;
        if (charTypeCount >= 3) score += 10;
        if (charTypeCount >= 4) score += 10;
        
        return Math.min(score, 100);
    };

    const checkPasswordStrength = () => {
        const strength = calculateStrength(checkText);
        const suggestions = [];
        
        if (checkText.length < 8) suggestions.push("Use at least 8 characters");
        if (checkText.length < 12 && checkText.length >=8) suggestions.push("Consider using 12 or more characters");
        if (!/[a-z]/.test(checkText)) suggestions.push("Include lowercase letters");
        if (!/[A-Z]/.test(checkText)) suggestions.push("Include uppercase letters");
        if (!/[0-9]/.test(checkText)) suggestions.push("Include numbers");
        if (!/[^A-Za-z0-9]/.test(checkText)) suggestions.push("Include symbols");
        
        let level = "Very Weak";
        if (strength >= 90) level = "Excellent"; // New highest level
        else if (strength >= 80) level = "Very Strong";
        else if (strength >= 60) level = "Strong";
        else if (strength >= 40) level = "Moderate";
        else if (strength >= 20) level = "Weak";
        
        setCheckResult({
            strength,
            level,
            suggestions
        });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStrengthColor = (strength) => {
        if (strength >= 90) return "text-green-500"; // Slightly darker green for excellent
        if (strength >= 80) return "text-green-400";
        if (strength >= 60) return "text-blue-400";
        if (strength >= 40) return "text-yellow-400";
        if (strength >= 20) return "text-orange-400";
        return "text-red-400";
    };

    const getStrengthBg = (strength) => {
        if (strength >= 90) return "bg-green-500";
        if (strength >= 80) return "bg-green-400";
        if (strength >= 60) return "bg-blue-400";
        if (strength >= 40) return "bg-yellow-400";
        if (strength >= 20) return "bg-orange-400";
        return "bg-red-400";
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wider text-white">PASSWORD MANAGER</h1>
                <p className="text-zinc-400 text-sm">Generate and check secure passwords</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Password Generator */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                            <Key className="w-5 h-5" />
                            <span>Password Generator</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                Length: {options.length}
                            </label>
                            <input
                                type="range"
                                min="8"
                                max="64"
                                value={options.length}
                                onChange={(e) => setOptions(prev => ({ ...prev, length: parseInt(e.target.value) }))}
                                className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, white 0%, white ${((options.length - 8) / 56) * 100}%, #3f3f46 ${((options.length - 8) / 56) * 100}%, #3f3f46 100%)`
                                }}
                            />
                        </div>

                        <div className="space-y-3">
                            {[
                                { key: "includeUppercase", label: "Uppercase (A-Z)" },
                                { key: "includeLowercase", label: "Lowercase (a-z)" },
                                { key: "includeNumbers", label: "Numbers (0-9)" },
                                { key: "includeSymbols", label: "Symbols (!@#$%)" },
                                { key: "excludeSimilar", label: "Exclude similar (0oO1lI)" }
                            ].map(option => (
                                <label key={option.key} className="flex items-center space-x-2 cursor-pointer text-white">
                                    <input
                                        type="checkbox"
                                        checked={options[option.key]}
                                        onChange={(e) => setOptions(prev => ({ ...prev, [option.key]: e.target.checked }))}
                                        className="form-checkbox h-4 w-4 text-white bg-zinc-700 border-zinc-600 rounded focus:ring-white"
                                    />
                                    <span className="text-sm">{option.label}</span>
                                </label>
                            ))}
                        </div>

                        <Button onClick={generatePassword} className="w-full bg-white text-black hover:bg-zinc-200">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Generate Password
                        </Button>

                        {generatedPassword && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Input
                                        value={generatedPassword}
                                        readOnly
                                        className="bg-zinc-800 border-zinc-700 text-white font-mono"
                                    />
                                    <Button
                                        onClick={copyToClipboard}
                                        variant="outline"
                                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </Button>
                                </div>
                                
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Strength</span>
                                        <span className={getStrengthColor(passwordStrength)}>
                                            {passwordStrength >= 90 ? "Excellent" :
                                             passwordStrength >= 80 ? "Very Strong" :
                                             passwordStrength >= 60 ? "Strong" :
                                             passwordStrength >= 40 ? "Moderate" :
                                             passwordStrength >= 20 ? "Weak" : "Very Weak"}
                                        </span>
                                    </div>
                                    <div className="w-full bg-zinc-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthBg(passwordStrength)}`}
                                            style={{ width: `${passwordStrength}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Password Checker */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-white">
                            <Shield className="w-5 h-5" />
                            <span>Password Checker</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                Enter password to check
                            </label>
                            <Textarea
                                value={checkText}
                                onChange={(e) => setCheckText(e.target.value)}
                                placeholder="Type or paste password here..."
                                className="bg-zinc-800 border-zinc-700 text-white font-mono"
                            />
                        </div>

                        <Button
                            onClick={checkPasswordStrength}
                            disabled={!checkText}
                            className="w-full bg-zinc-700 text-white hover:bg-zinc-600"
                        >
                            Check Strength
                        </Button>

                        {checkResult && (
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1 text-white">
                                        <span>Strength</span>
                                        <span className={getStrengthColor(checkResult.strength)}>
                                            {checkResult.level}
                                        </span>
                                    </div>
                                    <div className="w-full bg-zinc-700 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${getStrengthBg(checkResult.strength)}`}
                                            style={{ width: `${checkResult.strength}%` }}
                                        />
                                    </div>
                                </div>

                                {checkResult.suggestions.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2 text-white">Suggestions:</h4>
                                        <ul className="text-sm text-zinc-400 space-y-1">
                                            {checkResult.suggestions.map((suggestion, index) => (
                                                <li key={index} className="flex items-center space-x-2">
                                                    <div className="w-1 h-1 bg-zinc-500 rounded-full" />
                                                    <span>{suggestion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

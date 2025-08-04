import React, { useState, useEffect } from "react";
import { Note } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";

export default function Finance() {
    const [transactions, setTransactions] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        type: "expense",
        amount: "",
        category: "food",
        description: "",
        date: new Date().toISOString().split('T')[0]
    });

    const categories = {
        expense: ["food", "transport", "utilities", "entertainment", "shopping", "health", "other"],
        income: ["salary", "freelance", "investment", "gift", "other"]
    };

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const noteData = await Note.filter({ title: { $regex: "^FINANCE:" } }, "-updated_date");
            const parsedTransactions = noteData.map(note => ({
                id: note.id,
                ...JSON.parse(note.content)
            }));
            setTransactions(parsedTransactions);
        } catch (error) {
            console.error("Failed to load transactions:", error);
        }
    };

    const saveTransaction = async () => {
        if (!newTransaction.amount || !newTransaction.description) return;

        try {
            const transactionData = {
                ...newTransaction,
                amount: parseFloat(newTransaction.amount)
            };
            
            const title = `FINANCE: ${transactionData.type} - ${transactionData.description}`;
            
            await Note.create({
                title,
                content: JSON.stringify(transactionData)
            });
            
            setNewTransaction({
                type: "expense",
                amount: "",
                category: "food",
                description: "",
                date: new Date().toISOString().split('T')[0]
            });
            
            setShowForm(false);
            loadTransactions();
        } catch (error) {
            console.error("Failed to save transaction:", error);
        }
    };

    const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;

    const recentTransactions = transactions.slice(0, 10);

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 tracking-wider">FINANCE</h1>
                <p className="text-zinc-400 text-sm">Track your income and expenses</p>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">${totalIncome.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-400">${totalExpenses.toFixed(2)}</div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Balance</CardTitle>
                        <DollarSign className="h-4 w-4 text-white" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${balance.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-wide">RECENT TRANSACTIONS</h2>
                <Button
                    onClick={() => setShowForm(true)}
                    className="bg-white text-black hover:bg-zinc-200"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Transaction
                </Button>
            </div>

            {/* Transactions List */}
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                {recentTransactions.length > 0 ? (
                    <div className="space-y-4">
                        {recentTransactions.map(transaction => (
                            <div key={transaction.id} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-2 h-2 rounded-full ${
                                        transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'
                                    }`} />
                                    <div>
                                        <p className="font-medium">{transaction.description}</p>
                                        <p className="text-sm text-zinc-400 capitalize">
                                            {transaction.category} • {transaction.date}
                                        </p>
                                    </div>
                                </div>
                                <div className={`font-bold ${
                                    transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <PieChart className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-400">No transactions yet. Add your first one!</p>
                    </div>
                )}
            </div>

            {/* Transaction Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-md border border-zinc-800">
                        <h3 className="text-xl font-bold mb-6 tracking-wide">ADD TRANSACTION</h3>
                        <div className="space-y-4">
                            <Select
                                value={newTransaction.type}
                                onValueChange={(value) => setNewTransaction(prev => ({ 
                                    ...prev, 
                                    type: value,
                                    category: categories[value][0]
                                }))}
                            >
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>

                            <Input
                                type="number"
                                step="0.01"
                                placeholder="Amount"
                                value={newTransaction.amount}
                                onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />

                            <Select
                                value={newTransaction.category}
                                onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}
                            >
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories[newTransaction.type].map(cat => (
                                        <SelectItem key={cat} value={cat} className="capitalize">
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                placeholder="Description"
                                value={newTransaction.description}
                                onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />

                            <Input
                                type="date"
                                value={newTransaction.date}
                                onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                                className="bg-zinc-800 border-zinc-700 text-white"
                            />
                        </div>
                        
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button
                                onClick={() => setShowForm(false)}
                                variant="outline"
                                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={saveTransaction}
                                className="bg-white text-black hover:bg-zinc-200"
                            >
                                Add Transaction
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
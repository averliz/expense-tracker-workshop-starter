import { useState } from 'react'
import './App.css'

function createInitialTransactions() {
  const now = new Date()
  const date = (monthOffset, day) => new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth() + monthOffset, day,
  )).toISOString().slice(0, 10)

  return [
    { id: 1, description: 'Salary', amount: 5000, type: 'income', category: 'salary', date: date(0, 1) },
    { id: 2, description: 'Rent', amount: 1200, type: 'expense', category: 'housing', date: date(-1, 2) },
    { id: 3, description: 'Groceries', amount: 150, type: 'expense', category: 'food', date: date(0, 3) },
    { id: 4, description: 'Freelance Work', amount: 800, type: 'income', category: 'salary', date: date(-1, 5) },
    { id: 5, description: 'Electric Bill', amount: 95, type: 'expense', category: 'utilities', date: date(-1, 6) },
    { id: 6, description: 'Dinner Out', amount: 65, type: 'expense', category: 'food', date: date(0, 7) },
    { id: 7, description: 'Gas', amount: 20, type: 'expense', category: 'transport', date: date(0, 8) },
    { id: 8, description: 'Netflix', amount: 15, type: 'expense', category: 'entertainment', date: date(0, 10) },
  ]
}

const sumCents = items => items.reduce((sum, item) => sum + Math.round(item.amount * 100), 0)
const formatMoney = cents => `$${(cents / 100).toFixed(2)}`

function App() {
  const [transactions, setTransactions] = useState(createInitialTransactions)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('food')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [error, setError] = useState('')

  const categories = ['food', 'housing', 'utilities', 'transport', 'entertainment', 'salary', 'other']
  const totalIncomeCents = sumCents(transactions.filter(t => t.type === 'income'))
  const totalExpensesCents = sumCents(transactions.filter(t => t.type === 'expense'))
  const balanceCents = totalIncomeCents - totalExpensesCents

  let filteredTransactions = transactions
  if (filterType !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.type === filterType)
  }
  if (filterCategory !== 'all') {
    filteredTransactions = filteredTransactions.filter(t => t.category === filterCategory)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const value = Number(amount)
    if (!description.trim() || description.trim().length > 120 ||
        !/^(?:\d+|\d*\.\d{1,2})$/.test(amount) ||
        !Number.isFinite(value) || value <= 0 || value > 1_000_000) {
      setError('Enter a description and an amount from $0.01 to $1000000.00, with at most two decimal places.')
      return
    }

    const newTransaction = {
      id: crypto.randomUUID(),
      description: description.trim(),
      amount: value,
      type,
      category,
      date: new Date().toISOString().slice(0, 10),
    }
    setTransactions(previous => [...previous, newTransaction])
    setDescription('')
    setAmount('')
    setType('expense')
    setCategory('food')
    setError('')
  }

  return (
    <main className="app">
      <h1>Expense Tracker</h1>
      <p className="subtitle">Synthetic workshop data. Dates use UTC; reloading resets changes.</p>

      <section className="summary" aria-label="Account summary">
        <div className="summary-card">
          <h2>Income</h2>
          <p className="income-amount">{formatMoney(totalIncomeCents)}</p>
        </div>
        <div className="summary-card">
          <h2>Expenses</h2>
          <p className="expense-amount">{formatMoney(totalExpensesCents)}</p>
        </div>
        <div className="summary-card">
          <h2>Balance</h2>
          <p className="balance-amount">{formatMoney(balanceCents)}</p>
        </div>
      </section>

      <section className="add-transaction" aria-labelledby="add-heading">
        <h2 id="add-heading">Add Transaction</h2>
        <form onSubmit={handleSubmit} onChange={() => setError('')}>
          <label className="description-field" htmlFor="description">
            Description
            <input id="description" name="description" type="text" placeholder="Description"
              required maxLength={120} value={description}
              aria-describedby={error ? 'transaction-error' : undefined}
              onChange={e => setDescription(e.target.value)} />
          </label>
          <label htmlFor="amount">
            Amount (USD)
            <input id="amount" name="amount" type="number" placeholder="Amount"
              required min="0.01" max="1000000" step="0.01" value={amount}
              aria-describedby={error ? 'transaction-error' : undefined}
              onChange={e => setAmount(e.target.value)} />
          </label>
          <label htmlFor="type">
            Transaction type
            <select id="type" name="type" value={type} onChange={e => setType(e.target.value)}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
          <label htmlFor="category">
            Category
            <select id="category" name="category" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </label>
          <button type="submit">Add</button>
          {error && <p className="error" id="transaction-error" role="alert">{error}</p>}
        </form>
      </section>

      <section className="transactions" aria-labelledby="transactions-heading">
        <h2 id="transactions-heading">Transactions</h2>
        <div className="filters">
          <label htmlFor="filter-type">
            Filter type
            <select id="filter-type" name="filter-type" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
          <label htmlFor="filter-category">
            Filter category
            <select id="filter-category" name="filter-category" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </label>
        </div>
        <p className="subtitle">Filters affect table rows only. Account totals include all transactions.</p>
        <p className="table-hint">Scroll the table horizontally to see every column.</p>
        <div className="table-scroll" role="region" aria-label="Transaction table" tabIndex={0}>
          <table aria-labelledby="transactions-heading">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col">Category</th>
                <th scope="col">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(t => (
                <tr key={t.id}>
                  <td>{t.date}</td>
                  <td>{t.description}</td>
                  <td>{t.category}</td>
                  <td className={t.type === 'income' ? 'income-amount' : 'expense-amount'}>
                    {t.type === 'income' ? '+' : '-'}{formatMoney(Math.round(t.amount * 100))}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr><td colSpan={4}>No transactions match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

export default App

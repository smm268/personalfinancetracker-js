import { useState,useMemo, type FormEvent, type ChangeEvent } from 'react'
import './App.css'

type  TransactionType = "income" | "expense";

interface Transaction {
  id: string | number;
  title: string;
  category : string;
  date: string;
  amount:number;
  type: TransactionType;
}

interface TransactionForm{
  title: string;
  category:string;
  date:string;
  amount:string;
  type: TransactionType;
}

const initialTransactions: Transaction[]=[
  {id: 1, title:"Monthly salary",category:"Salary", date: "2026-10-01", amount:2800, type:"income" },
  {id: 2, title:"Rent payment",category:"Housing", date: "2026-10-03", amount:850, type:"expense" },
  {id: 3, title:"Weekly groceries",category:"Food", date: "2026-10-05", amount:64.50, type:"expense" },
  {id: 4, title:"Train pass",category:"Transport", date: "2026-10-08", amount:72, type:"expense" },
  {id: 5, title:"Freelance project",category:"Freelance", date: "2026-10-10", amount:350, type:"income" },
];

const money = (amount:number) : string =>
  new Intl.NumberFormat("en-GB",{
    style: "currency",
    currency:"GBP",
  }).format(amount);

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2,"0");
  return `${year}-${month}-${day}`;
};

const emptyForm = () : TransactionForm => ({
  title:"",
  category: "Food",
  date:today(),
  amount: " ",
  type: "expense",
});

function App(){
 const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
 const [filter,setFilter] = useState<"all" | TransactionType> ("all");
 const [showForm,setShowForm] = useState(false);
 const [form,setForm] = useState<TransactionForm>(emptyForm);

 const totals = useMemo(() => {
  const now = new Date();
  const monthly = transactions.filter((transaction) => {
    const [year,month] = transaction.date.split("-").map(Number);
    return year === now.getFullYear() && month === now.getMonth() + 1;
  });
  
  const income= monthly.filter((transaction) => transaction.type === "income").reduce((sum,transaction) => sum+transaction.amount,0);
  const expenses=monthly.filter((transaction) => transaction.type === "expense").reduce((sum,transaction) => sum+transaction.amount,0);
  return {income,expenses,balance: income-expenses};
 },[transactions]);

 const visibleTransactions = transactions
  .filter(
    (transaction) =>
      filter === "all" || transaction.type === filter
  )
  .sort((a, b) => b.date.localeCompare(a.date));

function updateForm(
  event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
) {
  const { name, value } = event.target;

  setForm((current) => ({
    ...current,
    [name]: value,
  }));
}

 function addTransaction(event:FormEvent<HTMLFormElement>){
  event.preventDefault();

  const amount = Number(form.amount);
  if(!form.title.trim() || !Number.isFinite(amount) || amount <= 0){
    return;
  }

  const newTransaction : Transaction = {
    ...form,
    title: form.title.trim(),
    id:crypto.randomUUID(),
    amount:Math.round(amount*100)/100,
  };

  setTransactions((current)=> [...current,newTransaction]);
  setForm(emptyForm());
  setShowForm(false);
 }

 function deleteTransaction(id: Transaction["id"]){
  setTransactions((current) => current.filter((transaction) => transaction.id !== id));
 }
return(
  <main className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#dashboard">
        <span className="brand-icon">£</span>
        <span>Pennywise</span>
      </a>

      <p className="nav-heading">WORKSPACE</p>
      <a className="nav-link active" href="#dashboard">Dashboard</a>
      <a className="nav-link" href="#transcations">Transcations</a>
      <a className="nav-link" href="#budgets">Budgets</a>
      <a className="nav-link" href="#reports">Reports</a>

      <div className="sidebar-note">
        <span className="note-icon">*</span>
        <strong>Small steps add up.</strong>
        <p>Build better money habits, one day at a time.</p>
      </div>

      <div className="profile">
        <div className="avatar">JD</div>
        <div>
          <strong>Jamie Doe</strong>
          <small>Personal account</small>
        </div>
      </div>
    </aside>

    <section className="main-content" id="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">YOUR FINANCES AT A GLANCE</p>
          <h1>Good Morning, Jamien<span>*</span></h1>
          <p className="muted">Here's what's happening with your money.</p>
        </div>

        <button className="primary-button" onClick={() => setShowForm ((current) => !current)}>
          + Add transcation
        </button>
      </header>

      <section className="summary-grid" aria-label="Monthly financial summary">
        <article className="summary-card balance-card" >
          <div className="card-label">
            <span>Monthly balance</span>
            <span className="card-icon">£</span>
          </div>
          <p className="summary-amount">{money(totals.balance)}</p>
          <p className="card-foot">Income minus expenses this month</p>
        </article>

        <article className="summary-card">
          <div className="card-label">
            <span>Total income</span><span className="card icon income-icon">-</span>
          </div>
          <p className="summary-amount">{money(totals.balance)}</p>
          <p className="card-foot">Money received this month</p>
        </article>
        <article className="summary-card">
          <div className="card-label"><span>Total expenses<span className="card-icon expense-icon">-</span></span></div>
          <p className="summary-amount">{money(totals.expenses)}</p>
          <p className="card-foot">Money spent in this month</p>
        </article>
      </section>

      {showForm && (
        <section className="form-card">
          <div className="section-heading">
            <div>
              <h2>New Transcation</h2>
              <p>Enter the details below.</p>
          </div>
          <button className="close-button" type="button" onClick={() => setShowForm(false)} aria-label="Close form"> X </button>
          </div>
          <form onSubmit={addTransaction} className="transaction-form">
            <label>Description
               <input name="title"
               value={form.title}
               onChange={updateForm}
               placeholder="e.g Weekly shopping"
               required maxLength={100}/>
            </label>

            <label>Amount£
              <input
              name="amount"
              type="amount"
              min="0.01"
              max="1000000"
              step="0.01"
              value={form.amount}
              onChange={updateForm}
              placeholder="0.00"
              required/>
            </label>

            <label>Type
              <select name="category" value={form.category} onChange={updateForm}>
                <option ></option>
                <option value="">Food</option>
                <option value="">Housing</option>
                <option value="">Transport</option>
                <option value="">Shopping</option>
                <option value="">Utilities</option>
                <option value="">Salary</option>
                <option value="">Freelance</option>
                <option value="">Other</option>
              </select>
            </label>

            <label>Date 
              <input
              name="date"
              type="date"
              value={form.date}
              onChange={updateForm}
              required
              />
            </label>
            <button className="primary-button form-submit" type="submit">Save Transaction</button>
          </form>
        </section>
      )}
      <section className="transactions-card" id="transactions">
        <div className="section-heading">
          <div>
            <h2>Recent Transactions</h2>
            <p className="muted">Keep track of money coming in and going out.</p>
          </div>

          <select className="filter-select" value={filter} onChange={(event) => setFilter(event.target.value as "all" | TransactionType)} aria-label="Filter transactions">
            <option value="all">All transactions</option>
            <option value="income">Income only</option>
            <option value="expense">Expenses only</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TRANSACTION</th>
                <th>CATEGORY</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th><span className="sr-only">ACTIONS</span></th>
              </tr>
            </thead>

            <tbody>
              {visibleTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>
                    <div  className="transaction-name">
                      <span className={`transaction-icon ${transaction.type}`}>
                        {transaction.type === "income" ? "-" : "-"}
                      </span>
                      <strong>{transaction.title}</strong>
                    </div>
                  </td>
                  <td><span className="category-pill">{transaction.category}</span></td>
                  <td className="date-cell">
                    {new Date (`${transaction.date}T12:00:00`).toLocaleDateString(
                      "en-GB",
                      {day:"2-digit", month:"short" ,year:"numeric"}
                    )}
                  </td>
                  <td>
                    <button className="delete-button"
                    type="button"
                    onClick={()=> deleteTransaction(transaction.id)}
                    aria-label={`Delete ${transaction.title}`}
                    title="Delete transaction">X</button>
                  </td>
                </tr>
              ))}

              {visibleTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-state">No transaction yet.Addyour first one above.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="table-footer">
          {visibleTransactions.length} transaction {visibleTransactions.length === 1 ? "" : "s"} shown
        </p>
      </section>

      <footer className="app-footer">Pennywise  .  Personal Finance Tracker
        <span>Built to make money clearer.</span>
      </footer>

    </section>
  </main>
)
}
export default App;

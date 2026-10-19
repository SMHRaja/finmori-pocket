import React, { useEffect, useMemo, useRef, useState } from "react"
import {
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native"
import { BalanceCard, BottomNavBar } from "@/components/ui-kit"
import type { BottomNavTab } from "@/components/ui-kit/BottomNavBar"
import {
  IllustrativeGroceryIcon,
  IllustrativeMealIcon,
  IllustrativeTransportIcon,
  IllustrativeShoppingIcon,
  IllustrativeHealthIcon,
  IllustrativeRentIcon,
  IllustrativeMoreIcon,
} from "@/components/icons"

type Transaction = {
  id: string
  title: string
  cents: number
  type: "income" | "expense"
  category: string
  date: string
}
type Goal = { id: string; title: string; target: number; saved: number }
type Data = { transactions: Transaction[]; goals: Goal[]; name: string; budget: number }
type Page = BottomNavTab | "add" | "goal-detail" | "new-goal"
const KEY = "finmori-pocket-v1"
const categories = ["Groceries", "Food", "Transport", "Shopping", "Health", "Rent", "Other"]
const colors = ["#5266c9", "#f5ac83", "#83b7ac", "#c5a6da", "#9cb8e4", "#d7bc8b", "#abaec0"]
const icons = [
  IllustrativeGroceryIcon,
  IllustrativeMealIcon,
  IllustrativeTransportIcon,
  IllustrativeShoppingIcon,
  IllustrativeHealthIcon,
  IllustrativeRentIcon,
  IllustrativeMoreIcon,
]
const money = (c: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(c / 100)
function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`
function cents(text: string) {
  if (!/^\d+(\.\d{1,2})?$/.test(text.trim())) return null
  const [whole, part = ""] = text.trim().split(".")
  const n = Number(whole) * 100 + Number(part.padEnd(2, "0"))
  return Number.isSafeInteger(n) && n > 0 && n <= 10000000000 ? n : null
}
function validDate(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(`${s}T12:00:00`)
  return (
    !Number.isNaN(d.getTime()) &&
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` === s
  )
}
function sample(): Data {
  return {
    name: "Alex",
    budget: 180000,
    transactions: [
      { id: "1", title: "Freelance project", cents: 285000, type: "income", category: "Other", date: today() },
      { id: "2", title: "Weekly groceries", cents: 6850, type: "expense", category: "Groceries", date: today() },
      { id: "3", title: "Coffee with friends", cents: 1850, type: "expense", category: "Food", date: today() },
      { id: "4", title: "Apartment rent", cents: 85000, type: "expense", category: "Rent", date: today() },
      { id: "5", title: "Metro pass", cents: 4500, type: "expense", category: "Transport", date: today() },
    ],
    goals: [
      { id: "g1", title: "A little adventure", target: 250000, saved: 85000 },
      { id: "g2", title: "New creative setup", target: 180000, saved: 45000 },
    ],
  }
}
function validate(d: Data) {
  return (
    d &&
    typeof d.name === "string" &&
    Number.isSafeInteger(d.budget) &&
    d.budget > 0 &&
    Array.isArray(d.transactions) &&
    Array.isArray(d.goals) &&
    d.transactions.every(
      (t) =>
        typeof t.id === "string" &&
        typeof t.title === "string" &&
        Number.isSafeInteger(t.cents) &&
        t.cents > 0 &&
        ["income", "expense"].includes(t.type) &&
        categories.includes(t.category) &&
        validDate(t.date),
    ) &&
    d.goals.every(
      (g) =>
        typeof g.id === "string" &&
        typeof g.title === "string" &&
        Number.isSafeInteger(g.target) &&
        g.target > 0 &&
        Number.isSafeInteger(g.saved) &&
        g.saved >= 0 &&
        g.saved <= g.target,
    )
  )
}

function Btn({ label, onPress, secondary = false }: { label: string; onPress: () => void; secondary?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.btn, secondary && s.secondary, pressed && { opacity: 0.7 }]}
    >
      <Text style={[s.btnText, secondary && { color: "#293056" }]}>{label}</Text>
    </Pressable>
  )
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  number = false,
}: {
  label: string
  value: string
  onChange: (s: string) => void
  placeholder?: string
  number?: boolean
}) {
  return (
    <View style={{ gap: 8, marginBottom: 20 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#7d89b0"
        keyboardType={number ? "decimal-pad" : "default"}
        maxLength={number ? 16 : 100}
        style={s.input}
      />
    </View>
  )
}
function Progress({ value, color = "#5266c9" }: { value: number; color?: string }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={s.track}
    >
      <View
        style={{
          height: 8,
          width: `${Math.min(100, Math.max(0, value * 100))}%`,
          backgroundColor: color,
          borderRadius: 8,
        }}
      />
    </View>
  )
}
function Heading({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={s.headingRow}>
      <Text style={s.h2}>{title}</Text>
      {action && (
        <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8}>
          <Text style={s.link}>{action}</Text>
        </Pressable>
      )}
    </View>
  )
}

export default function Pocket() {
  const [data, setData] = useState<Data>(sample),
    [ready, setReady] = useState(false),
    [storageOk, setStorageOk] = useState(true)
  const [page, setPage] = useState<Page>("home"),
    [message, setMessage] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("All")
  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: today(),
    category: "Groceries",
    type: "expense" as "income" | "expense",
  })
  const [goalName, setGoalName] = useState(""),
    [goalAmount, setGoalAmount] = useState(""),
    [selected, setSelected] = useState("g1"),
    [contribution, setContribution] = useState("")
  const [profileName, setProfileName] = useState(""),
    [budget, setBudget] = useState(""),
    [period, setPeriod] = useState<"month" | "all">("month")
  const scroller = useRef<ScrollView>(null)
  useEffect(() => {
    scroller.current?.scrollTo({ y: 0, animated: false })
  }, [page])
  const { width } = useWindowDimensions()
  const wide = width > 900
  useEffect(() => {
    try {
      if (Platform.OS === "web") {
        const raw = window.localStorage.getItem(KEY)
        if (raw) {
          const d = JSON.parse(raw)
          if (!validate(d)) throw Error()
          setData(d)
        }
      } else {
        setMessage("Native preview: session-only storage. Use the browser app for persistent records.")
        setStorageOk(false)
      }
    } catch {
      setStorageOk(false)
      setMessage("Saved data could not be read. Demo mode is open; existing storage will not be overwritten.")
    }
    setReady(true)
  }, [])
  useEffect(() => {
    if (!ready || !storageOk || Platform.OS !== "web") return
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      setStorageOk(false)
      setMessage("Storage is unavailable. Changes are kept only for this session.")
    }
  }, [data, ready, storageOk])
  const allIncome = data.transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.cents, 0),
    allExpense = data.transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.cents, 0)
  const current = data.transactions.filter((t) => t.date.slice(0, 7) === today().slice(0, 7)),
    spent = current.filter((t) => t.type === "expense").reduce((s, t) => s + t.cents, 0)
  const report = period === "all" ? data.transactions : current
  const income = report.filter((t) => t.type === "income").reduce((s, t) => s + t.cents, 0),
    expense = report.filter((t) => t.type === "expense").reduce((s, t) => s + t.cents, 0)
  const breakdown = categories
    .map((c, i) => ({
      name: c,
      color: colors[i],
      amount: report.filter((t) => t.type === "expense" && t.category === c).reduce((s, t) => s + t.cents, 0),
    }))
    .filter((c) => c.amount)
  const history = useMemo(
    () =>
      data.transactions
        .filter(
          (t) =>
            (filter === "All" || t.type === (filter === "Income" ? "income" : "expense")) &&
            `${t.title} ${t.category}`.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [data.transactions, filter, query],
  )
  const goal = data.goals.find((g) => g.id === selected)
  function go(p: Page) {
    setMessage("")
    setPage(p)
    if (p === "profile") {
      setProfileName(data.name)
      setBudget((data.budget / 100).toFixed(2))
    }
  }
  function add() {
    setForm({ title: "", amount: "", date: today(), category: "Groceries", type: "expense" })
    go("add")
  }
  function saveTransaction() {
    const amount = cents(form.amount)
    if (!amount || !form.title.trim() || !validDate(form.date)) {
      setMessage("Enter a description, a positive amount (up to 2 decimals), and a valid YYYY-MM-DD date.")
      return
    }
    setData((d) => ({
      ...d,
      transactions: [{ ...form, title: form.title.trim(), cents: amount, id: id() }, ...d.transactions],
    }))
    setPage("history")
    setMessage("Transaction saved to your records.")
  }
  function saveGoal() {
    const amount = cents(goalAmount)
    if (!amount || !goalName.trim()) {
      setMessage("Enter a goal name and a positive target amount.")
      return
    }
    setData((d) => ({ ...d, goals: [...d.goals, { id: id(), title: goalName.trim(), target: amount, saved: 0 }] }))
    setPage("goals")
    setMessage("Your new goal is ready.")
  }
  function contribute() {
    const amount = cents(contribution)
    if (!goal || !amount || amount > goal.target - goal.saved) {
      setMessage("Enter a positive contribution no larger than the amount remaining.")
      return
    }
    setData((d) => ({ ...d, goals: d.goals.map((g) => (g.id === goal.id ? { ...g, saved: g.saved + amount } : g)) }))
    setContribution("")
    setMessage("Goal progress updated. This records savings only; no money was moved.")
  }
  function Row({ t }: { t: Transaction }) {
    const Icon = icons[Math.max(0, categories.indexOf(t.category))]
    return (
      <View style={s.transaction}>
        <View style={s.icon}>
          <Icon size={38} />
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={s.rowTitle}>{t.title}</Text>
          <Text style={s.muted}>
            {t.category} · {t.date}
          </Text>
        </View>
        <Text style={[s.rowTitle, { color: t.type === "income" ? "#07815a" : "#293056" }]}>
          {t.type === "income" ? "+" : "−"}
          {money(t.cents)}
        </Text>
      </View>
    )
  }
  function GoalCard({ g }: { g: Goal }) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open goal ${g.title}`}
        onPress={() => {
          setSelected(g.id)
          setContribution("")
          go("goal-detail")
        }}
        style={s.card}
      >
        <View style={s.headingRow}>
          <Text style={{ fontSize: 28 }}>✧</Text>
          <Text style={s.pill}>{Math.round((g.saved / g.target) * 100)}%</Text>
        </View>
        <Text style={s.h2}>{g.title}</Text>
        <Text style={s.muted}>
          {money(g.saved)} of {money(g.target)}
        </Text>
        <Progress value={g.saved / g.target} />
        <Text style={s.link}>View goal →</Text>
      </Pressable>
    )
  }
  if (!ready)
    return (
      <View style={s.loading}>
        <Text>Opening your pocket…</Text>
      </View>
    )
  const title: Record<Page, string> = {
    home: "Your money, a little clearer.",
    history: "Every little detail.",
    analytic: "See the bigger picture.",
    goals: "Make room for your next.",
    profile: "Make it yours.",
    add: "New transaction",
    "goal-detail": goal?.title || "Your goal",
    "new-goal": "A new beginning.",
  }
  return (
    <View style={s.outer}>
      <View style={[s.app, wide && s.appWide]}>
        <View style={[s.topbar, wide && { paddingHorizontal: 40 }]}>
          <Text style={s.brand}>
            finmori<Text style={{ color: "#7c87be" }}> / pocket</Text>
          </Text>
          <Text style={s.demo}>PORTFOLIO DEMO · USD</Text>
        </View>
        <ScrollView
          ref={scroller}
          style={{ flex: 1 }}
          contentContainerStyle={[s.content, wide && { paddingHorizontal: 40 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.headingRow}>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={s.eyebrow}>
                {page === "home" ? `A GOOD DAY TO START, ${data.name.toUpperCase()}` : "YOUR PERSONAL MONEY WORKSPACE"}
              </Text>
              <Text style={[s.h1, !wide && { fontSize: 29 }]}>{title[page]}</Text>
            </View>
            {page !== "add" && page !== "new-goal" && (
              <Pressable onPress={add} accessibilityRole="button" accessibilityLabel="New transaction" style={s.add}>
                <Text style={{ color: "white", fontSize: 26 }}>+</Text>
              </Pressable>
            )}
          </View>
          <Text style={s.disclaimer}>Fictional starter data · Manual records · No bank connection</Text>
          {(!storageOk || message !== "") && (
            <View accessibilityRole="alert" style={s.notice}>
              <Text style={{ color: "#293056", lineHeight: 22 }}>
                {message || "Session mode: changes are not being saved permanently."}
              </Text>
            </View>
          )}
          {page === "home" && (
            <>
              <ImageBackground
                source={require("../../assets/images/home/bg_home_header-3x.png")}
                imageStyle={{ borderRadius: 24 }}
                style={[s.hero, { padding: wide ? 32 : 24 }]}
              >
                <Text style={s.muted}>YOUR EVERYDAY OVERVIEW</Text>
                <BalanceCard label="Recorded balance" amount={money(allIncome - allExpense)} />
                <View style={s.stats}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.muted}>↗ Total income</Text>
                    <Text style={s.stat}>{money(allIncome)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.muted}>↙ Total expenses</Text>
                    <Text style={s.stat}>{money(allExpense)}</Text>
                  </View>
                </View>
              </ImageBackground>
              <View style={[s.columns, wide && { flexDirection: "row" }]}>
                <View style={[s.card, { flex: 1 }]}>
                  <Heading title="This month’s budget" action="Edit" onPress={() => go("profile")} />
                  <Text style={s.big}>{money(Math.max(0, data.budget - spent))}</Text>
                  <Text style={s.muted}>
                    {spent > data.budget
                      ? `${money(spent - data.budget)} over your budget`
                      : "left to spend this month"}
                  </Text>
                  <Progress value={spent / data.budget} color={spent > data.budget ? "#d55858" : "#5266c9"} />
                  <Text style={s.muted}>
                    {money(spent)} spent of {money(data.budget)}
                  </Text>
                </View>
                <View style={[s.card, { flex: 1, backgroundColor: "#f2ece6" }]}>
                  <Text style={s.eyebrow}>SMALL STEPS, BIG POSSIBILITIES</Text>
                  <Text style={s.h2}>Your future deserves a little space.</Text>
                  <Text style={s.muted}>Keep track of the things you’re saving for, one contribution at a time.</Text>
                  <Btn label="Explore your goals →" secondary onPress={() => go("goals")} />
                </View>
              </View>
              <View style={s.card}>
                <Heading title="Recent transactions" action="See all →" onPress={() => go("history")} />
                {data.transactions.slice(0, 4).map((t) => (
                  <Row key={t.id} t={t} />
                ))}
                {!data.transactions.length && <Text style={s.muted}>Your first transaction starts the story.</Text>}
              </View>
            </>
          )}
          {page === "history" && (
            <View style={s.card}>
              <Field
                label="Search transactions"
                value={query}
                onChange={setQuery}
                placeholder="Description or category"
              />
              <View style={s.chips}>
                {["All", "Income", "Expenses"].map((f) => (
                  <Pressable
                    key={f}
                    accessibilityRole="button"
                    accessibilityState={{ selected: filter === f }}
                    onPress={() => setFilter(f)}
                    style={[s.chip, filter === f && s.chipActive]}
                  >
                    <Text style={{ color: filter === f ? "white" : "#363f72" }}>{f}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={s.muted}>{history.length} transactions</Text>
              {history.map((t) => (
                <Row key={t.id} t={t} />
              ))}
              {!history.length && (
                <Text style={s.empty}>No matching records. Try another search or add a transaction.</Text>
              )}
            </View>
          )}
          {page === "add" && (
            <View style={[s.card, s.form]}>
              <View style={s.chips}>
                {(["expense", "income"] as const).map((type) => (
                  <Pressable
                    key={type}
                    accessibilityRole="button"
                    accessibilityState={{ selected: form.type === type }}
                    onPress={() => setForm((f) => ({ ...f, type }))}
                    style={[s.chip, form.type === type && s.chipActive]}
                  >
                    <Text style={{ color: form.type === type ? "white" : "#363f72" }}>
                      {type === "expense" ? "Expense" : "Income"}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Field
                label="Amount (USD)"
                value={form.amount}
                onChange={(amount) => setForm((f) => ({ ...f, amount }))}
                placeholder="0.00"
                number
              />
              <Field
                label="Description"
                value={form.title}
                onChange={(title) => setForm((f) => ({ ...f, title }))}
                placeholder="What was it for?"
              />
              <Field
                label="Date (YYYY-MM-DD)"
                value={form.date}
                onChange={(date) => setForm((f) => ({ ...f, date }))}
              />
              <Text style={s.label}>Category</Text>
              <View style={s.categoryGrid}>
                {categories.map((c, i) => {
                  const Icon = icons[i]
                  return (
                    <Pressable
                      key={c}
                      accessibilityRole="button"
                      accessibilityLabel={`Category ${c}`}
                      accessibilityState={{ selected: form.category === c }}
                      onPress={() => setForm((f) => ({ ...f, category: c }))}
                      style={[
                        s.category,
                        form.category === c && { backgroundColor: "#edf0ff", borderColor: "#5266c9" },
                      ]}
                    >
                      <Icon size={42} />
                      <Text style={s.muted}>{c}</Text>
                    </Pressable>
                  )
                })}
              </View>
              <Btn label="Save transaction" onPress={saveTransaction} />
              <Btn label="Cancel" secondary onPress={() => go("home")} />
            </View>
          )}
          {page === "analytic" && (
            <>
              <View style={s.chips}>
                {(["month", "all"] as const).map((p) => (
                  <Pressable
                    key={p}
                    accessibilityRole="button"
                    accessibilityState={{ selected: period === p }}
                    onPress={() => setPeriod(p)}
                    style={[s.chip, period === p && s.chipActive]}
                  >
                    <Text style={{ color: period === p ? "white" : "#363f72" }}>
                      {p === "month" ? "This month" : "All time"}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={s.stats}>
                <View style={[s.card, { flex: 1 }]}>
                  <Text style={s.muted}>INCOME</Text>
                  <Text style={s.stat}>{money(income)}</Text>
                </View>
                <View style={[s.card, { flex: 1 }]}>
                  <Text style={s.muted}>EXPENSES</Text>
                  <Text style={s.stat}>{money(expense)}</Text>
                </View>
              </View>
              <View style={s.card}>
                <Heading title="Income & expenses" />
                <Text style={s.muted}>
                  Recorded totals for {period === "month" ? today().slice(0, 7) : "all dates"}
                </Text>
                {[
                  { name: "Income", amount: income, color: "#83b7ac" },
                  { name: "Expenses", amount: expense, color: "#5266c9" },
                ].map((x) => (
                  <View key={x.name} style={{ gap: 10 }}>
                    <View style={s.headingRow}>
                      <Text style={s.rowTitle}>{x.name}</Text>
                      <Text style={s.rowTitle}>{money(x.amount)}</Text>
                    </View>
                    <Progress value={x.amount / Math.max(income, expense, 1)} color={x.color} />
                  </View>
                ))}
              </View>
              <View style={s.card}>
                <Heading title="Where it went" />
                {breakdown.map((x) => (
                  <View key={x.name} style={{ gap: 12, marginBottom: 12 }}>
                    <View style={s.headingRow}>
                      <Text style={s.rowTitle}>{x.name}</Text>
                      <Text style={s.muted}>
                        {money(x.amount)} · {Math.round((x.amount / expense) * 100)}%
                      </Text>
                    </View>
                    <Progress value={x.amount / Math.max(expense, 1)} color={x.color} />
                  </View>
                ))}
                {!breakdown.length && <Text style={s.empty}>Add an expense to see your category breakdown.</Text>}
              </View>
            </>
          )}
          {page === "goals" && (
            <>
              <View style={s.card}>
                <Text style={s.eyebrow}>A LITTLE CLOSER, EVERY DAY</Text>
                <Text style={s.big}>{money(data.goals.reduce((s, g) => s + g.saved, 0))}</Text>
                <Text style={s.muted}>recorded across {data.goals.length} savings goals</Text>
                <Btn
                  label="Create a new goal"
                  onPress={() => {
                    setGoalName("")
                    setGoalAmount("")
                    go("new-goal")
                  }}
                />
              </View>
              {data.goals.map((g) => (
                <GoalCard key={g.id} g={g} />
              ))}
            </>
          )}
          {page === "new-goal" && (
            <View style={[s.card, s.form]}>
              <Field
                label="Goal name"
                value={goalName}
                onChange={setGoalName}
                placeholder="Something worth saving for"
              />
              <Field
                label="Target amount (USD)"
                value={goalAmount}
                onChange={setGoalAmount}
                number
                placeholder="2500.00"
              />
              <Btn label="Create goal" onPress={saveGoal} />
              <Btn label="Cancel" secondary onPress={() => go("goals")} />
            </View>
          )}
          {page === "goal-detail" && goal && (
            <View style={[s.card, s.form]}>
              <Text style={{ fontSize: 50 }}>✧</Text>
              <Text style={s.big}>{money(goal.saved)}</Text>
              <Text style={s.muted}>saved toward {money(goal.target)}</Text>
              <Progress value={goal.saved / goal.target} />
              <Text style={s.h2}>{money(goal.target - goal.saved)} to go</Text>
              {goal.saved < goal.target ? (
                <>
                  <Field
                    label="Contribution (USD)"
                    value={contribution}
                    onChange={setContribution}
                    number
                    placeholder="50.00"
                  />
                  <Btn label="Record contribution" onPress={contribute} />
                </>
              ) : (
                <Text style={s.link}>Goal reached. Time to celebrate!</Text>
              )}
              <Text style={s.muted}>
                Savings contributions are separate progress records. They do not change your transaction balance or move
                money.
              </Text>
              <Btn label="Back to goals" secondary onPress={() => go("goals")} />
            </View>
          )}
          {page === "profile" && (
            <View style={[s.card, s.form]}>
              <View style={s.avatar}>
                <Text style={{ fontSize: 24, color: "#fff" }}>{data.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={s.h2}>Your personal workspace</Text>
              <Field label="Display name" value={profileName} onChange={setProfileName} />
              <Field label="Monthly expense budget (USD)" value={budget} onChange={setBudget} number />
              <Btn
                label="Save preferences"
                onPress={() => {
                  const b = cents(budget)
                  if (!b || !profileName.trim()) {
                    setMessage("Enter a name and a positive monthly budget.")
                    return
                  }
                  setData((d) => ({ ...d, name: profileName.trim(), budget: b }))
                  setMessage("Preferences saved.")
                }}
              />
              <Text style={s.muted}>
                Storage: {storageOk ? "this browser only" : "this session only"}. No cloud sync. Currency: USD. All
                records can be fictional; no banking credentials are needed.
              </Text>
              <Text style={s.muted}>
                Built from Finmori’s MIT-licensed React Native UI kit. Original design: Zoey Do. Working app adaptation:
                local portfolio project.
              </Text>
            </View>
          )}
          <Text style={s.credit}>FINMORI POCKET · Design by Zoey Do / Finmori · Adapted with attribution</Text>
        </ScrollView>
        <View style={s.bottom}>
          <BottomNavBar
            activeTab={
              ["home", "history", "analytic", "goals", "profile"].includes(page) ? (page as BottomNavTab) : "home"
            }
            onTabPress={go}
            onAddPress={add}
          />
          <View style={s.historyLink}>
            <Pressable accessibilityRole="button" onPress={() => go("history")}>
              <Text style={s.muted}>View transaction history</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  outer: { flex: 1, backgroundColor: "#e9eaf1" },
  app: { flex: 1, width: "100%", maxWidth: 1180, alignSelf: "center", backgroundColor: "#f8f9fc" },
  appWide: { marginVertical: 18, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "#d5d9eb" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  topbar: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eaecf5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  brand: { fontSize: 20, fontWeight: "700", color: "#293056" },
  demo: { fontSize: 8, fontWeight: "700", color: "#717bbc", letterSpacing: 1 },
  content: { padding: 22, gap: 22, paddingBottom: 35 },
  headingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 1.6, color: "#717bbc" },
  h1: { fontSize: 38, fontWeight: "500", color: "#293056", letterSpacing: -1, lineHeight: 46 },
  h2: { fontSize: 19, fontWeight: "600", color: "#293056", lineHeight: 27 },
  muted: { fontSize: 12, color: "#66709e", lineHeight: 20 },
  disclaimer: { fontSize: 11, color: "#717bbc", marginTop: -10 },
  add: {
    backgroundColor: "#293056",
    borderRadius: 18,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: { borderRadius: 24, gap: 24, overflow: "hidden", backgroundColor: "#e4e9fa" },
  stats: { flexDirection: "row", gap: 14 },
  stat: { fontSize: 22, fontWeight: "600", color: "#293056", marginTop: 6 },
  card: { padding: 24, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#eaecf5", gap: 18 },
  columns: { gap: 18 },
  big: { fontSize: 34, color: "#293056", letterSpacing: -1 },
  track: { height: 8, backgroundColor: "#eef0f8", borderRadius: 8, overflow: "hidden" },
  link: { fontSize: 12, color: "#3b52b3", fontWeight: "600" },
  transaction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f2f7",
  },
  icon: { backgroundColor: "#f5f6fb", padding: 6, borderRadius: 14 },
  rowTitle: { fontSize: 13, fontWeight: "600", color: "#293056" },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: "#293056",
    borderRadius: 14,
    alignItems: "center",
  },
  secondary: { backgroundColor: "#edf0f8" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  notice: { backgroundColor: "#eaf0fc", borderRadius: 12, padding: 15 },
  label: { fontSize: 13, fontWeight: "600", color: "#363f72" },
  input: {
    borderWidth: 1,
    borderColor: "#d5d9eb",
    padding: 15,
    borderRadius: 12,
    color: "#293056",
    fontSize: 16,
    backgroundColor: "#fff",
  },
  form: { width: "100%", maxWidth: 650, alignSelf: "center" },
  chips: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  chip: { paddingVertical: 11, paddingHorizontal: 20, backgroundColor: "#edf0f8", borderRadius: 30 },
  chipActive: { backgroundColor: "#293056" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  category: {
    width: 100,
    flexGrow: 1,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eaecf5",
    borderRadius: 14,
    alignItems: "center",
    gap: 8,
  },
  empty: { paddingVertical: 30, color: "#717bbc", lineHeight: 24, textAlign: "center" },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#eef1ff",
    borderRadius: 20,
    color: "#5266c9",
    fontSize: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7d89b0",
  },
  credit: { fontSize: 9, color: "#7d89b0", textAlign: "center", lineHeight: 18 },
  bottom: { backgroundColor: "#f8f9fc", paddingTop: 8, paddingBottom: 8, borderTopWidth: 1, borderTopColor: "#eaecf5" },
  historyLink: { alignItems: "center", paddingTop: 6 },
})

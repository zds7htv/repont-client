import React, { useState } from "react"

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<"login" | "otp">("login")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Hibás válasz a szervertől.")
      }

      if (data.user?.requires_totp) {
        setStep("otp")
      } else {
        setError("A felhasználó nem használ kétlépcsős azonosítást.")
      }
    } catch (err: any) {
      setError(err.message || "Ismeretlen hiba történt.")
    }
  }

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await fetch("/api/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, code: otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Hibás válasz a szervertől.")
      }

      sessionStorage.setItem("loggedIn", "true")
      sessionStorage.setItem("username", username)
      onLogin()
    } catch (err: any) {
      setError(err.message || "Ismeretlen hiba történt.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#d5e000] text-[#2b2b2b]">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold mb-6 text-[#2b2b2b]">Repont Login</h1>

        {step === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Felhasználónév"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b0d7]"
            />
            <input
              type="password"
              placeholder="Jelszó"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b0d7]"
            />
            <button
              type="submit"
              className="bg-[#00b0d7] hover:bg-[#0090b0] transition text-white font-semibold py-3 rounded-xl shadow"
            >
              Tovább
            </button>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtp} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Google Authenticator 6 jegyű kód"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00b0d7]"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("login")}
                className="flex-1 border border-[#00b0d7] text-[#00b0d7] font-semibold py-3 rounded-xl"
              >
                Vissza
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#00b0d7] hover:bg-[#0090b0] transition text-white font-semibold py-3 rounded-xl shadow"
              >
                Belépés
              </button>
            </div>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}

export default Login

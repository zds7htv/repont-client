import React, { useState } from "react"

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "admin" && password === "admin") {
      sessionStorage.setItem("loggedIn", "true")
      onLogin()
    } else {
      setError("Hibás felhasználónév vagy jelszó.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#d5e000] text-[#2b2b2b]">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">
        <h1 className="text-4xl font-extrabold mb-6 text-[#2b2b2b]">Repont Login</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            Belépés
          </button>
          {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </form>
      </div>
    </div>
  )
}

export default Login


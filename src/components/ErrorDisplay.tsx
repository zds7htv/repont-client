import { useEffect, useState } from "react"

export const ErrorDisplay = () => {
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setErrors((prev) => [...prev, `Hiba: ${event.message}`])
    }

    const handlePromise = (event: PromiseRejectionEvent) => {
      setErrors((prev) => [...prev, `Promise hiba: ${event.reason}`])
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handlePromise)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handlePromise)
    }
  }, [])

  if (errors.length === 0) return null

  return (
    <div className="fixed top-0 left-0 w-full bg-red-700 text-white p-2 z-50">
      {errors.map((e, i) => (
        <div key={i}>{e}</div>
      ))}
    </div>
  )
}

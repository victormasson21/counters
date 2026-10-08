import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./app"
import { requestPersistentStorage } from "./storage"
import "@fontsource/geist/latin-300.css"
import "@fontsource/geist/latin-400.css"
import "@fontsource/geist/latin-500.css"
import "@fontsource/geist/latin-600.css"
import "@fontsource/geist/latin-700.css"
import "./index.css"

const root = document.getElementById("root")
if (!root) {
  throw new Error("Missing #root element")
}

requestPersistentStorage()

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

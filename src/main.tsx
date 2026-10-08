import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./app"
import "./index.css"
import { requestPersistentStorage } from "./storage"

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

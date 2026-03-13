import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { TemplatesPage } from "@/pages/TemplatesPage"
import { SenderPage } from "@/pages/SenderPage"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/templates" replace />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="sender" element={<SenderPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

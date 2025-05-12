import ReactDom from "react-dom/client"
import {createBrowserRouter, Routes, Route, createRoutesFromElements, RouterProvider} from "react-router-dom"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './pages/App.tsx'
import Home from './pages/Home.tsx'
import Header from "./pages/Header.tsx"
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Header />}>
      <Route index element={<Home />} />

    </Route>
  )
)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

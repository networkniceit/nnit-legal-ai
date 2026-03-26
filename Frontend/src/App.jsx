import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LegalChat from "./pages/LegalChat";
import ContractAnalyzer from "./pages/ContractAnalyzer";
import DocumentGenerator from "./pages/DocumentGenerator";
import CaseBuilder from "./pages/CaseBuilder";
import Compliance from "./pages/Compliance";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<LegalChat />} />
        <Route path="/contract" element={<ContractAnalyzer />} />
        <Route path="/documents" element={<DocumentGenerator />} />
        <Route path="/case" element={<CaseBuilder />} />
        <Route path="/compliance" element={<Compliance />} />
      </Routes>
    </BrowserRouter>
  );
}

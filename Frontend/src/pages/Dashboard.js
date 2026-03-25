// frontend/src/pages/Dashboard.js
import Navbar from "../components/Navbar"
import LegalChat from "../components/LegalChat"
import DocumentGenerator from "../components/DocumentGenerator"
import CaseManager from "../components/CaseManager"
import ComplianceScanner from "../components/ComplianceScanner"
import ContractAnalyzer from "../components/ContractAnalyzer"

function Dashboard(){
return(
<div>
<Navbar/>
<h1>NNIT AI Legal Platform</h1>
<div>
<LegalChat/>
<ContractAnalyzer/>
<DocumentGenerator/>
<CaseManager/>
<ComplianceScanner/>
</div>
</div>
)
}

export default Dashboard
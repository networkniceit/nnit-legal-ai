import Navbar from "../components/Navbar"
import LegalChat from "../components/LegalChat"
import DocumentGenerator from "../components/DocumentGenerator"
import CaseManager from "../components/CaseManager"
import ComplianceScanner from "../components/ComplianceScanner"

function Dashboard(){

return(

<div>

<Navbar/>

<h1>NNIT Enterprise Legal Platform</h1>

<LegalChat/>
<DocumentGenerator/>
<CaseManager/>
<ComplianceScanner/>

</div>

)

}

export default Dashboard
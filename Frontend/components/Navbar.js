import {Link} from "react-router-dom"

function Navbar(){

return(

<nav>

<h2>NNIT Legal AI</h2>

<Link to="/">Dashboard</Link>
<Link to="/login">Login</Link>
<Link to="/register">Register</Link>

</nav>

)

}

export default Navbar
import "./Login.css";
import LoginLeft from "../LoginLeftCard/LoginLeft";
import LoginRight from "../LoginRightCard/LoginRight";
import Signup from "../SignUp/Signup";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";


function Login() {
  const navigate = useNavigate();
  return (
    <>
      <div className="main">
         <button
           onClick={() => navigate("/")}
           className="back-to-home"
         >
           <ArrowLeft size={16} />
           Back to Home
         </button>
        <div className="left">
          <LoginLeft/>
        </div>

        <div className="right">
          <Routes>
            <Route index element={<LoginRight/>}/>
            <Route path="signup" element={<Signup/>}/>
          </Routes>
        </div>
      </div>
    </>
  );
}

export default Login;
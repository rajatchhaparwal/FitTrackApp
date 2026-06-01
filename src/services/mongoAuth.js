import { useEffect } from "react";
import axios from "axios";

useEffect(() => {
    const userisLoggedIn  = async ()=>{
        try{
            const response = await axios.get("http://10.145.6.81:5000/Userdata");
            return response.data.firebaseUId === getCurrentUser().uid && response.data.onboardingCompleted;
        }
        catch(error){
            console.log("Error:", error);
            return false;
        }
    }
},[])

export default isOnboardingCompleted = () => {
    if(userisLoggedIn()){
        return true;
    }
    else{
        return false;
    }
}
import {asyncHandler} from "../utils/asynchandler.js";



const registerUser = asyncHandler(async(req,res) =>{
      res.status(200).json({
        message: "this is praveen yadav return after 30 min"
      })
})

export  {registerUser}
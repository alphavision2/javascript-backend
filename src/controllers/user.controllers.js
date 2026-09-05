import {asyncHandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../model/user.model.js"
import {uploadOnCloudnary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler(async(req,res) =>{
      //get user detail from frontend
      // validation - not empty
      //chek if user already exits:username,email
      // check for images , check for avtar
      // upload on cloudinary
      // create user object - create entry in db
      // remove passworfd and refresh token field from resonse
      // check for user cration
      //return res
      
      const {fullName,email,username,password}=req.body
      console.log("body",req.body)
      console.log("email",email);

      // To handle  api error 

      // if(fullName == ""){
      //   throw new ApiError(400, "fullname is requred")
      // } 
      //diffrent method 
      if(
        [fullName,email,username,password].some((field) => !field || field?.trim() === "")
      ) {
        throw new ApiError(400, "All fields are required")
      }
      const existedUser = await User.findOne({
        $or: [{username},{email}]
      })
      if(existedUser) {
        throw new ApiError(409, "username or email is already exist")
      }

      const avtarLocalPath = req.files?.avtar?.[0]?.path;
      const coverImageLocalPath=req.files?.coverImage?.[0]?.path;

      if(!avtarLocalPath){
        throw new ApiError(400, "Avatar file is required")
      }

      //Method to upload on the cloudnary

     const avtar =   await uploadOnCloudnary(avtarLocalPath)
     const coverImage = await uploadOnCloudnary(coverImageLocalPath)

     if(!avtar) {
      throw new ApiError(400, "Avtar file is required")
     }

     //entry on database
     const user = await User.create({
      fullName,
      avtar:avtar.url,
      coverImage: coverImage?.url || " ",
      email,
      password,
      username: username.toLowerCase()
     })

    const createdUser =  await User.findById(user._id).select(
      "-password -refreshToken"
    )

    if(!createdUser) {
      throw new ApiError(500, "Something went wrong while registreing the user")
    }

    return res.status(201).json(
      new ApiResponse(200, createdUser, "user registered successfully")
    )
})

export  {registerUser}
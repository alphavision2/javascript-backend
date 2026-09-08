import {asyncHandler} from "../utils/asynchandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../model/user.model.js"
import {uploadOnCloudnary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"



// method of access and refresh token
const generateAccessAndRefreshToken = async(userId) =>{
  try{
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken,refreshToken}

  } catch(error){
    throw new ApiError(500,"something went wrong while generating the token")
  }
}


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

    const loginUser = asyncHandler(async (req,res) => {
      // req body -> data
      //username or name
      //find the user
      //password check
      //access and refresh token
      // send cookie

      // take data from req.body
      const {email,username,password} = req.body

      if(!(username || email)){
        throw new ApiError(400,"username or email is required")
      }

      const user = await User.findOne({
        $or: [{username},{email}]
      })

        if(!user) {
          throw new ApiError(404, "User does not exist")
        }

        const isPasswordValid = await user.isPasswordCorrect(password)

        if(!isPasswordValid){
          throw new ApiError(401,"Invalid user credential")
        }

       const {accessToken,refreshToken} =  await generateAccessAndRefreshToken(user._id)

       const loggedInUser = User.findById(user._id).select("-password -refreshToken")

       // send cookkie
       const options = {
        httpOnly: true,
        secure: true
       }

       return res
       .status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",refreshToken,options)
       .json(
        new ApiResponse(
          200,
          {
            user:loggedInUser, accessToken, refreshToken
          },
          "user logIn successfully"
        )
       )

    })

     // to logout the user
    const logoutUser = asyncHandler(async(req,res) => {
     await User.findByIdAndUpdate(
        req.user._id,
        {
          $set: {
            refreshToken: undefined
          }
        },
        {
          new:true
        }
      )
      const options = {
        httpOnly: true,
        secure: true
       }

       return res
       .status(200)
       .clearCookie("accessToken", options)
       .clearCookie("refreshToken", options)
       .json(new ApiResponse(200,{},"user log out"))
    })

    const refreshAccessToken = asyncHandler(async(req,res) => {
      const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

      if(! incomingRefreshToken){
        throw new ApiError(401, "unuthorised requiest")
      }

try {
        const decodedToken = jwt.verify(
          incomingRefreshToken,  //token
          process.env.REFRESH_TOKEN_SECRET //secret token
        )
  
        const user = await User.findById(decodedToken?._id)
  
        if(!user){
          throw new ApiError(401, "Invelid refresh token")
        }
  
  
        if(incomingRefreshToken !== user?.refreshToken){
          throw new ApiError(401, "Refresh token are expired")
  
        }
  
        const options = {
          httpOnly:true,
          secure: true
        }
  
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
  
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
          new ApiResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
              "Access token refresh"
          )
        )
} catch (error) {
      throw new ApiError(401, "Invalid refresh token")
   }

    })


export  {
       registerUser,
        loginUser,
        logoutUser,
        refreshAccessToken

  }
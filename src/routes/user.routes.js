import { Router } from "express";
import { loginUser, registerUser,logoutUser,refreshAccessToken, getCurrentUser, updateAccountDetail, updateUserAvatar, updateUserCoverImage, getUserChaannelProfile, getWatchHistory } from "../controllers/user.controllers.js";
import{upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { get } from "mongoose";
const router = Router()

router.route("/register").post(
  upload.fields([
    {
      name:"avtar",
      maxCount:1
    },
    {
      name:"coverImage",
      maxCount:1
    }
  ]),
  registerUser);

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-Token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, chnageCurrentPassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("/update-account").patch(verifyJWT,updateAccountDetail)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT,upload.single("/coverImage"),updateUserCoverImage)
 router.route("/c/:username").get(verifyJWT,getUserChaannelProfile)
 router.route("/history").get(verifyJWT,get)
export default router;
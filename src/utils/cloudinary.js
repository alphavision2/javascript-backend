import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});


const uploadFilePath = async (localFilePath) => {
  try{
    if(!localFilePath) return null

    //upload file on the cloudnary
    
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type:"auto"
    })
    // file has been uploaded successfully
    console.log("file has been uploaded on the cloudinary", response.url);
    return response;
  }catch(error) {
      fs.unlinkSync(localFilePath) // remove the localy saved temporary  file oprationaly get failed
      return null;
  }
}


// cloudinary.v2.uploader>upload("https://res.cloudinary.com/vision4/image/upload/v1788274496/us-standard-apparel-t-shirts-the-classic-t-shirt-42078779932913.png",{public_id: "t_shirt"},function(error,result){console.log(result);}
// )


export {uploadOnCloudnary}
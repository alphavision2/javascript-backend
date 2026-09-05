function asyncHandler(requestHandler) {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
  }
}



export {asyncHandler}




// const asynchandler = (fn) => async () => {
//   try {
//     await fn(req, res, next)
//   } catch (error) {
//        resizeBy.status(error.code || 500).json({
//         success: false,
//         message: err.message
//        })
//   }
// }
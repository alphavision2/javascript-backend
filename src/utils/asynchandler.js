const asynchandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler()).catch((err) => next(err))
  }
}



export {asynchandler}




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
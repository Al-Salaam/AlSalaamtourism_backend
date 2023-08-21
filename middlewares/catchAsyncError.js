exports.catchAsyncError = (passedFunction) => (req, res, next) => {
    Promise.resolve(passedFunction(res, res, next)).catch(next);
}
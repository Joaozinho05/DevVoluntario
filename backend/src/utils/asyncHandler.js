// Encaminha erros de funções async para o errorHandler (Express 4 não faz isso sozinho).
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

module.exports = (req, _, next) => {
  if (req.method === 'POST') {
    req.body.dataCriacao = new Date();
    req.body.status = 'pendente';
    next();
  } else if (req.method === 'PUT') {
    req.body.dataModificacao = new Date();
    next();
  } else if (req.method === 'PATCH') {
    req.body.dataModificacao = new Date();
    next();
  } else {
    next();
  }
}

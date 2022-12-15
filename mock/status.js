const jsonServer = require('json-server');
const router = jsonServer.router('./mock/api.json');

module.exports = (req, res, next) => {
  if (req.method === 'PATCH') {
    const tarefas = router.db.getState().tarefas;
    const paths = req.path.split('/');
    const id = Number(paths[2]);
    const index = tarefas.findIndex(obj => obj.id === id);
    tarefas[index].status = req.query.status;
    router.db.setState({ tarefas });
    router.db.write();
    res.status(200).send();
  } else {
    next();
  }
}

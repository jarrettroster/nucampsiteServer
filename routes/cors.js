const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corseOptionsDelegate = (req, callback) => {
    let corseOptions;
    console.log(req.header('Origin'));
    if (whitelist.indexOf(req.header('Origin')) != -1) {
        corseOptions = { origin: true }
    } else {
        corseOptions = { origin: false};
    }
    callback(null, corseOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corseOptionsDelegate);
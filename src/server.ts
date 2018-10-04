import express from 'express';
import process from 'process';
import request from 'request';
import q from 'q';
import cors from 'cors';
import Auth  from './auth/auth';

//Routers
import docsRouter from './routes/documents';
import engagementsRouter from './routes/engagements';

var app = express();

var apiKey = process.env.API_KEY;
var apiHost = process.env.API_SERVICE_HOST;
var appId = process.env.SERVER_APP_ID;
var port = process.env.PORT || '3001';

let corsConfig = {
    origin:'*',
    preflight: '*'
}

app.use(cors(corsConfig));

app.use('/api/docs', docsRouter);
app.use('/api/engagements', engagementsRouter);

app.get('/api', (req, res) => {
    res.status(404);
    res.json({error:"Invalid request path"});
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});


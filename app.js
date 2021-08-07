import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.static('public'));

app.use('/', (req, res, next) => {
    res.sendFile("index.html", {root: __dirname});
})

app.use((req, res, next) => {
    res.sendFile("404.html", {root: __dirname});
})


app.listen(PORT, () => {
    // console.log(`Listening on port ${PORT}`);
})
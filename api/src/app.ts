import express from 'express';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import cookieParser from 'cookie-parser'
dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(cookieParser())
app.use(express.json())
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log('Server is up and running');
});
